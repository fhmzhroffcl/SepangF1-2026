import InfoTip from './InfoTip';
import {createCardSerial,getCardSerial} from './cardIdentity';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Download,Share2,BookmarkCheck} from 'lucide-react';
import {SNAPSHOT,TEAM_COLORS} from './standings';
import {TEAMS} from './teams';
import useSaved from './useSaved';
import useAttendance from './useAttendance';
import {drawCard,FINISHES} from './cardRenderer';
import useDriverPhoto from './useDriverPhoto';
import './fanCards.css';
import PredictionReview from './PredictionReview';
import CardViewer from './CardViewer';
import {playSound} from './SoundControl';

const modes={going:"I'm Going",online:'Watching Online',prediction:'My Prediction'};
const titles={going:"I'M GOING TO SEPANG",online:"I'M WATCHING ONLINE",prediction:'MY SEPANG PREDICTION'};
const fields=[['pole','Pole winner'],['p1','Podium P1'],['p2','Podium P2'],['p3','Podium P3'],['fastest','Fastest lap']];
const empty={pole:'',p1:'',p2:'',p3:'',fastest:'',safety:'',rain:''};
const teamList=Object.entries(TEAMS).map(([id,t])=>({id,name:t.name,color:TEAM_COLORS[id]}));
const blobOf=canvas=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not create the image. Please retry.')),'image/png'));

