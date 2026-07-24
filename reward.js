(function(){
  if(window.siteReward)return;

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='reward.css?v=1';
  document.head.appendChild(css);

  function close(){
    document.getElementById('rewardDialog')?.classList.remove('open');
    document.body.classList.remove('reward-open');
  }

  function open(){
    document.getElementById('rewardDialog')?.classList.add('open');
    document.body.classList.add('reward-open');
  }

  function build(){
    document.querySelectorAll('.navlinks,.sub-links').forEach(nav=>{
      if(nav.querySelector('.reward-trigger'))return;
      const button=document.createElement('button');
      button.className='reward-trigger';
      button.type='button';
      button.textContent='支持作者';
      button.addEventListener('click',open);
      nav.appendChild(button);
    });

    const authCard=document.querySelector('.auth-card');
    if(authCard&&!authCard.querySelector('.reward-auth-trigger')){
      const authButton=document.createElement('button');
      authButton.className='reward-auth-trigger';
      authButton.type='button';
      authButton.textContent='支持作者';
      authButton.addEventListener('click',open);
      authCard.appendChild(authButton);
    }

    const dialog=document.createElement('div');
    dialog.className='reward-dialog';
    dialog.id='rewardDialog';
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-labelledby','rewardTitle');
    dialog.innerHTML=`
      <section class="reward-card">
        <button class="reward-close" type="button" aria-label="关闭打赏窗口">×</button>
        <div class="reward-heading">
          <small>支持网站持续更新</small>
          <h2 id="rewardTitle">请作者喝杯茶</h2>
          <p>如果教程对你有帮助，可以自愿通过微信支持。打赏不会影响任何学习功能。</p>
        </div>
        <div class="reward-code">
          <img src="assets/wechat-reward.jpg?v=1" alt="陈定栋的微信赞赏码">
        </div>
        <div class="reward-tips">
          <span><b>电脑</b>打开微信扫一扫，扫描图片中的二维码</span>
          <span><b>手机</b>长按保存图片，再用微信从相册识别</span>
        </div>
        <a class="reward-original" href="assets/wechat-reward.jpg?v=1" target="_blank" rel="noopener">查看收款码原图</a>
        <p class="reward-note">自愿支持 · 金额随意 · 请勿备注隐私信息</p>
      </section>`;
    document.body.appendChild(dialog);
    dialog.addEventListener('click',event=>{
      if(event.target===dialog||event.target.closest('.reward-close'))close();
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&dialog.classList.contains('open'))close();
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);
  else build();
  window.siteReward={open,close};
})();
