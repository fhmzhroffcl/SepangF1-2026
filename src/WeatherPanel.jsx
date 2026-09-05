import React,{useState} from 'react';
import {CloudLightning,CloudRain,CloudSun,RefreshCw} from 'lucide-react';
import useFeed from './useFeed';
import {FORECAST,WARNINGS,forecastRows,activeWarnings,describe,timeMY,dateMY} from './data';

const iconFor=s=>/ribut|thunder/i.test(s||'')?CloudLightning:/hujan|rain/i.test(s||'')?CloudRain:CloudSun;

export default function WeatherPanel(){
 const feed=useFeed(FORECAST,forecastRows,300000), warnings=useFeed(WARNINGS,activeWarnings,300000);
 const [index,setIndex]=useState(0); const row=feed.rows[Math.min(index,Math.max(0,feed.rows.length-1))]; const Icon=iconFor(row?.summary_forecast);
 return <div className="weather-panel">
  <div className="panel-title"><b>SEPANG WEATHER</b><span>MET MALAYSIA</span></div>
  <div className="weather-update"><button aria-label="Refresh weather" onClick={()=>{feed.refresh();warnings.refresh()}} disabled={feed.loading}><RefreshCw size={15}/></button>{feed.loading?'Updating…':feed.retrieved?`Updated ${timeMY(feed.retrieved)} MYT`:'Connecting…'}</div>
  {row?<><div className="weather-range">{row.min_temp}°—{row.max_temp}°C</div><div className="weather-main"><Icon/><div><strong>{describe(row.summary_forecast)}</strong><small>{new Date(row.date+'T12:00:00+08:00').toLocaleDateString('en-GB',{timeZone:'Asia/Kuala_Lumpur',weekday:'long',day:'numeric',month:'short'})}</small></div></div><div className="forecast-strip">{feed.rows.slice(0,7).map((r,i)=><button className={i===index?'active':''} key={r.date} onClick={()=>setIndex(i)}><span>{new Date(r.date+'T12:00:00+08:00').toLocaleDateString('en-GB',{weekday:'short'})}</span><b>{r.max_temp}°</b></button>)}</div></>:<div className="weather-empty">{feed.error||'Loading official forecast…'}<small>No sample weather is substituted.</small></div>}
  <div className={`alert-line ${warnings.rows.length?'danger':'clear'}`}><span>{warnings.rows.length?'!':'i'}</span><div><b>{warnings.error?'Warning feed unavailable':warnings.rows.length?`${warnings.rows.length} active bulletin${warnings.rows.length>1?'s':''}`:'No matching active bulletin'}</b><small>{warnings.rows[0]?.heading_en||'Selangor / Sepang feed checked'}</small></div></div>
  <p className="source-note">Latest official district forecast · auto-refreshes · {feed.retrieved?dateMY(new Date(feed.retrieved)):'awaiting data'}</p>
 </div>
}
