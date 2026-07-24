(function () {
  const $ = id => document.getElementById(id);
  const studyKeys = ['read', 'typed', 'changed', 'practiced', 'summarized'];
  let client;
  let session;
  let chapters = [];
  let sections = [];
  let progress = new Set();
  let learningState = {};
  let chapter;
  let section;
  let fontStep = 0;
  let noteTimer;

  subsite.ready.then(async context => {
    if (!context) return;
    client = context.client;
    session = context.session;
    await load();
  });

  async function load() {
    const [chapterResult, sectionResult, progressResult, learningResult] = await Promise.all([
      client.from('course_chapters').select('*').eq('active', true).order('position'),
      client.from('course_sections').select('*').eq('active', true).order('position'),
      client.from('section_progress').select('section_id,completed').eq('completed', true),
      client.from('user_learning_data').select('learning_state').maybeSingle()
    ]);

    if (chapterResult.error || sectionResult.error) {
      $('chapterList').innerHTML = '<div class="empty">课程加载失败，请稍后刷新。</div>';
      return;
    }

    chapters = chapterResult.data || [];
    sections = sectionResult.data || [];
    progress = new Set((progressResult.data || []).map(item => item.section_id));
    learningState = learningResult.data?.learning_state || {};
    learningState.study_method = learningState.study_method || {};
    learningState.study_notes = learningState.study_notes || {};

    // Existing completed lessons remain completed after introducing the five-step method.
    progress.forEach(id => {
      if (!learningState.study_method[id]) {
        learningState.study_method[id] = Object.fromEntries(studyKeys.map(key => [key, true]));
      }
    });

    renderCatalog();
    updateProgress();
    const requested = Number(new URLSearchParams(location.search).get('section'));
    const first = sections.find(item => item.id === requested) || sections[0];
    if (first) selectSection(first.id);
  }

  function renderCatalog() {
    $('chapterList').innerHTML = chapters.map((item, index) => {
      const list = sections.filter(current => current.chapter_id === item.id);
      const done = list.filter(current => progress.has(current.id)).length;
      return `<div class="chapter-group ${chapter?.id === item.id ? 'open' : ''}">
        <button class="chapter-button" data-chapter="${item.id}"><i>${item.cover_icon}</i><span><small>第 ${index + 1} 章 · ${level(item.level)}</small><b>${item.title}</b></span><em>${done}/${list.length}</em></button>
        <div class="section-list">${list.map(current => `<button class="section-button ${current.id === section?.id ? 'active' : ''} ${progress.has(current.id) ? 'done' : ''}" data-section="${current.id}">${current.title}</button>`).join('')}</div>
      </div>`;
    }).join('');

    document.querySelectorAll('[data-chapter]').forEach(button => {
      button.onclick = () => {
        chapter = chapters.find(item => item.id === Number(button.dataset.chapter));
        renderCatalog();
      };
    });
    document.querySelectorAll('[data-section]').forEach(button => {
      button.onclick = () => selectSection(Number(button.dataset.section));
    });
  }

  function selectSection(id) {
    section = sections.find(item => item.id === id);
    if (!section) return;
    chapter = chapters.find(item => item.id === section.chapter_id);
    renderCatalog();
    $('readerEmpty').style.display = 'none';
    $('readerContent').classList.add('show');
    $('readerBreadcrumb').textContent = `第 ${chapters.indexOf(chapter) + 1} 章 / ${chapter.title}`;
    $('readerType').textContent = section.section_type === 'summary' ? '章节小结' : '教程小节';
    $('readerTitle').textContent = section.title;
    $('readerSummary').textContent = section.summary;
    $('readerReadTime').textContent = `约 ${Math.max(5, Math.ceil((section.content_html || '').length / 420))} 分钟 · 零基础友好`;
    $('tutorialBody').innerHTML = section.content_html;
    $('tutorialCode').textContent = section.example_code || '';
    $('tutorialCodeBox').style.display = section.example_code ? 'block' : 'none';
    renderLessonGuide();
    renderStudySteps();
    renderNotes();

    const list = sections.filter(item => item.chapter_id === chapter.id);
    const position = list.findIndex(item => item.id === id);
    $('readerPrevious').disabled = position === 0;
    $('readerNext').disabled = position === list.length - 1;
    $('readerPrevious').onclick = () => position > 0 && selectSection(list[position - 1].id);
    $('readerNext').onclick = () => position < list.length - 1 && selectSection(list[position + 1].id);
    $('chapterQuizLink').href = `quiz.html?chapter=${chapter.id}`;
    history.replaceState(null, '', `?section=${id}`);
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  function currentSteps() {
    return learningState.study_method[section.id] || {};
  }

  function renderLessonGuide() {
    const topic = section.title.replace(/^\d+(?:\.\d+)?\s*/, '');
    const isSummary = section.section_type === 'summary';
    const goals = isSummary ? [
      `不用查看教程，画出“${chapter.title}”的知识地图`,
      '用自己的话解释本章最重要的三个概念',
      '独立完成章节小结题，并找到仍然不熟悉的地方'
    ] : [
      `理解“${topic}”解决的实际问题，而不是只记住写法`,
      '能够看懂示例中每一行代码的作用',
      '亲手修改示例，并根据结果解释发生了什么',
      '脱离示例，写出一个结构相似的小程序'
    ];
    $('lessonGoals').innerHTML = goals.map(goal => `<li>${goal}</li>`).join('');
    $('lessonThinkTitle').textContent = isSummary ? '如果合上教程，你还记得多少？' : `在没有 Python 时，你会怎样完成“${topic}”？`;
    $('lessonThinkPrompt').textContent = isSummary
      ? '先拿一张纸，用 3 分钟写出本章学过的关键词，再打开教程检查。回忆比重新阅读更能发现薄弱点。'
      : `先不要急着看语法。想一想生活中与“${topic}”类似的场景：需要保存什么信息、做什么判断或重复哪些步骤？把人的做法拆成电脑能执行的小步骤。`;

    const lines = (section.example_code || '').split('\n').filter(line => line.trim());
    $('codeWalkthrough').innerHTML = lines.length ? lines.map((line, index) => `<div><code>${escapeHtml(line)}</code><p>${explainLine(line, index)}</p></div>`).join('') : '<p>本节是知识整理课。请先合上教程，自己画知识地图，再回来补充遗漏。</p>';
    $('changeChallenge').textContent = lines.length
      ? `不要复制代码。亲手输入后，至少修改两个数据，再删除或替换一个关键部分。运行三次，记录每次结果和你的解释。`
      : '选出本章一个最不熟悉的知识点，重新写一个最小示例，并给每一行加上自己的中文解释。';
    $('commonMistakes').innerHTML = commonMistakes(topic, isSummary).map(item => `<li>${item}</li>`).join('');
    $('reviewQuestions').innerHTML = reviewQuestions(topic, isSummary).map(item => `<li>${item}</li>`).join('');
  }

  function explainLine(line, index) {
    const text = line.trim();
    if (text.startsWith('#')) return '这是注释，是写给人看的说明，Python 不会执行它。';
    if (text.startsWith('print')) return '让 Python 把括号中的内容显示出来，用来观察程序结果。';
    if (text.startsWith('if ') || text.startsWith('elif ') || text === 'else:') return '这里让程序根据条件选择不同的执行路线，冒号后面是对应的代码块。';
    if (text.startsWith('for ') || text.startsWith('while ')) return '这里开始重复执行缩进的代码，每一次循环都会处理新的数据或检查条件。';
    if (text.startsWith('def ')) return '这里定义一个可以反复使用的小工具，下面缩进的代码属于这个函数。';
    if (text.startsWith('class ')) return '这里定义一类对象的共同结构和行为，可以先理解为制作对象的设计图。';
    if (text.startsWith('return ')) return '把函数计算出的结果交回调用它的位置，同时结束这次函数执行。';
    if (text.includes('=')) return '这里把右边得到的数据保存到左边的名字中，后面可以继续使用或修改。';
    if (/^(import|from) /.test(text)) return '这里引入现成的工具，让当前程序能够使用模块提供的能力。';
    return `这是示例的第 ${index + 1} 个执行步骤。请结合上一行和下一行，说出它接收了什么、产生了什么。`;
  }

  function commonMistakes(topic, isSummary) {
    if (isSummary) return ['只重新阅读，不先回忆，容易产生“我都懂了”的错觉', '只看答案，不亲手重新写代码', '发现不会的地方后没有记录，也没有安排再次练习'];
    const mistakes = ['直接复制示例，没有亲手输入英文符号和缩进', '只关注最后输出，不理解每行代码之间的先后关系', '代码报错后一次改很多地方，无法判断究竟是哪处修改起作用'];
    if (/判断|循环|函数|类|文件/.test(topic)) mistakes.push('忽略冒号、缩进或代码块范围，导致程序执行路径与预期不同');
    else mistakes.push('混淆中文符号和英文符号，或变量名称前后拼写不一致');
    return mistakes;
  }

  function reviewQuestions(topic, isSummary) {
    return isSummary ? ['本章最重要的三个概念是什么？它们之间有什么联系？', '哪一段代码你还不能脱离示例独立写出？', '如果给朋友讲本章内容，你会用什么生活例子？'] : [
      `请不用术语，用一句生活化的话解释“${topic}”。`,
      '示例代码每一行分别接收什么、处理什么、产生什么？',
      '如果修改一个数据，哪些位置的结果会跟着变化？为什么？',
      '请设计一个与示例不同、但使用同一知识点的小程序。'
    ];
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function renderStudySteps() {
    const steps = currentSteps();
    const count = studyKeys.filter(key => steps[key]).length;
    document.querySelectorAll('[data-study-step]').forEach(button => {
      const done = Boolean(steps[button.dataset.studyStep]);
      button.classList.toggle('done', done);
      button.querySelector('em').textContent = done ? '已完成 ✓' : '未完成';
    });
    $('methodProgressText').textContent = `已完成 ${count} / 5 步`;
    $('readerStatus').textContent = progress.has(section.id) ? '已完成' : `学习中 · ${count}/5`;
    $('completeSection').disabled = count < studyKeys.length || progress.has(section.id);
    $('completeSection').textContent = progress.has(section.id) ? '本节已完成 ✓' : count === studyKeys.length ? '五步完成，标记本节过关 ✓' : `还需完成 ${studyKeys.length - count} 步`;
  }

  async function toggleStudyStep(key) {
    if (!section) return;
    learningState.study_method[section.id] = { ...currentSteps(), [key]: !currentSteps()[key] };
    renderStudySteps();
    const saved = await saveLearningState();
    subsite.toast(saved ? '本节学习步骤已同步' : '步骤保存失败，请稍后重试');
  }

  function renderNotes() {
    const notes = learningState.study_notes[section.id] || {};
    $('noteLearned').value = notes.learned || '';
    $('notePitfall').value = notes.pitfall || '';
    $('noteCode').value = notes.code || '';
    setNoteState('已同步到云端');
  }

  function queueNoteSave() {
    if (!section) return;
    const sectionId = section.id;
    learningState.study_notes[sectionId] = {
      learned: $('noteLearned').value.trim(),
      pitfall: $('notePitfall').value.trim(),
      code: $('noteCode').value,
      updated_at: new Date().toISOString()
    };
    setNoteState('正在保存...', 'saving');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(async () => {
      const saved = await saveLearningState();
      setNoteState(saved ? '已同步到云端' : '保存失败，请重试', saved ? '' : 'error');
    }, 650);
  }

  function setNoteState(text, className = '') {
    $('noteSaveState').textContent = text;
    $('noteSaveState').className = className;
  }

  async function saveLearningState() {
    const { error } = await client.from('user_learning_data').upsert({
      user_id: session.user.id,
      learning_state: learningState
    }, { onConflict: 'user_id' });
    return !error;
  }

  async function complete() {
    if (!section || !studyKeys.every(key => currentSteps()[key])) return;
    const { error } = await client.from('section_progress').upsert({
      user_id: session.user.id,
      section_id: section.id,
      completed: true,
      last_read_at: new Date().toISOString()
    });
    if (error) {
      subsite.toast('进度保存失败');
      return;
    }
    progress.add(section.id);
    renderCatalog();
    renderStudySteps();
    updateProgress();
    subsite.toast('本节已过关，学习进度已同步');
  }

  function updateProgress() {
    const percent = sections.length ? Math.round(progress.size / sections.length * 100) : 0;
    $('courseProgressText').textContent = `${percent}%`;
    $('courseProgressBar').style.width = `${percent}%`;
    $('heroProgressBar').style.width = `${percent}%`;
    $('heroProgressText').textContent = `已完成 ${progress.size} / ${sections.length} 个小节`;
  }

  function level(value) {
    return { beginner: '零基础', basic: '基础', advanced: '进阶' }[value] || value;
  }

  $('completeSection').onclick = complete;
  document.querySelectorAll('[data-study-step]').forEach(button => {
    button.onclick = () => toggleStudyStep(button.dataset.studyStep);
  });
  ['noteLearned', 'notePitfall', 'noteCode'].forEach(id => $(id).addEventListener('input', queueNoteSave));
  $('copyTutorialCode').onclick = () => navigator.clipboard.writeText($('tutorialCode').textContent).then(() => subsite.toast('代码已复制，建议再亲手输入一遍'));
  $('copyHelpPrompt').onclick = () => navigator.clipboard.writeText($('helpPromptText').textContent).then(() => subsite.toast('提示词已复制'));
  document.querySelectorAll('[data-font]').forEach(button => {
    button.onclick = () => {
      fontStep = Number(button.dataset.font);
      $('tutorialBody').style.setProperty('--reader-size', `${20 + fontStep * 2}px`);
      subsite.toast(fontStep === 0 ? '已恢复标准字号' : fontStep > 0 ? '已放大正文字号' : '已缩小正文字号');
    };
  });
  $('collapseCatalog').onclick = () => {
    const catalog = $('chapterList').closest('.tutorial-catalog');
    catalog.classList.toggle('collapsed');
    $('collapseCatalog').textContent = catalog.classList.contains('collapsed') ? '展开' : '收起';
  };
})();
