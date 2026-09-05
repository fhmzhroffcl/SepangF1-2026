const ink='#302218',paper='#f1dfb9';
function text(c,s,x,y,size,max=900,color=ink,bold=true){c.fillStyle=color;c.font=`${bold?700:400} ${size}px ${bold?'Arial':'Georgia'}`;while(c.measureText(s).width>max&&size>13){size--;c.font=`${bold?700:400} ${size}px ${bold?'Arial':'Georgia'}`;}c.fillText(s,x,y);}
function box(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
export function drawTicket(c,s,phase,photo){const t=phase*Math.PI*2,pred=s.mode==='prediction',accent=pred?'#9f3429':s.mode==='going'?'#ff394b':'#41e6a6';c.save();c.setTransform(c.canvas.width/1080,0,0,c.canvas.height/1350,0,0);c.fillStyle=pred?'#221e19':'#080d13';c.fillRect(0,0,1080,1350);c.shadowColor=accent;c.shadowBlur=22+12*Math.sin(t);c.fillStyle=pred?paper:'#15212a';box(c,30,30,1020,1290,25);c.fill();c.shadowBlur=0;c.strokeStyle=accent;c.lineWidth=4;c.stroke();
 const fg=pred?ink:'#f6f3e9',muted=pred?'#725e43':'#a5c1bd';
 for(let y=45;y<1300;y+=8){c.fillStyle=pred?'#60431a05':'#ffffff02';c.fillRect(48,y,984,1);}
 text(c,pred?'SEPANG PICTURE HOUSE':'SEPANG / SEASON PASS',70,98,26,940,accent);text(c,pred?'THE RACE IS YOUR CALL.':s.mode==='going'?'TRACKSIDE CLUB.':'SOFA GRAND PRIX.',66,172,57,940,fg);text(c,'02—04 OCTOBER 2026   /   MALAYSIA',70,218,23,940,muted);
 c.setLineDash([6,10]);c.strokeStyle=muted;c.lineWidth=2;c.beginPath();c.moveTo(30,255);c.lineTo(1050,255);c.stroke();c.setLineDash([]);
 if(pred){
  text(c,s.serial||'PREDICTION',70,304,20,660,muted);text(c,'STARRING YOUR PODIUM',70,367,40,900,fg);
  if(photo){c.save();box(c,726,290,265,337,8);c.clip();c.globalAlpha=.45;c.filter='grayscale(1) sepia(.7)';const w=photo.naturalWidth||photo.width,h=photo.naturalHeight||photo.height;c.drawImage(photo,710,285,310,h*310/w);c.restore();}
  ['p1','p2','p3'].forEach((k,i)=>{text(c,'0'+(i+1),70,442+i*87,52,100,accent);text(c,s.names?.[s.picks?.[k]]||'Choose your driver',190,433+i*87,33,520,fg);text(c,i===0?'THE WINNER':i===1?'SECOND PLACE':'THIRD PLACE',190,461+i*87,15,510,muted);});
  c.strokeStyle=muted;c.beginPath();c.moveTo(70,690);c.lineTo(1010,690);c.stroke();
  [['pole','POLE POSITION'],['fastest','FASTEST LAP']].forEach(([k,label],i)=>{text(c,label,70,743+i*103,19,850,muted);text(c,s.names?.[s.picks?.[k]]||'Choose your driver',70,788+i*103,36,940,fg);});
  text(c,'SAFETY CAR  '+(s.picks?.safety||'—').toUpperCase()+'     /     RAIN  '+(s.picks?.rain||'—').toUpperCase(),70,969,25,940,fg);
 }else{
  text(c,(s.name||'SEPANG FAN').toUpperCase(),70,333,48,940,fg);text(c,s.teamName+' SUPPORTER',70,379,25,940,s.teamColor||accent);
  text(c,'MY SIX RACE-DAY ESSENTIALS',70,450,24,940,muted);
  (s.checks||[]).forEach((item,i)=>{const y=507+i*62;c.strokeStyle=item.done?accent:muted;c.lineWidth=2;box(c,72,y-25,29,29,7);c.stroke();if(item.done){text(c,'✓',75,y,25,35,accent);}text(c,item.title,121,y,28,875,fg);});
  text(c,'MY SESSIONS',70,920,19,900,muted);text(c,s.sessionText||'Choose sessions to follow',70,959,25,940,fg);if(s.detail)text(c,s.detail,70,1008,23,940,muted);
 }
 const tear=1070;c.setLineDash([8,10]);c.strokeStyle=muted;c.beginPath();c.moveTo(30,tear);c.lineTo(1050,tear);c.stroke();c.setLineDash([]);c.fillStyle=pred?'#221e19':'#080d13';[30,1050].forEach(x=>{c.beginPath();c.arc(x,tear,25,0,Math.PI*2);c.fill();});
 text(c,pred?'KEEP THIS STUB. OWN YOUR PICKS.':'YOUR WEEKEND. READY TO GO.',70,1132,26,930,accent);text(c,'RACE · SUN 4 OCT · 15:00 MYT',70,1180,30,930,fg);
 for(let i=0;i<70;i++){c.fillStyle=fg;c.fillRect(72+i*6,1212,(i%3)+1,40);}
 text(c,s.serial||'',70,1290,18,940,muted);
 text(c,'FAN SOUVENIR',635,1230,22,370,muted);text(c,'NOT VALID FOR ADMISSION',635,1260,16,370,muted);c.restore();}
