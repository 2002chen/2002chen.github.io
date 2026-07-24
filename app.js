const STORAGE_KEY='python-lab-progress-v3';
const lessons=[
  {id:'hello',icon:'&#9889;',title:'你好，Python！',description:'认识 print()，向程序世界发送第一条信号。',concepts:['print()','字符串','程序输出'],knowledge:'<code>print()</code> 会把括号中的内容显示在终端。文本需要放在引号中。',mission:'输出完全一致的文字：你好，Python！',checklist:['使用 print()','包含“你好，Python！”','输出内容完全正确'],starter:'# 向 Python 世界发送第一条信号\nprint("你好，Python！")',solution:'print("你好，Python！")',hint:'文本要放在引号里：<code>print("...")</code>',reward:60,test:(code,out)=>[/print\s*\(/.test(code),/你好，Python！/.test(code),out.trim()==='你好，Python！']},
  {id:'variables',icon:'&#9670;',title:'变量能量舱',description:'用变量保存名字和等级，再组合输出一段自我介绍。',concepts:['变量','字符串','整数','f-string'],knowledge:'变量像有名字的容器。<code>name = "Nova"</code> 保存文本，<code>level = 1</code> 保存数字。',mission:'创建 name="Nova" 和 level=1，输出：Nova is level 1',checklist:['创建 name 变量','创建 level 变量','正确组合并输出'],starter:'name = "Nova"\nlevel = 1\n\n# 使用 f-string 输出自我介绍\nprint(f"{name} is level {level}")',solution:'name = "Nova"\nlevel = 1\nprint(f"{name} is level {level}")',hint:'f-string 写法：<code>f"{变量} text {变量}"</code>',reward:70,test:(code,out)=>[/name\s*=\s*["\']Nova["\']/.test(code),/level\s*=\s*1/.test(code),out.trim()==='Nova is level 1']},
  {id:'condition',icon:'&#9672;',title:'条件判断门',description:'让程序根据能量值做出不同决定。',concepts:['if','else','比较运算'],knowledge:'<code>if</code> 检查条件；条件成立运行缩进代码，否则进入 <code>else</code>。',mission:'energy=80。当能量大于等于 60 时输出 Launch，否则输出 Recharge。',checklist:['定义 energy=80','使用 if 和 else','输出 Launch'],starter:'energy = 80\n\nif energy >= 60:\n    print("Launch")\nelse:\n    print("Recharge")',solution:'energy = 80\nif energy >= 60:\n    print("Launch")\nelse:\n    print("Recharge")',hint:'比较“大于等于”使用 <code>&gt;=</code>，别忘记冒号和缩进。',reward:80,test:(code,out)=>[/energy\s*=\s*80/.test(code),/if\s+energy\s*>=\s*60\s*:/.test(code)&&/else\s*:/.test(code),out.trim()==='Launch']},
  {id:'loop',icon:'&#8635;',title:'循环推进器',description:'用循环重复任务，不再复制粘贴代码。',concepts:['for','range()','循环变量'],knowledge:'<code>range(1, 4)</code> 产生 1、2、3，<code>for</code> 会依次处理它们。',mission:'使用 for 和 range 输出 1、2、3，每个数字一行。',checklist:['使用 for 循环','使用 range(1, 4)','按顺序输出三行'],starter:'for number in range(1, 4):\n    print(number)',solution:'for number in range(1, 4):\n    print(number)',hint:'结构是 <code>for number in range(1, 4):</code>，下一行需要缩进。',reward:90,test:(code,out)=>[/for\s+\w+\s+in\s+range\s*\(/.test(code),/range\s*\(\s*1\s*,\s*4\s*\)/.test(code),out.trim()==='1\n2\n3']},
  {id:'function',icon:'&#9711;',title:'函数制造台',description:'封装可重复使用的逻辑，制造自己的工具。',concepts:['def','参数','return'],knowledge:'函数用 <code>def</code> 定义，通过参数接收数据，用 <code>return</code> 返回结果。',mission:'定义 double(number)，返回 number*2，并输出 double(6) 的结果。',checklist:['定义 double 函数','使用 return','输出 12'],starter:'def double(number):\n    return number * 2\n\nprint(double(6))',solution:'def double(number):\n    return number * 2\n\nprint(double(6))',hint:'函数第一行：<code>def double(number):</code>，return 需要缩进。',reward:100,test:(code,out)=>[/def\s+double\s*\(\s*number\s*\)\s*:/.test(code),/return\s+number\s*\*\s*2/.test(code),out.trim()==='12']},
  {id:'project',icon:'&#9733;',title:'终极任务：猜数字',description:'综合变量、条件和输入，完成第一个小游戏核心。',concepts:['input()','int()','条件分支'],knowledge:'<code>input()</code> 获取文字输入，<code>int()</code> 把数字文字转换为整数。自动测试会输入 7。',mission:'secret=7，读取 guess；猜中输出 Correct!，否则输出 Try again。',checklist:['定义 secret=7','读取并转换 guess','正确判断并输出'],starter:'secret = 7\nguess = int(input())\n\nif guess == secret:\n    print("Correct!")\nelse:\n    print("Try again")',solution:'secret = 7\nguess = int(input())\nif guess == secret:\n    print("Correct!")\nelse:\n    print("Try again")',hint:'自动测试输入是 7。使用 <code>guess == secret</code> 判断是否相等。',reward:130,input:'7',test:(code,out)=>[/secret\s*=\s*7/.test(code),/int\s*\(\s*input\s*\(/.test(code),out.trim()==='Correct!']}
];

const quizBank={
beginner:[
['Python 入门','Python 是什么类型的语言？',['只适合制作网页的语言','一种易学、用途广泛的编程语言','只能进行数学计算的软件','一种操作系统'],1,'Python 是一门通用编程语言，常用于自动化、数据分析、网站开发和人工智能。'],
['程序输出','在 Python 中，哪个函数用于显示内容？',['show()','write()','print()','display_text()'],2,'print() 是 Python 最基础的输出函数。'],
['字符串','下列哪个写法表示一个字符串？',['Python','"Python"','123','True'],1,'字符串文本需要放在单引号或双引号中。'],
['变量','执行 age = 12 后，age 是什么？',['函数','变量','注释','文件'],1,'等号把右侧的值保存到左侧变量中。'],
['数字类型','下列哪个值是整数？',['3.14','"8"','8','False'],2,'没有小数点且没有引号的 8 是整数 int。'],
['注释','Python 单行注释通常以什么开头？',['//','#','<!--','*'],1,'井号 # 后面的内容通常作为注释，不会被执行。'],
['布尔值','哪个是 Python 的布尔值？',['YES','true','True','正确'],2,'Python 布尔值写作 True 和 False，首字母必须大写。'],
['运算符','计算 3 + 2 的结果是什么？',['5','32','1','6'],0,'加号用于数值相加，因此结果是 5。'],
['输入','哪个函数可以接收用户输入？',['input()','print()','readfile()','ask_user()'],0,'input() 会等待用户输入并返回字符串。'],
['类型转换','int("12") 的结果是什么？',['字符串 "12"','整数 12','小数 12.0','报错'],1,'int() 可以把符合格式的数字字符串转换为整数。'],
['命名规则','哪个变量名是有效的？',['2name','user-name','user_name','class'],2,'变量名不能以数字开头，不能包含减号，也不应使用关键字。'],
['运行顺序','Python 程序通常按什么顺序执行？',['从下往上','随机执行','从上往下','只执行最后一行'],2,'普通 Python 代码默认从上到下依次执行。']
],
basic:[
['比较运算','判断两个值是否相等应使用哪个运算符？',['=','==','!=','>='],1,'单个等号用于赋值，双等号 == 用于判断是否相等。'],
['条件语句','if 语句结尾通常需要什么符号？',['分号 ;','句号 .','冒号 :','逗号 ,'],2,'Python 的 if、for、while、def 等语句头通常以冒号结尾。'],
['逻辑运算','两个条件都必须成立时使用什么？',['or','and','not','in'],1,'and 表示左右两个条件都为 True。'],
['列表','哪个写法创建了列表？',['(1, 2, 3)','[1, 2, 3]','{1, 2, 3}','<1, 2, 3>'],1,'方括号 [] 用于创建列表。'],
['列表索引','items = ["a", "b", "c"]，items[0] 是什么？',['"a"','"b"','"c"','报错'],0,'Python 序列索引从 0 开始。'],
['字典','字典用什么保存数据？',['只有数字','键和值','固定顺序的字符','只能保存列表'],1,'字典由 key:value 键值对组成。'],
['循环','遍历列表通常使用哪种语句？',['if','for','try','def'],1,'for 循环适合逐个访问列表中的元素。'],
['range','list(range(3)) 的结果是什么？',['[1,2,3]','[0,1,2]','[0,1,2,3]','[3]'],1,'range(3) 从 0 开始，到 3 之前结束。'],
['while','while 循环会在什么时候继续？',['条件为 True 时','条件为 False 时','只运行一次','永远不会运行'],0,'while 会在条件保持 True 时重复执行。'],
['列表方法','向列表末尾添加元素使用什么？',['add()','push()','append()','insert_end()'],2,'list.append(value) 把一个元素加入列表末尾。'],
['字符串方法','"python".upper() 的结果是什么？',['"Python"','"PYTHON"','"python"','报错'],1,'upper() 会把英文字母转换为大写。'],
['切片','text="Python"，text[0:2] 是什么？',['"Py"','"Pyt"','"yt"','"Python"'],0,'切片包含起始位置，不包含结束位置，因此取得索引 0 和 1。']
],
advanced:[
['函数','定义函数使用哪个关键字？',['function','func','def','lambda_only'],2,'Python 使用 def 定义普通函数。'],
['返回值','函数通过什么关键字返回结果？',['print','return','yield_only','send'],1,'return 会结束函数并把结果返回给调用位置。'],
['参数','def greet(name): 中的 name 是什么？',['模块','参数','类','异常'],1,'name 是函数定义中的形式参数。'],
['作用域','函数内部创建的普通变量通常属于什么作用域？',['全局作用域','局部作用域','网络作用域','文件作用域'],1,'函数内部变量默认只在该函数的局部作用域可见。'],
['异常处理','捕获异常通常使用什么结构？',['if/else','try/except','for/in','class/def'],1,'try 放可能出错的代码，except 处理异常。'],
['文件操作','推荐用什么语句自动关闭文件？',['with open(...)','file.start(...)','try print(...)','import file'],0,'with 上下文管理器会在代码块结束后自动关闭文件。'],
['类','定义类使用哪个关键字？',['object','class','struct','new'],1,'Python 使用 class 关键字定义类。'],
['构造方法','类实例初始化常用哪个方法？',['__start__','__init__','__new_object__','init'],1,'__init__ 会在创建实例时被调用来初始化属性。'],
['继承','class Dog(Animal): 表示什么？',['Animal 继承 Dog','Dog 继承 Animal','Dog 是函数','创建两个变量'],1,'括号中的 Animal 是父类，Dog 是子类。'],
['推导式','哪个是有效的列表推导式？',['[x*2 for x in range(3)]','for x: [x*2]','list x*2 in range(3)','[range(3) => x]'],0,'列表推导式将表达式和循环写在一对方括号内。'],
['生成器','yield 主要用于创建什么？',['字典','生成器','异常','类属性'],1,'包含 yield 的函数会产生生成器，按需返回值。'],
['模块','导入 math 模块的正确写法是？',['include math','using math','import math','load(math)'],2,'import 关键字用于导入模块。']
]};

let state=loadState();
let selected=Math.min(state.current||0,lessons.length-1);
let worker=null,requestId=0,pending=new Map(),runtimeLoaded=false,isRunning=false;
let quizState=loadQuizState(),quizLevel='beginner',quizIndex=0,quizChoice=null,quizChecked=false,quizOrder={};
const $=id=>document.getElementById(id);

function loadState(){try{const saved={xp:0,runs:0,completed:[],code:{},current:0,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')};if(saved.code?.hello?.includes('Hello, Python!'))saved.code.hello=saved.code.hello.replaceAll('Hello, Python!','你好，Python！');return saved}catch{return{xp:0,runs:0,completed:[],code:{},current:0}}}
function loadQuizState(){try{return{answered:{},wrong:[],correct:0,streak:0,...JSON.parse(localStorage.getItem('python-lab-quiz-v1')||'{}')}}catch{return{answered:{},wrong:[],correct:0,streak:0}}}
function saveQuiz(){localStorage.setItem('python-lab-quiz-v1',JSON.stringify(quizState));window.dispatchEvent(new CustomEvent('learning-data-changed'))}
function quizId(level,index){return `${level}-${index}`}
function getQuizList(){if(quizLevel==='wrong')return quizState.wrong.map(id=>{const [level,index]=id.split('-');return{level,index:Number(index),question:quizBank[level]?.[Number(index)]}}).filter(x=>x.question);return (quizOrder[quizLevel]||quizBank[quizLevel].map((_,i)=>i)).map(index=>({level:quizLevel,index,question:quizBank[quizLevel][index]}))}
function levelLabel(level){return{beginner:'零基础',basic:'基础',advanced:'进阶',wrong:'错题本'}[level]}

function renderQuiz(){
  const list=getQuizList();document.querySelectorAll('.quiz-level').forEach(x=>x.classList.toggle('active',x.dataset.level===quizLevel));
  if(!list.length){$('quizLevelName').textContent=levelLabel(quizLevel);$('quizQuestionNumber').textContent='0';$('quizTotal').textContent='0';$('quizQuestion').textContent=quizLevel==='wrong'?'太棒了，错题本现在是空的！':'暂无题目';$('quizOptions').innerHTML='';$('quizExplanation').classList.remove('show');$('quizSubmit').disabled=true;$('quizNext').style.display='none';updateQuizSummary();return}
  quizIndex=Math.min(quizIndex,list.length-1);const item=list[quizIndex],q=item.question,id=quizId(item.level,item.index),saved=quizState.answered[id];quizChoice=saved?.choice??null;quizChecked=Boolean(saved);
  $('quizLevelName').textContent=levelLabel(quizLevel);$('quizQuestionNumber').textContent=quizIndex+1;$('quizTotal').textContent=list.length;$('quizMeter').style.width=`${((quizIndex+1)/list.length)*100}%`;$('quizTopic').textContent=q[0];$('quizQuestion').textContent=q[1];
  $('quizOptions').innerHTML=q[2].map((option,index)=>`<button class="quiz-option ${quizChoice===index?'selected':''} ${quizChecked&&index===q[3]?'correct':''} ${quizChecked&&quizChoice===index&&index!==q[3]?'wrong':''}" data-choice="${index}" type="button"><i>${String.fromCharCode(65+index)}</i><span>${option}</span></button>`).join('');
  document.querySelectorAll('.quiz-option').forEach(button=>button.onclick=()=>{if(quizChecked)return;quizChoice=Number(button.dataset.choice);document.querySelectorAll('.quiz-option').forEach(x=>x.classList.toggle('selected',x===button))});
  $('quizExplanation').classList.toggle('show',quizChecked);$('quizExplanation').querySelector('p').textContent=q[4];$('quizSubmit').disabled=quizChecked;$('quizSubmit').textContent=quizChecked?'已提交':'提交答案';$('quizNext').style.display=quizChecked?'block':'none';$('quizPrev').disabled=quizIndex===0;updateQuizSummary();
}

function updateQuizSummary(){
  ['beginner','basic','advanced'].forEach(level=>{const count=quizBank[level].filter((_,i)=>quizState.answered[quizId(level,i)]).length;$(`${level}Progress`).textContent=`${count}/${quizBank[level].length}`});$('wrongCount').textContent=quizState.wrong.length;
  const answered=Object.keys(quizState.answered).length;$('quizAnswered').textContent=answered;$('quizCorrect').textContent=quizState.correct;$('quizStreak').textContent=quizState.streak;$('quizScore').textContent=answered?Math.round(quizState.correct/answered*100):0;
}

function submitQuiz(){
  const list=getQuizList();if(!list.length)return;if(quizChoice===null){toast('请先选择一个答案');return}const item=list[quizIndex],q=item.question,id=quizId(item.level,item.index),correct=quizChoice===q[3];if(!quizState.answered[id]){quizState.answered[id]={choice:quizChoice,correct};if(correct){quizState.correct++;quizState.streak++;quizState.wrong=quizState.wrong.filter(x=>x!==id)}else{quizState.streak=0;if(!quizState.wrong.includes(id))quizState.wrong.push(id)}state.xp+=correct?10:2;save();saveQuiz();window.dynamicLearning?.saveAttempt(q,quizChoice,correct);toast(correct?'回答正确，+10 XP':'再接再厉，已加入错题本')}quizChecked=true;renderQuiz();
}

function changeQuizLevel(level){quizLevel=level;quizIndex=0;quizChoice=null;quizChecked=false;renderQuiz();$('quiz').scrollIntoView({behavior:'smooth'})}
function shuffleQuiz(){if(quizLevel==='wrong'){quizState.wrong.sort(()=>Math.random()-.5)}else{quizOrder[quizLevel]=quizBank[quizLevel].map((_,i)=>i).sort(()=>Math.random()-.5)}quizIndex=0;quizChoice=null;quizChecked=false;renderQuiz();toast('题目顺序已随机打乱')}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));updateStats();window.dispatchEvent(new CustomEvent('learning-data-changed'))}
function isUnlocked(index){return index===0||state.completed.includes(lessons[index-1].id)}
function currentLesson(){return lessons[selected]}
function level(){return Math.floor(state.xp/200)+1}
function escapeHtml(text){return text.replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]))}

function renderNav(){
  $('lessonNav').innerHTML=lessons.map((lesson,index)=>{const done=state.completed.includes(lesson.id),unlocked=isUnlocked(index);return `<button class="lesson-button ${index===selected?'active':''} ${done?'done':''} ${unlocked?'':'locked'}" data-index="${index}" type="button"><i>${done?'&#10003;':String(index+1).padStart(2,'0')}</i><div><h4>${lesson.title}</h4><p>${done?'已完成':unlocked?'可以开始':'请先完成上一关'}</p></div><span>${unlocked?'&#8594;':'&#128274;'}</span></button>`}).join('');
  document.querySelectorAll('.lesson-button').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.index);if(!isUnlocked(index)){toast('先完成上一关，才能解锁这个节点');return}selectLesson(index,false)});
}

function selectLesson(index,scroll=true){
  if(isRunning){toast('代码正在运行，请稍候');return}
  if(!isUnlocked(index)){toast('该关卡尚未解锁');return}
  selected=index;state.current=index;save();const lesson=currentLesson(),done=state.completed.includes(lesson.id);
  $('previewNumber').textContent=`任务 ${String(index+1).padStart(2,'0')}`;$('previewStatus').textContent=done?'已完成':'可开始';$('previewIcon').innerHTML=lesson.icon;$('previewTitle').textContent=lesson.title;$('previewDescription').textContent=lesson.description;$('previewConcepts').innerHTML=lesson.concepts.map(x=>`<span>${x}</span>`).join('');
  $('labTitle').textContent=lesson.title;$('missionLabel').textContent=`任务 ${String(index+1).padStart(2,'0')}`;$('missionTitle').textContent=lesson.mission;$('missionDescription').textContent=lesson.description;$('knowledgeText').innerHTML=lesson.knowledge;$('checklist').innerHTML=lesson.checklist.map(x=>`<li>${x}</li>`).join('');$('assistBox').classList.remove('show');$('assistBox').innerHTML='';
  $('codeEditor').value=state.code[lesson.id]??lesson.starter;updateLines();clearConsole();$('testSummary').textContent=`0 / ${lesson.checklist.length} 项测试`;$('lessonPosition').textContent=`第 ${index+1} 关 / 共 ${lessons.length} 关`;$('previousLesson').disabled=index===0;$('nextLesson').disabled=index===lessons.length-1||!isUnlocked(index+1);$('answerTitle').textContent=lesson.title;$('answerCode').textContent=lesson.solution;renderNav();
  if(scroll)$('lab').scrollIntoView({behavior:'smooth'});
}

function updateStats(){
  const completed=state.completed.length,percent=Math.round(completed/lessons.length*100),lv=level(),within=state.xp%200;
  $('progressLevel').textContent=lv;$('statRuns').textContent=state.runs;$('statLessons').textContent=`${completed} / ${lessons.length}`;$('statXp').textContent=`${state.xp} XP`;$('statPercent').textContent=`${percent}%`;$('progressXp').textContent=`${within} / 200 XP`;$('xpBar').style.width=`${within/2}%`;$('levelRing').style.background=`conic-gradient(var(--cyan) ${within*1.8}deg,#ffffff12 0)`;
  if(completed){$('achievementCard').classList.add('unlocked');$('badgeName').textContent=completed===lessons.length?'Python 小飞侠':'初次启航';$('badgeDescription').textContent=completed===lessons.length?'你已完成 Python 入门航线。':'你已完成第一关并点亮学习信号。'}
}

function initWorker(){
  if(worker)return;worker=new Worker('py-worker.js?v=20260724-2');setRuntime('loading','PYTHON 引擎：正在加载');worker.onmessage=event=>{const job=pending.get(event.data.id);if(!job)return;clearTimeout(job.timer);pending.delete(event.data.id);runtimeLoaded=true;setRuntime('ready','PYTHON 引擎：已就绪');job.resolve(event.data)};worker.onerror=error=>{setRuntime('error','PYTHON 引擎：加载失败');pending.forEach(job=>{clearTimeout(job.timer);job.reject(error)});pending.clear();worker=null;runtimeLoaded=false}
}
function setRuntime(cls,text){const el=$('runtimeStatus');el.className=`runtime ${cls}`;el.querySelector('span').textContent=text}
function execute(code){initWorker();return new Promise((resolve,reject)=>{const id=++requestId;const timer=setTimeout(()=>{pending.delete(id);worker?.terminate();worker=null;runtimeLoaded=false;setRuntime('error','PYTHON 引擎：运行超时');reject(new Error('运行超过 12 秒，请检查是否存在无限循环。'))},12000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,code})})}
window.pythonLabRuntime={execute};
function preparedCode(){const lesson=currentLesson();return lesson.input?`import builtins\n_inputs = iter([${JSON.stringify(lesson.input)}])\nbuiltins.input = lambda prompt='': next(_inputs)\n${$('codeEditor').value}`:$('codeEditor').value}

