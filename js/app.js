
/* app.js
   App wiring: simulation controls, event handlers, drag, save/load, startup. Loaded last. */
/* ---------- simulation control ---------- */
function reset(){clearInterval(timer);timer=null;res=null;path=[];idx=0;$('#bPlay').textContent='▶ Run'}
function ensure(){
 if(res)return true;const v=validate();
 if(v.e.length){toast('Cannot run: '+v.e[0]);draw();return false}
 res=run(M,$('#inp').value,+$('#max').value||5000);path=res.path;idx=0;
 const bad=[...res.input].filter(c=>!alph().in.includes(c));if(bad.length)toast(`Symbol ${bad[0]} is not read by any transition`);
 return true}
function step(){if(!ensure())return;if(idx<path.length-1)idx++;else stopPlay();draw()}
function back(){if(!ensure())return;if(idx>0)idx--;draw()}
function stopPlay(){clearInterval(timer);timer=null;$('#bPlay').textContent='▶ Run'}
function play(){if(timer){stopPlay();return}if(!ensure())return;if(idx>=path.length-1)idx=0;$('#bPlay').textContent='⏸ Pause';timer=setInterval(step,+$('#spd').value);draw()}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-t]');if(b){document.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===b));['sim','play','quiz','theory'].forEach(t=>$('#'+t).classList.toggle('hide',t!==b.dataset.t))}
 const r=e.target.closest('#trace tr');if(r){stopPlay();idx=+r.dataset.k;draw()}
 const n=e.target.closest('[data-n]');if(n){const c=nodes[+n.dataset.n],p=[];for(let x=c;x;x=x.par)p.unshift(x);path=p;idx=p.length-1;stopPlay();draw()}
 const a=e.target.closest('[data-a]');if(a){const t=M.trans[+a.dataset.i];if(a.dataset.a==='del')commit(()=>M.trans.splice(+a.dataset.i,1));else{$('#dlgc').innerHTML=`<h3>Explain this transition</h3><p class="mono">${t.f} —${eps(t.r)},${eps(t.p)}→${eps(t.w)}→ ${t.t}</p><p>${t.r?`When the PDA reads <b>${t.r}</b>`:'Without reading any input (ε-move)'}${t.p?` and the top of the stack is <b>${t.p}</b>`:' (any stack top)'}, it moves from ${t.f} to ${t.t}. ${t.p?`It pops ${t.p}`:'It pops nothing'}${t.w?` and pushes <b>${t.w}</b> (${t.w[0]} ends up on top)`:''}. ${t.p&&t.w===t.p?'Net effect: the stack is unchanged.':t.p&&!t.w?'Net effect: one symbol is removed.':t.w.length>t.p.length?`Net effect: the stack grows by ${t.w.length-t.p.length}.`:''}</p>`;dlg.showModal()}}});
$('#bPlay').onclick=play;$('#bStep').onclick=()=>{stopPlay();step()};$('#bBack').onclick=()=>{stopPlay();back()};
$('#bStop').onclick=()=>{reset();draw()};$('#bEnd').onclick=()=>{stopPlay();if(ensure()){idx=path.length-1;draw()}};
$('#inp').oninput=()=>{reset();draw()};$('#spd').onchange=()=>{if(timer){stopPlay();play()}};
$('#exs').onchange=e=>load(e.target.value);
$('#mode').onchange=e=>commit(()=>M.mode=e.target.value);
$('#addS').onclick=()=>commit(()=>{let k=0;while(M.states.some(s=>s.id==='q'+k))k++;M.states.push({id:'q'+k,x:100+(M.states.length%6)*120,y:80+Math.floor(M.states.length/6)*120});if(!M.init)M.init='q'+k;sel='q'+k});
$('#setI').onclick=()=>sel&&commit(()=>M.init=sel);
$('#setF').onclick=()=>sel&&commit(()=>{M.finals=M.finals.includes(sel)?M.finals.filter(x=>x!==sel):[...M.finals,sel]});
$('#delS').onclick=()=>sel&&commit(()=>{M.states=M.states.filter(s=>s.id!==sel);M.trans=M.trans.filter(t=>t.f!==sel&&t.t!==sel);M.finals=M.finals.filter(x=>x!==sel);if(M.init===sel)M.init=M.states[0]?.id||'';sel=null});
$('#addT').onclick=()=>{if(!M.states.length)return toast('Add a state first');const t={f:$('#tf').value,t:$('#tt').value,r:$('#tr').value.trim(),p:$('#tp').value.trim(),w:$('#tw').value.trim()};
 if(M.trans.some(x=>x.f===t.f&&x.t===t.t&&x.r===t.r&&x.p===t.p&&x.w===t.w))return toast('That transition already exists');commit(()=>M.trans.push(t))};
$('#undo').onclick=undo;$('#redo').onclick=redo;
$('#theme').onclick=()=>{const r=document.documentElement,d=getComputedStyle(r).getPropertyValue('--bg').trim()==='#0e1513';r.dataset.theme=d?'light':'dark'};
function doSave(){try{localStorage.setItem('pdalab',JSON.stringify(M));toast('Saved')}catch(e){toast('Saving is not available here')}}
$('#save').onclick=doSave;
$('#load').onclick=()=>{$('#dlgc').innerHTML=`<h3>Import / export JSON</h3><textarea id="js" rows="9" style="width:100%" class="mono"></textarea><p class="row"><button id="jl">Load from text</button><button id="jr">Restore last save</button></p>`;dlg.showModal();$('#js').value=JSON.stringify(M,null,1);
 $('#jl').onclick=()=>{try{const m=JSON.parse($('#js').value);if(!m.states||!m.trans)throw 0;commit(()=>M=m);dlg.close()}catch(e){toast('Invalid PDA JSON')}};
 $('#jr').onclick=()=>{try{const s=localStorage.getItem('pdalab');if(!s)return toast('Nothing saved yet');commit(()=>M=JSON.parse(s));dlg.close()}catch(e){toast('Could not read saved PDA')}}};
$('#help').onclick=()=>{$('#dlgc').innerHTML='<h3>Shortcuts</h3><p class="mono">Space run/pause<br>N next step · B back<br>R reset<br>Ctrl+S save<br>Ctrl+Z undo · Ctrl+Y redo</p>';dlg.showModal()};
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase();
 if(e.ctrlKey||e.metaKey){if(k==='z'){e.preventDefault();undo()}if(k==='y'){e.preventDefault();redo()}if(k==='s'){e.preventDefault();doSave()}return}
 if(k===' '&&e.target.tagName!=='BUTTON'){e.preventDefault();play()}if(k==='n'){stopPlay();step()}if(k==='b'){stopPlay();back()}if(k==='r'){reset();draw()}});
/* drag */
let drag=null;const g=$('#g');
g.addEventListener('pointerdown',e=>{const n=e.target.closest('.node');if(!n)return;sel=n.dataset.id;drag={id:sel,moved:0};g.setPointerCapture(e.pointerId);draw()});
g.addEventListener('pointermove',e=>{if(!drag)return;const p=g.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(g.getScreenCTM().inverse()),s=M.states.find(x=>x.id===drag.id);
 if(!drag.moved){hist.push(JSON.stringify(M));fut=[]}drag.moved=1;s.x=Math.max(30,Math.min(770,q.x));s.y=Math.max(30,Math.min(390,q.y));draw()});
g.addEventListener('pointerup',()=>drag=null);

$('#exs').innerHTML=Object.entries(EX).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join('');
load('anbn');
