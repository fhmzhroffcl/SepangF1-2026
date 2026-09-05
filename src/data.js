export const OFFICIAL='https://www.formula1.com/en/racing/2026/bahrain';
export const CIRCUIT='https://www.sepangcircuit.com/home';
export const ANNOUNCEMENT='https://www.formula1.com/en/latest/article/formula-1-and-fia-confirm-malaysia-will-join-2026-calendar-as-host-venue-for-bahrain-grand-prix.6lL7vjFEM2VVynRHvg1TCf';
export const TICKETS='https://www.formula1.com/en/latest/article/tickets-launched-for-2026-bahrain-grand-prix-in-malaysia.6ZRHjZRSy27CeInt4lgGax';
export const VERIFIED='2026-09-05';
// UTC times verified against the official F1 event page's JSON-LD and +08:00 session data.
export const sessions=[
 {name:'Practice 1',start:'2026-10-02T04:30:00Z',end:'2026-10-02T05:30:00Z'},
 {name:'Practice 2',start:'2026-10-02T08:00:00Z',end:'2026-10-02T09:00:00Z'},
 {name:'Practice 3',start:'2026-10-03T04:30:00Z',end:'2026-10-03T05:30:00Z'},
 {name:'Qualifying',start:'2026-10-03T08:00:00Z',end:'2026-10-03T09:00:00Z'},
 {name:'Race',start:'2026-10-04T07:00:00Z',end:'2026-10-04T09:00:00Z'}
];
export const dateMY=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
export const timeMY=d=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kuala_Lumpur',hour:'2-digit',minute:'2-digit'}).format(new Date(d));
export const FORECAST='https://api.data.gov.my/weather/forecast/?contains=Ds064%40location__location_id&limit=14';
export const WARNINGS='https://api.data.gov.my/weather/warning/?limit=100';
export function forecastRows(rows,today=dateMY()){
 if(!Array.isArray(rows))throw new Error('Unexpected government response');
 return rows.filter(r=>r.location?.location_id==='Ds064'&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&r.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
}
export function activeWarnings(rows,now=Date.now()){
 if(!Array.isArray(rows))throw new Error('Unexpected warning response');
 const ms=s=>Date.parse(/(Z|[+-]\d\d:\d\d)$/.test(s||'')?s:s+'+08:00');
 return rows.filter(r=>ms(r.valid_from)<=now&&ms(r.valid_to)>now&&/Sepang|Selangor/i.test([r.heading_en,r.text_en,r.heading_bm,r.text_bm].join(' ')));
}
const phrases={'Tiada hujan':'No rain','Hujan':'Rain','Hujan di beberapa tempat':'Scattered rain','Hujan di satu dua tempat':'Isolated rain','Ribut petir':'Thunderstorms','Ribut petir di beberapa tempat':'Scattered thunderstorms','Ribut petir di satu dua tempat':'Isolated thunderstorms','Berjerebu':'Hazy','Jerebu':'Haze'};
export const describe=s=>phrases[s]||s||'Not supplied';
