import React,{useState} from 'react';
import {ExternalLink} from 'lucide-react';
import {OFFICIAL,TRACK_IMAGE} from './data';

// Label centres in the official 1280 × 704 artwork, not the surrounding container.
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
 const active=sectors[(mode==='sectors'?sector:selected.sector)-1];
 return <section id="circuit" className="circuit-section">
  <div className="section-heading"><h2>Learn the lap.</h2><p>15 corners. Three unequal timing sectors. One 5.543 km lap.</p></div>
  <div className="track-controls"><div>{['corners','sectors'].map(x=><button key={x} aria-pressed={mode===x} className={mode===x?'active':''} onClick={()=>setMode(x)}>{x}</button>)}</div><a href={OFFICIAL} target="_blank" rel="noreferrer">F1 circuit guide <ExternalLink size={14}/></a></div>
  <div className="circuit-workspace">
   <div className="accurate-track">
    <div className="circuit-art">
     {failed?<p className="feed-error">Circuit artwork could not load. <a href={OFFICIAL}>Open the official diagram ↗</a></p>:<svg viewBox="190 -24 880 750" role="img" aria-label="Official Sepang circuit: sector 1 pink, sector 2 yellow, sector 3 blue; numbered turns 1 to 15"><image href={TRACK_IMAGE} width="1280" height="704" onError={()=>setFailed(true)}/>{mode==='corners'&&<circle cx={selected.x} cy={selected.y} r="21" fill="none" stroke="#f0263e" strokeWidth="5"/>}</svg>}
    </div>
    {mode==='corners'?<div className="corner-picker" aria-label="Choose a corner">{corners.map(c=><button key={c.n} aria-label={`Turn ${c.n}`} aria-pressed={selected.n===c.n} className={selected.n===c.n?'active':''} onClick={()=>setSelected(c)}>{c.n}</button>)}</div>:<div className="sector-picker">{sectors.map(s=><button key={s.n} aria-pressed={sector===s.n} onClick={()=>setSector(s.n)} className={sector===s.n?'active':''} style={{'--sector':s.color}}><i/>Sector {s.n}<small>Turns {s.turns}</small></button>)}</div>}
   </div>
   <aside className="turn-detail" aria-live="polite" style={{'--sector':active.color}}>
    <span>{mode==='corners'?`TURN ${String(selected.n).padStart(2,'0')} · `:''}SECTOR {active.n}</span>
    <h3>{mode==='corners'?selected.name:active.title}</h3><p>{mode==='corners'?selected.note:active.note}</p>
    <dl><div><dt>Sector corners</dt><dd>{active.turns}</dd></div><div><dt>Timing boundaries</dt><dd>{active.range}</dd></div></dl>
    <p className="sector-explainer">Sectors divide the lap at timing lines, not into equal distances. The colours follow the official diagram.</p>
   </aside>
  </div>
  <div className="track-facts"><span><b>5.543 KM</b>Full lap</span><span><b>56</b>Race laps</span><span><b>310.408 KM</b>Race distance</span><span><b>1:34.080</b>Race lap record · Vettel, 2017</span></div>
 </section>;
}
