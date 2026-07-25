(function () {
  'use strict';
  const $ = id => document.getElementById(id), editor = $('labEditor');
  const key = 'python-lab-code-v2';
  const templates = {
    calculator: 'a = 12\nb = 4\nprint("加法:", a + b)\nprint("减法:", a - b)\nprint("乘法:", a * b)\nprint("除法:", a / b)',
    todo: 'todos = ["学一节 Python", "运行一次代码", "做两道题"]\nfor index, item in enumerate(todos, 1):\n    print(index, item)',
    guess: 'secret = 7\nguess = 5\nif guess == secret:\n    print("猜对了！")\nelif guess < secret:\n    print("再大一点")\nelse:\n    print("再小一点")',
    weather: 'temperature = 30\nif temperature >= 30:\n    print("天气较热，记得补水")\nelif temperature >= 20:\n    print("天气舒适")\nelse:\n    print("有点凉，带件外套")'
  };
  let worker, jobId = 0, codeSize = Number(localStorage.getItem('python-code-size') || 16), lastValue = editor.value;
  editor.value = localStorage.getItem(key) || editor.value;

  function lines() { $('lineNumbers').textContent = Array.from({ length: Math.max(1, editor.value.split('\n').length) }, (_, index) => index + 1).join('\n'); }
  function save() { localStorage.setItem(key, editor.value); lines(); trackTasks(); }
  function setSize(next) { codeSize = Math.min(22, Math.max(14, next)); editor.style.fontSize = `${codeSize}px`; $('lineNumbers').style.fontSize = `${codeSize}px`; localStorage.setItem('python-code-size', String(codeSize)); }
  function insert(text) { const start = editor.selectionStart, end = editor.selectionEnd; lastValue = editor.value; editor.setRangeText(text, start, end, 'end'); editor.focus(); save(); }
  function execute(code) {
    if (!worker) worker = new Worker('py-worker.js?v=20260725');
    return new Promise(resolve => { const id = ++jobId; const handler = event => { if (event.data.id !== id) return; worker.removeEventListener('message', handler); resolve(event.data); }; worker.addEventListener('message', handler); worker.postMessage({ id, code }); });
  }
  async function run() {
    const button = $('runCode'); button.disabled = true; $('labOutput').textContent = 'Python 正在运行...'; $('runtimeText').textContent = '正在加载浏览器 Python 引擎';
    const result = await execute(editor.value);
    $('labOutput').textContent = friendlyError(result.output || (result.ok ? '程序运行完成，没有输出。' : '运行失败，请检查代码。'));
    $('runtimeText').textContent = result.ok ? '运行成功，代码已自动保存在本机。' : '代码运行失败，错误信息已经翻译到结果区。';
    button.disabled = false; markTask('onboardTask3');
    if (result.ok) { localStorage.setItem('python-xp', String(Number(localStorage.getItem('python-xp') || 0) + 2)); $('shareProject').hidden = false; site.toast('运行成功！+2 XP', 'success'); }
  }
  function markTask(id) { const item = $(id); item.classList.add('done'); item.querySelector('b').textContent = '✓'; }
  function trackTasks() {
    if (!editor.value.includes('print("Hello")') && !editor.value.includes("print('Hello')")) markTask('onboardTask1');
    if (!editor.value.includes('5 + 3') && /\d+\s*[+\-*/]\s*\d+/.test(editor.value)) markTask('onboardTask2');
  }
  function friendlyError(text) {
    return String(text).replace('SyntaxError', '语法错误').replace('NameError', '名称错误').replace('IndentationError', '缩进错误');
  }

  editor.addEventListener('input', () => { lastValue = localStorage.getItem(key) || ''; save(); });
  $('runCode').onclick = run;
  $('resetCode').onclick = () => { lastValue = editor.value; editor.value = 'print("Hello")\n# 试着把 Hello 改成你的名字\nprint(5 + 3)'; save(); };
  $('clearOutput').onclick = () => $('labOutput').textContent = '';
  $('smallerCode').onclick = () => setSize(codeSize - 1); $('largerCode').onclick = () => setSize(codeSize + 1);
  $('undoCode').onclick = () => { const value = editor.value; editor.value = lastValue; lastValue = value; save(); };
  document.querySelectorAll('[data-insert]').forEach(button => button.onclick = () => insert(button.dataset.insert));
  document.querySelectorAll('[data-snippet]').forEach(button => button.onclick = () => { lastValue = editor.value; editor.value = button.dataset.snippet; save(); editor.focus(); });
  document.querySelectorAll('[data-project]').forEach(button => button.onclick = () => { lastValue = editor.value; editor.value = templates[button.dataset.project]; save(); editor.scrollIntoView({ behavior: 'smooth', block: 'center' }); site.toast('项目模板已放入编辑器'); });
  const shareButton = document.createElement('button');
  shareButton.id = 'shareProject'; shareButton.type = 'button'; shareButton.className = 'secondary wide'; shareButton.textContent = '分享我的 Python 作品'; shareButton.hidden = true;
  document.querySelector('.run-panel').insertBefore(shareButton, $('runtimeText'));
  shareButton.onclick = async () => {
    const shareData = { title: '我的 Python 作品', text: `我在“小菜鸟带你飞”完成了一个 Python 作品！\n\n${editor.value.slice(0, 240)}`, url: 'https://2002chen.github.io/lab.html' };
    if (navigator.share) { try { await navigator.share(shareData); return; } catch (error) { if (error.name === 'AbortError') return; } }
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); site.toast('作品分享文案已复制', 'success');
  };
  $('startExploring').onclick = () => { $('labOnboarding').classList.remove('open'); localStorage.setItem('python-lab-onboarded-v2', '1'); editor.focus(); };
  if (!localStorage.getItem('python-lab-onboarded-v2')) $('labOnboarding').classList.add('open');
  window.addEventListener('error', event => { if (event.message) $('runtimeText').textContent = friendlyError(event.message); });
  setSize(codeSize); lines(); trackTasks(); site.ready;
})();