async function run(check){
  if(isRunning)return;const lesson=currentLesson(),lessonIndex=selected,code=$('codeEditor').value;isRunning=true;$('consoleOutput').className='console running';$('consoleOutput').textContent=runtimeLoaded?'> 正在运行 Python...':'> 首次加载 Python 引擎...\n> 请稍候，后续运行会更快。';disableRuns(true);
  try{const result=await execute(preparedCode());state.runs++;save();if(!result.ok){showOutput(result.output,'error');$('testSummary').textContent=`0 / ${lesson.checklist.length} 项测试`;return}showOutput(result.output||'（程序已结束，没有输出内容）','success');if(check){const tests=lesson.test(code,result.output||'');const passed=tests.filter(Boolean).length;$('testSummary').textContent=`${passed} / ${tests.length} 项测试`;if(passed===tests.length)completeLesson(lesson,lessonIndex);else{$('consoleOutput').textContent+=`\n\n检查结果：通过 ${passed}/${tests.length} 项。\n请对照左侧检查项修改后重试。`;$('consoleOutput').className='console error'}}else toast('代码运行成功')
  }catch(error){showOutput('Python 引擎运行失败，请检查网络或代码。\n'+error,'error')}finally{isRunning=false;disableRuns(false)}
}
function disableRuns(value){$('runOnly').disabled=value;$('runTests').disabled=value;$('resetCode').disabled=value;$('previousLesson').disabled=value||selected===0;$('nextLesson').disabled=value||selected===lessons.length-1||!isUnlocked(selected+1)}
function showOutput(text,type){$('consoleOutput').textContent=`> ${text}`;$('consoleOutput').className=`console ${type}`}
function completeLesson(lesson,lessonIndex){const fresh=!state.completed.includes(lesson.id);if(fresh){state.completed.push(lesson.id);state.xp+=lesson.reward;save();toast(`任务完成 // +${lesson.reward} XP`)}else toast('全部测试通过 // 本关已完成');$('consoleOutput').textContent+='\n\n✓ 全部测试通过\n任务完成！';$('consoleOutput').className='console success';renderNav();$('nextLesson').disabled=lessonIndex===lessons.length-1;if(fresh&&lessonIndex<lessons.length-1)setTimeout(()=>toast('下一关已解锁'),1000)}
function clearConsole(){$('consoleOutput').className='console';$('consoleOutput').innerHTML='<span>&gt; 点击“运行并检查”执行真实 Python 代码。</span>'}
function updateLines(){const count=$('codeEditor').value.split('\n').length;$('lineNumbers').textContent=Array.from({length:Math.max(1,count)},(_,i)=>i+1).join('\n')}
function toast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(el.timer);el.timer=setTimeout(()=>el.classList.remove('show'),2500)}
function showDialog(show){$('answerDialog').classList.toggle('open',show);$('answerDialog').setAttribute('aria-hidden',String(!show));document.body.style.overflow=show?'hidden':''}

