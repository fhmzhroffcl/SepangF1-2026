import React,{useState} from 'react';
import {CloudLightning,CloudRain,CloudSun,RefreshCw} from 'lucide-react';
import useFeed from './useFeed';
import {FORECAST,WARNINGS,forecastRows,activeWarnings,describe,timeMY,dateMY} from './data';
const iconFor=s=>/ribut|thunder/i.test(s||'')?CloudLightning:/hujan|rain/i.test(s||'')?CloudRain:CloudSun;
export default function WeatherPanel(){
 const feed=useFeed(FORECAST,forecastRows,300000),warnings=useFeed(WARNINGS,activeWarnings,300000);
 const [selectedDate,setSelectedDate]=useState('');
 const row=feed.rows.find(r=>r.date===selectedDate)||feed.rows[0],Icon=iconFor(row?.summary_forecast);
 return <div className="weather-panel">
  <div className="panel-title"><b>SEPANG WEATHER</b><span>MET MALAYSIA</span></div>
  <div className="weather-update"><button aria-label="Refresh weather" onClick={()=>{feed.refresh();warnings.refresh();}} disabled={feed.loading}><RefreshCw size={17}/></button>{feed.loading?'Updating…':feed.retrieved?'Checked '+timeMY(feed.retrieved)+' MYT':'Update unavailable'}</div>
  {row?<><div className="weather-range">{row.min_temp}°—{row.max_temp}°C</div><div className="weather-main"><Icon/><div><strong>{describe(row.summary_forecast)}</strong><small>{new Date(row.date+'T12:00:00+08:00').toLocaleDateString('en-GB',{timeZone:'Asia/Kuala_Lumpur',weekday:'long',day:'numeric',month:'short'})}</small></div></div>
   <div className="forecast-strip" aria-label="Forecast day">{feed.rows.slice(0,7).map(r=><button aria-pressed={r.date===row.date} className={r.date===row.date?'active':''} key={r.date} onClick={()=>setSelectedDate(r.date)}><span>{new Date(r.date+'T12:00:00+08:00').toLocaleDateString('en-GB',{timeZone:'Asia/Kuala_Lumpur',weekday:'short'})}</span><b>{r.max_temp}°</b></button>)}</div>
   <div className="weather-periods">{[['Morning','morning_forecast'],['Afternoon','afternoon_forecast'],['Night','night_forecast']].map(([label,k])=>{const I=iconFor(row[k]);return <div key={k}><span>{label}</span><I size={24}/><small>{describe(row[k])}</small></div>;})}</div>
  </>:<div className="weather-empty">{feed.loading?'Loading forecast…':feed.error||'No upcoming forecast published.'}</div>}
  {feed.error&&row&&<p className="feed-error">Saved forecast · {feed.error}</p>}
  <details className="weather-bulletins"><summary>{warnings.loading&&!warnings.retrieved?'Checking warnings…':warnings.error?'Warning update unavailable':warnings.rows.length?warnings.rows.length+' regional bulletin'+(warnings.rows.length===1?'':'s'):'No active regional warnings'}</summary>
   {warnings.error&&<p className="feed-error">{warnings.error}</p>}
   {warnings.rows.map((r,i)=><article key={r.heading_en+i}><strong>{/sea|wind/i.test(r.heading_en)?'Marine / wind bulletin · ':''}{r.heading_en||r.heading_bm}</strong><p>{r.text_en||r.text_bm}</p><small>Valid until {String(r.valid_to).replace('T',' ')} · MYT</small></article>)}
   {!warnings.loading&&!warnings.error&&!warnings.rows.length&&<p>No active Sepang or Selangor bulletin in the latest response.</p>}
   <small>Regional bulletins may cover coastal areas away from the circuit.</small>
  </details>
  <p className="source-note">Daily district forecast · {feed.retrieved?dateMY(new Date(feed.retrieved)):'awaiting update'} · refreshes every 5 min</p>
 </div>;
}
