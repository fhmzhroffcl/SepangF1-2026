import {drawTicket} from './ticketDrawing';
export const CARD_WIDTH=1080;
export const CARD_HEIGHT=1350;
export const FINISHES={prism:'Prismatic foil',team:'Team glow',chrome:'Midnight chrome'};
export const MODE_TITLES={going:"I’M GOING",online:'WATCHING ONLINE',prediction:'MY PREDICTION'};
const TAU=Math.PI*2;
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function type(ctx,value,x,y,size,max,color='#f4f7fb',weight=700){
 ctx.fillStyle=color;ctx.font=`${weight} ${size}px Arial, sans-serif`;
 while(ctx.measureText(value).width>max&&size>12){size--;ctx.font=`${weight} ${size}px Arial, sans-serif`;}
 ctx.fillText(value,x,y);
}
function glow(ctx,x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(36,36,1008,1278);}
export function cardInitials(name){return Array.from(name.trim().split(/\s+/).filter(Boolean).map(x=>Array.from(x)[0]).join('')).slice(0,2).join('').toUpperCase()||'S';}

// Shared by the live preview, high-resolution PNG and every frame of the GIF.
// All movement is periodic over one phase; the foreground never moves.
export function drawCard(ctx,settings,phase=0,photo=null){
 if(settings.kind==='pass'||settings.mode==='prediction'){drawTicket(ctx,settings,phase,photo);return;}
 const {name='',teamName,mode='going',finish='prism',driver={},picks={},names={}}=settings;
 const rawColor=settings.teamColor||'#ff263e',teamColor=rawColor.length===4?'#'+[...rawColor.slice(1)].map(c=>c+c).join(''):rawColor;
 const W=ctx.canvas.width,H=ctx.canvas.height,t=phase*TAU;
 ctx.save();ctx.setTransform(W/CARD_WIDTH,0,0,H/CARD_HEIGHT,0,0);
 ctx.clearRect(0,0,CARD_WIDTH,CARD_HEIGHT);ctx.fillStyle='#060910';ctx.fillRect(0,0,1080,1350);
 const edgeColor=mode==='online'?'#41e6a6':'#ff253f';
 const colours=finish==='team'?[teamColor,'#effaff',teamColor,'#3c478c',teamColor]:finish==='chrome'?['#667da2','#e0f9ff','#8168ac','#1d334a','#c7ddff']:['#54e4ed','#b090ff',teamColor,'#ffe2a4','#54e4ed'];
 colours.splice(0,colours.length,edgeColor,mode==='online'?'#c7ffe6':'#ffc184',edgeColor,edgeColor,edgeColor);
 const rim=ctx.createConicGradient?ctx.createConicGradient(t,540,675):ctx.createLinearGradient(0,0,1080,1350);
 colours.forEach((c,i)=>rim.addColorStop(i/(colours.length-1),c));ctx.fillStyle=rim;round(ctx,16,16,1048,1318,44);ctx.fill();
 ctx.fillStyle='#0a101c';round(ctx,30,30,1020,1290,32);ctx.fill();
 ctx.save();round(ctx,36,36,1008,1278,28);ctx.clip();
 glow(ctx,160+Math.cos(t)*160,320+Math.sin(t)*190,720,teamColor+'70');
 glow(ctx,840+Math.sin(t)*160,530+Math.cos(t)*250,620,finish==='team'?'#6372c55c':'#7853f68a');
 glow(ctx,470+Math.cos(t+2)*320,1100+Math.sin(t+2)*180,590,finish==='chrome'?'#91bedd60':'#25cfcf50');
 ctx.restore();
 type(ctx,'SEPANG',65,116,64,365);type(ctx,'26',399,116,64,130,teamColor);
 type(ctx,'FAN COLLECTIBLE',688,81,21,330,'#c9d6e6');
 type(ctx,'02–04 OCT 2026',688,119,28,330);
 type(ctx,'BAHRAIN GRAND PRIX IN MALAYSIA',67,158,20,890,'#b8c9dd');

 // The foil window sits behind the stationary portrait and lettering.
 ctx.save();round(ctx,58,190,964,530,20);ctx.clip();
 const art=ctx.createLinearGradient(80+Math.cos(t)*150,190,890,810+Math.sin(t)*120);
 art.addColorStop(0,teamColor+'a8');art.addColorStop(.45,'#172846');art.addColorStop(1,finish==='team'?teamColor+'80':'#40385c');ctx.fillStyle=art;ctx.fillRect(58,190,964,530);
 glow(ctx,720+Math.cos(t)*170,380+Math.sin(t)*120,440,colours[0]+'a0');
 ctx.strokeStyle='#ffffff0c';ctx.lineWidth=2;
 for(let x=-550;x<1400;x+=42){ctx.beginPath();ctx.moveTo(x,190);ctx.lineTo(x+510,720);ctx.stroke();}
 const sx=540+Math.sin(t)*570,shine=ctx.createLinearGradient(sx-190,0,sx+190,0);
 shine.addColorStop(0,'#ffffff00');shine.addColorStop(.5,'#efffff36');shine.addColorStop(1,'#ffffff00');ctx.fillStyle=shine;ctx.fillRect(58,190,964,530);
 if(photo){const pw=photo.naturalWidth||photo.width,ph=photo.naturalHeight||photo.height,scale=ph/pw>2?610/pw:Math.min(640/pw,550/ph);ctx.drawImage(photo,1022-pw*scale,ph/pw>2?205:728-ph*scale,pw*scale,ph*scale);}
 const shade=ctx.createLinearGradient(58,0,770,0);shade.addColorStop(0,'#070e24e8');shade.addColorStop(.5,'#071225b0');shade.addColorStop(1,'#07122500');ctx.fillStyle=shade;ctx.fillRect(58,190,964,530);
 const bottom=ctx.createLinearGradient(0,590,0,730);bottom.addColorStop(0,'#070d1800');bottom.addColorStop(1,'#070d18e0');ctx.fillStyle=bottom;ctx.fillRect(58,590,964,140);
 type(ctx,'BACKING',90,248,19,350,'#c3d0e3');
 type(ctx,'#'+(driver.number||'—'),83,434,160,430,'#f0f7ff');
 type(ctx,driver.given||'YOUR DRIVER',90,487,28,410,'#c7d7ee');
 type(ctx,(driver.family||'SEPANG').toUpperCase(),86,548,60,465);
 ctx.fillStyle='#07101fcc';round(ctx,90,594,84,84,16);ctx.fill();ctx.strokeStyle=teamColor;ctx.lineWidth=2;ctx.stroke();
 ctx.textAlign='center';type(ctx,cardInitials(name),132,650,38,70);ctx.textAlign='left';
 type(ctx,'2026 / FAN EDITION',193,630,19,480,'#b6c8df');
 type(ctx,MODE_TITLES[mode],193,664,26,500);
 ctx.restore();
 ctx.strokeStyle='#e8f6ff55';ctx.lineWidth=1;round(ctx,58,190,964,530,20);ctx.stroke();

 type(ctx,'THE FAN BEHIND THE FLAG',66,767,19,900,'#a8bbd3');
 type(ctx,name.trim().toUpperCase()||'YOUR NAME',64,822,54,950);
 type(ctx,(teamName||'YOUR TEAM').toUpperCase()+' SUPPORTER',66,866,25,950,teamColor);
 ctx.fillStyle='#070d19e8';round(ctx,58,898,964,294,20);ctx.fill();ctx.strokeStyle='#a2c5eb30';ctx.stroke();
 if(mode==='prediction'){
  type(ctx,'MY SEPANG PICKS',88,939,22,900,'#b7c8dd');
  ['p1','p2','p3'].forEach((key,i)=>{const x=89+i*310;type(ctx,'P'+(i+1),x,983,20,280,teamColor);type(ctx,names[picks[key]]||'Choose driver',x,1022,28,280);});
  ctx.fillStyle='#afc8e72b';ctx.fillRect(88,1044,904,1);
  type(ctx,'POLE WINNER',89,1078,17,410,'#a8bbd3');type(ctx,names[picks.pole]||'Choose driver',89,1115,27,422);
  type(ctx,'FASTEST LAP',560,1078,17,415,'#a8bbd3');type(ctx,names[picks.fastest]||'Choose driver',560,1115,27,425);
  type(ctx,'SAFETY CAR  '+(picks.safety||'—').toUpperCase()+'     /     RAIN  '+(picks.rain||'—').toUpperCase(),89,1164,22,900,'#d6e4f5');
 }else{
  type(ctx,mode==='going'?'SEE YOU AT SEPANG.':'EVERY LAP. WHEREVER I AM.',89,962,40,904);
  type(ctx,mode==='going'?'TRACKSIDE FOR THE RETURN':'MY RACE WEEKEND, MY WAY',89,1006,22,900,'#a8bbd3');
  type(ctx,'SUNDAY 4 OCT',89,1076,35,510);type(ctx,'15:00 MYT',697,1076,33,290,teamColor);
  type(ctx,'5.543 KM    /    15 TURNS    /    56 LAPS',89,1150,25,900,'#d6e4f5');
 }
 type(ctx,'SEPANG INTERNATIONAL CIRCUIT',65,1240,22,680,'#c6d6e9');
 type(ctx,settings.serial||'',65,1263,18,945,'#aac1df');
 type(ctx,'INDEPENDENT FAN EDITION',65,1283,17,550,'#92a9c8');
 type(ctx,'sepang-f1.vercel.app',690,1283,18,320,'#92a9c8');
 ctx.restore();
}
