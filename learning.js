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
    let completed = Object.keys(local.completedSections || {}).length, total = 40, attempts = 0, correct = 0, dates = [], messages = [], chapters = 0, totalChapters = 8;
    const xp = Number(localStorage.getItem('python-xp') || 0);
    if (context.session) {
      $('accountLead').textContent = `${context.session.user.email} · 学习数据已从云端同步`;
      const [progressResult, attemptsResult, chaptersResult, sectionsResult, messagesResult] = await Promise.all([
        context.client.from('section_progress').select('section_id,completed,last_read_at').eq('completed', true),
        context.client.from('quiz_attempts').select('is_correct,created_at'),
        context.client.from('course_chapters').select('id').eq('active', true),
        context.client.from('course_sections').select('id,chapter_id').eq('active', true),
        context.client.from('user_messages').select('title,status,admin_reply,created_at').order('created_at', { ascending: false }).limit(10)
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
    const percent = total ? Math.round(completed / total * 100) : 0, accuracy = attempts ? Math.round(correct / attempts * 100) : 0;
    $('sectionProgress').textContent = `${completed}/${total}`; $('accuracy').textContent = `${accuracy}%`; $('overallProgress').textContent = `${percent}%`; $('overallProgressBar').style.width = `${percent}%`; $('progressDetail').textContent = `${completed}/${total} 节已完成`;
    $('chapterCount').textContent = `${chapters}/${totalChapters}`; $('chapterRing').style.setProperty('--score', `${totalChapters ? chapters / totalChapters * 100 : 0}%`);
    const streak = calculateStreak(dates); $('streakDays').textContent = `${streak} 天`; localStorage.setItem('python-streak', String(streak)); $('studyTime').textContent = `${completed * 12 + attempts * 2} 分钟`;
    heatmap(dates); paintAbilities(completed, attempts);
    if (localStorage.getItem('python-lab-code-v2')) unlock('first-code'); if (attempts >= 10) unlock('ten-quiz'); if (completed >= 1) unlock('first-section'); if (xp >= 200) unlock('hundred-run');
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
  const reminder = document.createElement('button');
  reminder.className = 'secondary';
  reminder.type = 'button';
  reminder.textContent = localStorage.getItem('python-reminder-enabled') === '1' ? '学习提醒已开启' : '开启每日学习提醒';
  reminder.onclick = async () => {
    if (!('Notification' in window)) { site.toast('当前浏览器不支持学习提醒。'); return; }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') { site.toast('未获得通知权限，提醒没有开启。'); return; }
    localStorage.setItem('python-reminder-enabled', '1');
    new Notification('学习提醒已开启', { body: '每天回来完成一小节，让进步连续起来。', icon: 'assets/site-icon.png' });
    reminder.textContent = '学习提醒已开启';
  };
  $('heatmap').insertAdjacentElement('afterend', reminder);
  load();
})();
