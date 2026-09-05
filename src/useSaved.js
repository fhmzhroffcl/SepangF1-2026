import {useEffect,useState} from 'react';
export default function useSaved(key,initial,validate=()=>true){
 const [value,setValue]=useState(()=>{try{const raw=JSON.parse(localStorage.getItem(`sepang26:v1:${key}`));return raw!==null&&validate(raw)?raw:initial;}catch{return initial;}});
 const [saved,setSaved]=useState(true);
 useEffect(()=>{try{localStorage.setItem(`sepang26:v1:${key}`,JSON.stringify(value));setSaved(true);}catch{setSaved(false);}},[key,value]);
 return [value,setValue,saved];
}
