import React,{useEffect,useRef,useState} from 'react';
import {Download,Share2,BookmarkCheck} from 'lucide-react';
import {SNAPSHOT,TEAM_COLORS} from './standings';
import {TEAMS} from './teams';
import useSaved from './useSaved';

const modes={going:"I'm Going",online:'Watching Online',prediction:'My Prediction'};
const titles={going:"I'M GOING TO SEPANG",online:"I'M WATCHING ONLINE",prediction:'MY SEPANG PREDICTION'};
const fields=[['pole','Pole winner'],['p1','Podium P1'],['p2','Podium P2'],['p3','Podium P3'],['fastest','Fastest lap']];
const empty={pole:'',p1:'',p2:'',p3:'',fastest:'',safety:'',rain:''};
const teamList=Object.entries(TEAMS).map(([id,t])=>({id,name:t.name,color:TEAM_COLORS[id]}));
function text(ctx,value,x,y,size,max=952,color='#f1ecdf',weight=700){
 ctx.fillStyle=color;ctx.font=`${weight} ${size}px Arial, sans-serif`;
 while(ctx.measureText(value).width>max&&size>10){size--;ctx.font=`${weight} ${size}px Arial, sans-serif`;}
 ctx.fillText(value,x,y);
}
const blobOf=canvas=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not create the image. Please retry.')),'image/png'));

