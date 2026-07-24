(function(){
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#fff8f2');
  if(!document.querySelector('link[rel="icon"]')){const icon=document.createElement('link');icon.rel='icon';icon.type='image/png';icon.href='assets/site-icon.png?v=1';document.head.appendChild(icon)}
  if(!document.querySelector('link[href*="youth-theme.css"]')){const theme=document.createElement('link');theme.rel='stylesheet';theme.href='youth-theme.css?v=1';document.head.appendChild(theme)}
  if(!document.querySelector('link[href*="typography-upgrade.css"]')){const type=document.createElement('link');type.rel='stylesheet';type.href='typography-upgrade.css?v=1';document.head.appendChild(type)}
  if(!document.querySelector('link[href*="apple-simple.css"]')){const simple=document.createElement('link');simple.rel='stylesheet';simple.href='apple-simple.css?v=2';document.head.appendChild(simple)}
  if(!document.querySelector('script[src*="account-profile.js"]')){const account=document.createElement('script');account.src='account-profile.js?v=4';account.defer=true;document.head.appendChild(account)}
  if(!document.querySelector('script[src*="reward.js"]')){const reward=document.createElement('script');reward.src='reward.js?v=1';reward.defer=true;document.head.appendChild(reward)}
  if(!document.querySelector('script[src*="motion-ui.js"]')){const motion=document.createElement('script');motion.src='motion-ui.js?v=1';motion.defer=true;document.head.appendChild(motion)}
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
