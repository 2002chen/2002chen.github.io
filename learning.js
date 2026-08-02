(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  function localState() { try { return JSON.parse(localStorage.getItem('python-learning-v2') || '{}'); } catch { return {}; } }
  function heatmap(activeDates = []) {
    const active = new Map(activeDates.map(date => [new Date(date).toDateString(), (activeDates.filter(item => new Date(item).toDateString() === new Date(date).toDateString()).length)]));
    const days = Array.from({ length: 98 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - 97 + index); const count = active.get(date.toDateString()) || 0; return `<i data-level="${Math.min(3, count)}" title="${date.toLocaleDateString('zh-CN')} · ${count} 次学习"></i>`; });
    $('heatmap').innerHTML = days.join('');
  }
  function paintAbilities(completed, attempts) {
    const base = Math.min(100, completed * 12), quiz = Math.min(100, attempts * 4);
    const data = [['变量', Math.max(10, base)], ['条件', Math.max(5, base - 10)], ['循环', Math.max(5, Math.round((base + quiz) / 2))], ['函数', Math.max(3, base - 25)], ['类', Math.max(2, base - 45)], ['文件', Math.max(2, base - 35)]];
    $('abilityList').innerHTML = data.map(item => `<div><span>${item[0]}</span><i style="--ability:${item[1]}%"></i><b>${item[1]}%</b></div>`).join('');
  }
  function unlock(selector) { document.querySelector(`[data-badge="${selector}"]`)?.classList.add('unlocked'); }
  async function load() {
    const context = await site.ready, local = localState();
    let scenarioProgress = {}, pythonCoreProgress = {};
    try { scenarioProgress = JSON.parse(localStorage.getItem('cr_progress') || '{}'); } catch {}
    try { pythonCoreProgress = JSON.parse(localStorage.getItem('python-core-progress-v1') || '{}'); } catch {}
    const scenarioCompleted = Object.entries(scenarioProgress).filter(([id, item]) => id.startsWith('mobile-lesson-') && item?.status === 'completed').length;
    const pythonCoreCompleted = Object.keys(pythonCoreProgress).length;
    let completed = Object.keys(local.completedSections || {}).length, total = 40, attempts = 0, correct = 0, dates = [], messages = [], chapters = 0, totalChapters = 20;
    const xp = Number(localStorage.getItem('python-xp') || 0);
    if (context.session) {
      $('accountLead').textContent = `${context.session.user.email} · 学习数据已从云端同步`;
      const [progressResult, attemptsResult, chaptersResult, sectionsResult, messagesResult] = await Promise.all([
        context.client.from('section_progress').select('section_id,completed,last_read_at').eq('completed', true),
        context.client.from('quiz_attempts').select('is_correct,created_at'),
        context.client.from('course_chapters').select('id').eq('active', true),
        context.client.from('course_sections').select('id,chapter_id').eq('active', true),
        context.client.from('user_messages').select('id,title,status,admin_reply,user_read_at,created_at').order('created_at', { ascending: false }).limit(10)
      ]);
      completed = progressResult.data?.length || 0; total = sectionsResult.data?.length || 40;
      attempts = attemptsResult.data?.length || 0; correct = (attemptsResult.data || []).filter(item => item.is_correct).length;
      dates = [...(progressResult.data || []).map(item => item.last_read_at), ...(attemptsResult.data || []).map(item => item.created_at)].filter(Boolean);
      totalChapters = chaptersResult.data?.length || 8;
      const doneIds = new Set((progressResult.data || []).map(item => String(item.section_id)));
      const chapterGroups = new Map();
      (sectionsResult.data || []).forEach(item => { const list = chapterGroups.get(String(item.chapter_id)) || []; list.push(String(item.id)); chapterGroups.set(String(item.chapter_id), list); });
      chapters = [...chapterGroups.values()].filter(list => list.length && list.every(id => doneIds.has(id))).length;
      messages = messagesResult.data || [];
    } else {
      $('accountLead').innerHTML = '当前显示浏览器中的本地学习记录。<button class="text-button" id="loginForSync" type="button">登录后跨设备同步</button>';
      setTimeout(() => { if ($('loginForSync')) $('loginForSync').onclick = () => site.openAuth(); });
      dates = Object.keys(local.completedSections || {}).map(() => new Date().toISOString());
      attempts = Number(localStorage.getItem('python-local-attempts') || 0); correct = Number(localStorage.getItem('python-local-correct') || 0);
    }
    const combinedCompleted = scenarioCompleted + pythonCoreCompleted;
    const combinedTotal = 48;
    const percent = Math.round(combinedCompleted / combinedTotal * 100), accuracy = attempts ? Math.round(correct / attempts * 100) : 0;
    const completedPythonChapters = Array.from({ length: 12 }, (_, chapterIndex) => chapterIndex + 1).filter(chapterNumber => [1, 2, 3].every(sectionNumber => pythonCoreProgress[`original-section-${chapterNumber}-${sectionNumber}`])).length;
    $('sectionProgress').textContent = `${scenarioCompleted}/12`; $('pythonCoreProgress').textContent = `${pythonCoreCompleted}/36`; $('accuracy').textContent = `${accuracy}%`; $('overallProgress').textContent = `${percent}%`; $('overallProgressBar').style.width = `${percent}%`; $('progressDetail').textContent = `手机实战 ${scenarioCompleted}/12 · Python 基础 ${pythonCoreCompleted}/36`;
    $('chapterCount').textContent = `${completedPythonChapters}/12`; $('chapterRing').style.setProperty('--score', `${completedPythonChapters / 12 * 100}%`);
    const streak = calculateStreak(dates); $('streakDays').textContent = `${streak} 天`; localStorage.setItem('python-streak', String(streak)); $('studyTime').textContent = `${scenarioCompleted * 7 + pythonCoreCompleted * 12 + attempts * 2} 分钟`;
    heatmap(dates); paintAbilities(completed, attempts);
    if (localStorage.getItem('python-lab-code-v2')) unlock('first-code'); if (attempts >= 10) unlock('ten-quiz'); if (completed >= 1) unlock('first-section'); if (xp >= 200) unlock('hundred-run'); /* V4 */ try { const b = JSON.parse(localStorage.getItem('cr_badges') || '[]'); if (b.includes('first_code_read')) unlock('first_code_read'); if (b.includes('prompt_starter')) unlock('prompt_starter'); if (b.includes('file_sort_theory')) unlock('file_sort_theory'); } catch(e) {}
    const unreadMessages = messages.filter(message => message.admin_reply && !message.user_read_at);
    $('messageNotifications').closest('.message-notice-card')?.classList.toggle('has-unread', unreadMessages.length > 0);
    $('messageUnreadCount').textContent = `${unreadMessages.length} 条未读`;
    $('messageNotifications').innerHTML = unreadMessages.length ? unreadMessages.map(message => `<article class="message-notification"><div><b>${site.escapeHtml(message.title)}</b><small>${new Date(message.created_at).toLocaleDateString('zh-CN')}</small><p>${site.escapeHtml(message.admin_reply)}</p></div><button class="secondary" type="button" data-read-user-message="${message.id}">标记已读</button></article>`).join('') : '<p class="empty-state">暂无新回复。</p>';
    document.querySelectorAll('[data-read-user-message]').forEach(button => button.onclick = async () => { button.disabled = true; const { error } = await context.client.rpc('mark_message_read', { message_id: Number(button.dataset.readUserMessage) }); if (error) { site.toast(`消息标记失败：${error.message}`, 'error'); button.disabled = false; return; } await load(); await site.refreshUnreadReplies(); });
    if (messages.length) $('messageHistory').innerHTML = messages.map(message => `<article><b>${site.escapeHtml(message.title)}</b><small class="muted">${new Date(message.created_at).toLocaleDateString('zh-CN')} · ${statusText(message.status)}</small>${message.admin_reply ? `<p>管理员回复：${site.escapeHtml(message.admin_reply)}</p>` : ''}</article>`).join('');
    $('nextSuggestion').textContent = completed ? (accuracy < 70 && attempts ? '正确率还有提升空间，建议进入错题重做并复习相关知识点。' : '保持节奏：继续下一节教程，再完成两道练习题。') : '从第一节教程开始，完成一次“理解—动手—检查”。';
  }
  function calculateStreak(dates) {
    const set = new Set(dates.map(value => new Date(value).toDateString())); let streak = 0, cursor = new Date();
    if (!set.has(cursor.toDateString())) { cursor.setDate(cursor.getDate() - 1); }
    while (set.has(cursor.toDateString())) { streak++; cursor.setDate(cursor.getDate() - 1); }
    return streak;
  }
  function statusText(value) { return { new: '等待回复', processing: '处理中', resolved: '已回复' }[value] || value; }
  load();
})();