export default function FanStudio({drivers=SNAPSHOT.drivers}){
 const [attendance,setAttendance]=useAttendance();
 const canvas=useRef(null),abortRef=useRef(null),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0);
 const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches),[retry,setRetry]=useState(0);
 const [style,setStyle,styleSaved]=useSaved('card-style',{driverCode:'HAM',finish:'prism',photo:true},v=>v&&typeof v.driverCode==='string'&&FINISHES[v.finish]&&typeof v.photo==='boolean');
 const [collection,setCollection,collectionSaved]=useSaved('card-collection',[],v=>Array.isArray(v)&&v.length<=12&&v.every(c=>c&&typeof c.id==='string'&&c.profile&&TEAMS[c.profile.teamId]&&modes[c.profile.mode]&&typeof c.profile.name==='string'&&c.style&&FINISHES[c.style.finish]&&c.picks));
 const [viewer,setViewer]=useState(false),[media,setMedia]=useState(null);
 useEffect(()=>()=>{if(media)URL.revokeObjectURL(media.url);},[media]);
 const [identities,setIdentities]=useSaved('card-editor-identities',null,v=>v&&v.fan?.serial&&v.prediction?.serial);
 const initialIdentities=useMemo(()=>({fan:{serial:getCardSerial('FAN','draft-fan'),editingId:null},prediction:{serial:getCardSerial('PRD','draft-prediction'),editingId:null}}),[]);


 useEffect(()=>()=>abortRef.current?.abort(),[]);
 const [profile,setProfile,profileSaved]=useSaved('profile',{name:'',teamId:'ferrari',mode:'going'},v=>v&&typeof v.name==='string'&&TEAMS[v.teamId]&&modes[v.mode]);
 const [prediction,setPrediction,draftSaved]=useSaved('prediction-draft',empty,v=>v&&Object.keys(empty).every(k=>typeof v[k]==='string'));
 const [savedPick,setSavedPick,pickSaved]=useSaved('prediction',null,v=>v&&typeof v.name==='string'&&typeof v.savedAt==='string'&&v.picks);
 const {name,teamId}=profile,mode=profile.mode==='prediction'?'prediction':attendance,team=teamList.find(t=>t.id===teamId);
 const identityKind=mode==='prediction'?'prediction':'fan';
 const identity=(identities||initialIdentities)[identityKind];
 const {serial,editingId}=identity;
 const setIdentity=value=>setIdentities(current=>({...current||initialIdentities,[identityKind]:value}));
 const setEditingId=id=>setIdentity({...identity,editingId:id});
 const newCard=()=>setIdentity({serial:createCardSerial(mode==='prediction'?'PRD':'FAN'),editingId:null});
 const setMode=mode=>{if(mode!=='prediction')setAttendance(mode);setProfile(p=>({...p,mode}));setFeedback('');};
 const names=useMemo(()=>Object.fromEntries(drivers.map(d=>[d.code,d.given+' '+d.family])),[drivers]);
 const allPicked=fields.every(([k])=>names[prediction[k]])&&['yes','no'].includes(prediction.safety)&&['yes','no'].includes(prediction.rain);
 const podium=[prediction.p1,prediction.p2,prediction.p3].filter(Boolean),duplicate=new Set(podium).size!==podium.length;
 const complete=mode==='prediction'?allPicked&&!duplicate:Boolean(name.trim());
 const teamDrivers=drivers.filter(d=>d.teamId===teamId);
 const selectedDriver=drivers.find(d=>d.code===(mode==='prediction'?prediction.p1:style.driverCode))||SNAPSHOT.drivers.find(d=>d.code===style.driverCode)||drivers[0];
 const portrait=useDriverPhoto(selectedDriver.code,style.photo,retry);
 const settings=useMemo(()=>({serial,name,teamName:team.name,teamColor:team.color,mode,finish:style.finish,driver:selectedDriver,picks:prediction,names}),[serial,name,team.name,team.color,mode,style.finish,selectedDriver,prediction,names]);
 useEffect(()=>{if(mode!=='prediction'&&teamDrivers.length&&!teamDrivers.some(d=>d.code===style.driverCode))setStyle(s=>({...s,driverCode:teamDrivers[0].code}));},[teamId,drivers,style.driverCode,mode]);
 const exportReady=complete&&!busy&&(!style.photo||(!portrait.loading&&!!portrait.image));
 useEffect(()=>{
  const element=canvas.current,ctx=element?.getContext('2d');if(!ctx)return;
  let raf,visible=true,last=0;
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(element);
  drawCard(ctx,settings,0,portrait.image);
  const tick=now=>{if(visible&&!document.hidden&&now-last>40){drawCard(ctx,settings,(now%4000)/4000,portrait.image);last=now;}raf=requestAnimationFrame(tick);};
  if(!paused)raf=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(raf);observer.disconnect();};
 },[settings,portrait.image,paused]);
 const downloadFile=file=>{const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);};
 const exportCard=async kind=>{
  if(!exportReady)return;setBusy(kind);setFeedback('');setProgress(0);
  try{
   let blob;
   if(kind==='gif'||kind==='video'){
    const controller=new AbortController();abortRef.current=controller;
    const exporter=kind==='gif'?(await import('./exportGif')).exportGif:(await import('./exportVideo')).exportVideo;
    blob=await exporter(settings,portrait.image,setProgress,controller.signal);
   }else{const c=document.createElement('canvas');c.width=1080;c.height=1350;drawCard(c.getContext('2d'),settings,0,portrait.image);blob=await blobOf(c);}
   const ext=kind==='gif'?'gif':kind==='video'?(blob.type.includes('mp4')?'mp4':'webm'):'png',file=new File([blob],`sepang26-${mode}-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')||'fan'}.${ext}`,{type:blob.type});
   if(kind==='share'&&navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:'My Sepang fan collectible',files:[file]});setFeedback('Card shared.');}
   else{downloadFile(file);playSound('complete');if(kind==='gif'||kind==='video'){setMedia({url:URL.createObjectURL(blob),type:blob.type});setViewer(true);}setFeedback(`${ext.toUpperCase()} downloaded${kind==='gif'?' · 4-second looping collectible':''}.`);}
  }catch(e){setFeedback(e.name==='AbortError'?'Export cancelled. Your draft is kept.':/dynamically imported|module script|Importing a module/i.test(e.message)?'Download tools need a refresh. Use Refresh app above; your saved cards are kept.':e.message||'Export failed. Please retry.');}finally{abortRef.current=null;setBusy(false);}
 };
 const saveCard=()=>{
  if(!complete)return;
  if(!editingId&&collection.length>=12){setFeedback('Your collection has 12 cards. Open one to update it, or remove a card first.');return;}
  const card={serial,id:editingId||crypto.randomUUID(),profile:{...profile,mode},style:{...style},picks:{...prediction},savedAt:new Date().toISOString()};
  const next=editingId?collection.map(c=>c.id===editingId?card:c):[card,...collection];
  try{localStorage.setItem('sepang26:v1:card-collection',JSON.stringify(next));setCollection(next);setEditingId(card.id);playSound('success');setFeedback('Card saved to My collection on this browser.');}catch{setFeedback('Browser storage is full or unavailable. Download your card to keep it.');}
 };
 const loadCard=c=>{if(c.profile.mode!=='prediction')setAttendance(c.profile.mode);setProfile({...c.profile});setStyle({...c.style});setPrediction({...c.picks});setIdentities(current=>({...current||initialIdentities,[c.profile.mode==='prediction'?'prediction':'fan']:{serial:c.serial||getCardSerial(c.profile.mode==='prediction'?'PRD':'FAN','collection:'+c.id),editingId:c.id}}));setMedia(null);setViewer(true);setFeedback('Saved card opened. Edit it or download it again.');};
 const savePrediction=()=>{if(!complete)return;setSavedPick({serial,name:name.trim()||'Anonymous fan',teamId,picks:{...prediction},names:{...names},savedAt:new Date().toISOString()});setFeedback('Prediction saved on this browser.');};
 return <section id="fan-card" className="fan-studio"><div className="studio-copy"><h2>Your race. Your collectible.</h2><p className="card-intro">Pick your driver. Make it personal. Keep the whole card in motion.</p>
  <div className="mode-tabs"><button aria-pressed={mode!=='prediction'} onClick={()=>setMode(attendance)}>Fan collectible</button><button aria-pressed={mode==='prediction'} onClick={()=>setMode('prediction')}>Prediction ticket</button></div>
  {mode!=='prediction'&&<div className="attendance-toggle"><button aria-pressed={attendance==='going'} onClick={()=>setAttendance('going')}>I'm Going</button><button aria-pressed={attendance==='online'} onClick={()=>setAttendance('online')}>Watching Online</button></div>}
  <fieldset className="studio-form card-editor" disabled={!!busy}>{mode!=='prediction'&&<><label>Your name<input value={name} maxLength={40} placeholder="Your name" onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/><small>Your name and a unique monogram, in your team’s colours.</small></label>
   <fieldset><legend>Choose your team</legend><div className="team-picker">{teamList.map(t=><button type="button" aria-pressed={teamId===t.id} className={teamId===t.id?'active':''} key={t.id} onClick={()=>{setProfile(p=>({...p,teamId:t.id}));const d=drivers.find(d=>d.teamId===t.id);if(d)setStyle(s=>({...s,driverCode:d.code}));}} style={{'--swatch':t.color}}><span/>{t.name}</button>)}</div></fieldset>
   <div className="prediction-grid"><label>Featured driver<select value={style.driverCode} onChange={e=>setStyle(s=>({...s,driverCode:e.target.value}))}>{teamDrivers.map(d=><option key={d.code} value={d.code}>{d.given} {d.family}</option>)}</select></label><label>Card finish<select value={style.finish} onChange={e=>setStyle(s=>({...s,finish:e.target.value}))}>{Object.entries(FINISHES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label></div>
   <label className="photo-toggle"><input type="checkbox" checked={style.photo} onChange={e=>setStyle(s=>({...s,photo:e.target.checked}))}/>Include driver portrait</label>
   {style.photo&&style.driverCode==='TSU'&&<small>Tsunoda’s portrait is from his previous F1 season.</small>}
   {portrait.loading&&<p role="status">Loading driver portrait…</p>}
   {portrait.error&&<p className="feed-error" role="alert">{portrait.error} <button onClick={()=>setRetry(r=>r+1)}>Retry photo</button></p>}
   </>}
   {mode==='prediction'&&<><label className="photo-toggle"><input type="checkbox" checked={style.photo} onChange={e=>setStyle(s=>({...s,photo:e.target.checked}))}/>Include winner portrait</label>{portrait.loading&&<p role="status">Loading winner portrait…</p>}{portrait.error&&<p role="alert">{portrait.error}<button onClick={()=>setRetry(r=>r+1)}>Retry photo</button></p>}<p className="ticket-intro">No profile needed. Cast your podium, then keep your ticket. The artwork follows your winning driver.</p><div className="prediction-grid">{fields.map(([k,label])=><label key={k}>{label}<select value={prediction[k]} onChange={e=>{setPrediction(p=>({...p,[k]:e.target.value}));setFeedback('');}}><option value="">Choose driver</option>{drivers.map(d=><option disabled={['p1','p2','p3'].includes(k)&&['p1','p2','p3'].some(other=>other!==k&&prediction[other]===d.code)} key={d.code} value={d.code}>{d.given} {d.family} · {d.team}</option>)}</select></label>)}{[['safety','Safety car'],['rain','Rain']].map(([k,label])=><label key={k}>{label}<select value={prediction[k]} onChange={e=>setPrediction(p=>({...p,[k]:e.target.value}))}><option value="">Choose</option><option value="yes">Yes</option><option value="no">No</option></select></label>)}</div>
   {duplicate&&<p className="feed-error" role="alert">Pick three different drivers for the podium.</p>}<button className="outline-action" disabled={!complete} onClick={savePrediction}><BookmarkCheck size={18}/>Save my prediction</button></>}
   <div className="download-panel"><div className="download-heading"><h3>Keep your collectible</h3><InfoTip>PNG: 1080 × 1350. GIF: 600 × 750, looping for four seconds. MP4: 1080 × 1350, 120 frames over four seconds; requires H.264 encoding support. Hover, focus or tap this icon for details.</InfoTip></div><div className="collection-actions"><button disabled={!complete} onClick={saveCard}><BookmarkCheck/>{editingId?'Update collection':'Save to collection'}</button><button disabled={!exportReady} onClick={()=>exportCard('share')}><Share2/>Share image</button></div><div className="export-actions"><button disabled={!exportReady} onClick={()=>exportCard('png')}><Download/><span>PNG<small>Still image</small></span></button><button disabled={!exportReady} onClick={()=>exportCard('gif')}><Download/><span>GIF<small>{busy==='gif'?`${progress}%`:'Animated loop'}</small></span></button><button disabled={!exportReady||typeof VideoEncoder==='undefined'} onClick={()=>exportCard('video')}><Download/><span>MP4<small>{busy==='video'?`${progress}%`:'Video clip'}</small></span></button></div></div>
   <details className="selection-notes"><summary>About driver choices & predictions</summary><p>Drivers follow the latest published race field, with season standings used while it loads. The final Sepang entry list may change. Podium places must be unique. Predictions are your picks, not official results.</p></details>
   {!complete&&<p className="form-hint">{mode!=='prediction'&&!name.trim()?'Add your name to unlock your card.':'Complete all picks with a unique podium to save or export.'}</p>}
   <p className="save-status">{profileSaved&&draftSaved&&styleSaved&&collectionSaved?'Draft and collection save on this device. Clearing browser data removes them.':'Browser storage unavailable. Download your card to keep it.'} No account or cross-device sync.</p>

   {savedPick&&<details className="saved-prediction"><summary>Saved prediction · {new Date(savedPick.savedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</summary><p>{savedPick.name}’s Sepang picks</p><dl>{fields.map(([k,label])=><div key={k}><dt>{label}</dt><dd>{savedPick.names?.[savedPick.picks[k]]||names[savedPick.picks[k]]||savedPick.picks[k]}</dd></div>)}<div><dt>Safety car / Rain</dt><dd>{savedPick.picks.safety} / {savedPick.picks.rain}</dd></div></dl><PredictionReview picks={savedPick.picks}/><p>{pickSaved?'Saved locally.':'Could not persist this prediction.'} Predictions are personal picks, not race results.</p><button className="text-button" onClick={()=>{setIdentities(current=>({...current||initialIdentities,prediction:{serial:savedPick.serial||getCardSerial('PRD','saved-prediction'),editingId:null}}));setPrediction({...savedPick.picks});setProfile({name:savedPick.name,teamId:savedPick.teamId,mode:'prediction'});setFeedback('Saved prediction loaded into the editor.');}}>Load saved picks</button></details>}
  </fieldset>
  {(busy==='gif'||busy==='video')&&<div className="gif-progress" role="status"><progress value={progress} max="100" aria-label="GIF export progress"/><span>Rendering your collectible · {progress}%</span><button onClick={()=>abortRef.current?.abort()}>Cancel export</button></div>}
  {feedback&&<p className="success" role="status">{feedback}</p>}
  <div className="card-collection"><h3>My collection <span>{collection.length}/12</span></h3><p>Open a saved design to edit or download it again.</p>{collection.length===0?<p className="form-hint">Your first collectible belongs here. Add your name, then save your card.</p>:<ul>{collection.map(c=><li key={c.id}><span className="collection-monogram" style={{'--card-team':TEAM_COLORS[c.profile.teamId]}}>{c.profile.name.trim().split(/\s+/).map(n=>Array.from(n)[0]).slice(0,2).join('')}</span><div><strong>{c.profile.name}</strong><small>{modes[c.profile.mode]} · {c.style.driverCode} · {FINISHES[c.style.finish]}</small></div><button disabled={!!busy} onClick={()=>loadCard(c)}>Open</button><button disabled={!!busy} aria-label={`Remove ${c.profile.name} ${modes[c.profile.mode]} card`} onClick={()=>{setCollection(cs=>cs.filter(x=>x.id!==c.id));if(editingId===c.id)setEditingId(null);}}>Remove</button></li>)}</ul>}{editingId&&<button disabled={!!busy} onClick={()=>{newCard();setFeedback('Ready to save this design as a new collectible.');}}>Make a new collectible</button>}</div>
  </div><div className="card-preview"><button className="canvas-button" aria-label="Open and rotate my collectible" onClick={()=>{setMedia(null);setViewer(true);}}><canvas ref={canvas} width="648" height="810" role="img" aria-label={`${modes[mode]} collectible featuring ${selectedDriver.given} ${selectedDriver.family}`}/></button><small>Tap the card. Tilt it. Make it yours.</small><small className="card-serial">{serial}</small></div>{viewer&&<CardViewer settings={settings} photo={portrait.image} media={media} onClose={()=>setViewer(false)}/>}</section>;
}
