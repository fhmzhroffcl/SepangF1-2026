import {useCallback,useEffect,useRef,useState} from 'react';
export default function useFeed(url,normalize,interval=300000){
 const [state,set]=useState({rows:[],loading:true,error:'',retrieved:null});
 const busy=useRef(false),controller=useRef(null),generation=useRef(0);
 const refresh=useCallback(async()=>{
  if(busy.current)return;
  const run=generation.current,abort=new AbortController();controller.current=abort;busy.current=true;
  set(s=>({...s,loading:true,error:''}));
  const timer=setTimeout(()=>abort.abort(),30000);
  try{
   const r=await fetch(url,{signal:abort.signal,headers:{Accept:'application/json'}});
   if(!r.ok)throw new Error(r.status===429?'Source is busy. Try again shortly.':`Source unavailable (HTTP ${r.status}).`);
   const raw=await r.json(),rows=normalize(raw),retrieved=new Date().toISOString();
   if(run!==generation.current)return;
   set({rows,loading:false,error:'',retrieved});
   try{localStorage.setItem('sepang26:feed:'+url,JSON.stringify({raw,retrieved}));}catch{/* Caching is optional. */}
  }catch(e){if(run===generation.current)set(s=>({...s,loading:false,error:e.name==='AbortError'?'Update timed out. Try refreshing.':e.message}));}
  finally{clearTimeout(timer);if(run===generation.current)busy.current=false;}
 },[url,normalize]);
 useEffect(()=>{
  generation.current++;busy.current=false;
  let cached;
  try{const c=JSON.parse(localStorage.getItem('sepang26:feed:'+url));if(c?.retrieved)cached={rows:normalize(c.raw),retrieved:c.retrieved};}catch{/* Ignore incompatible or expired source data. */}
  set({rows:[],retrieved:null,...cached,loading:true,error:''});
  refresh();
  const t=setInterval(()=>{if(!document.hidden)refresh();},interval);
  const visible=()=>{if(!document.hidden)refresh();};
  document.addEventListener('visibilitychange',visible);
  return()=>{generation.current++;controller.current?.abort();busy.current=false;clearInterval(t);document.removeEventListener('visibilitychange',visible);};
 },[refresh,interval,url,normalize]);
 return {...state,refresh};
}
