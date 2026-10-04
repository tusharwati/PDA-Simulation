/* visualizer.js
   Rendering: state diagram, input tape, stack, trace table, configuration tree, verdict/"Why?" panel. */
/* ---------- drawing ---------- */
function draw(){
 const v=validate(),cur=path[idx],input=$('#inp').value;
 const ids=M.states.map(s=>s.id),pos=Object.fromEntries(M.states.map(s=>[s.id,s]));
 ['#tf','#tt'].forEach(q=>{const o=$(q).value;$(q).innerHTML=ids.map(i=>`<option>${i}</option>`).join('');if(ids.includes(o))$(q).value=o});
 $('#mode').value=M.mode;
 const grp={};M.trans.forEach((t,i)=>{(grp[t.f+'>'+t.t]=grp[t.f+'>'+t.t]||[]).push({t,i})});
 let s='<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>';
 for(const[k,a]of Object.entries(grp)){const[f,t]=k.split('>'),A=pos[f],B=pos[t];if(!A||!B)continue;
  const act=cur&&cur.tr&&cur.tr.f===f&&cur.tr.t===t&&a.some(x=>x.t===cur.tr),allEps=a.every(x=>!x.t.r);
  const lab=a.map(x=>`${eps(x.t.r)},${eps(x.t.p)}→${eps(x.t.w)}`);let d,lx,ly;
  if(f===t){d=`M${A.x-14} ${A.y-21}C${A.x-45} ${A.y-85} ${A.x+45} ${A.y-85} ${A.x+14} ${A.y-21}`;lx=A.x;ly=A.y-70-(lab.length-1)*7}
  else{const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,px=-uy,py=ux,c=26;
   const sx=A.x+ux*24,sy=A.y+uy*24,ex=B.x-ux*28,ey=B.y-uy*28,cx=(A.x+B.x)/2+px*c*2,cy=(A.y+B.y)/2+py*c*2;
   d=`M${sx} ${sy}Q${cx} ${cy} ${ex} ${ey}`;lx=(sx+ex)/2+px*c;ly=(sy+ey)/2+py*c-(lab.length-1)*7}
  s+=`<g class="edge${act?' act':''}${allEps?' eps':''}"><path d="${d}" marker-end="url(#ar)"/>${lab.map((l,i)=>`<text x="${lx}" y="${ly+i*14}">${l}</text>`).join('')}</g>`}
 M.states.forEach(n=>{const c=cur&&cur.q===n.id,fin=M.finals.includes(n.id);
  s+=`<g class="node${c?' cur':''}${sel===n.id?' sel':''}" data-id="${n.id}" tabindex="0" role="button" aria-label="State ${n.id}${n.id===M.init?', initial':''}${fin?', accepting':''}${c?', current':''}">${n.id===M.init?`<path d="M${n.x-56} ${n.y}H${n.x-26}" stroke="currentColor" stroke-width="2" marker-end="url(#ar)"/>`:''}<circle cx="${n.x}" cy="${n.y}" r="24"/>${fin?`<circle cx="${n.x}" cy="${n.y}" r="19" style="cursor:grab"/>`:''}<text x="${n.x}" y="${n.y}">${n.id}</text></g>`});
 $('#g').innerHTML=s;
 $('#tcount').textContent=`(${M.trans.length})`;
 $('#tlist').innerHTML=M.trans.map((t,i)=>`<div class="row mono" style="justify-content:space-between"><span>${t.f} —${eps(t.r)},${eps(t.p)}→${eps(t.w)}→ ${t.t}</span><span><button data-i="${i}" data-a="info" title="Explain this transition" aria-label="Explain transition">ⓘ</button> <button data-i="${i}" data-a="del" aria-label="Delete transition">✕</button></span></div>`).join('')||'<span class="mut">No transitions yet.</span>';
 const al=alph();$('#props').innerHTML=`Σ = {${al.in.join(',')}}<br>Γ = {${al.st.join(',')}}<br>q₀ = ${M.init||'—'}<br>F = {${M.finals.join(',')}}<br>Z₀ = Z`;
 $('#selinfo').textContent=sel?`Selected: ${sel}`:'Click a state to select it. Drag to move.';
 /* tape */
 const i=cur?cur.i:0;
 $('#tape').innerHTML=[...input].map((c,k)=>`<div class="cell ${k<i?'done':k===i?'now':''}">${c}</div>`).join('')+`<div class="cell ${i>=input.length?'now':''}" title="end of input">⊣</div>`;
 $('#tapeinfo').textContent=`consumed "${input.slice(0,i)}" | next "${input[i]||'⊣'}" | remaining "${input.slice(i)||'ε'}"`;
 /* stack */
 const stk=cur?cur.s:'Z';$('#stack').innerHTML=[...stk].map(c=>`<div class="sym">${c}</div>`).join('')||'<span class="mut">empty</span>';
 if(cur&&cur.tr){const t=cur.tr,pr=cur.par.s;$('#stackop').innerHTML=`Before: ${pr||'ε'}<br>${t.p?'POP '+t.p:'no pop'}${t.w?', PUSH '+t.w:''}<br>After: ${stk||'ε'}`}else $('#stackop').textContent='Initial stack: Z';
 /* status */
 let st=`<div class="mono">State: <b>${cur?cur.q:M.init||'—'}</b><br>Step: ${idx} / ${Math.max(path.length-1,0)}</div>`;
 if(cur&&cur.tr)st+=`<p class="mono">${cur.tr.f} —${eps(cur.tr.r)},${eps(cur.tr.p)}→${eps(cur.tr.w)}→ ${cur.tr.t}</p>`;
 if(res&&idx===path.length-1)st+=verdict();else if(!res)st+='<p class="mut">Press Run or Step to start.</p>';
 $('#status').innerHTML=st;
 /* trace */
 $('#trace').innerHTML=path.slice(1).map((c,k)=>`<tr data-k="${k+1}" class="${k+1===idx?'cur':''}"><td>${k+1}</td><td>${c.par.q}</td><td>${eps(c.tr.r)}</td><td>${input.slice(c.par.i+(c.tr.r?1:0))||'ε'}</td><td class="mono">${c.par.s||'ε'}</td><td class="mono">${eps(c.tr.r)},${eps(c.tr.p)}→${eps(c.tr.w)}</td><td class="mono">${c.s||'ε'}</td></tr>`).join('');
 /* tree */
 nodes=[];$('#tree').innerHTML=res?`<ul class="tree">${tree(res.all[0],new Set(path),{n:0})}</ul>`:'<span class="mut">Run the PDA to see every explored branch.</span>';
 /* stats */
 if(res){const eC=path.filter(c=>c.tr&&!c.tr.r).length;$('#stats').innerHTML=`Result: ${res.status}<br>Input length: ${input.length}<br>Path length: ${path.length-1}<br>Max stack (path): ${res.maxStack}<br>ε-moves (path): ${eC}<br>Configs explored: ${res.explored}<br>Branch points: ${res.branches}<br>Time: ${res.ms.toFixed(1)} ms`}else $('#stats').innerHTML='<span class="mut">Run to see statistics.</span>';
 $('#diag').innerHTML=[...v.e.map(x=>`<p class="err">✕ ${x}</p>`),...v.w.map(x=>`<p class="warn">⚠ ${x}</p>`)].join('')||'<span class="ok acc">✓ No problems found.</span>'}
