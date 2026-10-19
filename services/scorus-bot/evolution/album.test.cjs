const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {createRequire}=require('node:module');
const {makeAlbumSender}=require('./scorus-album.cjs');

async function fixture(t) {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'scorus-album-test-'));
  t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const catalogPath=path.join(dir,'catalog.json');
  await fs.writeFile(catalogPath,JSON.stringify({other_services:{in_person:{gallery:{photos:[1,2,3].map(i=>({id:'gym-0'+i,url:'https://scorusfitness.com/images/gym/gym-0'+i+'.jpg'}))}}}}));
  const config={catalogPath,journalDir:path.join(dir,'journal'),instance:'scorus-test'};
  const events=[];
  const service={instance:{name:'scorus-test'},
    prepareMediaMessage:async data=>{events.push({prepare:data});return {message:{imageMessage:{url:data.media,caption:data.caption}}};},
    sendMessageWithTyping:async (number,content)=>{events.push({send:content});return {key:{id:'id-'+events.filter(e=>e.send).length,remoteJid:number+'@s.whatsapp.net',fromMe:true}};}};
  const data={number:'34600000000',caption:'Scorus Fitness · Alicante',scorusAlbum:{requestId:'test-album',mediaIds:['gym-03','gym-01','gym-02']}};
  return {config,events,service,data,send:makeAlbumSender(config)};
}

test('prepares first and relays a native parent and ordered children without text interleaving',async t=>{
  const f=await fixture(t);const result=await f.send(f.service,f.data);
  assert.equal(result.scorus_album.status,'accepted');
  assert.deepEqual(f.events.slice(0,3).map(e=>e.prepare.fileName),['gym-01.jpg','gym-02.jpg','gym-03.jpg']);
  const sends=f.events.filter(e=>e.send).map(e=>e.send);
  assert.deepEqual(sends[0].albumMessage,{expectedImageCount:3,expectedVideoCount:0});
  for(const content of sends.slice(1)) {
    assert.equal(content.messageContextInfo.messageAssociation.associationType,1);
    assert.equal(content.messageContextInfo.messageAssociation.parentMessageKey.id,result.key.id);
  }
  assert.equal(sends[1].imageMessage.caption,f.data.caption);
  assert.equal(sends[2].imageMessage.caption,'');
  assert.deepEqual(result.scorus_album.items.map(i=>i.media_id),['gym-01','gym-02','gym-03']);
});

test('duplicate concurrent requests and restarts never resend an accepted album',async t=>{
  const f=await fixture(t);const [a,b]=await Promise.all([f.send(f.service,f.data),f.send(f.service,f.data)]);
  assert.deepEqual(a,b);assert.equal(f.events.filter(e=>e.send).length,4);
  const restart=makeAlbumSender(f.config);assert.deepEqual(await restart(f.service,f.data),a);
  assert.equal(f.events.filter(e=>e.send).length,4);
  await assert.rejects(()=>restart(f.service,{...f.data,number:'34600000001'}),/conflict/);
});

test('partial or uncertain results retain accepted IDs and do not replay any child',async t=>{
  const f=await fixture(t);const original=f.service.sendMessageWithTyping;let count=0;
  f.service.sendMessageWithTyping=async (...args)=>{if(++count===3)throw Error('simulated transport timeout');return original(...args);};
  const a=await f.send(f.service,f.data);
  assert.equal(a.scorus_album.status,'review');assert.equal(a.scorus_album.items.length,1);
  const restart=makeAlbumSender(f.config);assert.deepEqual(await restart(f.service,f.data),a);
  assert.equal(count,3);
});

test('an interrupted journal is reviewed without attempting to send',async t=>{
  const f=await fixture(t);await fs.mkdir(f.config.journalDir,{recursive:true});
  const fingerprint=createHash('sha256').update(JSON.stringify([f.data.number,['gym-01','gym-02','gym-03'],f.data.caption])).digest('hex');
  const id=createHash('sha256').update('scorus-test:test-album').digest('hex');
  await fs.writeFile(path.join(f.config.journalDir,id+'.json'),JSON.stringify({fingerprint,status:'dispatching_parent',items:[]}));
  const a=await f.send(f.service,f.data);assert.equal(a.scorus_album.status,'review');assert.equal(f.events.length,0);
});

test('only the Scorus instance and catalog assets are allowed',async t=>{
  const f=await fixture(t);
  await assert.rejects(()=>f.send({...f.service,instance:{name:'other-business'}},f.data),/instance mismatch/);
  await assert.rejects(()=>f.send(f.service,{...f.data,scorusAlbum:{requestId:'bad-id',mediaIds:['gym-01','https://other.example/image.jpg']}}),/photos/);
  assert.equal(f.events.length,0);
});

test('the installed Baileys protocol retains album grouping through Evolution forwarding', {skip:!process.env.SCORUS_NATIVE_PROTO_TEST},async t=>{
  const f=await fixture(t);const load=createRequire('/evolution/package.json');
  const {proto,generateWAMessageContent}=await import(load.resolve('baileys'));
  const encoded=[];
  f.service.sendMessageWithTyping=async(number,content)=>{
    const forwarded=await generateWAMessageContent({forward:{key:{fromMe:true,remoteJid:'bot@s.whatsapp.net'},message:content}},{});
    const decoded=proto.Message.decode(proto.Message.encode(forwarded).finish());encoded.push(decoded);
    return {key:{id:'native-'+encoded.length,fromMe:true,remoteJid:number+'@s.whatsapp.net'}};
  };
  await f.send(f.service,f.data);
  assert.equal(encoded[0].albumMessage.expectedImageCount,3);
  for(const content of encoded.slice(1)) {
    assert.equal(content.messageContextInfo.messageAssociation.associationType,proto.MessageAssociation.AssociationType.MEDIA_ALBUM);
    assert.equal(content.messageContextInfo.messageAssociation.parentMessageKey.id,'native-1');
  }
});
