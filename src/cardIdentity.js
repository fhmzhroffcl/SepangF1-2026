// Device-local souvenir identities. No server, account or personal-data hashing.
const KEY='sepang26:v1:card-identities';
let fallback;
function registry(){
 try {const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.owner&&saved?.serials)return saved;}catch{}
 return fallback ||= {owner:crypto.randomUUID(),serials:{}};
}
function persist(value){fallback=value;try{localStorage.setItem(KEY,JSON.stringify(value));}catch{}}
export function createCardSerial(kind){
 const data=registry();
 const owner=data.owner.replaceAll('-','').slice(0,8).toUpperCase();
 const random=crypto.randomUUID().replaceAll('-','').slice(-16).toUpperCase();
 persist(data);
 return `SP26-${kind}-${owner}-${random}`;
}
export function getCardSerial(kind,key){
 const data=registry();
 if(!data.serials[key]){data.serials[key]=createCardSerial(kind);persist(data);}
 return data.serials[key];
}
