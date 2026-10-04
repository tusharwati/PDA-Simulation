/* quiz.js
   Quiz mode. */
/* ---------- quiz ---------- */
const QZ=[['What memory structure does a PDA add to a finite automaton?',['Queue','Stack','Tape','Counter register'],1,'A PDA uses a stack, giving it unbounded last-in, first-out memory.'],
['Which class of languages do PDAs recognize?',['Regular','Context-free','Context-sensitive','Decidable'],1,'PDAs and context-free grammars are equivalent in power.'],
['Why can a DFA not recognize aⁿbⁿ?',['It has no accepting state','It has finite memory and cannot count unboundedly','It cannot read b','It is nondeterministic'],1,'A DFA has finitely many states, so it cannot remember an arbitrary n.'],
['What is an ε-transition in a PDA?',['A move that reads input but not the stack','A move that may consume no input symbol','A move to the initial state','A rejecting move'],1,'An ε-move changes state and possibly the stack without consuming input.'],
['When does a PDA accept by empty stack?',['Input consumed and stack empty','Stack empty at any time','Input consumed and in a final state','Never'],0,'With empty-stack acceptance, F is irrelevant: input is consumed and the stack is empty.']];
let qi=0,qs=0,qa=false;
function qdraw(){const b=$('#qbox');if(qi>=QZ.length){b.innerHTML=`<h3>Done</h3><p>Score: ${qs} / ${QZ.length}</p><button onclick="qi=0;qs=0;qdraw()">Restart</button>`;return}
 const q=QZ[qi];qa=false;b.innerHTML=`<h3>Question ${qi+1} of ${QZ.length}</h3><p>${q[0]}</p><div class="row" style="flex-direction:column;align-items:stretch">${q[1].map((o,i)=>`<button data-q="${i}" style="text-align:left">${o}</button>`).join('')}</div><div id="qf"></div>`;
 b.querySelectorAll('[data-q]').forEach(x=>x.onclick=()=>{if(qa)return;qa=true;const ok=+x.dataset.q===q[2];if(ok)qs++;$('#qf').innerHTML=`<p class="${ok?'acc':'rej'}"><b>${ok?'✓ Correct':'✕ Not quite'}</b> ${q[3]}</p><button onclick="qi++;qdraw()">Next</button>`})}
qdraw();
