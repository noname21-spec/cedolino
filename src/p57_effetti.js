
/* ===================== Effetti divertenti =====================
   Partono una volta, nel momento giusto, e durano poco. Si spengono in Impostazioni › Aspetto («Effetti divertenti»)
   e da soli con «Riduci animazioni» del telefono. Un tocco li chiude subito. */
const fxOn = () => S.fx !== false && !matchMedia('(prefers-reduced-motion: reduce)').matches;
function fxLayer(cls, html, ms) {
  const d = document.createElement('div'); d.className = 'fxl ' + cls; d.setAttribute('role', 'status'); d.innerHTML = html;
  document.body.appendChild(d);
  const via = () => { if (!d.parentNode) return; d.classList.add('via'); setTimeout(() => d.remove(), 220); };
  d.addEventListener('click', via); setTimeout(via, ms); return d;
}

/* Home: il netto gira come un contatore a rotelle e la barra del lordo si divide nei suoi pezzi (una volta per apertura) */
function fxHome() {
  if (!fxOn()) return;
  try { if (sessionStorage.getItem('cedolino.fxhome') === '1') return; sessionStorage.setItem('cedolino.fxhome', '1'); } catch (e) { /* senza sessionStorage gira comunque una volta per caricamento */ if (fxHome.fatto) return; fxHome.fatto = true; }
  const go = () => {
    const big = $('#app .hero .big'); const st = $('#app .hero .stack');
    if (big && !big.querySelector('.od')) {
      const orig = big.innerHTML, txt = big.textContent; let p = 0;
      big.setAttribute('aria-label', txt);
      big.innerHTML = txt.split('').map((c) => /\d/.test(c)
        ? `<span class="od" aria-hidden="true"><span class="st" style="--d:${c};--p:${p++}">${'0123456789'.split('').map((n) => `<i>${n}</i>`).join('')}</span></span>`
        : `<span aria-hidden="true">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
      setTimeout(() => { if (big.isConnected) { big.innerHTML = orig; big.removeAttribute('aria-label'); } }, 1500 + p * 60);
    }
    if (st) st.classList.add('fx-split');
  };
  const intro = document.getElementById('intro');
  if (intro) setTimeout(go, 1650); else go();
}

/* Busta salvata: esce uno scontrino; se i conti tornano arriva il timbro «Verificata», se il netto supera quello del mese prima scendono le monetine */
function fxScontrino(rec) {
  if (!fxOn() || !rec || rec.netto == null) return false;
  const l = rec.lordo, t = rec.trattenute, n = rec.netto;
  const torna = l != null && t != null && Math.abs(l - t - n) <= 1.5;
  const prima = S.buste.filter((b) => b.id !== rec.id && b.jobId === rec.jobId && b.netto && b.ym < rec.ym).sort((a, b) => (a.ym < b.ym ? 1 : -1))[0];
  const piu = prima ? n - prima.netto : 0;
  const riga = (k, v, c = '') => v == null ? '' : `<div class="${c}"><span>${k}</span><span>${eur(v)}</span></div>`;
  let h = `<div class="fx-pr"></div><div class="fx-paper"><div class="fx-h">Busta di ${esc(meseDi(rec.ym))}</div>${riga('Lordo', l)}${riga('Trattenute', t != null ? -t : null)}${riga('Netto', n, 'fx-t')}${torna ? '<div class="fx-stamp">Verificata ✓</div>' : ''}</div>`;
  let ms = torna ? 2700 : 2200;
  if (piu >= 1) {
    h += `<div class="fx-coins">${[8, 22, 36, 50, 64, 78, 92].map((x, i) => `<i style="--x:${x}%;--d:${(i % 3) * 0.09 + i * 0.03}s;--s:${i % 2 ? 22 : 18}px">€</i>`).join('')}</div><div class="fx-delta">▲ ${eur(piu)} rispetto a ${esc(meseDi(prima.ym))}</div>`;
    ms += 700;
  }
  fxLayer('fx-rc' + (torna ? ' ok' : '') + (piu >= 1 ? ' su' : ''), h + '<div class="fx-cap">Busta salvata</div>', ms);
  return true;
}

/* Inizio turno: il cartellino entra nell'orologio marcatempo ed esce con l'ora stampata */
function fxCartellino(ora) {
  if (!fxOn()) return false;
  fxLayer('fx-ck', `<div class="fx-clock"><span class="fx-slot"></span><div class="fx-time">${esc(ora)}</div></div><div class="fx-card"><i></i><i></i><i></i><b>IN ${esc(ora)}</b></div><div class="fx-cap">Turno iniziato alle ${esc(ora)} ✓</div>`, 2100);
  return true;
}