$('openLesson').onclick=()=>{location.href='lab.html'};$('demoRun').onclick=()=>{const out=$('demoOutput');out.textContent='正在运行...';setTimeout(()=>{out.textContent='迪权、得喜、得军、得龙、得女、得得女，准备起飞！';toast('示例运行成功')},500)};$('runOnly').onclick=()=>run(false);$('runTests').onclick=()=>run(true);$('clearConsole').onclick=clearConsole;
$('showHint').onclick=()=>{const box=$('assistBox');box.innerHTML=`<b>提示 //</b><br>${currentLesson().hint}`;box.classList.toggle('show')};$('showAnswer').onclick=()=>showDialog(true);document.querySelectorAll('[data-close-dialog]').forEach(x=>x.onclick=()=>showDialog(false));$('useAnswer').onclick=()=>{$('codeEditor').value=currentLesson().solution;state.code[currentLesson().id]=$('codeEditor').value;save();updateLines();showDialog(false);toast('参考答案已放入编辑器')};
$('resetCode').onclick=()=>{$('codeEditor').value=currentLesson().starter;state.code[currentLesson().id]=$('codeEditor').value;save();updateLines();toast('代码已重置')};$('codeEditor').addEventListener('input',()=>{state.code[currentLesson().id]=$('codeEditor').value;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('dirtyState').textContent='正在保存...';clearTimeout($('dirtyState').timer);$('dirtyState').timer=setTimeout(()=>$('dirtyState').textContent='已保存',400);updateLines()});$('previousLesson').onclick=()=>selectLesson(selected-1,true);$('nextLesson').onclick=()=>selectLesson(selected+1,true);
$('resetProgress').onclick=()=>{if(confirm('确定清除所有关卡进度和代码吗？')){state={xp:0,runs:0,completed:[],code:{},current:0};save();selectLesson(0,false);toast('学习进度已重置')}};document.addEventListener('keydown',event=>{if(event.key==='Escape')showDialog(false);if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();run(true)}});

