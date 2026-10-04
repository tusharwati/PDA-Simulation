/* validator.js
   Validation and diagnostics: errors, warnings, reachability, dead states, nondeterminism. */
/* ---------- validation ---------- */
function validate(){
 const e=[],w=[],S=M.states.map(s=>s.id);
 if(!S.includes(M.init))e.push('No initial state is set.');
 if(M.mode==='final'&&!M.finals.length)e.push('Final-state mode needs at least one accepting state.');
 M.trans.forEach(t=>{if(!S.includes(t.f)||!S.includes(t.t))e.push(`Transition ${t.f}→${t.t} uses an undefined state.`);if(t.r.length>1||t.p.length>1)e.push(`Transition ${t.f}→${t.t}: read and pop must be a single symbol or ε.`)});
 const sig=new Set(['Z']);M.trans.forEach(t=>[...t.p+t.w].forEach(c=>sig.add(c)));
 M.trans.forEach(t=>{if(t.p&&t.p!=='Z'&&!M.trans.some(u=>u.w.includes(t.p)))w.push(`Transition ${t.f}→${t.t} pops ${t.p}, which no transition pushes.`)});
 const reach=new Set([M.init]);let ch=1;while(ch){ch=0;M.trans.forEach(t=>{if(reach.has(t.f)&&!reach.has(t.t)){reach.add(t.t);ch=1}})}
 S.forEach(s=>{if(!reach.has(s))w.push(`State ${s} is unreachable. Check whether a transition leads to it.`)});
 const live=new Set(M.finals);ch=1;while(ch){ch=0;M.trans.forEach(t=>{if(live.has(t.t)&&!live.has(t.f)){live.add(t.f);ch=1}})}
 if(M.mode==='final')S.forEach(s=>{if(reach.has(s)&&!live.has(s))w.push(`State ${s} is a dead state: no path leads from it to an accepting state.`)});
 const seen={};M.trans.forEach(t=>{const k=[t.f,t.r,t.p].join('|');(seen[k]=seen[k]||[]).push(t)});
 Object.values(seen).forEach(a=>{if(a.length>1)w.push(`Nondeterminism at ${a[0].f} on (${eps(a[0].r)}, ${eps(a[0].p)}): ${a.length} choices.`)});
 return{e,w,reach,sig}}
const alph=()=>({in:[...new Set(M.trans.map(t=>t.r).filter(Boolean))],st:[...new Set(['Z',...M.trans.flatMap(t=>[...t.p+t.w])])]});
