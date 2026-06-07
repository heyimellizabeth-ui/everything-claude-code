/* ============================================================================
   Brasa y Mar — shared scripts
   Visual scroll (GSAP ScrollTrigger) as PROGRESSIVE ENHANCEMENT.
   Content is always visible without JS or if the GSAP CDN fails (watchdog).
   ========================================================================== */
(function () {
  'use strict';

  // Swap no-js -> js immediately so reveals are JS-controlled when JS runs.
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile nav drawer ------------------------------------------------ */
  function initNav() {
    var burger = document.querySelector('.hamburger');
    var drawer = document.querySelector('.drawer');
    if (!burger || !drawer) return;
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Force every reveal visible (the safety net) ---------------------- */
  function revealAll() {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in');
    });
  }

  /* ---- Scroll progress bar (vanilla, no dependency) --------------------- */
  function initProgress() {
    var bar = document.querySelector('.progress');
    if (!bar) return;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || window.pageYOffset) / max : 0;
      bar.style.width = (pct * 100).toFixed(2) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---- IntersectionObserver fallback for reveals (no GSAP needed) ------- */
  function initObserverReveals() {
    if (reduceMotion || !('IntersectionObserver' in window)) { revealAll(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ---- GSAP-powered enhancements (parallax) when available -------------- */
  function initGsap() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return false;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // Hero parallax on the gradient background + dish art.
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var depth = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      gsap.to(el, {
        yPercent: depth * 100,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
      });
    });

    // Staggered reveals driven by GSAP for smoother batches.
    if (window.ScrollTrigger.batch) {
      window.ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        onEnter: function (els) {
          els.forEach(function (el) { el.classList.add('in'); });
        },
        once: true
      });
    }
    return true;
  }

  /* ---- Boot ------------------------------------------------------------- */
  function boot() {
    initNav();
    initProgress();

    var usedGsap = initGsap();
    if (!usedGsap) initObserverReveals();

    // WATCHDOG: if the GSAP CDN was slow/blocked and reveals never fired,
    // force everything visible after 4s so content is never stuck hidden.
    setTimeout(function () {
      var hidden = document.querySelectorAll('.reveal:not(.in)');
      if (hidden.length) revealAll();
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Absolute last resort: on full window load, nothing should remain hidden.
  window.addEventListener('load', function () {
    setTimeout(revealAll, 1500);
  });

  /* ---- Reservation / newsletter form (progressive, AJAX) ---------------- */
  window.BrasaForm = function (formEl, statusEl) {
    if (!formEl) return;
    formEl.addEventListener('submit', function (ev) {
      // If fetch is unavailable, let the browser submit normally to the PHP.
      if (!window.fetch) return;
      ev.preventDefault();
      var status = statusEl || formEl.querySelector('.form-status');
      var btn = formEl.querySelector('button[type="submit"]');
      var orig = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      if (status) { status.className = 'form-status'; status.textContent = ''; }

      fetch(formEl.getAttribute('action'), {
        method: 'POST',
        body: new FormData(formEl),
        headers: { 'X-Requested-With': 'fetch' }
      })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (data) {
          if (data && data.ok) {
            if (status) { status.className = 'form-status ok'; status.textContent = data.message || 'Thank you! We will confirm your table shortly.'; }
            formEl.reset();
          } else {
            if (status) { status.className = 'form-status err'; status.textContent = (data && data.message) || 'Something went wrong. Please call us to book.'; }
          }
        })
        .catch(function () {
          if (status) { status.className = 'form-status err'; status.textContent = 'Network error. Please try again or call us.'; }
        })
        .finally(function () { if (btn) { btn.disabled = false; btn.textContent = orig; } });
    });
  };
})();
