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
      $('tutorialBody').style.setProperty('--reader-size', `${18 + fontStep * 2}px`);
      subsite.toast(fontStep === 0 ? '已恢复标准字号' : fontStep > 0 ? '已放大正文字号' : '已缩小正文字号');
    };
  });
  $('collapseCatalog').onclick = () => {
    const catalog = $('chapterList').closest('.tutorial-catalog');
    catalog.classList.toggle('collapsed');
    $('collapseCatalog').textContent = catalog.classList.contains('collapsed') ? '展开' : '收起';
  };
})();
