import {GIFEncoder,quantize,applyPalette} from 'gifenc';
let gif,palette,width,height;
self.onmessage=({data})=>{
 try{
  if(data.type==='start'){
   width=data.width;height=data.height;
   palette=quantize(new Uint8Array(data.sample),256,{format:'rgb565'});
   gif=GIFEncoder();self.postMessage({type:'ready'});
  }else if(data.type==='frame'){
   const index=applyPalette(new Uint8Array(data.rgba),palette,'rgb565');
   gif.writeFrame(index,width,height,{palette:data.index===0?palette:undefined,delay:80,repeat:0,dispose:1});
   self.postMessage({type:'frame',index:data.index});
  }else if(data.type==='finish'){
   gif.finish();const bytes=gif.bytes();self.postMessage({type:'done',buffer:bytes.buffer},[bytes.buffer]);
  }
 }catch(e){self.postMessage({type:'error',message:e.message||'GIF encoding failed.'});}
};
