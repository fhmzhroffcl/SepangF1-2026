import React,{useState} from 'react';
import {ExternalLink,MapPinned} from 'lucide-react';
import {OFFICIAL,TRACK_IMAGE} from './data';

const corners=[
 [1,21,44,'Opening left','Heavy braking after the pit straight.'],[2,33,47,'Opening complex','The exit completes Sepang’s tight first sequence.'],[3,28,20,'Long right','Sector 1 climbs into the north loop.'],[4,60,3,'North hairpin','The track turns back toward the fast middle section.'],[5,66,33,'Fast sweep','The start of Sepang’s celebrated Turns 5–6 sequence.'],[6,79,26,'Fast sweep','Commitment through the second half of the high-speed pair.'],[7,96,55,'East complex','Sector 2 continues around the eastern edge.'],[8,91,70,'East complex','The final corner before the southern technical section.'],[9,58,68,'Heavy braking','The southern loop begins here.'],[10,68,73,'Technical right','Links the lower sequence toward Turn 11.'],[11,61,91,'Southern hairpin','The lowest point on the circuit map.'],[12,46,74,'Direction change','Feeds the flowing final sector.'],[13,33,82,'Final-sector left','Builds toward the back straight.'],[14,26,67,'Back-straight launch','Exit speed matters onto Sepang’s long back straight.'],[15,87,55,'Final hairpin','A prime late-braking overtaking point before the pit straight.']
].map(([n,x,y,name,note])=>({n,x,y,name,note,sector:n<=5?1:n<=9?2:3}));

export default function CircuitExplorer(){
 const [selected,setSelected]=useState(corners[14]),[mode,setMode]=useState('corners');
 return <section id="circuit" className="circuit-section">
  <div className="section-heading"><h2>Read Sepang before lights out.</h2><p>Tap every corner. Follow the sectors. Know where the lap turns.</p></div>
  <div className="circuit-workspace">
   <div className={`track-stage mode-${mode}`}><div className="track-canvas">
    <img src={TRACK_IMAGE} alt="Official Formula 1 diagram of Sepang International Circuit with 15 numbered corners and three sectors"/>
    {corners.map(c=><button key={c.n} className={`corner-hotspot ${selected.n===c.n?'selected':''}`} style={{left:`${c.x}%`,top:`${c.y}%`}} aria-label={`Turn ${c.n}: ${c.name}`} onClick={()=>setSelected(c)}>{c.n}</button>)}
    {mode==='overtaking'&&<><span className="overtake back">BACK STRAIGHT</span><span className="overtake pit">PIT STRAIGHT</span></>}
   </div>
   </div>
   <aside className="turn-detail"><span>TURN {String(selected.n).padStart(2,'0')} · SECTOR {selected.sector}</span><h3>{selected.name}</h3><p>{selected.note}</p><dl><div><dt>Corner</dt><dd>{selected.n} / 15</dd></div><div><dt>Sector</dt><dd>{selected.sector}</dd></div><div><dt>Track length</dt><dd>5.543 km</dd></div></dl><a className="action" href="https://www.google.com/maps/dir/?api=1&destination=Sepang+International+Circuit%2C+Malaysia" target="_blank" rel="noreferrer"><MapPinned size={18}/>Open directions</a></aside>
  </div>
  <div className="track-controls"><div>{['corners','sectors','overtaking'].map(x=><button key={x} className={mode===x?'active':''} onClick={()=>setMode(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div><p>{mode==='overtaking'?'Verified long straights and Turn 15 braking opportunity.':'2026 DRS activation / detection lines await the FIA event circuit map.'}</p></div>
  <div className="track-facts"><span><b>5.543 KM</b>Length</span><span><b>56</b>Laps</span><span><b>310.408 KM</b>Race distance</span><span><b>1:34.080</b>Vettel · 2017</span><a href={OFFICIAL} target="_blank" rel="noreferrer">Official circuit guide <ExternalLink size={14}/></a></div>
 </section>
}
