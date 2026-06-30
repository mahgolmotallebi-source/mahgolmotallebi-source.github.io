// Mahgol Motalebi — minimal motion + active nav (robust, no IntersectionObserver dependency)

(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if (reduced) reveals.forEach(function (e) { e.classList.add('in'); });

  function revealCheck() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var el = reveals[i];
      var top = el.getBoundingClientRect().top;
      if (top < vh * 0.92) {
        el.classList.add('in');
        reveals.splice(i, 1);
      }
    }
  }

  function navCheck() {
    var mark = (window.innerHeight || 0) * 0.32;
    var current = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= mark) current = sections[i].id;
    }
    if (!current && sections[0]) current = sections[0].id;
    links.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href').slice(1) === current);
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { revealCheck(); navCheck(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  revealCheck(); navCheck();
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.documentElement.classList.remove('preload'); });
  });

  // Safety: never leave content hidden if something stalls.
  setTimeout(function () { document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); }); }, 2200);

  // ---- in-page case-study views ----
  function openCase(id) {
    var el = document.getElementById(id);
    if (!el) return;
    document.querySelectorAll('.case-view').forEach(function (c) { c.classList.remove('is-open'); });
    el.classList.add('is-open');
    document.body.classList.add('case-open');
    if (location.hash !== '#' + id) {
      try { history.pushState(null, '', '#' + id); } catch (e) { location.hash = id; }
    }
    window.scrollTo(0, 0);
  }
  function closeCase(toWork) {
    if (!document.body.classList.contains('case-open')) return;
    document.body.classList.remove('case-open');
    document.querySelectorAll('.case-view').forEach(function (c) { c.classList.remove('is-open'); });
    try { history.pushState(null, '', location.pathname + location.search); } catch (e) {}
    var work = document.getElementById('work');
    if (toWork !== false && work) {
      var y = work.getBoundingClientRect().top + window.pageYOffset - 56;
      window.scrollTo(0, y);
    }
    onScroll();
  }
  window.openCase = openCase;
  window.closeCase = closeCase;

  // keyboard: open a focused project card with Enter/Space
  document.querySelectorAll('.proj--link').forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
  // Esc closes an open case
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('case-open')) closeCase();
  });
  // nav links close any open case (then scroll to their target)
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () { document.body.classList.remove('case-open'); });
  });
  // browser back/forward + deep links
  function syncFromHash() {
    var h = location.hash.slice(1);
    var el = h && document.getElementById(h);
    document.querySelectorAll('.case-view').forEach(function (c) { c.classList.remove('is-open'); });
    if (el && el.classList.contains('case-view')) {
      el.classList.add('is-open');
      document.body.classList.add('case-open');
      window.scrollTo(0, 0);
    } else {
      document.body.classList.remove('case-open');
    }
  }
  window.addEventListener('popstate', syncFromHash);
  syncFromHash();
})();
