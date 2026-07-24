(function(){
  if(window.__motionUIReady)return;
  window.__motionUIReady=true;
  document.body.classList.add('motion-enhanced');
  const items=document.querySelectorAll('.glass,.stats article,.portal-card,.method-track article,.roadmap-grid article,.learning-card,.showcase-card,.quiz-main,.lab-app');
  items.forEach((item,index)=>{item.classList.add('motion-item');item.style.transitionDelay=`${Math.min(index%6,5)*55}ms`});
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -20px'});
  items.forEach(item=>observer.observe(item));
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){document.querySelectorAll('.portal-card,.learning-card,.method-track article,.roadmap-grid article,.bank-total,.hero-learning-card').forEach(card=>{card.addEventListener('pointermove',event=>{const box=card.getBoundingClientRect(),rotateY=((event.clientX-box.left)/box.width-.5)*5,rotateX=((event.clientY-box.top)/box.height-.5)*-5;card.style.transform=`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`});card.addEventListener('pointerleave',()=>card.style.transform='')})}
  document.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const url=new URL(link.href,location.href);if(url.origin!==location.origin||link.target||link.hasAttribute('download')||(url.hash&&url.pathname===location.pathname))return;event.preventDefault();document.body.classList.add('page-leaving');setTimeout(()=>location.href=url.href,230)});
})();
