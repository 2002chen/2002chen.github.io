(function () {
  const config = window.SUPABASE_CONFIG || {};
  const configured = Boolean(config.url && config.anonKey && window.supabase);
  const client = configured ? window.supabase.createClient(config.url, config.anonKey) : null;
  let session = null;
  let mode = 'login';
  let saveTimer;
  let applyingCloud = false;

  const $ = id => document.getElementById(id);
  const defaults = {
    learning: { xp: 0, runs: 0, completed: [], code: {}, current: 0 },
    quiz: { answered: {}, wrong: [], correct: 0, streak: 0 }
  };

  function setSync(type, text) {
    const el = $('syncStatus');
    if (!el) return;
    el.className = `sync-pill ${type}`;
    el.querySelector('span').textContent = text;
  }

  function setAuthMode(nextMode) {
    mode = nextMode;
    document.querySelectorAll('[data-auth-tab]').forEach(button => button.classList.toggle('active', button.dataset.authTab === mode));
    document.querySelectorAll('.register-only').forEach(el => el.classList.toggle('visible', mode === 'register'));
    $('authHeading').textContent = mode === 'login' ? '欢迎回来' : '创建学习账户';
    $('authDescription').textContent = mode === 'login' ? '登录后继续你的专属学习进度。' : '注册后，每一份答题记录和代码都会只属于你。';
    $('authSubmit').textContent = mode === 'login' ? '登录并继续' : '注册账户';
    $('forgotPassword').style.display = mode === 'login' ? 'block' : 'none';
    $('authError').textContent = '';
  }

  function showGate(show) {
    $('authGate').classList.toggle('hidden', !show);
    document.body.classList.toggle('auth-locked', show);
  }

  function enterPreviewMode() {
    showGate(false);
    setSync('error', '演示模式');
    $('accountName').textContent = '课程预览';
    $('accountEmail').textContent = '连接云端后可保存个人进度';
    window.dispatchEvent(new CustomEvent('cloud-data-ready'));
  }

  function updateAccount(user) {
    const name = user?.user_metadata?.display_name || user?.email?.split('@')[0] || '学习者';
    $('accountName').textContent = name;
    $('accountAvatar').textContent = name.slice(0, 2).toUpperCase();
    $('accountEmail').textContent = user?.email || '';
  }

  async function updateRoleUi(user) {
    const { data } = await client.from('profiles').select('role').eq('id', user.id).maybeSingle();
    let adminButton = $('openAdmin');
    if (data?.role === 'admin' && !adminButton) {
      adminButton = document.createElement('button');
      adminButton.id = 'openAdmin';
      adminButton.type = 'button';
      adminButton.textContent = '管理员后台';
      $('accountMenu').insertBefore(adminButton, $('logoutButton'));
      adminButton.addEventListener('click', () => { $('accountMenu').classList.remove('open'); window.adminDashboard?.open(); });
    }
  }

  async function loadCloudData(user) {
    setSync('loading', '正在同步');
    const { data, error } = await client.from('user_learning_data').select('learning_state, quiz_state, display_name').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!data) {
      const localLearning = JSON.parse(localStorage.getItem('python-lab-progress-v3') || '{}');
      const localQuiz = JSON.parse(localStorage.getItem('python-lab-quiz-v1') || '{}');
      const { error: insertError } = await client.from('user_learning_data').insert({ user_id: user.id, display_name: user.user_metadata?.display_name || '', learning_state: { ...defaults.learning, ...localLearning }, quiz_state: { ...defaults.quiz, ...localQuiz } });
      if (insertError) throw insertError;
    } else {
      applyingCloud = true;
      localStorage.setItem('python-lab-progress-v3', JSON.stringify({ ...defaults.learning, ...(data.learning_state || {}) }));
      localStorage.setItem('python-lab-quiz-v1', JSON.stringify({ ...defaults.quiz, ...(data.quiz_state || {}) }));
      applyingCloud = false;
    }
    setSync('ready', '已同步');
    window.dispatchEvent(new CustomEvent('cloud-data-ready'));
  }

  async function saveCloudData() {
    if (!client || !session || applyingCloud) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      setSync('loading', '正在保存');
      try {
        const learning = JSON.parse(localStorage.getItem('python-lab-progress-v3') || '{}');
        const quiz = JSON.parse(localStorage.getItem('python-lab-quiz-v1') || '{}');
        const { error } = await client.from('user_learning_data').upsert({ user_id: session.user.id, display_name: session.user.user_metadata?.display_name || '', learning_state: learning, quiz_state: quiz });
        if (error) throw error;
        setSync('ready', '已同步');
      } catch (error) {
        setSync('error', '同步失败');
      }
    }, 500);
  }

  async function handleSession(nextSession) {
    session = nextSession;
    if (!session) {
      showGate(true);
      setSync('error', configured ? '请先登录' : '云端未配置');
      return;
    }
    updateAccount(session.user);
    await updateRoleUi(session.user);
    showGate(false);
    try { await loadCloudData(session.user); }
    catch (error) { setSync('error', '同步失败'); console.error(error); }
  }

  async function submitAuth(event) {
    event.preventDefault();
    if (!configured) {
      $('authError').textContent = '云端项目尚未连接，请管理员完成 Supabase 配置。';
      return;
    }
    const email = $('authEmail').value.trim();
    const password = $('authPassword').value;
    const displayName = $('authDisplayName').value.trim();
    $('authSubmit').disabled = true;
    $('authError').textContent = '';
    try {
      if (mode === 'register') {
        if (password !== $('authPasswordConfirm').value) throw new Error('两次输入的密码不一致');
        const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
        if (error) throw error;
        if (!data.session) $('authError').textContent = '注册成功，请前往邮箱完成验证后再登录。';
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      $('authError').textContent = error.message || '操作失败，请稍后重试';
    } finally {
      $('authSubmit').disabled = false;
    }
  }

  async function forgotPassword() {
    const email = $('authEmail').value.trim();
    if (!email) { $('authError').textContent = '请先填写邮箱地址'; return; }
    if (!configured) { $('authError').textContent = '云端项目尚未连接'; return; }
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    $('authError').textContent = error ? error.message : '重置密码邮件已发送，请检查邮箱。';
  }

  document.querySelectorAll('[data-auth-tab]').forEach(button => button.addEventListener('click', () => setAuthMode(button.dataset.authTab)));
  $('authForm').addEventListener('submit', submitAuth);
  $('forgotPassword').addEventListener('click', forgotPassword);
  $('levelButton').addEventListener('click', event => { event.stopPropagation(); $('accountMenu').classList.toggle('open'); });
  $('accountProgress').addEventListener('click', () => { $('accountMenu').classList.remove('open'); $('progress').scrollIntoView({ behavior: 'smooth' }); });
  $('logoutButton').addEventListener('click', async () => { if (client) await client.auth.signOut(); localStorage.removeItem('python-lab-progress-v3'); localStorage.removeItem('python-lab-quiz-v1'); location.reload(); });
  document.addEventListener('click', () => $('accountMenu').classList.remove('open'));
  window.addEventListener('learning-data-changed', saveCloudData);

  setAuthMode('login');
  if (!configured) {
    showGate(true);
    setSync('error', '云端未配置');
    const preview = document.createElement('button');
    preview.className = 'preview-link'; preview.type = 'button'; preview.textContent = '先预览网站'; preview.onclick = enterPreviewMode;
    $('authForm').appendChild(preview);
  } else {
    client.auth.getSession().then(({ data }) => handleSession(data.session));
    client.auth.onAuthStateChange((_event, nextSession) => handleSession(nextSession));
  }
  window.learningCloud = { client, configured, save: saveCloudData };
})();
