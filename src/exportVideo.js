import {drawCard} from './cardRenderer';
import {Output,BufferTarget,CanvasSource,Mp4OutputFormat,Quality} from 'mediabunny';
export async function exportVideo(settings,photo,onProgress,signal){
 if(!globalThis.VideoEncoder)throw Error('MP4 export is unavailable in this browser. Download the animated GIF instead.');
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d'),target=new BufferTarget(),output=new Output({format:new Mp4OutputFormat(),target});
 const source=new CanvasSource(canvas,{codec:'avc',quality:new Quality('high')});output.addVideoTrack(source);
 try{await output.start();for(let frame=0;frame<120;frame++){if(signal?.aborted)throw new DOMException('Cancelled','AbortError');drawCard(ctx,settings,frame/120,photo);await source.add(frame/30,1/30);onProgress(Math.round((frame+1)/1.2));if(frame%10===0)await new Promise(r=>setTimeout(r,0));}await output.finalize();return new Blob([target.buffer],{type:'video/mp4'});}catch(e){await output.cancel().catch(()=>{});if(e.name==='AbortError')throw e;throw Error('This browser could not encode MP4. Use the animated GIF download.');}
}
