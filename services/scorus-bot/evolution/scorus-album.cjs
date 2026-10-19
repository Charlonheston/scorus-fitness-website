/* Scorus-only native albums. Reuses the authenticated Evolution socket and media pipeline. */
const fs=require('node:fs/promises');
const path=require('node:path');
const {createHash}=require('node:crypto');
const inFlight=new Map();

function makeAlbumSender({catalogPath='/evolution/scorus-catalog.json',journalDir='/evolution/instances/.scorus-albums',instance=process.env.SCORUS_ALBUM_INSTANCE}={}) {
  async function store(file,state) {
    const temp=file+'.tmp';
    await fs.writeFile(temp,JSON.stringify(state),{mode:0o600});
    await fs.rename(temp,file);
  }
  async function run(service,data) {
    if(!instance||service.instance.name!==instance)throw Error('Scorus album instance mismatch');
    const request=data.scorusAlbum;
    if(!request||!/^[-a-zA-Z0-9:]{1,120}$/.test(request.requestId||'')||!Array.isArray(request.mediaIds))throw Error('Invalid Scorus album');
    const catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));
    const photos=catalog.other_services.in_person.gallery.photos;
    const wanted=new Set(request.mediaIds);
    const selected=photos.filter(p=>wanted.has(p.id));
    if(wanted.size!==request.mediaIds.length||selected.length!==wanted.size||selected.length<2||selected.length>9)throw Error('Invalid album photos');
    if(!selected.every(p=>/^https:\/\/scorusfitness\.com\/images\/gym\/gym-\d{2}\.jpg$/.test(p.url)))throw Error('Invalid album source');
    if(!/^[1-9]\d{7,14}$/.test(data.number)||typeof data.caption!=='string'||data.caption.length>1024)throw Error('Invalid album destination or caption');
    const fingerprint=createHash('sha256').update(JSON.stringify([data.number,selected.map(p=>p.id),data.caption])).digest('hex');
    const identifier=createHash('sha256').update(instance+':'+request.requestId).digest('hex');
    await fs.mkdir(journalDir,{recursive:true,mode:0o700});
    const file=path.join(journalDir,identifier+'.json');
    let state;
    try {
      state=JSON.parse(await fs.readFile(file,'utf8'));
      if(state.fingerprint!==fingerprint)throw Error('Album idempotency conflict');
      // A crash or uncertain result must never replay an accepted parent or child.
      return state.result||{key:state.parent||null,scorus_album:{status:'review',items:state.items||[],total:selected.length,error:'interrupted_album'}};
    } catch(error) { if(error.code!=='ENOENT')throw error; }
    state={fingerprint,status:'preparing',items:[],total:selected.length};
    await fs.writeFile(file,JSON.stringify(state),{flag:'wx',mode:0o600});
    try {
      // Upload every asset before announcing the album, then relay its children together.
      const prepared=[];
      for(const photo of selected)prepared.push(await service.prepareMediaMessage({mediatype:'image',media:photo.url,fileName:photo.id+'.jpg',caption:''}));
      state.status='dispatching_parent';await store(file,state);
      const parent=await service.sendMessageWithTyping(data.number,{albumMessage:{expectedImageCount:selected.length,expectedVideoCount:0}},{delay:0});
      if(!parent?.key?.id)throw Error('Missing album parent id');
      state.parent=parent.key;state.status='dispatching_children';await store(file,state);
      for(let i=0;i<prepared.length;i++) {
        const content=prepared[i].message;
        content.messageContextInfo={...content.messageContextInfo,messageAssociation:{associationType:1,parentMessageKey:parent.key}};
        if(i===0)content.imageMessage.caption=data.caption;
        const sent=await service.sendMessageWithTyping(data.number,content,{delay:0});
        if(!sent?.key?.id)throw Error('Missing album child id');
        state.items.push({media_id:selected[i].id,key:sent.key});await store(file,state);
      }
      state.status='accepted';state.result={key:state.parent,scorus_album:{status:'accepted',items:state.items,total:selected.length}};
      await store(file,state);return state.result;
    } catch(error) {
      state.status='review';state.result={key:state.parent||null,scorus_album:{status:'review',items:state.items,total:selected.length,error:'album_unconfirmed'}};
      await store(file,state);return state.result;
    }
  }
  return async function send(service,data) {
    const key=instance+':'+data.scorusAlbum?.requestId;
    // Serialize duplicate requests while preserving the payload conflict check in run().
    if(inFlight.has(key))await inFlight.get(key);
    const pending=run(service,data);inFlight.set(key,pending);
    try{return await pending;}finally{if(inFlight.get(key)===pending)inFlight.delete(key);}
  };
}

module.exports={makeAlbumSender,sendAlbum:makeAlbumSender()};
