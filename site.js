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

  function visitorId() {
    const key = 'site-visitor-id';
    let value = localStorage.getItem(key);
    if (!value) {
      value = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(key, value);
    }
    return value;
  }

  async function trackVisit() {
    if (!client) return;
    const payload = { visitor_id: visitorId(), path: `${location.pathname}${location.search}`.slice(0, 200) };
    if (session?.user?.id) payload.user_id = session.user.id;
    const { error } = await client.from('site_visits').insert(payload);
    if (error) console.debug('visit tracking unavailable', error.message);
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
    ['支持作者', '请作者喝杯茶，网站的学习功能始终免费', '#support-author'],
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

  function ensureSupportDialog() {
    if ($('#supportDialog')) return;

    $$('.site-links').forEach(links => {
      if ($('[data-open-support]', links)) return;
      const link = document.createElement('a');
      link.href = '#support-author';
      link.dataset.openSupport = '';
      link.textContent = '支持作者';
      links.appendChild(link);
    });

    $$('.footer-links').forEach(group => {
      if ($('[data-open-support]', group) || group.querySelector('b')?.textContent !== '更多') return;
      const link = document.createElement('a');
      link.href = '#support-author';
      link.dataset.openSupport = '';
      link.textContent = '支持作者';
      group.appendChild(link);
    });

    const dialog = document.createElement('div');
    dialog.id = 'supportDialog';
    dialog.className = 'support-dialog';
    dialog.setAttribute('aria-hidden', 'true');
    dialog.innerHTML = '<div class="support-backdrop" data-close-support></div><section role="dialog" aria-modal="true" aria-labelledby="supportTitle" aria-describedby="supportLead"><button class="dialog-close" type="button" data-close-support aria-label="关闭支持作者窗口">×</button><div class="support-copy"><p class="eyebrow">支持作者</p><h2 id="supportTitle">请作者喝杯茶</h2><p id="supportLead">网站会一直免费。如果这里的内容帮你少走了一点弯路，可以自愿支持作者。</p><small>支持与否不影响任何学习功能。</small></div><figure><img src="assets/wechat-support.jpg" alt="微信赞赏码"><figcaption>打开微信扫一扫</figcaption></figure></section>';
    document.body.appendChild(dialog);

    let previousFocus = null;
    const close = () => {
      dialog.classList.remove('open');
      dialog.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      previousFocus?.focus();
    };
    const open = event => {
      event?.preventDefault();
      previousFocus = document.activeElement;
      const search = $('#globalSearch');
      search?.classList.remove('open');
      search?.setAttribute('aria-hidden', 'true');
      dialog.classList.add('open');
      dialog.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      setTimeout(() => $('[data-close-support]', dialog).focus(), 30);
    };
    document.addEventListener('click', event => {
      if (event.target.closest('a[href="#support-author"]')) open(event);
    });
    $$('[data-close-support]', dialog).forEach(node => node.addEventListener('click', close));
    addEventListener('keydown', event => {
      if (event.key === 'Escape' && dialog.classList.contains('open')) close();
    });
    if (location.hash === '#support-author') open();
  }

  function ensureCopyrightLinks() {
    $$('.footer-links').forEach(group => {
      if (group.querySelector('b')?.textContent !== '更多' || $('a[href="copyright.html"]', group)) return;
      group.insertAdjacentHTML('beforeend', '<a href="copyright.html">版权与来源</a>');
    });
    $$('.footer-bottom a[href="copyright.html"]').forEach(link => link.remove());
  }

  let currentAnnouncementKey = '';
  function ensureAnnouncementUI() {
    let shell = $('#announcementShell');
    if (!shell) {
      shell = document.createElement('section');
      shell.className = 'announcement-shell shell';
      shell.id = 'announcementShell';
      shell.hidden = true;
      shell.setAttribute('aria-live', 'polite');
      shell.innerHTML = '<div class="announcement-content"><span>站点公告</span><button class="announcement-trigger" id="announcementOpen" type="button" aria-haspopup="dialog"><b id="announcementBannerTitle"></b><span id="announcementSummary"></span><i>查看完整公告</i></button><small id="announcementTime"></small></div><button type="button" id="dismissAnnouncement" aria-label="关闭公告">×</button>';
      document.querySelector('.site-header')?.insertAdjacentElement('afterend', shell);
    }

    let dialog = $('#announcementDialog');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.className = 'announcement-dialog';
      dialog.id = 'announcementDialog';
      dialog.hidden = true;
      dialog.setAttribute('aria-hidden', 'true');
      dialog.innerHTML = '<div class="announcement-backdrop" data-close-announcement></div><section role="dialog" aria-modal="true" aria-labelledby="announcementDialogTitle"><button class="dialog-close" type="button" data-close-announcement aria-label="关闭公告详情">×</button><p class="eyebrow">站点公告</p><h2 id="announcementDialogTitle"></h2><time id="announcementDialogTime"></time><article id="announcementFullContent"></article></section>';
      document.body.appendChild(dialog);
    }

    const closeDialog = () => {
      dialog.classList.remove('open');
      dialog.setAttribute('aria-hidden', 'true');
      dialog.hidden = true;
      document.body.classList.remove('modal-open');
    };
    $('#announcementOpen').onclick = () => {
      dialog.hidden = false;
      dialog.classList.add('open');
      dialog.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      setTimeout(() => $('[data-close-announcement]', dialog)?.focus(), 30);
    };
    $$('[data-close-announcement]', dialog).forEach(node => node.onclick = closeDialog);
    $('#dismissAnnouncement').onclick = () => {
      closeDialog();
      if (currentAnnouncementKey) sessionStorage.setItem(`dismissed-announcement-${currentAnnouncementKey}`, '1');
      shell.hidden = true;
    };
    addEventListener('keydown', event => { if (event.key === 'Escape' && dialog.classList.contains('open')) closeDialog(); });
  }

  async function refreshAnnouncement() {
    if (!client) return;
    const { data, error } = await client.from('site_announcements').select('id,title,content,published_at,updated_at').eq('published', true).order('published_at', { ascending: false }).limit(1).maybeSingle();
    const shell = $('#announcementShell');
    if (error || !shell) return;
    if (!data) { shell.hidden = true; currentAnnouncementKey = ''; return; }
    const nextKey = `${data.id}-${data.updated_at || data.published_at || ''}`;
    currentAnnouncementKey = nextKey;
    if (sessionStorage.getItem(`dismissed-announcement-${nextKey}`)) { shell.hidden = true; return; }
    const date = data.published_at ? new Date(data.published_at).toLocaleDateString('zh-CN') : '';
    $('#announcementBannerTitle').textContent = data.title || '站点公告';
    $('#announcementSummary').textContent = String(data.content || '').replace(/\s+/g, ' ').trim();
    $('#announcementTime').textContent = date;
    $('#announcementDialogTitle').textContent = data.title || '站点公告';
    $('#announcementDialogTime').textContent = date ? `发布于 ${date}` : '';
    $('#announcementFullContent').textContent = data.content || '';
    const isNew = nextKey !== shell.dataset.announcementKey;
    shell.hidden = false;
    if (isNew) {
      shell.classList.remove('announcement-new');
      void shell.offsetWidth;
      shell.classList.add('announcement-new');
    }
    shell.dataset.announcementKey = nextKey;
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

  function ensureProfileDialog() {
    if ($('#profileDialog')) return;
    const dialog = document.createElement('div');
    dialog.id = 'profileDialog';
    dialog.className = 'profile-dialog';
    dialog.setAttribute('aria-hidden', 'true');
    dialog.innerHTML = '<div class="profile-backdrop" data-close-profile></div><section role="dialog" aria-modal="true" aria-labelledby="profileTitle"><button class="dialog-close" type="button" data-close-profile aria-label="关闭个人资料窗口">×</button><p class="eyebrow">个人账号</p><h2 id="profileTitle">编辑头像和昵称</h2><p class="muted">资料只显示在当前学习账号中。</p><div class="profile-avatar-editor"><div class="profile-avatar-preview" id="profileAvatarPreview">我</div><label for="profileAvatarInput">选择头像</label><input id="profileAvatarInput" type="file" accept="image/png,image/jpeg,image/webp"></div><form id="profileForm"><label><span>昵称</span><input id="profileNickname" maxlength="24" required></label><div class="profile-email" id="profileEmail"></div><button class="primary wide" id="profileSave" type="submit">保存个人资料</button><p class="form-error" id="profileError" role="status"></p></form></section>';
    document.body.appendChild(dialog);

    let avatarData = '';
    let profileState = {};
    const avatarMarkup = (avatar, name) => avatar ? `<img src="${avatar}" alt="用户头像">` : escapeHtml((name || '学习者').slice(0, 2).toUpperCase());
    const readState = async () => {
      if (!client || !session) return {};
      const result = await client.from('user_learning_data').select('learning_state').eq('user_id', session.user.id).maybeSingle();
      return result.data?.learning_state || {};
    };
    const close = () => {
      dialog.classList.remove('open');
      dialog.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };
    const open = async () => {
      if (!session) return window.siteOpenAuth();
      profileState = await readState();
      const saved = profileState.account_profile || {};
      const name = saved.display_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || '学习者';
      avatarData = saved.avatar_data || '';
      $('#profileNickname').value = name;
      $('#profileEmail').textContent = session.user.email || '';
      $('#profileAvatarPreview').innerHTML = avatarMarkup(avatarData, name);
      $('#profileAvatarInput').value = '';
      $('#profileError').textContent = '';
      dialog.classList.add('open');
      dialog.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    };
    $$('[data-close-profile]', dialog).forEach(node => node.onclick = close);
    $('#profileAvatarInput').onchange = event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) { $('#profileError').textContent = '图片不能超过 8MB。'; return; }
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 192, side = Math.min(image.width, image.height);
          canvas.width = canvas.height = size;
          canvas.getContext('2d').drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size);
          avatarData = canvas.toDataURL('image/jpeg', .82);
          $('#profileAvatarPreview').innerHTML = avatarMarkup(avatarData, $('#profileNickname').value);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    };
    $('#profileForm').onsubmit = async event => {
      event.preventDefault();
      const name = $('#profileNickname').value.trim();
      if (!name) return;
      const button = $('#profileSave');
      button.disabled = true;
      const learningState = { ...profileState, account_profile: { display_name: name, avatar_data: avatarData } };
      const current = await client.from('user_learning_data').select('quiz_state').eq('user_id', session.user.id).maybeSingle();
      const saved = await client.from('user_learning_data').upsert({ user_id: session.user.id, learning_state: learningState, quiz_state: current.data?.quiz_state || {} });
      const authResult = saved.error ? null : await client.auth.updateUser({ data: { ...session.user.user_metadata, display_name: name } });
      button.disabled = false;
      const error = saved.error || authResult?.error;
      if (error) { $('#profileError').textContent = error.message || '资料保存失败，请稍后重试。'; return; }
      session = { ...session, user: authResult.data.user };
      await paintAccount();
      close();
      toast('个人资料已保存', 'success');
    };
    addEventListener('keydown', event => { if (event.key === 'Escape' && dialog.classList.contains('open')) close(); });
    window.siteOpenProfile = open;
  }

  function openAdminWhenReady() {
    if (window.adminDashboard) {
      window.adminDashboard.open();
      return;
    }
    location.href = 'index.html?admin=1';
  }

  function paintUnreadReplies(unreadCount) {
    const count = Number(unreadCount || 0);
    const trigger = $('[data-account]');
    trigger?.querySelector('.account-unread-badge')?.remove();
    if (trigger && count) trigger.insertAdjacentHTML('beforeend', `<em class="account-unread-badge" aria-label="${count} 条管理员新回复">${count > 99 ? '99+' : count}</em>`);

    const learningLink = $('#accountMenu .account-learning-link');
    learningLink?.querySelector('em')?.remove();
    if (learningLink && count) learningLink.insertAdjacentHTML('beforeend', `<em>${count} 条新回复</em>`);

    const mobileLearningLink = $('.mobile-tabs a[href="learning.html"]');
    mobileLearningLink?.querySelector('.mobile-unread-badge')?.remove();
    if (mobileLearningLink && count) mobileLearningLink.insertAdjacentHTML('beforeend', `<em class="mobile-unread-badge">${count > 99 ? '99+' : count}</em>`);

    let notice = $('#replyNoticeBar');
    if (!notice) {
      notice = document.createElement('aside');
      notice.id = 'replyNoticeBar';
      notice.className = 'reply-notice-bar';
      notice.setAttribute('aria-live', 'polite');
      document.querySelector('.site-header')?.insertAdjacentElement('afterend', notice);
    }
    notice.hidden = !count;
    if (count) notice.innerHTML = `<a class="shell" href="learning.html"><span><i aria-hidden="true"></i>管理员回复了你的留言</span><b>查看 ${count} 条新回复 →</b></a>`;
  }

  async function refreshUnreadReplies() {
    if (!client || !session) return 0;
    const { count, error } = await client.from('user_messages').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id).not('admin_reply', 'is', null).neq('admin_reply', '').is('user_read_at', null);
    if (!error) paintUnreadReplies(count || 0);
    return count || 0;
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
      const profileResult = await client.from('user_learning_data').select('learning_state').eq('user_id', session.user.id).maybeSingle();
      const savedProfile = profileResult.data?.learning_state?.account_profile || {};
      const displayName = savedProfile.display_name || name;
      const avatar = savedProfile.avatar_data || '';
      trigger.innerHTML = `<span>${escapeHtml(displayName)}</span><i>${avatar ? `<img src="${avatar}" alt="">` : escapeHtml(displayName.slice(0, 2).toUpperCase())}</i>`;
      menu.innerHTML = `<b>${escapeHtml(session.user.email || '')}</b><a class="account-learning-link" href="learning.html">我的学习中心</a><button type="button" id="editProfileButton">编辑头像和昵称</button><button type="button" id="logoutButton">退出登录</button>`;
      await refreshUnreadReplies();
      trigger.onclick = event => { event.stopPropagation(); menu.classList.toggle('open'); };
      $('#editProfileButton').onclick = event => { event.stopPropagation(); menu.classList.remove('open'); window.siteOpenProfile(); };
      $('#logoutButton').onclick = async () => { await client.auth.signOut(); location.href = 'index.html'; };
      document.addEventListener('click', event => { if (!menu.contains(event.target) && event.target !== trigger) menu.classList.remove('open'); });
      const roleResult = await client.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      let admin = roleResult.data?.role === 'admin';
      if (!admin) admin = (await client.rpc('is_admin')).data === true;
      if (admin) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = '进入管理员后台';
        button.onclick = event => {
          event.stopPropagation();
          menu.classList.remove('open');
          openAdminWhenReady();
        };
        menu.insertBefore(button, $('#logoutButton'));
      }
    }
  }

  const ready = (async () => {
    ensureAccessibilityTools();
    ensureOfflineBanner();
    ensureAuthDialog();
    ensureProfileDialog();
    bindNavigation();
    ensureSearch();
    ensureSupportDialog();
    ensureCopyrightLinks();
    ensureAnnouncementUI();
    ensureMobileTabs();
    if (client) session = (await client.auth.getSession()).data.session;
    trackVisit();
    await paintAccount();
    await refreshAnnouncement();
    if (client) setInterval(refreshAnnouncement, 30000);
    if (session) {
      setInterval(refreshUnreadReplies, 30000);
    }
    addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      refreshAnnouncement();
      if (session) refreshUnreadReplies();
    });
    document.documentElement.classList.add('site-ready');
    return { client, session };
  })();

  window.site = {
    client,
    ready,
    toast,
    escapeHtml,
    refreshUnreadReplies,
    refreshAnnouncement,
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
