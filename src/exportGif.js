import {drawCard} from './cardRenderer';
export const GIF_INFO={width:600,height:750,frames:50,duration:4};
export async function exportGif(settings,photo,onProgress,signal){
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 const worker=new Worker(new URL('./gif.worker.js',import.meta.url),{type:'module'});
 const canvas=document.createElement('canvas');canvas.width=GIF_INFO.width;canvas.height=GIF_INFO.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const sampleCanvas=document.createElement('canvas');sampleCanvas.width=160;sampleCanvas.height=200;
 const sampleCtx=sampleCanvas.getContext('2d',{willReadFrequently:true});
 const sample=new Uint8Array(160*200*4*4);
 let rejectPending,timeout;
 const abort=()=>{worker.terminate();rejectPending?.(new DOMException('Cancelled','AbortError'));};
 signal?.addEventListener('abort',abort,{once:true});
 const exchange=(message,transfer=[])=>new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(new DOMException('Cancelled','AbortError'));return;}
  rejectPending=reject;
  timeout=setTimeout(()=>reject(new Error('Export took too long. Please retry.')),45000);
  worker.onmessage=({data})=>{clearTimeout(timeout);rejectPending=null;data.type==='error'?reject(new Error(data.message)):resolve(data);};
  worker.onerror=()=>{clearTimeout(timeout);reject(new Error('GIF export could not start. Please retry or download PNG.'));};
  worker.postMessage(message,transfer);
 });
 try{
  for(let i=0;i<4;i++){drawCard(sampleCtx,settings,i/4,photo);sample.set(sampleCtx.getImageData(0,0,160,200).data,i*160*200*4);}
  await exchange({type:'start',width:canvas.width,height:canvas.height,sample:sample.buffer},[sample.buffer]);
  for(let i=0;i<GIF_INFO.frames;i++){
   drawCard(ctx,settings,i/GIF_INFO.frames,photo);
   const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   await exchange({type:'frame',rgba:rgba.buffer,index:i},[rgba.buffer]);onProgress?.(Math.round((i+1)/GIF_INFO.frames*100));
  }
  const result=await exchange({type:'finish'});
  return new Blob([result.buffer],{type:'image/gif'});
 }finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);worker.terminate();canvas.width=0;sampleCanvas.width=0;}
}
