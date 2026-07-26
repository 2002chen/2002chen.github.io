(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const lessons = window.SITE_LESSONS || [];
  const sceneQuestions = window.SCENE_QUESTIONS || [];

  /* ---- 本地进度 ---- */
  function getProgress() {
    try { return JSON.parse(localStorage.getItem('cr_progress') || '{}'); } catch { return {}; }
  }
  function saveProgress(data) {
    localStorage.setItem('cr_progress', JSON.stringify(data));
  }
  function getXP() { return Number(localStorage.getItem('cr_xp') || 0); }
  function addXP(n) { localStorage.setItem('cr_xp', String(getXP() + n)); }
  function getBadges() { try { return JSON.parse(localStorage.getItem('cr_badges') || '[]'); } catch { return []; } }
  function addBadge(id) {
    const list = getBadges();
    if (!list.includes(id)) { list.push(id); localStorage.setItem('cr_badges', JSON.stringify(list)); }
  }

  /* ---- 渲染引擎 ---- */
  let currentLesson = null;
  let currentStepIndex = 0;
  let lessonQuizState = {}; // { qid: selectedIndex }

  function getLessonById(id) {
    return lessons.find(l => l.id === id) || null;
  }

  function renderLessonList() {
    const list = $('chapterList');
    if (!list) return;
    if (!lessons.length) { list.innerHTML = '<p class="empty-state">课程加载中...</p>'; return; }
    const progress = getProgress();
    list.innerHTML = lessons.map((l, i) => {
      const done = progress[l.id]?.status === 'completed';
      return `<button class="lesson-nav-item ${done ? 'done' : ''}" data-lesson-idx="${i}">
        <span class="lesson-nav-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="lesson-nav-title">${l.title}</span>
        <span class="lesson-nav-status">${done ? '✓' : (l.device_main === 'mobile' ? '📱' : '')}</span>
      </button>`;
    }).join('');
    list.querySelectorAll('.lesson-nav-item').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.lessonIdx);
        loadLesson(lessons[idx].id);
      };
    });
  }

  function loadLesson(id) {
    const lesson = getLessonById(id);
    if (!lesson) { site.toast('未找到该课程'); return; }
    currentLesson = lesson;
    currentStepIndex = 0;
    lessonQuizState = {};
    renderLessonReader();
    updateProgressUI();
  }

  function renderLessonReader() {
    const lesson = currentLesson;
    if (!lesson) return;
    $('readerEmpty').hidden = true;
    $('readerContent').hidden = false;
    $('readerBreadcrumb').innerHTML = `<a href="index.html">首页</a><span>›</span><span>${lesson.title}</span>`;
    $('readerType').textContent = `场景 · ${lesson.device_main === 'mobile' ? '📱手机可完成' : '💻双端'}`;
    $('readerTitle').textContent = lesson.title;
    $('readerSummary').textContent = `约 ${lesson.duration_min} 分钟 · 完成可得 ${lesson.xp_reward} XP`;
    $('readerReadTime').textContent = `${lesson.duration_min} 分钟`;

    /* 渲染步骤 */
    let html = '';
    html += `<div class="lesson-goals"><p class="eyebrow">本节你将搞定</p><ul>${lesson.goals.map(g => `<li>${g}</li>`).join('')}</ul></div>`;

    lesson.steps.forEach((step, si) => {
      if (step.type === 'pain') {
        html += `<div class="lesson-block pain-block"><h3>💡 先说说痛点</h3>${step.content}</div>`;
      } else if (step.type === 'result') {
        html += `<div class="lesson-block result-block"><h3>🎯 本节结果</h3>${step.content}</div>`;
      } else if (step.type === 'code_block') {
        html += `<div class="lesson-block code-block"><h3>💻 短代码</h3><pre class="lesson-code"><code>${escapeHtml(step.lines)}</code></pre><div class="lesson-plain-talk"><b>人话：</b>${step.plain_talk}</div></div>`;
      } else if (step.type === 'prompt_card') {
        html += `<div class="lesson-block prompt-card-block"><h3>🤖 提示词卡</h3>`;
        if (step.bad) {
          html += `<div class="prompt-example bad"><b>差问法示例：</b><p>${escapeHtml(step.bad)}</p></div>`;
        }
        html += `<div class="prompt-example good"><b>好问法</b><pre class="prompt-text" id="promptText-${si}">${escapeHtml(step.good)}</pre><button class="secondary prompt-copy-btn" data-copy="promptText-${si}">${step.copy_label || '复制到 AI'}</button></div>`;
        html += `</div>`;
      } else if (step.type === 'quiz_inline') {
        html += `<div class="lesson-block quiz-inline-block"><h3>✏️ 练习</h3><div class="inline-quiz-list" data-quiz-ids="${(step.quiz_ids || []).join(',')}"></div></div>`;
      } else if (step.type === 'summary') {
        html += `<div class="lesson-block summary-block"><h3>✅ 小结</h3>${step.content}</div>`;
      } else if (step.type === 'computer_only') {
        html += `<details class="lesson-block computer-extra"><summary>💻 电脑加强（可选）</summary>${step.content}</details>`;
      }
    });

    $('tutorialBody').innerHTML = html;

    /* 绑定提示词复制 */
    document.querySelectorAll('.prompt-copy-btn').forEach(btn => {
      btn.onclick = () => {
        const pre = $(btn.dataset.copy);
        if (pre) {
          navigator.clipboard.writeText(pre.textContent).then(() => {
            site.toast('已复制到剪贴板');
          }).catch(() => {
            /* fallback */
            const textarea = document.createElement('textarea');
            textarea.value = pre.textContent;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            site.toast('已复制到剪贴板');
          });
        }
      };
    });

    /* 渲染练习题 */
    renderInlineQuizzes();

    /* 隐藏旧的代码示例区（新课程不用） */
    $('tutorialCodeBox').hidden = true;

    /* 更新完成按钮 */
    const progress = getProgress();
    const done = progress[lesson.id]?.status === 'completed';
    $('completeSection').textContent = done ? '已完成 ✓' : '完成本节 ✓';
    $('completeSection').disabled = done;

    /* 更新推荐 */
    const idx = lessons.findIndex(l => l.id === lesson.id);
    if (idx >= 0 && idx < lessons.length - 1) {
      $('recommendation').hidden = false;
      $('recommendationLink').textContent = `下一课：${lessons[idx + 1].title} →`;
      $('recommendationLink').onclick = e => { e.preventDefault(); loadLesson(lessons[idx + 1].id); };
    } else {
      $('recommendation').hidden = true;
    }

    $('readerPrevious').onclick = () => {
      if (idx > 0) loadLesson(lessons[idx - 1].id);
    };
    $('readerNext').onclick = () => {
      if (idx >= 0 && idx < lessons.length - 1) loadLesson(lessons[idx + 1].id);
    };

    /* 完成按钮 */
    $('completeSection').onclick = () => {
      if (done) return;
      const now = Date.now();
      const p = getProgress();
      p[lesson.id] = { status: 'completed', score: calcQuizScore(), ts: now };
      saveProgress(p);
      addXP(lesson.xp_reward || 10);
      if (lesson.badge) addBadge(lesson.badge);
      site.toast(`✅ ${lesson.title} 已完成！+${lesson.xp_reward || 10} XP`);
      $('completeSection').textContent = '已完成 ✓';
      $('completeSection').disabled = true;
      updateProgressUI();
      /* 显示分享弹层 */
      showShareCard(lesson.title);
    };

    /* 学习检查 */
    document.querySelectorAll('[data-study-check]').forEach(btn => {
      btn.onclick = () => {
        btn.classList.toggle('checked');
        site.toast('已记录');
      };
    });

    /* 游客注册提示 */
    updateTrialCallout();
  }

  function renderInlineQuizzes() {
    document.querySelectorAll('.inline-quiz-list').forEach(container => {
      const ids = (container.dataset.quizIds || '').split(',').filter(Boolean);
      container.innerHTML = ids.map((qid, qi) => {
        const q = sceneQuestions.find(sq => sq.id === qid);
        if (!q) return '';
        const selected = lessonQuizState[qid];
        return `<div class="inline-quiz-item" data-qid="${qid}">
          <div class="iq-stem"><b>第 ${qi + 1} 题：</b>${escapeHtml(q.stem).replace(/\n/g, '<br>')}</div>
          <div class="iq-options">${q.options.map((opt, oi) => {
            const cls = selected !== undefined ? (oi === q.correct_index ? 'correct' : (oi === selected ? 'wrong' : '')) : '';
            return `<button class="iq-option ${cls}" data-opt="${oi}" ${selected !== undefined ? 'disabled' : ''}>${String.fromCharCode(65 + oi)}. ${escapeHtml(opt)}</button>`;
          }).join('')}</div>
          <div class="iq-feedback" id="iq-feedback-${qid}" ${selected === undefined ? 'hidden' : ''}>
            ${selected !== undefined ? `<p class="iq-result ${selected === q.correct_index ? 'correct' : 'wrong'}">${selected === q.correct_index ? '✓ 正确！' : '✗ 不对哦'}</p><p class="iq-explain">${escapeHtml(q.explain)}</p>` : ''}
          </div>
        </div>`;
      }).join('');

      container.querySelectorAll('.iq-option:not([disabled])').forEach(btn => {
        btn.onclick = () => {
          const item = btn.closest('.inline-quiz-item');
          const qid = item.dataset.qid;
          const q = sceneQuestions.find(sq => sq.id === qid);
          if (!q) return;
          const chosen = Number(btn.dataset.opt);
          lessonQuizState[qid] = chosen;
          /* 重新渲染 */
          renderInlineQuizzes();
          /* 检查是否全部答完 */
          const allAnswered = container.querySelectorAll('.inline-quiz-item').length === container.querySelectorAll('.iq-option[disabled]').length;
          if (allAnswered) {
            const correct = container.querySelectorAll('.iq-option.correct').length;
            const total = container.querySelectorAll('.inline-quiz-item').length;
            site.toast(`练习完成：${correct}/${total} 正确`);
          }
        };
      });
    });
  }

  function calcQuizScore() {
    if (!currentLesson) return 0;
    const ids = currentLesson.quiz_ids || [];
    let correct = 0;
    ids.forEach(qid => {
      const q = sceneQuestions.find(sq => sq.id === qid);
      if (q && lessonQuizState[qid] === q.correct_index) correct++;
    });
    return ids.length ? Math.round(correct / ids.length * 100) : 0;
  }

  function showShareCard(title) {
    /* 轻提示即可，完整分享卡在 P1 实现 */
  }

  function updateProgressUI() {
    const progress = getProgress();
    const doneCount = Object.values(progress).filter(p => p.status === 'completed').length;
    const total = lessons.length;
    $('courseProgressText').textContent = `${doneCount}/${total}`;
    $('courseProgressBar').style.width = total ? `${doneCount / total * 100}%` : '0%';
    $('courseAccessText').textContent = total ? `${doneCount} 个场景已完成` : '课程加载中...';
    renderLessonList();
  }

  function updateTrialCallout() {
    (async () => {
      const ctx = await site.ready;
      $('trialCallout').hidden = !!ctx.session;
    })();
  }

  function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  /* ---- 初始化 ---- */
  async function init() {
    await site.ready;
    updateProgressUI();

    /* 检查 URL 参数 */
    const params = new URLSearchParams(location.search);
    const lessonId = params.get('lesson') || localStorage.getItem('cr_last_lesson');

    if (lessonId && getLessonById(lessonId)) {
      loadLesson(lessonId);
      localStorage.setItem('cr_last_lesson', lessonId);
    } else if (lessons.length) {
      loadLesson(lessons[0].id);
      localStorage.setItem('cr_last_lesson', lessons[0].id);
    } else {
      $('readerEmpty').hidden = false;
      $('readerContent').hidden = true;
    }
  }

  init();

  /* 暴露给全局 */
  window.siteLessons = { loadLesson, getLessonById, lessons };
})();
