import React,{useEffect,useMemo,useState} from 'react';
import {RefreshCw,Star,ExternalLink} from 'lucide-react';
import {STANDINGS_URL,CONSTRUCTORS_URL,SNAPSHOT,TEAM_COLORS,driversFromApi,constructorsFromApi} from './standings';
import {TEAMS} from './teams';
import useFeed from './useFeed';
import useSaved from './useSaved';

const driverRows=j=>[driversFromApi(j)],teamRows=j=>[constructorsFromApi(j)];
const racesFromApi=j=>{
 const races=j?.MRData?.RaceTable?.Races;
 if(!Array.isArray(races))throw new Error('Race results were not supplied.');
 return races.filter(r=>r.Results?.length).sort((a,b)=>Number(a.round)-Number(b.round));
};
const stamp=iso=>new Date(iso).toLocaleString('en-GB',{timeZone:'Asia/Kuala_Lumpur',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' MYT';
const fullName=d=>d.given+' '+d.family;
const finish=r=>/^\d+$/.test(r?.positionText||'')?'P'+r.positionText:r?.positionText||'—';

function DriverForm({driver}){
 const feed=useFeed(`https://api.jolpi.ca/ergast/f1/2026/drivers/${encodeURIComponent(driver.id)}/results/?limit=100`,racesFromApi,1800000);
 return <div className="driver-form"><h4>Recent Grands Prix</h4>
  {feed.rows.length?<div className="form-strip">{feed.rows.slice(-6).map(r=><div key={r.round} title={r.Results[0].status}><small>R{r.round} · {r.Circuit.Location.locality}</small><b className={r.Results[0].position==='1'?'win':''}>{finish(r.Results[0])}</b><span>{r.Results[0].points} pts</span></div>)}</div>:<p>{feed.loading?'Loading race history…':feed.error||'No race results published yet.'}</p>}
  {feed.error&&feed.rows.length>0&&<p className="feed-error">Showing saved results. {feed.error}</p>}
  <small>Grand Prix finishes only · sprint points are included in championship totals.</small>
 </div>;
}

export default function Standings({onDrivers}){
 const df=useFeed(STANDINGS_URL,driverRows,1800000),cf=useFeed(CONSTRUCTORS_URL,teamRows,1800000);
 const rf=useFeed('https://api.jolpi.ca/ergast/f1/2026/last/results/',racesFromApi,300000);
 const [mode,setMode]=useState('drivers'),[expanded,setExpanded]=useState(false),[selected,setSelected]=useState('');
 const [followed,setFollowed,saved]=useSaved('favourites',[],v=>Array.isArray(v)&&v.every(x=>typeof x==='string'));
 const latest=rf.rows.at(-1),rawDrivers=df.rows[0]?.rows||SNAPSHOT.drivers,constructors=cf.rows[0]?.rows||SNAPSHOT.constructors;
 const drivers=useMemo(()=>rawDrivers.map(d=>{
  const r=latest?.Results.find(r=>r.Driver.code===d.code);
  return r?{...d,id:r.Driver.driverId,born:r.Driver.dateOfBirth,number:r.number,teamId:r.Constructor.constructorId,team:r.Constructor.name}:d;
 }),[rawDrivers,latest]);
 useEffect(()=>{onDrivers?.(drivers);},[drivers,onDrivers]);
 const round=df.rows[0]?.round||SNAPSHOT.round,leader=drivers[0],active=drivers.find(d=>d.code===selected)||leader;
 const team=TEAMS[active.teamId],picked=drivers.filter(d=>followed.includes(d.code));
 const toggle=code=>setFollowed(prev=>prev.includes(code)?prev.filter(x=>x!==code):[...prev,code]);
 const rows=mode==='drivers'?drivers:constructors,shown=expanded?rows:rows.slice(0,7);
 const source=mode==='drivers'?df:cf;
 const refresh=()=>{df.refresh();cf.refresh();rf.refresh();};
 return <section id="grid" className="standings-section">
  <div className="standings-head"><div><h2>Your race tracker.</h2><p>Follow drivers. Track the title fight. Catch up on the latest finish.</p></div><button className="outline-action" disabled={df.loading||cf.loading||rf.loading} onClick={refresh}><RefreshCw size={16}/>Refresh results</button></div>
  <div className="race-summary">
   <article style={{'--team':TEAM_COLORS[leader.teamId]}}><small>CHAMPIONSHIP LEADER · ROUND {round}</small><h3>{fullName(leader)}</h3><p><b>{leader.points}</b> points <span>+{Number(leader.points)-Number(drivers[1]?.points||0)} to P2</span></p><small>{df.retrieved?'Checked '+stamp(df.retrieved):'Saved snapshot · '+SNAPSHOT.checked}</small></article>
   <article style={{'--team':TEAM_COLORS[latest?.Results[0]?.Constructor.constructorId]||'#98a0a6'}}><small>LATEST PUBLISHED RACE WINNER</small>{latest?<><h3>{latest.Results[0].Driver.givenName} {latest.Results[0].Driver.familyName}</h3><p>{latest.raceName} · {new Date(latest.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</p><small>Race result · {rf.retrieved?'checked '+stamp(rf.retrieved):''}</small></>:<p>{rf.loading?'Loading latest result…':'Latest result unavailable.'}</p>}</article>
  </div>
  <div className="my-drivers"><div className="mini-heading"><h3>My drivers <span>{followed.length}</span></h3><span className="save-status">{saved?'Saved on this browser':'Saving unavailable on this browser'}</span></div>
   {picked.length?<div className="favourite-grid">{picked.map(d=>{const r=latest?.Results.find(r=>r.Driver.code===d.code);return <article key={d.code} style={{'--team':TEAM_COLORS[d.teamId]}}><button className="star-toggle" aria-label={`Unfollow ${fullName(d)}`} aria-pressed="true" onClick={()=>toggle(d.code)}><Star size={18} fill="currentColor"/></button><button className="driver-link" onClick={()=>setSelected(d.code)}>{fullName(d)}</button><p>P{d.position} · {d.points} points</p><small>{Number(d.points)===Number(leader.points)?'Level on points with the leader':Number(leader.points)-Number(d.points)+' points behind '+leader.family}</small><p className="last-result">{latest?latest.Circuit.Location.locality+': '+(r?finish(r)+' · '+r.points+' pts':'Did not enter'):'Race result loading'}</p></article>})}</div>:<p className="empty-follow"><Star size={19}/>Tap a star in the standings to build your personal watchlist.</p>}
  </div>
  <div className="standings-actions" aria-label="Championship view">{['drivers','constructors','results'].map(x=><button key={x} aria-pressed={mode===x} className={mode===x?'active':''} onClick={()=>{setMode(x);setExpanded(false)}}>{x==='results'?'Latest race':x}</button>)}</div>
  {mode!=='results'?<>
   <p className="data-caption">{source.loading?'Checking updates · ':''}After Round {source.rows[0]?.round||SNAPSHOT.round} · {source.retrieved?'checked '+stamp(source.retrieved):'snapshot '+SNAPSHOT.checked}{source.error?' · Update unavailable; showing last available standings.':''}</p>
   <div className="table-scroll"><table className="race-table"><caption className="sr-only">2026 {mode} championship standings</caption><thead><tr><th scope="col">Pos</th><th scope="col">{mode==='drivers'?'Driver':'Team'}</th><th scope="col">Points</th><th scope="col">Wins</th>{mode==='drivers'&&<th scope="col">Follow</th>}</tr></thead><tbody>{shown.map(r=><tr key={r.code||r.teamId} style={{'--team':TEAM_COLORS[r.teamId]}}><td>{r.position}</td><th scope="row">{mode==='drivers'?<button className="driver-link" onClick={()=>setSelected(r.code)} aria-pressed={active.code===r.code}>{fullName(r)}<small>#{r.number} · {TEAMS[r.teamId]?.name||r.team}</small></button>:<><strong>{TEAMS[r.teamId]?.name||r.team}</strong><small>{TEAMS[r.teamId]?.car} · {TEAMS[r.teamId]?.engine}</small></>}</th><td className="points-cell">{r.points}</td><td>{r.wins}</td>{mode==='drivers'&&<td><button className="star-toggle" aria-label={`${followed.includes(r.code)?'Unfollow':'Follow'} ${fullName(r)}`} aria-pressed={followed.includes(r.code)} onClick={()=>toggle(r.code)}><Star size={19} fill={followed.includes(r.code)?'currentColor':'none'}/></button></td>}</tr>)}</tbody></table></div>
   <button className="text-button" onClick={()=>setExpanded(v=>!v)}>{expanded?'Show leaders only':`View all ${rows.length} ${mode}`}</button>
  </>:<div className="latest-results">{latest?<><h3>{latest.raceName}</h3><p className="data-caption">Round {latest.round} · {latest.date} · {latest.Circuit.circuitName}</p><div className="podium">{latest.Results.slice(0,3).map(r=><article key={r.position} style={{'--team':TEAM_COLORS[r.Constructor.constructorId]}}><b>P{r.position}</b><strong>{r.Driver.givenName} {r.Driver.familyName}</strong><span>{r.points} points · {r.Time?.time||r.status}</span></article>)}</div><div className="table-scroll"><table className="race-table"><caption className="sr-only">{latest.raceName} results</caption><thead><tr><th>Pos</th><th>Driver</th><th>Grid</th><th>Points</th><th>Status</th></tr></thead><tbody>{(expanded?latest.Results:latest.Results.slice(0,10)).map(r=><tr key={r.Driver.code}><td>{r.positionText}</td><th scope="row">{r.Driver.givenName} {r.Driver.familyName}<small>{r.Constructor.name}</small></th><td>{r.grid==='0'?'Pit':r.grid}</td><td>{r.points}</td><td>{r.status}</td></tr>)}</tbody></table></div><button className="text-button" onClick={()=>setExpanded(v=>!v)}>{expanded?'Show top 10':'Show full classification'}</button></>:<p>{rf.loading?'Loading latest race…':rf.error||'No results published yet.'}</p>}{rf.error&&latest&&<p className="feed-error">Showing the saved race result. {rf.error}</p>}</div>}
  <div className="driver-detail" style={{'--team':TEAM_COLORS[active.teamId]}}>
   <div><span className="eyebrow">DRIVER FILE · #{active.number}</span><h3>{fullName(active)}</h3><p>{active.nationality}{active.born?' · Born '+new Date(active.born+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):''}</p><button className="outline-action" aria-pressed={followed.includes(active.code)} onClick={()=>toggle(active.code)}><Star size={16} fill={followed.includes(active.code)?'currentColor':'none'}/>{followed.includes(active.code)?'Following':'Follow driver'}</button></div>
   <div className="car-file"><small>2026 CAR · {team?.name||active.team}</small><h4>{team?.car||'Not supplied'}</h4><p>{team?.engine} power unit<br/>{team?.base}</p>{team&&<a href={`https://www.formula1.com/en/teams/${team.slug}`} target="_blank" rel="noreferrer">Car, team & official driver profiles <ExternalLink size={14}/></a>}<small>Team shown from latest published race when available. Car specifications checked 5 Sep 2026.</small></div>
   {active.id?<DriverForm key={active.id} driver={active}/>:<p className="data-caption">Connect to the results feed to load this driver’s race history.</p>}
  </div>
  <p className="source-note">Results refresh every 5 minutes; standings every 30 minutes while open. Latest published results, not lap-by-lap timing. <a href="https://www.formula1.com/en/results/2026/drivers" target="_blank" rel="noreferrer">Official standings ↗</a></p>
 </section>;
}
