import {drawCard} from './cardRenderer';
export async function exportVideo(settings,photo,onProgress,signal){
 const type=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
 if(!type)throw Error('Video export is unavailable in this browser. Use GIF instead.');
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');drawCard(ctx,settings,0,photo);
 const stream=canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:8000000}),chunks=[];let frame;
 return new Promise((resolve,reject)=>{const cleanup=()=>{cancelAnimationFrame(frame);stream.getTracks().forEach(t=>t.stop());signal?.removeEventListener('abort',abort);};const abort=()=>{if(recorder.state!=='inactive')recorder.stop();cleanup();reject(new DOMException('Cancelled','AbortError'));};signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=()=>{cleanup();reject(Error('Video export failed. Try GIF.'));};recorder.onstop=()=>{cleanup();resolve(new Blob(chunks,{type:type.split(';')[0]}));};recorder.start();const start=performance.now();const tick=now=>{const elapsed=now-start;if(elapsed>=4000){recorder.stop();return;}drawCard(ctx,settings,elapsed/4000,photo);onProgress(Math.round(elapsed/40));frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);});
}
