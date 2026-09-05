import React,{useEffect,useState} from 'react';
import {createUISFX} from 'uisfx';
let ui;
export function playSound(cue){try{if(localStorage.getItem('sepang26:sound')==='on'){ui ||= createUISFX({pack:'mechanical',volume:.25});ui.unlock().then(()=>ui.play(cue)).catch(()=>{});}}catch{}}
export default function SoundControl(){
 const [enabled,setEnabled]=useState(()=>{try{return localStorage.getItem('sepang26:sound')==='on';}catch{return false;}});
 useEffect(()=>{let last=0;const click=e=>{const el=e.target.closest('button,a,summary,input[type="checkbox"]');if(!el||el.disabled||el.closest('.sound-control')||Date.now()-last<100)return;last=Date.now();playSound(el.tagName==='SUMMARY'?'expand':el.type==='checkbox'?(el.checked?'check':'uncheck'):'select');};document.addEventListener('click',click);return()=>document.removeEventListener('click',click);},[]);
 return <button className="sound-control" aria-pressed={enabled} onClick={()=>{const next=!enabled;setEnabled(next);try{localStorage.setItem('sepang26:sound',next?'on':'off');}catch{}if(next)playSound('toggle-on');else ui?.stopAll();}}>Sound {enabled?'on':'off'}</button>;
}
