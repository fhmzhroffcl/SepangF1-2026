import {useEffect,useRef,useState} from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import {fromLonLat} from 'ol/proj.js';
import 'ol/ol.css';
const center=[101.7381,2.7608];
export default function CircuitMap(){
 const target=useRef(null),map=useRef(null);const [status,setStatus]=useState('Loading map…');
 useEffect(()=>{const tiles=new OSM();tiles.on('tileloadend',()=>setStatus('Pan and zoom to explore the circuit.'));tiles.on('tileloaderror',()=>setStatus('Some map tiles are unavailable. Open the full map below.'));map.current=new Map({target:target.current,layers:[new TileLayer({source:tiles})],view:new View({center:fromLonLat(center),zoom:15})});return()=>{map.current?.setTarget(undefined);map.current?.dispose();};},[]);
 return <><div className="map" ref={target} tabIndex="0" aria-label="Interactive map of Sepang International Circuit"/><div className="map-tools"><button onClick={()=>map.current?.getView().animate({center:fromLonLat(center),zoom:15,duration:400})}>Re-centre on Sepang</button><a href="https://www.openstreetmap.org/#map=16/2.7608/101.7381" target="_blank" rel="noreferrer">Open full map ↗</a></div><p className="meta" role="status">{status}</p></>;
}
