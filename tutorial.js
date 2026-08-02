(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const lessons = window.SITE_LESSONS || [];
  const questions = window.SCENE_QUESTIONS || [];
  const sessionState = {};
  let currentLesson = null;
  let currentStageIndex = 0;

  function getProgress() {
    try { return JSON.parse(localStorage.getItem('cr_progress') || '{}'); } catch { return {}; }
  }

  function saveProgress(progress) {
    localStorage.setItem('cr_progress', JSON.stringify(progress));
  }

  function addXP(amount) {
    const current = Number(localStorage.getItem('cr_xp') || 0);
    localStorage.setItem('cr_xp', String(current + amount));
  }

  function addBadge(id) {
    if (!id) return;
    let badges = [];
    try { badges = JSON.parse(localStorage.getItem('cr_badges') || '[]'); } catch {}
    if (!badges.includes(id)) {
      badges.push(id);
      localStorage.setItem('cr_badges', JSON.stringify(badges));
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function getLessonById(id) {
    return lessons.find(lesson => lesson.id === id) || null;
  }

  function getLessonStages(lesson) {
    const stages = [
      { type: 'intro', label: '今天做什么' },
      { type: 'choice', label: '先猜一下' },
      { type: 'code', label: '点一下运行' },
      { type: 'steps', label: '记住三步' }
    ];
    if (lesson.prompt) stages.push({ type: 'prompt', label: '复制给 AI' });
    stages.push({ type: 'quiz', label: '检查理解' });
    stages.push({ type: 'summary', label: '完成本课' });
    return stages;
  }

  function getStageState() {
    if (!currentLesson) return {};
    sessionState[currentLesson.id] ||= {};
    sessionState[currentLesson.id][currentStageIndex] ||= {};
    return sessionState[currentLesson.id][currentStageIndex];
  }

  function isCurrentStageReady() {
    if (!currentLesson) return false;
    const stage = getLessonStages(currentLesson)[currentStageIndex];
    const state = getStageState();
    if (stage.type === 'choice') return !!state.correct;
    if (stage.type === 'code') return !!state.ran;
    if (stage.type === 'quiz') return currentLesson.quiz_ids.every(questionId => state.answers?.[questionId]?.correct);
    return true;
  }

  function groupLessonsByModule() {
    const modules = [];
    lessons.forEach(lesson => {
      let module = modules.find(item => item.name === lesson.module);
      if (!module) {
        module = { name: lesson.module, lessons: [] };
        modules.push(module);
      }
      module.lessons.push(lesson);
    });
    return modules;
  }

  function renderLessonList() {
    const list = $('chapterList');
    if (!list) return;
    const progress = getProgress();
    if (!lessons.length) {
      list.innerHTML = '<p class="empty-state">课程暂时没有加载出来，请刷新重试。</p>';
      return;
    }

    list.innerHTML = groupLessonsByModule().map(module => `
      <section class="course-module">
        <p class="course-module-label">${escapeHtml(module.name)}</p>
        ${module.lessons.map(lesson => {
          const done = progress[lesson.id]?.status === 'completed';
          const active = currentLesson?.id === lesson.id;
          return `<button class="lesson-nav-item ${done ? 'done' : ''} ${active ? 'active' : ''}" data-lesson-id="${lesson.id}" type="button">
            <span class="lesson-nav-num">${String(lesson.position).padStart(2, '0')}</span>
            <span class="lesson-nav-title">${escapeHtml(lesson.title)}<small>${lesson.duration_min} 分钟</small></span>
            <span class="lesson-nav-status">${done ? '✓' : '›'}</span>
          </button>`;
        }).join('')}
      </section>`
    ).join('');

    list.querySelectorAll('[data-lesson-id]').forEach(button => {
      button.onclick = () => {
        loadLesson(button.dataset.lessonId);
        if (matchMedia('(max-width: 900px)').matches) setCatalogCollapsed(true);
      };
    });
  }

  function setCatalogCollapsed(collapsed) {
    const catalog = document.querySelector('.catalog');
    if (!catalog) return;
    catalog.classList.toggle('catalog-collapsed', collapsed);
    const button = $('collapseCatalog');
    if (button) {
      button.textContent = collapsed ? '展开' : '收起';
      button.setAttribute('aria-expanded', String(!collapsed));
    }
  }

  function loadLesson(id) {
    const lesson = getLessonById(id);
    if (!lesson) {
      site.toast('没有找到这节课，已回到第一课');
      if (lessons[0]) loadLesson(lessons[0].id);
      return;
    }

    currentLesson = lesson;
    currentStageIndex = 0;
    localStorage.setItem('cr_last_lesson', lesson.id);
    const lessonUrl = new URL(location.href);
    lessonUrl.searchParams.set('lesson', lesson.id);
    history.replaceState(null, '', lessonUrl);
    $('readerEmpty').hidden = true;
    $('readerContent').hidden = false;
    renderLessonList();
    renderCurrentStage();
  }

  function renderCurrentStage() {
    if (!currentLesson) return;
    const stages = getLessonStages(currentLesson);
    const stage = stages[currentStageIndex];
    const progress = getProgress();
    const done = progress[currentLesson.id]?.status === 'completed';

    $('readerBreadcrumb').innerHTML = `<span>${escapeHtml(currentLesson.module_short)}</span><span>›</span><span>第 ${currentLesson.position} 课</span>`;
    $('readerType').textContent = '手机零基础实战';
    $('readerTitle').textContent = currentLesson.title;
    $('readerSummary').textContent = `${currentLesson.duration_min} 分钟 · 不用输入大段代码`;
    $('readerReadTime').textContent = done ? '已完成' : `第 ${currentStageIndex + 1} 步`;
    $('lessonStageText').textContent = `${currentStageIndex + 1}/${stages.length} · ${stage.label}`;
    $('lessonStageBar').style.width = `${(currentStageIndex + 1) / stages.length * 100}%`;

    if (stage.type === 'intro') renderIntroStage();
    if (stage.type === 'choice') renderChoiceStage();
    if (stage.type === 'code') renderCodeStage();
    if (stage.type === 'steps') renderStepsStage();
    if (stage.type === 'prompt') renderPromptStage();
    if (stage.type === 'quiz') renderQuizStage();
    if (stage.type === 'summary') renderSummaryStage(done);

    updateStageActions();
    renderLessonList();
  }

  function renderIntroStage() {
    $('tutorialBody').innerHTML = `
      <section class="course-stage stage-intro">
        <img class="course-stage-cover" src="${currentLesson.cover}" alt="${escapeHtml(currentLesson.cover_alt)}">
        <div class="course-stage-copy">
          <p class="eyebrow">今天的小任务</p>
          <h3>${escapeHtml(currentLesson.title)}</h3>
          <p>${currentLesson.intro}</p>
          <div class="stage-result"><b>做完你会：</b><p>${currentLesson.result}</p></div>
        </div>
      </section>`;
  }

  function renderChoiceStage() {
    const state = getStageState();
    const choice = currentLesson.choice;
    $('tutorialBody').innerHTML = `
      <section class="course-stage stage-choice">
        <p class="eyebrow">先别急着看答案</p>
        <h3>${choice.question}</h3>
        <div class="tap-options">
          ${choice.options.map((option, index) => {
            const selected = state.selected === index;
            const className = state.correct && index === choice.correct ? 'correct' : (selected && !state.correct ? 'wrong' : '');
            return `<button class="tap-option ${className}" type="button" data-choice-index="${index}" ${state.correct ? 'disabled' : ''}>
              <span>${String.fromCharCode(65 + index)}</span><b>${option}</b>
            </button>`;
          }).join('')}
        </div>
        <div class="stage-feedback ${state.correct ? 'success' : (state.selected !== undefined ? 'retry' : '')}" ${state.selected === undefined ? 'hidden' : ''}>
          <b>${state.correct ? '答对了，可以继续' : '没关系，再选一次'}</b>
          <p>${state.correct ? choice.explain : '先回到题目中的关键词，再试一个答案。'}</p>
        </div>
      </section>`;

    document.querySelectorAll('[data-choice-index]').forEach(button => {
      button.onclick = () => {
        const index = Number(button.dataset.choiceIndex);
        state.selected = index;
        state.correct = index === choice.correct;
        renderCurrentStage();
        if (state.correct) site.toast('选对了，下一步已经打开');
      };
    });
  }

  function renderCodeStage() {
    const state = getStageState();
    state.variant ??= 0;
    const code = currentLesson.code;
    const variant = code.variants[state.variant];
    $('tutorialBody').innerHTML = `
      <section class="course-stage stage-code">
        <p class="eyebrow">不用打字 · 点选即可</p>
        <h3>${escapeHtml(code.title)}</h3>
        <p>${code.lead}</p>
        <div class="code-choice-row" aria-label="选择代码内容">
          ${code.variants.map((item, index) => `<button type="button" class="${index === state.variant ? 'active' : ''}" data-code-variant="${index}">${escapeHtml(item.label)}</button>`).join('')}
        </div>
        <div class="phone-code-card">
          <div class="phone-code-head"><span>短代码</span><button type="button" data-copy-code>复制</button></div>
          <pre id="mobileLessonCode"><code>${escapeHtml(variant.code)}</code></pre>
          <button class="primary mobile-run-button" type="button" id="mobileRunCode">▶ 点一下运行</button>
          <div class="mobile-code-output" id="mobileCodeOutput" ${state.ran ? '' : 'hidden'}>
            <span>运行结果</span><pre>${escapeHtml(variant.output)}</pre>
          </div>
        </div>
        <div class="plain-language"><b>人话解释</b><p>${code.plain}</p></div>
      </section>`;

    document.querySelectorAll('[data-code-variant]').forEach(button => {
      button.onclick = () => {
        state.variant = Number(button.dataset.codeVariant);
        state.ran = false;
        renderCurrentStage();
      };
    });

    $('mobileRunCode').onclick = () => {
      state.ran = true;
      $('mobileCodeOutput').hidden = false;
      $('mobileRunCode').textContent = '✓ 已运行，再换一个试试';
      updateStageActions();
      site.toast('运行完成，看看结果和你猜的一样吗？');
    };

    document.querySelector('[data-copy-code]').onclick = () => copyText(variant.code, '代码已复制');
  }

  function renderStepsStage() {
    $('tutorialBody').innerHTML = `
      <section class="course-stage stage-steps">
        <p class="eyebrow">手机操作只记三步</p>
        <h3>不用记整段，只记住这条小路线</h3>
        <div class="phone-step-list">
          ${currentLesson.steps.map((step, index) => `<article><i>${index + 1}</i><div><b>${escapeHtml(step[0])}</b><p>${escapeHtml(step[1])}</p></div></article>`).join('')}
        </div>
        <div class="zero-pressure-note">忘了没关系。下一次照着同样的顺序再做一遍，比死记更有效。</div>
      </section>`;
  }

  function renderPromptStage() {
    const prompt = currentLesson.prompt;
    const state = getStageState();
    $('tutorialBody').innerHTML = `
      <section class="course-stage stage-prompt">
        <p class="eyebrow">不用自己重新组织语言</p>
        <h3>${escapeHtml(prompt.title)}</h3>
        <p>这段提示词已经按零基础和手机操作整理好。复制后，可粘贴到你常用的 AI 对话工具。</p>
        <div class="mobile-prompt-card">
          <pre id="mobilePromptText">${escapeHtml(prompt.text)}</pre>
          <button class="primary" type="button" id="copyMobilePrompt">${state.copied ? '✓ 已复制' : '复制提示词'}</button>
        </div>
        <p class="privacy-note">不要粘贴真实账单、姓名、手机号或工作机密；练习数据用虚构数字即可。</p>
      </section>`;

    $('copyMobilePrompt').onclick = async () => {
      await copyText(prompt.text, '提示词已复制，可以粘贴到 AI 对话框');
      state.copied = true;
      $('copyMobilePrompt').textContent = '✓ 已复制';
    };
  }

  function renderQuizStage() {
    const state = getStageState();
    state.answers ||= {};
    const lessonQuestions = currentLesson.quiz_ids.map(id => questions.find(question => question.id === id)).filter(Boolean);
    const correctCount = lessonQuestions.filter(question => state.answers[question.id]?.correct).length;
    $('tutorialBody').innerHTML = `
      <section class="course-stage stage-quiz">
        <p class="eyebrow">答错可以马上再选</p>
        <h3>两道题，确认刚才真的看懂了</h3>
        <p class="quiz-mini-progress">已答对 ${correctCount}/${lessonQuestions.length}</p>
        <div class="mobile-quiz-list">
          ${lessonQuestions.map((question, questionIndex) => renderQuestion(question, questionIndex, state.answers[question.id])).join('')}
        </div>
      </section>`;

    document.querySelectorAll('[data-quiz-option]').forEach(button => {
      button.onclick = () => {
        const question = questions.find(item => item.id === button.dataset.questionId);
        if (!question) return;
        const selected = Number(button.dataset.quizOption);
        state.answers[question.id] = { selected, correct: selected === question.correct_index };
        renderCurrentStage();
        if (selected === question.correct_index) site.toast('答对了');
      };
    });
  }

  function renderQuestion(question, questionIndex, answer) {
    return `<article class="mobile-quiz-item">
      <div class="mobile-quiz-title"><span>${questionIndex + 1}</span><h4>${question.stem}</h4></div>
      <div class="mobile-quiz-options">
        ${question.options.map((option, optionIndex) => {
          const isCorrect = answer?.correct && optionIndex === question.correct_index;
          const isWrong = answer && !answer.correct && answer.selected === optionIndex;
          return `<button type="button" class="${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}" data-question-id="${question.id}" data-quiz-option="${optionIndex}" ${answer?.correct ? 'disabled' : ''}>
            <span>${String.fromCharCode(65 + optionIndex)}</span>${escapeHtml(option)}
          </button>`;
        }).join('')}
      </div>
      ${answer ? `<div class="quiz-answer-note ${answer.correct ? 'correct' : 'wrong'}"><b>${answer.correct ? '答对了' : '再试一次'}</b><p>${answer.correct ? escapeHtml(question.explain) : '重新看一眼题目中的数字或关键词。'}</p></div>` : ''}
    </article>`;
  }

  function renderSummaryStage(done) {
    const lessonIndex = lessons.findIndex(lesson => lesson.id === currentLesson.id);
    const nextLesson = lessons[lessonIndex + 1];
    $('tutorialBody').innerHTML = `
      <section class="course-stage stage-summary">
        <div class="summary-check">✓</div>
        <p class="eyebrow">这一课只带走一句话</p>
        <h3>${currentLesson.summary}</h3>
        <div class="lesson-finish-card">
          <span>你刚刚完成了</span>
          <b>猜结果 → 点运行 → 看反馈 → 做检查</b>
          <p>${done ? '这节课已经记录到“我的学习”。' : `完成后获得 ${currentLesson.xp_reward} XP${currentLesson.badge_label ? ` 和“${currentLesson.badge_label}”徽章` : ''}。`}</p>
        </div>
        ${nextLesson ? `<p class="next-preview">下一课：${escapeHtml(nextLesson.title)}</p>` : '<p class="next-preview">你已经完成全部 12 节手机实战课。</p>'}
      </section>`;
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    site.toast(successMessage);
  }

  function updateStageActions() {
    const stages = getLessonStages(currentLesson);
    const stage = stages[currentStageIndex];
    const previousButton = $('readerPrevious');
    const nextButton = $('readerNext');
    const completeButton = $('completeSection');
    const ready = isCurrentStageReady();

    previousButton.hidden = currentStageIndex === 0;
    previousButton.disabled = currentStageIndex === 0;
    nextButton.hidden = stage.type === 'summary';
    nextButton.disabled = !ready;
    nextButton.textContent = ready ? '下一步 →' : (stage.type === 'choice' ? '先选对答案' : stage.type === 'code' ? '先点运行' : '先完成本步');
    completeButton.hidden = stage.type !== 'summary';
    const done = getProgress()[currentLesson.id]?.status === 'completed';
    completeButton.textContent = done ? '进入下一课 →' : '完成本课 ✓';
  }

  function moveStage(direction) {
    const stages = getLessonStages(currentLesson);
    const nextIndex = currentStageIndex + direction;
    if (nextIndex < 0 || nextIndex >= stages.length) return;
    if (direction > 0 && !isCurrentStageReady()) return;
    currentStageIndex = nextIndex;
    renderCurrentStage();
    document.querySelector('.reader')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function completeCurrentLesson() {
    const progress = getProgress();
    const wasDone = progress[currentLesson.id]?.status === 'completed';
    const currentIndex = lessons.findIndex(lesson => lesson.id === currentLesson.id);
    const nextLesson = lessons[currentIndex + 1];

    if (!wasDone) {
      progress[currentLesson.id] = { status: 'completed', score: 100, ts: Date.now() };
      saveProgress(progress);
      addXP(currentLesson.xp_reward);
      addBadge(currentLesson.badge);
      site.toast(`本课完成，获得 ${currentLesson.xp_reward} XP`);
      updateProgressUI();
      renderCurrentStage();
      return;
    }

    if (nextLesson) loadLesson(nextLesson.id);
    else {
      site.toast('12 节手机实战课全部完成');
      location.href = 'learning.html';
    }
  }

  function updateProgressUI() {
    const progress = getProgress();
    const doneCount = lessons.filter(lesson => progress[lesson.id]?.status === 'completed').length;
    $('courseProgressText').textContent = `${doneCount}/${lessons.length}`;
    $('courseProgressBar').style.width = lessons.length ? `${doneCount / lessons.length * 100}%` : '0%';
    $('courseAccessText').textContent = doneCount ? `已完成 ${doneCount} 节，继续下一小步` : '从 5 分钟第一课开始';
    renderLessonList();
  }

  function init() {
    updateProgressUI();
    $('collapseCatalog').onclick = () => {
      const collapsed = document.querySelector('.catalog')?.classList.contains('catalog-collapsed');
      setCatalogCollapsed(!collapsed);
    };
    $('readerPrevious').onclick = () => moveStage(-1);
    $('readerNext').onclick = () => moveStage(1);
    $('completeSection').onclick = completeCurrentLesson;

    const params = new URLSearchParams(location.search);
    const requestedLesson = params.get('lesson') || localStorage.getItem('cr_last_lesson');
    const firstLessonId = lessons[0]?.id;
    loadLesson(getLessonById(requestedLesson) ? requestedLesson : firstLessonId);
    if (matchMedia('(max-width: 900px)').matches) setCatalogCollapsed(true);
  }

  init();
  window.siteLessons = { loadLesson, getLessonById, lessons };
})();
