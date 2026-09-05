import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight,CalendarPlus,ExternalLink,MapPin} from 'lucide-react';
import WeatherPanel from './WeatherPanel';
import CircuitExplorer from './CircuitExplorer';
import Standings from './Standings';
import FanStudio from './FanStudio';
import HistoryTimeline from './HistoryTimeline';
import CircuitMap from './CircuitMap';
import MyWeekend from './MyWeekend';
import {sessions,timeMY,OFFICIAL,CIRCUIT,ANNOUNCEMENT,TICKETS,VERIFIED,TRACK_IMAGE} from './data';
import {SNAPSHOT} from './standings';
import './style.css';
import './audit.css';
import './upgrade.css';
import './expressive.css';
import SoundControl from './SoundControl';
import Tickets from './Tickets';
import SessionTimeline from './SessionTimeline';

const sessionShort={'Practice 1':'FP1','Practice 2':'FP2','Practice 3':'FP3'};
function parts(seconds){return {days:Math.floor(seconds/86400),hours:Math.floor(seconds%86400/3600),minutes:Math.floor(seconds%3600/60),seconds:seconds%60};}
function saveCalendar(chosen=sessions){const clean=s=>s.replace(/[-:]/g,'');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sepang 26//EN',...chosen.flatMap(s=>['BEGIN:VEVENT',`UID:sepang26-${s.start}@sepang26`,`DTSTAMP:${clean(new Date().toISOString().replace(/\.\d+Z$/,'Z'))}`,`DTSTART:${clean(s.start)}`,`DTEND:${clean(s.end)}`,`SUMMARY:${s.name} — Bahrain Grand Prix in Malaysia`,'LOCATION:Sepang International Circuit','BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:Your selected Sepang session starts in 30 minutes','END:VALARM','END:VEVENT']),'END:VCALENDAR'];const url=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar'})),a=document.createElement('a');a.href=url;a.download='sepang-26-weekend.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}

function RaceHub(){const [now,setNow]=useState(Date.now());useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);const next=sessions.find(s=>Date.parse(s.end)>now),count=parts(next?Math.max(0,Math.floor((Date.parse(next.start)-now)/1000)):0);return <section id="race-hub" className="race-hub"><div className="hub-copy"><h1>Your Sepang<br/>race weekend.</h1><p>SEPANG INTERNATIONAL CIRCUIT · 2—4 OCT 2026</p><div className="next-session"><span>{next&&Date.parse(next.start)<=now?'SCHEDULED SESSION WINDOW':'UP NEXT AT SEPANG'}</span><h2>{next?.name||'Weekend complete'}</h2>{next&&<p>{new Date(next.start).toLocaleDateString('en-GB',{timeZone:'Asia/Kuala_Lumpur',weekday:'short',day:'numeric',month:'short'}).toUpperCase()} · {timeMY(next.start)} MYT</p>}<div className="countdown" aria-live="off">{Object.entries(count).map(([k,v])=><div key={k}><strong>{String(v).padStart(2,'0')}</strong><small>{k}</small></div>)}</div><div className="hero-actions"><a href="#grid">My race tracker <ArrowRight/></a><a href="#fan-card">Make fan card <ArrowRight/></a></div></div></div><WeatherPanel/><div className="session-rail">{sessions.map(s=><div key={s.name} className={s===next?'active':''}><i/><span>{sessionShort[s.name]||s.name}</span><small>{new Date(s.start).toLocaleDateString('en-GB',{timeZone:'Asia/Kuala_Lumpur',weekday:'short',day:'numeric',month:'short'})}<b>{timeMY(s.start)} MYT</b></small></div>)}<button onClick={()=>saveCalendar()}><CalendarPlus/>Calendar</button></div></section>}

function WeekendGuide(){return <section id="visit" className="visit-section"><div className="section-heading"><h2>Get to the right place.</h2><p>Route to the circuit, then confirm your event gate with the organiser.</p></div><div className="visit-grid"><div className="geo-map"><CircuitMap/></div><div className="arrival"><MapPin/><h3>Sepang International Circuit</h3><p>Jalan Pekeliling, 64000 KLIA, Selangor, Malaysia</p><a className="action" href="https://www.google.com/maps/dir/?api=1&destination=Sepang+International+Circuit%2C+Malaysia" target="_blank" rel="noreferrer">Open live directions <ExternalLink/></a><dl><div><dt>Event gates</dt><dd>Check ticket / organiser update</dd></div><div><dt>Parking & shuttle</dt><dd>Awaiting official race-weekend plan</dd></div><div><dt>Nearest airport</dt><dd>Kuala Lumpur International Airport</dd></div></dl></div></div></section>}

function Story(){return <HistoryTimeline/>}

function App(){const [drivers,setDrivers]=useState(SNAPSHOT.drivers);return <><a className="skip-link" href="#race-hub">Skip to content</a><header><a className="brand" href="#race-hub"><b>SEPANG</b><strong>26</strong></a><nav aria-label="Main navigation"><a href="#race-hub">Race Hub</a><a href="#grid">Tracker</a><a href="#circuit">Circuit</a><a href="#my-weekend">My Weekend</a><a href="#fan-card">Fan Card</a></nav><SoundControl/></header><main><RaceHub/><figure className="sepang-photo-band"><img loading="lazy" src="https://media.formula1.com/image/upload/t_16by9Centre/c_lfill%2Cw_3392/q_auto/v1740000001/fom-website/2026/Miscellaneous/SD-2017-Malaysia-Saturday-154_1981744%20169.webp" alt="Fans and Formula 1 at Sepang in 2017"/><figcaption><small>BACK WHERE WE BELONG</small><strong>Same ground.<br/>A new chapter.</strong><span>Sepang 2017 archive · Formula 1</span></figcaption></figure><SessionTimeline saveCalendar={saveCalendar}/><Standings onDrivers={setDrivers}/><MyWeekend saveCalendar={saveCalendar}/><CircuitExplorer/><FanStudio drivers={drivers}/><Tickets/><WeekendGuide/><Story/></main><footer><b>SEPANG 26</b><p>Independent fan companion · not affiliated with Formula 1 or the event organisers.</p><p>Schedule and circuit facts checked {VERIFIED}. <a href={OFFICIAL} target="_blank" rel="noreferrer">Official event updates ↗</a><br/>Weather: MET Malaysia / data.gov.my. Results: Jolpica.</p></footer></>}
createRoot(document.getElementById('root')).render(<App/>);
