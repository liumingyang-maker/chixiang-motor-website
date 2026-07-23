/* Yandex Metrica counter 110874170 — Russia landing page */
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j=0;j<document.scripts.length;j++) {
    if (document.scripts[j].src===r) return;
  }
  k=e.createElement(t);
  a=e.getElementsByTagName(t)[0];
  k.async=1;
  k.src=r;
  a.parentNode.insertBefore(k,a);
})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=110874170','ym');

ym(110874170,'init',{
  ssr:true,
  clickmap:true,
  referrer:document.referrer,
  url:location.href,
  accurateTrackBounce:true,
  trackLinks:true
});

(function(){
  'use strict';

  function reachGoal(goalId){
    if (typeof window.ym!=='function') return;
    try {
      window.ym(110874170,'reachGoal',goalId);
    } catch (error) {
      // Analytics must never block navigation or form handling.
    }
  }

  document.addEventListener('click',function(event){
    var target=event.target;
    if (!target||typeof target.closest!=='function') return;
    if (target.closest('a[href*="wa.me/"],a[href*="whatsapp.com/"]')) {
      reachGoal('ym-open-chat');
    }
  });

  function watchLeadForms(){
    document.querySelectorAll('form').forEach(function(form){
      if (form.dataset.ymLeadObserver==='1') return;
      form.dataset.ymLeadObserver='1';

      form.addEventListener('submit',function(){
        delete form.dataset.ymLeadReported;
      });

      var observer=new MutationObserver(function(){
        var success=form.querySelector('.form-status.is-success');
        if (!success||form.dataset.ymLeadReported==='1') return;
        form.dataset.ymLeadReported='1';
        reachGoal('ym-submit-leadform');
      });

      observer.observe(form,{
        childList:true,
        subtree:true,
        attributes:true,
        characterData:true
      });
    });
  }

  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded',watchLeadForms);
  } else {
    watchLeadForms();
  }
})();