function tree(c,on,ctr){if(ctr.n>150)return'';ctr.n++;const id=nodes.push(c)-1,inp=res.input,leaf=!c.kids.length;
 const good=res.acc===c,cls=good?'good':leaf&&!on.has(c)?'dead':on.has(c)?'good':'';
 return`<li><span class="tn ${cls}" data-n="${id}">(${c.q}, ${inp.slice(c.i)||'ε'}, ${c.s||'ε'})${good?' ✓ ACCEPT':leaf&&!on.has(c)?' ✕':''}${c.tr?'':' (start)'}</span>${c.kids.length?`<ul>${c.kids.map(k=>tree(k,on,ctr)).join('')}</ul>`:''}</li>`}
function verdict(){const r=res,e=r.end,inp=r.input;
 if(r.status==='accepted')return`<p><span class="badge acc">✓ Accepted</span></p><ul><li>All ${inp.length} input symbols were consumed.</li><li>${M.mode==='final'?`The PDA is in accepting state ${e.q}.`:'The stack is empty.'}</li><li>Found by exploring ${r.explored} configurations (any accepting branch suffices).</li></ul>`;
 if(r.status==='undecided')return`<p><span class="badge und">? Undecided</span></p><p>The ${$('#max').value}-configuration limit (or stack-depth limit of 120) was hit before an accepting branch or exhaustion. This is not a rejection. Raise the limit to search further.</p>`;
 let why;const top=e.s[0];
 if(e.i===inp.length)why=M.mode==='final'?(M.finals.includes(e.q)?'':`Input is consumed but ${e.q} is not accepting, and no ε-move leads on.`):`Input is consumed but the stack still holds ${e.s||'ε'} (must be empty).`;
 else why=`No transition applies at step ${e.d}.`;
 let fix='';if(e.i<inp.length)fix=`<p><b>Possible fix:</b> add a transition from ${e.q} reading ${inp[e.i]} with stack top ${top||'ε'}, e.g. <span class="mono">${e.q} —${inp[e.i]},${top||''}→…</span> (not applied automatically).</p>`;
 else if(M.mode==='final'&&!M.finals.includes(e.q))fix=`<p><b>Possible fix:</b> add an ε-transition from ${e.q} to an accepting state, guarded by stack top ${top||'ε'}.</p>`;
 return`<p><span class="badge rej">✕ Rejected</span></p><p><b>Why?</b> All ${r.explored} reachable configurations were explored. The furthest branch stopped at step ${e.d}.</p><p class="mono">State ${e.q}<br>Next input: ${inp[e.i]||'⊣'}<br>Stack top: ${top||'ε'} (stack ${e.s||'ε'})</p><p>${why}</p>${fix}`}
