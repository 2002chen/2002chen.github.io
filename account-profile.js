(function(){
  if(window.accountProfile)return;

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='account-profile.css?v=2';
  document.head.appendChild(css);

  let client=null;
  let session=null;
  let profile=null;
  let pendingAvatar='';

  const initials=name=>(name||'学习者').trim().slice(0,2).toUpperCase();
  const avatarMarkup=(url,name)=>url?`<img src="${url}" alt="用户头像">`:initials(name);

  function paintAccount(user){
    if(!user)return;
    const name=user.user_metadata?.display_name||user.email?.split('@')[0]||'学习者';
    const avatar=user.user_metadata?.avatar_url||'';
    document.querySelectorAll('#accountName,#subUserName').forEach(el=>el.textContent=name);
    document.querySelectorAll('#accountAvatar,#subAvatar').forEach(el=>el.innerHTML=avatarMarkup(avatar,name));
  }

  function buildDialog(){
    const dialog=document.createElement('div');
    dialog.className='account-profile-dialog';
    dialog.id='accountProfileDialog';
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-labelledby','accountProfileTitle');
    dialog.innerHTML=`
      <section class="account-profile-card">
        <button class="account-profile-close" type="button" aria-label="关闭">×</button>
        <div class="account-profile-heading">
          <small>个人账号</small>
          <h2 id="accountProfileTitle">编辑个人资料</h2>
          <p>头像和昵称仅属于当前登录账号。</p>
        </div>
        <div class="account-avatar-editor">
          <div class="account-avatar-preview" id="profileAvatarPreview">PY</div>
          <label for="profileAvatarInput">选择头像</label>
          <input id="profileAvatarInput" type="file" accept="image/png,image/jpeg,image/webp">
        </div>
        <form class="account-profile-form" id="accountProfileForm">
          <label>昵称<input id="profileNickname" type="text" maxlength="24" required placeholder="请输入昵称"></label>
          <div class="account-profile-email" id="profileEmail"></div>
          <button class="account-profile-save" id="profileSave" type="submit">保存个人资料</button>
          <p class="account-profile-state" id="profileState"></p>
        </form>
        <button class="account-profile-logout" id="profileLogout" type="button">退出当前账号</button>
      </section>`;
    document.body.appendChild(dialog);
    dialog.addEventListener('click',event=>{
      if(event.target===dialog||event.target.closest('.account-profile-close'))close();
    });
    document.getElementById('profileAvatarInput').addEventListener('change',readAvatar);
    document.getElementById('accountProfileForm').addEventListener('submit',save);
    document.getElementById('profileLogout').addEventListener('click',logout);
  }

  async function ready(){
    client=window.learningCloud?.client||window.subsite?.client||null;
    if(!client)return false;
    const result=await client.auth.getSession();
    session=result.data.session;
    if(!session)return false;
    const dataResult=await client.from('user_learning_data').select('learning_state').eq('user_id',session.user.id).maybeSingle();
    profile=dataResult.data?.learning_state?.account_profile||{};
    const user={
      ...session.user,
      user_metadata:{
        ...(session.user.user_metadata||{}),
        display_name:profile.display_name||session.user.user_metadata?.display_name,
        avatar_url:profile.avatar_data||''
      }
    };
    paintAccount(user);
    return true;
  }

  async function open(){
    if(!await ready())return;
    const user=session.user;
    const name=profile?.display_name||user.user_metadata?.display_name||user.email?.split('@')[0]||'学习者';
    pendingAvatar=profile?.avatar_data||'';
    document.getElementById('profileAvatarInput').value='';
    document.getElementById('profileNickname').value=name;
    document.getElementById('profileEmail').textContent=user.email||'';
    document.getElementById('profileAvatarPreview').innerHTML=avatarMarkup(pendingAvatar,name);
    document.getElementById('profileState').textContent='';
    document.getElementById('accountProfileDialog').classList.add('open');
    document.body.style.overflow='hidden';
  }

  function close(){
    document.getElementById('accountProfileDialog')?.classList.remove('open');
    document.body.style.overflow='';
  }

  function readAvatar(event){
    const file=event.target.files?.[0];
    if(!file)return;
    if(file.size>8*1024*1024){state('图片不能超过 8MB',true);return;}
    const reader=new FileReader();
    reader.onload=()=>{
      const image=new Image();
      image.onload=()=>{
        const size=160;
        const canvas=document.createElement('canvas');
        canvas.width=size;
        canvas.height=size;
        const context=canvas.getContext('2d');
        const side=Math.min(image.width,image.height);
        context.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,size,size);
        pendingAvatar=canvas.toDataURL('image/jpeg',.8);
        document.getElementById('profileAvatarPreview').innerHTML=avatarMarkup(pendingAvatar,document.getElementById('profileNickname').value);
      };
      image.src=reader.result;
    };
    reader.readAsDataURL(file);
  }

  function state(message,error=false){
    const el=document.getElementById('profileState');
    el.textContent=message;
    el.classList.toggle('error',error);
  }

  async function save(event){
    event.preventDefault();
    const nickname=document.getElementById('profileNickname').value.trim();
    if(!nickname){state('请输入昵称',true);return;}
    const button=document.getElementById('profileSave');
    button.disabled=true;
    state('正在保存...');
    const current=await client.from('user_learning_data').select('learning_state,quiz_state').eq('user_id',session.user.id).maybeSingle();
    if(current.error){button.disabled=false;state(current.error.message||'资料读取失败',true);return;}
    const learningState={...(current.data?.learning_state||{}),account_profile:{display_name:nickname,avatar_data:pendingAvatar}};
    const dataResult=await client.from('user_learning_data').upsert({user_id:session.user.id,learning_state:learningState,quiz_state:current.data?.quiz_state||{}});
    if(dataResult.error){button.disabled=false;state(dataResult.error.message||'资料保存失败',true);return;}
    localStorage.setItem('python-lab-progress-v3',JSON.stringify({...JSON.parse(localStorage.getItem('python-lab-progress-v3')||'{}'),account_profile:learningState.account_profile}));
    const authResult=await client.auth.updateUser({data:{...(session.user.user_metadata||{}),display_name:nickname}});
    button.disabled=false;
    if(authResult.error){state(authResult.error.message||'昵称同步失败，请稍后重试',true);return;}
    profile=learningState.account_profile;
    session={...session,user:authResult.data.user};
    const paintedUser={...authResult.data.user,user_metadata:{...(authResult.data.user.user_metadata||{}),display_name:nickname,avatar_url:pendingAvatar}};
    paintAccount(paintedUser);
    state('已保存到你的账号');
    window.dispatchEvent(new CustomEvent('account-profile-updated',{detail:{user:paintedUser}}));
    setTimeout(close,650);
  }

  async function logout(){
    const button=document.getElementById('profileLogout');
    button.disabled=true;
    button.textContent='正在退出...';
    const result=client?await client.auth.signOut():{error:null};
    if(result.error){
      button.disabled=false;
      button.textContent='退出当前账号';
      state(result.error.message||'退出失败，请稍后重试',true);
      return;
    }
    localStorage.removeItem('python-lab-progress-v3');
    localStorage.removeItem('python-lab-quiz-v1');
    localStorage.removeItem('python-lab-free-code-v1');
    location.href='index.html';
  }

  function bind(){
    buildDialog();
    document.querySelectorAll('.sub-user').forEach(el=>{
      el.setAttribute('role','button');
      el.setAttribute('tabindex','0');
      el.setAttribute('aria-label','打开个人账号');
      el.addEventListener('click',open);
      el.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}
      });
    });
    const menu=document.getElementById('accountMenu');
    if(menu&&!document.getElementById('editAccountProfile')){
      const button=document.createElement('button');
      button.id='editAccountProfile';
      button.type='button';
      button.textContent='编辑头像和昵称';
      menu.insertBefore(button,document.getElementById('accountProgress'));
      button.addEventListener('click',event=>{
        event.stopPropagation();
        menu.classList.remove('open');
        open();
      });
    }
    ready();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
  else bind();
  window.accountProfile={open,paintAccount};
})();
