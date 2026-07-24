(function () {
  const $ = id => document.getElementById(id);
  let chapters = [], sections = [], exercises = [], progress = new Set();
  let currentChapter = null, currentSection = null, currentExercise = null, exerciseTab = 'choice';

  function client() { return window.learningCloud?.client; }

  async function loadCourse() {
    if (!client()) return;
    const [chapterResult, sectionResult, progressResult] = await Promise.all([
      client().from('course_chapters').select('*').eq('active', true).order('position').order('id'),
      client().from('course_sections').select('*').eq('active', true).order('position').order('id'),
      client().from('section_progress').select('section_id, completed').eq('completed', true)
    ]);
    if (chapterResult.error || sectionResult.error) return;
    chapters = chapterResult.data || []; sections = sectionResult.data || []; progress = new Set((progressResult.data || []).map(x => x.section_id));
    renderChapters(); updateCourseProgress();
    if (chapters.length) selectChapter(chapters[0].id, false);
  }

  function renderChapters() {
    $('chapterList').innerHTML = chapters.map((chapter, index) => {
      const chapterSections = sections.filter(x => x.chapter_id === chapter.id);
      const done = chapterSections.filter(x => progress.has(x.id)).length;
      return `<div class="chapter-group ${currentChapter?.id === chapter.id ? 'open' : ''}"><button class="chapter-button" data-chapter="${chapter.id}" type="button"><i>${chapter.cover_icon}</i><span><small>第 ${index + 1} 章 · ${levelText(chapter.level)}</small><b>${chapter.title}</b><em>${done}/${chapterSections.length} 小节</em></span><strong>⌄</strong></button><div class="section-list">${chapterSections.map((section, i) => `<button class="section-button ${progress.has(section.id) ? 'done' : ''} ${currentSection?.id === section.id ? 'active' : ''}" data-section="${section.id}" type="button"><i>${progress.has(section.id) ? '✓' : i + 1}</i><span>${section.title}</span>${section.section_type === 'summary' ? '<em>小结</em>' : ''}</button>`).join('')}</div></div>`;
    }).join('') || '<p class="course-empty">云端还没有课程内容，请管理员在后台新增或导入课程。</p>';
    document.querySelectorAll('[data-chapter]').forEach(button => button.onclick = () => selectChapter(Number(button.dataset.chapter), true));
    document.querySelectorAll('[data-section]').forEach(button => button.onclick = () => selectSection(Number(button.dataset.section)));
  }

  function selectChapter(id, openFirst) {
    currentChapter = chapters.find(x => x.id === id); if (!currentChapter) return;
    renderChapters(); $('taskChapterTitle').textContent = currentChapter.title;
    if (openFirst) { const first = sections.find(x => x.chapter_id === id); if (first) selectSection(first.id); }
  }

  function selectSection(id) {
    currentSection = sections.find(x => x.id === id); if (!currentSection) return;
    currentChapter = chapters.find(x => x.id === currentSection.chapter_id); renderChapters();
    $('readerEmpty').style.display = 'none'; $('readerContent').classList.add('show');
    const chapterIndex = chapters.findIndex(x => x.id === currentChapter.id);
    $('readerBreadcrumb').textContent = `第 ${chapterIndex + 1} 章 / ${currentChapter.title}`;
    $('readerType').textContent = currentSection.section_type === 'summary' ? '章节小结' : '教程小节';
    $('readerTitle').textContent = currentSection.title; $('readerSummary').textContent = currentSection.summary;
    $('readerReadTime').textContent = `约 ${Math.max(3, Math.ceil((currentSection.content_html || '').length / 500))} 分钟`;
    $('tutorialBody').innerHTML = currentSection.content_html; $('tutorialCode').textContent = currentSection.example_code || '';
    $('tutorialCodeBox').style.display = currentSection.example_code ? 'block' : 'none'; $('completeSection').classList.toggle('done', progress.has(currentSection.id)); $('completeSection').textContent = progress.has(currentSection.id) ? '本节已完成 ✓' : '标记本节已学完 ✓';
    const chapterSections = sections.filter(x => x.chapter_id === currentChapter.id); const pos = chapterSections.findIndex(x => x.id === currentSection.id);
    $('readerPrevious').disabled = pos === 0; $('readerNext').disabled = pos === chapterSections.length - 1;
    $('readerPrevious').onclick = () => pos > 0 && selectSection(chapterSections[pos - 1].id); $('readerNext').onclick = () => pos < chapterSections.length - 1 && selectSection(chapterSections[pos + 1].id);
  }

  async function completeSection() {
    if (!currentSection || !client()) return; const user = (await client().auth.getUser()).data.user; if (!user) return;
    const { error } = await client().from('section_progress').upsert({ user_id: user.id, section_id: currentSection.id, completed: true, last_read_at: new Date().toISOString() });
    if (!error) { progress.add(currentSection.id); selectSection(currentSection.id); updateCourseProgress(); }
  }

  function updateCourseProgress() { const total = sections.length; const percent = total ? Math.round(progress.size / total * 100) : 0; $('courseProgressText').textContent = `${percent}% 完成`; $('courseProgressBar').style.width = `${percent}%`; }
  function levelText(level) { return { beginner: '零基础', basic: '基础', advanced: '进阶' }[level] || level; }

  async function loadExercises(tab = exerciseTab) {
    if (!currentChapter || !client()) return; exerciseTab = tab;
    let query = client().from('chapter_exercises').select('*').eq('chapter_id', currentChapter.id).eq('active', true).order('position').order('id');
    query = tab === 'summary' ? query.eq('exercise_group', 'summary') : query.eq('exercise_group', 'after_class').eq('question_type', tab);
    const { data, error } = await query; if (error) return; exercises = data || [];
    $('exerciseCenterTitle').textContent = `${currentChapter.title} · ${tabText(tab)}`;
    document.querySelectorAll('[data-exercise-tab]').forEach(button => button.classList.toggle('active', button.dataset.exerciseTab === tab));
    $('exerciseList').innerHTML = exercises.map((exercise, index) => `<button data-exercise="${exercise.id}" type="button"><i>${index + 1}</i><span>${exercise.prompt}</span><em>${typeText(exercise.question_type)}</em></button>`).join('') || '<p class="course-empty">本题型尚未添加题目。</p>';
    document.querySelectorAll('[data-exercise]').forEach(button => button.onclick = () => selectExercise(Number(button.dataset.exercise)));
    if (exercises.length) selectExercise(exercises[0].id);
  }

  function selectExercise(id) {
    currentExercise = exercises.find(x => x.id === id); if (!currentExercise) return;
    document.querySelectorAll('[data-exercise]').forEach(button => button.classList.toggle('active', Number(button.dataset.exercise) === id));
    const exercise = currentExercise; let answer = '';
    if (exercise.question_type === 'choice') answer = `<div class="chapter-options">${(exercise.options || []).map((option, i) => `<label><input type="radio" name="chapterChoice" value="${i}"><i>${String.fromCharCode(65 + i)}</i><span>${option}</span></label>`).join('')}</div>`;
    else if (exercise.question_type === 'coding') answer = `<textarea id="exerciseAnswer" class="exercise-code" spellcheck="false">${exercise.starter_code || ''}</textarea><pre class="exercise-output" id="exerciseOutput">运行结果会显示在这里。</pre>`;
    else answer = `<textarea id="exerciseAnswer" placeholder="请写下你的答案、分析过程或思考..."></textarea>`;
    const buttonText = exercise.question_type === 'coding' ? '运行并提交代码' : '提交本题';
    $('exerciseDetail').innerHTML = `<div class="exercise-detail-head"><span>${typeText(exercise.question_type)}</span><small>${exercise.topic || ''}</small></div><h3>${exercise.prompt}</h3>${answer}<div class="exercise-feedback" id="exerciseFeedback"></div><button class="primary" id="submitExercise" type="button">${buttonText}</button>`;
    $('submitExercise').onclick = submitExercise;
  }

  async function submitExercise() {
    const exercise = currentExercise; if (!exercise) return; let answerText = '', selectedIndex = null, correct = null, score = 0;
    if (exercise.question_type === 'choice') { const selected = document.querySelector('input[name="chapterChoice"]:checked'); if (!selected) return; selectedIndex = Number(selected.value); correct = selectedIndex === exercise.correct_index; score = correct ? 100 : 0; answerText = exercise.options[selectedIndex]; }
    else {
      answerText = $('exerciseAnswer').value.trim(); if (!answerText) return;
      if (exercise.question_type === 'short_answer') { const keywords = String(exercise.correct_answer).split('|').map(x => x.trim()).filter(Boolean); const hit = keywords.filter(x => answerText.includes(x)).length; score = keywords.length ? Math.round(hit / keywords.length * 100) : 100; correct = score >= 60; }
      if (exercise.question_type === 'coding') {
        const output = $('exerciseOutput'); const submit = $('submitExercise'); submit.disabled = true; output.textContent = 'Python 正在运行...';
        try {
          const result = await window.pythonLabRuntime.execute(answerText); output.textContent = result.output || '程序运行完成，没有输出。';
          const tests = exercise.test_config || {}; const expected = String(tests.expected_output ?? '').trim(); const required = Array.isArray(tests.required_snippets) ? tests.required_snippets : [];
          const outputPassed = !expected || result.output.trim() === expected; const codePassed = required.every(snippet => answerText.includes(snippet)); correct = Boolean(result.ok && outputPassed && codePassed); score = correct ? 100 : 0;
          if (!result.ok) output.textContent = result.output;
        } catch (error) { output.textContent = String(error); correct = false; score = 0; }
        finally { submit.disabled = false; }
      }
    }
    const feedback = exercise.question_type === 'thinking' ? '思考题已保存。可以对照参考方向继续完善自己的观点。' : (correct === true ? '回答正确！' : correct === false ? '暂未通过，请结合解析再思考。' : '答案已保存。');
    $('exerciseFeedback').innerHTML = `<b>${feedback}</b><p>${exercise.explanation || exercise.correct_answer || ''}</p>`; $('exerciseFeedback').classList.add('show');
    const user = (await client().auth.getUser()).data.user; if (user) await client().from('exercise_attempts').insert({ user_id: user.id, exercise_id: exercise.id, answer_text: answerText, selected_index: selectedIndex, is_correct: correct, score, feedback });
  }

  function tabText(tab) { return { choice: '10 道选择题', short_answer: '10 道问答题', coding: '5 道动手题', summary: '5 道小结与思考题' }[tab]; }
  function typeText(type) { return { choice: '选择题', short_answer: '问答题', coding: '动手题', thinking: '思考题' }[type] || type; }

  $('completeSection').onclick = completeSection; $('copyTutorialCode').onclick = () => navigator.clipboard.writeText($('tutorialCode').textContent);
  $('openChapterExercises').onclick = () => { if (!currentChapter) return; $('chapterExercises').classList.add('open'); loadExercises('choice'); $('chapterExercises').scrollIntoView({ behavior: 'smooth' }); };
  $('closeExercises').onclick = () => { $('chapterExercises').classList.remove('open'); $('tutorial').scrollIntoView({ behavior: 'smooth' }); };
  document.querySelectorAll('[data-exercise-tab]').forEach(button => button.onclick = () => loadExercises(button.dataset.exerciseTab));
  document.querySelectorAll('[data-exercise-view]').forEach(button => button.onclick = () => { if (!currentChapter) return; const value = button.dataset.exerciseView; $('chapterExercises').classList.add('open'); loadExercises(value.startsWith('summary') ? 'summary' : value.split('-')[1]); $('chapterExercises').scrollIntoView({ behavior: 'smooth' }); });
  window.addEventListener('cloud-data-ready', loadCourse);
  window.coursePlatform = { loadCourse, loadExercises };
})();
