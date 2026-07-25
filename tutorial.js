(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const originalCourse = window.ORIGINAL_PYTHON_COURSE || { chapters: [], sections: [] };
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
  const lessonGuides = {
    'original-section-1-1': ['像写一张给机器人的便签：便签是代码，交给机器人照做是运行，机器人做出的动作是输出。', '不要把编辑器里的文字误认为结果；代码只有执行后才会产生输出。'],
    'original-section-1-2': ['变量像通讯录里的联系人名称。记住“妈妈”这个名字后，不必每次都重新写电话号码。', '等号在这里不是数学里的“左右相等”，而是把右侧的值交给左侧名字。'],
    'original-section-1-3': ['报错像快递地址校验：它不是责备你，而是在指出哪一部分无法识别。', '不要看到英文就全部重写；先看最后一行和报错附近。'],
    'original-section-2-1': ['字符串像写在纸条上的文字。方法可以生成一张整理过的新纸条，原纸条不会自动变化。', '引号必须前后成对；中文引号和英文引号看起来相似，但代码中不能随意混用。'],
    'original-section-2-2': ['计算总价就像收银台按固定顺序算账，括号可以明确告诉收银员哪一步先做。', '整数和小数都能计算，但除法结果、余数和整除的含义不同。'],
    'original-section-2-3': ['类型转换像把写着“18”的纸条读成真正可以计算的数字 18。', '只有确认文字确实是数字格式时才转换，否则程序会报错。'],
    'original-section-3-1': ['列表像一排有顺序的储物格，每个位置都有编号，Python 从 0 开始编号。', '索引超出列表范围会报错；先用 len() 确认数量。'],
    'original-section-3-2': ['整理书架时，可以保留原摆放顺序做一份新清单，也可以直接重排书架。', 'remove 按值删除，pop 按位置取出，两者不要混用。'],
    'original-section-3-3': ['切片像从长队中截取一段，起点算在内，终点只负责划边界。', '给列表换一个变量名不等于复制；两个名字可能仍指向同一份数据。'],
    'original-section-4-1': ['老师给每位同学发一张练习纸，就是对列表中的每一项执行同一动作。', '循环体必须缩进；没有缩进的代码是在循环结束后才执行。'],
    'original-section-4-2': ['range 像排队叫号：从起号开始，到结束号之前停止。', '先写清楚的普通循环，熟练后再用列表推导式缩短简单转换。'],
    'original-section-4-3': ['屏幕尺寸像固定规格，购物清单却会变化；是否需要修改决定了容器选择。', '元组不能原地换元素，但变量仍可改为指向一个全新的元组。'],
    'original-section-5-1': ['门禁先判断“年龄够不够”和“有没有票”，每个判断只会得到真或假。', '单等号赋值，双等号比较；这是必须主动检查的常见错误。'],
    'original-section-5-2': ['像按分数从高到低匹配等级，第一个符合的分支执行后便不会继续向下。', '条件顺序会改变结果，宽泛条件放太前面会挡住后面的精确条件。'],
    'original-section-5-3': ['and 像“钥匙和门卡都要有”，or 像“现金或手机支付任选一种”。', '复杂条件要用括号分组，并给中间判断起清楚的变量名。'],
    'original-section-6-1': ['字典像一张报名表，“姓名”和值配对，不需要记住姓名位于第几个格子。', '读取未知键时优先考虑 get()，避免字段缺失导致程序中断。'],
    'original-section-6-2': ['档案内容会更新：增加字段、修改分数、删除过期信息都是字典的日常操作。', '遍历 items() 时每轮得到两个值，循环变量也应写两个。'],
    'original-section-6-3': ['班级花名册是一组学生记录，因此自然是“列表里放字典”。', '嵌套结构太深时，先把中间一层保存到变量再继续读取。'],
    'original-section-7-1': ['input 像程序递给用户的一张填写表，收到的内容首先都按文字处理。', '提示语要说明期望格式；转换前不要假设用户一定输入正确。'],
    'original-section-7-2': ['while 像“只要水没烧开就继续加热”，重点是条件最终必须改变。', '每个 while 都要能说清初始值、继续条件和更新动作。'],
    'original-section-7-3': ['break 是直接按下停止键，布尔标志则像改变机器的运行状态。', 'continue 只是跳过本轮，break 才会结束整个循环。'],
    'original-section-8-1': ['函数像给一套可靠步骤安装了一个按钮，按下按钮才会执行。', '定义函数不等于调用函数，函数名后的括号表示真正执行。'],
    'original-section-8-2': ['参数像工具上的可调旋钮，让同一个工具处理不同输入。', '默认值适合常用情况，但没有默认值的参数要放在前面。'],
    'original-section-8-3': ['return 像工具把加工结果交还给你，print 只是把结果展示出来。', '函数职责越单一，越容易组合、测试和重复使用。'],
    'original-section-9-1': ['类像“学生档案”的空白模板，对象是填好了具体姓名的一份档案。', 'self 代表当前这一份对象，不是需要额外手动传入的普通数据。'],
    'original-section-9-2': ['__init__ 像创建档案时的登记步骤，为每个新对象保存自己的初始数据。', '实例属性写在 self 上，不同对象的数据才不会混在一起。'],
    'original-section-9-3': ['猫是一种动物，适合继承；汽车拥有发动机，适合组合。', '不要只为少写几行代码而继承，先确认关系是否真的是“是一种”。'],
    'original-section-10-1': ['文件像程序留在硬盘上的笔记本，程序关闭后内容仍能保留。', 'w 会覆盖原内容，a 才是在末尾继续写；写入前必须确认意图。'],
    'original-section-10-2': ['异常处理像为可预见的意外准备备用流程，而不是把所有错误藏起来。', '只捕获你知道怎样处理的具体异常，并提供可执行的改正提示。'],
    'original-section-10-3': ['测试像一份可以反复执行的验收清单，代码修改后仍能重新核对。', '既测试常见输入，也测试边界和异常情况。'],
    'original-section-11-1': ['搭项目像搭积木，先做能站住的最小结构，再逐块增加功能。', '需求太多时先排优先级，不要同时开工所有功能。'],
    'original-section-11-2': ['主流程像目录，小函数像章节；目录应让人一眼看懂执行顺序。', '尽量通过参数传入状态，减少函数对全局变量的隐式依赖。'],
    'original-section-11-3': ['存档只记住无法重新推导的状态，画面文字等内容可以加载后重新生成。', '保存和读取都要验证格式，损坏文件不能直接当作正确数据使用。'],
    'original-section-12-1': ['数据分析像侦探办案，先提出问题，再决定收集和展示哪些证据。', '图表好看不等于结论可靠，清理规则和计算过程必须可解释。'],
    'original-section-12-2': ['API 像餐厅点单窗口：按菜单格式请求，服务端按约定返回结果。', '网页前端不能保存秘密密钥，响应也必须检查状态和字段。'],
    'original-section-12-3': ['Web 应用把用户输入、服务器规则和页面结果连成一条数据流。', '所有来自用户的数据都要在服务器再次验证，不能只信浏览器。']
  };
  function enrichLesson(section) {
    if (!section || section.section_type !== 'lesson') return section?.content_html || '';
    const concept = section.title.replace(/^\d+\.\d+\s*/, '');
    const guide = lessonGuides[String(section.id)] || ['先把新概念放回一个熟悉场景中，再观察代码怎样表达同一件事。', '不要背整段代码，先逐行确认数据、动作和结果。'];
    return `<div class="beginner-guide"><p class="eyebrow">先理解，再看代码</p><h3>这一小节要解决什么？</h3><p>${site.escapeHtml(section.summary)} 你不需要提前认识英文关键字，也不用先背语法；先把它当成一个需要解决的小问题。</p><div><b>生活中的类比</b><p>${site.escapeHtml(guide[0])}</p></div></div>${section.content_html}<div class="lesson-walkthrough"><h3>第一次学习时，按这 4 步来</h3><ol><li><b>先读目标：</b>确认“${site.escapeHtml(concept)}”想解决什么问题。</li><li><b>再看示例：</b>暂时不要急着抄，先找出数据、动作和最终结果。</li><li><b>亲手运行：</b>点击示例旁的运行按钮，观察输出是否和你预想一致。</li><li><b>只改一处：</b>替换一个名字或数字，再运行并解释结果为什么变化。</li></ol></div><div class="common-mistake"><h3>本节最容易误解的地方</h3><p>${site.escapeHtml(guide[1])}</p><p>如果暂时没懂，回到示例逐行问：这一行拿到了什么数据？做了什么动作？结果去了哪里？</p></div><div class="checkpoint"><b>用自己的话复述</b><p>完成本节后，请尝试用一句不含代码的话解释“${site.escapeHtml(concept)}”。能讲给完全没学过编程的人听，才算真正理解。</p></div>`;
  }

  async function load() {
    context = await site.ready;
    let cloudChapters = [], cloudSections = [];
    if (context.client && context.session) {
      const [chapterResult, sectionResult, progressResult, learningResult] = await Promise.all([
        context.client.from('course_chapters').select('*').eq('active', true).order('position').order('id'),
        context.client.from('course_sections').select('*').eq('active', true).order('chapter_id').order('position').order('id'),
        context.client.from('section_progress').select('section_id').eq('completed', true),
        context.client.from('user_learning_data').select('learning_state').maybeSingle()
      ]);
      if (!chapterResult.error && chapterResult.data?.length && !sectionResult.error && sectionResult.data?.length) {
        cloudChapters = chapterResult.data; cloudSections = sectionResult.data;
        completed = new Set((progressResult.data || []).map(row => String(row.section_id)));
        checks = learningResult.data?.learning_state?.study_checks || {};
      }
    }
    if (originalCourse.chapters.length && originalCourse.sections.length) {
      chapters = originalCourse.chapters.map(chapter => {
        const cloud = cloudChapters.find(item => Number(item.position) === Number(chapter.position));
        return { ...chapter, cloud_id: cloud?.id || null };
      });
      sections = originalCourse.sections.map(section => {
        const chapter = chapters.find(item => Number(item.position) === Number(section.chapter_position));
        const cloud = cloudSections.find(item => Number(item.chapter_id) === Number(chapter?.cloud_id) && Number(item.position) === Number(section.position) && item.section_type === 'lesson');
        return { ...section, cloud_id: cloud?.id || null };
      });
      const mappedCompleted = new Set();
      sections.forEach(section => {
        if (completed.has(String(section.id)) || (section.cloud_id && completed.has(String(section.cloud_id)))) mappedCompleted.add(String(section.id));
      });
      completed = mappedCompleted;
      const state = localData();
      Object.keys(state.completedSections || {}).forEach(id => completed.add(String(id)));
      checks = { ...(state.studyChecks || {}), ...checks };
    } else if (!chapters.length) {
      chapters = fallbackChapters; sections = fallbackSections;
      const state = localData();
      completed = new Set(Object.keys(state.completedSections || {})); checks = state.studyChecks || {};
    }
    $('courseAccessText').textContent = context.session ? '原创课程已开放，进度会同步到云端' : '原创课程开放阅读 · 登录后同步进度';
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
    $('tutorialBody').innerHTML = enrichLesson(current) || '<p>本节内容正在准备。</p>';
    $('tutorialCode').textContent = current.example_code || '';
    $('tutorialCodeBox').hidden = !current.example_code;
    $('tutorialOutput').hidden = true;
    $('tutorialOutputText').textContent = '';
    await loadPractice(current);
    const index = sections.indexOf(current);
    $('readerPrevious').disabled = index <= 0;
    $('readerNext').disabled = index >= sections.length - 1;
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
    practiceItems = section?.builtin_practice || [];
    if (!practiceItems.length && context.client && context.session && section?.cloud_id) {
      const { data, error } = await context.client.from('chapter_exercises').select('*').eq('section_id', section.cloud_id).eq('exercise_group', 'after_class').eq('active', true).order('position').limit(3);
      if (!error) practiceItems = data || [];
    }
    if (!practiceItems.length) { $('lessonPractice').hidden = true; return; }
    $('lessonPractice').hidden = false;
    let thinkingNumber = 0, codingNumber = 0;
    $('lessonPracticeList').innerHTML = practiceItems.map(item => item.question_type === 'coding' ? `<article class="practice-item" data-practice-id="${item.id}"><div class="practice-meta"><span>动手题 ${++codingNumber}</span><b>${site.escapeHtml(item.topic)}</b></div><p>${site.escapeHtml(item.prompt)}</p><textarea class="practice-code" data-practice-code placeholder="在这里写你的代码">${site.escapeHtml(item.starter_code || '')}</textarea><div class="practice-actions"><button class="secondary" type="button" data-run-practice="${item.id}">运行并检查</button><span class="practice-result" data-practice-result="${item.id}" role="status"></span></div></article>` : `<article class="practice-item" data-practice-id="${item.id}"><div class="practice-meta"><span>思考题 ${++thinkingNumber}</span><b>${site.escapeHtml(item.topic)}</b></div><p>${site.escapeHtml(item.prompt)}</p><textarea class="practice-answer" data-practice-answer placeholder="写下你的理解，再提交给自己检查"></textarea><div class="practice-actions"><button class="secondary" type="button" data-submit-thinking="${item.id}">保存思考</button><span class="practice-result" data-practice-result="${item.id}" role="status"></span></div></article>`).join('');
    document.querySelectorAll('[data-run-practice]').forEach(button => button.onclick = () => runPractice(button.dataset.runPractice));
    document.querySelectorAll('[data-submit-thinking]').forEach(button => button.onclick = () => submitThinking(button.dataset.submitThinking));
  }
  async function savePracticeAttempt(item, answerText, isCorrect, feedback) {
    if (!context.session || typeof item.id !== 'number') return;
    await context.client.from('exercise_attempts').insert({ user_id: context.session.user.id, exercise_id: item.id, answer_text: answerText, is_correct: isCorrect, score: isCorrect ? 100 : 0, feedback });
  }
  async function runPractice(id) {
    const item = practiceItems.find(row => String(row.id) === String(id)); const card = document.querySelector(`[data-practice-id="${id}"]`); if (!item || !card) return;
    const code = card.querySelector('[data-practice-code]').value; const resultNode = card.querySelector('[data-practice-result]'); resultNode.textContent = '正在运行…';
    const result = await executeCode(code); const output = (result.output || '').trim(); const config = item.test_config || {}; const expected = String(config.expected_output || '').trim(); const required = Array.isArray(config.required_snippets) ? config.required_snippets : [];
    const hasAutoCheck = Boolean(expected || required.length); const isCorrect = result.ok && (!expected || output === expected) && required.every(snippet => code.includes(snippet));
    const feedback = !result.ok ? '运行失败，请先看报错并修改。' : hasAutoCheck ? (isCorrect ? '通过：输出和要求都符合。' : `还没通过。当前输出：${output || '（无输出）'}`) : `已运行。当前输出：${output || '（无输出）'}`;
    resultNode.textContent = feedback; resultNode.dataset.tone = result.ok && (!hasAutoCheck || isCorrect) ? 'success' : 'error'; await savePracticeAttempt(item, code, hasAutoCheck ? isCorrect : result.ok, feedback);
  }
  async function submitThinking(id) {
    const item = practiceItems.find(row => String(row.id) === String(id)); const card = document.querySelector(`[data-practice-id="${id}"]`); if (!item || !card) return;
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
    if (context.session && current.cloud_id) {
      const { error } = await context.client.from('section_progress').upsert({ user_id: context.session.user.id, section_id: current.cloud_id, completed: true, last_read_at: new Date().toISOString() });
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
