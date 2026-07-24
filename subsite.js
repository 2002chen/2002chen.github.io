(function(){
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
    if($('subUserName'))$('subUserName').textContent=name;
    if($('subAvatar'))$('subAvatar').textContent=name.slice(0,2).toUpperCase();
    $('subLogout')?.addEventListener('click',async()=>{await client.auth.signOut();location.href='index.html'});
    const context={client,session};
    window.dispatchEvent(new CustomEvent('subsite-ready',{detail:context}));
    return context;
  }
  window.subsite={client,start,toast};
  window.subsite.ready=start();
})();
