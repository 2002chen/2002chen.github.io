(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const sceneQs = window.SCENE_QUESTIONS || [];
  const fallback = [
    { id: 'guest-1', level: 'beginner', topic: 'Python 入门', question_text: 'Python 是什么类型的语言？', options: ['只适合制作网页的语言', '一种易学、用途广泛的编程语言', '只能进行数学计算的软件', '一种操作系统'], correct_index: 1, explanation: 'Python 是一门通用编程语言，常用于自动化、数据分析、网站开发和人工智能。', position: 1 },
    { id: 'guest-2', level: 'beginner', topic: '程序输出', question_text: '在 Python 中，哪个函数用于显示内容？', options: ['show()', 'write()', 'print()', 'display_text()'], correct_index: 2, explanation: 'print() 是 Python 最基础的输出函数，可以把文字和计算结果显示出来。', position: 2 },
    { id: 'guest-3', level: 'beginner', topic: '字符串', question_text: '下列哪个写法表示一段字符串？', options: ['Python', '"Python"', '123', 'True'], correct_index: 1, explanation: '字符串文本需要放在单引号或双引号中。', position: 3 },
    { id: 'guest-6', level: 'beginner', topic: '变量', question_text: '哪一行代码把数字 5 保存到变量 minutes？', options: ['minutes == 5', 'minutes = 5', 'print(minutes = 5)', '5 = minutes'], correct_index: 1, explanation: '单个等号用于赋值，把右侧的 5 保存到左侧变量 minutes。', position: 6 },
    { id: 'guest-7', level: 'beginner', topic: '整数', question_text: '下面哪个值是 Python 整数？', options: ['"12"', '12', '12.5', 'True'], correct_index: 1, explanation: '没有引号、没有小数点的 12 是整数。', position: 7 },
    { id: 'guest-8', level: 'beginner', topic: '注释', question_text: 'Python 单行注释通常以什么符号开始？', options: ['#', '//', '<!--', '*'], correct_index: 0, explanation: '# 后面的内容通常用于给人阅读，不会作为普通代码执行。', position: 8 },
    { id: 'guest-4', level: 'basic', topic: '条件判断', question_text: 'if 语句结尾通常需要什么符号？', options: ['分号', '句号', '冒号', '逗号'], correct_index: 2, explanation: 'Python 的 if、for、while 和 def 等语句头通常以冒号结尾。', position: 4 },
    { id: 'guest-9', level: 'basic', topic: '列表', question_text: '列表 colors = ["红", "绿", "蓝"] 中，colors[0] 是什么？', options: ['红', '绿', '蓝', '0'], correct_index: 0, explanation: 'Python 列表下标从 0 开始，所以 colors[0] 是第一项“红”。', position: 9 },
    { id: 'guest-10', level: 'basic', topic: '循环', question_text: 'for amount in expenses: 表示什么？', options: ['删除 expenses', '依次取出每一笔支出', '只处理第一笔', '创建一个函数'], correct_index: 1, explanation: 'for 会按顺序遍历列表，每轮把当前项目放进 amount。', position: 10 },
    { id: 'guest-11', level: 'basic', topic: '列表长度', question_text: 'len([12, 8, 15]) 的结果是多少？', options: ['3', '12', '15', '35'], correct_index: 0, explanation: 'len() 统计列表项目数量，这个列表有三项。', position: 11 },
    { id: 'guest-12', level: 'basic', topic: '字典', question_text: '字典主要使用什么组织数据？', options: ['键和值', '只有下标', '只有文字', '文件夹'], correct_index: 0, explanation: '字典使用 key:value，也就是键和值来组织数据。', position: 12 },
    { id: 'guest-13', level: 'basic', topic: '比较运算', question_text: '判断两个值是否相等通常使用哪个运算符？', options: ['=', '==', '!=', '>='], correct_index: 1, explanation: '== 用于比较是否相等，单个 = 用于赋值。', position: 13 },
    { id: 'guest-5', level: 'advanced', topic: '异常处理', question_text: '捕获异常通常使用什么结构？', options: ['if/else', 'try/except', 'for/in', 'class/def'], correct_index: 1, explanation: 'try 放可能出错的代码，except 负责处理异常。', position: 5 },
    { id: 'guest-14', level: 'advanced', topic: '函数', question_text: '函数使用 return 的主要作用是什么？', options: ['显示所有代码', '把结果交回调用位置', '创建循环', '捕获异常'], correct_index: 1, explanation: 'return 会结束函数并把结果返回给调用位置。', position: 14 },
    { id: 'guest-15', level: 'advanced', topic: '文件操作', question_text: '使用 with open(...) 的主要好处是什么？', options: ['自动管理文件关闭', '让文件永久只读', '自动删除文件', '不用指定文件名'], correct_index: 0, explanation: 'with 代码块结束后会自动关闭文件，更安全。', position: 15 },
    { id: 'guest-16', level: 'advanced', topic: '类与对象', question_text: 'class 在 Python 中通常用于什么？', options: ['定义一类对象的蓝图', '显示文字', '导入 JSON', '结束程序'], correct_index: 0, explanation: '类描述一类对象共有的属性和行为。', position: 16 },
    { id: 'guest-17', level: 'advanced', topic: 'JSON', question_text: 'JSON 最常见的用途是什么？', options: ['交换和保存结构化数据', '绘制图片', '安装 Python', '替代所有数据库'], correct_index: 0, explanation: 'JSON 是常见的结构化文本数据格式。', position: 17 },
    { id: 'guest-18', level: 'advanced', topic: '测试', question_text: '测试程序时，哪种做法最可靠？', options: ['只看代码长度', '使用已知预期结果的样例', '只问 AI 是否正确', '运行一次不报错即可'], correct_index: 1, explanation: '用已知答案的输入检查实际输出，才能验证程序行为。', position: 18 }
  ].concat(sceneQs.map((q, i) => ({
    id: q.id,
    level: 'beginner',
    topic: q.lesson_id || '场景练习',
    question_text: q.stem,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explain,
    position: 100 + i
  })));
  let all = [], filtered = [], index = 0, choice = null, checked = false, mode = 'practice', context = null, wrongIds = new Set(), debounce;
  const state = { answered: 0, correct: 0, streak: 0, wrongStreak: 0, xp: 0, examAnswers: new Map() };

  function readWrong() { try { return new Set(JSON.parse(localStorage.getItem('python-wrong-questions') || '[]').map(String)); } catch { return new Set(); } }
  function saveWrong() { localStorage.setItem('python-wrong-questions', JSON.stringify([...wrongIds])); }
  function levelText(value) { return { beginner: '零基础', basic: '基础', advanced: '进阶' }[value] || value; }
  function question() { return filtered[index] || null; }

  function normalizeLevel(value) {
    const key = String(value || '').trim().toLowerCase();
    return {
      beginner: 'beginner', easy: 'beginner', starter: 'beginner', '零基础': 'beginner', '入门': 'beginner',
      basic: 'basic', medium: 'basic', intermediate: 'basic', '基础': 'basic',
      advanced: 'advanced', hard: 'advanced', expert: 'advanced', '进阶': 'advanced'
    }[key] || key;
  }

  function mergeQuestionBanks(remoteQuestions) {
    const merged = new Map();
    [...fallback, ...(remoteQuestions || [])].forEach(row => {
      const normalized = { ...row, level: normalizeLevel(row.level) };
      merged.set(String(normalized.id), normalized);
    });
    return [...merged.values()].sort((a, b) => String(a.level).localeCompare(String(b.level)) || Number(a.position || 0) - Number(b.position || 0));
  }

  function refreshLevelOptions() {
    const counts = { beginner: 0, basic: 0, advanced: 0 };
    all.forEach(row => { if (counts[row.level] !== undefined) counts[row.level]++; });
    const selected = $('levelFilter').value;
    $('levelFilter').innerHTML = `<option value="">全部难度（${all.length}）</option>` + ['beginner', 'basic', 'advanced'].map(level => `<option value="${level}">${levelText(level)}（${counts[level]}）</option>`).join('');
    $('levelFilter').value = selected;
  }

  function refreshTopicOptions() {
    const level = $('levelFilter').value;
    const current = $('topicFilter').value;
    const topics = [...new Set(all.filter(row => !level || row.level === level).map(row => row.topic))].sort();
    $('topicFilter').innerHTML = '<option value="">全部知识点</option>' + topics.map(topic => `<option value="${site.escapeHtml(topic)}">${site.escapeHtml(topic)}</option>`).join('');
    $('topicFilter').value = topics.includes(current) ? current : '';
  }

  async function load() {
    context = await site.ready; wrongIds = readWrong();
    let remoteQuestions = [];
    if (context.client && context.session) {
      const [questions, attempts] = await Promise.all([
        context.client.from('questions').select('*').eq('active', true).order('level').order('position').limit(3000),
        context.client.from('quiz_attempts').select('question_id,is_correct').eq('is_correct', false).limit(3000)
      ]);
      if (!questions.error && questions.data?.length) remoteQuestions = questions.data;
      (attempts.data || []).forEach(row => wrongIds.add(String(row.question_id)));
    }
    all = mergeQuestionBanks(remoteQuestions);
    $('cloudCount').textContent = all.length;
    refreshLevelOptions();
    refreshTopicOptions();
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
    $('submitAnswer').textContent = mode === 'exam'
      ? (index === filtered.length - 1 ? '交卷并查看结果' : '保存并下一题')
      : (checked ? '已提交' : '提交答案');
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
      await gradeExam(); return;
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
    $('reviewLink').onclick = null;
    if (state.wrongStreak >= 3) $('feedbackText').textContent += ` 你已经连续 3 题未答对，建议先复习“${row.topic}”再继续。`;
  }

  function showExamResult(correct, total) {
    const box = $('questionFeedback');
    box.className = `feedback show ${correct === total ? 'correct' : 'wrong'}`;
    $('feedbackTitle').textContent = `考试完成：答对 ${correct}/${total} 题`;
    $('feedbackText').textContent = `本次获得 ${correct * 10} XP。答错或未作答的题目已经加入错题本。`;
    $('reviewLink').textContent = correct === total ? '继续练习 →' : '去错题本重做 →';
    $('reviewLink').href = '#';
    $('reviewLink').onclick = event => {
      event.preventDefault();
      if (correct === total) box.className = 'feedback';
      else switchMode('wrong');
    };
  }

  async function gradeExam() {
    const results = filtered.map(row => {
      const selected = state.examAnswers.get(String(row.id));
      return { row, selected, correct: selected === row.correct_index };
    });
    const total = results.length;
    const correct = results.filter(result => result.correct).length;
    results.forEach(result => {
      if (result.correct) wrongIds.delete(String(result.row.id));
      else wrongIds.add(String(result.row.id));
    });
    saveWrong();
    localStorage.setItem('python-local-attempts', String(Number(localStorage.getItem('python-local-attempts') || 0) + total));
    localStorage.setItem('python-local-correct', String(Number(localStorage.getItem('python-local-correct') || 0) + correct));
    state.answered += total; state.correct += correct; state.xp += correct * 10; awardXp(correct * 10);
    site.toast(`交卷完成：答对 ${correct}/${total} 题`, correct === total ? 'success' : '');
    mode = 'practice'; syncModeUi(); state.examAnswers.clear(); applyFilters(); showExamResult(correct, total);
    if (context.session) {
      const attempts = results.filter(result => Number.isInteger(result.selected) && !String(result.row.id).startsWith('guest-')).map(result => ({
        user_id: context.session.user.id,
        question_id: result.row.id,
        selected_index: result.selected,
        is_correct: result.correct
      }));
      if (attempts.length) await context.client.from('quiz_attempts').insert(attempts);
    }
  }
  function awardXp(amount) { if (!amount) return; localStorage.setItem('python-xp', String(Number(localStorage.getItem('python-xp') || 0) + amount)); }
  function updateStats() {
    const percent = state.answered ? Math.round(state.correct / state.answered * 100) : 0;
    $('answeredCount').textContent = state.answered; $('correctCount').textContent = state.correct; $('streakCount').textContent = state.streak; $('xpCount').textContent = state.xp; $('scorePercent').textContent = `${percent}%`; $('scoreRing').style.setProperty('--score', `${percent}%`);
  }
  function syncModeUi() {
    document.querySelectorAll('[data-mode]').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    $('modeHelp').textContent = { practice: '做一题看一题解析，没有时间限制。', exam: '从当前筛选中随机抽取最多 10 题，交卷后统一查看成绩。', wrong: '只显示历史错题，集中攻克薄弱点。' }[mode];
    $('randomQuestion').disabled = mode === 'exam';
  }
  function switchMode(next) {
    mode = next; state.examAnswers.clear(); syncModeUi();
    applyFilters();
  }

  function resetExamForFilterChange() {
    const hadProgress = mode === 'exam' && (state.examAnswers.size > 0 || choice !== null || index > 0);
    state.examAnswers.clear();
    if (hadProgress) site.toast('筛选已更新，考试从第一题重新开始。');
    applyFilters();
  }

  function rememberExamChoice() {
    const row = question();
    if (mode === 'exam' && row && choice !== null) state.examAnswers.set(String(row.id), choice);
  }

  function moveQuestion(nextIndex) {
    if (nextIndex < 0 || nextIndex >= filtered.length) return;
    rememberExamChoice();
    index = nextIndex;
    choice = mode === 'exam' ? state.examAnswers.get(String(question().id)) ?? null : null;
    checked = false;
    render();
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

  $('levelFilter').onchange = () => { refreshTopicOptions(); resetExamForFilterChange(); }; $('topicFilter').onchange = resetExamForFilterChange;
  $('questionSearch').oninput = () => { clearTimeout(debounce); debounce = setTimeout(resetExamForFilterChange, 300); };
  document.querySelectorAll('[data-mode]').forEach(button => button.onclick = () => switchMode(button.dataset.mode));
  $('submitAnswer').onclick = submit;
  $('nextQuestion').onclick = () => moveQuestion(index + 1);
  $('previousQuestion').onclick = () => moveQuestion(index - 1);
  $('randomQuestion').onclick = () => { if (filtered.length) moveQuestion(Math.floor(Math.random() * filtered.length)); };
  $('discussion').ontoggle = () => { if ($('discussion').open) loadDiscussions(); };
  $('discussionForm').onsubmit = postDiscussion;
  let touchStart = 0;
  document.querySelector('.quiz-card').addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
  document.querySelector('.quiz-card').addEventListener('touchend', event => { const distance = event.changedTouches[0].clientX - touchStart; if (Math.abs(distance) < 70) return; (distance < 0 ? $('nextQuestion') : $('previousQuestion')).click(); }, { passive: true });
  load();
})();
