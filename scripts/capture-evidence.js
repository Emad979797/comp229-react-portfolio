import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { writeFile, mkdir } from 'node:fs/promises';
process.env.JWT_SECRET='disposable-test-secret-at-least-32-characters';
process.env.PORTFOLIO_OWNER_EMAIL='owner@example.com';
process.env.ALLOW_LAB_BULK_USER_DELETE='true';
process.env.NODE_ENV='test';
const {default:app}=await import('../server/express.js');
const db=await MongoMemoryServer.create();
const evidence=[];
let token;
function scrub(value) {
 if(Array.isArray(value)) return value.map(scrub);
 if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).filter(([k])=>!['password','token','tokenVersion'].includes(k)).map(([k,v])=>[k,scrub(v)]));
 return value;
}
async function call(group,method,path,body,auth=token) {
 let req=request(app)[method](path);
 if(auth)req=req.set('Authorization',`Bearer ${auth}`);
 if(body)req=req.send(body);
 const res=await req;
 evidence.push({group,method:method.toUpperCase(),path,status:res.status,request:scrub(body||{}),response:scrub(res.body)});
 if(res.status>=400)throw new Error(`${method} ${path}: ${res.status}`);
 return res.body;
}
try {
 await mongoose.connect(db.getUri(),{dbName:'Portfolio'});
 const account={name:'Owner Test',email:'owner@example.com',password:'Disposable-Test-2026'};
 await call('authentication','post','/api/users',account);
 token=(await call('authentication','post','/api/auth/signin',account)).token;
 for(const resource of ['contacts','projects','qualifications']) {
  const body={firstname:'API',lastname:'Demo',email:'demo@example.com',...(resource==='contacts'?{}:{title:'Disposable API Test',completion:'2026-10-15',description:'Fictional test record'})};
  const made=await call(resource,'post','/api/'+resource,body);
  await call(resource,'get','/api/'+resource);
  await call(resource,'get','/api/'+resource+'/'+made._id);
  await call(resource,'put','/api/'+resource+'/'+made._id,{firstname:'Updated Demo'});
  await call(resource,'delete','/api/'+resource+'/'+made._id);
  await call(resource,'delete','/api/'+resource);
 }
 const other={name:'Disposable User',email:'disposable@example.com',password:'Disposable-Test-2026'};
 const made=await call('users','post','/api/users',other);
 const otherSession=await call('authentication','post','/api/auth/signin',other);
 await call('users','get','/api/users');
 await call('users','get','/api/users/'+made._id);
 await call('users','put','/api/users/'+made._id,{name:'Updated User'},otherSession.token);
 await call('users','delete','/api/users/'+made._id,null,otherSession.token);
 await call('users','delete','/api/users');
 await mkdir('reports',{recursive:true});
 await writeFile('reports/api-evidence.json',JSON.stringify({runAt:new Date().toISOString(),database:'Disposable local MongoDB Portfolio',evidence},null,2));
 const safe=JSON.stringify(evidence).replaceAll('<','\\u003c');
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Portfolio API Test Evidence</title><style>body{font:15px system-ui;margin:30px;color:#182333}h1{font-size:27px}nav{display:flex;gap:10px}button{padding:10px 20px;background:#eef2f7;border:1px solid #aab7c7;border-radius:6px;cursor:pointer}main{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}article{border:1px solid #c5cedb;border-radius:7px;padding:14px}h2{font-size:15px;margin:0 0 10px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;margin:4px 0;max-height:164px;overflow:auto}.status{color:#146235}small{color:#4a5870}</style><h1>COMP229 Portfolio API Test Evidence</h1><p>Executed against Express with a disposable real MongoDB database named Portfolio. Credentials and JWTs are omitted.</p><nav>${['contacts','projects','qualifications','users'].map(x=>`<button onclick="show('${x}')">${x}</button>`).join('')}</nav><p id="summary"></p><main id="results"></main><script>const evidence=${safe};function show(group){document.querySelector('#summary').textContent=group+' — 6 of 6 requests succeeded';const root=document.querySelector('#results');root.replaceChildren();for(const row of evidence.filter(x=>x.group===group)){const a=document.createElement('article');const h=document.createElement('h2');h.textContent=row.method+' '+row.path;a.append(h);const s=document.createElement('strong');s.className='status';s.textContent='HTTP '+row.status+' · PASS';a.append(s);for(const [label,data] of [['Request',row.request],['Response',row.response]]){const text=document.createElement('small');text.textContent=label;a.append(document.createElement('br'),text);const p=document.createElement('pre');p.textContent=JSON.stringify(data,null,2);a.append(p);}root.append(a);}}show('contacts');</script></html>`;
 await writeFile('reports/api-evidence.html',html);
 console.log('Captured 24 successful CRUD responses. Evidence contains no passwords or JWTs.');
}finally{await mongoose.disconnect();await db.stop();}
