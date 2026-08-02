(function () {
  'use strict';
  const $ = id => document.getElementById(id);

  function localState() {
    try { return JSON.parse(localStorage.getItem('python-learning-v2') || '{}'); }
    catch { return {}; }
  }

  function renderLocalStats() {
    const state = localState();
    const completed = Object.keys(state.completedSections || {}).length;
    const xp = Number(localStorage.getItem('python-xp') || 0);
    const streak = Number(localStorage.getItem('python-streak') || 0);
    /* V4 进度 */
    let v4Count = 0;
    try { const p = JSON.parse(localStorage.getItem('cr_progress') || '{}'); v4Count = Object.values(p).filter(v => v.status === 'completed').length; } catch(e) {}
    const v4xp = Number(localStorage.getItem('cr_xp') || 0);
    if ($('homeProgress')) $('homeProgress').textContent = v4Count ? `${v4Count} 个` : `${completed} 节`;
    if ($('homeXp')) $('homeXp').textContent = `${v4xp || xp} XP`;
    if ($('homeStreak')) $('homeStreak').textContent = `${streak} 天`;
  }

  site.ready.then(({ client, session }) => {
    renderLocalStats();
    const start = $('startLearning');
    if (start) {
      const last = localStorage.getItem('cr_last_lesson');
      if (last) {
        start.href = `tutorial.html?lesson=${encodeURIComponent(last)}`;
        start.querySelector('span').textContent = '继续上次学习 →';
      }
    }
    if ($('submitMessage')) $('submitMessage').textContent = session ? '发送给管理员 →' : '登录后发送给管理员 →';
    if (client && session) client.rpc('weekly_learning_leaderboard').then(({ data, error }) => {
      if (error || !data?.length) return;
      document.querySelector('.proof-strip')?.insertAdjacentHTML('beforeend', `<br><span class="muted">本周之星：${site.escapeHtml(data[0].learner_alias)} · ${data[0].activity_count} 次学习</span>`);
    });

    document.querySelectorAll('[data-message-template]').forEach(button => {
      button.onclick = () => {
        $('messageType').value = button.dataset.messageTemplate;
        $('messageContent').value = {
          '功能建议': '我希望网站可以增加：\n\n这样会帮助我：',
          '遇到问题': '我在使用以下页面时遇到问题：\n\n具体表现：\n\n我使用的设备：',
          '想夸一下': '我特别喜欢：\n\n因为：'
        }[button.dataset.messageTemplate];
        $('messageContent').focus();
      };
    });

    $('messageForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      if (!site.requireAuth('登录后可以提交留言并查看管理员回复。')) return;
      const activeSession = site.session;
      if (!activeSession) return;
      const button = $('submitMessage');
      button.disabled = true;
      const payload = {
        user_id: activeSession.user.id,
        sender_name: $('messageName').value.trim() || activeSession.user.user_metadata?.display_name || '学习者',
        message_type: $('messageType').value || '功能建议',
        title: $('messageTitle').value.trim(),
        content: $('messageContent').value.trim(),
        contact: $('messageContact').value.trim()
      };
      const { error } = await client.from('user_messages').insert(payload);
      button.disabled = false;
      if (error) { site.toast('留言发送失败，请稍后重试', 'error'); return; }
      event.target.reset();
      site.toast('已收到！管理员通常会在 24 小时内回复。', 'success');
    });
  });
})();
