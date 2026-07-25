(function () {
  const $ = id => document.getElementById(id);
  let currentQuestions = [];
  let currentChapters = [];

  function client() { return window.learningCloud?.client; }
  async function open() {
    const cloudClient = client();
    if (!cloudClient) return;
    const sessionResult = await cloudClient.auth.getSession();
    const user = sessionResult.data.session?.user;
    if (!user) return;
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
    loadQuestions();
  }
  function close() { $('adminPanel').classList.remove('open'); $('adminPanel').setAttribute('aria-hidden', 'true'); }
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
    const { data, error } = await query; if (error) return;
    $('messageList').innerHTML = (data || []).map(m => `<article class="admin-message"><div class="admin-message-head"><span>${m.message_type}</span><b>${m.title}</b><em>${new Date(m.created_at).toLocaleString('zh-CN')}</em></div><p>${escapeText(m.content)}</p><small>${escapeText(m.sender_name)} · ${escapeText(m.contact || '未留联系方式')}</small><label><span>处理状态</span><select data-message-status="${m.id}"><option value="new" ${m.status === 'new' ? 'selected' : ''}>新留言</option><option value="processing" ${m.status === 'processing' ? 'selected' : ''}>处理中</option><option value="resolved" ${m.status === 'resolved' ? 'selected' : ''}>已解决</option></select></label><label><span>管理员回复</span><textarea data-message-reply="${m.id}">${escapeText(m.admin_reply || '')}</textarea></label><button data-save-message="${m.id}">保存处理结果</button></article>`).join('') || '<p class="empty-state">暂无用户留言。</p>';
    document.querySelectorAll('[data-save-message]').forEach(button => button.onclick = () => saveMessage(Number(button.dataset.saveMessage)));
  }

  async function saveMessage(id) { const status = document.querySelector(`[data-message-status="${id}"]`).value; const admin_reply = document.querySelector(`[data-message-reply="${id}"]`).value; const { error } = await client().from('user_messages').update({ status, admin_reply }).eq('id', id); if (!error) loadMessages(); }
  function escapeText(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  document.querySelectorAll('[data-close-admin]').forEach(el => el.onclick = close);
  document.querySelectorAll('[data-admin-tab]').forEach(button => button.onclick = () => { const tab = button.dataset.adminTab; document.querySelectorAll('[data-admin-tab]').forEach(x => x.classList.toggle('active', x === button)); $('adminQuestions').classList.toggle('active', tab === 'questions'); $('adminCourse').classList.toggle('active', tab === 'course'); $('adminMessages').classList.toggle('active', tab === 'messages'); if (tab === 'course') loadChapters(); if (tab === 'messages') loadMessages(); });
  $('questionForm').addEventListener('submit', saveQuestion); $('questionCancel').onclick = clearForm; $('refreshMessages').onclick = loadMessages; $('messageStatusFilter').onchange = loadMessages;
  $('chapterForm').addEventListener('submit', saveChapter); $('chapterCancel').onclick = clearChapterForm;
  window.adminDashboard = { open, close, loadQuestions, loadChapters, loadMessages };
})();
