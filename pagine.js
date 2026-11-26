/* Pagine del sito: italiano/inglese con #en, ?lang=en o i pulsanti; la scelta resta in memoria */
(function () {
  var q = new URLSearchParams(location.search).get('lang');
  var h = location.hash === '#en' || location.hash === '#delete' ? 'en' : location.hash === '#it' || location.hash === '#elimina' ? 'it' : null;
  var salvata = null; try { salvata = localStorage.getItem('cedolino.sito.lingua'); } catch (e) {}
  var lingua = q || h || salvata || ((navigator.language || 'it').slice(0, 2) === 'it' ? 'it' : 'en');
  function metti(l) {
    lingua = l === 'en' ? 'en' : 'it';
    document.documentElement.lang = lingua;
    document.querySelectorAll('[data-l]').forEach(function (el) { el.hidden = el.getAttribute('data-l') !== lingua; });
    document.querySelectorAll('[data-set]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set') === lingua)); });
    try { localStorage.setItem('cedolino.sito.lingua', lingua); } catch (e) {}
  }
  document.querySelectorAll('[data-set]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); metti(b.getAttribute('data-set')); history.replaceState(null, '', '#' + lingua); });
  });
  window.addEventListener('hashchange', function () { if (location.hash === '#en' || location.hash === '#delete') metti('en'); else if (location.hash === '#it' || location.hash === '#elimina') metti('it'); });
  metti(lingua);
})();
