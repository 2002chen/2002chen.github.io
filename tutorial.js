(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const fallbackChapters = [{ id: 'guest-chapter-1', title: '认识 Python 与第一行代码', level: 'beginner', position: 1, cover_icon: '1', estimated_minutes: 25 }];
  const fallbackSections = [{
    id: 'guest-section-1', chapter_id: 'guest-chapter-1', position: 1, section_type: 'lesson', title: '1.1 代码到底是什么', summary: '从完全不知道代码开始，认识程序、代码、Python、运行和输出。',
    content_html: '<div class="zero-card"><b>开始前，你不需要会任何东西</b><p>如果你从没见过代码，甚至不知道“运行”是什么意思，这正是这节课要解决的问题。</p></div><h3>电脑很快，但不会猜</h3><p>电脑会严格执行人给它的指令。为了让它显示一句话、计算两个数字，我们要把步骤说清楚。</p><div class="checkpoint"><b>先记住一句话</b><p>代码就是写给电脑看的操作说明，Python 是写这种说明的一种语言。</p></div><h3>用做菜来理解</h3><p>菜谱像程序，每一步文字像代码，厨师照步骤做菜就像电脑运行代码。步骤越清楚，结果越稳定。</p><h3>第一次观察 Python</h3><p><code>print</code> 可以先理解为“请显示”。括号里放要显示的内容，引号告诉 Python 这里是一段文字。</p>',
    example_code: 'print("你好，Python！")\nprint("这是我的第一段代码")'
  }];
  let chapters = [], sections = [], completed = new Set(), checks = {}, current = null, context = null;
  let codeWorker = null, codeJobId = 0, practiceItems = [];

  function localData() {
    try { return JSON.parse(localStorage.getItem('python-learning-v2') || '{}'); } catch { return {}; }
  }
  function saveLocal() {
    const state = localData();
    state.completedSections = Object.fromEntries([...completed].map(id => [id, true]));
    state.studyChecks = checks;
    localStorage.setItem('python-learning-v2', JSON.stringify(state));
  }
  function levelText(value) { return { beginner: '零基础', basic: '基础', advanced: '进阶' }[value] || value; }

  async function load() {
    context = await site.ready;
    if (context.client && context.session) {
      const [chapterResult, sectionResult, progressResult, learningResult] = await Promise.all([
        context.client.from('course_chapters').select('*').eq('active', true).order('position').order('id'),
        context.client.from('course_sections').select('*').eq('active', true).order('chapter_id').order('position').order('id'),
        context.client.from('section_progress').select('section_id').eq('completed', true),
        context.client.from('user_learning_data').select('learning_state').maybeSingle()
      ]);
      if (!chapterResult.error && chapterResult.data?.length && !sectionResult.error && sectionResult.data?.length) {
        chapters = chapterResult.data; sections = sectionResult.data;
        completed = new Set((progressResult.data || []).map(row => String(row.section_id)));
        checks = learningResult.data?.learning_state?.study_checks || {};
      }
    }
    if (!chapters.length) {
      chapters = fallbackChapters; sections = fallbackSections;
      const state = localData();
      completed = new Set(Object.keys(state.completedSections || {})); checks = state.studyChecks || {};
    }
    $('courseAccessText').textContent = context.session ? '已登录，进度会同步到云端' : '游客试学模式 · 第一节完整开放';
    renderCatalog(); updateProgress(); selectInitial();
  }

  function renderCatalog() {
    $('chapterList').innerHTML = chapters.map((chapter, chapterIndex) => {
      const list = sections.filter(section => String(section.chapter_id) === String(chapter.id));
      const done = list.filter(section => completed.has(String(section.id))).length;
      const active = current && String(current.chapter_id) === String(chapter.id);
      const status = done === list.length && list.length ? '✓' : active ? '•' : chapterIndex ? '○' : '↻';
      return `<section class="chapter ${active || chapterIndex === 0 ? 'open' : ''}"><button type="button" data-chapter="${chapter.id}"><i>${status}</i><span><small>第 ${chapterIndex + 1} 章 · ${levelText(chapter.level)}</small><b>${site.escapeHtml(chapter.title)}</b></span><small>${done}/${list.length}</small></button><div class="lesson-list">${list.map(section => `<button type="button" class="${current && String(current.id) === String(section.id) ? 'active' : ''} ${completed.has(String(section.id)) ? 'done' : ''}" data-section="${section.id}">${site.escapeHtml(section.title)}</button>`).join('')}</div></section>`;
    }).join('');
    document.querySelectorAll('[data-chapter]').forEach(button => button.onclick = () => button.closest('.chapter').classList.toggle('open'));
    document.querySelectorAll('[data-section]').forEach(button => button.onclick = () => selectSection(button.dataset.section));
  }

  function selectInitial() {
    const params = new URLSearchParams(location.search);
    const requested = params.get('section') || localStorage.getItem('python-last-section');
    const query = params.get('q')?.toLowerCase();
    const searched = query && sections.find(section => `${section.title} ${section.summary} ${section.content_html}`.toLowerCase().includes(query));
    const target = searched || sections.find(section => String(section.id) === String(requested)) || sections[0];
    if (target) selectSection(target.id);
  }

  async function selectSection(id) {
    current = sections.find(section => String(section.id) === String(id));
    if (!current) return;
    localStorage.setItem('python-last-section', String(current.id));
    $('readerEmpty').hidden = true; $('readerContent').hidden = false;
    const chapter = chapters.find(item => String(item.id) === String(current.chapter_id));
    const chapterIndex = chapters.indexOf(chapter);
    $('readerBreadcrumb').innerHTML = `<a href="index.html">首页</a><span>›</span><a href="tutorial.html">系统教程</a><span>›</span><span>第 ${chapterIndex + 1} 章</span><span>›</span><span>${site.escapeHtml(current.title)}</span>`;
    $('readerType').textContent = current.section_type === 'summary' ? '章节小结' : '教程小节';
    $('readerTitle').textContent = current.title; $('readerSummary').textContent = current.summary || '';
    $('readerReadTime').textContent = `约 ${Math.max(5, Math.ceil(String(current.content_html || '').length / 450))} 分钟`;
    $('tutorialBody').innerHTML = current.content_html || '<p>本节内容正在准备。</p>';
    $('tutorialCode').textContent = current.example_code || '';
    $('tutorialCodeBox').hidden = !current.example_code;
    $('tutorialOutput').hidden = true;
    $('tutorialOutputText').textContent = '';
    await loadPractice(current);
    const index = sections.indexOf(current);
    $('readerPrevious').disabled = index <= 0;
    $('readerNext').disabled = index >= sections.length - 1 || (!context.session && index >= 0);
    $('readerPrevious').onclick = () => index > 0 && selectSection(sections[index - 1].id);
    $('readerNext').onclick = () => index < sections.length - 1 && selectSection(sections[index + 1].id);
    $('recommendationLink').textContent = sections[index + 1]?.title || '去题库巩固本章';
    $('recommendationLink').href = sections[index + 1] ? `tutorial.html?section=${sections[index + 1].id}` : 'quiz.html';
    $('completeSection').classList.toggle('secondary', completed.has(String(current.id)));
    $('completeSection').textContent = completed.has(String(current.id)) ? '本节已完成 ✓' : '完成本节 ✓';
    renderChecks(); renderCatalog();
    scrollTo({ top: Math.max(0, document.querySelector('.tutorial-layout').offsetTop - 90), behavior: 'smooth' });
  }

  async function loadPractice(section) {
    practiceItems = [];
    if (!context.client || !context.session || !section || String(section.id).startsWith('guest-')) {
      $('lessonPractice').hidden = true;
      return;
    }
    const { data, error } = await context.client.from('chapter_exercises').select('*').eq('section_id', section.id).eq('exercise_group', 'after_class').eq('active', true).order('position');
    if (error || !data?.length) { $('lessonPractice').hidden = true; return; }
    practiceItems = data;
    $('lessonPractice').hidden = false;
    $('lessonPracticeList').innerHTML = practiceItems.map((item, index) => item.question_type === 'coding' ? `<article class="practice-item" data-practice-id="${item.id}"><div class="practice-meta"><span>动手题 ${index + 1}</span><b>${site.escapeHtml(item.topic)}</b></div><p>${site.escapeHtml(item.prompt)}</p><textarea class="practice-code" data-practice-code placeholder="在这里写你的代码">${site.escapeHtml(item.starter_code || '')}</textarea><div class="practice-actions"><button class="secondary" type="button" data-run-practice="${item.id}">运行并检查</button><span class="practice-result" data-practice-result="${item.id}" role="status"></span></div></article>` : `<article class="practice-item" data-practice-id="${item.id}"><div class="practice-meta"><span>思考题 ${index + 1}</span><b>${site.escapeHtml(item.topic)}</b></div><p>${site.escapeHtml(item.prompt)}</p><textarea class="practice-answer" data-practice-answer placeholder="写下你的理解，再提交给自己检查"></textarea><div class="practice-actions"><button class="secondary" type="button" data-submit-thinking="${item.id}">保存思考</button><span class="practice-result" data-practice-result="${item.id}" role="status"></span></div></article>`).join('');
    document.querySelectorAll('[data-run-practice]').forEach(button => button.onclick = () => runPractice(Number(button.dataset.runPractice)));
    document.querySelectorAll('[data-submit-thinking]').forEach(button => button.onclick = () => submitThinking(Number(button.dataset.submitThinking)));
  }
  async function savePracticeAttempt(item, answerText, isCorrect, feedback) {
    if (!context.session) return;
    await context.client.from('exercise_attempts').insert({ user_id: context.session.user.id, exercise_id: item.id, answer_text: answerText, is_correct: isCorrect, score: isCorrect ? 100 : 0, feedback });
  }
  async function runPractice(id) {
    const item = practiceItems.find(row => row.id === id); const card = document.querySelector(`[data-practice-id="${id}"]`); if (!item || !card) return;
    const code = card.querySelector('[data-practice-code]').value; const resultNode = card.querySelector('[data-practice-result]'); resultNode.textContent = '正在运行…';
    const result = await executeCode(code); const output = (result.output || '').trim(); const config = item.test_config || {}; const expected = String(config.expected_output || '').trim(); const required = Array.isArray(config.required_snippets) ? config.required_snippets : [];
    const hasAutoCheck = Boolean(expected || required.length); const isCorrect = result.ok && (!expected || output === expected) && required.every(snippet => code.includes(snippet));
    const feedback = !result.ok ? '运行失败，请先看报错并修改。' : hasAutoCheck ? (isCorrect ? '通过：输出和要求都符合。' : `还没通过。当前输出：${output || '（无输出）'}`) : `已运行。当前输出：${output || '（无输出）'}`;
    resultNode.textContent = feedback; resultNode.dataset.tone = result.ok && (!hasAutoCheck || isCorrect) ? 'success' : 'error'; await savePracticeAttempt(item, code, hasAutoCheck ? isCorrect : result.ok, feedback);
  }
  async function submitThinking(id) {
    const item = practiceItems.find(row => row.id === id); const card = document.querySelector(`[data-practice-id="${id}"]`); if (!item || !card) return;
    const answer = card.querySelector('[data-practice-answer]').value.trim(); const resultNode = card.querySelector('[data-practice-result]'); if (!answer) { resultNode.textContent = '先写下你的想法，再保存。'; return; }
    resultNode.textContent = '已保存。回看你的答案，确认有解释、例子和理由。'; resultNode.dataset.tone = 'success'; await savePracticeAttempt(item, answer, null, resultNode.textContent);
  }

  function renderChecks() {
    const data = checks[String(current.id)] || {};
    document.querySelectorAll('[data-study-check]').forEach(button => button.classList.toggle('done', Boolean(data[button.dataset.studyCheck])));
  }
  async function persistChecks() {
    if (!context.session) { saveLocal(); return; }
    const currentRow = await context.client.from('user_learning_data').select('learning_state,quiz_state').maybeSingle();
    const learningState = { ...(currentRow.data?.learning_state || {}), study_checks: checks };
    await context.client.from('user_learning_data').upsert({ user_id: context.session.user.id, learning_state: learningState, quiz_state: currentRow.data?.quiz_state || {} });
  }
  async function complete() {
    if (!current) return;
    const currentChecks = checks[String(current.id)] || {};
    if (!['understood', 'typed', 'reviewed'].every(key => currentChecks[key])) { site.toast('先完成三个学习检查，再标记本节完成。'); return; }
    if (context.session) {
      const { error } = await context.client.from('section_progress').upsert({ user_id: context.session.user.id, section_id: current.id, completed: true, last_read_at: new Date().toISOString() });
      if (error) { site.toast('进度保存失败，请重试', 'error'); return; }
    }
    completed.add(String(current.id)); saveLocal(); updateProgress(); renderCatalog();
    $('completeSection').textContent = '本节已完成 ✓';
    site.toast('本节完成，做得很好！', 'success');
    if (!context.session) $('trialCallout').classList.add('show');
  }
  function updateProgress() {
    const percent = sections.length ? Math.round(completed.size / sections.length * 100) : 0;
    $('courseProgressText').textContent = `${completed.size}/${sections.length} 节已完成 · ${percent}%`;
    $('courseProgressBar').style.width = `${percent}%`;
  }

  function executeCode(code) {
    if (!codeWorker) codeWorker = new Worker('py-worker.js?v=20260725');
    return new Promise(resolve => {
      const id = ++codeJobId;
      const handler = event => {
        if (event.data.id !== id) return;
        codeWorker.removeEventListener('message', handler);
        resolve(event.data);
      };
      codeWorker.addEventListener('message', handler);
      codeWorker.postMessage({ id, code });
    });
  }

  async function runExampleCode() {
    const button = $('runTutorialCode');
    const output = $('tutorialOutput');
    const outputText = $('tutorialOutputText');
    button.disabled = true;
    button.textContent = '正在运行...';
    output.hidden = false;
    outputText.textContent = '首次运行需要加载 Python，请稍候。';
    try {
      const result = await executeCode($('tutorialCode').textContent);
      outputText.textContent = result.output || (result.ok ? '程序运行完成，没有输出。' : '运行失败，请检查代码。');
      if (result.ok) site.toast('示例运行完成', 'success');
    } catch {
      outputText.textContent = 'Python 暂时没有加载成功，请检查网络后重试。';
    } finally {
      button.disabled = false;
      button.textContent = '运行代码';
    }
  }

  document.querySelectorAll('[data-study-check]').forEach(button => button.onclick = async () => {
    if (!current) return; const id = String(current.id); checks[id] ||= {}; checks[id][button.dataset.studyCheck] = !checks[id][button.dataset.studyCheck]; renderChecks(); await persistChecks();
  });
  $('completeSection').onclick = complete;
  $('copyTutorialCode').onclick = async () => { await navigator.clipboard.writeText($('tutorialCode').textContent); site.toast('代码已复制，建议再亲手输入一次。'); };
  $('runTutorialCode').onclick = runExampleCode;
  $('clearTutorialOutput').onclick = () => { $('tutorialOutputText').textContent = ''; $('tutorialOutput').hidden = true; };
  $('trialRegister').onclick = () => site.openAuth();
  $('collapseCatalog').onclick = () => { const catalog = document.querySelector('.catalog'); catalog.classList.toggle('collapsed'); $('chapterList').hidden = catalog.classList.contains('collapsed'); $('collapseCatalog').textContent = catalog.classList.contains('collapsed') ? '展开' : '收起'; };
  load();
})();
