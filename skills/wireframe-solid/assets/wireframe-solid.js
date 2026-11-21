/* ============================================================
   wireframe-solid.js — optional helper. The CSS works without it.

   Does two things:
     1. Builds the 72 nested elements so you never paste them by hand.
        Any <div class="wireframe-solid"></div> is filled automatically.
     2. Optional scroll-scrubbed scaling, via data attributes:
        <div class="wireframe-solid" data-ws-scale-from="2" data-ws-scale-to=".4">

   Vanilla JS, no jQuery, no GSAP. Safe to load with `defer`.
   ============================================================ */
(function () {
  'use strict';

  var FACES = 12;
  var SEGMENTS = 5;

  function build(el) {
    if (el.dataset.wsBuilt) return;          // never double-build
    var frag = document.createDocumentFragment();
    for (var f = 0; f < FACES; f++) {
      var face = document.createElement('div');
      face.className = 'wireframe-solid__face';
      for (var s = 0; s < SEGMENTS; s++) face.appendChild(document.createElement('i'));
      frag.appendChild(face);
    }
    el.appendChild(frag);
    el.dataset.wsBuilt = '1';
  }

  function scrollScale(el) {
    var from = parseFloat(el.dataset.wsScaleFrom);
    var to = parseFloat(el.dataset.wsScaleTo);
    if (isNaN(from) || isNaN(to)) return;

    // The animation property is already used by the tumble, so scale
    // is applied to a wrapper to avoid fighting over `transform`.
    var wrap = document.createElement('div');
    wrap.style.display = 'inline-block';
    wrap.style.willChange = 'transform';
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);

    var ticking = false;
    function update() {
      var r = wrap.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // progress: 0 when the element enters the bottom, 1 when it leaves the top
      var p = 1 - (r.top + r.height) / (vh + r.height);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      wrap.style.transform = 'scale(' + (from + (to - from) * p).toFixed(3) + ')';
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  function init(root) {
    var nodes = (root || document).querySelectorAll('.wireframe-solid');
    for (var i = 0; i < nodes.length; i++) {
      build(nodes[i]);
      scrollScale(nodes[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  // Re-run after SPA / PJAX navigation (Swup, Barba, Turbo…):
  //   window.wireframeSolid.init()
  window.wireframeSolid = { init: init };
})();
