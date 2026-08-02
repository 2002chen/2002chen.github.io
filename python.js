(function () {
  'use strict';

  const course = window.ORIGINAL_PYTHON_COURSE || { chapters: [], sections: [] };
  const progressKey = 'python-core-progress-v1';
  const lastSectionKey = 'python-core-last-section';
  let currentSection = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(progressKey) || '{}'); } catch { return {}; }
  }

  function saveProgress(progress) {
    localStorage.setItem(progressKey, JSON.stringify(progress));
  }

  function sectionsForChapter(chapterId) {
    return course.sections.filter(section => section.chapter_id === chapterId);
  }

  function renderProgress() {
    const progress = readProgress();
    const completedCount = course.sections.filter(section => progress[section.id]).length;
    byId('pythonProgressText').textContent = `${completedCount}/${course.sections.length}`;
    byId('pythonProgressBar').style.width = course.sections.length ? `${completedCount / course.sections.length * 100}%` : '0%';
    byId('pythonAccessText').textContent = completedCount ? `已完成 ${completedCount} 节，继续保持` : '所有章节均可免费学习';
  }

  function renderCatalog() {
    const progress = readProgress();
    byId('pythonChapterList').innerHTML = course.chapters.map(chapter => {
      const chapterSections = sectionsForChapter(chapter.id);
      const completedCount = chapterSections.filter(section => progress[section.id]).length;
      const active = currentSection?.chapter_id === chapter.id;
      return `<section class="python-chapter ${active ? 'open' : ''}" data-python-chapter="${chapter.id}">
        <button class="python-chapter-toggle" type="button" aria-expanded="${active}">
          <i>${escapeHtml(chapter.cover_icon)}</i><span><b>${escapeHtml(chapter.title)}</b><small>${escapeHtml(chapter.subtitle)}</small></span><em>${completedCount}/${chapterSections.length}</em>
        </button>
        <div class="python-section-list">${chapterSections.map(section => `<button class="${section.id === currentSection?.id ? 'active' : ''} ${progress[section.id] ? 'done' : ''}" type="button" data-python-section="${section.id}"><span>${escapeHtml(section.title)}</span><i>${progress[section.id] ? '✓' : '›'}</i></button>`).join('')}</div>
      </section>`;
    }).join('');

    document.querySelectorAll('.python-chapter-toggle').forEach(button => {
      button.onclick = () => {
        const chapter = button.closest('.python-chapter');
        chapter.classList.toggle('open');
        button.setAttribute('aria-expanded', String(chapter.classList.contains('open')));
      };
    });
    document.querySelectorAll('[data-python-section]').forEach(button => {
      button.onclick = () => loadSection(button.dataset.pythonSection);
    });
  }

  function renderPractices(section) {
    byId('pythonPracticeList').innerHTML = (section.builtin_practice || []).map((practice, practiceIndex) => {
      if (practice.question_type === 'coding') {
        return `<article class="python-practice-card"><span>动手练习 ${practiceIndex + 1}</span><p>${escapeHtml(practice.prompt)}</p><pre><code>${escapeHtml(practice.starter_code || '')}</code></pre><button class="secondary" type="button" data-copy-practice="${practiceIndex}">复制起步代码</button></article>`;
      }
      return `<article class="python-practice-card"><span>思考练习 ${practiceIndex + 1}</span><p>${escapeHtml(practice.prompt)}</p><textarea aria-label="思考题回答" placeholder="用自己的话写下答案，不必追求标准句式"></textarea></article>`;
    }).join('');

    document.querySelectorAll('[data-copy-practice]').forEach(button => {
      button.onclick = () => {
        const practice = section.builtin_practice[Number(button.dataset.copyPractice)];
        navigator.clipboard.writeText(practice.starter_code || '').then(() => site.toast('起步代码已复制'));
      };
    });
  }

  function loadSection(sectionId) {
    const section = course.sections.find(candidate => candidate.id === sectionId);
    if (!section) return;
    currentSection = section;
    localStorage.setItem(lastSectionKey, section.id);
    const chapter = course.chapters.find(candidate => candidate.id === section.chapter_id);
    const sectionIndex = course.sections.findIndex(candidate => candidate.id === section.id);
    const progress = readProgress();
    const sectionUrl = new URL(location.href);
    sectionUrl.searchParams.set('section', section.id);
    history.replaceState(null, '', sectionUrl);

    byId('pythonBreadcrumb').innerHTML = `<a href="index.html">首页</a><span>›</span><a href="python.html">Python 基础</a><span>›</span><span>${escapeHtml(chapter.title)}</span>`;
    byId('pythonChapterLabel').textContent = `第 ${chapter.position} 章 · ${chapter.level === 'beginner' ? '零基础' : '基础进阶'}`;
    byId('pythonSectionTitle').textContent = section.title;
    byId('pythonSectionSummary').textContent = section.summary;
    byId('pythonSectionPosition').textContent = `${sectionIndex + 1} / ${course.sections.length}`;
    byId('pythonSectionBody').innerHTML = section.content_html;
    byId('pythonExampleCode').textContent = section.example_code || '# 本节没有示例代码';
    byId('completePythonSection').textContent = progress[section.id] ? '已完成 ✓' : '完成本节 ✓';
    byId('completePythonSection').disabled = !!progress[section.id];
    byId('pythonPrevious').disabled = sectionIndex <= 0;
    byId('pythonNext').disabled = sectionIndex >= course.sections.length - 1;
    document.querySelectorAll('[data-python-check]').forEach(button => button.classList.remove('done'));
    renderPractices(section);
    renderCatalog();

    byId('copyPythonExample').onclick = () => navigator.clipboard.writeText(section.example_code || '').then(() => site.toast('示例代码已复制'));
    byId('pythonPrevious').onclick = () => sectionIndex > 0 && loadSection(course.sections[sectionIndex - 1].id);
    byId('pythonNext').onclick = () => sectionIndex < course.sections.length - 1 && loadSection(course.sections[sectionIndex + 1].id);
    byId('completePythonSection').onclick = () => completeSection(section);
  }

  function completeSection(section) {
    const unfinishedChecks = [...document.querySelectorAll('[data-python-check]')].filter(button => !button.classList.contains('done'));
    if (unfinishedChecks.length) {
      site.toast(`请先完成本节 ${unfinishedChecks.length} 项学习检查`);
      byId('pythonTaskChecks').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const progress = readProgress();
    progress[section.id] = { completed_at: Date.now() };
    saveProgress(progress);
    localStorage.setItem('python-xp', String(Number(localStorage.getItem('python-xp') || 0) + 10));
    site.toast(`✅ ${section.title} 已完成！+10 XP`, 'success');
    renderProgress();
    loadSection(section.id);
  }

  function init() {
    if (!course.sections.length) {
      byId('pythonChapterList').innerHTML = '<p class="empty-state">课程数据暂时不可用。</p>';
      return;
    }
    document.querySelectorAll('[data-python-check]').forEach(button => {
      button.onclick = () => button.classList.toggle('done');
    });
    const params = new URLSearchParams(location.search);
    const initialSectionId = params.get('section') || localStorage.getItem(lastSectionKey) || course.sections[0].id;
    loadSection(course.sections.some(section => section.id === initialSectionId) ? initialSectionId : course.sections[0].id);
    renderProgress();
    byId('continuePython').onclick = () => {
      const lastSectionId = localStorage.getItem(lastSectionKey) || course.sections[0].id;
      loadSection(lastSectionId);
      document.querySelector('.python-course-layout').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const completedCount = Object.keys(readProgress()).length;
    if (completedCount) byId('continuePython').querySelector('span').textContent = '继续上次学习';
  }

  init();
})();
