
/* ============ PWA: installazione, aggiornamenti, condivisione ============ */
let installEvt = null; let swReg = null; let aggiornamentoPronto = false;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: minimal-ui)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const inAnteprima = () => { try { return window.self !== window.top; } catch (e) { return true; } };
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (['home', 'impostazioni'].includes(route())) render(); });
window.addEventListener('appinstalled', () => { installEvt = null; toast('Cedolino è installata: la trovi tra le app'); proteggiDati(); render(); });

function cardInstalla() {
  if (isStandalone() || S.installNascosto) return '';
  const ios = isIOS(); if (!installEvt && !ios) return '';
  return `<div class="card install"><div class="row"><img src="icons/icon-192.png" alt="" width="44" height="44" style="border-radius:12px"><div class="grow"><b>Installa Cedolino</b><div class="small muted">Si apre come un'app, funziona anche offline e ricevi i PDF dal menu Condividi.</div></div></div>
    <div class="btns" style="margin-top:12px"><button class="btn ghost" data-act="install-no">Non ora</button><button class="btn" data-act="install">${ic.download} Installa</button></div></div>`;
}
async function installa() {
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); installEvt = null; if (r && r.outcome === 'accepted') proteggiDati(); render(); return; }
  if (inAnteprima()) { toast('Per installarla apri Cedolino dal suo indirizzo (GitHub Pages)'); return; }
  const sh = openSheet(isIOS()
    ? `<h3>Installa su iPhone</h3><ol class="steps"><li>Tocca <b>Condividi</b> <span class="muted">(il quadrato con la freccia in basso)</span>.</li><li>Scorri e scegli <b>Aggiungi alla schermata Home</b>.</li><li>Tocca <b>Aggiungi</b>: Cedolino comparirà tra le app.</li></ol><p class="note">Su iPhone va fatto da Safari.</p><button class="btn block" data-x="ok">Ho capito</button>`
    : `<h3>Installa Cedolino</h3><ol class="steps"><li>Apri il menu del browser <b>⋮</b> in alto a destra.</li><li>Scegli <b>Installa app</b> o <b>Aggiungi a schermata Home</b>.</li><li>Conferma: Cedolino comparirà tra le app.</li></ol><button class="btn block" data-x="ok">Ho capito</button>`);
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) closeSheet(); });
}
async function proteggiDati() { try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch (e) {} }
function aggiornaBadge() {
  try { const n = promemoria().filter((t) => t.s === 'warn').length; if ('setAppBadge' in navigator) { if (n) navigator.setAppBadge(n); else navigator.clearAppBadge(); } } catch (e) {}
}
function bannerAggiornamento() {
  if (!aggiornamentoPronto || $('.upd')) return;
  const b = document.createElement('div'); b.className = 'upd';
  b.innerHTML = `<span>È pronta una nuova versione di Cedolino</span><button class="btn sm" data-x="upd">Aggiorna</button>`;
  document.body.appendChild(b);
  b.querySelector('[data-x="upd"]').onclick = () => { const w = swReg && swReg.waiting; if (w) w.postMessage('SKIP_WAITING'); else location.reload(); };
}
function registraSW() {
  if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || location.hostname === 'localhost') || inAnteprima()) return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    swReg = reg;
    const segui = (w) => { if (!w) return; w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) { aggiornamentoPronto = true; bannerAggiornamento(); } }); };
    if (reg.waiting && navigator.serviceWorker.controller) { aggiornamentoPronto = true; bannerAggiornamento(); }
    segui(reg.installing); reg.addEventListener('updatefound', () => segui(reg.installing));
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});
  let ricaricato = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (ricaricato) return; ricaricato = true; location.reload(); });
}
async function cercaAggiornamenti() {
  if (!swReg) { toast(inAnteprima() ? 'Gli aggiornamenti si gestiscono dall’app installata' : 'Hai già l’ultima versione'); return; }
  toast('Controllo…'); try { await swReg.update(); } catch (e) {}
  setTimeout(() => { if (!aggiornamentoPronto) toast('Hai già l’ultima versione'); }, 1500);
}
function statoRete() { document.body.classList.toggle('offline', !navigator.onLine); }
window.addEventListener('online', statoRete); window.addEventListener('offline', statoRete);

/* File ricevuti dal menu Condividi o aperti con Cedolino */
async function fileCondivisi() {
  const out = [];
  try {
    const c = await caches.open('cedolino-share');
    for (const req of await c.keys()) { const r = await c.match(req); const blob = await r.blob(); const nome = decodeURIComponent(r.headers.get('x-nome') || 'documento'); out.push(new File([blob], nome, { type: blob.type || r.headers.get('content-type') || '' })); await c.delete(req); }
  } catch (e) {}
  return out;
}
let fileInArrivo = [];
async function gestisciCondivisi(files) {
  if (!files || !files.length) files = await fileCondivisi();
  if (!files.length) { location.hash = '#home'; return; }
  fileInArrivo = files;
  history.replaceState(null, '', location.pathname + '#home'); lastRoute = 'home'; render();
  const nome = files.length === 1 ? files[0].name : `${files.length} file`;
  const A = (k, icon, t, s) => `<button class="action" data-k="${k}"><span class="ic" style="background:var(--accent-soft);color:var(--accent)">${icon}</span><span><b>${t}</b><small>${s}</small></span></button>`;
  const sh = openSheet(`<h3>Cosa hai condiviso?</h3><p class="lead">${esc(nome)}</p>${A('busta', ic.doc, 'Una busta paga', 'La leggo e la controllo')}${A('doc', ic.bag, 'Un contratto o documento', 'Lo archivio nel lavoro giusto')}${A('cu', ic.euro, 'Una Certificazione Unica', 'La confronto con le buste')}${A('planning', ic.cal, 'Il planning dei turni', 'Importo i turni')}`);
  sh.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; const fs = fileInArrivo; closeSheet();
    setTimeout(() => {
      if (!S.lavori.length && k !== 'busta') { toast('Prima aggiungi il lavoro'); return actions['job-new'](); }
      if (k === 'busta') caricaBusta(fs);
      if (k === 'doc') { if (S.lavori.length === 1) { location.hash = '#lavoro-' + S.lavori[0].id; setTimeout(() => addDocs(S.lavori[0].id, fs), 80); return; } const s2 = openSheet(`<h3>Di quale lavoro?</h3>${S.lavori.map((j) => `<button class="action" data-j="${j.id}">${jobAvatar(j)}<span><b>${esc(j.azienda)}</b><small>${jobPeriodo(j)}</small></span></button>`).join('')}`); s2.addEventListener('click', (ev) => { const x = ev.target.closest('[data-j]'); if (!x) return; closeSheet(); location.hash = '#lavoro-' + x.dataset.j; setTimeout(() => addDocs(x.dataset.j, fs), 80); }); }
      if (k === 'cu') caricaCU((attivo() || {}).id, new Date().getFullYear() - 1, fs[0]);
      if (k === 'planning') { location.hash = '#turni'; setTimeout(() => importaTurni(fs[0]), 80); }
    }, 230);
  });
}
if ('launchQueue' in window) { try { window.launchQueue.setConsumer(async (p) => { if (!p.files || !p.files.length) return; const fs = await Promise.all(p.files.map((h) => h.getFile())); const go = () => gestisciCondivisi(fs); if (document.readyState === 'complete' && app.innerHTML) go(); else setTimeout(go, 600); }); } catch (e) {} }
