import React,{useState,useEffect} from 'react';
import {ExternalLink} from 'lucide-react';
import AIBriefing from './AIBriefing';
import {OFFICIAL,TRACK_IMAGE} from './data';

// Label centres in the official 1252 × 704 artwork, not the surrounding container.
const corners=[
 [1,227,310,'Opening right-hander','Braking from the main straight leads into the tight opening sequence.'],
 [2,355,329,'Left-hand switchback','The direction changes immediately after Turn 1.'],
 [3,304,120,'Long right','The opening sequence opens out onto the run to Turn 4.'],
 [4,648,16,'Right-hand braking zone','The first corner of the middle sector follows the long run from Turn 3.'],
 [5,718,232,'Fast left','The first half of Sepang’s fast, flowing Turns 5–6 pair.'],
 [6,853,187,'Fast right','A quick change of direction completes the high-speed pair.'],
 [7,1032,396,'Double right, part one','The middle sector continues into two linked right-hand corners.'],
 [8,976,491,'Double right, part two','Completes the pair before the run down to Turn 9.'],
 [9,620,474,'Tight left','The lap slows for the left-hander near the second timing boundary.'],
 [10,738,518,'Right-hand link','The final sector begins with the sequence toward Turn 11.'],
 [11,661,689,'Right-hand corner','The track turns back toward the flowing Turns 12–13 section.'],
 [12,491,553,'Left-hand sweep','The direction changes on the approach to the last part of the lap.'],
 [13,360,576,'Right-hand sweep','Links into Turn 14 and the back straight.'],
 [14,284,466,'Back-straight exit','A right-hander releases the car onto the long back straight.'],
 [15,932,382,'Final left hairpin','The back straight ends in a heavy-braking hairpin before the main straight.']
].map(([n,x,y,name,note])=>({n,x,y,name,note,sector:n<=3?1:n<=9?2:3}));
const sectors=[
 {n:1,color:'#ed168c',title:'Launch & flow',range:'Start line → between Turns 3 and 4',turns:'1–3',note:'The main straight, opening switchback and sweeping Turn 3.'},
 {n:2,color:'#ffcf28',title:'The fast middle',range:'After Turn 3 → between Turns 9 and 10',turns:'4–9',note:'Heavy braking at Turn 4, fast Turns 5–6 and the linked middle section.'},
 {n:3,color:'#439cdd',title:'The run home',range:'After Turn 9 → finish line',turns:'10–15',note:'The technical final sequence, back straight and final hairpin.'}
];
export default function CircuitExplorer(){
 const [selected,setSelected]=useState(corners[0]),[mode,setMode]=useState('corners'),[sector,setSector]=useState(1),[failed,setFailed]=useState(false);
 const [tour,setTour]=useState(false),[masks,setMasks]=useState({});
 useEffect(()=>{if(!tour)return;setMode('corners');const t=setInterval(()=>setSelected(c=>corners[c.n%15]),3500);return()=>clearInterval(t);},[tour]);
 useEffect(()=>{let alive=true;const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{try{const result={};for(let sector=1;sector<=3;sector++){const c=document.createElement('canvas');c.width=1252;c.height=704;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,1252,704);const frame=ctx.getImageData(0,0,1252,704);for(let i=0;i<frame.data.length;i+=4){const [r,g,b]=frame.data.slice(i,i+3);const match=sector===1?r>130&&r>g*1.45&&b>g*1.2:sector===2?r>140&&g>120&&b<g*.65:b>110&&b>r*1.25&&g>60;frame.data[i]=255;frame.data[i+1]=255;frame.data[i+2]=255;frame.data[i+3]=match?255:0;}ctx.putImageData(frame,0,0);result[sector]=c.toDataURL();}if(alive)setMasks(result);}catch{}};im.src=TRACK_IMAGE;return()=>{alive=false;};},[]);
 const active=sectors[(mode==='sectors'?sector:selected.sector)-1];
 return <section id="circuit" className="circuit-section">
  <div className="section-heading"><h2>Learn the lap.</h2><p>15 corners. Three unequal timing sectors. One 5.543 km lap.</p></div>
  <div className="track-controls"><div>{['corners','sectors'].map(x=><button key={x} aria-pressed={mode===x} className={mode===x?'active':''} onClick={()=>setMode(x)}>{x}</button>)}</div><button aria-pressed={tour} onClick={()=>setTour(t=>!t)}>{tour?'Pause guided lap':'Start guided lap'}</button><a href={OFFICIAL} target="_blank" rel="noreferrer">F1 circuit guide <ExternalLink size={14}/></a></div>
  <div className="circuit-workspace">
   <div className="accurate-track">
    <div className="circuit-art">
     {failed?<p className="feed-error">Circuit artwork could not load. <a href={OFFICIAL}>Open the official diagram ↗</a></p>:<svg viewBox="190 -24 880 750" role="img" aria-label="Official Sepang circuit: sector 1 pink, sector 2 yellow, sector 3 blue; numbered turns 1 to 15"><defs><linearGradient id="sector-shine"><stop offset="0" stopColor="white" stopOpacity=".25"/><stop offset=".5" stopColor="white"/><stop offset="1" stopColor="white" stopOpacity=".25"/></linearGradient><mask id="active-sector"><image href={masks[active.n]} width="1252" height="704"/></mask></defs><image href={TRACK_IMAGE} width="1252" height="704" style={{opacity:mode==='sectors'?.38:1}} onError={()=>setFailed(true)}/>{mode==='sectors'&&masks[active.n]&&<g mask="url(#active-sector)"><rect width="1252" height="704" fill={active.color}/><rect className="sector-sweep" x="-1252" width="1252" height="704" fill="url(#sector-shine)"/></g>}{mode==='corners'&&<circle cx={selected.x} cy={selected.y} r="21" fill="none" stroke="#f0263e" strokeWidth="5" className="corner-pulse"/>}</svg>}
    </div>
    {mode==='corners'?<div className="corner-picker" aria-label="Choose a corner">{corners.map(c=><button key={c.n} aria-label={`Turn ${c.n}`} aria-pressed={selected.n===c.n} className={selected.n===c.n?'active':''} onClick={()=>{setTour(false);setSelected(c);}}>{c.n}</button>)}</div>:<div className="sector-picker">{sectors.map(s=><button key={s.n} aria-pressed={sector===s.n} onClick={()=>{setTour(false);setSector(s.n);}} className={sector===s.n?'active':''} style={{'--sector':s.color}}><i/>Sector {s.n}<small>Turns {s.turns}</small></button>)}</div>}
   </div>
   <aside key={`${mode}-${selected.n}-${sector}`} className="turn-detail detail-enter" aria-live="polite" style={{'--sector':active.color}}>
    <span>{mode==='corners'?`TURN ${String(selected.n).padStart(2,'0')} · `:''}SECTOR {active.n}</span>
    <h3>{mode==='corners'?selected.name:active.title}</h3><p>{mode==='corners'?selected.note:active.note}</p>
    <dl><div><dt>Sector corners</dt><dd>{active.turns}</dd></div><div><dt>Timing boundaries</dt><dd>{active.range}</dd></div></dl>
    <div className="circuit-insight"><h4>What to watch</h4><p>{active.n===1?'Watch the launch, braking into Turn 1 and positioning through the opening switchback.':active.n===2?'Follow how smoothly cars link the fast Turns 5 and 6; a mistake affects the next corner too.':'Watch the exit toward the back straight and late braking into the final hairpin.'}</p><h4>Fan viewpoint</h4><p>{active.n===2?'Use the broadcast onboard camera to follow the linked bends.':'The Main Grandstand overlooks the pit straight, final corner and opening turns.'}</p><h4>When it rains</h4><p>Grip and visibility can change quickly. Watch braking lines and race-control messages; a district forecast cannot tell you which tyre is fastest.</p></div><p className="sector-explainer">Sectors divide the lap at timing lines, not into equal distances. The colours follow the official diagram.</p>
   </aside>
  </div>
  <p className="tour-caption">Guided lap advances through corner labels every 3.5 seconds. Select any corner to explore at your own pace.</p><AIBriefing topic="circuit"/><div className="track-facts"><span><b>5.543 KM</b>Full lap</span><span><b>56</b>Race laps</span><span><b>310.408 KM</b>Race distance</span><span><b>1:34.080</b>Race lap record · Vettel, 2017</span></div>
 </section>;
}