export default function FanStudio({drivers=SNAPSHOT.drivers}){
 const canvas=useRef(null),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false);
 const [profile,setProfile,profileSaved]=useSaved('profile',{name:'',teamId:'ferrari',mode:'going'},v=>v&&typeof v.name==='string'&&TEAMS[v.teamId]&&modes[v.mode]);
 const [prediction,setPrediction,draftSaved]=useSaved('prediction-draft',empty,v=>v&&Object.keys(empty).every(k=>typeof v[k]==='string'));
 const [savedPick,setSavedPick,pickSaved]=useSaved('prediction',null,v=>v&&typeof v.name==='string'&&typeof v.savedAt==='string'&&v.picks);
 const {name,teamId,mode}=profile,team=teamList.find(t=>t.id===teamId);
 const setMode=mode=>{setProfile(p=>({...p,mode}));setFeedback('');};
 const names=Object.fromEntries(drivers.map(d=>[d.code,d.given+' '+d.family]));
 const allPicked=fields.every(([k])=>names[prediction[k]])&&['yes','no'].includes(prediction.safety)&&['yes','no'].includes(prediction.rain);
 const podium=[prediction.p1,prediction.p2,prediction.p3].filter(Boolean),duplicate=new Set(podium).size!==podium.length;
 const complete=Boolean(name.trim())&&(mode!=='prediction'||allPicked&&!duplicate);
 const initials=Array.from(name.trim().split(/\s+/).filter(Boolean).map(x=>Array.from(x)[0]).join('')).slice(0,2).join('').toUpperCase()||'S';
 useEffect(()=>{
  const ctx=canvas.current?.getContext('2d');if(!ctx)return;
  ctx.clearRect(0,0,1080,1350);ctx.fillStyle='#0b0e10';ctx.fillRect(0,0,1080,1350);
  text(ctx,'SEPANG',64,105,66,400);text(ctx,'26',388,105,66,160,team.color);
  text(ctx,'02–04 OCT 2026',670,75,25,345);
  text(ctx,'BAHRAIN GP IN MALAYSIA',670,112,20,345);
  ctx.fillStyle=team.color;ctx.fillRect(0,154,1080,12);
  ctx.fillStyle=mode==='online'?'#17202a':mode==='prediction'?'#20221b':'#b31b2d';ctx.fillRect(0,166,1080,570);
  // Deterministic typography and racing stripes form the personal monogram.
  const seed=Array.from(name).reduce((n,c)=>n+c.codePointAt(0),0);
  ctx.globalAlpha=.18;ctx.strokeStyle=team.color;ctx.lineWidth=14;
  for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(-170+i*220+(seed%40),166);ctx.lineTo(80+i*220,736);ctx.stroke();}
  ctx.globalAlpha=1;ctx.textAlign='center';
  text(ctx,initials,540,555,300,870);text(ctx,name.trim().toUpperCase()||'YOUR NAME',540,675,62,940);
  ctx.textAlign='left';text(ctx,titles[mode],64,805,42,952);
  text(ctx,team.name.toUpperCase()+' SUPPORTER',64,852,25,952,team.color);
  if(mode==='prediction'){
   fields.forEach(([key,label],i)=>{text(ctx,label.toUpperCase(),64,912+i*45,20,225,'#aab1b7');text(ctx,names[prediction[key]]||'Choose driver',320,912+i*45,29,690);});
   text(ctx,'SAFETY CAR: '+(prediction.safety||'—').toUpperCase()+'     RAIN: '+(prediction.rain||'—').toUpperCase(),64,1168,23,952);
  }else{
   text(ctx,mode==='going'?'SEE YOU AT SEPANG.':'EVERY LAP. FROM WHEREVER I AM.',64,968,42,952);
   text(ctx,'5.543 KM  /  15 TURNS  /  56 LAPS',64,1033,26,952,'#aab1b7');
   text(ctx,'RACE · SUNDAY 4 OCT · 15:00 MYT',64,1110,27,952);
  }
  ctx.fillStyle=team.color;ctx.fillRect(64,1210,952,3);
  text(ctx,'SEPANG INTERNATIONAL CIRCUIT · MALAYSIA',64,1260,22,952);
  text(ctx,'sepang-f1.vercel.app  ·  Independent fan card',64,1305,19,952,'#aab1b7');
 },[name,teamId,mode,prediction,drivers,initials]);
 const getFile=async()=>new File([await blobOf(canvas.current)],`sepang26-${mode}-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')||'fan'}.png`,{type:'image/png'});
 const downloadFile=file=>{const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);};
 const exportCard=async share=>{
  if(!complete||busy)return;setBusy(true);setFeedback('');
  try{const file=await getFile();if(share&&navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:'My Sepang 26 fan card',files:[file]});setFeedback('Card shared.');}else{downloadFile(file);setFeedback(share?'PNG downloaded. You can attach it in your favourite app.':'PNG downloaded.');}}
  catch(e){setFeedback(e.name==='AbortError'?'Sharing cancelled. Your card is still saved here.':e.message||'Export failed. Please retry.');}finally{setBusy(false);}
 };
 const savePrediction=()=>{if(!complete)return;setSavedPick({name:name.trim(),teamId,picks:{...prediction},names:{...names},savedAt:new Date().toISOString()});setFeedback('Prediction saved on this browser.');};
 return <section id="fan-card" className="fan-studio"><div className="studio-copy"><h2>Make it your weekend.</h2>
  <div className="mode-tabs">{Object.entries(modes).map(([k,v])=><button aria-pressed={mode===k} className={mode===k?'active':''} key={k} onClick={()=>setMode(k)}>{v}</button>)}</div>
  <div className="studio-form"><label>Your name<input value={name} maxLength={40} placeholder="Your name" onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/><small>Your initials become your card’s monogram.</small></label>
   <fieldset><legend>Choose your team</legend><div className="team-picker">{teamList.map(t=><button type="button" aria-pressed={teamId===t.id} className={teamId===t.id?'active':''} key={t.id} onClick={()=>setProfile(p=>({...p,teamId:t.id}))} style={{'--swatch':t.color}}><span/>{t.name}</button>)}</div></fieldset>
   {mode==='prediction'&&<><div className="prediction-grid">{fields.map(([k,label])=><label key={k}>{label}<select value={prediction[k]} onChange={e=>{setPrediction(p=>({...p,[k]:e.target.value}));setFeedback('');}}><option value="">Choose driver</option>{drivers.map(d=><option key={d.code} value={d.code}>{d.given} {d.family}</option>)}</select></label>)}{[['safety','Safety car'],['rain','Rain']].map(([k,label])=><label key={k}>{label}<select value={prediction[k]} onChange={e=>setPrediction(p=>({...p,[k]:e.target.value}))}><option value="">Choose</option><option value="yes">Yes</option><option value="no">No</option></select></label>)}</div>
   {duplicate&&<p className="feed-error" role="alert">Pick three different drivers for the podium.</p>}<button className="outline-action" disabled={!complete} onClick={savePrediction}><BookmarkCheck size={18}/>Save my prediction</button></>}
   <div className="export-actions"><button disabled={!complete||busy} onClick={()=>exportCard(true)}><Share2/>Share card</button><button className="primary" disabled={!complete||busy} onClick={()=>exportCard(false)}><Download/>{busy?'Preparing…':'Download PNG'}</button></div>
   {!complete&&<p className="form-hint">{!name.trim()?'Add your name to unlock your card.':'Complete all picks with a unique podium to save or export.'}</p>}
   <p className="save-status">{profileSaved&&draftSaved?'Profile and draft saved on this browser.':'Browser storage unavailable. Download your card to keep it.'} No account or cross-device sync.</p>
   {feedback&&<p className="success" role="status">{feedback}</p>}
   {savedPick&&<details className="saved-prediction"><summary>Saved prediction · {new Date(savedPick.savedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</summary><p>{savedPick.name}’s Sepang picks</p><dl>{fields.map(([k,label])=><div key={k}><dt>{label}</dt><dd>{savedPick.names?.[savedPick.picks[k]]||names[savedPick.picks[k]]||savedPick.picks[k]}</dd></div>)}<div><dt>Safety car / Rain</dt><dd>{savedPick.picks.safety} / {savedPick.picks.rain}</dd></div></dl><p>{pickSaved?'Saved locally.':'Could not persist this prediction.'} Predictions are personal picks, not race results.</p><button className="text-button" onClick={()=>{setPrediction({...savedPick.picks});setProfile({name:savedPick.name,teamId:savedPick.teamId,mode:'prediction'});setFeedback('Saved prediction loaded into the editor.');}}>Load saved picks</button></details>}
  </div></div><div className="card-preview"><canvas ref={canvas} width="1080" height="1350" role="img" aria-label={`${modes[mode]} fan card for ${name||'your name'}, supporting ${team.name}`}/></div></section>;
}
