/* pda-engine.js
   PDA engine: breadth-first search over configurations (state, input position, stack).
   Pure logic, no DOM access. */
/* ---------- ENGINE: breadth-first search over configurations ---------- */
function run(m,input,max){
 const key=c=>c.q+'|'+c.i+'|'+c.s,root={q:m.init,i:0,s:'Z',par:null,tr:null,d:0,kids:[]},seen=new Set([key(root)]),Q=[root],all=[root];
 const ok=c=>c.i===input.length&&(m.mode==='final'?m.finals.includes(c.q):c.s==='');
 let n=0,acc=null,limit=false,best=root,t0=performance.now();
 while(Q.length){const c=Q.shift();n++;
  if(ok(c)){acc=c;break}
  if(n>max){limit=true;break}
  if(c.i>best.i||(c.i===best.i&&c.d>best.d))best=c;
  for(const t of m.trans){
   if(t.f!==c.q||(t.r&&input[c.i]!==t.r)||(t.p&&c.s[0]!==t.p))continue;
   const s=t.w+c.s.slice(t.p.length);
   if(s.length>120){limit=true;continue}
   const k={q:t.t,i:c.i+(t.r?1:0),s,par:c,tr:t,d:c.d+1,kids:[]};
   if(seen.has(key(k)))continue;seen.add(key(k));c.kids.push(k);Q.push(k);all.push(k)}}
 const end=acc||best,p=[];for(let c=end;c;c=c.par)p.unshift(c);
 const status=acc?'accepted':limit?'undecided':'rejected';
 return{status,end,path:p,all,explored:n,input,ms:performance.now()-t0,acc,
  maxStack:Math.max(...p.map(c=>c.s.length)),branches:all.filter(c=>c.kids.length>1).length}}
