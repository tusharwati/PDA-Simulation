/* pda-model.js
   PDA model: shared state, undo/redo history, and model factory.
   Loaded first; other scripts share these globals (M, hist, res, path, idx...). */
const $=s=>document.querySelector(s),eps=x=>x===''?'ε':x;
let M,hist=[],fut=[],sel=null,res=null,path=[],idx=0,timer=null,nodes=[];
const XS=[110,260,410,560,710];
function mk(states,init,finals,trans,mode){return{states:states.map((s,i)=>({id:s,x:XS[i%5]||100+i*90,y:i<5?210:340})),init,finals,trans:trans.map(t=>({f:t[0],t:t[1],r:t[2],p:t[3],w:t[4]})),mode:mode||'final'}}
function load(k){M=EX[k].m();$('#inp').value=EX[k].i;$('#exd').textContent=EX[k].d;hist=[];fut=[];sel=null;reset();draw()}
function commit(f){hist.push(JSON.stringify(M));if(hist.length>80)hist.shift();fut=[];f();reset();draw()}
function undo(){if(!hist.length)return;fut.push(JSON.stringify(M));M=JSON.parse(hist.pop());reset();draw()}
function redo(){if(!fut.length)return;hist.push(JSON.stringify(M));M=JSON.parse(fut.pop());reset();draw()}
function toast(m){const t=$('#toast');t.textContent=m;t.style.opacity=1;setTimeout(()=>t.style.opacity=0,1800)}
