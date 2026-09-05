import {useCallback,useEffect,useRef,useState} from 'react';
export default function useFeed(url,normalize,interval=300000){
 const [state,set]=useState({rows:[],loading:true,error:'',retrieved:null});
 const busy=useRef(false),controller=useRef(null);
 const refresh=useCallback(async()=>{
  if(busy.current)return;busy.current=true;controller.current=new AbortController();set(s=>({...s,loading:true,error:''}));
  const timer=setTimeout(()=>controller.current?.abort(),20000);
  try{const r=await fetch(url,{signal:controller.current.signal,headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`Source returned HTTP ${r.status}.`);const rows=normalize(await r.json());set({rows,loading:false,error:'',retrieved:new Date().toISOString()});}
  catch(e){set(s=>({...s,loading:false,error:e.name==='AbortError'?'Source timed out. Please retry.':e.message}));}
  finally{clearTimeout(timer);busy.current=false;}
 },[url,normalize]);
 useEffect(()=>{refresh();const t=setInterval(()=>{if(!document.hidden)refresh();},interval);const visible=()=>{if(!document.hidden)refresh();};document.addEventListener('visibilitychange',visible);return()=>{clearInterval(t);document.removeEventListener('visibilitychange',visible);controller.current?.abort();};},[refresh,interval]);
 return {...state,refresh};
}
