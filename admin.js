(function () {
  const $ = id => document.getElementById(id);
  let currentQuestions = [];
  let currentChapters = [];
  let currentAnnouncements = [];

  function client() { return window.learningCloud?.client; }
  async function open() {
    const cloudClient = client();
    if (!cloudClient) { window.site?.toast('管理员后台连接失败，请刷新页面重试。', 'error'); return; }
    const sessionResult = await cloudClient.auth.getSession();
    const user = sessionResult.data.session?.user;
    if (!user) { window.site?.openAuth(); return; }
    const roleResult = await cloudClient.from('profiles').select('role').eq('id', user.id).maybeSingle();
    let isAdmin = roleResult.data?.role === 'admin';
    if (!isAdmin) {
      const adminResult = await cloudClient.rpc('is_admin');
      isAdmin = adminResult.data === true;
    }
    if (!isAdmin) {
      window.alert('当前账号没有管理员权限。');
      return;
    }
    $('adminPanel').classList.add('open');
    $('adminPanel').setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    loadQuestions();
  }
  function close() { $('adminPanel').classList.remove('open'); $('adminPanel').setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); }
  function clearForm() { $('questionForm').reset(); $('questionId').value = ''; $('questionActive').checked = true; }

  async function loadQuestions() {
    const { data, error } = await client().from('questions').select('*').order('level').order('position').order('id');
    if (error) return;
    currentQuestions = data || [];
    $('questionList').innerHTML = currentQuestions.map(q => `<article class="admin-item"><div><small>${q.level} · ${q.topic}</small><b>${q.question_text}</b><span>${q.active ? '已上架' : '已下架'} · 排序 ${q.position}</span></div><div><button data-edit-question="${q.id}">编辑</button><button class="danger" data-delete-question="${q.id}">删除</button></div></article>`).join('') || '<p class="empty-state">暂无云端题目，请先新增题目或运行 seed-3000-questions.sql。</p>';
    document.querySelectorAll('[data-edit-question]').forEach(button => button.onclick = () => editQuestion(Number(button.dataset.editQuestion)));
    document.querySelectorAll('[data-delete-question]').forEach(button => button.onclick = () => deleteQuestion(Number(button.dataset.deleteQuestion)));
  }

  function editQuestion(id) {
    const q = currentQuestions.find(item => item.id === id); if (!q) return;
    $('questionId').value = q.id; $('questionLevel').value = q.level; $('questionTopic').value = q.topic; $('questionText').value = q.question_text; $('questionOptions').value = q.options.join('\n'); $('questionCorrect').value = q.correct_index + 1; $('questionPosition').value = q.position; $('questionExplanation').value = q.explanation; $('questionActive').checked = q.active; $('questionForm').scrollIntoView({ behavior: 'smooth' });
  }

  async function saveQuestion(event) {
    event.preventDefault();
    const id = $('questionId').value;
    const row = { level: $('questionLevel').value, topic: $('questionTopic').value.trim(), question_text: $('questionText').value.trim(), options: $('questionOptions').value.split('\n').map(x => x.trim()).filter(Boolean), correct_index: Number($('questionCorrect').value) - 1, position: Number($('questionPosition').value) || 0, explanation: $('questionExplanation').value.trim(), active: $('questionActive').checked };
    const query = id ? client().from('questions').update(row).eq('id', id) : client().from('questions').insert(row);
    const { error } = await query; if (error) return alert(error.message);
    clearForm(); await loadQuestions(); await window.dynamicLearning?.loadQuestions?.();
  }

  async function deleteQuestion(id) { if (!confirm('确定删除这道题吗？')) return; const { error } = await client().from('questions').delete().eq('id', id); if (!error) { await loadQuestions(); await window.dynamicLearning?.loadQuestions?.(); } }

  function clearChapterForm() { $('chapterForm').reset(); $('chapterId').value = ''; $('chapterPosition').value = 1; $('chapterMinutes').value = 60; $('chapterIcon').value = '📚'; $('chapterActive').checked = true; }
  async function loadChapters() {
    const { data, error } = await client().from('course_chapters').select('*').order('position').order('id'); if (error) return;
    currentChapters = data || [];
    $('chapterAdminList').innerHTML = currentChapters.map(chapter => `<article class="admin-item"><div><small>${chapter.level} · 第 ${chapter.position} 章</small><b>${escapeText(chapter.cover_icon)} ${escapeText(chapter.title)}</b><span>${chapter.active ? '已上架' : '已下架'} · 约 ${chapter.estimated_minutes} 分钟</span></div><div><button data-edit-chapter="${chapter.id}">编辑</button><button class="danger" data-delete-chapter="${chapter.id}">删除</button></div></article>`).join('') || '<p class="empty-state">暂无课程章节，请先运行 seed-course.sql 或新增章节。</p>';
    document.querySelectorAll('[data-edit-chapter]').forEach(button => button.onclick = () => editChapter(Number(button.dataset.editChapter)));
    document.querySelectorAll('[data-delete-chapter]').forEach(button => button.onclick = () => deleteChapter(Number(button.dataset.deleteChapter)));
  }
  function editChapter(id) {
    const chapter = currentChapters.find(item => item.id === id); if (!chapter) return;
    $('chapterId').value = chapter.id; $('chapterTitle').value = chapter.title; $('chapterLevel').value = chapter.level; $('chapterPosition').value = chapter.position; $('chapterIcon').value = chapter.cover_icon; $('chapterMinutes').value = chapter.estimated_minutes; $('chapterDescription').value = chapter.description; $('chapterActive').checked = chapter.active; $('chapterForm').scrollIntoView({ behavior: 'smooth' });
  }
  async function saveChapter(event) {
    event.preventDefault(); const id = $('chapterId').value;
    const row = { title: $('chapterTitle').value.trim(), level: $('chapterLevel').value, position: Number($('chapterPosition').value), cover_icon: $('chapterIcon').value.trim() || '📚', estimated_minutes: Number($('chapterMinutes').value) || 60, description: $('chapterDescription').value.trim(), active: $('chapterActive').checked };
    const query = id ? client().from('course_chapters').update(row).eq('id', id) : client().from('course_chapters').insert(row); const { error } = await query; if (error) return alert(error.message);
    clearChapterForm(); await loadChapters(); await window.coursePlatform?.loadCourse();
  }
  async function deleteChapter(id) { if (!confirm('删除章节会同时删除其教程、练习和用户章节进度，确定继续吗？')) return; const { error } = await client().from('course_chapters').delete().eq('id', id); if (!error) { await loadChapters(); await window.coursePlatform?.loadCourse(); } }

  async function loadMessages() {
    let query = client().from('user_messages').select('*').order('created_at', { ascending: false });
    if ($('messageStatusFilter').value) query = query.eq('status', $('messageStatusFilter').value);
    const { data, error } = await query;
    if (error) { $('messageList').innerHTML = `<p class="empty-state">留言读取失败：${escapeText(error.message)}</p>`; return; }
    $('messageList').innerHTML = (data || []).map(m => `<article class="admin-message" data-status="${m.status}"><div class="admin-message-head"><span>${escapeText(m.message_type)}</span><b>${escapeText(m.title)}</b><em>${new Date(m.created_at).toLocaleString('zh-CN')}</em></div><p>${escapeText(m.content)}</p><small>${escapeText(m.sender_name)} · ${escapeText(m.contact || '未留联系方式')}</small><label><span>处理状态</span><select data-message-status="${m.id}"><option value="new" ${m.status === 'new' ? 'selected' : ''}>未读</option><option value="processing" ${m.status === 'processing' ? 'selected' : ''}>已读</option><option value="resolved" ${m.status === 'resolved' ? 'selected' : ''}>已回复</option></select></label><label><span>回复用户</span><textarea data-message-reply="${m.id}" placeholder="回复会显示在用户的学习中心">${escapeText(m.admin_reply || '')}</textarea></label><div class="admin-message-actions"><button type="button" data-read-message="${m.id}">${m.status === 'new' ? '标记已读' : '已读'}</button><button class="primary" type="button" data-save-message="${m.id}">发送回复</button><button class="danger" type="button" data-delete-message="${m.id}">删除留言</button></div></article>`).join('') || '<p class="empty-state">暂无用户留言。</p>';
    document.querySelectorAll('[data-save-message]').forEach(button => button.onclick = () => saveMessage(Number(button.dataset.saveMessage)));
    document.querySelectorAll('[data-read-message]').forEach(button => button.onclick = () => markMessageRead(Number(button.dataset.readMessage)));
    document.querySelectorAll('[data-delete-message]').forEach(button => button.onclick = () => deleteMessage(Number(button.dataset.deleteMessage)));
  }

  async function saveMessage(id) {
    const statusField = document.querySelector(`[data-message-status="${id}"]`);
    const adminReply = document.querySelector(`[data-message-reply="${id}"]`).value.trim();
    const status = adminReply ? 'resolved' : statusField.value;
    const { error } = await client().from('user_messages').update({ status, admin_reply: adminReply }).eq('id', id);
    if (error) { window.site?.toast(`回复保存失败：${error.message}`, 'error'); return; }
    window.site?.toast(adminReply ? '回复已发送' : '处理状态已保存', 'success');
    loadMessages();
  }
  async function markMessageRead(id) {
    const { error } = await client().from('user_messages').update({ status: 'processing' }).eq('id', id);
    if (error) { window.site?.toast(`标记失败：${error.message}`, 'error'); return; }
    loadMessages();
  }
  async function deleteMessage(id) {
    if (!confirm('确定删除这条留言吗？删除后无法恢复。')) return;
    const { error } = await client().from('user_messages').delete().eq('id', id);
    if (error) { window.site?.toast(`删除失败：${error.message}`, 'error'); return; }
    window.site?.toast('留言已删除', 'success');
    loadMessages();
  }
  function clearAnnouncementForm() { $('announcementForm').reset(); $('announcementId').value = ''; $('announcementPublished').checked = true; }
  async function loadAnnouncements() {
    const { data, error } = await client().from('site_announcements').select('*').order('created_at', { ascending: false });
    if (error) { $('announcementList').innerHTML = `<p class="empty-state">公告读取失败：${escapeText(error.message)}</p>`; return; }
    currentAnnouncements = data || [];
    $('announcementList').innerHTML = currentAnnouncements.map(item => `<article class="announcement-admin-item"><div><small>${item.published ? '已发布' : '未发布'} · ${new Date(item.updated_at || item.created_at).toLocaleString('zh-CN')}</small><b>${escapeText(item.title)}</b><p>${escapeText(item.content)}</p></div><div><button type="button" data-edit-announcement="${item.id}">编辑</button><button class="danger" type="button" data-delete-announcement="${item.id}">删除</button></div></article>`).join('') || '<p class="empty-state">还没有公告。</p>';
    document.querySelectorAll('[data-edit-announcement]').forEach(button => button.onclick = () => editAnnouncement(Number(button.dataset.editAnnouncement)));
    document.querySelectorAll('[data-delete-announcement]').forEach(button => button.onclick = () => deleteAnnouncement(Number(button.dataset.deleteAnnouncement)));
  }
  function editAnnouncement(id) {
    const item = currentAnnouncements.find(row => row.id === id); if (!item) return;
    $('announcementId').value = item.id; $('announcementTitle').value = item.title; $('announcementContent').value = item.content; $('announcementPublished').checked = item.published; $('announcementForm').scrollIntoView({ behavior: 'smooth' });
  }
  async function saveAnnouncement(event) {
    event.preventDefault();
    const id = $('announcementId').value, published = $('announcementPublished').checked;
    const row = { title: $('announcementTitle').value.trim(), content: $('announcementContent').value.trim(), published, published_at: published ? new Date().toISOString() : null };
    const query = id ? client().from('site_announcements').update(row).eq('id', id) : client().from('site_announcements').insert(row);
    const { error } = await query;
    if (error) { window.site?.toast(`公告保存失败：${error.message}`, 'error'); return; }
    clearAnnouncementForm(); window.site?.toast(published ? '公告已发布' : '公告已保存', 'success'); loadAnnouncements();
  }
  async function deleteAnnouncement(id) {
    if (!confirm('确定删除这条公告吗？')) return;
    const { error } = await client().from('site_announcements').delete().eq('id', id);
    if (error) { window.site?.toast(`公告删除失败：${error.message}`, 'error'); return; }
    loadAnnouncements();
  }
  function escapeText(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  document.querySelectorAll('[data-close-admin]').forEach(el => el.onclick = close);
  document.querySelectorAll('[data-admin-tab]').forEach(button => button.onclick = () => { const tab = button.dataset.adminTab; document.querySelectorAll('[data-admin-tab]').forEach(x => x.classList.toggle('active', x === button)); $('adminQuestions').classList.toggle('active', tab === 'questions'); $('adminCourse').classList.toggle('active', tab === 'course'); $('adminMessages').classList.toggle('active', tab === 'messages'); $('adminAnnouncements').classList.toggle('active', tab === 'announcements'); if (tab === 'course') loadChapters(); if (tab === 'messages') loadMessages(); if (tab === 'announcements') loadAnnouncements(); });
  $('questionForm').addEventListener('submit', saveQuestion); $('questionCancel').onclick = clearForm; $('refreshMessages').onclick = loadMessages; $('messageStatusFilter').onchange = loadMessages;
  $('chapterForm').addEventListener('submit', saveChapter); $('chapterCancel').onclick = clearChapterForm;
  $('announcementForm').addEventListener('submit', saveAnnouncement); $('announcementCancel').onclick = clearAnnouncementForm;
  window.adminDashboard = { open, close, loadQuestions, loadChapters, loadMessages, loadAnnouncements };
})();
