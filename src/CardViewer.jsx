import React,{useEffect,useRef} from 'react';
import {drawCard} from './cardRenderer';
export default function CardViewer({settings,photo,media,onClose}){
 const dialog=useRef(),canvas=useRef();
 useEffect(()=>{dialog.current.showModal();return()=>dialog.current?.close();},[]);
 useEffect(()=>{if(media)return;let raf;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const ctx=canvas.current.getContext('2d');const draw=now=>{drawCard(ctx,settings,reduced?0:(now%4000)/4000,photo);if(!reduced)raf=requestAnimationFrame(draw);};draw(performance.now());return()=>cancelAnimationFrame(raf);},[settings,photo,media]);
 return <dialog ref={dialog} className="collectible-viewer" onCancel={onClose} aria-label="Animated collectible viewer"><button autoFocus onClick={onClose}>Close collectible ×</button>{media?.type.startsWith('video')?<video src={media.url} autoPlay loop muted playsInline controls/>:media?<img src={media.url} alt="Your complete animated collectible"/>:<canvas width="648" height="810" ref={canvas} role="img" aria-label={`${settings.name} animated collectible`}/>}<p>{media?'Your exported file, playing here.':'Animated collectible · Escape to close'}</p></dialog>;
}
