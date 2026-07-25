(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const fallback = [
    { id: 'guest-1', level: 'beginner', topic: 'Python 入门', question_text: 'Python 是什么类型的语言？', options: ['只适合制作网页的语言', '一种易学、用途广泛的编程语言', '只能进行数学计算的软件', '一种操作系统'], correct_index: 1, explanation: 'Python 是一门通用编程语言，常用于自动化、数据分析、网站开发和人工智能。', position: 1 },
    { id: 'guest-2', level: 'beginner', topic: '程序输出', question_text: '在 Python 中，哪个函数用于显示内容？', options: ['show()', 'write()', 'print()', 'display_text()'], correct_index: 2, explanation: 'print() 是 Python 最基础的输出函数，可以把文字和计算结果显示出来。', position: 2 },
    { id: 'guest-3', level: 'beginner', topic: '字符串', question_text: '下列哪个写法表示一段字符串？', options: ['Python', '"Python"', '123', 'True'], correct_index: 1, explanation: '字符串文本需要放在单引号或双引号中。', position: 3 },
    { id: 'guest-4', level: 'basic', topic: '条件判断', question_text: 'if 语句结尾通常需要什么符号？', options: ['分号', '句号', '冒号', '逗号'], correct_index: 2, explanation: 'Python 的 if、for、while 和 def 等语句头通常以冒号结尾。', position: 4 },
    { id: 'guest-5', level: 'advanced', topic: '异常处理', question_text: '捕获异常通常使用什么结构？', options: ['if/else', 'try/except', 'for/in', 'class/def'], correct_index: 1, explanation: 'try 放可能出错的代码，except 负责处理异常。', position: 5 }
  ];
  let all = [], filtered = [], index = 0, choice = null, checked = false, mode = 'practice', context = null, wrongIds = new Set(), debounce;
  const state = { answered: 0, correct: 0, streak: 0, wrongStreak: 0, xp: 0, examAnswers: new Map() };

  function readWrong() { try { return new Set(JSON.parse(localStorage.getItem('python-wrong-questions') || '[]').map(String)); } catch { return new Set(); } }
  function saveWrong() { localStorage.setItem('python-wrong-questions', JSON.stringify([...wrongIds])); }
  function levelText(value) { return { beginner: '零基础', basic: '基础', advanced: '进阶' }[value] || value; }
  function question() { return filtered[index] || null; }

  async function load() {
    context = await site.ready; wrongIds = readWrong();
    if (context.client && context.session) {
      const [questions, attempts] = await Promise.all([
        context.client.from('questions').select('*').eq('active', true).order('level').order('position').limit(3000),
        context.client.from('quiz_attempts').select('question_id,is_correct').eq('is_correct', false).limit(3000)
      ]);
      if (!questions.error && questions.data?.length) all = questions.data;
      (attempts.data || []).forEach(row => wrongIds.add(String(row.question_id)));
    }
    if (!all.length) all = fallback;
    $('cloudCount').textContent = all.length;
    const topics = [...new Set(all.map(row => row.topic))].sort();
    $('topicFilter').innerHTML = '<option value="">全部知识点</option>' + topics.map(topic => `<option value="${site.escapeHtml(topic)}">${site.escapeHtml(topic)}</option>`).join('');
    applyFilters();
  }

  function applyFilters() {
    const level = $('levelFilter').value, topic = $('topicFilter').value, term = $('questionSearch').value.trim().toLowerCase();
    filtered = all.filter((row, position) => (!level || row.level === level) && (!topic || row.topic === topic) && (!term || String(row.question_text).toLowerCase().includes(term) || String(row.topic).toLowerCase().includes(term) || String(row.position || position + 1) === term));
    if (mode === 'wrong') filtered = filtered.filter(row => wrongIds.has(String(row.id)));
    if (mode === 'exam') filtered = [...filtered].sort(() => Math.random() - .5).slice(0, 10);
    index = 0; choice = null; checked = false; render();
  }

  function render() {
    const row = question();
    $('questionCounter').textContent = `${row ? index + 1 : 0} / ${filtered.length}`;
    $('quizMeter').style.width = `${filtered.length ? (index + 1) / filtered.length * 100 : 0}%`;
    $('previousQuestion').disabled = index <= 0;
    $('nextQuestion').disabled = !row || index >= filtered.length - 1;
    $('questionFeedback').className = 'feedback';
    if (!row) {
      $('questionTopic').textContent = mode === 'wrong' ? '错题本' : '没有结果'; $('questionDifficulty').textContent = '';
      $('questionText').textContent = mode === 'wrong' ? '这里还没有错题。先去练习几道，薄弱点会自动收进来。' : '当前筛选条件下没有题目，请调整筛选。';
      $('questionOptions').innerHTML = ''; $('submitAnswer').disabled = true; return;
    }
    $('submitAnswer').disabled = checked && mode !== 'exam';
    $('submitAnswer').textContent = mode === 'exam' && index === filtered.length - 1 ? '交卷并查看结果' : checked ? '已提交' : '提交答案';
    $('questionTopic').textContent = row.topic; $('questionDifficulty').textContent = levelText(row.level); $('questionText').textContent = row.question_text;
    $('questionOptions').innerHTML = (row.options || []).map((option, optionIndex) => {
      const correct = checked && optionIndex === row.correct_index, wrong = checked && optionIndex === choice && choice !== row.correct_index;
      return `<button type="button" data-choice="${optionIndex}" class="${choice === optionIndex ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}"><i>${String.fromCharCode(65 + optionIndex)}</i><span>${site.escapeHtml(option)}</span></button>`;
    }).join('');
    document.querySelectorAll('[data-choice]').forEach(button => button.onclick = () => { if (checked && mode !== 'exam') return; choice = Number(button.dataset.choice); render(); });
    if (checked && mode !== 'exam') showFeedback(choice === row.correct_index);
    updateStats();
  }

  async function submit() {
    const row = question(); if (!row) return;
    if (choice === null) { site.toast('请先选择一个答案。'); return; }
    if (mode === 'exam') {
      state.examAnswers.set(String(row.id), choice);
      if (index < filtered.length - 1) { index++; choice = state.examAnswers.get(String(question().id)) ?? null; render(); return; }
      gradeExam(); return;
    }
    if (checked) return;
    checked = true;
    const correct = choice === row.correct_index;
    state.answered++;
    if (correct) {
      state.correct++; state.streak++; state.wrongStreak = 0; state.xp += 10; wrongIds.delete(String(row.id));
      if (state.streak % 5 === 0) { state.xp += 30; const pop = $('streakPop'); pop.classList.add('show'); setTimeout(() => pop.classList.remove('show'), 2000); }
    } else { state.streak = 0; state.wrongStreak++; wrongIds.add(String(row.id)); }
    saveWrong(); awardXp(correct ? 10 : 0);
    localStorage.setItem('python-local-attempts', String(Number(localStorage.getItem('python-local-attempts') || 0) + 1));
    if (correct) localStorage.setItem('python-local-correct', String(Number(localStorage.getItem('python-local-correct') || 0) + 1));
    render();
    if (context.session) await context.client.from('quiz_attempts').insert({ user_id: context.session.user.id, question_id: row.id, selected_index: choice, is_correct: correct });
  }

  function showFeedback(correct) {
    const row = question(), box = $('questionFeedback');
    box.className = `feedback show ${correct ? 'correct' : 'wrong'}`;
    $('feedbackTitle').textContent = correct ? '正确！+10 XP' : '不是这个哦，已经加入错题本';
    $('feedbackText').textContent = row.explanation || '结合正确答案，再检查一次题目中的关键词。';
    $('reviewLink').textContent = `相关知识点：${row.topic} →`;
    $('reviewLink').href = `tutorial.html?q=${encodeURIComponent(row.topic)}`;
    if (state.wrongStreak >= 3) $('feedbackText').textContent += ` 你已经连续 3 题未答对，建议先复习“${row.topic}”再继续。`;
  }

  function gradeExam() {
    let correct = 0;
    filtered.forEach(row => { if (state.examAnswers.get(String(row.id)) === row.correct_index) correct++; });
    state.answered += filtered.length; state.correct += correct; state.xp += correct * 10; awardXp(correct * 10);
    site.toast(`交卷完成：答对 ${correct}/${filtered.length} 题`, correct === filtered.length ? 'success' : '');
    mode = 'practice'; document.querySelectorAll('[data-mode]').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    filtered = all; index = 0; choice = null; checked = false; state.examAnswers.clear(); render();
  }
  function awardXp(amount) { if (!amount) return; localStorage.setItem('python-xp', String(Number(localStorage.getItem('python-xp') || 0) + amount)); }
  function updateStats() {
    const percent = state.answered ? Math.round(state.correct / state.answered * 100) : 0;
    $('answeredCount').textContent = state.answered; $('correctCount').textContent = state.correct; $('streakCount').textContent = state.streak; $('xpCount').textContent = state.xp; $('scorePercent').textContent = `${percent}%`; $('scoreRing').style.setProperty('--score', `${percent}%`);
  }
  function switchMode(next) {
    mode = next; state.examAnswers.clear();
    document.querySelectorAll('[data-mode]').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    $('modeHelp').textContent = { practice: '做一题看一题解析，没有时间限制。', exam: '随机抽取 10 题，交卷后统一查看成绩。', wrong: '只显示历史错题，集中攻克薄弱点。' }[mode];
    applyFilters();
  }

  async function loadDiscussions() {
    const row = question();
    if (!row || !context?.client || String(row.id).startsWith('guest-')) return;
    const { data, error } = await context.client.from('question_discussions').select('content,created_at').eq('question_id', row.id).order('created_at', { ascending: false }).limit(30);
    if (error) return;
    $('discussionList').innerHTML = (data || []).map(item => `<article><b>学习者</b><p>${site.escapeHtml(item.content)}</p><small>${new Date(item.created_at).toLocaleString('zh-CN')}</small></article>`).join('') || '<p class="empty-state">暂无讨论，欢迎分享第一条思路。</p>';
  }
  async function postDiscussion(event) {
    event.preventDefault();
    if (!site.requireAuth('登录后可以参与题目讨论。')) return;
    const row = question(), content = $('discussionContent').value.trim();
    if (!row || !content) return;
    const { error } = await context.client.from('question_discussions').insert({ question_id: row.id, user_id: context.session.user.id, content });
    if (error) { site.toast('讨论区尚未启用，管理员需要运行最新版数据库脚本。'); return; }
    $('discussionContent').value = ''; loadDiscussions(); site.toast('讨论已发布', 'success');
  }

  $('levelFilter').onchange = applyFilters; $('topicFilter').onchange = applyFilters;
  $('questionSearch').oninput = () => { clearTimeout(debounce); debounce = setTimeout(applyFilters, 300); };
  document.querySelectorAll('[data-mode]').forEach(button => button.onclick = () => switchMode(button.dataset.mode));
  $('submitAnswer').onclick = submit;
  $('nextQuestion').onclick = () => { if (index < filtered.length - 1) { index++; choice = mode === 'exam' ? state.examAnswers.get(String(question().id)) ?? null : null; checked = false; render(); } };
  $('previousQuestion').onclick = () => { if (index > 0) { index--; choice = mode === 'exam' ? state.examAnswers.get(String(question().id)) ?? null : null; checked = false; render(); } };
  $('randomQuestion').onclick = () => { if (filtered.length) { index = Math.floor(Math.random() * filtered.length); choice = null; checked = false; render(); } };
  $('discussion').ontoggle = () => { if ($('discussion').open) loadDiscussions(); };
  $('discussionForm').onsubmit = postDiscussion;
  let touchStart = 0;
  document.querySelector('.quiz-card').addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
  document.querySelector('.quiz-card').addEventListener('touchend', event => { const distance = event.changedTouches[0].clientX - touchStart; if (Math.abs(distance) < 70) return; (distance < 0 ? $('nextQuestion') : $('previousQuestion')).click(); }, { passive: true });
  load();
})();
