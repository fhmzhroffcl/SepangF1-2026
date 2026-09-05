export const STANDINGS_URL='https://api.jolpi.ca/ergast/f1/2026/driverstandings/';
export const CONSTRUCTORS_URL='https://api.jolpi.ca/ergast/f1/2026/constructorstandings/';
export const SNAPSHOT={checked:'2026-09-05',round:'12',drivers:[
 ['1','12','ANT','Andrea Kimi','Antonelli','Italian','mercedes','Mercedes','242','6'],
 ['2','63','RUS','George','Russell','British','mercedes','Mercedes','183','2'],
 ['3','44','HAM','Lewis','Hamilton','British','ferrari','Ferrari','183','1'],
 ['4','1','NOR','Lando','Norris','British','mclaren','McLaren','159','2'],
 ['5','16','LEC','Charles','Leclerc','Monegasque','ferrari','Ferrari','155','1'],
 ['6','3','VER','Max','Verstappen','Dutch','red_bull','Red Bull','112','0'],
 ['7','81','PIA','Oscar','Piastri','Australian','mclaren','McLaren','104','0'],
 ['8','6','HAD','Isack','Hadjar','French','red_bull','Red Bull','68','0'],
 ['9','30','LAW','Liam','Lawson','New Zealander','red_bull','Red Bull','49','0'],
 ['10','10','GAS','Pierre','Gasly','French','alpine','Alpine F1 Team','44','0'],
 ['11','41','LIN','Arvid','Lindblad','British','rb','RB F1 Team','23','0'],
 ['12','43','COL','Franco','Colapinto','Argentine','alpine','Alpine F1 Team','19','0'],
 ['13','87','BEA','Oliver','Bearman','British','haas','Haas F1 Team','18','0'],
 ['14','5','BOR','Gabriel','Bortoleto','Brazilian','audi','Audi','10','0'],
 ['15','27','HUL','Nico','Hülkenberg','German','audi','Audi','6','0'],
 ['16','55','SAI','Carlos','Sainz','Spanish','williams','Williams','6','0'],
 ['17','23','ALB','Alexander','Albon','Thai','williams','Williams','5','0'],
 ['18','31','OCO','Esteban','Ocon','French','haas','Haas F1 Team','3','0'],
 ['19','14','ALO','Fernando','Alonso','Spanish','aston_martin','Aston Martin','3','0'],
 ['20','22','TSU','Yuki','Tsunoda','Japanese','rb','RB F1 Team','0','0'],
 ['21','18','STR','Lance','Stroll','Canadian','aston_martin','Aston Martin','0','0'],
 ['22','77','BOT','Valtteri','Bottas','Finnish','cadillac','Cadillac F1 Team','0','0'],
 ['23','11','PER','Sergio','Pérez','Mexican','cadillac','Cadillac F1 Team','0','0']
].map(([position,number,code,given,family,nationality,teamId,team,points,wins])=>({position,number,code,given,family,nationality,teamId,team,points,wins})),constructors:[
 ['1','mercedes','Mercedes','425','8'],['2','ferrari','Ferrari','338','2'],['3','mclaren','McLaren','263','2'],['4','red_bull','Red Bull','186','0'],['5','rb','RB F1 Team','66','0'],['6','alpine','Alpine F1 Team','63','0'],['7','haas','Haas F1 Team','21','0'],['8','audi','Audi','16','0'],['9','williams','Williams','11','0'],['10','aston_martin','Aston Martin','3','0'],['11','cadillac','Cadillac F1 Team','0','0']
].map(([position,teamId,team,points,wins])=>({position,teamId,team,points,wins}))};

export const TEAM_COLORS={mercedes:'#00d2be',ferrari:'#ff1e32',mclaren:'#ff8700',red_bull:'#3671c6',rb:'#6692ff',alpine:'#ff87bc',haas:'#d8d8d8',audi:'#f00',williams:'#64c4ff',aston_martin:'#229971',cadillac:'#c7a675'};

export function driversFromApi(json){
 const list=json?.MRData?.StandingsTable?.StandingsLists?.[0];
 if(!list?.DriverStandings?.length)throw new Error('Standings response was empty.');
 return {round:list.round,rows:list.DriverStandings.map(s=>{const d=s.Driver,c=s.Constructors.at(-1);return {id:d.driverId,born:d.dateOfBirth,position:s.position,number:d.permanentNumber||'—',code:d.code,given:d.givenName,family:d.familyName,nationality:d.nationality,teamId:c?.constructorId,team:c?.name||'Not supplied',points:s.points,wins:s.wins};})};
}
export function constructorsFromApi(json){
 const list=json?.MRData?.StandingsTable?.StandingsLists?.[0];
 if(!list?.ConstructorStandings?.length)throw new Error('Constructor standings response was empty.');
 return {round:list.round,rows:list.ConstructorStandings.map(s=>({position:s.position,teamId:s.Constructor.constructorId,team:s.Constructor.name,points:s.points,wins:s.wins}))};
}
