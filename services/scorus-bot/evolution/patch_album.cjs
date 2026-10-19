/* Fail closed if the pinned Evolution runtime no longer has the expected extension point. */
const fs=require('node:fs');
const file=process.argv[2]||'/evolution/dist/main.js';
let source=fs.readFileSync(file,'utf8');
const marker='SCORUS_NATIVE_ALBUM_V1';
if(source.includes(marker))throw Error('Album patch already applied');
const matches=[...source.matchAll(/async mediaMessage\(([^)]*)\)\{/g)].filter(match=>{
  const body=source.slice(match.index,source.indexOf('}async ',match.index));
  return body.includes('this.prepareMediaMessage(')&&/\.message\}/.test(body);
});
if(matches.length!==1)throw Error('Unexpected Evolution media entry point');
const match=matches[0];const argument=match[1].split(',')[0];
if(!/^[a-zA-Z_$][\w$]*$/.test(argument))throw Error('Unexpected media argument');
const insertion=match.index+match[0].length;
source=source.slice(0,insertion)+`/* ${marker} */if(${argument}?.scorusAlbum)return await require('/evolution/scorus-album.cjs').sendAlbum(this,${argument});`+source.slice(insertion);
fs.writeFileSync(file,source);
console.log('Scorus native album adapter installed');