$('messageContent').addEventListener('input',()=>{$('messageCount').textContent=$('messageContent').value.length});
$('messageForm').addEventListener('submit',async event=>{event.preventDefault();const payload={name:$('messageName').value.trim(),type:$('messageType').value,title:$('messageTitle').value.trim(),content:$('messageContent').value.trim(),contact:$('messageContact').value.trim()};if(!payload.name||!payload.title||!payload.content){toast('请完整填写必填内容');return}try{await window.dynamicLearning.saveMessage(payload);$('messageForm').reset();$('messageCount').textContent='0';toast('留言已发送，管理员将在后台查看')}catch(error){toast(error.message||'留言发送失败')}});
document.querySelectorAll('.quiz-level').forEach(button=>button.onclick=()=>changeQuizLevel(button.dataset.level));
$('quizSubmit').onclick=submitQuiz;$('quizPrev').onclick=()=>{if(quizIndex>0){quizIndex--;quizChoice=null;quizChecked=false;renderQuiz()}};$('quizNext').onclick=()=>{const list=getQuizList();if(quizIndex<list.length-1){quizIndex++;quizChoice=null;quizChecked=false;renderQuiz()}else{toast('本组题目已完成，可以切换难度或随机重练')}};$('shuffleQuiz').onclick=shuffleQuiz;

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.reveal').forEach(x=>observer.observe(x));
function stars(){const c=$('stars'),ctx=c.getContext('2d');if(!ctx||matchMedia('(prefers-reduced-motion:reduce)').matches)return;let pts=[];function resize(){c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);pts=Array.from({length:Math.min(45,Math.floor(innerWidth/25))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:Math.random()*2+.8}))}function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);pts.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;ctx.fillStyle=['#5d7cff55','#ff6e9e55','#24c98a55','#ffbd2e55'][i%4];ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()});requestAnimationFrame(draw)}resize();draw();addEventListener('resize',resize,{passive:true})}stars();updateStats();selectLesson(selected,false);renderQuiz();
window.addEventListener('cloud-data-ready',()=>{state=loadState();quizState=loadQuizState();selected=Math.min(state.current||0,lessons.length-1);updateStats();selectLesson(selected,false);renderQuiz()});
