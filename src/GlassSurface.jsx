import React,{useEffect,useRef,useState} from 'react';
import LiquidGlass from 'liquid-glass-react';
export default function GlassSurface({children,className='',...props}){
 const ref=useRef(null),[size,setSize]=useState({width:0,height:0});
 useEffect(()=>{const observer=new ResizeObserver(([entry])=>{const box=entry.borderBoxSize?.[0];const width=(box?.inlineSize??ref.current.offsetWidth)-2,height=(box?.blockSize??ref.current.offsetHeight)-2;setSize(old=>old.width===width&&old.height===height?old:{width,height});});observer.observe(ref.current);return()=>observer.disconnect();},[]);
 return <div ref={ref} className={'glass-surface '+className} {...props}><div className="glass-layer" aria-hidden="true">{size.width>0&&<LiquidGlass displacementScale={18} blurAmount={.12} saturation={115} aberrationIntensity={.5} elasticity={0} cornerRadius={24} padding="0px" style={{position:'absolute',top:'50%',left:'50%'}}><span style={{display:'block',width:size.width,height:size.height}}/></LiquidGlass>}</div><div className="glass-content">{children}</div></div>;
}
