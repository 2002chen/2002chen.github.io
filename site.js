(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.SUPABASE_CONFIG || {};
  const client = config.url && config.anonKey && window.supabase
    ? window.supabase.createClient(config.url, config.anonKey)
    : null;
  let session = null;

  function toast(message, tone = '') {
    let node = $('#siteToast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'siteToast';
      node.className = 'toast';
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.dataset.tone = tone;
    node.classList.add('show');
    clearTimeout(node.timer);
    node.timer = setTimeout(() => node.classList.remove('show'), 2600);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function ensureAccessibilityTools() {
    if (!$('#skipLink')) {
      document.body.insertAdjacentHTML('afterbegin', '<a id="skipLink" class="skip-link" href="#main">跳到主要内容</a>');
    }
    document.documentElement.dataset.font = localStorage.getItem('site-font-size') || 'medium';
    document.documentElement.classList.toggle('high-contrast', localStorage.getItem('site-contrast') === 'high');
    const tools = document.createElement('div');
    tools.className = 'access-tools';
    tools.innerHTML = '<button type="button" data-font-cycle aria-label="切换页面字号">字号</button><button type="button" data-contrast aria-label="切换高对比度">对比</button>';
    document.body.appendChild(tools);
    $('[data-font-cycle]', tools).onclick = () => {
      const order = ['small', 'medium', 'large'];
      const next = order[(order.indexOf(document.documentElement.dataset.font) + 1) % order.length];
      document.documentElement.dataset.font = next;
      localStorage.setItem('site-font-size', next);
      toast(`字号已切换为${{ small: '小', medium: '中', large: '大' }[next]}号`);
    };
    $('[data-contrast]', tools).onclick = () => {
      const enabled = !document.documentElement.classList.contains('high-contrast');
      document.documentElement.classList.toggle('high-contrast', enabled);
      localStorage.setItem('site-contrast', enabled ? 'high' : 'normal');
      toast(enabled ? '已开启高对比度' : '已恢复标准对比度');
    };
  }

  function ensureOfflineBanner() {
    const banner = document.createElement('div');
    banner.className = 'offline-banner';
    banner.setAttribute('role', 'status');
    banner.textContent = '网络连接已断开，已保存的内容仍可使用。';
    document.body.appendChild(banner);
    const update = () => banner.classList.toggle('show', !navigator.onLine);
    addEventListener('online', update);
    addEventListener('offline', update);
    update();
  }

  const searchItems = [
    ['系统教程', '从代码是什么开始学习 Python', 'tutorial.html'],
    ['学习路线图', '查看基础、数据结构、函数、面向对象和项目实战', 'roadmap.html'],
    ['3000 题库', '按知识点、难度和关键词搜索题目', 'quiz.html'],
    ['代码实验室', '在线编写并运行 Python', 'lab.html'],
    ['学习中心', '查看进度、日历、能力和徽章', 'learning.html'],
    ['留言与建议', '把问题或功能建议告诉管理员', 'index.html#message'],
    ['变量', '给数据贴上容易记住的名字', 'tutorial.html?q=变量'],
    ['条件判断', '使用 if、elif 和 else 做选择', 'tutorial.html?q=条件'],
    ['循环', '使用 for 和 while 重复执行', 'tutorial.html?q=循环'],
    ['函数', '把常用步骤封装成工具', 'tutorial.html?q=函数']
  ];

  function ensureSearch() {
    const dialog = document.createElement('div');
    dialog.className = 'search-dialog';
    dialog.id = 'globalSearch';
    dialog.setAttribute('aria-hidden', 'true');
    dialog.innerHTML = '<div class="search-backdrop" data-close-search></div><section role="dialog" aria-modal="true" aria-labelledby="searchTitle"><div><h2 id="searchTitle">全站搜索</h2><button type="button" data-close-search aria-label="关闭搜索">×</button></div><label><span class="sr-only">搜索课程和功能</span><input id="globalSearchInput" type="search" placeholder="搜索知识点、题目或功能" autocomplete="off"></label><div id="globalSearchResults" class="search-results"></div></section>';
    document.body.appendChild(dialog);
    const input = $('#globalSearchInput');
    const results = $('#globalSearchResults');
    let timer;
    const render = () => {
      const term = input.value.trim().toLowerCase();
      const items = term ? searchItems.filter(item => item.join(' ').toLowerCase().includes(term)) : searchItems.slice(0, 6);
      results.innerHTML = items.map(item => `<a href="${item[2]}"><b>${escapeHtml(item[0])}</b><span>${escapeHtml(item[1])}</span></a>`).join('') || '<p class="empty-state">没有找到结果，试试“变量”或“循环”。</p>';
    };
    input.oninput = () => { clearTimeout(timer); timer = setTimeout(render, 300); };
    const close = () => { dialog.classList.remove('open'); dialog.setAttribute('aria-hidden', 'true'); };
    const open = () => { dialog.classList.add('open'); dialog.setAttribute('aria-hidden', 'false'); render(); setTimeout(() => input.focus(), 30); };
    $$('[data-close-search]', dialog).forEach(node => node.onclick = close);
    $$('[data-open-search]').forEach(node => node.onclick = open);
    addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); open(); }
    });
  }

  function ensureMobileTabs() {
    const page = document.body.dataset.page || 'home';
    const tabs = document.createElement('nav');
    tabs.className = 'mobile-tabs';
    tabs.setAttribute('aria-label', '移动端主要导航');
    tabs.innerHTML = [
      ['tutorial', 'tutorial.html', '▤', '教程'],
      ['quiz', 'quiz.html', '◎', '题库'],
      ['lab', 'lab.html', '&lt;/&gt;', '实验室'],
      ['learning', 'learning.html', '♙', '我的']
    ].map(item => `<a class="${page === item[0] ? 'active' : ''}" href="${item[1]}"><i>${item[2]}</i><span>${item[3]}</span></a>`).join('');
    document.body.appendChild(tabs);
  }

  function bindNavigation() {
    const toggle = $('.menu-toggle');
    const links = $('.site-links');
    if (toggle && links) {
      toggle.onclick = () => {
        const open = links.classList.toggle('open');
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
      };
    }
    $$('a[href^="#"]').forEach(link => link.addEventListener('click', () => links?.classList.remove('open')));
  }

  function ensureAuthDialog() {
    if ($('#authDialog')) return;
    const dialog = document.createElement('div');
    dialog.id = 'authDialog';
    dialog.className = 'auth-dialog';
    dialog.setAttribute('aria-hidden', 'true');
    dialog.innerHTML = '<div class="auth-backdrop" data-close-auth></div><section role="dialog" aria-modal="true" aria-labelledby="authTitle"><button class="dialog-close" type="button" data-close-auth aria-label="关闭登录窗口">×</button><p class="eyebrow">保存学习进度</p><h2 id="authTitle">登录后继续学习</h2><p id="authLead">游客可以试学教程和实验室，登录后可跨设备保存全部进度。</p><div class="auth-tabs"><button class="active" type="button" data-auth-mode="login">登录</button><button type="button" data-auth-mode="register">注册</button></div><form id="authForm"><label class="register-field"><span>昵称</span><input id="authName" autocomplete="nickname" maxlength="30"></label><label><span>邮箱</span><input id="authEmail" type="email" autocomplete="email" required></label><label><span>密码</span><input id="authPassword" type="password" autocomplete="current-password" minlength="6" required></label><p id="authError" class="form-error" role="status"></p><button class="primary wide" type="submit" id="authSubmit">登录并继续</button><button class="text-button" type="button" id="resetPassword">忘记密码？</button></form></section>';
    document.body.appendChild(dialog);
    let mode = 'login';
    const setMode = next => {
      mode = next;
      $$('[data-auth-mode]', dialog).forEach(button => button.classList.toggle('active', button.dataset.authMode === mode));
      dialog.classList.toggle('registering', mode === 'register');
      $('#authTitle').textContent = mode === 'login' ? '登录后继续学习' : '创建免费学习账户';
      $('#authSubmit').textContent = mode === 'login' ? '登录并继续' : '注册并开始';
      $('#authPassword').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
      $('#authError').textContent = '';
    };
    const close = () => { dialog.classList.remove('open'); dialog.setAttribute('aria-hidden', 'true'); };
    $$('[data-close-auth]', dialog).forEach(node => node.onclick = close);
    $$('[data-auth-mode]', dialog).forEach(node => node.onclick = () => setMode(node.dataset.authMode));
    $('#authForm').onsubmit = async event => {
      event.preventDefault();
      if (!client) { $('#authError').textContent = '登录服务暂未配置，请稍后再试。'; return; }
      const email = $('#authEmail').value.trim();
      const password = $('#authPassword').value;
      const button = $('#authSubmit');
      button.disabled = true;
      $('#authError').textContent = '';
      const result = mode === 'login'
        ? await client.auth.signInWithPassword({ email, password })
        : await client.auth.signUp({ email, password, options: { data: { display_name: $('#authName').value.trim() || email.split('@')[0] } } });
      button.disabled = false;
      if (result.error) { $('#authError').textContent = result.error.message === 'Invalid login credentials' ? '邮箱或密码不正确。' : result.error.message; return; }
      if (mode === 'register' && !result.data.session) { toast('注册成功，请到邮箱完成验证'); close(); return; }
      close();
      location.reload();
    };
    $('#resetPassword').onclick = async () => {
      const email = $('#authEmail').value.trim();
      if (!email) { $('#authError').textContent = '请先填写邮箱。'; return; }
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
      $('#authError').textContent = error ? error.message : '重置邮件已发送，请检查邮箱。';
    };
    addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    window.siteOpenAuth = () => { dialog.classList.add('open'); dialog.setAttribute('aria-hidden', 'false'); setTimeout(() => $('#authEmail').focus(), 30); };
  }

  async function paintAccount() {
    const trigger = $('[data-account]');
    const menu = $('#accountMenu');
    if (!trigger) return;
    if (!session) {
      trigger.innerHTML = '<span>登录 / 注册</span><i aria-hidden="true">我</i>';
      trigger.onclick = () => window.siteOpenAuth();
      return;
    }
    const name = session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || '学习者';
    trigger.innerHTML = `<span>${escapeHtml(name)}</span><i>${escapeHtml(name.slice(0, 2).toUpperCase())}</i>`;
    if (menu) {
      menu.innerHTML = `<b>${escapeHtml(session.user.email || '')}</b><a href="learning.html">我的学习中心</a><button type="button" id="logoutButton">退出登录</button>`;
      trigger.onclick = event => { event.stopPropagation(); menu.classList.toggle('open'); };
      $('#logoutButton').onclick = async () => { await client.auth.signOut(); location.href = 'index.html'; };
      document.addEventListener('click', event => { if (!menu.contains(event.target) && event.target !== trigger) menu.classList.remove('open'); });
      const roleResult = await client.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      let admin = roleResult.data?.role === 'admin';
      if (!admin) admin = (await client.rpc('is_admin')).data === true;
      if (admin) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = '进入管理员后台';
        button.onclick = () => window.adminDashboard?.open();
        menu.insertBefore(button, $('#logoutButton'));
      }
    }
  }

  const ready = (async () => {
    ensureAccessibilityTools();
    ensureOfflineBanner();
    ensureAuthDialog();
    bindNavigation();
    ensureSearch();
    ensureMobileTabs();
    if (client) session = (await client.auth.getSession()).data.session;
    await paintAccount();
    document.documentElement.classList.add('site-ready');
    return { client, session };
  })();

  window.site = {
    client,
    ready,
    toast,
    escapeHtml,
    openAuth: () => window.siteOpenAuth(),
    get session() { return session; },
    requireAuth(message = '登录后才能使用此功能。') {
      if (session) return true;
      toast(message);
      window.siteOpenAuth();
      return false;
    }
  };
  // Keep the admin module compatible while all user-facing pages use the new site API.
  window.learningCloud = { client };
})();
