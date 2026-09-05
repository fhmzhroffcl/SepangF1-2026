import {useSyncExternalStore} from 'react';
let fallback='going';
const key='sepang26:attendance';
function read(){try{return localStorage.getItem(key)||fallback;}catch{return fallback;}}
function listen(fn){window.addEventListener('sepang-attendance',fn);window.addEventListener('storage',fn);return()=>{window.removeEventListener('sepang-attendance',fn);window.removeEventListener('storage',fn);};}
export default function useAttendance(){const mode=useSyncExternalStore(listen,read,()=>fallback);const set=mode=>{if(!['going','online'].includes(mode))return;fallback=mode;try{localStorage.setItem(key,mode);}catch{}window.dispatchEvent(new Event('sepang-attendance'));};return [mode,set];}
