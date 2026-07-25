(function(){
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#fff8f2');
  if(!document.querySelector('link[rel="icon"]')){const icon=document.createElement('link');icon.rel='icon';icon.type='image/png';icon.href='assets/site-icon.png?v=1';document.head.appendChild(icon)}
  if(!document.querySelector('link[href*="youth-theme.css"]')){const theme=document.createElement('link');theme.rel='stylesheet';theme.href='youth-theme.css?v=1';document.head.appendChild(theme)}
  if(!document.querySelector('link[href*="typography-upgrade.css"]')){const type=document.createElement('link');type.rel='stylesheet';type.href='typography-upgrade.css?v=1';document.head.appendChild(type)}
  if(!document.querySelector('link[href*="apple-simple.css"]')){const simple=document.createElement('link');simple.rel='stylesheet';simple.href='apple-simple.css?v=4';document.head.appendChild(simple);const o=document.createElement('link');o.rel='stylesheet';o.href='optimization.css?v=1';document.head.appendChild(o);const opt=document.createElement('link');opt.rel='stylesheet';opt.href='optimization.css?v=1';document.head.appendChild(simple);document.head.appendChild(opt);document.head.appendChild(simple)}
  if(!document.querySelector('script[src*="account-profile.js"]')){const account=document.createElement('script');account.src='account-profile.js?v=4';account.defer=true;document.head.appendChild(account)}
  document.querySelectorAll('footer').forEach(function(f){
    if(f.classList.contains('has-footer-opt'))return;
    f.classList.add('has-footer-opt');
    f.className='site-footer-opt';
    f.innerHTML='<div class=footer-inner><div class=footer-brand>小菜鸟带你飞</div><p class=footer-tagline>编写 · 运行 · 学习 · 进步</p><div class=footer-links><a href=index.html>首页</a><a href=tutorial.html>系统教程</a><a href=quiz.html>3000题库</a><a href=lab.html>代码实验室</a><a href=learning.html>学习中心</a><a href=index.html#message>留言</a></div><div class=footer-bottom><span>© 2026 陈定栋</span><span style=cursor:pointer;font-size:12px;color:var(--text-secondary) onclick="window.scrollTo({top:0,behavior:\'smooth\'})">↑ 顶部</span></div></div>';
  });
  document.querySelectorAll('footer').forEach(function(f){if(f.classList.contains('has-footer-opt'))return;f.classList.add('has-footer-opt');f.className='site-footer-opt';f.innerHTML='<div class=footer-inner><div class=footer-brand>小菜鸟带你飞</div><p class=footer-tagline>编写 · 运行 · 学习 · 进步</p><div class=footer-links><a href=index.html>首页</a><a href=tutorial.html>系统教程</a><a href=quiz.html>3000题库</a><a href=lab.html>代码实验室</a><a href=learning.html>学习中心</a></div><div class=footer-bottom><span>© 2026 陈定栋</span><span class=footer-back onclick="window.scrollTo({top:0,behavior:'smooth'})">↑ 顶部</span></div></div>'});if(!document.querySelector('script[src*="reward.js"]')){const reward=document.createElement('script');reward.src='reward.js?v=1';reward.defer=true;document.head.appendChild(reward)}
  document.querySelectorAll('.nav,.sub-nav').forEach(function(nav){
    if(nav.querySelector('.menu-toggle'))return;
    var btn=document.createElement('button');
    btn.className='menu-toggle';
    btn.type='button';
    btn.setAttribute('aria-label','打开导航菜单');
    btn.innerHTML='<span></span><span></span><span></span>';
    btn.addEventListener('click',function(){
      var links=this.closest('nav').querySelector('.navlinks,.sub-links');
      if(links){links.classList.toggle('open');document.body.classList.toggle('nav-open')}
      this.classList.toggle('active');
      this.setAttribute('aria-label',this.classList.contains('active')?'关闭导航菜单':'打开导航菜单');
    });
    nav.insertBefore(btn,nav.querySelector('.account-area,.sub-user'));
  });document.querySelectorAll('.nav,.sub-nav').forEach(function(n){if(n.querySelector('.menu-toggle'))return;var b=document.createElement('button');b.className='menu-toggle';b.type='button';b.setAttribute('aria-label','打开导航菜单');b.innerHTML='<span></span><span></span><span></span>';b.addEventListener('click',function(){var l=this.closest('nav').querySelector('.navlinks,.sub-links');if(l)l.classList.toggle('open');this.classList.toggle('active')});n.insertBefore(b,n.querySelector('.account-area,.sub-user'))});if(!document.querySelector('script[src*="motion-ui.js"]')){const motion=document.createElement('script');motion.src='motion-ui.js?v=1';motion.defer=true;document.head.appendChild(motion)}
  document.querySelectorAll('.sub-links').forEach(nav=>{
    if(nav.querySelector('.home-link'))return;
    const home=document.createElement('a');home.className='home-link';home.href='index.html';home.textContent='首页';nav.prepend(home);
  });
  const brandMark=document.querySelector('.sub-brand b');if(brandMark){const brand=brandMark.parentElement;brand.style.cssText+='display:flex;align-items:center;gap:9px';const icon=document.createElement('img');icon.src='assets/site-icon.png';icon.alt='';icon.style.cssText='width:34px;height:34px;border-radius:10px;box-shadow:0 5px 14px #745fa526';brandMark.replaceWith(icon)}
  const config=window.SUPABASE_CONFIG||{};
  const client=config.url&&config.anonKey&&window.supabase?window.supabase.createClient(config.url,config.anonKey):null;
  const $=id=>document.getElementById(id);
  function toast(text){const el=$('subToast');if(!el)return;el.textContent=text;el.classList.add('show');clearTimeout(el.timer);el.timer=setTimeout(()=>el.classList.remove('show'),2400)}
  async function start(){
    if(!client){$('authRequired')?.classList.add('show');return null}
    const {data}=await client.auth.getSession();
    const session=data.session;
    if(!session){$('authRequired')?.classList.add('show');return null}
    const name=session.user.user_metadata?.display_name||session.user.email?.split('@')[0]||'学习者';
    const avatar=session.user.user_metadata?.avatar_url||'';
    if($('subUserName'))$('subUserName').textContent=name;
    if($('subAvatar'))$('subAvatar').innerHTML=avatar?`<img src="${avatar}" alt="用户头像">`:name.slice(0,2).toUpperCase();
    const context={client,session};
    window.dispatchEvent(new CustomEvent('subsite-ready',{detail:context}));
    return context;
  }
  window.subsite={client,start,toast};
  window.subsite.ready=start();
})();
