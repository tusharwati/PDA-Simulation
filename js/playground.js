/* playground.js
   Language playground: batch testing and random test-string generation. */
/* ---------- playground ---------- */
function test(s){const r=run(M,s,+$('#max').value||5000);return{s,r,steps:r.path.length-1}}
function table(list){$('#ptab').innerHTML=list.map(x=>`<tr><td class="mono">${x.s||'ε'}</td><td class="${x.r.status==='accepted'?'acc':x.r.status==='rejected'?'rej':'und'}">${x.r.status==='accepted'?'✓ accepted':x.r.status==='rejected'?'✕ rejected':'? undecided'}</td><td>${x.steps}</td><td>${x.r.maxStack}</td></tr>`).join('')}
$('#testAll').onclick=()=>{const v=validate();if(v.e.length)return toast(v.e[0]);table($('#strs').value.split('\n').map(test))};
$('#gen').onclick=()=>{const v=validate();if(v.e.length)return toast(v.e[0]);const a=alph().in;if(!a.length)return toast('No input symbols');
 const L=['',a[0],...Array.from({length:18},()=>Array.from({length:1+Math.floor(Math.random()*8)},()=>a[Math.floor(Math.random()*a.length)]).join(''))];
 $('#strs').value=L.join('\n');table(L.map(test))};
