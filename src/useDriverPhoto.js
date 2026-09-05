import {useEffect,useState} from 'react';
import photos from './driverPhotos.json';
const cache=new Map();
export default function useDriverPhoto(code,enabled,retry){
 const [state,setState]=useState({image:null,loading:enabled,error:''});
 useEffect(()=>{
  let active=true;
  if(!enabled){setState({image:null,loading:false,error:''});return;}
  if(cache.has(code)){setState({image:cache.get(code),loading:false,error:''});return;}
  setState({image:null,loading:true,error:''});
  const img=new Image();img.crossOrigin='anonymous';
  const timer=setTimeout(()=>{if(active)setState({image:null,loading:false,error:'Portrait could not load. Retry or turn off the photo to export.'});},20000);
  img.onload=()=>{clearTimeout(timer);cache.set(code,img);if(active)setState({image:img,loading:false,error:''});
   if(!img.src.startsWith('data:'))try{const c=document.createElement('canvas');c.width=Math.min(480,img.naturalWidth);c.height=Math.round(img.naturalHeight*c.width/img.naturalWidth);c.getContext('2d').drawImage(img,0,0,c.width,c.height);localStorage.setItem('sepang26:portrait:'+code,JSON.stringify({url:photos[code]?.url,data:c.toDataURL('image/webp',.85)}));}catch{/* Export remains available when browser storage is full. */}
  };
  img.onerror=()=>{clearTimeout(timer);if(active)setState({image:null,loading:false,error:'Portrait could not load. Retry or turn off the photo to export.'});};
  let stored;try{stored=JSON.parse(localStorage.getItem('sepang26:portrait:'+code));}catch{}
  img.src=stored?.url===photos[code]?.url&&stored?.data?.startsWith('data:image/')?stored.data:photos[code]?.url||'';
  return()=>{active=false;clearTimeout(timer);};
 },[code,enabled,retry]);
 return state;
}
