/* Cedolino — app (generato da src/*.js) */
(function () {
'use strict';
const E = window.Engine;
const app = document.getElementById('app');
const filePick = document.getElementById('filePick');

/* ============ utilità ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EUR = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const eur = (n) => (n == null || n === '' || isNaN(n) ? '—' : EUR.format(n));
const eur0 = (n) => (n == null || isNaN(n) ? '—' : new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n));
const num = (n, d = 1) => (n == null || isNaN(n) ? '—' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: d }).format(n));
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MESI_B = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pad = (n) => String(n).padStart(2, '0');
const todayISO = () => E.iso(new Date());
const curYM = () => todayISO().slice(0, 7);
const ymLabel = (ym) => { const [y, m] = ym.split('-').map(Number); return `${cap(MESI[m - 1])} ${y}`; };
const ymShort = (ym) => { const [y, m] = ym.split('-').map(Number); return `${MESI_B[m - 1]} ${String(y).slice(2)}`; };
const meseDi = (ym) => MESI[Number(ym.slice(5)) - 1];
const addYM = (ym, n) => { let [y, m] = ym.split('-').map(Number); m += n; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return `${y}-${pad(m)}`; };
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return E.iso(d); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const dateLabel = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); return `${d} ${MESI_B[m - 1]} ${y}`; };
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5);
const toNum = (v) => {
  if (v == null) return null; if (typeof v === 'number') return isNaN(v) ? null : v;
  let s = String(v).trim().replace(/[€\s]/g, ''); if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (!/^-?\d+\.\d{1,2}$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s); return isNaN(n) ? null : n;
};
const fmtIn = (n) => (n == null || n === '' || isNaN(n) ? '' : String(Math.round(n * 100) / 100).replace('.', ','));
const COLORI = ['#6E95FF', '#E7B53C', '#3DD68C', '#FF6B6B', '#B78CFF', '#3CC8E7', '#FF8FB1', '#9BD45B'];
const TIPI = { indeterminato: 'Tempo indeterminato', determinato: 'Tempo determinato', apprendistato: 'Apprendistato', chiamata: 'A chiamata', stagionale: 'Stagionale', somministrazione: 'Somministrazione', altro: 'Altro' };
const TIPI_EN = { indeterminato: 'Permanent', determinato: 'Fixed-term', apprendistato: 'Apprenticeship', chiamata: 'On-call', stagionale: 'Seasonal', somministrazione: 'Agency', altro: '' };
const MOTIVI = { scadenza: 'Scadenza del contratto', licenziamento: 'Licenziamento', consensuale: 'Risoluzione consensuale (in conciliazione)', giustacausa: 'Dimissioni per giusta causa', dimissioni: 'Dimissioni volontarie', altro: 'Altro' };
const CAT_DOC = { contratto: 'Contratto', proroga: 'Proroga / trasformazione', lettera: 'Lettera / comunicazione', cu: 'Certificazione Unica', cessazione: 'Cessazione / dimissioni', altro: 'Altro' };
const CCNL_NOMI = { commercio: 'Commercio – Terziario Confcommercio', turismo: E.TABELLE.turismo.nome, pubblici: E.TABELLE.pubblici.nome, multiservizi: E.TABELLE.multiservizi.nome, cinema: 'Esercizi cinematografici (cinema)', altro: 'Altro contratto' };
function livelliDi(ccnl) {
  if (ccnl === 'commercio') return Object.entries(E.COMMERCIO_LIVELLI).map(([k, v]) => [k, v.label, v.t2611]);
  if (E.TABELLE[ccnl]) return Object.entries(E.TABELLE[ccnl].livelli).map(([k, v]) => [k, v[0], v[1]]);
  return [];
}
const livelloLabel = (j) => { const L = livelliDi(j.ccnl || 'commercio').find((x) => x[0] === String(j.livello)); return L ? L[1] : (j.livello ? `Livello ${j.livello}` : '—'); };

/* ============ icone ============ */
const I = (p, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
const ic = {
  gear: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  back: I('<path d="M15 18l-6-6 6-6"/>'),
  chev: I('<path d="M9 18l6-6-6-6"/>', 'width="18" height="18"'),
  upload: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>'),
  download: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
  doc: I('<path d="M6 2h9l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>'),
  pen: I('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>'),
  cal: I('<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  bag: I('<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>'),
  calc: I('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8"/>'),
  sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  play: I('<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4z"/>'),
  stop: I('<circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" rx="1"/>'),
  piggy: I('<path d="M19 9c1 0 2 1 2 2v2h-2l-1 2v3h-3v-2H9v2H6v-3a6 6 0 0 1 2-11h5a6 6 0 0 1 5 3z"/><circle cx="15.5" cy="10.5" r=".8"/>'),
  check: I('<path d="M20 6 9 17l-5-5"/>'),
  alert: I('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'),
  info: I('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>'),
  trash: I('<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>'),
  eye: I('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'),
  book: I('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  x: I('<path d="M18 6 6 18M6 6l12 12"/>'),
  star: I('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>'),
  chart: I('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'),
  bell: I('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>'),
  user: I('<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>'),
  flag: I('<path d="M4 22V4M4 4h12l-2 4 2 4H4"/>'),
  euro: I('<path d="M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9"/>'),
  lock: I('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  cloud: I('<path d="M18 10a6 6 0 0 0-11.6-2A4.5 4.5 0 0 0 6.5 17H18a3.5 3.5 0 0 0 0-7z"/>'),
  link: I('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'),
  mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  copy: I('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
  import: I('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>'),
  home: I('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
};

/* ============ crittografia (PIN e sincronizzazione) ============ */
const TE = new TextEncoder(), TD = new TextDecoder();
function b64(buf) { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); }
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function deriveKey(pass, saltBytes, iter = 150000) {
  const base = await crypto.subtle.importKey('raw', TE.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: saltBytes, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encJSON(obj, key) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, TE.encode(JSON.stringify(obj))); return { enc: 1, iv: b64(iv), ct: b64(ct) }; }
async function decJSON(o, key) { const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, key, unb64(o.ct)); return JSON.parse(TD.decode(pt)); }

/* ============ stato ============ */
const KEY = 'cedolino.v1', LOCK_KEY = 'cedolino.lock', UI_KEY = 'cedolino.ui';
const DEF = () => ({
  v: 2, updatedAt: 0,
  profilo: { nome: '', nascita: '', regione: 'emilia-romagna', aliquotaRegionale: 1.23, aliquotaComunale: 0.8, esenzioneComunale: 0, patrono: '', contribRate: 9.19, reddito2025: null, flatTax: true, variabiliMeseSucc: true, mese14: 7, giornoPaga: 10, pagaMeseSucc: true, giornoBusta: 15 },
  lavori: [], attivo: null, buste: [], turni: {}, cu: [], promemoria: [], regole: [], deleted: [],
  modelli: [
    { id: 'm1', nome: 'Mattina', inizio: '09:00', fine: '14:00', pausa: 0 },
    { id: 'm2', nome: 'Pomeriggio', inizio: '15:00', fine: '20:00', pausa: 0 },
    { id: 'm3', nome: 'Giornata', inizio: '10:00', fine: '19:00', pausa: 60 },
  ],
  tema: 'scuro', vetro: true, onboarded: false, timbro: null,
  cdc: { auto: false }, sync: { on: false, pass: '' }, notifiche: false, notificato: '',
});
function normalizza(s) { const d = DEF(); const o = Object.assign(d, s || {}); o.profilo = Object.assign(DEF().profilo, (s && s.profilo) || {}); ['cu', 'promemoria', 'regole', 'deleted', 'buste', 'lavori'].forEach((k) => { if (!Array.isArray(o[k])) o[k] = []; }); o.cdc = Object.assign({ auto: false }, o.cdc || {}); o.sync = Object.assign({ on: false, pass: '' }, o.sync || {}); if (s && s.lavori && s.lavori.length && s.onboarded == null) o.onboarded = true; return o; }
let S = DEF();
let storageOK = true;
let lockKey = null; // chiave AES quando il blocco PIN è attivo
const lockCfg = () => { try { return JSON.parse(localStorage.getItem(LOCK_KEY) || 'null'); } catch (e) { return null; } };
function uiSave() { try { localStorage.setItem(UI_KEY, JSON.stringify({ tema: S.tema, vetro: S.vetro })); } catch (e) {} }
let saveT = null;
function save(opts = {}) {
  S.updatedAt = Date.now();
  uiSave();
  try {
    if (lockKey) { encJSON(S, lockKey).then((o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { storageOK = false; } }); }
    else localStorage.setItem(KEY, JSON.stringify(S));
    storageOK = true;
  } catch (e) { storageOK = false; }
  if (!opts.noSync && S.sync.on) { clearTimeout(saveT); saveT = setTimeout(() => syncNow(true), 2500); }
}
const segnaEliminato = (id) => { if (id && !S.deleted.includes(id)) S.deleted.push(id); if (S.deleted.length > 3000) S.deleted = S.deleted.slice(-3000); };

/* File (PDF/foto) in IndexedDB, con ripiego in memoria */
const memFiles = new Map();
let dbP = null;
function db() {
  if (dbP) return dbP;
  dbP = new Promise((res) => {
    try { const r = indexedDB.open('cedolino-files', 1); r.onupgradeneeded = () => r.result.createObjectStore('files'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); }
    catch (e) { res(null); }
  });
  return dbP;
}
async function filePut(id, blob, meta) {
  const rec = { blob, name: meta.name, type: meta.type };
  const d = await db(); if (!d) { memFiles.set(id, rec); return; }
  await new Promise((res) => { try { const t = d.transaction('files', 'readwrite'); t.objectStore('files').put(rec, id); t.oncomplete = res; t.onerror = () => { memFiles.set(id, rec); res(); }; } catch (e) { memFiles.set(id, rec); res(); } });
}
async function fileGet(id) {
  if (memFiles.has(id)) return memFiles.get(id);
  const d = await db(); if (!d) return null;
  return new Promise((res) => { try { const r = d.transaction('files').objectStore('files').get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); } catch (e) { res(null); } });
}
async function fileDel(id) { memFiles.delete(id); const d = await db(); if (!d) return; try { d.transaction('files', 'readwrite').objectStore('files').delete(id); } catch (e) {} }

/* ============ tema ============ */
function applyTheme() {
  let t = S.tema; if (t === 'auto') t = matchMedia('(prefers-color-scheme: light)').matches ? 'chiaro' : 'scuro';
  document.documentElement.dataset.tema = t; document.documentElement.dataset.vetro = S.vetro ? '1' : '0';
  const mc = $('meta[name="theme-color"]'); if (mc) mc.content = t === 'chiaro' ? '#F2F5FC' : t === 'nero' ? '#000000' : '#0A1230';
}

/* ============ dominio ============ */
const job = (id) => S.lavori.find((j) => j.id === id);
const corrente = (j) => !j.fine || j.fine >= todayISO();
const attivo = () => { const a = job(S.attivo); if (a) return a; return S.lavori.find(corrente) || S.lavori.slice().sort((a, b) => (b.fine || '').localeCompare(a.fine || ''))[0] || null; };
const iniziali = (s) => (s || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
const isTD = (j) => ['determinato', 'stagionale', 'somministrazione'].includes(j.tipo);
const jCalc = (j) => (j.tipo === 'chiamata' ? Object.assign({}, j, { oreSett: j.oreSettFull || 40 }) : j);
function jobPeriodo(j) {
  const a = j.inizio ? dateLabel(j.inizio) : '?';
  const b = j.fine ? (j.fine < todayISO() ? dateLabel(j.fine) : `${dateLabel(j.fine)} (scadenza)`) : 'oggi';
  return `${a} – ${b}`;
}
function jobMesi(j) { if (!j.inizio) return null; const end = j.fine && j.fine < todayISO() ? j.fine : todayISO(); return Math.max(0, (new Date(end) - new Date(j.inizio)) / (30.44 * 864e5)); }
const durataTxt = (m) => (m == null ? '' : m < 1 ? `${Math.max(1, Math.round(m * 30.44))} giorni` : m < 12 ? `${Math.round(m)} ${Math.round(m) === 1 ? 'mese' : 'mesi'}` : `${num(m / 12, 1)} anni`);
function attivoNelMese(j, ym) {
  const [y, m] = ym.split('-').map(Number); const dim = new Date(y, m, 0).getDate();
  const first = `${ym}-01`, last = `${ym}-${pad(dim)}`;
  const ini = j.inizio || '1900-01-01', fin = j.fine || '2999-12-31';
  if (ini > last || fin < first) return 0;
  const from = ini > first ? ini : first, to = fin < last ? fin : last;
  return daysBetween(from, to) + 1;
}
function mesiRateo(j, fromYM, toYM) { let n = 0, ym = fromYM; while (ym <= toYM) { if (attivoNelMese(j, ym) >= 15) n++; ym = addYM(ym, 1); } return n; }
const giorniLavorativi = (ym) => { const [y, m] = ym.split('-').map(Number); const dim = new Date(y, m, 0).getDate(); let n = 0; for (let d = 1; d <= dim; d++) if (new Date(y, m - 1, d).getDay() !== 0) n++; return n; };

/** Stima completa di una busta per lavoro e mese */
function stima(j, ym) {
  if (!j) return null;
  const P = S.profilo;
  const giorniAttivi = attivoNelMese(j, ym); if (!giorniAttivi) return null;
  const [y, mo] = ym.split('-').map(Number); const dim = new Date(y, mo, 0).getDate();
  const chiamata = j.tipo === 'chiamata'; const jc = jCalc(j);
  const c = E.contratto(jc, ym);
  const quota = giorniAttivi >= dim ? 1 : giorniAttivi / dim;
  const base = chiamata ? 0 : c.base * quota;
  const vym = P.variabiliMeseSucc ? addYM(ym, -1) : ym;
  const turni = S.turni[j.id] || {};
  let cl = null, v = null;
  // mesi di turni pagati in questa busta (nell'ultima busta anche quelli del mese stesso)
  const vmesi = [vym]; if (vym !== ym && j.fine && j.fine.slice(0, 7) === ym) vmesi.push(ym);
  for (const mm of vmesi) {
    if (!Object.keys(turni).some((k) => k.startsWith(mm))) continue;
    const c1 = E.classificaMese(turni, mm, jc, P.patrono); const cv = E.contratto(jc, mm);
    const v1 = E.importiVariabili(c1, cv, j); v1.ordinarie = chiamata ? c1.ordinarie * cv.pagaOraria : 0; v1.totale += v1.ordinarie;
    if (!cl) { cl = c1; v = v1; }
    else { Object.keys(cl).forEach((k) => { if (typeof cl[k] === 'number') cl[k] += c1[k]; }); Object.keys(v).forEach((k) => { v[k] += v1[k]; }); }
  }
  let disponibilita = 0;
  if (chiamata && j.disponibilita) {
    const gl = giorniLavorativi(ym); const lavorati = Object.entries(turni).filter(([k, g]) => k.startsWith(ym) && g.tipo === 'turno').length;
    disponibilita = 0.2 * c.minimoFull * Math.max(0, 1 - lavorati / gl) * quota;
  }
  let aggiuntiva = 0; const aggVoci = [];
  if (!chiamata) {
    const fineQui = j.fine && j.fine.slice(0, 7) === ym;
    if (mo === 12 || fineQui) { const n = mesiRateo(j, `${y}-01`, ym); const a = c.base * n / 12; if (a > 0) { aggiuntiva += a; aggVoci.push([`Tredicesima${n < 12 ? ` (${n}/12)` : ''}`, a]); } }
    if (c.mensilita >= 14 && (mo === Number(P.mese14) || fineQui)) {
      let from, to; if (mo === Number(P.mese14)) { from = `${y - 1}-07`; to = `${y}-06`; } else { from = mo >= 7 ? `${y}-07` : `${y - 1}-07`; to = ym; }
      const n = Math.min(12, mesiRateo(j, from, to)); const a = c.base * n / 12;
      if (a > 0) { aggiuntiva += a; aggVoci.push([`Quattordicesima${n < 12 ? ` (${n}/12)` : ''}`, a]); }
    }
  }
  const ordinario = base + (v ? v.totale : 0) + disponibilita;
  const cr = Number(P.contribRate) || 9.19;
  const nAnno = mesiRateo(j, `${y}-01`, `${y}-12`) || 1;
  const varAnn = (v ? v.totale : 0) * nAnno + disponibilita * nAnno;
  const Rannuo = Math.max(0, (chiamata ? varAnn : c.base * nAnno * c.mensilita / 12 + varAnn) * (1 - cr / 100));
  const red25 = toNum(P.reddito2025);
  const flat15ok = P.flatTax && (red25 == null || red25 <= 40000);
  const flat5ok = P.flatTax && (red25 == null || red25 <= 33000);
  const aum5 = (c.aumentiRinnovo || 0) * (chiamata ? 0 : quota + (c.base ? aggiuntiva / c.base : 0));
  let addReg = 0, addCom = 0;
  if (j.inizio && j.inizio < `${y}-01-01`) { const Rprev = y === 2026 && red25 != null ? red25 : Rannuo; const ra = E.rateAddizionali(ym, Rprev, Rannuo, P); addReg = ra.reg; addCom = ra.com; }
  const res = E.calcolaMese({ ym, ordinario, aggiuntiva, magg15: v ? v.magg15 : 0, aum5, Rannuo, contribRate: cr, td: isTD(j), flat15ok, flat5ok, addRegRata: addReg, addComRata: addCom, giorniMese: giorniAttivi });
  const voci = [];
  if (base) voci.push([giorniAttivi < dim ? `Retribuzione (${giorniAttivi}/${dim} gg)` : 'Retribuzione ordinaria', base]);
  if (v) {
    if (v.ordinarie) voci.push([`Ore lavorate (${num(cl.ordinarie)} h)`, v.ordinarie]);
    if (v.supplementare) voci.push([`Lavoro supplementare (${num(cl.supplementari)} h)`, v.supplementare]);
    if (v.straordinario) voci.push([`Straordinario (${num(cl.straord15 + cl.straord20)} h)`, v.straordinario]);
    if (v.festivo) voci.push([`Lavoro festivo (${num(cl.festive)} h)`, v.festivo]);
    if (v.maggDomenicale) voci.push([`Magg. domenicale (${num(cl.domenicali)} h)`, v.maggDomenicale]);
    if (v.maggNotturno) voci.push([`Magg. notturna (${num(cl.notturne)} h)`, v.maggNotturno]);
    if (v.malattia) voci.push([`Malattia 4°–20° giorno (${cl.malattiaRidotti} gg)`, v.malattia]);
    if (v.assenza) voci.push([`Assenze non retribuite (${num(cl.assenzaOre)} h)`, v.assenza]);
  }
  if (disponibilita) voci.push(['Indennità di disponibilità', disponibilita]);
  aggVoci.forEach((a) => voci.push(a));
  return { j, ym, c, base, v, cl, vym, aggiuntiva, ordinario, Rannuo, res, voci, giorniAttivi, chiamata };
}

/** Saldi ferie/permessi stimati a una data (default oggi) */
function saldi(j, alla) {
  if (!j || j.tipo === 'chiamata') return null;
  const oggi = alla || todayISO(); const cur = oggi.slice(0, 7);
  const pa = E.permessiAnnui(j, oggi);
  let baseYM, ferie, perm;
  const ultime = S.buste.filter((b) => b.jobId === j.id && (b.ferieRes != null || b.permessiRes != null)).sort((a, b) => (a.ym < b.ym ? 1 : -1));
  if (ultime.length) { baseYM = ultime[0].ym; ferie = ultime[0].ferieRes || 0; perm = ultime[0].permessiRes || 0; }
  else if (j.resData) { baseYM = j.resData.slice(0, 7); ferie = toNum(j.resFerie) || 0; perm = toNum(j.resPermessi) || 0; }
  else { if (!j.inizio) return null; baseYM = addYM(j.inizio.slice(0, 7), -1); ferie = 0; perm = 0; }
  let ym = addYM(baseYM, 1); let mesi = 0;
  while (ym <= cur) { if (attivoNelMese(j, ym) >= 15 && (ym < cur || alla)) mesi++; ym = addYM(ym, 1); }
  const t = S.turni[j.id] || {}; const endBase = `${baseYM}-31`;
  let fU = 0, pU = 0; const oreG = E.contratto(j, cur).oreSett / (Number(j.giorniSett) || 5);
  for (const [k, g] of Object.entries(t)) { if (k <= endBase || k > oggi) continue; if (g.tipo === 'ferie') fU++; else if (g.tipo === 'permesso') pU += Number(g.ore) || oreG; }
  return { ferie: ferie + mesi * pa.ferieGiorni / 12 - fU, permessi: perm + mesi * (pa.rolOre + pa.exFestOre) / 12 - pU, da: baseYM, annui: pa };
}

/** TFR maturato fino a una data, con rivalutazione annua (1,5% + 75% inflazione, stimata all'1,5%) */
function tfrStimato(j, alla) {
  if (!j || !j.inizio) return 0;
  let fondo = 0; let ym = j.inizio.slice(0, 7);
  const lim = alla || (j.fine && j.fine < todayISO() ? j.fine : todayISO());
  const end = (j.fine && j.fine < lim ? j.fine : lim).slice(0, 7);
  while (ym <= end) {
    const g = attivoNelMese(j, ym);
    if (g) {
      const b = S.buste.filter((x) => x.jobId === j.id && x.ym === ym && x.lordo);
      let lordo;
      if (b.length) lordo = b.reduce((a, x) => a + x.lordo, 0);
      else if (j.tipo === 'chiamata') { const st = stima(j, ym); lordo = st ? st.ordinario * (14 / 12) : 0; }
      else { const c = E.contratto(j, ym); const [yy, mm] = ym.split('-').map(Number); lordo = c.base * c.mensilita / 12 * Math.min(1, g / new Date(yy, mm, 0).getDate()); }
      fondo += lordo / 13.5 - lordo * 0.005;
    }
    if (ym.endsWith('-12') && ym < end) fondo *= 1 + (0.015 + 0.75 * 0.015) * 0.83;
    ym = addYM(ym, 1);
  }
  return Math.max(0, fondo);
}

/* ============ controllo busta ============ */
function controlla(b) {
  const out = []; const j = job(b.jobId);
  if (!j) return [{ s: 'info', t: 'Nessun lavoro collegato', p: 'Collega la busta a un datore di lavoro per poterla controllare.' }];
  const P = S.profilo; const cr = Number(P.contribRate) || 9.19;
  const st = stima(j, b.ym);
  const isAgg = b.tipo === 'tredicesima' || b.tipo === 'quattordicesima';
  if (st && b.lordo && b.tipo === 'mensile' && !st.chiamata) {
    const cl = st.cl; const assenze = cl && (cl.assenzaOre > 0 || cl.malattiaGiorni > 0);
    if (b.lordo + 1 < st.base * 0.97 && !assenze) out.push({ s: 'warn', t: 'Lordo più basso del previsto', p: `Per ${livelloLabel(j)} con ${num(st.c.oreSett)} h a settimana la retribuzione minima del mese è circa ${eur(st.base)}, la busta riporta ${eur(b.lordo)}. Può dipendere da assenze, giorni non lavorati o da un livello diverso: controlla ore e paga base.` });
    else out.push({ s: 'ok', t: 'Lordo coerente col contratto', p: `Retribuzione minima attesa ${eur(st.base)}${st.c.stima ? ' (stima)' : ''}, lordo in busta ${eur(b.lordo)}.` });
  }
  if (b.lordo && b.contributi) {
    const base = b.imponibilePrev || b.lordo; const atteso = base * cr / 100; const diff = b.contributi - atteso;
    if (Math.abs(diff) > Math.max(3, atteso * 0.06)) out.push({ s: 'warn', t: `Contributi diversi dal ${num(cr, 2)}%`, p: `Su ${eur(base)} ci si aspetta circa ${eur(atteso)}, in busta ${eur(b.contributi)}. Se ci sono rimborsi o voci non soggette a contributi è normale; altrimenti chiedi spiegazioni.` });
    else out.push({ s: 'ok', t: `Contributi ${/fpls|enpals/i.test(b.testo || '') ? 'FPLS (ex ENPALS)' : 'INPS'} corretti`, p: `${eur(b.contributi)}, circa il ${num(cr, 2)}% dell'imponibile.` });
  }
  if (b.lordo && b.netto && st) {
    const red25 = toNum(P.reddito2025);
    const r = E.calcolaMese({ ym: b.ym, ordinario: isAgg ? 0 : b.lordo, aggiuntiva: isAgg ? b.lordo : 0, magg15: st.v ? st.v.magg15 : 0, aum5: st.c.aumentiRinnovo || 0, Rannuo: st.Rannuo, contribRate: cr, td: isTD(j), flat15ok: P.flatTax && (red25 == null || red25 <= 40000), flat5ok: P.flatTax && (red25 == null || red25 <= 33000), addRegRata: b.addReg ?? st.res.addRegionale, addComRata: b.addCom ?? st.res.addComunale, giorniMese: st.giorniAttivi });
    const diff = b.netto - r.netto; const tol = Math.max(25, r.netto * 0.04);
    if (Math.abs(diff) <= tol) out.push({ s: 'ok', t: 'Netto in linea con la stima', p: `Stima ${eur(r.netto)}, in busta ${eur(b.netto)} (differenza ${eur(diff)}).` });
    else out.push({ s: diff < 0 ? 'warn' : 'info', t: diff < 0 ? 'Netto più basso della stima' : 'Netto più alto della stima', p: `Stima ${eur(r.netto)}, in busta ${eur(b.netto)} (${diff > 0 ? '+' : ''}${eur(diff)}). Cause frequenti: conguaglio IRPEF, addizionali dell'anno prima, anticipi o quote sindacali, arretrati, bonus fiscali non ancora applicati.${b.ym.endsWith('-12') ? ' A dicembre il conguaglio di fine anno può cambiare molto il netto.' : ''}`, lettera: diff < 0 ? `Il netto (${eur(b.netto)}) mi sembra più basso di quanto mi aspettavo (circa ${eur(r.netto)}): potreste indicarmi quali trattenute hanno inciso?` : null });
  }
  if (st && st.cl && b.oreExtra != null) {
    const att = st.cl.supplementari + st.cl.straord15 + st.cl.straord20;
    if (Math.abs(att - b.oreExtra) > 0.5) out.push({ s: 'warn', t: 'Ore extra diverse dai tuoi turni', p: `Dai turni di ${meseDi(st.vym)} risultano ${num(att)} h tra supplementari e straordinari, in busta ${num(b.oreExtra)} h. Possono essere pagate nel mese dopo o finite in banca ore: verifica.`, lettera: `Dai miei turni di ${meseDi(st.vym)} risultano ${num(att)} ore oltre l'orario contrattuale, mentre in busta ne trovo ${num(b.oreExtra)}: potreste verificare?` });
    else out.push({ s: 'ok', t: 'Ore extra pagate', p: `${num(att)} h registrate, ${num(b.oreExtra)} h in busta.` });
  }
  if (b.testo && st) {
    const T = b.testo; const R = st.Rannuo; const red25 = toNum(P.reddito2025);
    if (R <= 20000 && !/esent|cuneo|207\/?2024|non\s*imp|l\.?\s*207|art\.?\s*1\s*c\.?\s*4/i.test(T)) out.push({ s: 'info', t: 'Somma esente (taglio cuneo) non trovata', p: `Con un reddito previsto sotto i 20.000 € spetta una somma esente del ${R <= 8500 ? '7,1' : R <= 15000 ? '5,3' : '4,8'}% del reddito. Nella busta non trovo la voce: a volte ha un nome diverso.`, lettera: 'Non trovo in busta la somma esente prevista dal taglio del cuneo fiscale (L. 207/2024): mi viene riconosciuta?' });
    if (R <= 15000 && !/integrativ|t\.?\s*i\.?\s*r|ex\s*bonus|bonus\s*100|l\.?\s*21\/2020/i.test(T)) out.push({ s: 'info', t: 'Trattamento integrativo non trovato', p: 'Con questo reddito di solito spettano circa 100 € al mese (ex bonus Renzi). Non trovo la voce nel testo della busta.', lettera: 'Non trovo in busta il trattamento integrativo (ex bonus 100 €): mi spetta con il mio reddito?' });
    if (st.cl && (st.cl.festive + st.cl.domenicali + st.cl.notturne) > 0 && (red25 == null || red25 <= 40000) && !/sostitut|detass|15\s*%/i.test(T)) out.push({ s: 'info', t: 'Detassazione 15% non trovata', p: 'Nel 2026 le maggiorazioni per lavoro festivo, notturno e nel giorno di riposo sono tassate al 15% (fino a 1.500 €) se il reddito 2025 non supera 40.000 €.', lettera: 'Per le maggiorazioni di festivi e domeniche non vedo applicata l’imposta sostitutiva del 15% prevista per il 2026: è corretto?' });
  }
  if (b.ferieRes != null) {
    const prev = S.buste.filter((x) => x.jobId === b.jobId && x.ym < b.ym && x.ferieRes != null).sort((a, c) => (a.ym < c.ym ? 1 : -1))[0];
    if (prev && prev.ym === addYM(b.ym, -1)) {
      const used = Object.entries(S.turni[b.jobId] || {}).filter(([k, g]) => k.startsWith(b.ym) && g.tipo === 'ferie').length;
      const att = prev.ferieRes + 26 / 12 - used;
      if (Math.abs(att - b.ferieRes) > 1.2) out.push({ s: 'info', t: 'Saldo ferie da verificare', p: `Partendo da ${num(prev.ferieRes, 2)} giorni il mese scorso mi aspettavo circa ${num(att, 2)} giorni, in busta ${num(b.ferieRes, 2)}. Alcune buste indicano le ferie in ore.`, lettera: `Il saldo ferie (${num(b.ferieRes, 2)}) non mi torna rispetto al mese precedente (${num(prev.ferieRes, 2)}): potreste verificarlo?` });
    }
  }
  if (!out.length) out.push({ s: 'info', t: 'Pochi dati per il controllo', p: 'Inserisci almeno lordo, netto e contributi (o carica il PDF) per avere un controllo completo.' });
  return out;
}

/* ============ NASpI: contributi degli ultimi 4 anni ============ */
function naspiDati(fine) {
  const da = addDays(fine, -4 * 365 - 1);
  const settimane = new Set(); let retr = 0; const dett = [];
  for (const j of S.lavori) {
    if (!j.inizio) continue;
    const a = j.inizio > da ? j.inizio : da; const b = (j.fine || fine) < fine ? (j.fine || fine) : fine;
    if (a > b) continue;
    let sett = 0, r = 0; const before = settimane.size;
    if (j.tipo === 'chiamata') {
      Object.entries(S.turni[j.id] || {}).forEach(([k, g]) => { if (g.tipo === 'turno' && k >= a && k <= b) settimane.add(E.lunediDi(k)); });
    } else { for (let d = a; d <= b; d = addDays(d, 7)) settimane.add(E.lunediDi(d)); settimane.add(E.lunediDi(b)); }
    sett = settimane.size - before;
    let ym = a.slice(0, 7);
    while (ym <= b.slice(0, 7)) {
      const bs = S.buste.filter((x) => x.jobId === j.id && x.ym === ym && x.lordo);
      if (bs.length) r += bs.reduce((s, x) => s + (x.imponibilePrev || x.lordo), 0);
      else { const st = stima(j, ym); if (st) r += st.ordinario + st.aggiuntiva; }
      ym = addYM(ym, 1);
    }
    retr += r; dett.push({ j, sett, r });
  }
  return { settimane: settimane.size, retribuzione: retr, dett, da };
}

/* ============ anno fiscale (più datori) ============ */
function annoFiscale(y) {
  const P = S.profilo; const cr = Number(P.contribRate) || 9.19;
  const righe = []; const giorni = new Set();
  for (const j of S.lavori) {
    let mesi = 0; for (let m = 1; m <= 12; m++) if (attivoNelMese(j, `${y}-${pad(m)}`)) mesi++;
    if (!mesi) continue;
    const ini = j.inizio > `${y}-01-01` ? j.inizio : `${y}-01-01`; const fin = (j.fine || `${y}-12-31`) < `${y}-12-31` ? (j.fine || `${y}-12-31`) : `${y}-12-31`;
    for (let d = ini; d <= fin; d = addDays(d, 1)) giorni.add(d);
    const cu = S.cu.find((c) => c.jobId === j.id && Number(c.anno) === y);
    const r = { j, reddito: 0, irpef: 0, ti: 0, esente: 0, fonte: { cu: !!cu, buste: 0, stime: 0 } };
    if (cu) { r.reddito = cu.reddito || 0; r.irpef = cu.irpef || 0; r.ti = cu.ti || 0; r.esente = cu.esente || 0; }
    else {
      for (let m = 1; m <= 12; m++) {
        const ym = `${y}-${pad(m)}`; if (!attivoNelMese(j, ym)) continue;
        const bs = S.buste.filter((b) => b.jobId === j.id && b.ym === ym);
        const st = stima(j, ym);
        if (bs.length) {
          bs.forEach((b) => { const contr = b.contributi ?? (b.lordo || 0) * cr / 100; r.reddito += b.imponibileFisc ?? Math.max(0, (b.lordo || 0) - contr); r.irpef += b.irpef ?? 0; });
          if (st) { r.ti += st.res.trattamentoIntegrativo; r.esente += st.res.sommaEsente; }
          r.fonte.buste++;
        } else if (st) { r.reddito += st.res.imponibileFiscale; r.irpef += st.res.irpefNetta; r.ti += st.res.trattamentoIntegrativo; r.esente += st.res.sommaEsente; r.fonte.stime++; }
      }
    }
    righe.push(r);
  }
  const R = righe.reduce((a, r) => a + r.reddito, 0);
  const gg = Math.min(365, giorni.size);
  const lorda = E.irpefLorda(R, y);
  let detr = E.detrazioneLavoro(R) * gg / 365; if (R <= 15000 && gg) detr = Math.max(detr, righe.some((r) => isTD(r.j)) ? 1380 : 690);
  const cu = E.cuneo(R, R);
  const dovuta = Math.max(0, lorda - detr - cu.ulterioreDetrazione);
  const tiDov = E.trattamentoIntegrativo(R, lorda, detr, gg || 365);
  const esDov = cu.sommaEsentePct * R;
  const trattenuta = righe.reduce((a, r) => a + r.irpef, 0), tiRic = righe.reduce((a, r) => a + r.ti, 0), esRic = righe.reduce((a, r) => a + r.esente, 0);
  const saldo = (trattenuta - dovuta) + (tiDov - tiRic) + (esDov - esRic);
  const addReg = lorda - detr > 0 ? E.addizionaleRegionale(R, P) : 0, addCom = lorda - detr > 0 ? E.addizionaleComunale(R, P) : 0;
  return { y, righe, R, giorni: gg, lorda, detr, ulteriore: cu.ulterioreDetrazione, dovuta, tiDov, esDov, trattenuta, tiRic, esRic, saldo, addReg, addCom };
}

/* ============ promemoria ============ */
const dataPaga = (ym) => { const P = S.profilo; const t = P.pagaMeseSucc ? addYM(ym, 1) : ym; const [y, m] = t.split('-').map(Number); const dim = new Date(y, m, 0).getDate(); return `${t}-${pad(Math.min(dim, Number(P.giornoPaga) || 10))}`; };
function promemoria() {
  const out = []; const oggi = todayISO(); const [y, mo, dd] = oggi.split('-').map(Number); const P = S.profilo;
  for (const j of S.lavori) {
    if (j.fine && j.fine >= oggi) {
      const gg = daysBetween(oggi, j.fine);
      if (gg <= 60) out.push({ id: 'fine-' + j.id, data: j.fine, s: gg <= 30 ? 'warn' : 'info', t: `Il contratto con ${j.azienda} scade tra ${gg} giorni`, p: 'Guarda cosa ti spetta a fine contratto e la stima della NASpI.', go: '#fine-' + j.id, cta: 'Fine contratto' });
    }
    const altroInCorso = S.lavori.some((x) => x.id !== j.id && x.tipo !== 'chiamata' && corrente(x) && x.inizio && x.inizio <= oggi);
    if (j.fine && j.fine < oggi && daysBetween(j.fine, oggi) <= 68 && j.motivoFine !== 'dimissioni' && !j.naspiFatta && !altroInCorso) {
      out.push({ id: 'naspi-' + j.id, data: addDays(j.fine, 68), s: 'warn', t: `Domanda NASpI entro il ${dateLabel(addDays(j.fine, 68))}`, p: `Il contratto con ${j.azienda} è finito: la domanda va fatta all'INPS entro 68 giorni.`, go: '#fine-' + j.id, cta: 'Vedi stima' });
    }
  }
  const a = attivo();
  if (a && corrente(a) && a.inizio && a.inizio.slice(0, 7) < curYM()) {
    const ym = addYM(curYM(), -1);
    if (!S.buste.some((b) => b.jobId === a.id && b.ym === ym) && dd >= (Number(P.giornoBusta) || 15)) out.push({ id: 'busta-' + ym, data: oggi, s: 'info', t: `Carica la busta di ${meseDi(ym)}`, p: 'Così controllo che i conti tornino e aggiorno ferie e permessi.', act: 'busta-upload', cta: 'Carica' });
    const sd = saldi(a);
    if (sd && mo >= 3 && mo <= 6 && sd.permessi > 4) out.push({ id: 'rol-' + y, data: `${y}-06-30`, s: 'info', t: `Hai circa ${num(sd.permessi, 0)} h di permessi`, p: 'ROL ed ex festività maturati l’anno scorso vanno usati entro il 30 giugno, altrimenti vengono pagati in busta.' });
    if (sd && sd.ferie > 18) out.push({ id: 'ferie-' + y, data: `${y}-12-31`, s: 'info', t: `Hai ${num(sd.ferie, 0)} giorni di ferie`, p: 'Per legge almeno 2 settimane vanno usate nell’anno in cui maturano, il resto entro 18 mesi.' });
  }
  if (mo === 3 || (mo === 4 && dd < 15)) out.push({ id: 'cu-' + y, data: `${y}-03-16`, s: 'info', t: 'È il momento della Certificazione Unica', p: 'Dal 16 marzo i datori di lavoro devono consegnarla: caricala qui per confrontarla con le buste.', go: '#anno-' + (y - 1), cta: 'Anno fiscale' });
  if (mo >= 4 && mo <= 9) out.push({ id: '730-' + y, data: `${y}-09-30`, s: 'info', t: '730 entro il 30 settembre', p: 'Se nel ' + (y - 1) + ' hai avuto più datori di lavoro, controlla la stima del conguaglio.', go: '#anno-' + (y - 1), cta: 'Stima 730' });
  if (S.lavori.length && toNum(P.reddito2025) == null && y === 2026) out.push({ id: 'red25', data: oggi, s: 'info', t: 'Inserisci il reddito 2025', p: 'Serve per sapere se ti spettano le flat tax 2026 (5% e 15%).', go: '#impostazioni', cta: 'Inserisci' });
  (S.promemoria || []).filter((x) => !x.fatto).forEach((x) => out.push({ id: x.id, data: x.data, s: x.data < oggi ? 'warn' : 'info', t: x.titolo, p: x.nota || '', mio: true }));
  return out.sort((a, b) => (a.data || '').localeCompare(b.data || ''));
}

/* ============ glossario e spiegazioni ============ */
const GLOSSARIO = [
  ['Competenze', [
    ['Paga base', /paga\s*base|minimo\s*tab/i, 'La parte principale dello stipendio fissata dal CCNL per il tuo livello. Nel part-time è proporzionata alle ore.'],
    ['Contingenza', /contingenza/i, 'Vecchia indennità legata al costo della vita, oggi un importo fisso che fa parte del minimo contrattuale.'],
    ['Terzo elemento / EDR', /terzo\s*elem|e\.?d\.?r/i, 'Piccoli importi fissi previsti dal contratto, inclusi nella retribuzione minima.'],
    ['Superminimo', /superminimo|super\s*min/i, 'Una parte in più rispetto al minimo del CCNL concordata con l’azienda. Può essere "assorbibile" dagli aumenti futuri.'],
    ['Scatti di anzianità', /scatt/i, 'Aumenti che maturano ogni 3 anni nella stessa azienda (nel Commercio fino a 10 scatti).'],
    ['Lavoro supplementare', /supplement/i, 'Ore in più rispetto all’orario del part-time, fino all’orario pieno. Nel CCNL Commercio sono pagate con il 35% in più.'],
    ['Straordinario', /straordin/i, 'Ore oltre le 40 settimanali. Nel commercio +15% fino alla 48ª ora e +20% oltre (notturno +50%); nel CCNL dei cinema +30%.'],
    ['Lavoro festivo / domenicale', /festiv|domenic/i, 'Ore lavorate nei festivi o di domenica: nel Commercio +30%. Nel 2026 queste maggiorazioni sono tassate al 15% fino a 1.500 € se il reddito 2025 non supera 40.000 €.'],
    ['Festività non goduta', /fest.*(non\s*god|cadent)/i, 'Quando una festività cade di domenica o nel giorno di riposo spetta una giornata di paga in più.'],
    ['Tredicesima / Quattordicesima', /13\s*\^?|14\s*\^?|tredicesima|quattordicesima|mensilit/i, 'Mensilità aggiuntive: la 13ª a dicembre, la 14ª a giugno/luglio. Si maturano 1/12 per ogni mese lavorato.'],
    ['Indennità di disponibilità', /disponibilit/i, 'Nel lavoro a chiamata con obbligo di rispondere spetta un’indennità pari al 20% della retribuzione per i periodi in cui resti a disposizione.'],
  ]],
  ['Trattenute', [
    ['Contributi INPS (IVS)', /i\.?v\.?s|inps|contribut/i, 'Contributi per la pensione a tuo carico: in genere il 9,19% dell’imponibile. Possono esserci piccole quote in più (es. CIGS o FIS): la somma resta intorno al 9,2–9,5%.'],
    ['Contributi FPLS (ex ENPALS)', /f\.?p\.?l\.?s|enpals/i, 'Nel cinema e nello spettacolo i contributi per la pensione vanno al Fondo pensioni lavoratori dello spettacolo dell’INPS (l’ex ENPALS). La quota a tuo carico è la stessa, il 9,19%: il resto lo paga il datore di lavoro.'],
    ['Indennità di cassa', /indennit[aà]\s*(?:di\s*)?cassa|maneggio\s*denaro/i, 'Un piccolo importo fisso per chi lavora alla cassa e maneggia denaro (es. biglietteria del cinema, casse dei negozi).'],
    ['Maggiorazione serale / notturna', /seral|nottur/i, 'Un’aggiunta alla paga oraria per le ore lavorate la sera o di notte, tipica di cinema, ristoranti ed eventi. Nel 2026 le maggiorazioni per lavoro notturno sono tassate al 15% (fino a 1.500 €) se il reddito 2025 non supera 40.000 €.'],
    ['Welfare', /welfare/i, 'Una parte di quanto ti spetta data in beni e servizi (buoni, rimborsi) invece che in denaro: di solito non è tassata.'],
    ['Permessi per riduzione d’orario', /riduz\w*\s*(?:d['’]?\s*)?orario/i, 'Ore di permesso retribuito. Nel CCNL dei cinema sono 44 all’anno (in proporzione se sei part-time).'],
    ['IRPEF lorda e netta', /irpef/i, 'L’imposta sul reddito: 23% fino a 28.000 €, 33% fino a 50.000 €, 43% oltre. Si riduce con le detrazioni: quella trattenuta è l’IRPEF netta.'],
    ['Detrazioni lavoro dipendente', /detraz/i, 'Sconto sull’IRPEF per chi lavora come dipendente; più il reddito è basso, più è alto (fino a 1.955 € l’anno).'],
    ['Addizionale regionale', /add.*reg/i, 'Imposta della regione sul reddito dell’anno prima, trattenuta in 11 rate da gennaio a novembre.'],
    ['Addizionale comunale', /add.*com/i, 'Imposta del comune: saldo dell’anno prima in 11 rate e acconto del 30% dell’anno in corso in 9 rate da marzo.'],
    ['Conguaglio', /conguagl/i, 'A fine anno (o a fine rapporto) l’azienda ricalcola l’IRPEF di tutto l’anno: puoi avere un rimborso o una trattenuta in più.'],
    ['Imposta sostitutiva 5% / 15%', /sostitut|detass/i, 'Nel 2026 gli aumenti da rinnovo del contratto sono tassati al 5% (reddito 2025 fino a 33.000 €) e le maggiorazioni per notturno, festivi e riposo al 15% (fino a 1.500 €, reddito 2025 fino a 40.000 €).'],
    ['Quote sindacali / enti bilaterali', /sindac|ente\s*bil|e\.?bi|fondo\s*est|for\.?te|est\b/i, 'Piccole trattenute per il sindacato (se iscritto), l’ente bilaterale o l’assistenza sanitaria integrativa.'],
  ]],
  ['Bonus fiscali', [
    ['Trattamento integrativo', /integrativ|t\.?i\.?r/i, 'L’ex "bonus Renzi": fino a 1.200 € l’anno (circa 100 € al mese) per redditi fino a 15.000 €, o in parte fino a 28.000 €.'],
    ['Somma esente (taglio cuneo)', /esent|cuneo|207/i, 'Per redditi fino a 20.000 € ricevi una somma non tassata pari al 7,1%, 5,3% o 4,8% del reddito; tra 20.000 e 40.000 € è una detrazione extra fino a 1.000 €.'],
  ]],
  ['Ratei e altro', [
    ['Ferie', /ferie/i, 'Nel Commercio 26 giorni l’anno, cioè 2,17 al mese. In busta trovi maturate, godute e residue (a volte in ore).'],
    ['Permessi ROL ed ex festività', /r\.?o\.?l|permess|ex\s*fest/i, 'Ore di permesso retribuito: 32 h di ex festività più 56 o 72 h di ROL in base alla dimensione dell’azienda; nei primi 2 anni i ROL non maturano. Nel part-time sono proporzionati.'],
    ['TFR', /t\.?f\.?r/i, 'Il trattamento di fine rapporto: ogni anno si accantona circa la retribuzione annua divisa per 13,5, rivalutata ogni anno. Te lo pagano quando il rapporto finisce (o va al fondo pensione).'],
    ['Imponibile previdenziale e fiscale', /imponib/i, 'L’imponibile previdenziale è la base dei contributi; quello fiscale è ciò che resta dopo i contributi, su cui si calcola l’IRPEF.'],
    ['Arrotondamento', /arrotond/i, 'Pochi centesimi aggiunti o tolti per arrivare a una cifra tonda; vengono recuperati il mese dopo.'],
    ['Malattia', /malatt|carenz/i, 'Nel Commercio i primi 3 giorni sono pagati dall’azienda al 100%, dal 4° al 20° al 75%, dal 21° al 100%.'],
  ]],
];
const TERMS = {
  lordo: ['Lordo', 'Quanto guadagni prima delle trattenute: paga base, maggiorazioni, mensilità aggiuntive.'],
  netto: ['Netto', 'Quello che ricevi davvero sul conto: lordo meno contributi, IRPEF e addizionali, più eventuali bonus fiscali.'],
  ferie: ['Ferie residue', 'I giorni di ferie che ti restano. Maturano ogni mese (2,17 giorni nel Commercio) e scendono quando ne usi. Parto dall’ultima busta caricata, poi aggiungo i ratei e tolgo quelle segnate nei turni.'],
  permessi: ['Permessi residui', 'Ore di permesso retribuito (ROL ed ex festività) che ti restano. Quelle non usate entro il 30 giugno dell’anno dopo vengono pagate in busta.'],
  tfr: ['TFR', 'La "liquidazione": ogni mese l’azienda accantona circa 1/13,5 di quello che guadagni. Te la paga quando il rapporto finisce. Il valore qui è una stima con la rivalutazione annuale.'],
  stima: ['Stima della busta', 'Calcolo il lordo dal tuo contratto, aggiungo le ore extra dai turni e applico contributi, IRPEF 2026, detrazioni e bonus fiscali. La busta reale può cambiare per conguagli, arretrati o voci aziendali.'],
  naspi: ['NASpI', 'L’indennità di disoccupazione dell’INPS. Spetta se perdi il lavoro senza dimetterti (scadenza, licenziamento) e hai almeno 13 settimane di contributi negli ultimi 4 anni. Dura metà delle settimane lavorate e dal 6° mese scende del 3% al mese.'],
  conguaglio: ['Conguaglio e 730', 'Ogni datore di lavoro calcola le tasse come se fosse il tuo unico lavoro. Se nello stesso anno ne hai avuti più di uno, col 730 si rifanno i conti su tutto il reddito: a volte arriva un rimborso, a volte c’è da pagare.'],
  cu: ['Certificazione Unica', 'Il documento che il datore di lavoro ti consegna entro il 16 marzo con il reddito e le tasse dell’anno prima. Serve per il 730.'],
  bonus: ['Bonus fiscali', 'Trattamento integrativo (fino a 100 € al mese sotto i 15.000 €) e somma esente del taglio del cuneo (sotto i 20.000 €): soldi in più in busta che non sono tassati.'],
  supplementare: ['Ore supplementari', 'Nel part-time sono le ore oltre il tuo orario e fino a 40 a settimana. Nel Commercio sono pagate il 35% in più.'],
  rmm: ['Retribuzione media', 'La media mensile delle retribuzioni con contributi degli ultimi 4 anni, su cui l’INPS calcola la NASpI.'],
  disponibilita: ['Indennità di disponibilità', 'Nel lavoro a chiamata con obbligo di risposta ti spetta il 20% della retribuzione per i periodi in cui resti a disposizione senza lavorare.'],
};
const info = (k) => `<button class="infobtn" type="button" data-act="info" data-k="${k}" aria-label="Cosa significa ${TERMS[k] ? esc(TERMS[k][0]) : ''}">i</button>`;

/* ============ lettura PDF / foto ============ */
function loadScript(src) { return new Promise((res, rej) => { if ($(`script[src="${src}"]`)) { res(); return; } const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Impossibile caricare ' + src)); document.head.appendChild(s); }); }
function pdfLib() { const l = window.pdfjsLib || window['pdfjs-dist/build/pdf']; if (l && !l.__cfg) { try { l.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; } catch (e) {} l.__cfg = true; } return l; }
async function pdfText(blob) {
  const lib = pdfLib(); if (!lib) throw new Error('Lettore PDF non disponibile');
  const pdf = await lib.getDocument({ data: await blob.arrayBuffer() }).promise; const lines = []; const items = [];
  for (let p = 1; p <= Math.min(pdf.numPages, 6); p++) {
    const page = await pdf.getPage(p); const tc = await page.getTextContent(); const rows = {};
    for (const it of tc.items) {
      if (!it.str || !it.str.trim()) continue; const y = Math.round(it.transform[5] / 3);
      (rows[y] = rows[y] || []).push({ x: it.transform[4], s: it.str });
      // separo i pezzi di testo che contengono più parole/importi distanti (alcuni PDF li uniscono)
      items.push({ p, x: it.transform[4], y: it.transform[5], w: it.width || it.str.length * 4, s: it.str.trim() });
    }
    Object.keys(rows).map(Number).sort((a, b) => b - a).forEach((y) => lines.push(rows[y].sort((a, b) => a.x - b.x).map((r) => r.s).join(' ').replace(/\s+/g, ' ').trim()));
  }
  const text = lines.join('\n'); ultimoLayout = { text, items }; return text;
}
let ultimoLayout = null;
let ocrWorkerP = null; let ocrProg = null;
async function ocrWorker() {
  if (!ocrWorkerP) ocrWorkerP = (async () => {
    if (!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    return window.Tesseract.createWorker('ita', 1, { logger: (m) => { if (m.status === 'recognizing text' && ocrProg) ocrProg(m.progress); } });
  })().catch((e) => { ocrWorkerP = null; throw e; });
  return ocrWorkerP;
}
async function ocrText(img, onProg) { const w = await ocrWorker(); ocrProg = onProg; try { const r = await w.recognize(img); return r.data.text; } finally { ocrProg = null; } }
/** PDF scansionato (solo immagini): disegno le pagine e leggo il testo con l'OCR */
async function pdfOCR(blob, onProg) {
  const pdf = await pdfLib().getDocument({ data: await blob.arrayBuffer() }).promise; const n = Math.min(pdf.numPages, 4); let out = '';
  for (let i = 1; i <= n; i++) {
    const page = await pdf.getPage(i); const vp = page.getViewport({ scale: 2.2 });
    const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
    await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
    out += (await ocrText(cv, (x) => onProg && onProg((i - 1 + x) / n, `Pagina ${i} di ${n}`))) + '\n';
  }
  return out;
}
async function leggiFile(file, onProg) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    const t = await pdfText(file);
    if (t.replace(/\s/g, '').length >= 150) return t;
    try { if (onProg) onProg(0, 'È una scansione: riconosco il testo…'); const o = await pdfOCR(file, onProg); return o.trim() ? o : t; } catch (e) { return t; }
  }
  if (file.type.startsWith('image/')) return ocrText(file, onProg);
  if (file.type.startsWith('text/') || /\.(txt|csv|ics)$/i.test(file.name)) return file.text();
  return '';
}
const NUMRE = /-?\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|-?\d+,\d{1,2}|-?\d+/g;
const pnum = (s) => Number(String(s).replace(/\./g, '').replace(',', '.'));
function importiIn(s) { const out = []; let m; const re = new RegExp(NUMRE.source, 'g'); while ((m = re.exec(s))) { const nx = s.slice(m.index + m[0].length).trimStart(); if (/,\d{2}$/.test(m[0]) && !nx.startsWith('%')) out.push(pnum(m[0])); } return out; }
const chiaveRiga = (line) => line.replace(new RegExp(NUMRE.source, 'g'), ' ').replace(/[^a-zà-ù%/]+/gi, ' ').trim().toLowerCase().slice(0, 48);
function cercaEtichetta(L, found, key, re, opts = {}) {
  if (found[key] != null) return;
  for (let i = 0; i < L.length; i++) {
    const line = L[i]; const m = line.match(re); if (!m) continue;
    if (opts.not && opts.not.test(line)) continue;
    let vals = importiIn(line.slice(m.index + m[0].length));
    if (!vals.length && L[i + 1] && !opts.sameLine) vals = importiIn(L[i + 1]);
    if (vals.length) { found[key] = opts.last ? vals[vals.length - 1] : vals[0]; return; }
  }
}
/* ---- lettura della busta: posizione dei numeri sulla pagina ---- */
const IMPORTO_RE = /^-?\d{1,3}(?:\.\d{3})*,\d{2}-?$|^-?\d+,\d{2}-?$/;
const valImp = (s) => { const neg = /-$/.test(s.trim()); const v = pnum(s.trim().replace(/-$/, '')); return neg ? -v : v; };
function righeLayout(items) {
  const rows = [];
  items.slice().sort((a, b) => a.p - b.p || b.y - a.y || a.x - b.x).forEach((it) => {
    let r = rows.find((q) => q.p === it.p && Math.abs(q.y - it.y) <= 2.5);
    if (!r) { r = { p: it.p, y: it.y, items: [] }; rows.push(r); }
    r.items.push(it);
  });
  rows.forEach((r) => { r.items.sort((a, b) => a.x - b.x); let off = 0; r.str = ''; r.items.forEach((it) => { it.o = off; r.str += it.s + ' '; off = r.str.length; }); });
  return rows;
}
/** Etichette che corrispondono alla regola, con la loro casella sulla pagina */
function trovaEtichette(rows, re, not) {
  const out = [];
  for (const r of rows) {
    const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); let m;
    while ((m = rx.exec(r.str))) {
      if (!m[0]) { rx.lastIndex++; continue; }
      const its = r.items.filter((it) => it.o < m.index + m[0].length && it.o + it.s.length > m.index && !IMPORTO_RE.test(it.s));
      if (!its.length) continue;
      if (not) { const i0 = r.items.indexOf(its[0]); const vicino = [r.items[i0 - 1], ...its].filter(Boolean).map((x) => x.s).join(' '); if (not.test(vicino)) continue; }
      out.push({ r, x0: Math.min(...its.map((i) => i.x)), x1: Math.max(...its.map((i) => i.x + i.w)), its });
    }
  }
  return out;
}
const importiRiga = (r) => r.items.filter((it) => IMPORTO_RE.test(it.s));
/** Possibili valori per un'etichetta: a destra nella stessa riga e in colonna sotto */
function candidati(rows, lab) {
  const destra = importiRiga(lab.r).filter((it) => it.x >= lab.x1 - 2);
  const dopo = lab.r.items.filter((it) => it.x >= lab.x1 - 2 && !lab.its.includes(it));
  const subito = dopo.length && IMPORTO_RE.test(dopo[0].s); // il primo elemento dopo l'etichetta è già un numero
  let sotto = [];
  for (const r of rows) {
    if (r.p !== lab.r.p || r.y >= lab.r.y || lab.r.y - r.y > 48) continue;
    const hit = importiRiga(r).filter((it) => it.x + it.w >= lab.x0 - 18 && it.x <= lab.x1 + 18);
    if (hit.length) { sotto = hit.sort((a, b) => Math.abs((a.x + a.w / 2) - (lab.x0 + lab.x1) / 2) - Math.abs((b.x + b.w / 2) - (lab.x0 + lab.x1) / 2)); break; }
  }
  const ord = subito ? [destra[0], sotto[0], ...destra.slice(1)] : [sotto[0], destra[0], ...destra.slice(1)];
  return { lista: ord.filter(Boolean).map((it) => valImp(it.s)), destra: destra.map((it) => ({ v: valImp(it.s), it })), sotto: sotto.map((it) => valImp(it.s)), subito };
}
/** Colonna di una tabella (es. "Trattenute", "Saldo"): restituisce la sua posizione */
function colonna(rows, re) { const l = trovaEtichette(rows, re)[0]; return l ? { x0: l.x0, x1: l.x1, p: l.r.p, y: l.r.y } : null; }
const nellaColonna = (r, col) => importiRiga(r).filter((it) => it.x + it.w >= col.x0 - 30 && it.x <= col.x1 + 30).sort((a, b) => Math.abs((a.x + a.w) - col.x1) - Math.abs((b.x + b.w) - col.x1))[0];

function parseBusta(text) {
  const L = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const found = {}; const appresi = [];
  for (const r of S.regole || []) {
    if (found[r.campo] != null) continue;
    const line = L.find((l) => chiaveRiga(l) === r.chiave) || L.find((l) => r.chiave.length > 8 && chiaveRiga(l).includes(r.chiave));
    if (line) { const v = importiIn(line); if (v[r.idx] != null) { found[r.campo] = v[r.idx]; appresi.push(r.campo); } }
  }
  const RE = {
    netto: [/netto\s*(?:del\s*mese|in\s*busta|a\s*pagare|busta|da\s*pagare|mese|corrisposto|retribuzione|a\s*liquidare)|\bnetto\b/i, /imponib|lordo|progress/i],
    lordo: [/totale\s*competenze|tot\.?\s*competenze|totale\s*lordo|lordo\s*(?:mensile|del\s*mese)|competenze\s*lorde|retribuzione\s*lorda|totale\s*retribuzione|totale\s*compensi/i, /progress/i],
    trattenute: [/totale\s*trattenute|tot\.?\s*trattenute|totale\s*ritenute|tot\.?\s*ritenute/i, /progress/i],
    imponibilePrev: [/imponibile\s*(?:inps|previd|contrib|i\.?n\.?p\.?s|f\.?p\.?l\.?s|ex[\s-]*enpals|enpals)|imp\.?\s*(?:inps|prev|fpls|enpals)/i, /progress/i],
    imponibileFisc: [/imponibile\s*(?:irpef|fiscale)|imp\.?\s*(?:irpef|fisc)/i, /progress/i],
    contributi: [/(?:contribut[oi]|ritenut[ae])\s*(?:inps|ivs|previd|c\/dip|f\.?p\.?l\.?s|ex[\s-]*enpals|enpals|aggiuntiv|fis\b|f\.i\.s|cigs|pension)|contr\.?\s*(?:ivs|fpls|enpals)|c\.?\s*i\.?v\.?s|\bivs\b|\bf\.?p\.?l\.?s\.?\b|ex[\s-]*enpals|inps\s*c\/dip|ritenute\s*previdenziali|tot\.?\s*contributi|\bcontribut[oi]\b/i, /imponib|progress|sindac|welfare|datore|ditta|azienda|ente\s*bil|fondo\s*(?:est|sanit)/i],
    irpef: [/irpef\s*(?:netta|trattenut|mese|a\s*debito|pagata|dovuta)|ritenut[ae]\s*(?:fiscal[ie]\s*)?irpef|ritenut[ae]\s*fiscal[ie]|\birpef\b(?!\s*(?:lorda|imponib|teorica|progress))/i, /imponib|imp\.\s*$|lorda|progress|detraz/i],
    addReg: [/add(?:izionale|\.|\s)*\s*reg/i, /imponib|progress/i],
    addCom: [/add(?:izionale|\.|\s)*\s*com/i, /imponib|progress/i],
    tfr: [/quota\s*t\.?f\.?r|t\.?f\.?r\.?\s*(?:mese|quota|maturat|del\s*mese|mensile)/i, /fondo|progress|anticip/i],
    oreExtra: [/supplementar|straordinar/i, /magg\.?\s*%?\s*$/i],
  };
  const lay = ultimoLayout && ultimoLayout.text === text ? ultimoLayout.items : null;
  const C = {}; // candidati per campo
  if (lay) {
    const rows = righeLayout(lay);
    const colTratt = colonna(rows, /^trattenute$|\btrattenute\b(?!\s*:)/i);
    const righeContr = new Map();
    const colOre = colonna(rows, /ore\s*\/\s*g+|^ore$|quantit[aà]|\bq\.?t[aà]\b|\bn\.?\s*ore/i);
    for (const [k, [re, not]] of Object.entries(RE)) {
      if (found[k] != null) continue;
      const labs = trovaEtichette(rows, re, not); const vals = [];
      for (const lab of labs) {
        const c = candidati(rows, lab);
        if (['contributi', 'irpef', 'addReg', 'addCom'].includes(k) && c.destra.length) {
          const inCol = colTratt && colTratt.p === lab.r.p && nellaColonna(lab.r, colTratt);
          const scelto = inCol ? valImp(inCol.s) : c.destra[c.destra.length - 1].v;
          if (k === 'contributi' && !/tot/i.test(lab.r.str) && !righeContr.has(lab.r)) { righeContr.set(lab.r, scelto); }
          vals.push(scelto, ...c.lista);
        } else if (k === 'oreExtra') {
          const inCol = colOre && colOre.p === lab.r.p && nellaColonna(lab.r, colOre);
          if (inCol) vals.push(valImp(inCol.s)); else vals.push(...c.lista);
        } else vals.push(...c.lista);
      }
      if (k === 'contributi' && righeContr.size > 1) vals.unshift([...righeContr.values()].reduce((s, v) => s + v, 0));
      if (vals.length) C[k] = [...new Set(vals)];
    }
    // tabella ferie/permessi: riga × colonna "Saldo/Residuo"
    const colSaldo = (() => { const ls = trovaEtichette(rows, /\bsaldo\b|residu[oie](?!\s*a\.?\s*p)(?!\s*anno)(?!\s*prec)|spettant|da\s*godere|disponibil/i).filter((l) => !/prec|a\.\s*p|anno\s*prec/i.test(l.r.str.slice(l.its[0].o, l.its[l.its.length - 1].o + l.its[l.its.length - 1].s.length + 8))); if (!ls.length) return null; const l = ls.sort((a, b) => b.x1 - a.x1)[0]; return { x0: l.x0, x1: l.x1, p: l.r.p, y: l.r.y }; })();
    const tab = (re) => {
      const labs = trovaEtichette(rows, re, /god(?:ute|uto)\s*$|matur|non\s*god|liquid|indennit|\bratei\b|monetizz/i).filter((l) => !/non\s*god|liquid|indennit|\bratei\b|monetizz/i.test(l.r.str)).filter((l, i, arr) => arr.findIndex((q) => q.r === l.r) === i); let tot = null;
      for (const lab of labs) { const its = importiRiga(lab.r).filter((it) => it.x >= lab.x1 - 2); if (!its.length) continue; const it = colSaldo && colSaldo.p === lab.r.p ? nellaColonna(lab.r, colSaldo) || its[its.length - 1] : its[its.length - 1]; tot = (tot || 0) + valImp(it.s); }
      return tot;
    };
    if (found.ferieRes == null) { const v = tab(/^\s*ferie\b|\bferie\b(?!\s*god)/i); if (v != null) found.ferieRes = v; }
    if (found.permessiRes == null) { const v = tab(/permess|\br\.?\s?o\.?\s?l\.?\b|ex[\s.-]*fest/i); if (v != null) found.permessiRes = v; }
  }
  // lettura per righe (foto, PDF senza posizioni): tutti i valori plausibili
  // titoli di colonna tipici delle buste (per associare i valori della riga sotto in ordine)
  const TESTATE = [...Object.values(RE).map(([re]) => re), /irpef\s*lorda/i, /detrazion[ie]/i, /fondo\s*t\.?f\.?r/i, /arrotond\w*/i, /progressiv\w*/i, /conguagli\w*/i, /accont\w*/i, /anticip\w*/i, /tot(?:ale)?\.?\s*ore/i, /giorni\s*(?:lav|retr|inps)\w*/i, /res(?:iduo)?\.?\s*a\.?\s*p\.?/i, /maturat\w*/i, /godut\w*/i, /\bsaldo\b/i, /imponibile\s*t\.?f\.?r/i, /credito|debito/i];
  const testate = (line) => { const sp = []; TESTATE.forEach((re) => { for (const m of line.matchAll(new RegExp(re.source, 'gi'))) if (m[0]) sp.push([m.index, m.index + m[0].length]); });
    sp.sort((a, b) => a[0] - b[0] || b[1] - a[1]); const out = []; let end = -1; sp.forEach((s) => { if (s[0] >= end) { out.push(s[0]); end = s[1]; } }); return out; };
  for (const [k, [re, not]] of Object.entries(RE)) {
    if (found[k] != null) continue;
    const vals = C[k] ? [...C[k]] : []; const somma = [];
    for (let i = 0; i < L.length; i++) {
      const line = L[i]; const m = line.match(re); if (!m || (not && not.test(line.slice(Math.max(0, m.index - 7), m.index + m[0].length)))) continue;
      let after = importiIn(line.slice(m.index + m[0].length));
      if (['contributi', 'irpef', 'addReg', 'addCom'].includes(k) && after.length > 1) after = [after[after.length - 1], ...after];
      if (k === 'contributi' && after.length && !/tot/i.test(line)) somma.push(after[0]);
      vals.push(...after);
      if (!after.length && L[i + 1]) {
        const sotto = importiIn(L[i + 1]); const pos = testate(line);
        if (pos.length > 1 && sotto.length === pos.length) { // intestazioni in fila con i valori sotto: associo per posizione
          const idx = pos.findIndex((x) => x >= m.index - 1 && x <= m.index + 1); if (idx >= 0) vals.unshift(sotto[idx]);
        }
        vals.push(...sotto);
      }
    }
    if (k === 'contributi' && somma.length > 1 && !(C[k] && C[k].length)) vals.unshift(somma.reduce((s, v) => s + v, 0));
    if (vals.length) C[k] = [...new Set(vals)];
  }
  // scelgo i valori che "tornano": netto = lordo − trattenute (± arrotondamento)
  const N = C.netto || [], Lr = C.lordo || [], T = C.trattenute || [];
  let best = null;
  N.forEach((n, a) => Lr.forEach((l, b) => { if (!(n > 0 && l > 0 && n < l * 1.25 && n >= l * 0.25)) return; const ts = T.length ? T : [null]; ts.forEach((t, c) => { if (t != null && !(t >= 0 && t < l * 0.75 && t !== n)) return; const err = t == null ? (n <= l ? 0.5 : 9) : Math.abs(l - t - n); const sc = err * 10 + a + b + c; if (err <= (t == null ? 1 : 1.6) && (!best || sc < best.sc)) best = { n, l, t, sc }; }); }));
  if (best) { found.netto ??= best.n; found.lordo ??= best.l; if (best.t != null) found.trattenute ??= best.t; }
  else { if (N.length && found.netto == null) found.netto = N.find((n) => !Lr.length || n < Math.max(...Lr)) ?? N[0]; if (Lr.length && found.lordo == null) found.lordo = Math.max(...Lr.slice(0, 3)); if (T.length && found.trattenute == null) found.trattenute = T.find((t) => !found.lordo || t < found.lordo) ?? T[0]; }
  const pick = (k, ok) => { if (found[k] != null || !C[k]) return; const v = C[k].find(ok); if (v != null) found[k] = v; };
  pick('imponibilePrev', (v) => !found.lordo || (v <= found.lordo * 1.05 && v >= found.lordo * 0.5));
  const baseC = found.imponibilePrev || found.lordo;
  pick('contributi', (v) => (baseC ? v / baseC > 0.07 && v / baseC < 0.115 : v > 0 && v < 2000));
  if (found.contributi == null && C.contributi) found.contributi = C.contributi.find((v) => !baseC || v < baseC * 0.3);
  pick('imponibileFisc', (v) => !found.lordo || (v <= found.lordo * 1.02 && v >= found.lordo * 0.4));
  pick('irpef', (v) => v >= 0 && (!found.imponibileFisc || v < found.imponibileFisc * 0.45) && (!found.lordo || v < found.lordo * 0.45));
  pick('addReg', (v) => v >= 0 && v < 400); pick('addCom', (v) => v >= 0 && v < 300);
  pick('tfr', (v) => v > 0 && (!found.lordo || v < found.lordo * 0.2));
  pick('oreExtra', (v) => v > 0 && v <= 120);
  // ferie e permessi senza posizioni: ultimo numero della riga
  const nonSaldo = /non\s*god|liquid|indennit|\bratei\b|monetizz|pagat|€/i;
  if (found.ferieRes == null) cercaEtichetta(L, found, 'ferieRes', /\bferie\b(?!\s*\/\s*permess)/i, { last: true, sameLine: true, not: nonSaldo });
  if (found.permessiRes == null) cercaEtichetta(L, found, 'permessiRes', /permess|r\.?o\.?l\.?\b|ex\s*fest/i, { last: true, sameLine: true, not: /ferie\s*\/\s*permess|non\s*god|liquid|indennit|\bratei\b|monetizz|pagat|€/i });
  const mesiRe = new RegExp(`\\b(${MESI.join('|')})\\s*[-/]?\\s*(20\\d{2})`, 'i');
  const pm = text.match(mesiRe);
  if (pm) found.ym = `${pm[2]}-${pad(MESI.indexOf(pm[1].toLowerCase()) + 1)}`;
  else { const n = text.match(/\b(0?[1-9]|1[0-2])\s*[/-]\s*(20\d{2})\b/); if (n) found.ym = `${n[2]}-${pad(n[1])}`; }
  // busta solo di 13ª/14ª (non una busta mensile che contiene anche la 13ª)
  const ordinaria = /paga\s*base|retribuzione\s*(?:ordinaria|mensile)|\bretribuzione\b\s+\d|ore\s*ordinarie|minimo\s*(?:tab|contr)|contingenza|stipendio/i.test(text);
  if (!ordinaria && /tredicesima|13\s*\^?\s*mens|gratifica\s*natalizia/i.test(text)) found.tipo = 'tredicesima';
  else if (!ordinaria && /quattordicesima|14\s*\^?\s*mens|premio\s*annuale/i.test(text)) found.tipo = 'quattordicesima';
  const jl = S.lavori.find((j) => j.azienda && text.toLowerCase().includes(j.azienda.toLowerCase().split(/\s+/)[0]));
  if (jl) found.jobId = jl.id;
  Object.keys(found).forEach((k) => { if (typeof found[k] === 'number') found[k] = Math.round(found[k] * 100) / 100; });
  found._appresi = appresi;
  return found;
}
const MESI_RE = MESI.join('|');
const ORDINALI = { primo: '1', secondo: '2', terzo: '3', quarto: '4', quinto: '5', sesto: '6', settimo: '7' };
/** Tutte le date nel testo (numeriche o "19 maggio 2026") con la loro posizione */
function dateNelTesto(text) {
  const out = []; let m;
  const re1 = /\b(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*(\d{2,4})\b/g;
  while ((m = re1.exec(text))) { const g = +m[1], mo = +m[2]; let y = +m[3]; if (y < 100) y += 2000; if (g >= 1 && g <= 31 && mo >= 1 && mo <= 12 && y >= 1950 && y <= 2100) out.push({ iso: `${y}-${pad(mo)}-${pad(g)}`, i: m.index }); }
  const re2 = new RegExp(`\\b(\\d{1,2})\\s*[°ºo]?\\s*(?:di\\s+)?(${MESI_RE})\\s+(\\d{4})\\b`, 'gi');
  while ((m = re2.exec(text))) out.push({ iso: `${m[3]}-${pad(MESI.indexOf(m[2].toLowerCase()) + 1)}-${pad(m[1])}`, i: m.index });
  return out.sort((a, b) => a.i - b.i);
}
function parseContratto(raw) {
  const f = {}; const text = String(raw || '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ');
  const flat = text.replace(/\s*\n\s*/g, ' ');
  const romani = { I: '1', II: '2', III: '3', IV: '4', V: '5', VI: '6', VII: '7' };
  // contratto collettivo
  if (/pubblici\s*esercizi|fipe\b|ristorazione/i.test(flat)) f.ccnl = 'pubblici';
  else if (/turismo|alberghi|federalberghi/i.test(flat)) f.ccnl = 'turismo';
  else if (/multiservizi|imprese\s*di\s*pulizia|servizi\s*di\s*pulizia/i.test(flat)) f.ccnl = 'multiservizi';
  else if (/terziario|distribuzione\s*e\s*(?:dei\s*)?servizi|commercio|confcommercio|confesercenti/i.test(flat)) f.ccnl = 'commercio';
  else if (/cinematograf|cinema|multisala|anec\b/i.test(flat)) f.ccnl = 'cinema';
  // tipo di contratto
  if (/intermittente|a\s*chiamata|job\s*on\s*call/i.test(flat)) f.tipo = 'chiamata';
  else if (/apprendistato/i.test(flat)) f.tipo = 'apprendistato';
  else if (/somministrazione/i.test(flat)) f.tipo = 'somministrazione';
  else if (/stagional/i.test(flat)) f.tipo = 'stagionale';
  else if (/trasformazione[^.]{0,80}tempo\s*indeterminato/i.test(flat)) f.tipo = 'indeterminato';
  else if (/tempo\s*determinato|a\s*termine/i.test(flat)) f.tipo = 'determinato';
  else if (/tempo\s*indeterminato/i.test(flat)) f.tipo = 'indeterminato';
  if (/proroga|prorogat/i.test(flat)) f._proroga = true;
  // livello
  let m = flat.match(/\b(I{1,3}|IV|VI{0,2}|V|[1-7])\s*(?:°|º|\^)?\s*(super\s*)?livell/i)
    || flat.match(/livell[oi]\s*(?:di\s*inquadramento)?\s*:?\s*(I{1,3}|IV|VI{0,2}|V|[1-7])\s*(?:°|º)?\s*(super)?\b/i)
    || flat.match(/\b(primo|secondo|terzo|quarto|quinto|sesto|settimo)\s*(super\s*)?livell/i)
    || flat.match(/livello\s*(quadro)/i);
  if (m) { const k = m[1]; let lv = ORDINALI[k.toLowerCase()] || romani[k.toUpperCase()] || (/quadro/i.test(k) ? 'Q' : k); if (m[2] && f.ccnl && f.ccnl !== 'commercio') lv += 'S'; f.livello = lv; }
  // orario
  m = flat.match(/(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:ore|h)\s*(?:settimanali|a\s*settimana|alla\s*settimana|per\s*settimana|sett\.)/i)
    || flat.match(/orario[^.;]{0,90}?\b(\d{1,2}(?:[.,]\d{1,2})?)\s*ore\b/i);
  if (m) f.oreSett = toNum(m[1]);
  else if ((m = flat.match(/(?:part[\s-]?time|tempo\s*parziale)[^.;]{0,80}?(\d{2,3})\s*%/i) || flat.match(/(\d{2,3})\s*%\s*(?:dell['’]?\s*orario|del\s*tempo\s*pieno|dell['’]?\s*orario\s*(?:normale|contrattuale|a\s*tempo\s*pieno))/i))) f.oreSett = Math.round(40 * Number(m[1]) / 100 * 10) / 10;
  else if (/tempo\s*pieno|full[\s-]?time/i.test(flat) && !/part[\s-]?time|tempo\s*parziale/i.test(flat)) f.oreSett = 40;
  // date: guardo le parole che le precedono
  const ctx = (d) => flat.slice(Math.max(0, d.i - 70), d.i).toLowerCase();
  const date = dateNelTesto(flat).filter((d) => !/\bnat[oa]\b|nascita|rilasciat|emess|scadenza\s*(?:del\s*)?documento|(?:^|[\s,])l[iì]\s*,?\s*$|protocollo/.test(ctx(d).slice(-40)));
  const kIni = /(?:\bdal|decorrenza(?:\s*dal)?|a\s*decorrere\s*dal|a\s*partire\s*dal|data\s*(?:di\s*)?(?:assunzione|inizio)[^0-9]{0,20}|assunt[oa][^.]{0,30}?\bil|inizio\s*(?:del\s*)?rapporto[^0-9]{0,20})\s*:?\s*$/;
  const kFin = /(?:\bal|fino\s*al|sino\s*al|scadenza(?:\s*(?:il|al))?|termine(?:\s*(?:il|al))?|cessazione[^0-9]{0,20}|data\s*(?:di\s*)?(?:fine|termine|scadenza)[^0-9]{0,20}|prorogat[oa][^0-9]{0,30})\s*:?\s*$/;
  for (const d of date) { const c = ctx(d); if (!f.inizio && kIni.test(c)) f.inizio = d.iso; else if (kFin.test(c) && (!f.inizio || d.iso > f.inizio) && (!f.fine || d.iso > f.fine)) f.fine = d.iso; }
  if (!f.inizio && date.length) { const s = date.map((d) => d.iso).sort(); f.inizio = s[0]; if (!f.fine && f.tipo && f.tipo !== 'indeterminato' && s.length > 1 && s[s.length - 1] > s[0]) f.fine = s[s.length - 1]; }
  if (f._proroga && f.inizio && !f.fine) { f.fine = f.inizio; delete f.inizio; }
  if (f.tipo === 'indeterminato' && !f._proroga) delete f.fine;
  // azienda (ragione sociale con forma giuridica)
  const formaG = String.raw`(?:S\.?\s?p\.?\s?A\.?|S\.?\s?r\.?\s?l\.?(?:\s?s\.?)?|S\.?\s?n\.?\s?c\.?|S\.?\s?a\.?\s?s\.?|Soc(?:ietà)?\.?\s*Coop(?:erativa)?\.?(?:\s*a\s*r\.?\s*l\.?)?|Coop\.?|S\.?\s?c\.?\s?a\.?\s?r\.?\s?l\.?|Spa|Srl|SPA|SRL|SNC|SAS)`;
  m = flat.match(new RegExp(String.raw`(?:societ[àa]|ditta|azienda|datore\s*di\s*lavoro|denominazione|ragione\s*sociale)\s*:?\s*["“]?([A-Z0-9][\w&'’.\- ]{1,50}?\s${formaG})(?=[\s,.;)"”]|$)`, 'i'))
    || text.match(new RegExp(String.raw`(?:^|\n)\s*([A-Z0-9][\w&'’.\- ]{1,50}?\s${formaG})(?=[\s,.;)]|$)`, 'm'))
    || flat.match(new RegExp(String.raw`\b([A-Z][A-Z0-9&'’.\- ]{1,40}?\s${formaG})(?=[\s,.;)]|$)`));
  if (m) f.azienda = m[1].replace(/^(?:la|tra|fra)\s+/i, '').replace(/\s+/g, ' ').trim();
  else if ((m = flat.match(/(?:datore\s*di\s*lavoro|società|azienda)\s*:\s*([A-Z][^,;\n(]{2,50})/))) f.azienda = m[1].trim();
  // mansione / qualifica
  m = flat.match(/(?:con\s*(?:la\s*)?qualifica\s*(?:professionale\s*)?(?:di|:)|con\s*(?:le\s*)?mansioni\s*(?:di|:)|in\s*qualit[àa]\s*di|mansione\s*:|qualifica\s*:|profilo\s*(?:professionale)?\s*(?:di|:))\s*["“]?([A-Za-zÀ-ù'’ \/-]{3,45}?)["”]?(?=[,.;:(\n]|\s+(?:e|ed|con|presso|livello|inquadrat|che|per|a\s*tempo|part)\b|$)/i);
  if (m && !/seguent|indicat|previst|descritt/i.test(m[1])) f.ruolo = cap(m[1].trim().replace(/^(?:di|un|una|addett[oa] a)\s+(?=\S)/i, (x) => (/addett/i.test(x) ? x : '')).trim());
  // sede di lavoro
  m = flat.match(/(?:sede\s*di\s*lavoro|luogo\s*di\s*lavoro|luogo\s*della\s*prestazione)\s*:?\s*(?:presso\s*)?(?:il\s*|la\s*|l['’])?([A-Z][A-Za-zÀ-ù'’ ]{2,40}?)(?=[,.;(\n]|\s+(?:via|piazza|viale|corso|presso|centro|c\/o)\b|$)/i)
    || flat.match(/presso\s*(?:il\s*punto\s*vendita|la\s*(?:nostra\s*)?(?:sede|filiale)|l['’]\s*unit[àa]\s*(?:produttiva|locale)|il\s*negozio|lo\s*stabilimento)\s*(?:di|sit[oa]\s*(?:in|a))\s*([A-Z][A-Za-zÀ-ù'’ ]{2,40}?)(?=[,.;(\n]|\s+(?:via|piazza|viale|corso|presso|centro|c\/o)\b|$)/i);
  if (m) f.sede = m[1].trim();
  // altro
  m = flat.match(/superminimo[^\d\n]{0,40}(\d{1,3}(?:\.\d{3})*,\d{2})/i); if (m) f.superminimo = pnum(m[1]);
  if (/obbligo\s*di\s*(?:risposta|disponibilit)|indennit[aà]\s*di\s*disponibilit/i.test(flat)) f.disponibilita = true;
  if (f.ccnl === 'altro' && (m = flat.match(/retribuzione[^.]{0,80}?(?:€|euro)\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i))) f.minimoManuale = pnum(m[1]);
  delete f._proroga;
  return f;
}
function parseCU(text) {
  const L = text.split(/\n/).map((l) => l.trim()).filter(Boolean); const f = {};
  const g = (k, re, o) => cercaEtichetta(L, f, k, re, o);
  g('reddito', /redditi\s*di\s*lavoro\s*dipendente|reddito\s*di\s*lavoro\s*dipendente/i);
  g('irpef', /ritenute\s*irpef|ritenute\s*a\s*titolo\s*di\s*acconto/i);
  g('addReg', /addizionale\s*regionale/i);
  g('addCom', /addizionale\s*comunale/i);
  g('ti', /trattamento\s*integrativo\s*(erogato)?/i);
  g('esente', /somma\s*(che\s*)?non\s*concorre|somma\s*esente/i);
  const gm = text.match(/(?:numero\s*di\s*)?giorni[^\n\d]{0,60}(\d{1,3})\b/i); if (gm && Number(gm[1]) <= 366) f.giorni = Number(gm[1]);
  const am = text.match(/(?:anno|periodo)\s*d['’]?\s*imposta\s*:?\s*(20\d{2})/i) || text.match(/certificazione\s*unica\s*(20\d{2})/i);
  if (am) f.anno = /certificazione/i.test(am[0]) ? Number(am[1]) - 1 : Number(am[1]);
  const jl = S.lavori.find((j) => j.azienda && text.toLowerCase().includes(j.azienda.toLowerCase().split(/\s+/)[0])); if (jl) f.jobId = jl.id;
  return f;
}
/** Planning: righe con data e orario, oppure calendario .ics */
function parsePlanning(text, ym) {
  const out = [];
  if (/BEGIN:VEVENT/.test(text)) {
    const evs = text.split('BEGIN:VEVENT').slice(1);
    const pd = (v) => { const m = v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?(Z?)/); if (!m) return null; let d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0)); if (m[6]) d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0))); return { d, timed: !!m[4] }; };
    for (const ev of evs) {
      const s = (ev.match(/DTSTART[^:]*:(\S+)/) || [])[1], e = (ev.match(/DTEND[^:]*:(\S+)/) || [])[1]; const sum = ((ev.match(/SUMMARY[^:]*:(.*)/) || [])[1] || '').trim();
      const A = s && pd(s), B = e && pd(e); if (!A || !A.timed || !B) continue;
      out.push({ data: E.iso(A.d), inizio: `${pad(A.d.getHours())}:${pad(A.d.getMinutes())}`, fine: `${pad(B.d.getHours())}:${pad(B.d.getMinutes())}`, nota: sum });
    }
    return out;
  }
  const [Y, M] = ym.split('-').map(Number);
  const giorniRe = /\b(lun|mar|mer|gio|ven|sab|dom)[a-zì]*\.?\s*(\d{1,2})\b/i;
  const dataRe = /\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/;
  const meseRe = new RegExp(`\\b(\\d{1,2})\\s*(${MESI.map((m) => m.slice(0, 3)).join('|')})[a-z]*`, 'i');
  const oraRe = /(\d{1,2})(?:[:.,](\d{2}))?\s*(?:-|–|—|alle|a)\s*(\d{1,2})(?:[:.,](\d{2}))?/;
  for (const raw of text.split(/\n/)) {
    const line = raw.trim(); if (!line) continue;
    const tutte = [...line.matchAll(new RegExp(oraRe.source, 'g'))]; if (!tutte.length) continue;
    const o = tutte[tutte.length - 1];
    const h1 = Number(o[1]), h2 = Number(o[3]); if (h1 > 24 || h2 > 24) continue;
    const resto = line.slice(0, o.index) + ' ' + line.slice(o.index + o[0].length);
    let d = null; let m;
    if ((m = resto.match(dataRe)) && Number(m[2]) >= 1 && Number(m[2]) <= 12) { const yy = m[3] ? (Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3])) : Y; d = `${yy}-${pad(m[2])}-${pad(m[1])}`; }
    else if ((m = resto.match(meseRe))) { const mi = MESI.findIndex((x) => x.startsWith(m[2].toLowerCase().slice(0, 3))); d = `${Y}-${pad(mi + 1)}-${pad(m[1])}`; }
    else if ((m = resto.match(giorniRe))) d = `${Y}-${pad(M)}-${pad(m[2])}`;
    else if ((m = resto.match(/^\s*(\d{1,2})\b/)) && o.index > 0) d = `${Y}-${pad(M)}-${pad(m[1])}`;
    if (!d || Number(d.slice(8)) > 31) continue;
    out.push({ data: d, inizio: `${pad(h1)}:${o[2] || '00'}`, fine: `${pad(h2)}:${o[4] || '00'}`, nota: '' });
  }
  return out;
}

/* ============ UI di base ============ */
let toastT;
function toast(msg) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2800);
}
let sheetStack = [];
function openSheet(html, onMount) {
  const s = document.createElement('div'); s.className = 'scrim';
  s.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  s.addEventListener('click', (e) => { if (e.target === s) closeSheet(); });
  document.body.appendChild(s); sheetStack.push(s);
  requestAnimationFrame(() => s.classList.add('show'));
  if (onMount) onMount(s.querySelector('.sheet'));
  return s.querySelector('.sheet');
}
function closeSheet() { const s = sheetStack.pop(); if (!s) return; s.classList.remove('show'); setTimeout(() => s.remove(), 220); }
function closeAllSheets() { while (sheetStack.length) sheetStack.pop().remove(); }
function ask(title, text, okLabel = 'Conferma', danger = true) {
  return new Promise((res) => {
    const sh = openSheet(`<h3>${esc(title)}</h3><p class="lead">${esc(text)}</p><div class="btns"><button class="btn ghost" data-x="no">Annulla</button><button class="btn ${danger ? 'danger' : ''}" data-x="ok">${esc(okLabel)}</button></div>`);
    sh.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (!b) return; closeSheet(); res(b.dataset.x === 'ok'); });
  });
}
function pickFile(accept, multiple = false) { return new Promise((res) => { filePick.value = ''; filePick.accept = accept; filePick.multiple = multiple; filePick.onchange = () => res(Array.from(filePick.files || [])); filePick.click(); }); }
function scarica(blob, name) {
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast(`Scaricato: ${name}`); }
  catch (e) { toast('Il download non è disponibile qui: usa l’app installata'); }
}
async function copia(text) { try { await navigator.clipboard.writeText(text); toast('Copiato'); return true; } catch (e) { toast('Seleziona il testo e copialo'); return false; } }
async function viewFile(id, title) {
  const rec = await fileGet(id);
  if (!rec) { toast('Il file non è su questo dispositivo'); return; }
  const v = document.createElement('div'); v.className = 'viewer';
  v.innerHTML = `<header><b>${esc(title || rec.name)}</b><button class="iconbtn" style="color:#fff" data-close aria-label="Chiudi">${ic.x}</button></header><div class="pages"><div class="spin"></div></div>`;
  document.body.appendChild(v); v.querySelector('[data-close]').onclick = () => v.remove();
  const pages = v.querySelector('.pages');
  try {
    if (rec.type === 'application/pdf' || /\.pdf$/i.test(rec.name)) {
      const pdf = await pdfLib().getDocument({ data: await rec.blob.arrayBuffer() }).promise; pages.innerHTML = '';
      for (let p = 1; p <= pdf.numPages; p++) { const page = await pdf.getPage(p); const vp = page.getViewport({ scale: 2 }); const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height; pages.appendChild(cv); await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; }
    } else if (rec.type.startsWith('image/')) { pages.innerHTML = ''; const img = new Image(); img.src = URL.createObjectURL(rec.blob); img.alt = rec.name; pages.appendChild(img); }
    else pages.innerHTML = '<p style="color:#fff">Anteprima non disponibile per questo tipo di file.</p>';
  } catch (e) { pages.innerHTML = `<p style="color:#fff">Non riesco ad aprire il file (${esc(e.message)}).</p>`; }
}
async function jsPDFlib() {
  if (!window.jspdf) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  if (!window.jspdf.jsPDF.API.autoTable) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
  return window.jspdf.jsPDF;
}

/* ============ grafici ============ */
function barChart(items, h = 150, fmt = (v) => Math.round(v)) {
  if (!items.length) return '';
  const W = 520, pl = 6, pb = 22, max = Math.max(...items.map((i) => i.v), 1); const bw = (W - pl * 2) / items.length;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img">`;
  items.forEach((it, i) => {
    const bh = Math.max(3, (it.v / max) * (h - pb - 18)); const x = pl + i * bw + bw * 0.18; const w = bw * 0.64; const y = h - pb - bh;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${bh}" rx="${Math.min(7, w / 3)}" fill="${it.c || 'var(--blue)'}" opacity="${it.dim ? 0.45 : 1}"><title>${esc(it.t)}: ${esc(fmt(it.v))}</title></rect>`;
    s += `<text x="${x + w / 2}" y="${h - 6}" text-anchor="middle">${esc(it.l)}</text>`;
    if (items.length <= 8 || i === items.length - 1) s += `<text x="${x + w / 2}" y="${y - 5}" text-anchor="middle" style="font-weight:600;fill:var(--text)">${esc(fmt(it.v))}</text>`;
  });
  return s + '</svg>';
}
function lineChart(series, labels, h = 160) {
  const W = 520, pl = 8, pr = 8, pt = 14, pb = 22; const all = series.flatMap((s) => s.v.filter((x) => x != null));
  if (!all.length) return ''; const max = Math.max(...all) * 1.08, min = Math.min(0, ...all);
  const X = (i) => pl + (labels.length === 1 ? (W - pl - pr) / 2 : i * (W - pl - pr) / (labels.length - 1)); const Y = (v) => pt + (1 - (v - min) / (max - min || 1)) * (h - pt - pb);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img">`;
  [0.25, 0.5, 0.75].forEach((f) => { const y = pt + f * (h - pt - pb); s += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--line)"/>`; });
  series.forEach((se) => {
    const pts = se.v.map((v, i) => (v == null ? null : `${X(i)},${Y(v)}`)).filter(Boolean);
    if (pts.length > 1) s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${se.c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    se.v.forEach((v, i) => { if (v != null) s += `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="${se.c}"><title>${esc(se.n)} ${esc(labels[i])}: ${num(v, 2)}</title></circle>`; });
  });
  labels.forEach((l, i) => { if (labels.length <= 12 || i % 2 === 0) s += `<text x="${X(i)}" y="${h - 6}" text-anchor="middle">${esc(l)}</text>`; });
  return s + '</svg>';
}

/* ============ viste: elementi comuni ============ */
const topbar = (title, sub, right = '', back = '') => `<div class="top">${back ? `<a class="iconbtn back" href="${back}" aria-label="Indietro">${ic.back}</a>` : ''}<h1>${title}${sub ? `<span class="sub">${sub}</span>` : ''}</h1>${right}</div>`;
const gearBtn = `<a class="iconbtn" href="#impostazioni" aria-label="Impostazioni">${ic.gear}</a>`;
const jobAvatar = (j, size = 42) => `<div class="avatar" style="background:${j.colore || COLORI[0]};width:${size}px;height:${size}px">${esc(iniziali(j.azienda))}</div>`;
const tool = (href, icon, cls, t, s) => `<a class="tool" href="${href}"><span class="ic ${cls}">${icon}</span><b>${t}</b><small>${s}</small></a>`;
const vuoto = (icon, t, p, btn = '') => `<div class="card"><div class="empty"><div class="em">${icon}</div><b>${t}</b><p class="small">${p}</p>${btn}</div></div>`;

function cardTimbro() {
  const a = attivo(); if (!a || !corrente(a)) return '';
  if (S.timbro) {
    const j = job(S.timbro.jobId) || a; const [h, m] = S.timbro.inizio.split(':').map(Number);
    const start = new Date(S.timbro.data + 'T00:00:00'); start.setHours(h, m); const min = Math.max(0, Math.round((Date.now() - start) / 60000));
    return `<div class="card timbro on"><div class="row"><span class="pulse"></span><div class="grow"><b>In turno da ${S.timbro.inizio}</b><div class="small muted">${esc(j.azienda)} · ${Math.floor(min / 60)} h ${min % 60} min</div></div><button class="btn sm" data-act="timbra-fine">${ic.stop} Fine turno</button></div></div>`;
  }
  return `<div class="card timbro"><div class="row"><div class="ic b" style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center">${ic.clock}</div><div class="grow"><b>Stai iniziando il turno?</b><div class="small muted">Un tocco ora e uno alla fine: le ore si segnano da sole.</div></div><button class="btn sm" data-act="timbra-inizio">${ic.play} Inizio</button></div></div>`;
}

function viewHome() {
  const P = S.profilo; const j = attivo(); const ym = curYM();
  const ora = new Date().getHours(); const saluto = ora < 13 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';
  let h = topbar(`${saluto}${P.nome ? `, ${esc(P.nome)}` : ''}`, cap(new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })), gearBtn);
  if (!storageOK) h += `<div class="banner">Questo browser non salva i dati: installa l'app o esporta un backup.</div>`;
  h += cardInstalla();
  if (!S.lavori.length) {
    h += `<div class="card hero fade"><div class="empty" style="padding:10px 4px"><div class="em">${ic.bag}</div><b>Iniziamo dal tuo lavoro</b><p class="small">Aggiungi il datore di lavoro attuale con il contratto: da lì calcolo busta, turni, ferie e TFR.</p><button class="btn block" data-act="job-new">${ic.plus} Aggiungi un lavoro</button><button class="link" style="margin-top:8px" data-go="#benvenuto">Fai la configurazione guidata</button></div></div>`;
    return h + strumenti();
  }
  const recenti = S.lavori.filter((x) => !x.fine || x.fine >= addYM(ym, -2) + '-01');
  if (recenti.length > 1) h += `<div class="chips">${recenti.map((x) => `<button class="chip ${x.id === j.id ? 'on' : ''}" data-act="set-attivo" data-id="${x.id}">${esc(x.azienda)}</button>`).join('')}</div>`;
  h += cardTimbro();
  let target = ym; let st = stima(j, target);
  if (!st && j.fine && j.fine < todayISO()) { target = j.fine.slice(0, 7); st = stima(j, target); }
  if (st) {
    const r = st.res; const tot = r.lordo || 1;
    const segs = [[r.netto - r.trattamentoIntegrativo - r.sommaEsente, 'var(--ok)', 'Resta a te'], [r.contributi, 'var(--blue)', 'INPS'], [r.irpefNetta + r.sostitutive, 'var(--accent)', 'Imposte'], [r.addRegionale + r.addComunale, 'var(--bad)', 'Addizionali']].filter((s) => s[0] > 0.5);
    const extra = st.voci.filter((v) => /tredicesima|quattordicesima/i.test(v[0])).map((v) => (/tredi/i.test(v[0]) ? '13ª' : '14ª'));
    h += `<div class="card hero fade"><div class="row between"><span class="kicker">Busta di ${meseDi(target)} · stima ${info('stima')}</span><span class="badge n">${esc(j.azienda)}</span></div>
      <div class="big">${eur(r.netto)}</div>
      <div class="muted small">Lordo ${eur(r.lordo)}${extra.length ? ` · con ${extra.join(' e ')}` : ''}${r.trattamentoIntegrativo + r.sommaEsente > 1 ? ` · bonus fiscali ${eur(r.trattamentoIntegrativo + r.sommaEsente)} ${info('bonus')}` : ''}</div>
      <div class="stack">${segs.map((s) => `<span style="flex:${s[0] / tot};background:${s[1]}"></span>`).join('')}</div>
      <div class="leg2">${segs.map((s) => `<span><i style="background:${s[1]}"></i>${s[2]} ${eur0(s[0])}</span>`).join('')}</div>
      <div class="row" style="margin-top:14px;flex-wrap:wrap"><button class="btn sm ghost" data-act="dettaglio-stima" data-ym="${target}" data-job="${j.id}">Come ci arrivo</button><a class="btn sm ghost" href="#turni">Turni del mese</a></div></div>`;
  }
  const todo = promemoria().slice(0, 3);
  if (todo.length) h += `<div class="card"><h2><span class="grow">Cosa fare ora</span><a class="link" href="#promemoria">Tutti</a></h2>${todo.map(todoRow).join('')}</div>`;
  const sd = saldi(j); const tfr = tfrStimato(j);
  const ultima = S.buste.filter((b) => b.jobId === j.id).sort((a, b) => (a.ym < b.ym ? 1 : -1))[0];
  h += `<div class="grid2">
    <div class="tile" data-go="#turni"><div class="row between"><div class="ic g">${ic.sun}</div>${info('ferie')}</div><div><div class="v">${sd ? num(sd.ferie, 1) : '—'} <small class="muted" style="font-size:14px">giorni</small></div><div class="l">Ferie residue</div></div></div>
    <div class="tile" data-go="#turni"><div class="row between"><div class="ic a">${ic.clock}</div>${info('permessi')}</div><div><div class="v">${sd ? num(sd.permessi, 0) : '—'} <small class="muted" style="font-size:14px">ore</small></div><div class="l">Permessi residui</div></div></div>
    <div class="tile" data-go="#fine-${j.id}"><div class="row between"><div class="ic b">${ic.piggy}</div>${info('tfr')}</div><div><div class="v">${eur0(tfr)}</div><div class="l">TFR maturato (stima)</div></div></div>
    <div class="tile" data-go="${ultima ? '#busta-' + ultima.id : '#buste'}"><div class="ic r">${ic.doc}</div><div><div class="v">${ultima ? eur0(ultima.netto) : '—'}</div><div class="l">${ultima ? 'Ultima busta · ' + ymShort(ultima.ym) : 'Nessuna busta ancora'}</div></div></div>
  </div>`;
  const bs = S.buste.filter((b) => b.netto).sort((a, b) => (a.ym > b.ym ? 1 : -1));
  if (bs.length) {
    const byYm = {}; bs.forEach((b) => { byYm[b.ym] = byYm[b.ym] || { v: 0, c: (job(b.jobId) || {}).colore }; byYm[b.ym].v += b.netto; });
    const items = Object.keys(byYm).sort().slice(-12).map((k) => ({ l: MESI_B[Number(k.slice(5)) - 1], t: ymLabel(k), v: byYm[k].v, c: byYm[k].c }));
    const anno = String(new Date().getFullYear()); const totA = bs.filter((b) => b.ym.startsWith(anno)).reduce((a, b) => a + b.netto, 0);
    h += `<div class="card"><h2><span class="grow">Netto ricevuto</span><span class="badge a">${anno}: ${eur0(totA)}</span></h2>${barChart(items)}<a class="link" href="#statistiche">Altri grafici</a></div>`;
  }
  h += strumenti();
  h += `<p class="note">Stime con CCNL, regole fiscali 2026 e turni inseriti: la busta reale può differire per conguagli, arretrati e voci aziendali.</p>`;
  return h;
}
function strumenti() {
  return `<div class="sec-title">Strumenti</div><div class="tools">
    ${tool('#calcola', ic.calc, 'a', 'Calcola netto', 'Simula uno stipendio')}
    ${tool('#anno', ic.euro, 'g', 'Anno e 730', 'Più datori, conguaglio')}
    ${tool('#fine', ic.flag, 'r', 'Fine contratto', 'Liquidazione e NASpI')}
    ${tool('#statistiche', ic.chart, 'b', 'Statistiche', 'Ore, paga oraria')}
    ${tool('#promemoria', ic.bell, 'a', 'Promemoria', 'Scadenze e avvisi')}
    ${tool('#cv', ic.user, 'g', 'Per il CV', 'Le tue esperienze')}
  </div><a class="tool wide" href="#guida"><span class="ic b">${ic.book}</span><b>Come leggere la busta paga</b><small>Tutte le voci spiegate semplici</small></a>`;
}
function todoRow(t) {
  const btn = t.go ? `<a class="btn sm ghost" href="${t.go}">${esc(t.cta || 'Apri')}</a>` : t.act ? `<button class="btn sm ghost" data-act="${t.act}">${esc(t.cta || 'Vai')}</button>` : t.mio ? `<button class="btn sm ghost" data-act="prom-fatto" data-id="${t.id}">Fatto</button>` : '';
  return `<div class="chk ${t.s}"><div class="dot">${t.s === 'warn' ? ic.alert : ic.bell}</div><div class="grow"><b>${esc(t.t)}</b><p>${esc(t.p)}</p></div>${btn ? `<div style="align-self:center">${btn}</div>` : ''}</div>`;
}

function dettaglioStima(ym, jobId) {
  const j = job(jobId) || attivo(); const st = stima(j, ym); if (!st) return;
  const r = st.res;
  let h = `<h3>Busta di ${meseDi(ym)} (stima)</h3><p class="lead">${esc(j.azienda)} · ${st.chiamata ? 'a chiamata' : `${num(st.c.oreSett)} h/sett. (${Math.round(st.c.p * 100)}%)`} · paga oraria ${eur(st.c.pagaOraria)}</p>`;
  h += `<div class="sec-title" style="margin-top:0">1 · Quanto guadagni (lordo)</div>`;
  h += st.voci.map(([k, v]) => `<div class="kv"><span class="k">${esc(k)}</span><span class="v ${v < 0 ? 'neg' : ''}">${eur(v)}</span></div>`).join('');
  h += `<div class="kv tot"><span class="k">Totale lordo</span><span class="v">${eur(r.lordo)}</span></div>`;
  h += `<div class="sec-title">2 · Cosa viene trattenuto</div>`;
  h += [['Contributi INPS (pensione)', -r.contributi], ['IRPEF lorda', -r.irpefLorda], ['Detrazioni (sconto sull’IRPEF)', r.detrazioni], ['Imposte sostitutive 5% / 15%', -r.sostitutive], ['Addizionale regionale (rata)', -r.addRegionale], ['Addizionale comunale (rata)', -r.addComunale]].filter((x) => Math.abs(x[1]) > 0.004).map(([k, v]) => `<div class="kv"><span class="k">${k}</span><span class="v ${v < 0 ? 'neg' : 'pos'}">${eur(v)}</span></div>`).join('');
  if (r.trattamentoIntegrativo + r.sommaEsente > 0.01) {
    h += `<div class="sec-title">3 · Bonus fiscali in più</div>`;
    if (r.trattamentoIntegrativo) h += `<div class="kv"><span class="k">Trattamento integrativo</span><span class="v pos">+${eur(r.trattamentoIntegrativo)}</span></div>`;
    if (r.sommaEsente) h += `<div class="kv"><span class="k">Somma esente (taglio cuneo)</span><span class="v pos">+${eur(r.sommaEsente)}</span></div>`;
  }
  h += `<div class="kv tot"><span class="k">Netto stimato</span><span class="v">${eur(r.netto)}</span></div>`;
  h += st.cl ? `<p class="note">Ore variabili prese dai turni di ${meseDi(st.vym)}${S.profilo.variabiliMeseSucc ? ' (pagate il mese dopo)' : ''}.</p>` : `<p class="note">Nessun turno segnato per ${meseDi(st.vym)}: conto solo la retribuzione fissa.</p>`;
  if (st.c.stima) h += `<p class="note">Il minimo contrattuale di questo mese è ricostruito: è una stima.</p>`;
  h += `<button class="btn block ghost" style="margin-top:14px" data-x="close">Chiudi</button>`;
  const sh = openSheet(h); sh.addEventListener('click', (e) => { if (e.target.closest('[data-x="close"]')) closeSheet(); });
}

/* ---- Buste ---- */
let filtroBuste = 'tutti';
function viewBuste() {
  let h = topbar('Buste paga', `${S.buste.length} ${S.buste.length === 1 ? 'busta archiviata' : 'buste archiviate'}`, `<a class="iconbtn" href="#guida" aria-label="Guida alle voci">${ic.book}</a>`);
  h += `<div class="btns" style="margin-bottom:14px"><button class="btn" data-act="busta-upload">${ic.upload} Carica PDF o foto</button><button class="btn ghost" data-act="busta-new">${ic.pen} A mano</button></div>`;
  if (S.lavori.length > 1) h += `<div class="chips"><button class="chip ${filtroBuste === 'tutti' ? 'on' : ''}" data-act="filtro-buste" data-id="tutti">Tutti</button>${S.lavori.map((j) => `<button class="chip ${filtroBuste === j.id ? 'on' : ''}" data-act="filtro-buste" data-id="${j.id}">${esc(j.azienda)}</button>`).join('')}</div>`;
  const bs = S.buste.filter((b) => filtroBuste === 'tutti' || b.jobId === filtroBuste).sort((a, b) => (a.ym === b.ym ? (a.tipo > b.tipo ? 1 : -1) : a.ym < b.ym ? 1 : -1));
  if (!bs.length) return h + vuoto(ic.doc, 'Ancora nessuna busta', 'Carica il PDF o una foto della busta: leggo io netto, lordo, trattenute, ferie e permessi, poi controllo che i conti tornino.');
  const anni = {}; bs.forEach((b) => (anni[b.ym.slice(0, 4)] = anni[b.ym.slice(0, 4)] || []).push(b));
  for (const y of Object.keys(anni).sort().reverse()) {
    const L = anni[y]; const tot = L.reduce((a, b) => a + (b.netto || 0), 0); const totL = L.reduce((a, b) => a + (b.lordo || 0), 0);
    h += `<div class="card"><h2><span class="grow">${y}</span><span class="small muted" style="font-family:var(--fb);font-weight:500">netto ${eur0(tot)}${totL ? ` · lordo ${eur0(totL)}` : ''}</span></h2><div class="list">`;
    h += L.map((b) => { const j = job(b.jobId); const w = controlla(b).some((c) => c.s === 'warn');
      return `<a class="li" href="#busta-${b.id}">${j ? jobAvatar(j, 38) : '<div class="avatar" style="background:var(--faint)">?</div>'}<div class="grow"><div class="t">${ymLabel(b.ym)}${b.tipo !== 'mensile' ? ` · ${b.tipo === 'tredicesima' ? '13ª' : b.tipo === 'quattordicesima' ? '14ª' : 'conguaglio'}` : ''}</div><div class="s">${j ? esc(j.azienda) : 'Senza lavoro'}${b.fileId ? ' · PDF' : ''}${b.cdc ? ' · in Conto di Casa' : ''}</div></div><div><div class="amt">${eur(b.netto)}</div><div style="text-align:right">${w ? '<span class="badge warn">da verificare</span>' : '<span class="badge ok">ok</span>'}</div></div></a>`; }).join('');
    h += `</div></div>`;
  }
  return h;
}

function viewBusta(id) {
  const b = S.buste.find((x) => x.id === id); if (!b) return viewBuste();
  const j = job(b.jobId);
  let h = topbar(ymLabel(b.ym), `${j ? esc(j.azienda) : ''}${b.tipo !== 'mensile' ? ` · ${b.tipo}` : ''}`, `<button class="iconbtn" data-act="busta-edit" data-id="${b.id}" aria-label="Modifica">${ic.pen}</button>`, '#buste');
  h += `<div class="card hero"><span class="kicker">Netto in busta ${info('netto')}</span><div class="big">${eur(b.netto)}</div><div class="muted small">Lordo ${eur(b.lordo)} · trattenute ${eur(b.trattenute ?? (b.lordo && b.netto ? b.lordo - b.netto : null))}</div>
    <div class="row" style="margin-top:12px;flex-wrap:wrap">${b.fileId ? `<button class="btn sm ghost" data-act="view-file" data-id="${b.fileId}" data-t="Busta ${ymLabel(b.ym)}">${ic.eye} Documento</button><button class="btn sm ghost" data-act="busta-rileggi" data-id="${b.id}">${ic.doc} Rileggi</button>` : ''}<button class="btn sm ghost" data-act="cdc-invia" data-id="${b.id}">${ic.link} ${b.cdc ? 'Aggiorna in' : 'Invia a'} Conto di Casa</button></div></div>`;
  const chk = controlla(b); const problemi = chk.filter((c) => c.lettera);
  h += `<div class="card"><h2>Controllo</h2>${chk.map((c) => `<div class="chk ${c.s}"><div class="dot">${c.s === 'ok' ? ic.check : c.s === 'warn' ? ic.alert : ic.info}</div><div><b>${esc(c.t)}</b><p>${esc(c.p)}</p></div></div>`).join('')}
    <button class="btn ${problemi.length ? '' : 'ghost'} block" style="margin-top:12px" data-act="lettera" data-id="${b.id}">${ic.mail} ${problemi.length ? 'Chiedi chiarimenti all’ufficio paghe' : 'Scrivi all’ufficio paghe'}</button></div>`;
  const rows = [['Totale competenze (lordo)', b.lordo], ['Imponibile previdenziale', b.imponibilePrev], ['Contributi INPS', b.contributi], ['Imponibile fiscale', b.imponibileFisc], ['IRPEF trattenuta', b.irpef], ['Addizionale regionale', b.addReg], ['Addizionale comunale', b.addCom], ['Totale trattenute', b.trattenute], ['Quota TFR del mese', b.tfr]].filter((r) => r[1] != null);
  const rows2 = [['Ore supplementari/straordinarie', b.oreExtra, 'h'], ['Ferie residue', b.ferieRes, 'gg'], ['Permessi residui', b.permessiRes, 'h']].filter((r) => r[1] != null);
  if (rows.length || rows2.length) h += `<div class="card"><h2>Dati della busta</h2>${rows.map(([k, v]) => `<div class="kv"><span class="k">${k}</span><span class="v">${eur(v)}</span></div>`).join('')}${rows2.map(([k, v, u]) => `<div class="kv"><span class="k">${k}</span><span class="v">${num(v, 2)} ${u}</span></div>`).join('')}${b.note ? `<p class="small muted" style="margin:10px 0 0">${esc(b.note)}</p>` : ''}</div>`;
  if (b.testo) { const tr = []; GLOSSARIO.forEach(([, L]) => L.forEach((g) => { if (g[1].test(b.testo)) tr.push(g); })); if (tr.length) h += `<div class="card"><h2>Le voci della tua busta</h2>${tr.map((g) => `<details class="gl"><summary>${esc(g[0])}</summary><p>${esc(g[2])}</p></details>`).join('')}</div>`; }
  else h += `<div class="card"><h2>Le voci spiegate</h2><p class="small muted" style="margin:0 0 10px">Carica il PDF per vedere spiegate solo le voci della tua busta.</p><a class="btn sm ghost" href="#guida">${ic.book} Apri la guida</a></div>`;
  h += `<button class="btn danger block" data-act="busta-del" data-id="${b.id}">${ic.trash} Elimina busta</button>`;
  return h;
}

const CAMPI_BUSTA = [['netto', 'Netto', '€'], ['lordo', 'Lordo (competenze)', '€'], ['contributi', 'Contributi (INPS/FPLS)', '€'], ['irpef', 'IRPEF trattenuta', '€'], ['trattenute', 'Totale trattenute', '€'], ['imponibilePrev', 'Imponibile contributivo', '€'], ['imponibileFisc', 'Imponibile fiscale', '€'], ['tfr', 'Quota TFR', '€'], ['addReg', 'Addiz. regionale', '€'], ['addCom', 'Addiz. comunale', '€'], ['ferieRes', 'Ferie residue', 'giorni'], ['permessiRes', 'Permessi residui', 'ore'], ['oreExtra', 'Ore extra (suppl./straord.)', 'ore']];
function bustaForm(pref = {}, found = {}, fileRec = null) {
  const b = Object.assign({ tipo: 'mensile', ym: addYM(curYM(), -1), jobId: (attivo() || {}).id }, pref);
  const testo = fileRec ? fileRec.testo : (pref.testo || '');
  const inp = (k, label, unit) => `<label class="field"><span>${label}${found[k] != null ? ` <span class="badge ok">${(found._appresi || []).includes(k) ? 'imparato' : 'letto'}</span>` : ''}</span><div class="inrow"><input class="inp ${found[k] != null ? 'found' : ''}" inputmode="decimal" name="${k}" value="${fmtIn(b[k])}" placeholder="${unit}">${testo ? `<button type="button" class="pin" data-insegna="${k}" aria-label="Indica ${label} nel documento" title="Indica nel documento">${ic.eye}</button>` : ''}</div></label>`;
  const n = Object.keys(found).filter((k) => !['ym', 'tipo', 'jobId', '_appresi'].includes(k)).length;
  const principali = CAMPI_BUSTA.slice(0, 4), altri = CAMPI_BUSTA.slice(4);
  let h = `<h3>${pref.id ? 'Modifica busta' : 'Nuova busta'}</h3><p class="lead">${fileRec ? (n ? `Ho letto ${n} ${n === 1 ? 'valore' : 'valori'}: controllali. Se uno manca o è sbagliato tocca ${'<span class="pin inline">' + ic.eye + '</span>'} e indicalo nel documento: dalla prossima busta lo riconosco da solo.` : 'Non sono riuscito a leggere i valori: tocca l’occhio accanto a un campo e scegli il numero giusto dal documento.') : 'Bastano mese e netto; più dati inserisci, più il controllo è preciso.'}</p>
  <form data-form="busta">
  <label class="field"><span>Lavoro</span><select class="inp" name="jobId">${S.lavori.map((j) => `<option value="${j.id}" ${j.id === b.jobId ? 'selected' : ''}>${esc(j.azienda)}</option>`).join('')}<option value="">— nessuno —</option></select></label>
  <div class="fgrid"><label class="field"><span>Mese${found.ym ? ' <span class="badge ok">letto</span>' : ''}</span><input class="inp" type="month" name="ym" value="${b.ym}" required></label>
  <label class="field"><span>Tipo</span><select class="inp" name="tipo">${[['mensile', 'Mensile'], ['tredicesima', '13ª'], ['quattordicesima', '14ª'], ['conguaglio', 'Conguaglio / altro']].map(([v, l]) => `<option value="${v}" ${b.tipo === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
  <div class="fgrid">${principali.map((c) => inp(...c)).join('')}</div>
  <details class="gl" ${altri.some((c) => found[c[0]] != null) ? 'open' : ''}><summary>Altri dati (facoltativi)</summary><div class="fgrid">${altri.map((c) => inp(...c)).join('')}</div>
  <label class="field"><span>Note</span><textarea class="inp" name="note">${esc(b.note || '')}</textarea></label></details>
  <div class="btns" style="margin-top:14px"><button type="button" class="btn ghost" data-x="cancel">Annulla</button><button class="btn" type="submit">Salva</button></div></form>`;
  const sh = openSheet(h); const form = $('form', sh);
  const verifica = () => {
    const n = toNum(form.netto.value), l = toNum(form.lordo.value), t = toNum(form.trattenute.value); let box = $('#contiBox', sh);
    if (!box) { box = document.createElement('p'); box.id = 'contiBox'; box.className = 'note'; form.querySelector('.fgrid:nth-of-type(2)').after(box); }
    if (n == null || l == null) { box.textContent = ''; return; }
    const diff = t != null ? l - t - n : null;
    if (n > l * 1.3) box.innerHTML = `<span style="color:var(--warn)">${ic.alert.replace('<svg', '<svg width="14" height="14" style="vertical-align:-2px"')} Il netto è molto più alto del lordo: controlla i due valori.</span>`;
    else if (diff != null && Math.abs(diff) > 1.5) box.innerHTML = `<span style="color:var(--warn)">Lordo − trattenute = ${eur(l - t)}, ma il netto è ${eur(n)}: uno dei tre valori potrebbe essere sbagliato.</span>`;
    else if (diff != null) box.innerHTML = `<span style="color:var(--ok)">I conti tornano: lordo − trattenute = netto${Math.abs(diff) > 0.01 ? ` (arrotondamento ${eur(-diff)})` : ''}.</span>`;
    else box.textContent = '';
  };
  ['netto', 'lordo', 'trattenute'].forEach((k) => form[k].addEventListener('input', verifica)); verifica();
  sh.addEventListener('click', (e) => {
    if (e.target.closest('[data-x="cancel"]')) closeSheet();
    const ins = e.target.closest('[data-insegna]'); if (ins) insegna(ins.dataset.insegna, testo, (v) => { form[ins.dataset.insegna].value = fmtIn(v); form[ins.dataset.insegna].classList.add('found'); verifica(); });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault(); const fd = new FormData(form);
    const rec = pref.id ? S.buste.find((x) => x.id === pref.id) : { id: uid() };
    rec.jobId = fd.get('jobId') || null; rec.ym = fd.get('ym'); rec.tipo = fd.get('tipo'); rec.note = fd.get('note') || '';
    CAMPI_BUSTA.forEach(([k]) => { rec[k] = toNum(fd.get(k)); });
    if (!rec.ym) { toast('Indica il mese'); return; }
    if (fileRec) { rec.fileId = fileRec.id; rec.testo = (fileRec.testo || '').slice(0, 20000); }
    if (!pref.id) S.buste.push(rec);
    save(); closeSheet(); toast('Busta salvata');
    if (S.cdc.auto && rec.netto) inviaCdc(rec, true);
    location.hash = '#busta-' + rec.id; render();
  });
}
function insegna(campo, testo, onPick) {
  const L = testo.split(/\n/).map((l) => l.trim()).filter((l) => importiIn(l).length);
  const label = (CAMPI_BUSTA.find((c) => c[0] === campo) || [, campo])[1];
  const h = `<h3>Dov'è «${esc(label)}»?</h3><p class="lead">Tocca il numero giusto nella riga del documento. Me lo ricordo per le prossime buste.</p><div class="righe">${L.map((l, i) => { const vals = importiIn(l); const txt = esc(l.replace(new RegExp(NUMRE.source, 'g'), (m) => (/,\d{2}$/.test(m) ? '' : m)).replace(/\s+/g, ' ').trim()); return `<div class="riga"><div class="small">${txt || '—'}</div><div class="nums">${vals.map((v, k) => `<button type="button" class="chip" data-l="${i}" data-k="${k}">${num(v, 2)}</button>`).join('')}</div></div>`; }).join('') || '<p class="muted">Non ho trovato importi nel testo del documento.</p>'}</div><button class="btn ghost block" style="margin-top:12px" data-x="close">Annulla</button>`;
  const sh = openSheet(h);
  sh.addEventListener('click', (e) => {
    if (e.target.closest('[data-x="close"]')) { closeSheet(); return; }
    const c = e.target.closest('[data-l]'); if (!c) return;
    const line = L[Number(c.dataset.l)]; const idx = Number(c.dataset.k); const v = importiIn(line)[idx];
    S.regole = (S.regole || []).filter((r) => r.campo !== campo || r.chiave !== chiaveRiga(line));
    S.regole.unshift({ campo, chiave: chiaveRiga(line), idx }); S.regole = S.regole.slice(0, 80); save();
    onPick(v); closeSheet(); toast('Fatto: dalla prossima busta lo riconosco');
  });
}
async function caricaBusta(files) {
  if (!files) files = await pickFile('application/pdf,image/*');
  const file = files[0]; if (!file) return;
  const sh = openSheet(`<h3>Leggo la busta…</h3><p class="lead" id="prog">${esc(file.name)}</p><div style="text-align:center;padding:16px"><span class="spin"></span></div>`);
  const id = uid(); await filePut(id, file, { name: file.name, type: file.type });
  let testo = '', found = {};
  try { testo = await leggiFile(file, (p) => { const el = $('#prog', sh); if (el) el.textContent = `Riconoscimento del testo ${Math.round(p * 100)}%`; }); found = parseBusta(testo); }
  catch (e) { found = {}; }
  closeSheet(); setTimeout(() => bustaForm(Object.assign({}, found), found, { id, testo }), 230);
}
async function rileggiBusta(b) {
  const rec = await fileGet(b.fileId); if (!rec) { toast('Il documento non è su questo dispositivo'); return; }
  const sh = openSheet(`<h3>Rileggo la busta…</h3><p class="lead" id="prog">${esc(rec.name)}</p><div style="text-align:center;padding:16px"><span class="spin"></span></div>`);
  let testo = '', found = {};
  try { const f = new File([rec.blob], rec.name, { type: rec.type }); testo = await leggiFile(f, (x, l) => { const el = $('#prog', sh); if (el) el.textContent = `${l ? l + ' · ' : ''}${Math.round((x || 0) * 100)}%`; }); found = parseBusta(testo); } catch (e) {}
  closeSheet();
  const pref = Object.assign({}, b); Object.keys(found).forEach((k) => { if (!k.startsWith('_') && found[k] != null && k !== 'jobId') pref[k] = found[k]; });
  setTimeout(() => bustaForm(pref, found, { id: b.fileId, testo }), 230);
}
function lettera(b) {
  const j = job(b.jobId); const P = S.profilo; const chk = controlla(b).filter((c) => c.lettera);
  const punti = chk.length ? chk.map((c) => `- ${c.lettera}`).join('\n') : '- [scrivi qui cosa vuoi chiedere]';
  const testo = `Buongiorno,\n\nvi scrivo per chiedere un chiarimento sulla mia busta paga di ${meseDi(b.ym)} ${b.ym.slice(0, 4)}${b.tipo !== 'mensile' ? ` (${b.tipo})` : ''}.\n\nControllando i conti ho notato quanto segue:\n${punti}\n\nPotreste indicarmi come sono stati calcolati questi importi? Se serve, posso inviarvi il dettaglio delle ore lavorate.\n\nGrazie e buona giornata,\n${P.nome || '[il tuo nome]'}`;
  const ogg = `Richiesta chiarimenti busta paga ${meseDi(b.ym)} ${b.ym.slice(0, 4)}`;
  const sh = openSheet(`<h3>Messaggio all'ufficio paghe</h3><p class="lead">Ho preparato il testo con i punti da chiarire${j ? ` per ${esc(j.azienda)}` : ''}. Modificalo come vuoi, poi copialo o aprilo nella mail.</p>
    <label class="field"><span>Oggetto</span><input class="inp" id="lOgg" value="${esc(ogg)}"></label>
    <label class="field"><span>Testo</span><textarea class="inp" id="lTxt" style="min-height:260px">${esc(testo)}</textarea></label>
    <label class="field"><span>Email dell'ufficio paghe (facoltativa)</span><input class="inp" id="lTo" type="email" value="${esc((j && j.emailPaghe) || '')}" placeholder="paghe@azienda.it"></label>
    <div class="btns"><button class="btn ghost" data-x="copy">${ic.copy} Copia</button><button class="btn" data-x="mail">${ic.mail} Apri nella mail</button></div><button class="btn ghost block" style="margin-top:10px" data-x="close">Chiudi</button>`);
  sh.addEventListener('click', (e) => {
    if (e.target.closest('[data-x="close"]')) closeSheet();
    if (e.target.closest('[data-x="copy"]')) copia(`Oggetto: ${$('#lOgg', sh).value}\n\n${$('#lTxt', sh).value}`);
    if (e.target.closest('[data-x="mail"]')) {
      const to = $('#lTo', sh).value.trim(); if (j && to) { j.emailPaghe = to; save(); }
      const a = document.createElement('a'); a.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent($('#lOgg', sh).value)}&body=${encodeURIComponent($('#lTxt', sh).value)}`; a.target = '_blank'; document.body.appendChild(a); a.click(); a.remove();
      toast(to ? `Mail pronta per ${to}` : 'Se la mail non si apre, usa Copia');
    }
  });
}

/* ---- Lavori ---- */
function viewLavori() {
  let h = topbar('Lavori', 'Tutti i tuoi datori di lavoro', `<button class="iconbtn" data-act="job-new" aria-label="Aggiungi lavoro">${ic.plus}</button>`);
  if (!S.lavori.length) return h + vuoto(ic.bag, 'Il tuo archivio lavori', 'Aggiungi ogni datore di lavoro, attuale e passato, con contratto, livello e orario. Puoi caricare contratti e proroghe: restano qui, sempre a portata di mano.', `<button class="btn block" data-act="job-new">${ic.plus} Aggiungi il primo lavoro</button>`);
  const L = S.lavori.slice().sort((a, b) => ((b.fine || '9999') + (b.inizio || '')).localeCompare((a.fine || '9999') + (a.inizio || '')));
  const dates = L.filter((j) => j.inizio).map((j) => j.inizio).sort();
  if (dates.length) {
    const min = new Date(dates[0]); const max = new Date();
    const t0 = new Date(min.getFullYear(), 0, 1).getTime(); const t1 = new Date(max.getFullYear() + 1, 0, 1).getTime(); const span = t1 - t0;
    const yrs = []; for (let y = min.getFullYear(); y <= max.getFullYear() + 1; y++) yrs.push(y); const step = Math.ceil(yrs.length / 6);
    h += `<div class="card"><h2>Il tuo percorso</h2><div class="tl">${L.filter((j) => j.inizio).map((j) => { const a = (new Date(j.inizio).getTime() - t0) / span * 100; const b = ((j.fine && j.fine < todayISO() ? new Date(j.fine) : max).getTime() - t0) / span * 100; return `<a class="tl-row" href="#lavoro-${j.id}"><span class="nm">${esc(j.azienda)}</span><div class="tl-track"><div class="tl-bar" style="left:${a}%;width:${Math.max(1.5, b - a)}%;background:${j.colore}"></div></div></a>`; }).join('')}<div class="tl-axis">${yrs.filter((_, i) => i % step === 0).map((y) => `<span>${y}</span>`).join('')}</div></div></div>`;
  }
  const tot = S.buste.reduce((a, b) => a + (b.netto || 0), 0); const mesiTot = L.reduce((a, j) => a + (jobMesi(j) || 0), 0);
  h += `<div class="grid3" style="margin-bottom:14px"><div class="tile static"><div class="l">Lavori</div><div class="v">${L.length}</div></div><div class="tile static"><div class="l">Esperienza</div><div class="v" style="font-size:19px">${durataTxt(mesiTot)}</div></div><div class="tile static"><div class="l">Netto archiviato</div><div class="v" style="font-size:19px">${eur0(tot)}</div></div></div>`;
  h += `<div class="card"><div class="list">${L.map((j) => { const nb = S.buste.filter((b) => b.jobId === j.id).length; const nd = (j.documenti || []).length;
    return `<a class="li" href="#lavoro-${j.id}">${jobAvatar(j)}<div class="grow"><div class="t">${esc(j.azienda)} ${corrente(j) ? '<span class="badge ok">in corso</span>' : ''}</div><div class="s">${esc(j.ruolo || TIPI[j.tipo] || '')} · ${jobPeriodo(j)}</div><div class="s">${durataTxt(jobMesi(j))}${nb ? ` · ${nb} buste` : ''}${nd ? ` · ${nd} documenti` : ''}</div></div><span class="chev">${ic.chev}</span></a>`; }).join('')}</div></div>`;
  h += `<div class="btns"><a class="btn ghost" href="#cv">${ic.user} Esporta per il CV</a><a class="btn ghost" href="#anno">${ic.euro} Anno e 730</a></div>`;
  return h;
}

function viewLavoro(id) {
  const j = job(id); if (!j) return viewLavori();
  const ym = curYM(); const cor = corrente(j);
  const c = E.contratto(jCalc(j), cor ? ym : (j.fine || ym).slice(0, 7));
  let h = topbar(esc(j.azienda), `${esc(j.ruolo || '')}${j.ruolo ? ' · ' : ''}${TIPI[j.tipo] || ''}`, `<button class="iconbtn" data-act="job-edit" data-id="${j.id}" aria-label="Modifica">${ic.pen}</button>`, '#lavori');
  h += `<div class="card hero"><div class="row">${jobAvatar(j, 52)}<div class="grow"><div class="kicker">${cor ? 'In corso' : 'Concluso'}${!cor && j.motivoFine ? ' · ' + esc(MOTIVI[j.motivoFine] || '') : ''}</div><div class="title" style="font-size:20px;font-weight:600">${jobPeriodo(j)}</div><div class="muted small">${durataTxt(jobMesi(j))}${j.sede ? ' · ' + esc(j.sede) : ''}</div></div></div>
    <div class="row" style="margin-top:12px;flex-wrap:wrap">${cor && S.attivo !== j.id ? `<button class="btn sm ghost" data-act="set-attivo" data-id="${j.id}">${ic.star} Lavoro principale</button>` : ''}<a class="btn sm ghost" href="#fine-${j.id}">${ic.flag} ${cor ? 'Fine contratto e NASpI' : 'Liquidazione e NASpI'}</a></div></div>`;
  h += `<div class="card"><h2>Contratto</h2>
    <div class="kv"><span class="k">CCNL</span><span class="v">${esc((j.ccnl === 'altro' && j.ccnlNome) || CCNL_NOMI[j.ccnl || 'commercio'] || j.ccnlNome || '')}</span></div>
    <div class="kv"><span class="k">Livello</span><span class="v">${esc(livelloLabel(j))}</span></div>
    <div class="kv"><span class="k">Orario</span><span class="v">${j.tipo === 'chiamata' ? 'a chiamata' + (j.disponibilita ? ', con disponibilità' : '') : `${num(c.oreSett)} h/sett. (${Math.round(c.p * 100)}%)`}</span></div>
    ${j.tipo !== 'chiamata' ? `<div class="kv"><span class="k">Retribuzione mensile lorda</span><span class="v">${eur(c.base)}${c.stima ? ' *' : ''}</span></div>` : ''}
    <div class="kv"><span class="k">Paga oraria lorda</span><span class="v">${eur(c.pagaOraria)}</span></div>
    ${c.superminimo ? `<div class="kv"><span class="k">Superminimo</span><span class="v">${eur(c.superminimo)}</span></div>` : ''}
    <div class="kv"><span class="k">Mensilità</span><span class="v">${c.mensilita}</span></div>
    ${j.mansioni ? `<div class="sec-title">Mansioni</div><p class="small" style="margin:0;white-space:pre-line">${esc(j.mansioni)}</p>` : ''}
    ${j.note ? `<p class="small muted" style="margin:10px 0 0">${esc(j.note)}</p>` : ''}</div>`;
  const docs = j.documenti || [];
  h += `<div class="card"><h2><span class="grow">Documenti</span><button class="btn sm" data-act="doc-add" data-id="${j.id}">${ic.upload} Carica</button></h2>`;
  h += !docs.length ? `<p class="small muted" style="margin:0">Carica qui contratto, proroghe, lettere e CU di questo lavoro (PDF o foto).</p>` : `<div class="list">${docs.slice().sort((a, b) => (b.data || '').localeCompare(a.data || '')).map((d) => `<div class="li static"><div class="docic">${ic.doc}</div><button class="grow plain" data-act="view-file" data-id="${d.fileId}" data-t="${esc(d.nome)}"><div class="t">${esc(d.nome)}</div><div class="s">${CAT_DOC[d.categoria] || 'Documento'}${d.data ? ' · ' + dateLabel(d.data) : ''}</div></button><button class="iconbtn sm" data-act="doc-menu" data-job="${j.id}" data-id="${d.id}" aria-label="Opzioni documento">${ic.pen}</button></div>`).join('')}</div>`;
  h += `</div>`;
  const bs = S.buste.filter((b) => b.jobId === j.id).sort((a, b) => (a.ym < b.ym ? 1 : -1));
  const totN = bs.reduce((a, b) => a + (b.netto || 0), 0), totL = bs.reduce((a, b) => a + (b.lordo || 0), 0); const sd = saldi(j);
  h += `<div class="card"><h2>Riepilogo</h2>
    <div class="kv"><span class="k">Buste archiviate</span><span class="v">${bs.length}</span></div>
    ${bs.length ? `<div class="kv"><span class="k">Netto totale</span><span class="v">${eur(totN)}</span></div>` : ''}${totL ? `<div class="kv"><span class="k">Lordo totale</span><span class="v">${eur(totL)}</span></div>` : ''}
    <div class="kv"><span class="k">TFR maturato (stima) ${info('tfr')}</span><span class="v">${eur(tfrStimato(j))}</span></div>
    ${sd ? `<div class="kv"><span class="k">Ferie residue</span><span class="v">${num(sd.ferie, 2)} gg</span></div><div class="kv"><span class="k">Permessi residui</span><span class="v">${num(sd.permessi, 1)} h</span></div>` : ''}</div>`;
  if (bs.length) h += `<div class="card"><h2>Buste</h2><div class="list">${bs.map((b) => `<a class="li" href="#busta-${b.id}"><div class="grow"><div class="t">${ymLabel(b.ym)}${b.tipo !== 'mensile' ? ' · ' + b.tipo : ''}</div></div><div class="amt">${eur(b.netto)}</div><span class="chev">${ic.chev}</span></a>`).join('')}</div></div>`;
  h += `<button class="btn danger block" data-act="job-del" data-id="${j.id}">${ic.trash} Elimina lavoro</button>`;
  if (c.stima) h += `<p class="note">* Minimo ricostruito o precedente alla tabella in vigore: stima.</p>`;
  return h;
}

/* ---- Lettura dei contratti ---- */
async function leggiContrattoFile(file, onProg) {
  let testo = ''; try { testo = await leggiFile(file, onProg); } catch (e) {}
  const ex = testo ? parseContratto(testo) : {};
  const fid = uid(); await filePut(fid, file, { name: file.name, type: file.type });
  const categoria = /proroga|prorogat/i.test(testo) ? 'proroga' : /certificazione\s*unica/i.test(testo) ? 'cu' : 'contratto';
  return { ex, testo, letto: testo.replace(/\s/g, '').length > 40, doc: { id: uid(), fileId: fid, nome: file.name.replace(/\.[a-z0-9]+$/i, ''), categoria, data: ex.inizio || todayISO() } };
}
function sheetLettura(nome) {
  const sh = openSheet(`<h3>Leggo il contratto…</h3><p class="lead">${esc(nome)}</p><div style="text-align:center;padding:12px"><span class="spin"></span></div><p class="small muted" id="prog" style="text-align:center;margin:0"></p>`);
  return (x, label) => { const el = $('#prog', sh); if (el) el.textContent = `${label ? label + ' · ' : ''}${Math.round((x || 0) * 100)}%`; };
}
async function nuovoLavoroDaContratto(file, onSaved, base = {}) {
  if (!file) return;
  const prog = sheetLettura(file.name);
  const r = await leggiContrattoFile(file, prog);
  closeSheet();
  const extra = { _doc: r.doc, _letto: r.letto }; if (r.ex.fine && !base.motivoFine && r.ex.tipo !== 'indeterminato') extra.motivoFine = 'scadenza';
  setTimeout(() => jobForm(Object.assign({}, base, r.ex, extra), r.ex, onSaved), 230);
}
const CAMPI_LAVORO = [['azienda', 'Azienda'], ['ruolo', 'Ruolo'], ['sede', 'Città'], ['tipo', 'Contratto', (v) => TIPI[v] || v], ['inizio', 'Inizio', dateLabel], ['fine', 'Fine', dateLabel], ['ccnl', 'CCNL', (v) => CCNL_NOMI[v] || v], ['livello', 'Livello', (v, ex, j) => livelloLabel({ ccnl: ex.ccnl || j.ccnl, livello: v })], ['oreSett', 'Ore a settimana', (v) => num(v)], ['superminimo', 'Superminimo', eur], ['disponibilita', 'Obbligo di disponibilità', (v) => (v ? 'sì' : 'no')]];
/** Dopo aver caricato un documento in un lavoro: propongo di aggiornare i dati (es. proroga) */
async function proponiAggiornamento(j, file, doc) {
  let testo = ''; try { testo = await leggiFile(file); } catch (e) { return; }
  if (!testo || testo.replace(/\s/g, '').length < 40) return;
  if (/proroga|prorogat/i.test(testo)) doc.categoria = 'proroga'; else if (/certificazione\s*unica/i.test(testo)) { doc.categoria = 'cu'; save(); render(); return; }
  const ex = parseContratto(testo); if (ex.inizio && doc.categoria !== 'proroga') doc.data = ex.inizio;
  if (doc.categoria === 'proroga') { delete ex.inizio; delete ex.azienda; }
  const diff = CAMPI_LAVORO.filter(([k]) => ex[k] != null && ex[k] !== '' && String(ex[k]) !== String(j[k] ?? ''));
  save(); render();
  if (!diff.length) { toast('Documento letto: i dati del lavoro sono già aggiornati'); return; }
  const fmt = (c, v) => (v == null || v === '' ? '—' : c[2] ? c[2](v, ex, j) : String(v));
  const sh = openSheet(`<h3>${doc.categoria === 'proroga' ? 'È una proroga' : 'Ho letto il documento'}</h3><p class="lead">Vuoi aggiornare ${esc(j.azienda)} con questi dati?</p>
    <div class="list">${diff.map((c) => `<label class="li static check" style="padding:9px 0"><input type="checkbox" data-k="${c[0]}" ${c[0] === 'azienda' ? '' : 'checked'}><span class="switch"></span><span class="grow"><b>${c[1]}</b><span class="hint">${esc(fmt(c, j[c[0]]))} → <b style="color:var(--text)">${esc(fmt(c, ex[c[0]]))}</b></span></span></label>`).join('')}</div>
    <div class="btns" style="margin-top:12px"><button class="btn ghost" data-x="no">Lascia com'è</button><button class="btn" data-x="ok">Aggiorna</button></div>`);
  sh.addEventListener('click', (e) => {
    const x = e.target.closest('[data-x]'); if (!x) return;
    if (x.dataset.x === 'ok') { $$('input[data-k]', sh).forEach((c) => { if (c.checked) j[c.dataset.k] = ex[c.dataset.k]; }); if (j.fine && j.inizio && j.fine < j.inizio) j.fine = null; save(); render(); toast('Lavoro aggiornato'); }
    closeSheet();
  });
}

function jobForm(pref = {}, extracted = null, onSaved = null) {
  const j = Object.assign({ tipo: 'indeterminato', ccnl: 'commercio', livello: '4', oreSett: 40, oreSettFull: 40, giorniSett: 5, oltre15: true, domenicaRiposo: true, colore: COLORI[S.lavori.length % COLORI.length] }, pref);
  const ex = extracted || {}; const tag = (k) => (ex[k] != null ? ' <span class="badge ok">dal contratto</span>' : '');
  const M = Object.assign({}, E.CCNL.commercio.magg, j.magg || {});
  const lvSel = (ccnl) => `<select class="inp" name="lv_${ccnl}">${livelliDi(ccnl).map(([k, l, v]) => `<option value="${k}" ${String(j.livello) === k && (j.ccnl || 'commercio') === ccnl ? 'selected' : ''}>${l} · ${eur0(v)}</option>`).join('')}</select>`;
  const nEx = Object.keys(ex).length;
  let h = `<h3>${pref.id ? 'Modifica lavoro' : 'Nuovo lavoro'}</h3>${extracted ? (nEx ? `<p class="lead">Dal contratto ho compilato ${nEx} campi (con il segno <span class="badge ok">dal contratto</span>): controllali e completa il resto.</p>` : `<p class="banner">${pref._letto === false ? 'Non riesco a leggere il testo di questo file (forse è una foto poco nitida o una scansione): compila i campi a mano.' : 'Ho letto il contratto ma non ho trovato i dati principali: compila i campi a mano.'} Il documento resta comunque allegato al lavoro.</p>`) : '<p class="lead">Ti bastano i primi campi; il resto lo puoi aggiungere dopo.</p>'}
  ${!pref.id && !extracted ? `<button class="btn ghost block" style="margin-bottom:14px" data-x="leggi">${ic.upload} Compila dal contratto (PDF o foto)</button>` : ''}
  <form data-form="job">
  <div class="sec-title" style="margin-top:0">Il lavoro</div>
  <label class="field"><span>Azienda / datore di lavoro${tag('azienda')}</span><input class="inp" name="azienda" value="${esc(j.azienda || '')}" required placeholder="es. Negozio Rossi srl"></label>
  <label class="field"><span>Ruolo${tag('ruolo')}</span><input class="inp" name="ruolo" value="${esc(j.ruolo || '')}" placeholder="es. Addetto vendite"></label>
  <label class="field"><span>Città${tag('sede')}</span><input class="inp" name="sede" value="${esc(j.sede || '')}" placeholder="Dove lavori"></label>
  <label class="field"><span>Tipo di contratto${tag('tipo')}</span><select class="inp" name="tipo">${Object.entries(TIPI).map(([k, v]) => `<option value="${k}" ${j.tipo === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
  <div class="fgrid"><label class="field"><span>Inizio${tag('inizio')}</span><input class="inp" type="date" name="inizio" value="${j.inizio || ''}" required></label><label class="field"><span>Fine${tag('fine')}</span><input class="inp" type="date" name="fine" value="${j.fine || ''}"><span class="hint">Vuoto se non ha scadenza</span></label></div>
  <div data-fine><label class="field"><span>Come è finito / finirà</span><select class="inp" name="motivoFine"><option value="">—</option>${Object.entries(MOTIVI).map(([k, v]) => `<option value="${k}" ${j.motivoFine === k ? 'selected' : ''}>${v}</option>`).join('')}</select><span class="hint">Serve per capire se ti spetta la NASpI</span></label></div>
  <div class="sec-title">Contratto e paga</div>
  <label class="field"><span>CCNL${tag('ccnl')}</span><select class="inp" name="ccnl">${Object.entries(CCNL_NOMI).map(([k, v]) => `<option value="${k}" ${(j.ccnl || 'commercio') === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
  ${['commercio', 'turismo', 'pubblici', 'multiservizi'].map((k) => `<div data-show="${k}"><label class="field"><span>Livello${tag('livello')}</span>${lvSel(k)}<span class="hint">${k === 'commercio' ? 'Commessi e addetti vendita di solito sono al IV livello' : `Minimi dal ${E.TABELLE[k].dal.split('-').reverse().map((x, i) => (i === 0 ? MESI[Number(x) - 1] : x)).join(' ')}`}</span></label></div>`).join('')}
  <div data-show="altro cinema"><p class="note" data-cine style="margin:0 0 10px">Per il cinema metto già 14 mensilità, divisore 173 e straordinario al 30%: inserisci il minimo mensile del tuo livello, lo trovi in busta (paga base + contingenza + EDR).</p><label class="field" data-nome><span>Nome del contratto</span><input class="inp" name="ccnlNome" value="${esc(j.ccnlNome || '')}" placeholder="es. Esercizi cinematografici"></label>
  <div class="fgrid"><label class="field"><span>Livello${tag('livello')}</span><input class="inp" name="livelloAltro" value="${esc(['altro', 'cinema'].includes(j.ccnl) ? j.livello || '' : '')}"></label><label class="field"><span>Minimo mensile tempo pieno</span><input class="inp" inputmode="decimal" name="minimoManuale" value="${fmtIn(j.minimoManuale)}" placeholder="€ dalla busta"></label></div>
  <div class="fgrid"><label class="field"><span>Mensilità</span><select class="inp" name="mensilita">${[12, 13, 14].map((m) => `<option ${Number(j.mensilita || 14) === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label><label class="field"><span>Divisore orario</span><input class="inp" inputmode="numeric" name="divisoreOrario" value="${j.divisoreOrario || ''}" placeholder="es. 168"></label></div></div>
  <div class="fgrid"><label class="field"><span>Ore a settimana${tag('oreSett')}</span><input class="inp" inputmode="decimal" name="oreSett" value="${fmtIn(j.oreSett)}"></label><label class="field"><span>Ore tempo pieno</span><input class="inp" inputmode="decimal" name="oreSettFull" value="${fmtIn(j.oreSettFull)}"></label></div>
  <div data-chiamata><label class="check"><input type="checkbox" name="disponibilita" ${j.disponibilita ? 'checked' : ''}><span class="switch"></span><span class="grow">Con obbligo di disponibilità ${tag('disponibilita')}<span class="hint">Ti spetta l’indennità di disponibilità (20%)</span></span></label></div>
  <details class="gl"><summary>Altre impostazioni</summary>
  <div class="fgrid"><label class="field"><span>Giorni a settimana</span><input class="inp" inputmode="numeric" name="giorniSett" value="${j.giorniSett || 5}"></label><label class="field"><span>Superminimo €/mese${tag('superminimo')}</span><input class="inp" inputmode="decimal" name="superminimo" value="${fmtIn(j.superminimo)}"></label></div>
  <div class="fgrid"><label class="field"><span>Scatti di anzianità</span><input class="inp" inputmode="numeric" name="scatti" value="${j.scatti || 0}"></label><label class="field" data-noncomm><span>Importo di uno scatto</span><input class="inp" inputmode="decimal" name="scattoImporto" value="${fmtIn(j.scattoImporto)}" placeholder="€"></label></div>
  <label class="field" data-noncomm><span>Aumenti da rinnovo CCNL dal 2024 (€/mese, tempo pieno)</span><input class="inp" inputmode="decimal" name="aumentiRinnovo" value="${fmtIn(j.aumentiRinnovo)}" placeholder="per la tassazione al 5%"></label>
  <div class="sec-title">Maggiorazioni %</div>
  <div class="grid3">${[['supplementare', 'Supplem.'], ['straord48', 'Straord.'], ['festivo', 'Festivo'], ['domenicale', 'Domenica'], ['notturno', 'Notturno'], ['straordOltre48', 'Oltre 48h']].map(([k, l]) => `<label class="field"><span>${l}</span><input class="inp" inputmode="decimal" name="mg_${k}" value="${fmtIn(M[k])}"></label>`).join('')}</div>
  <label class="check"><input type="checkbox" name="oltre15" ${j.oltre15 !== false ? 'checked' : ''}><span class="switch"></span><span class="grow">Azienda con più di 15 dipendenti <span class="hint">72 h di ROL invece di 56</span></span></label>
  <label class="check"><input type="checkbox" name="domenicaRiposo" ${j.domenicaRiposo !== false ? 'checked' : ''}><span class="switch"></span><span class="grow">La domenica è il giorno di riposo <span class="hint">Per la tassazione al 15% delle maggiorazioni</span></span></label>
  <div class="sec-title">Per il CV</div>
  <label class="field"><span>Mansioni (una per riga)</span><textarea class="inp" name="mansioni" placeholder="Vendita assistita&#10;Gestione cassa&#10;Allestimento vetrine">${esc(j.mansioni || '')}</textarea></label>
  <div class="sec-title">Saldi iniziali</div>
  <div class="fgrid"><label class="field"><span>Ferie residue (gg)</span><input class="inp" inputmode="decimal" name="resFerie" value="${fmtIn(j.resFerie)}"></label><label class="field"><span>Permessi residui (h)</span><input class="inp" inputmode="decimal" name="resPermessi" value="${fmtIn(j.resPermessi)}"></label></div>
  <label class="field"><span>Alla data</span><input class="inp" type="date" name="resData" value="${j.resData || ''}"><span class="hint">Se carichi buste con le ferie residue, uso quelle</span></label>
  <div class="fgrid"><label class="field"><span>Colore</span><select class="inp" name="colore">${COLORI.map((c, i) => `<option value="${c}" ${j.colore === c ? 'selected' : ''}>${['Blu', 'Senape', 'Verde', 'Rosso', 'Viola', 'Azzurro', 'Rosa', 'Lime'][i]}</option>`).join('')}</select></label><span></span></div>
  <label class="field"><span>Note</span><textarea class="inp" name="note">${esc(j.note || '')}</textarea></label></details>
  <div class="btns" style="margin-top:14px"><button type="button" class="btn ghost" data-x="cancel">Annulla</button><button class="btn" type="submit">Salva</button></div></form>`;
  const sh = openSheet(h); const form = $('form', sh);
  const sync = () => { const v = form.ccnl.value; $$('[data-show]', sh).forEach((d) => (d.style.display = d.dataset.show.split(' ').includes(v) ? '' : 'none')); $('[data-cine]', sh).style.display = v === 'cinema' ? '' : 'none'; $('[data-nome]', sh).style.display = v === 'cinema' ? 'none' : '';
    if (v === 'cinema') { if (!form.divisoreOrario.value) form.divisoreOrario.value = '173'; form.mensilita.value = form.mensilita.value || '14'; ['straord48', 'straordOltre48'].forEach((k) => { if (form['mg_' + k].value === '15' || form['mg_' + k].value === '20') form['mg_' + k].value = '30'; }); } $$('[data-noncomm]', sh).forEach((d) => (d.style.display = v === 'commercio' ? 'none' : '')); $('[data-chiamata]', sh).style.display = form.tipo.value === 'chiamata' ? '' : 'none'; $('[data-fine]', sh).style.display = form.fine.value ? '' : 'none'; };
  ['ccnl', 'tipo', 'fine'].forEach((n) => form[n].addEventListener('change', sync)); form.fine.addEventListener('input', sync); sync();
  sh.addEventListener('click', async (e) => {
    if (e.target.closest('[data-x="cancel"]')) closeSheet();
    const lb = e.target.closest('[data-x="leggi"]'); if (!lb) return;
    const file = (await pickFile('application/pdf,image/*'))[0]; if (!file) return;
    const cur = Object.fromEntries([...new FormData(form).entries()].filter(([, v]) => v !== '')); delete cur.ccnl;
    closeSheet(); setTimeout(() => nuovoLavoroDaContratto(file, onSaved, Object.assign({}, j, cur)), 230);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault(); const fd = new FormData(form);
    const rec = pref.id ? job(pref.id) : { id: uid(), documenti: [] };
    rec.azienda = fd.get('azienda').trim(); rec.ruolo = fd.get('ruolo').trim(); rec.sede = fd.get('sede').trim();
    rec.tipo = fd.get('tipo'); rec.inizio = fd.get('inizio'); rec.fine = fd.get('fine') || null; rec.motivoFine = rec.fine ? fd.get('motivoFine') || null : null; rec.ccnl = fd.get('ccnl');
    const libero = ['altro', 'cinema'].includes(rec.ccnl);
    rec.livello = libero ? fd.get('livelloAltro') : fd.get('lv_' + rec.ccnl);
    rec.ccnlNome = rec.ccnl === 'cinema' ? 'Esercizi cinematografici' : fd.get('ccnlNome'); rec.minimoManuale = libero ? toNum(fd.get('minimoManuale')) : null;
    rec.mensilita = Number(fd.get('mensilita')); rec.divisoreOrario = toNum(fd.get('divisoreOrario'));
    rec.oreSett = toNum(fd.get('oreSett')) || 40; rec.oreSettFull = toNum(fd.get('oreSettFull')) || 40; rec.giorniSett = toNum(fd.get('giorniSett')) || 5;
    rec.superminimo = toNum(fd.get('superminimo')) || 0; rec.scatti = toNum(fd.get('scatti')) || 0; rec.scattoImporto = toNum(fd.get('scattoImporto'));
    rec.aumentiRinnovo = toNum(fd.get('aumentiRinnovo')); rec.disponibilita = !!fd.get('disponibilita'); rec.colore = fd.get('colore');
    rec.oltre15 = !!fd.get('oltre15'); rec.domenicaRiposo = !!fd.get('domenicaRiposo'); rec.mansioni = (fd.get('mansioni') || '').trim();
    const mg = {}; Object.keys(E.CCNL.commercio.magg).forEach((k) => { const v = toNum(fd.get('mg_' + k)); if (v != null && v !== E.CCNL.commercio.magg[k]) mg[k] = v; }); rec.magg = mg;
    rec.resFerie = toNum(fd.get('resFerie')); rec.resPermessi = toNum(fd.get('resPermessi')); rec.resData = fd.get('resData') || null; rec.note = fd.get('note') || '';
    if (libero && !rec.minimoManuale) { toast('Indica il minimo mensile a tempo pieno (lo trovi in busta: paga base + contingenza)'); return; }
    if (rec.fine && rec.inizio && rec.fine < rec.inizio) { toast('La data di fine è prima dell’inizio'); return; }
    if (pref._doc) { rec.documenti = rec.documenti || []; rec.documenti.push(pref._doc); }
    if (!pref.id) { S.lavori.push(rec); const cur = job(S.attivo); if (!cur || (corrente(rec) && !corrente(cur))) S.attivo = rec.id; }
    save(); closeSheet(); toast('Lavoro salvato');
    if (onSaved) onSaved(rec); else { location.hash = '#lavoro-' + rec.id; render(); }
  });
}
async function addDocs(jobId, files) {
  const j = job(jobId); if (!j) return;
  if (!files) files = await pickFile('application/pdf,image/*', true); if (!files.length) return;
  j.documenti = j.documenti || [];
  for (const f of files) {
    const fid = uid(); await filePut(fid, f, { name: f.name, type: f.type });
    const cat = /\bcu\b|certificaz/i.test(f.name) ? 'cu' : /proroga|trasform/i.test(f.name) ? 'proroga' : /dimiss|cessaz|licenz/i.test(f.name) ? 'cessazione' : /contratt|assunz/i.test(f.name) || !j.documenti.length ? 'contratto' : 'altro';
    j.documenti.push({ id: uid(), fileId: fid, nome: f.name.replace(/\.[a-z0-9]+$/i, ''), categoria: cat, data: todayISO() });
  }
  save(); render(); toast(files.length === 1 ? 'Documento caricato: lo leggo…' : `${files.length} documenti caricati`);
  const f0 = files[0]; if (files.length === 1 && (f0.type === 'application/pdf' || /\.pdf$/i.test(f0.name) || f0.type.startsWith('image/'))) proponiAggiornamento(j, f0, j.documenti[j.documenti.length - 1]);
}
function docMenu(jobId, docId) {
  const j = job(jobId); const d = (j.documenti || []).find((x) => x.id === docId); if (!d) return;
  const sh = openSheet(`<h3>Documento</h3><form><label class="field"><span>Nome</span><input class="inp" name="nome" value="${esc(d.nome)}"></label>
  <div class="fgrid"><label class="field"><span>Tipo</span><select class="inp" name="categoria">${Object.entries(CAT_DOC).map(([k, v]) => `<option value="${k}" ${d.categoria === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label><label class="field"><span>Data</span><input class="inp" type="date" name="data" value="${d.data || ''}"></label></div>
  <div class="btns"><button type="button" class="btn danger" data-x="del">${ic.trash} Elimina</button><button class="btn" type="submit">Salva</button></div></form>`);
  $('form', sh).addEventListener('submit', (e) => { e.preventDefault(); const fd = new FormData(e.target); d.nome = fd.get('nome'); d.categoria = fd.get('categoria'); d.data = fd.get('data'); save(); closeSheet(); render(); });
  sh.addEventListener('click', async (e) => { if (!e.target.closest('[data-x="del"]')) return; closeSheet(); if (await ask('Eliminare il documento?', `"${d.nome}" verrà rimosso da questo dispositivo.`, 'Elimina')) { j.documenti = j.documenti.filter((x) => x.id !== docId); fileDel(d.fileId); save(); render(); toast('Documento eliminato'); } });
}

/* ---- Turni ---- */
let turniYM = curYM(); let turniJob = null;
function viewTurni() {
  if (!S.lavori.length) return topbar('Turni', '') + vuoto(ic.cal, 'Prima aggiungi un lavoro', 'I turni servono per calcolare ore supplementari, domeniche, festivi e la prossima busta.', `<button class="btn block" data-act="job-new">${ic.plus} Aggiungi lavoro</button>`);
  const j = job(turniJob) || attivo(); turniJob = j.id;
  const T = S.turni[j.id] || {}; const [y, m] = turniYM.split('-').map(Number); const fest = E.festivita(y, S.profilo.patrono);
  let h = topbar('Turni', esc(j.azienda), `<button class="iconbtn" data-act="modelli" aria-label="Modelli di turno">${ic.clock}</button>`);
  if (S.lavori.length > 1) h += `<div class="chips">${S.lavori.map((x) => `<button class="chip ${x.id === j.id ? 'on' : ''}" data-act="turni-job" data-id="${x.id}">${esc(x.azienda)}</button>`).join('')}</div>`;
  h += cardTimbro();
  h += `<div class="card"><div class="row between" style="margin-bottom:12px"><button class="iconbtn" data-act="turni-mese" data-d="-1" aria-label="Mese precedente">${ic.back}</button><h2 style="margin:0">${cap(MESI[m - 1])} ${y}</h2><button class="iconbtn" data-act="turni-mese" data-d="1" aria-label="Mese successivo" style="transform:scaleX(-1)">${ic.back}</button></div><div class="cal">`;
  ['L', 'M', 'M', 'G', 'V', 'S', 'D'].forEach((d) => (h += `<div class="h">${d}</div>`));
  const off = (new Date(y, m - 1, 1).getDay() + 6) % 7; const dim = new Date(y, m, 0).getDate(); const start = new Date(y, m - 1, 1 - off); const oggi = todayISO();
  for (let i = 0; i < Math.ceil((off + dim) / 7) * 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i); const k = E.iso(d); const g = T[k];
    let tag = ''; if (g) tag = g.tipo === 'turno' ? `<span class="tag turno">${num(E.durataTurno(g).ore)}h</span>` : `<span class="tag ${g.tipo}">${{ ferie: 'Ferie', permesso: 'Perm.', malattia: 'Mal.', assenza: 'Ass.' }[g.tipo]}</span>`;
    h += `<button class="day ${d.getMonth() !== m - 1 ? 'out' : ''} ${k === oggi ? 'today' : ''} ${fest[k] || d.getDay() === 0 ? 'fest' : ''}" data-act="giorno" data-d="${k}" aria-label="${d.getDate()} ${MESI[d.getMonth()]}${fest[k] ? ', ' + fest[k] : ''}"><span class="n">${d.getDate()}</span>${tag}</button>`;
  }
  h += `</div><div class="legend"><span><i style="background:var(--blue)"></i>Turno</span><span><i style="background:var(--ok)"></i>Ferie</span><span><i style="background:var(--accent)"></i>Permesso</span><span><i style="background:var(--bad)"></i>Malattia</span><span style="color:var(--bad)">Rosso = domenica o festivo</span></div>
    <div class="btns" style="margin-top:12px"><button class="btn sm ghost" data-act="import-turni">${ic.import} Importa planning</button><button class="btn sm ghost" data-act="giorno" data-d="${oggi}">${ic.plus} Turno di oggi</button></div></div>`;
  const cl = E.classificaMese(T, turniYM, jCalc(j), S.profilo.patrono);
  const tot = cl.ordinarie + cl.supplementari + cl.straord15 + cl.straord20 + cl.festive;
  const festMese = Object.entries(fest).filter(([k]) => k.startsWith(turniYM));
  h += `<div class="card"><h2>Riepilogo di ${MESI[m - 1]}</h2>
    <div class="grid3" style="margin-bottom:10px"><div><div class="kicker">Ore</div><div class="title" style="font-size:24px;font-weight:700">${num(tot)}</div></div><div><div class="kicker">Turni</div><div class="title" style="font-size:24px;font-weight:700">${cl.turni}</div></div><div><div class="kicker">Extra ${info('supplementare')}</div><div class="title" style="font-size:24px;font-weight:700;color:var(--accent)">${num(cl.supplementari + cl.straord15 + cl.straord20)}</div></div></div>
    ${[['Ore ordinarie', cl.ordinarie], ['Supplementari (part-time)', cl.supplementari], ['Straordinari', cl.straord15 + cl.straord20], ['Domenicali', cl.domenicali], ['Festive', cl.festive], ['Notturne (22–6)', cl.notturne]].filter((r) => r[1] > 0).map(([k, v]) => `<div class="kv"><span class="k">${k}</span><span class="v">${num(v)} h</span></div>`).join('')}
    ${cl.ferieGiorni ? `<div class="kv"><span class="k">Ferie</span><span class="v">${cl.ferieGiorni} gg</span></div>` : ''}${cl.permessiOre ? `<div class="kv"><span class="k">Permessi</span><span class="v">${num(cl.permessiOre)} h</span></div>` : ''}${cl.malattiaGiorni ? `<div class="kv"><span class="k">Malattia</span><span class="v">${cl.malattiaGiorni} gg</span></div>` : ''}
    ${festMese.length ? `<p class="note">Festività del mese: ${festMese.map(([k, n]) => `${Number(k.slice(8))} (${n})`).join(', ')}.</p>` : ''}
    ${!tot && !cl.ferieGiorni ? '<p class="small muted" style="margin:0">Tocca un giorno per segnare turno, ferie, permesso o malattia, oppure importa il planning.</p>' : ''}</div>`;
  const payYM = S.profilo.variabiliMeseSucc ? addYM(turniYM, 1) : turniYM; const st = stima(j, payYM);
  if (st && tot) h += `<div class="card"><h2><span class="grow">Busta di ${meseDi(payYM)}</span><span class="badge a">stima</span></h2><div class="big" style="font-size:34px">${eur(st.res.netto)}</div><div class="muted small">lordo ${eur(st.res.lordo)}${st.v ? ` · di cui variabili ${eur(st.v.totale)}` : ''}</div><button class="btn sm ghost" style="margin-top:12px" data-act="dettaglio-stima" data-ym="${payYM}" data-job="${j.id}">Come ci arrivo</button>${S.profilo.variabiliMeseSucc ? '<p class="note">Le ore di questo mese vengono pagate nella busta del mese dopo.</p>' : ''}</div>`;
  const sd = saldi(j);
  if (sd) h += `<div class="card"><h2>Ferie e permessi</h2><div class="kv"><span class="k">Ferie residue oggi ${info('ferie')}</span><span class="v">${num(sd.ferie, 2)} gg</span></div><div class="kv"><span class="k">Permessi residui oggi ${info('permessi')}</span><span class="v">${num(sd.permessi, 1)} h</span></div><div class="kv"><span class="k">Maturano all'anno</span><span class="v">${sd.annui.ferieGiorni} gg · ${num(sd.annui.rolOre + sd.annui.exFestOre, 1)} h</span></div>${sd.annui.rolOre === 0 ? '<p class="note">Nei primi 2 anni maturano solo le ore di ex festività (in proporzione all’orario).</p>' : ''}</div>`;
  return h;
}
function giornoSheet(k, pre = null, onDone = null) {
  const j = job(turniJob) || attivo(); const T = (S.turni[j.id] = S.turni[j.id] || {});
  const g = Object.assign({ tipo: 'turno', inizio: '09:00', fine: '14:00', pausa: 0 }, T[k] || {}, pre || {});
  const d = new Date(k + 'T12:00:00'); const fest = E.festivita(d.getFullYear(), S.profilo.patrono)[k];
  const oreGiorno = E.contratto(j, k.slice(0, 7)).oreSett / (Number(j.giorniSett) || 5);
  const h = `<h3>${cap(d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }))}</h3><p class="lead">${fest ? `<span class="badge bad">${esc(fest)}</span> ` : d.getDay() === 0 ? '<span class="badge bad">Domenica</span> ' : ''}${esc(j.azienda)}</p>
  <div class="seg" id="segT">${[['turno', 'Turno'], ['ferie', 'Ferie'], ['permesso', 'Permesso'], ['malattia', 'Malattia'], ['assenza', 'Assenza']].map(([v, l]) => `<button type="button" data-t="${v}" class="${g.tipo === v ? 'on' : ''}">${l}</button>`).join('')}</div>
  <form><div data-p="turno"><div class="chips" style="margin-bottom:10px">${S.modelli.map((mo) => `<button type="button" class="chip" data-m="${mo.id}">${esc(mo.nome)} ${mo.inizio}–${mo.fine}</button>`).join('')}</div>
  <div class="grid3"><label class="field"><span>Inizio</span><input class="inp" type="time" name="inizio" value="${g.inizio}"></label><label class="field"><span>Fine</span><input class="inp" type="time" name="fine" value="${g.fine}"></label><label class="field"><span>Pausa (min)</span><input class="inp" inputmode="numeric" name="pausa" value="${g.pausa || 0}"></label></div>
  <p class="small muted" id="durata" style="margin:-2px 0 10px"></p></div>
  <div data-p="permesso"><label class="field"><span>Ore di permesso</span><input class="inp" inputmode="decimal" name="orePerm" value="${fmtIn(g.tipo === 'permesso' && g.ore ? g.ore : oreGiorno)}"></label></div>
  <div data-p="assenza"><label class="field"><span>Ore di assenza non retribuita</span><input class="inp" inputmode="decimal" name="oreAss" value="${fmtIn(g.tipo === 'assenza' && g.ore ? g.ore : oreGiorno)}"></label></div>
  <div data-p="malattia"><p class="small muted">Nel Commercio i giorni dal 4° al 20° sono pagati al 75%: li conto da solo se segni più giorni di fila.</p></div>
  <label class="check"><input type="checkbox" name="ripeti"><span class="switch"></span><span class="grow">Ripeti ogni ${d.toLocaleDateString('it-IT', { weekday: 'long' })} fino a fine mese</span></label>
  <div class="btns" style="margin-top:10px">${T[k] ? `<button type="button" class="btn danger" data-x="del" aria-label="Elimina">${ic.trash}</button>` : ''}<button type="button" class="btn ghost" data-x="cancel">Annulla</button><button class="btn" type="submit">Salva</button></div></form>`;
  const sh = openSheet(h); const form = $('form', sh); let tipo = g.tipo;
  const dur = () => { const du = E.durataTurno({ inizio: form.inizio.value, fine: form.fine.value, pausa: form.pausa.value }); $('#durata', sh).textContent = `${num(du.ore, 2)} ore${du.oreNotte ? `, di cui ${num(du.oreNotte, 2)} notturne` : ''}`; };
  const sync = () => { $$('[data-p]', sh).forEach((p) => (p.style.display = p.dataset.p === tipo ? '' : 'none')); $$('#segT button', sh).forEach((b) => b.classList.toggle('on', b.dataset.t === tipo)); dur(); };
  ['inizio', 'fine', 'pausa'].forEach((n) => form[n].addEventListener('input', dur)); sync();
  sh.addEventListener('click', (e) => {
    const t = e.target.closest('[data-t]'); if (t) { tipo = t.dataset.t; sync(); }
    const mo = e.target.closest('[data-m]'); if (mo) { const M = S.modelli.find((x) => x.id === mo.dataset.m); form.inizio.value = M.inizio; form.fine.value = M.fine; form.pausa.value = M.pausa; dur(); }
    if (e.target.closest('[data-x="cancel"]')) closeSheet();
    if (e.target.closest('[data-x="del"]')) { delete T[k]; segnaEliminato(`T|${j.id}|${k}|${Date.now()}`); save(); closeSheet(); render(); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault(); let rec = { tipo };
    if (tipo === 'turno') rec = { tipo, inizio: form.inizio.value, fine: form.fine.value, pausa: toNum(form.pausa.value) || 0 };
    if (tipo === 'permesso') rec.ore = toNum(form.orePerm.value) || oreGiorno;
    if (tipo === 'assenza') rec.ore = toNum(form.oreAss.value) || oreGiorno;
    if (tipo === 'turno' && E.durataTurno(rec).ore <= 0) { toast('Controlla gli orari del turno'); return; }
    rec.u = Date.now(); T[k] = rec;
    if (form.ripeti.checked) { let dd = k; for (;;) { dd = addDays(dd, 7); if (!dd.startsWith(k.slice(0, 7))) break; T[dd] = Object.assign({}, rec); } }
    save(); closeSheet(); if (onDone) onDone(); render();
  });
}
function importaTurni(fileIn) {
  const j = job(turniJob) || attivo(); if (!j) return;
  const sh = openSheet(`<h3>Importa il planning</h3><p class="lead">Da una foto o PDF dei turni, da un calendario (.ics) o incollando il testo. Prima di salvare ti mostro cosa ho trovato.</p>
    <div class="btns" style="margin-bottom:12px"><button class="btn" data-x="file">${ic.upload} Foto, PDF o .ics</button></div>
    <label class="field"><span>Oppure incolla il testo</span><textarea class="inp" id="impTxt" placeholder="es.&#10;lun 10 9-14&#10;mar 11 15:00-20:00&#10;13/11 10-19"></textarea><span class="hint">Una riga per giorno, con data e orario. Mese di riferimento: ${meseDi(turniYM)} ${turniYM.slice(0, 4)}.</span></label>
    <button class="btn ghost block" data-x="testo">Analizza il testo</button><div id="impRes"></div>`);
  const mostra = (lista) => {
    const box = $('#impRes', sh);
    if (!lista.length) { box.innerHTML = '<p class="banner" style="margin-top:12px">Non ho trovato turni con data e orario. Prova a incollare il testo riga per riga.</p>'; return; }
    box.innerHTML = `<div class="sec-title">Trovati ${lista.length} turni</div><div class="list">${lista.map((t, i) => `<label class="li static check" style="padding:8px 0"><input type="checkbox" checked data-i="${i}"><span class="switch"></span><span class="grow"><b>${cap(new Date(t.data + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }))}</b> · ${t.inizio}–${t.fine}${t.nota ? ` <span class="muted small">${esc(t.nota)}</span>` : ''}${(S.turni[j.id] || {})[t.data] ? ' <span class="badge warn">sostituisce</span>' : ''}</span></label>`).join('')}</div><label class="field" style="margin-top:10px"><span>Pausa per ogni turno (min)</span><input class="inp" id="impPausa" inputmode="numeric" value="0"></label><button class="btn block" data-x="salva">Aggiungi ai turni di ${esc(j.azienda)}</button>`;
    box.dataset.lista = JSON.stringify(lista);
  };
  const daFile = async (f) => {
    $('#impRes', sh).innerHTML = '<p style="text-align:center;padding:14px"><span class="spin"></span></p>';
    try { const t = await leggiFile(f); $('#impTxt', sh).value = /BEGIN:VEVENT/.test(t) ? '' : t; mostra(parsePlanning(t, turniYM)); }
    catch (err) { $('#impRes', sh).innerHTML = '<p class="banner" style="margin-top:12px">Non riesco a leggere il file qui. Incolla il testo dei turni.</p>'; }
  };
  if (fileIn) daFile(fileIn);
  sh.addEventListener('click', async (e) => {
    const x = e.target.closest('[data-x]'); if (!x) return;
    if (x.dataset.x === 'testo') mostra(parsePlanning($('#impTxt', sh).value, turniYM));
    if (x.dataset.x === 'file') {
      const f = (await pickFile('application/pdf,image/*,.ics,text/calendar,text/plain'))[0]; if (!f) return; daFile(f);
    }
    if (x.dataset.x === 'salva') {
      const lista = JSON.parse($('#impRes', sh).dataset.lista || '[]'); const pausa = toNum($('#impPausa', sh).value) || 0; const T = (S.turni[j.id] = S.turni[j.id] || {}); let n = 0;
      $$('#impRes input[data-i]', sh).forEach((c) => { if (!c.checked) return; const t = lista[Number(c.dataset.i)]; T[t.data] = { tipo: 'turno', inizio: t.inizio, fine: t.fine, pausa, u: Date.now() }; n++; });
      save(); closeSheet(); render(); toast(`${n} turni aggiunti`);
    }
  });
}
function modelliSheet() {
  const sh = openSheet(`<h3>Modelli di turno</h3><p class="lead">I turni che fai più spesso, da inserire con un tocco.</p><form>${S.modelli.map((m, i) => `<div class="card" style="padding:12px;margin-bottom:10px"><div class="row"><input class="inp" name="nome${i}" value="${esc(m.nome)}" style="flex:1" aria-label="Nome"><button type="button" class="iconbtn" data-del="${i}" aria-label="Elimina">${ic.trash}</button></div><div class="grid3" style="margin-top:8px"><input class="inp" type="time" name="ini${i}" value="${m.inizio}" aria-label="Inizio"><input class="inp" type="time" name="fin${i}" value="${m.fine}" aria-label="Fine"><input class="inp" inputmode="numeric" name="pau${i}" value="${m.pausa}" aria-label="Pausa minuti"></div></div>`).join('')}
  <button type="button" class="btn ghost block" data-x="add">${ic.plus} Aggiungi modello</button><div class="btns" style="margin-top:12px"><button type="button" class="btn ghost" data-x="cancel">Chiudi</button><button class="btn" type="submit">Salva</button></div></form>`);
  const form = $('form', sh);
  const collect = () => S.modelli.forEach((m, i) => { m.nome = form['nome' + i].value; m.inizio = form['ini' + i].value; m.fine = form['fin' + i].value; m.pausa = toNum(form['pau' + i].value) || 0; });
  sh.addEventListener('click', (e) => {
    if (e.target.closest('[data-x="cancel"]')) closeSheet();
    if (e.target.closest('[data-x="add"]')) { collect(); S.modelli.push({ id: uid(), nome: 'Nuovo turno', inizio: '09:00', fine: '13:00', pausa: 0 }); closeSheet(); setTimeout(modelliSheet, 230); }
    const d = e.target.closest('[data-del]'); if (d) { collect(); S.modelli.splice(Number(d.dataset.del), 1); closeSheet(); setTimeout(modelliSheet, 230); }
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); collect(); save(); closeSheet(); toast('Modelli salvati'); });
}

/* ---- Calcola ---- */
let calc = { modo: 'ccnl', ccnl: 'commercio', livello: '4', ore: 40, superminimo: 0, scatti: 0, lordo: '', periodo: 'annuo', mensilita: 14, mesi: 12, td: false, magg15: 0 };
let calcInit = false;
function viewCalcola() {
  const j = attivo();
  if (!calcInit && j && j.ccnl !== 'altro' && j.tipo !== 'chiamata') { calc.ccnl = j.ccnl || 'commercio'; calc.livello = String(j.livello || '4'); calc.ore = j.oreSett || 40; calc.superminimo = j.superminimo || 0; calc.scatti = j.scatti || 0; calc.td = isTD(j); }
  calcInit = true;
  if (!livelliDi(calc.ccnl).some((l) => l[0] === calc.livello)) calc.livello = (livelliDi(calc.ccnl).find((l) => l[0] === '4') || livelliDi(calc.ccnl)[0])[0];
  let h = topbar('Calcola netto', 'Quanto resta in tasca, regole 2026', '', '#home');
  h += `<div class="seg"><button data-act="calc-modo" data-m="ccnl" class="${calc.modo === 'ccnl' ? 'on' : ''}">Dal contratto</button><button data-act="calc-modo" data-m="lordo" class="${calc.modo === 'lordo' ? 'on' : ''}">Da un lordo</button></div>`;
  h += `<form class="card" id="calcForm">`;
  if (calc.modo === 'ccnl') {
    h += `<label class="field"><span>Contratto</span><select class="inp" name="ccnl">${['commercio', 'turismo', 'pubblici', 'multiservizi'].map((k) => `<option value="${k}" ${calc.ccnl === k ? 'selected' : ''}>${CCNL_NOMI[k]}</option>`).join('')}</select></label>
    <label class="field"><span>Livello</span><select class="inp" name="livello">${livelliDi(calc.ccnl).map(([k, l, v]) => `<option value="${k}" ${calc.livello === k ? 'selected' : ''}>${l} · ${eur(v)}</option>`).join('')}</select></label>
    <div class="fgrid"><label class="field"><span>Ore a settimana</span><input class="inp" inputmode="decimal" name="ore" value="${fmtIn(calc.ore)}"></label><label class="field"><span>Superminimo €/mese</span><input class="inp" inputmode="decimal" name="superminimo" value="${fmtIn(calc.superminimo)}"></label></div>
    <div class="fgrid"><label class="field"><span>Scatti di anzianità</span><input class="inp" inputmode="numeric" name="scatti" value="${calc.scatti}"></label><label class="field"><span>Mesi lavorati nell'anno</span><input class="inp" inputmode="numeric" name="mesi" value="${calc.mesi}"></label></div>`;
  } else {
    h += `<div class="fgrid"><label class="field"><span>Lordo</span><input class="inp" inputmode="decimal" name="lordo" value="${fmtIn(calc.lordo)}" placeholder="€"></label><label class="field"><span>È un importo</span><select class="inp" name="periodo"><option value="annuo" ${calc.periodo === 'annuo' ? 'selected' : ''}>annuo (RAL)</option><option value="mensile" ${calc.periodo === 'mensile' ? 'selected' : ''}>mensile</option></select></label></div>
    <div class="fgrid"><label class="field"><span>Mensilità</span><select class="inp" name="mensilita">${[12, 13, 14].map((m) => `<option ${calc.mensilita === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label><label class="field"><span>Mesi lavorati nell'anno</span><input class="inp" inputmode="numeric" name="mesi" value="${calc.mesi}"></label></div>`;
  }
  h += `<label class="field"><span>Maggiorazioni festivi/notturni previste nell'anno</span><input class="inp" inputmode="decimal" name="magg15" value="${fmtIn(calc.magg15)}" placeholder="€ (facoltativo)"><span class="hint">Tassate al 15% fino a 1.500 €</span></label>
  <label class="check"><input type="checkbox" name="td" ${calc.td ? 'checked' : ''}><span class="switch"></span><span class="grow">Contratto a tempo determinato</span></label></form>`;
  const P = S.profilo; const cr = Number(P.contribRate) || 9.19;
  let lordoAnnuo, mensile, mens, aum5 = 0, infoTxt = '';
  const mesi = Math.min(12, Math.max(1, Number(calc.mesi) || 12));
  if (calc.modo === 'ccnl') {
    const ym = curYM() >= '2026-11' ? curYM() : '2026-11';
    const c = E.contratto({ ccnl: calc.ccnl, livello: calc.livello, oreSett: calc.ore, oreSettFull: 40, superminimo: calc.superminimo, scatti: calc.scatti }, ym);
    mens = c.mensilita; mensile = c.base; lordoAnnuo = c.base * mens * mesi / 12; aum5 = (c.aumentiRinnovo || 0) * mens * mesi / 12;
    infoTxt = `${livelliDi(calc.ccnl).find((l) => l[0] === calc.livello)[1]}, ${num(calc.ore)} h/sett. (${Math.round(c.p * 100)}%) · ${eur(c.base)} al mese · paga oraria ${eur(c.pagaOraria)}`;
  } else { const L = toNum(calc.lordo) || 0; mens = Number(calc.mensilita) || 13; lordoAnnuo = calc.periodo === 'annuo' ? L * mesi / 12 : L * mens * mesi / 12; mensile = calc.periodo === 'annuo' ? L / mens : L; }
  const red25 = toNum(P.reddito2025);
  const a = E.calcolaAnnuo(Object.assign({}, P, { lordo: lordoAnnuo + (toNum(calc.magg15) || 0), anno: 2026, giorni: Math.round(365 * mesi / 12), td: calc.td, magg15: toNum(calc.magg15) || 0, aum5, reddito2025: red25 == null ? undefined : red25, contribRate: cr }));
  if (lordoAnnuo > 0) {
    const nMens = mens * mesi / 12;
    const segs = [[a.netto, 'var(--ok)', 'Netto'], [a.contributi, 'var(--blue)', 'INPS'], [a.irpefNetta + a.sostitutiva15 + a.sostitutiva5, 'var(--accent)', 'IRPEF'], [a.addRegionale + a.addComunale, 'var(--bad)', 'Addizionali']];
    const tot = segs.reduce((x, s) => x + Math.max(0, s[0]), 0);
    const Rm = E.calcolaMese({ ym: '2026-11', ordinario: mensile, aggiuntiva: 0, Rannuo: a.imponibile, contribRate: cr, td: calc.td, flat5ok: P.flatTax && (red25 == null || red25 <= 33000), aum5: aum5 / (nMens || 1) });
    h += `<div class="card hero fade"><span class="kicker">Netto medio per mensilità ${info('netto')}</span><div class="big">${eur(a.netto / nMens)}</div><div class="muted small">${eur(a.netto)} netti l'anno su ${eur(a.lordo)} lordi · ${num(nMens, 1)} mensilità</div>
    <div class="stack">${segs.filter((s) => s[0] > 0.5).map((s) => `<span style="flex:${s[0] / tot};background:${s[1]}"></span>`).join('')}</div><div class="leg2">${segs.filter((s) => s[0] > 0.5).map((s) => `<span><i style="background:${s[1]}"></i>${s[2]} ${Math.round(s[0] / tot * 100)}%</span>`).join('')}</div>
    <div class="kv" style="margin-top:12px"><span class="k">Busta di un mese normale</span><span class="v">${eur(Rm.netto)}</span></div>${infoTxt ? `<p class="note">${infoTxt}</p>` : ''}</div>`;
    h += `<div class="card"><h2>Da lordo a netto, passo per passo</h2>${[
      ['Lordo annuo', a.lordo, ''], ['− Contributi INPS (' + num(cr, 2) + '%)', -a.contributi, 'neg'], ['= Imponibile fiscale', a.imponibile, ''],
      ['− IRPEF lorda', -a.irpefLorda, 'neg'], ['+ Detrazione lavoro dipendente', a.detrazioneLavoro, 'pos'], ['+ Ulteriore detrazione (cuneo)', a.ulterioreDetrazione, 'pos'],
      ['= IRPEF da pagare', -a.irpefNetta, 'neg'], ['− Imposte sostitutive 5%/15%', -(a.sostitutiva15 + a.sostitutiva5), 'neg'],
      ['− Addizionale regionale', -a.addRegionale, 'neg'], ['− Addizionale comunale', -a.addComunale, 'neg'],
      ['+ Trattamento integrativo', a.trattamentoIntegrativo, 'pos'], ['+ Somma esente cuneo (' + num(a.sommaEsentePct * 100, 1) + '%)', a.sommaEsente, 'pos'],
    ].filter((r) => Math.abs(r[1]) > 0.004).map(([k, v, c]) => `<div class="kv"><span class="k">${k}</span><span class="v ${c}">${eur(v)}</span></div>`).join('')}<div class="kv tot"><span class="k">Netto annuo</span><span class="v">${eur(a.netto)}</span></div>
    <div class="kv"><span class="k">Quanto va via in tutto</span><span class="v">${num(a.aliquotaMedia * 100, 1)}%</span></div></div>`;
    h += `<p class="note">IRPEF 2026 (23/33/43%), detrazioni, taglio del cuneo, trattamento integrativo e addizionali di ${E.REGIONI[P.regione] ? E.REGIONI[P.regione].nome : 'regione impostata'} e comune (${num(P.aliquotaComunale, 2)}%). Le addizionali si pagano l'anno dopo. Nessun familiare a carico.</p>`;
  } else h += `<div class="card"><div class="empty">Scrivi un importo lordo per vedere il netto.</div></div>`;
  return h;
}

/* ---- Guida ---- */
function viewGuida() {
  let h = topbar('Leggere la busta', 'Le voci spiegate semplici', '', '#buste');
  h += `<div class="card hero"><h2>Come si arriva al netto</h2><ol class="steps"><li><b>Lordo</b>: tutto quello che guadagni nel mese.</li><li><b>− Contributi INPS</b> (circa 9%): vanno alla tua pensione.</li><li><b>− IRPEF</b>: le tasse, ridotte dalle detrazioni.</li><li><b>− Addizionali</b> di regione e comune.</li><li><b>+ Bonus fiscali</b> se il reddito è basso.</li><li>= <b>Netto</b>: quello che arriva sul conto.</li></ol></div>`;
  GLOSSARIO.forEach(([sez, L]) => { h += `<div class="card"><h2>${sez}</h2>${L.map((g) => `<details class="gl"><summary>${esc(g[0])}</summary><p>${esc(g[2])}</p></details>`).join('')}</div>`; });
  h += `<div class="card"><h2>Cosa controllare ogni mese</h2>${['Livello e ore indicati in alto corrispondono al contratto.', 'Ore supplementari, domeniche e festivi lavorati compaiono (spesso nel mese dopo).', 'Ferie e permessi residui crescono ogni mese.', 'Contributi INPS circa al 9,19% dell’imponibile.', 'Con redditi bassi compaiono trattamento integrativo e somma esente.', 'Nell’ultima busta di un contratto: TFR, ratei di 13ª e 14ª, ferie e permessi non goduti.'].map((t) => `<div class="chk ok"><div class="dot">${ic.check}</div><div><p style="color:var(--text)">${t}</p></div></div>`).join('')}</div>`;
  return h;
}

/* ---- Benvenuto (configurazione guidata) ---- */
let obStep = 0;
function viewBenvenuto() {
  const P = S.profilo; const dots = `<div class="dots">${[0, 1, 2, 3, 4].map((i) => `<span class="${i === obStep ? 'on' : i < obStep ? 'done' : ''}"></span>`).join('')}</div>`;
  let h = `<div class="ob fade">${dots}`;
  if (obStep === 0) h += `<div class="ob-hero"><img src="icons/icon.svg?v=2" alt="" width="84" height="84"><h1>Benvenuto in Cedolino</h1><p>Ti aiuto a capire e controllare le tue buste paga, in parole semplici.</p></div>
    <div class="card">${[[ic.calc, 'Quanto prendi davvero', 'Calcolo il netto dal tuo contratto e dai turni.'], [ic.check, 'Controllo delle buste', 'Carichi il PDF, ti dico se i conti tornano.'], [ic.bag, 'I tuoi lavori in ordine', 'Contratti, documenti, ferie, TFR e NASpI.']].map(([i, t, p]) => `<div class="chk ok"><div class="dot">${i}</div><div><b>${t}</b><p>${p}</p></div></div>`).join('')}</div>
    <button class="btn block" data-act="ob-next">Iniziamo</button><div class="row" style="justify-content:center;gap:18px;margin-top:10px"><button class="link" data-act="import">Ho un backup</button><button class="link" data-act="ob-skip">Salta</button></div><p class="note" style="text-align:center">I dati restano sul tuo telefono.</p>`;
  if (obStep === 1) h += `<h2 class="ob-t">Come ti chiami?</h2><p class="muted">Lo uso solo per salutarti e per firmare i messaggi all'ufficio paghe.</p>
    <form class="card" id="obForm"><label class="field"><span>Nome</span><input class="inp" name="nome" value="${esc(P.nome)}" autocomplete="given-name"></label><label class="field"><span>Data di nascita (facoltativa)</span><input class="inp" type="date" name="nascita" value="${esc(P.nascita || '')}"><span class="hint">Serve solo per la NASpI: dopo i 55 anni il calo mensile parte più tardi</span></label></form>
    <div class="btns"><button class="btn ghost" data-act="ob-back">Indietro</button><button class="btn" data-act="ob-next">Avanti</button></div>`;
  if (obStep === 2) { const a = attivo();
    h += `<h2 class="ob-t">Il tuo lavoro attuale</h2><p class="muted">Se hai il contratto in PDF o in foto, provo a leggerlo io.</p>
    ${a ? `<div class="card"><div class="row">${jobAvatar(a)}<div class="grow"><b>${esc(a.azienda)}</b><div class="small muted">${esc(livelloLabel(a))} · ${jobPeriodo(a)}</div></div><span class="badge ok">aggiunto</span></div></div>` : ''}
    <div class="card"><button class="action" data-act="ob-job" data-m="pdf"><span class="ic" style="background:var(--accent-soft);color:var(--accent)">${ic.upload}</span><span><b>Carica il contratto</b><small>PDF o foto, compilo io i campi</small></span></button>
    <button class="action" data-act="ob-job" data-m="mano"><span class="ic" style="background:var(--blue-soft);color:var(--blue)">${ic.pen}</span><span><b>Lo inserisco a mano</b><small>Azienda, date, livello, ore</small></span></button></div>
    <p class="note">Potrai aggiungere anche i lavori passati dalla sezione Lavori.</p>
    <div class="btns"><button class="btn ghost" data-act="ob-back">Indietro</button><button class="btn" data-act="ob-next">${a ? 'Avanti' : 'Lo faccio dopo'}</button></div>`; }
  if (obStep === 3) h += `<h2 class="ob-t">Dove vivi?</h2><p class="muted">Regione e comune decidono le addizionali, piccole tasse locali trattenute in busta.</p>
    <form class="card" id="obForm"><label class="field"><span>Regione</span><select class="inp" name="regione">${Object.entries(E.REGIONI).map(([k, v]) => `<option value="${k}" ${P.regione === k ? 'selected' : ''}>${v.nome}</option>`).join('')}</select></label>
    <label class="field"><span>Addizionale del tuo comune (%)</span><input class="inp" inputmode="decimal" name="aliquotaComunale" value="${fmtIn(P.aliquotaComunale)}"><span class="hint">La trovi sul sito del comune. Se non la sai, lascia 0,8</span></label>
    <label class="field"><span>Reddito da lavoro del 2025 (facoltativo)</span><input class="inp" inputmode="decimal" name="reddito2025" value="${fmtIn(P.reddito2025)}" placeholder="€, lo trovi nella CU"><span class="hint">Per sapere se ti spettano le flat tax 2026</span></label></form>
    <div class="btns"><button class="btn ghost" data-act="ob-back">Indietro</button><button class="btn" data-act="ob-next">Avanti</button></div>`;
  if (obStep === 4) h += `<div class="ob-hero"><div class="em big-ok">${ic.check}</div><h1>Tutto pronto${P.nome ? `, ${esc(P.nome)}` : ''}!</h1><p>Ecco da dove partire:</p></div>
    <div class="card"><button class="action" data-act="ob-fine" data-go2="busta-upload"><span class="ic" style="background:var(--accent-soft);color:var(--accent)">${ic.doc}</span><span><b>Carica l'ultima busta paga</b><small>Ti dico subito se i conti tornano</small></span></button>
    <button class="action" data-act="ob-fine" data-go2="#turni"><span class="ic" style="background:var(--ok-soft);color:var(--ok)">${ic.cal}</span><span><b>Segna i turni</b><small>O importa il planning da una foto</small></span></button>
    <button class="action" data-act="ob-fine" data-go2="#lavori"><span class="ic" style="background:var(--blue-soft);color:var(--blue)">${ic.bag}</span><span><b>Aggiungi i lavori passati</b><small>Servono per CV, NASpI e 730</small></span></button></div>
    <button class="btn block" data-act="ob-fine" data-go2="#home">Vai alla Home</button>`;
  return h + '</div>';
}
function obSalva() {
  const f = $('#obForm'); if (!f) return; const fd = new FormData(f); const P = S.profilo;
  if (fd.has('nome')) { P.nome = (fd.get('nome') || '').trim(); P.nascita = fd.get('nascita') || ''; }
  if (fd.has('regione')) { P.regione = fd.get('regione'); P.aliquotaComunale = toNum(fd.get('aliquotaComunale')) ?? 0.8; P.reddito2025 = toNum(fd.get('reddito2025')); }
  save();
}

/* ---- Anno fiscale e CU ---- */
let annoSel = null;
function viewAnno(yArg) {
  const anni = new Set(); S.lavori.forEach((j) => { if (!j.inizio) return; const a = Number(j.inizio.slice(0, 4)), b = Number((j.fine || todayISO()).slice(0, 4)); for (let y = a; y <= Math.min(b, new Date().getFullYear()); y++) anni.add(y); });
  const lista = [...anni].sort((a, b) => b - a);
  const y = Number(yArg) || annoSel || lista[0] || new Date().getFullYear(); annoSel = y;
  let h = topbar('Anno fiscale e 730', 'Tutti i datori di lavoro insieme', '', '#home');
  if (!S.lavori.length) return h + vuoto(ic.euro, 'Aggiungi i tuoi lavori', 'Qui sommo i redditi di tutti i datori di lavoro dell’anno e stimo il conguaglio del 730.');
  h += `<div class="chips">${lista.map((a) => `<a class="chip ${a === y ? 'on' : ''}" href="#anno-${a}">${a}</a>`).join('')}</div>`;
  const A = annoFiscale(y);
  if (!A.righe.length) return h + vuoto(ic.euro, `Nessun lavoro nel ${y}`, 'Scegli un altro anno.');
  const futuro = y >= new Date().getFullYear();
  h += `<div class="card hero"><span class="kicker">${futuro ? 'Previsione' : 'Stima'} 730 per il ${y} ${info('conguaglio')}</span><div class="big" style="color:${A.saldo >= 0 ? 'var(--ok)' : 'var(--bad)'}">${A.saldo >= 0 ? '+' : '−'}${eur(Math.abs(A.saldo))}</div><div class="small muted">${A.saldo >= 0 ? 'Rimborso probabile col 730' : 'Probabile somma da pagare col 730'}${A.righe.length > 1 ? ` · ${A.righe.length} datori di lavoro` : ''}</div>
    ${A.righe.length > 1 ? '<p class="small" style="margin:10px 0 0">Ogni datore ha calcolato le tasse come se fosse il tuo unico lavoro: per questo serve il conguaglio.</p>' : '<p class="small" style="margin:10px 0 0">Con un solo datore di lavoro il conguaglio lo fa già l’azienda a fine anno: di solito il 730 serve solo per le spese da detrarre.</p>'}</div>`;
  h += `<div class="card"><h2>I tuoi redditi del ${y}</h2>${A.righe.map((r) => `<div class="li static">${jobAvatar(r.j, 38)}<div class="grow"><div class="t">${esc(r.j.azienda)}</div><div class="s">${r.fonte.cu ? '<span class="badge ok">da CU</span>' : r.fonte.buste ? `${r.fonte.buste} buste${r.fonte.stime ? ` + ${r.fonte.stime} mesi stimati` : ''}` : 'stimato dal contratto'}</div></div><div style="text-align:right"><div class="amt">${eur0(r.reddito)}</div><div class="s">IRPEF ${eur0(r.irpef)}</div></div></div><div class="row" style="justify-content:flex-end;margin:-4px 0 6px"><button class="link" data-act="cu-add" data-job="${r.j.id}" data-y="${y}">${r.fonte.cu ? 'Modifica CU' : '+ Carica la CU'}</button>${info('cu')}</div>`).join('')}</div>`;
  h += `<div class="card"><h2>Il conto completo</h2>${[
    ['Reddito totale (imponibile)', A.R, ''], ['Giorni di lavoro nell’anno', null, A.giorni + ' gg'], ['IRPEF lorda', -A.lorda, 'neg'], ['Detrazioni lavoro dipendente', A.detr, 'pos'], ['Ulteriore detrazione (cuneo)', A.ulteriore, 'pos'],
    ['IRPEF dovuta sull’anno', -A.dovuta, 'neg'], ['IRPEF già trattenuta in busta', A.trattenuta, 'pos'],
    ['Trattamento integrativo spettante', A.tiDov, 'pos'], ['Trattamento integrativo già ricevuto', -A.tiRic, 'neg'], ['Somma esente spettante', A.esDov, 'pos'], ['Somma esente già ricevuta', -A.esRic, 'neg'],
  ].filter((r) => r[1] == null || Math.abs(r[1]) > 0.5).map(([k, v, c]) => `<div class="kv"><span class="k">${k}</span><span class="v ${v == null ? '' : c}">${v == null ? c : eur(v)}</span></div>`).join('')}
    <div class="kv tot"><span class="k">${A.saldo >= 0 ? 'Rimborso stimato' : 'Da pagare stimato'}</span><span class="v">${eur(Math.abs(A.saldo))}</span></div>
    <p class="note">In più, l'anno dopo si pagano circa ${eur(A.addReg + A.addCom)} di addizionali (regionale ${eur(A.addReg)}, comunale ${eur(A.addCom)}), di solito trattenute in busta o col 730.</p></div>`;
  const cus = S.cu.filter((c) => Number(c.anno) === y);
  if (cus.length) h += `<div class="card"><h2>CU e buste a confronto</h2>${cus.map((c) => { const j = job(c.jobId); const bs = S.buste.filter((b) => b.jobId === c.jobId && b.ym.startsWith(String(y))); const cr = Number(S.profilo.contribRate) || 9.19; const red = bs.reduce((a, b) => a + (b.imponibileFisc ?? Math.max(0, (b.lordo || 0) - (b.contributi ?? (b.lordo || 0) * cr / 100))), 0); const irp = bs.reduce((a, b) => a + (b.irpef || 0), 0);
    return `<div class="sec-title">${j ? esc(j.azienda) : 'Lavoro eliminato'}</div><div class="kv"><span class="k">Reddito: CU / buste (${bs.length})</span><span class="v">${eur0(c.reddito)} / ${eur0(red)}</span></div><div class="kv"><span class="k">IRPEF: CU / buste</span><span class="v">${eur0(c.irpef)} / ${eur0(irp)}</span></div>${bs.length >= 10 && Math.abs((c.reddito || 0) - red) > 50 ? `<div class="chk warn"><div class="dot">${ic.alert}</div><div><b>La CU non torna con le buste</b><p>Differenza di ${eur(Math.abs((c.reddito || 0) - red))}: mancano buste in archivio oppure c’è un errore. Vale la pena chiedere.</p></div></div>` : bs.length < 10 ? `<p class="note">Carica tutte le buste del ${y} per un confronto completo.</p>` : `<div class="chk ok"><div class="dot">${ic.check}</div><div><b>CU coerente con le buste</b></div></div>`}`; }).join('')}</div>`;
  h += `<div class="btns"><button class="btn" data-act="pdf-anno" data-y="${y}">${ic.download} Riepilogo PDF</button><button class="btn ghost" data-act="cu-add" data-y="${y}">${ic.upload} Carica una CU</button></div>`;
  h += `<p class="note">Stima per orientarti: non considera spese detraibili, familiari a carico o altri redditi. Per il 730 vero rivolgiti a un CAF o usa la precompilata.</p>`;
  return h;
}
function cuForm(pref = {}, found = {}, fileRec = null) {
  const c = Object.assign({ anno: annoSel || new Date().getFullYear() - 1, jobId: (attivo() || {}).id }, pref);
  const inp = (k, l, h = '') => `<label class="field"><span>${l}${found[k] != null ? ' <span class="badge ok">letto</span>' : ''}</span><input class="inp ${found[k] != null ? 'found' : ''}" inputmode="decimal" name="${k}" value="${fmtIn(c[k])}" placeholder="€">${h ? `<span class="hint">${h}</span>` : ''}</label>`;
  const sh = openSheet(`<h3>Certificazione Unica</h3><p class="lead">${fileRec ? 'Controlla i valori letti dalla CU.' : 'Inserisci i valori principali della CU (li trovi nei punti indicati).'}</p><form>
    <div class="fgrid"><label class="field"><span>Lavoro</span><select class="inp" name="jobId">${S.lavori.map((j) => `<option value="${j.id}" ${j.id === c.jobId ? 'selected' : ''}>${esc(j.azienda)}</option>`).join('')}</select></label><label class="field"><span>Anno dei redditi</span><input class="inp" inputmode="numeric" name="anno" value="${c.anno}"></label></div>
    <div class="fgrid">${inp('reddito', 'Reddito lavoro dip.', 'Punto 1')}${inp('irpef', 'Ritenute IRPEF', 'Punto 21')}</div>
    <div class="fgrid">${inp('addReg', 'Addiz. regionale', 'Punto 22')}${inp('addCom', 'Addiz. comunale', 'Punti 26–29')}</div>
    <div class="fgrid">${inp('ti', 'Tratt. integrativo', 'Punto 392')}${inp('esente', 'Somma esente cuneo', 'Sezione cuneo')}</div>
    <label class="field"><span>Giorni di lavoro</span><input class="inp" inputmode="numeric" name="giorni" value="${c.giorni || ''}" placeholder="Punto 6"></label>
    <div class="btns">${pref.id ? `<button type="button" class="btn danger" data-x="del" aria-label="Elimina">${ic.trash}</button>` : ''}<button type="button" class="btn ghost" data-x="cancel">Annulla</button><button class="btn" type="submit">Salva</button></div></form>`);
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-x="cancel"]')) closeSheet(); if (e.target.closest('[data-x="del"]')) { S.cu = S.cu.filter((x) => x.id !== pref.id); segnaEliminato(pref.id); save(); closeSheet(); render(); } });
  $('form', sh).addEventListener('submit', (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    const rec = pref.id ? S.cu.find((x) => x.id === pref.id) : { id: uid() };
    rec.jobId = fd.get('jobId'); rec.anno = Number(fd.get('anno')); ['reddito', 'irpef', 'addReg', 'addCom', 'ti', 'esente'].forEach((k) => { rec[k] = toNum(fd.get(k)); }); rec.giorni = toNum(fd.get('giorni'));
    if (fileRec) rec.fileId = fileRec.id;
    S.cu = S.cu.filter((x) => x.id === rec.id || !(x.jobId === rec.jobId && Number(x.anno) === rec.anno));
    if (!pref.id) S.cu.push(rec);
    if (fileRec) { const j = job(rec.jobId); if (j) { j.documenti = j.documenti || []; j.documenti.push({ id: uid(), fileId: fileRec.id, nome: `CU ${rec.anno + 1}`, categoria: 'cu', data: todayISO() }); } }
    save(); closeSheet(); toast('CU salvata'); location.hash = '#anno-' + rec.anno; render();
  });
}
async function caricaCU(jobId, y, fileIn) {
  const esistente = S.cu.find((c) => c.jobId === jobId && Number(c.anno) === Number(y));
  if (fileIn) {
    const id = uid(); await filePut(id, fileIn, { name: fileIn.name, type: fileIn.type });
    let found = {}; try { found = parseCU(await leggiFile(fileIn)); } catch (err) {}
    cuForm(Object.assign({ jobId, anno: Number(y) }, esistente || {}, found), found, { id }); return;
  }
  const sh = openSheet(`<h3>Certificazione Unica</h3><p class="lead">Carica il PDF della CU e leggo io i valori, oppure inseriscili a mano.</p><div class="btns"><button class="btn" data-x="file">${ic.upload} Carica PDF</button><button class="btn ghost" data-x="mano">${ic.pen} A mano</button></div>`);
  sh.addEventListener('click', async (e) => {
    const x = e.target.closest('[data-x]'); if (!x) return;
    if (x.dataset.x === 'mano') { closeSheet(); setTimeout(() => cuForm(Object.assign({ jobId, anno: Number(y) }, esistente || {})), 230); return; }
    const f = (await pickFile('application/pdf,image/*'))[0]; if (!f) return;
    x.innerHTML = '<span class="spin"></span> Leggo…';
    const id = uid(); await filePut(id, f, { name: f.name, type: f.type });
    let found = {}; try { found = parseCU(await leggiFile(f)); } catch (err) {}
    closeSheet(); setTimeout(() => cuForm(Object.assign({ jobId, anno: Number(y) }, esistente || {}, found), found, { id }), 230);
  });
}
async function pdfAnno(y) {
  let jsPDF; try { jsPDF = await jsPDFlib(); } catch (e) { toast('Non riesco a creare il PDF qui: riprova dall’app installata'); return; }
  const A = annoFiscale(y); const P = S.profilo; const doc = new jsPDF({ unit: 'pt', format: 'a4' }); const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(10, 18, 48); doc.rect(0, 0, W, 70, 'F'); doc.setTextColor(255); doc.setFontSize(20); doc.text(`Riepilogo lavoro e buste paga ${y}`, 40, 42);
  doc.setFontSize(10); doc.text(`${P.nome || ''}  ·  generato con Cedolino il ${dateLabel(todayISO())}`, 40, 60); doc.setTextColor(20);
  let yy = 96;
  doc.autoTable({ startY: yy, head: [['Datore di lavoro', 'Periodo', 'Contratto', 'Reddito', 'IRPEF', 'Fonte']], body: A.righe.map((r) => [r.j.azienda, jobPeriodo(r.j), `${TIPI[r.j.tipo] || ''} · ${livelloLabel(r.j)}`, eur(r.reddito), eur(r.irpef), r.fonte.cu ? 'CU' : r.fonte.buste ? `${r.fonte.buste} buste` : 'stima']), styles: { fontSize: 8.5 }, headStyles: { fillColor: [47, 91, 234] } });
  yy = doc.lastAutoTable.finalY + 18;
  const bs = S.buste.filter((b) => b.ym.startsWith(String(y))).sort((a, b) => (a.ym > b.ym ? 1 : -1));
  if (bs.length) { doc.setFontSize(13); doc.text('Buste paga archiviate', 40, yy); doc.autoTable({ startY: yy + 8, head: [['Mese', 'Lavoro', 'Tipo', 'Lordo', 'Contributi', 'IRPEF', 'Netto']], body: bs.map((b) => [ymLabel(b.ym), (job(b.jobId) || {}).azienda || '', b.tipo, eur(b.lordo), eur(b.contributi), eur(b.irpef), eur(b.netto)]), foot: [['Totale', '', '', eur(bs.reduce((a, b) => a + (b.lordo || 0), 0)), eur(bs.reduce((a, b) => a + (b.contributi || 0), 0)), eur(bs.reduce((a, b) => a + (b.irpef || 0), 0)), eur(bs.reduce((a, b) => a + (b.netto || 0), 0))]], styles: { fontSize: 8.5 }, headStyles: { fillColor: [47, 91, 234] }, footStyles: { fillColor: [231, 181, 60], textColor: 20 } }); yy = doc.lastAutoTable.finalY + 18; }
  const ore = []; for (let m = 1; m <= 12; m++) { const ym = `${y}-${pad(m)}`; let o = 0, ex = 0; S.lavori.forEach((j) => { if (!Object.keys(S.turni[j.id] || {}).some((k) => k.startsWith(ym))) return; const cl = E.classificaMese(S.turni[j.id], ym, jCalc(j), P.patrono); o += cl.ordinarie + cl.supplementari + cl.straord15 + cl.straord20 + cl.festive; ex += cl.supplementari + cl.straord15 + cl.straord20; }); if (o) ore.push([cap(MESI[m - 1]), num(o), num(ex)]); }
  if (ore.length) { doc.setFontSize(13); doc.text('Ore lavorate (dai turni)', 40, yy); doc.autoTable({ startY: yy + 8, head: [['Mese', 'Ore totali', 'di cui extra']], body: ore, styles: { fontSize: 8.5 }, headStyles: { fillColor: [47, 91, 234] }, tableWidth: 300 }); yy = doc.lastAutoTable.finalY + 18; }
  doc.setFontSize(13); doc.text('Stima del conguaglio (730)', 40, yy);
  doc.autoTable({ startY: yy + 8, body: [['Reddito totale', eur(A.R)], ['IRPEF dovuta', eur(A.dovuta)], ['IRPEF trattenuta', eur(A.trattenuta)], ['Trattamento integrativo spettante / ricevuto', `${eur(A.tiDov)} / ${eur(A.tiRic)}`], [A.saldo >= 0 ? 'Rimborso stimato' : 'Da pagare stimato', eur(Math.abs(A.saldo))]], styles: { fontSize: 9 }, columnStyles: { 0: { fontStyle: 'bold' } }, tableWidth: 360 });
  yy = doc.lastAutoTable.finalY + 20; doc.setFontSize(8); doc.setTextColor(110); doc.text(doc.splitTextToSize('Stime calcolate con le regole fiscali 2026 a partire dai dati inseriti; non considerano spese detraibili, familiari a carico o altri redditi. Non sostituiscono CAF, consulente del lavoro o sindacato.', W - 80), 40, yy);
  scarica(doc.output('blob'), `cedolino-riepilogo-${y}.pdf`);
}

/* ---- Fine contratto e NASpI ---- */
function viewFine(jobId) {
  let h = topbar('Fine contratto e NASpI', 'Cosa ti spetta e quanto dura', '', '#home');
  if (!S.lavori.length) return h + vuoto(ic.flag, 'Aggiungi un lavoro', 'Qui calcolo liquidazione, TFR e NASpI quando un contratto finisce.');
  const cand = S.lavori.slice().sort((a, b) => (b.fine || '9999').localeCompare(a.fine || '9999'));
  const j = job(jobId) || cand.find((x) => x.fine && x.fine >= todayISO()) || cand.find((x) => x.fine) || attivo();
  h += `<div class="chips">${cand.map((x) => `<a class="chip ${x.id === j.id ? 'on' : ''}" href="#fine-${x.id}">${esc(x.azienda)}</a>`).join('')}</div>`;
  const fine = j.fine || todayISO(); const ym = fine.slice(0, 7);
  const passato = j.fine && j.fine < todayISO();
  if (!j.fine) h += `<div class="banner">Questo contratto non ha una data di fine: calcolo come se finisse oggi. Per un altro scenario imposta la data nel lavoro.</div>`;
  const c = E.contratto(jCalc(j), ym); const [Y, M] = ym.split('-').map(Number);
  const chiamata = j.tipo === 'chiamata';
  const r13 = chiamata ? 0 : c.base * mesiRateo(j, `${Y}-01`, ym) / 12;
  const da14 = M >= 7 ? `${Y}-07` : `${Y - 1}-07`;
  const r14 = chiamata || c.mensilita < 14 ? 0 : c.base * Math.min(12, mesiRateo(j, da14, ym)) / 12;
  const sd = saldi(j, fine);
  const ferieGG = sd ? Math.max(0, sd.ferie) : 0, permH = sd ? Math.max(0, sd.permessi) : 0;
  const ferieE = ferieGG * c.base / 26, permE = permH * c.pagaOraria;
  const tfr = tfrStimato(j, fine); const anni = Math.max(1 / 12, (jobMesi(Object.assign({}, j, { fine })) || 1) / 12);
  const tt = E.tassaTFR(tfr, anni);
  const extra = r13 + r14 + ferieE + permE;
  const cr = Number(S.profilo.contribRate) || 9.19;
  const nettoExtra = extra > 0 ? E.calcolaMese({ ym, ordinario: 0, aggiuntiva: extra, Rannuo: (stima(j, ym) || { Rannuo: 15000 }).Rannuo, contribRate: cr }).netto : 0;
  h += `<div class="card hero"><span class="kicker">${passato ? 'Liquidazione di fine rapporto' : `Se il contratto finisce il ${dateLabel(fine)}`}</span><div class="big">${eur(nettoExtra + tfr - tt.imposta)}</div><div class="small muted">netti stimati, in più rispetto allo stipendio dell'ultimo mese</div></div>`;
  h += `<div class="card"><h2>Cosa ti spetta</h2>${[
    [`Rateo di 13ª (${mesiRateo(j, `${Y}-01`, ym)}/12)`, r13], [`Rateo di 14ª (${Math.min(12, mesiRateo(j, da14, ym))}/12)`, r14],
    [`Ferie non godute (${num(ferieGG, 1)} gg)`, ferieE], [`Permessi non goduti (${num(permH, 1)} h)`, permE],
  ].filter((r) => r[1] > 0.5).map(([k, v]) => `<div class="kv"><span class="k">${k}</span><span class="v">${eur(v)}</span></div>`).join('')}
    <div class="kv tot"><span class="k">Totale lordo · netto stimato</span><span class="v">${eur(extra)} · ${eur(nettoExtra)}</span></div>
    <div class="sec-title">TFR ${info('tfr')}</div>
    <div class="kv"><span class="k">TFR lordo maturato</span><span class="v">${eur(tfr)}</span></div>
    <div class="kv"><span class="k">Tassazione separata (${num(tt.aliquota * 100, 1)}%)</span><span class="v neg">−${eur(tt.imposta)}</span></div>
    <div class="kv tot"><span class="k">TFR netto stimato</span><span class="v">${eur(tfr - tt.imposta)}</span></div>
    <p class="note">Ratei, ferie e permessi arrivano nell'ultima busta; il TFR di solito nella stessa o entro pochi mesi. Se il TFR va a un fondo pensione, non ti viene pagato ora.</p></div>`;
  // NASpI
  const nd = naspiDati(fine); const over55 = S.profilo.nascita && (new Date(fine) - new Date(S.profilo.nascita)) / (365.25 * 864e5) >= 55;
  const N = E.naspi(nd.settimane, nd.retribuzione, over55);
  const motivo = j.motivoFine || (j.fine ? 'scadenza' : null);
  const involontaria = motivo !== 'dimissioni';
  h += `<div class="card"><h2>NASpI ${info('naspi')}</h2>`;
  if (!involontaria) h += `<div class="chk warn"><div class="dot">${ic.alert}</div><div><b>Con le dimissioni volontarie la NASpI non spetta</b><p>Spetta invece per scadenza del contratto, licenziamento, dimissioni per giusta causa o risoluzione consensuale in conciliazione.</p></div></div>`;
  else if (!N.requisito) h += `<div class="chk warn"><div class="dot">${ic.alert}</div><div><b>Servono almeno 13 settimane di contributi</b><p>Negli ultimi 4 anni ne risultano ${nd.settimane}. Aggiungi gli altri lavori del periodo se ne hai avuti.</p></div></div>`;
  else {
    const nettoMese = E.nettoAssimilato(N.importo);
    h += `<div class="grid2" style="margin-bottom:10px"><div><div class="kicker">Al mese (lordo)</div><div class="title" style="font-size:26px;font-weight:700">${eur0(N.importo)}</div><div class="small muted">circa ${eur0(nettoMese)} netti</div></div><div><div class="kicker">Durata</div><div class="title" style="font-size:26px;font-weight:700">${num(N.mesiTot, 1)} mesi</div><div class="small muted">${N.durataSett} settimane</div></div></div>
      <div class="kv"><span class="k">Settimane di contributi (4 anni)</span><span class="v">${nd.settimane}</span></div>
      <div class="kv"><span class="k">Retribuzione media mensile ${info('rmm')}</span><span class="v">${eur(N.rmm)}</span></div>
      <div class="kv"><span class="k">Totale stimato</span><span class="v">${eur(N.totale)}</span></div>
      ${N.mesi.length > 1 ? barChart(N.mesi.map((m) => ({ l: String(m.mese), t: `Mese ${m.mese}`, v: m.importo, c: m.ridotto ? 'var(--accent)' : 'var(--ok)' })), 130) : ''}
      <p class="note">Dal ${over55 ? '8°' : '6°'} mese l'importo scende del 3% al mese (barre gialle). La domanda va fatta all'INPS entro 68 giorni dalla fine del contratto${j.fine ? `, cioè entro il ${dateLabel(addDays(fine, 68))}` : ''}.</p>`;
    if (nd.dett.length > 1) h += `<div class="sec-title">Contributi considerati</div>${nd.dett.map((d) => `<div class="kv"><span class="k">${esc(d.j.azienda)}</span><span class="v">${d.sett} sett. · ${eur0(d.r)}</span></div>`).join('')}`;
  }
  const altro = S.lavori.find((x) => x.id !== j.id && x.tipo !== 'chiamata' && x.inizio <= fine && (!x.fine || x.fine > fine));
  if (altro && involontaria) h += `<p class="note">Attenzione: risulti ancora al lavoro con ${esc(altro.azienda)}. Con un altro contratto in corso la NASpI può non spettare o essere ridotta.</p>`;
  h += `<p class="note">Stime con i valori INPS 2026 (retribuzione di riferimento 1.456,72 €, massimo 1.584,70 €). Contano solo i lavori inseriti in Cedolino: se hai altri contributi, l'importo cambia.</p></div>`;
  if (passato && involontaria) h += `<label class="check card" style="padding:12px 16px"><input type="checkbox" data-act="naspi-fatta" data-id="${j.id}" ${j.naspiFatta ? 'checked' : ''}><span class="switch"></span><span class="grow">Ho già fatto la domanda NASpI</span></label>`;
  return h;
}

/* ---- Statistiche ---- */
function viewStatistiche() {
  let h = topbar('Statistiche', 'Ore, guadagni e paga oraria', '', '#home');
  const fine = curYM(); const mesi = []; for (let i = 11; i >= 0; i--) mesi.push(addYM(fine, -i));
  const P = S.profilo;
  const dati = mesi.map((ym) => {
    let ore = 0, extra = 0; S.lavori.forEach((j) => { if (!Object.keys(S.turni[j.id] || {}).some((k) => k.startsWith(ym))) return; const cl = E.classificaMese(S.turni[j.id], ym, jCalc(j), P.patrono); ore += cl.ordinarie + cl.supplementari + cl.straord15 + cl.straord20 + cl.festive; extra += cl.supplementari + cl.straord15 + cl.straord20; });
    const bs = S.buste.filter((b) => b.ym === ym); const netto = bs.reduce((a, b) => a + (b.netto || 0), 0); const lordo = bs.reduce((a, b) => a + (b.lordo || 0), 0);
    const oreRif = P.variabiliMeseSucc ? null : ore;
    return { ym, ore, extra, netto, lordo, oreRif };
  });
  if (!S.buste.length && !dati.some((d) => d.ore)) return h + vuoto(ic.chart, 'Ancora pochi dati', 'Carica qualche busta e segna i turni: qui vedrai come cambiano ore, guadagni e paga oraria mese per mese.');
  const lab = dati.map((d) => MESI_B[Number(d.ym.slice(5)) - 1]);
  if (dati.some((d) => d.ore)) h += `<div class="card"><h2><span class="grow">Ore lavorate</span><span class="badge a">extra ${num(dati.reduce((a, d) => a + d.extra, 0))} h</span></h2>${barChart(dati.map((d, i) => ({ l: lab[i], t: ymLabel(d.ym), v: d.ore, c: d.extra ? 'var(--accent)' : 'var(--blue)' })), 150, (v) => num(v, 0))}<p class="note">In giallo i mesi con ore supplementari o straordinarie.</p></div>`;
  if (dati.some((d) => d.netto)) h += `<div class="card"><h2>Lordo e netto</h2>${lineChart([{ n: 'Lordo', c: 'var(--blue)', v: dati.map((d) => d.lordo || null) }, { n: 'Netto', c: 'var(--ok)', v: dati.map((d) => d.netto || null) }], lab)}<div class="leg2"><span><i style="background:var(--blue)"></i>Lordo</span><span><i style="background:var(--ok)"></i>Netto</span></div></div>`;
  const ph = dati.map((d, i) => { const oreMese = P.variabiliMeseSucc ? (dati[i - 1] ? dati[i - 1].ore : 0) : d.ore; return d.netto && oreMese ? d.netto / oreMese : null; });
  if (ph.some((x) => x)) h += `<div class="card"><h2>Paga oraria netta</h2>${lineChart([{ n: '€/ora', c: 'var(--accent)', v: ph }], lab)}<p class="note">Netto della busta diviso le ore lavorate nel mese a cui si riferisce.</p></div>`;
  if (S.lavori.length) h += `<div class="card"><h2>I tuoi lavori a confronto</h2><div class="tablewrap"><table class="tbl"><thead><tr><th>Lavoro</th><th>€/ora lordi</th><th>Netto medio</th><th>Durata</th></tr></thead><tbody>${S.lavori.map((j) => { const c = E.contratto(jCalc(j), (j.fine && j.fine < todayISO() ? j.fine : todayISO()).slice(0, 7)); const bs = S.buste.filter((b) => b.jobId === j.id && b.tipo === 'mensile' && b.netto); return `<tr><td><span class="dotc" style="background:${j.colore}"></span>${esc(j.azienda)}</td><td>${eur(c.pagaOraria)}</td><td>${bs.length ? eur0(bs.reduce((a, b) => a + b.netto, 0) / bs.length) : '—'}</td><td>${durataTxt(jobMesi(j))}</td></tr>`; }).join('')}</tbody></table></div></div>`;
  return h;
}

/* ---- Promemoria ---- */
function viewPromemoria() {
  let h = topbar('Promemoria', 'Scadenze e cose da fare', `<button class="iconbtn" data-act="prom-new" aria-label="Nuovo promemoria">${ic.plus}</button>`, '#home');
  const L = promemoria();
  h += L.length ? `<div class="card">${L.map((t) => `<div class="prom">${t.data ? `<div class="pdate"><b>${Number(t.data.slice(8))}</b><span>${MESI_B[Number(t.data.slice(5, 7)) - 1]}</span></div>` : ''}<div class="grow">${todoRow(t)}</div></div>`).join('')}</div>` : vuoto(ic.bell, 'Niente in scadenza', 'Ti avviso qui per fine contratto, NASpI, buste da caricare, permessi da usare, CU e 730.');
  h += `<div class="card"><h2>Ricevere gli avvisi</h2><p class="small muted" style="margin-top:0">Aggiungi le scadenze al calendario del telefono, oppure fatti avvisare quando apri l'app.</p>
    <div class="btns"><button class="btn ghost" data-act="ics">${ic.cal} Aggiungi al calendario</button><button class="btn ghost" data-act="notifiche">${ic.bell} ${S.notifiche ? 'Avvisi attivi' : 'Attiva avvisi'}</button></div></div>`;
  return h;
}
function promForm() {
  const sh = openSheet(`<h3>Nuovo promemoria</h3><form><label class="field"><span>Cosa</span><input class="inp" name="titolo" required placeholder="es. Chiedere il planning di dicembre"></label><label class="field"><span>Quando</span><input class="inp" type="date" name="data" value="${addDays(todayISO(), 1)}" required></label><label class="field"><span>Nota</span><input class="inp" name="nota"></label><div class="btns"><button type="button" class="btn ghost" data-x="cancel">Annulla</button><button class="btn" type="submit">Salva</button></div></form>`);
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-x="cancel"]')) closeSheet(); });
  $('form', sh).addEventListener('submit', (e) => { e.preventDefault(); const fd = new FormData(e.target); S.promemoria.push({ id: uid(), titolo: fd.get('titolo'), data: fd.get('data'), nota: fd.get('nota'), fatto: false }); save(); closeSheet(); render(); toast('Promemoria aggiunto'); });
}
function creaICS() {
  const L = promemoria().filter((t) => t.data && t.data >= todayISO());
  const s = (x) => String(x).replace(/[,;\\]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const ev = L.map((t) => { const d = t.data.replace(/-/g, ''); const d2 = addDays(t.data, 1).replace(/-/g, ''); return `BEGIN:VEVENT\r\nUID:${t.id}@cedolino\r\nDTSTAMP:${stamp}\r\nDTSTART;VALUE=DATE:${d}\r\nDTEND;VALUE=DATE:${d2}\r\nSUMMARY:${s(t.t)}\r\nDESCRIPTION:${s(t.p || '')}\r\nBEGIN:VALARM\r\nTRIGGER:-P1D\r\nACTION:DISPLAY\r\nDESCRIPTION:${s(t.t)}\r\nEND:VALARM\r\nEND:VEVENT`; }).join('\r\n');
  if (!L.length) { toast('Nessuna scadenza futura da aggiungere'); return; }
  scarica(new Blob([`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Cedolino//IT\r\nCALSCALE:GREGORIAN\r\n${ev}\r\nEND:VCALENDAR\r\n`], { type: 'text/calendar' }), 'cedolino-scadenze.ics');
}
async function avvisaSeServe() {
  if (!S.notifiche || !('Notification' in window) || Notification.permission !== 'granted') return;
  const oggi = todayISO(); if (S.notificato === oggi) return;
  const urg = promemoria().filter((t) => t.s === 'warn' || (t.data && t.data <= addDays(oggi, 1)));
  if (!urg.length) return;
  S.notificato = oggi; save({ noSync: true });
  const body = urg.slice(0, 3).map((t) => '• ' + t.t).join('\n');
  try { const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration()); if (reg) reg.showNotification('Cedolino', { body, icon: 'icons/icon-192.png?v=2', tag: 'cedolino-prom' }); else new Notification('Cedolino', { body, icon: 'icons/icon-192.png?v=2' }); } catch (e) {}
}

/* ---- CV ---- */
let cvLang = 'it'; let cvEsclusi = new Set();
function cvTesto(lang) {
  const L = S.lavori.filter((j) => !cvEsclusi.has(j.id)).sort((a, b) => ((b.fine || '9999') + b.inizio).localeCompare((a.fine || '9999') + a.inizio));
  const mese = (iso) => { if (!iso) return ''; const [y, m] = iso.split('-').map(Number); return lang === 'en' ? `${MONTHS_EN[m - 1].slice(0, 3)} ${y}` : `${MESI[m - 1].slice(0, 3)} ${y}`; };
  const ora = lang === 'en' ? 'Present' : 'in corso';
  return L.map((j) => {
    const fin = j.fine && j.fine < todayISO() ? mese(j.fine) : ora;
    const tipo = lang === 'en' ? TIPI_EN[j.tipo] : (TIPI[j.tipo] || '').toLowerCase();
    const part = j.tipo !== 'chiamata' && j.oreSett && j.oreSettFull && j.oreSett < j.oreSettFull ? (lang === 'en' ? 'part-time' : 'part-time') : '';
    const head = `${j.ruolo || (lang === 'en' ? 'Role' : 'Ruolo')} — ${j.azienda}${j.sede ? ', ' + j.sede : ''}`;
    const sub = `${cap(mese(j.inizio))} – ${cap(fin)}${tipo ? ' · ' + tipo : ''}${part ? ' · ' + part : ''}`;
    const bullets = (j.mansioni || '').split('\n').map((x) => x.trim()).filter(Boolean).map((x) => '• ' + x.replace(/^[•\-–]\s*/, '')).join('\n');
    return { j, head, sub, bullets, txt: `${head}\n${sub}${bullets ? '\n' + bullets : ''}` };
  });
}
function viewCV() {
  let h = topbar('Per il CV', 'Le tue esperienze, pronte da copiare', '', '#lavori');
  if (!S.lavori.length) return h + vuoto(ic.user, 'Aggiungi i tuoi lavori', 'Con ruolo, date e mansioni: qui li trasformo nella sezione Esperienze del curriculum.');
  h += `<div class="seg"><button data-act="cv-lang" data-l="it" class="${cvLang === 'it' ? 'on' : ''}">Italiano</button><button data-act="cv-lang" data-l="en" class="${cvLang === 'en' ? 'on' : ''}">English</button></div>`;
  h += `<div class="card"><h2>Quali lavori includere</h2>${S.lavori.map((j) => `<label class="check"><input type="checkbox" data-act="cv-toggle" data-id="${j.id}" ${cvEsclusi.has(j.id) ? '' : 'checked'}><span class="switch"></span><span class="grow">${esc(j.azienda)} <span class="hint">${esc(j.ruolo || 'ruolo da aggiungere')}${j.mansioni ? '' : ' · senza mansioni'}</span></span></label>`).join('')}</div>`;
  const items = cvTesto(cvLang);
  h += `<div class="card cvprev"><h2>${cvLang === 'en' ? 'Work experience' : 'Esperienze di lavoro'}</h2>${items.map((x) => `<div class="cvitem"><b>${esc(x.head)}</b><div class="small muted">${esc(x.sub)}</div>${x.bullets ? `<ul>${x.bullets.split('\n').map((b) => `<li>${esc(b.slice(2))}</li>`).join('')}</ul>` : `<button class="link" data-act="job-edit" data-id="${x.j.id}">+ Aggiungi le mansioni</button>`}</div>`).join('')}</div>`;
  h += `<div class="btns"><button class="btn" data-act="cv-copia">${ic.copy} Copia il testo</button><button class="btn ghost" data-act="cv-pdf">${ic.download} PDF</button></div>`;
  if (cvLang === 'en') h += `<p class="note">Ruoli e mansioni restano come li hai scritti: traducili nella scheda del lavoro se vuoi il CV tutto in inglese.</p>`;
  return h;
}
async function cvPDF() {
  let jsPDF; try { jsPDF = await jsPDFlib(); } catch (e) { toast('Non riesco a creare il PDF qui'); return; }
  const doc = new jsPDF({ unit: 'pt', format: 'a4' }); const W = doc.internal.pageSize.getWidth(); let y = 60;
  doc.setFontSize(18); doc.setTextColor(20); doc.text(cvLang === 'en' ? 'Work experience' : 'Esperienze di lavoro', 50, y); y += 10; doc.setDrawColor(231, 181, 60); doc.setLineWidth(2); doc.line(50, y, 120, y); y += 26;
  for (const x of cvTesto(cvLang)) {
    if (y > 760) { doc.addPage(); y = 60; }
    doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.text(doc.splitTextToSize(x.head, W - 100), 50, y); y += 16;
    doc.setFont(undefined, 'normal'); doc.setFontSize(10); doc.setTextColor(100); doc.text(x.sub, 50, y); y += 14; doc.setTextColor(30);
    x.bullets.split('\n').filter(Boolean).forEach((b) => { const t = doc.splitTextToSize(b, W - 110); doc.text(t, 58, y); y += 13 * t.length; });
    y += 14;
  }
  scarica(doc.output('blob'), cvLang === 'en' ? 'work-experience.pdf' : 'esperienze-lavoro.pdf');
}

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
  return `<div class="card install"><div class="row"><img src="icons/icon-192.png?v=2" alt="" width="44" height="44" style="border-radius:12px"><div class="grow"><b>Installa Cedolino</b><div class="small muted">Si apre come un'app, funziona anche offline e ricevi i PDF dal menu Condividi.</div></div></div>
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
      if (!S.lavori.length && !['busta', 'doc'].includes(k)) { toast('Prima aggiungi il lavoro'); return actions['job-new'](); }
      if (k === 'busta') caricaBusta(fs);
      if (k === 'doc') { const s2 = openSheet(`<h3>Di quale lavoro?</h3><button class="action" data-j="nuovo"><span class="ic" style="background:var(--accent-soft);color:var(--accent)">${ic.plus}</span><span><b>Un lavoro nuovo</b><small>Leggo il contratto e creo il lavoro</small></span></button>${S.lavori.map((j) => `<button class="action" data-j="${j.id}">${jobAvatar(j)}<span><b>${esc(j.azienda)}</b><small>${jobPeriodo(j)}</small></span></button>`).join('')}`); s2.addEventListener('click', (ev) => { const x = ev.target.closest('[data-j]'); if (!x) return; closeSheet(); if (x.dataset.j === 'nuovo') { setTimeout(() => nuovoLavoroDaContratto(fs[0]), 230); return; } location.hash = '#lavoro-' + x.dataset.j; setTimeout(() => addDocs(x.dataset.j, fs), 80); }); }
      if (k === 'cu') caricaCU((attivo() || {}).id, new Date().getFullYear() - 1, fs[0]);
      if (k === 'planning') { location.hash = '#turni'; setTimeout(() => importaTurni(fs[0]), 80); }
    }, 230);
  });
}
if ('launchQueue' in window) { try { window.launchQueue.setConsumer(async (p) => { if (!p.files || !p.files.length) return; const fs = await Promise.all(p.files.map((h) => h.getFile())); const go = () => gestisciCondivisi(fs); if (document.readyState === 'complete' && app.innerHTML) go(); else setTimeout(go, 600); }); } catch (e) {} }

/* ---- Impostazioni ---- */
function viewImpostazioni() {
  const P = S.profilo; const lc = lockCfg();
  let h = topbar('Impostazioni', '', '', '#home');
  h += `<form data-form="profilo">
  <div class="sec-title">Tu</div><div class="card"><div class="fgrid"><label class="field"><span>Nome</span><input class="inp" name="nome" value="${esc(P.nome)}"></label><label class="field"><span>Data di nascita</span><input class="inp" type="date" name="nascita" value="${esc(P.nascita || '')}"></label></div></div>
  <div class="sec-title">Tasse</div><div class="card">
  <label class="field"><span>Regione (addizionale)</span><select class="inp" name="regione">${Object.entries(E.REGIONI).map(([k, v]) => `<option value="${k}" ${P.regione === k ? 'selected' : ''}>${v.nome}</option>`).join('')}</select></label>
  <div data-reg="personalizzata"><label class="field"><span>Aliquota regionale %</span><input class="inp" inputmode="decimal" name="aliquotaRegionale" value="${fmtIn(P.aliquotaRegionale)}"></label></div>
  <div class="fgrid"><label class="field"><span>Addiz. comunale %</span><input class="inp" inputmode="decimal" name="aliquotaComunale" value="${fmtIn(P.aliquotaComunale)}"></label><label class="field"><span>Esenzione fino a €</span><input class="inp" inputmode="decimal" name="esenzioneComunale" value="${fmtIn(P.esenzioneComunale)}"></label></div>
  <div class="fgrid"><label class="field"><span>Contributi INPS %</span><input class="inp" inputmode="decimal" name="contribRate" value="${fmtIn(P.contribRate)}"><span class="hint">9,19% di norma</span></label><label class="field"><span>Reddito lavoro 2025</span><input class="inp" inputmode="decimal" name="reddito2025" value="${fmtIn(P.reddito2025)}" placeholder="€"><span class="hint">Per le flat tax 2026</span></label></div>
  <label class="check"><input type="checkbox" name="flatTax" ${P.flatTax ? 'checked' : ''}><span class="switch"></span><span class="grow">Applica le flat tax 2026 <span class="hint">5% sugli aumenti contrattuali, 15% su festivi e notturni</span></span></label></div>
  <div class="sec-title">Busta e stipendio</div><div class="card">
  <label class="check"><input type="checkbox" name="variabiliMeseSucc" ${P.variabiliMeseSucc ? 'checked' : ''}><span class="switch"></span><span class="grow">Ore extra pagate il mese dopo <span class="hint">Succede in quasi tutti i negozi</span></span></label>
  <div class="fgrid"><label class="field"><span>Giorno dello stipendio</span><input class="inp" inputmode="numeric" name="giornoPaga" value="${P.giornoPaga}"></label><label class="field"><span>Arriva</span><select class="inp" name="pagaMeseSucc"><option value="1" ${P.pagaMeseSucc ? 'selected' : ''}>il mese dopo</option><option value="0" ${!P.pagaMeseSucc ? 'selected' : ''}>nello stesso mese</option></select></label></div>
  <div class="fgrid"><label class="field"><span>Mese della 14ª</span><select class="inp" name="mese14"><option value="6" ${Number(P.mese14) === 6 ? 'selected' : ''}>Giugno</option><option value="7" ${Number(P.mese14) === 7 ? 'selected' : ''}>Luglio</option></select></label><label class="field"><span>Santo patrono (gg-mm)</span><input class="inp" name="patrono" value="${esc(P.patrono ? P.patrono.split('-').reverse().join('-') : '')}" placeholder="es. 04-10"></label></div>
  <label class="field"><span>Ricordami di caricare la busta dal giorno</span><input class="inp" inputmode="numeric" name="giornoBusta" value="${P.giornoBusta}"></label></div>
  <div class="sec-title">Aspetto</div><div class="card">
  <div class="seg" style="margin-bottom:8px">${[['auto', 'Auto'], ['chiaro', 'Chiaro'], ['scuro', 'Notte blu'], ['nero', 'Nero']].map(([v, l]) => `<button type="button" data-act="tema" data-v="${v}" class="${S.tema === v ? 'on' : ''}">${l}</button>`).join('')}</div>
  <label class="check"><input type="checkbox" name="vetro" ${S.vetro ? 'checked' : ''} data-act="vetro"><span class="switch"></span><span class="grow">Effetto vetro</span></label></div>
  <button class="btn block" type="submit">Salva impostazioni</button></form>`;
  h += `<div class="sec-title">Sicurezza</div><div class="card"><div class="row"><div class="ic b icbox">${ic.lock}</div><div class="grow"><b>Blocco con PIN</b><div class="small muted">${lc ? 'Attivo: i dati su questo telefono sono cifrati.' : 'Chiede un PIN all’apertura e cifra i dati sul telefono.'}</div></div></div>
    <div class="btns" style="margin-top:12px">${lc ? `<button class="btn ghost" data-act="pin-set">Cambia PIN</button><button class="btn danger" data-act="pin-del">Togli</button>` : `<button class="btn" data-act="pin-set">${ic.lock} Imposta un PIN</button>`}</div></div>`;
  const ultimo = S.sync.last ? new Date(S.sync.last).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
  h += `<div class="sec-title">Sincronizzazione</div><div class="card"><div class="row"><div class="ic g icbox">${ic.cloud}</div><div class="grow"><b>Su tutti i tuoi dispositivi</b><div class="small muted">${!S.sync.on ? 'Copia cifrata dei dati nel tuo account Google, come in Conto di Casa.' : sbUser ? `Collegato come ${esc(sbUser.email || 'utente')}${ultimo ? ` · ultima: ${ultimo}` : ''}` : 'Attiva: accedi con Google per completare.'}</div></div></div>
    ${syncStato ? `<p class="banner" style="margin:12px 0 0">${esc(syncStato)}</p>` : ''}
    <div class="btns" style="margin-top:12px">${!S.sync.on ? `<button class="btn" data-act="sync-on">${ic.cloud} Attiva</button>` : !sbUser ? `<button class="btn" data-act="sync-login">Accedi con Google</button><button class="btn ghost" data-act="sync-off">Disattiva</button>` : `<button class="btn" data-act="sync-now">Sincronizza ora</button><button class="btn ghost" data-act="sync-logout">Esci</button>`}</div>
    <p class="note">I dati vengono cifrati sul telefono con una frase segreta che conosci solo tu: senza, nessuno può leggerli. I PDF restano sul dispositivo.</p></div>`;
  const nb = S.buste.filter((b) => b.netto).length, inv = S.buste.filter((b) => b.cdc).length;
  h += `<div class="sec-title">Conto di Casa</div><div class="card"><div class="row"><div class="ic a icbox">${ic.link}</div><div class="grow"><b>Stipendio come entrata</b><div class="small muted">Ogni netto finisce in Conto di Casa nel giorno in cui arriva lo stipendio. ${inv ? `${inv} buste già inviate.` : ''}</div></div></div>
    <label class="check"><input type="checkbox" data-act="cdc-auto" ${S.cdc.auto ? 'checked' : ''}><span class="switch"></span><span class="grow">Invia automaticamente ogni nuova busta</span></label>
    ${nb ? `<button class="btn ghost block" data-act="cdc-tutte">${ic.link} Invia tutte le buste (${nb})</button>` : ''}
    <p class="note">Funziona se Conto di Casa è sullo stesso sito (es. le tue app su github.io) oppure se accedi con Google in entrambe.</p></div>`;
  h += `<div class="sec-title">App</div><div class="card"><div class="row"><img src="icons/icon-192.png?v=2" alt="" width="40" height="40" style="border-radius:11px"><div class="grow"><b>${isStandalone() ? 'Cedolino è installata' : 'Cedolino come app'}</b><div class="small muted">${isStandalone() ? 'Funziona offline e ricevi i PDF dal menu Condividi.' : 'Installala per aprirla dalla schermata Home, usarla offline e ricevere i PDF da altre app.'}</div></div></div>
    <div class="btns" style="margin-top:12px">${isStandalone() ? '' : `<button class="btn" data-act="install">${ic.download} Installa</button>`}<button class="btn ghost" data-act="aggiorna">Cerca aggiornamenti</button></div></div>`;
  h += `<div class="sec-title">Dati</div><div class="card"><p class="small muted" style="margin-top:0">Tutto resta sul tuo telefono${S.sync.on ? ' (e nella copia cifrata)' : ''}. Fai un backup ogni tanto.</p>
  <div class="btns"><button class="btn ghost" data-act="export">${ic.download} Esporta backup</button><button class="btn ghost" data-act="import">${ic.upload} Importa</button></div>
  <button class="btn ghost block" style="margin-top:10px" data-go="#benvenuto">Rifai la configurazione guidata</button>
  <button class="btn danger block" style="margin-top:10px" data-act="reset">${ic.trash} Cancella tutti i dati</button></div>
  <p class="note">Cedolino fa stime con le regole 2026 (IRPEF, detrazioni, cuneo fiscale, flat tax, NASpI, CCNL Commercio, Turismo, Pubblici esercizi e Multiservizi). Non sostituisce consulente del lavoro, CAF o sindacato.</p>`;
  return h;
}

/* ============ sincronizzazione (Supabase, cifrata) ============ */
const SB_URL = 'https://nesozulkxioahnqfgqvt.supabase.co', SB_KEY = 'sb_publishable_YZne7hPWdSltL6C-Ffbusg_w5dZAISb';
let sb = null, sbUser = null, syncStato = '', syncBusy = false;
async function sbInit() {
  if (sb) return sb;
  try {
    if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
    sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, storageKey: 'cedolino-auth', detectSessionInUrl: false, flowType: 'pkce' } });
    const qs = new URLSearchParams(location.search);
    if (qs.get('code')) { try { await sb.auth.exchangeCodeForSession(qs.get('code')); } catch (e) {} history.replaceState(null, '', location.pathname + (location.hash || '#impostazioni')); }
    const { data } = await sb.auth.getSession(); sbUser = data.session ? data.session.user : null;
    sb.auth.onAuthStateChange((_e, s) => { const was = sbUser; sbUser = s ? s.user : null; if (sbUser && !was) syncNow(); if (route() === 'impostazioni') render(); });
    return sb;
  } catch (e) { syncStato = 'Il servizio di sincronizzazione non è raggiungibile da qui.'; sb = null; return null; }
}
function mergeStati(L, R) {
  const nuovo = (R.updatedAt || 0) > (L.updatedAt || 0) ? R : L, vecchio = nuovo === R ? L : R;
  const del = new Set([...(L.deleted || []), ...(R.deleted || [])]);
  const out = normalizza(Object.assign({}, vecchio, nuovo));
  const byId = (k) => { const m = new Map(); (vecchio[k] || []).forEach((x) => x && x.id && m.set(x.id, x)); (nuovo[k] || []).forEach((x) => x && x.id && m.set(x.id, x)); return [...m.values()].filter((x) => !del.has(x.id)); };
  ['lavori', 'buste', 'cu', 'promemoria', 'modelli'].forEach((k) => { out[k] = byId(k); });
  const delT = {}; del.forEach((d) => { if (d.startsWith('T|')) { const [, jid, day, ts] = d.split('|'); const k = jid + '|' + day; delT[k] = Math.max(delT[k] || 0, Number(ts) || 0); } });
  out.turni = {};
  new Set([...Object.keys(vecchio.turni || {}), ...Object.keys(nuovo.turni || {})]).forEach((jid) => {
    const a = (vecchio.turni || {})[jid] || {}, b = (nuovo.turni || {})[jid] || {}; const t = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach((d) => { const x = a[d], y = b[d]; const pick = !x ? y : !y ? x : (y.u || 0) >= (x.u || 0) ? y : x; if ((delT[jid + '|' + d] || -1) < (pick.u || 0) || delT[jid + '|' + d] == null) t[d] = pick; });
    out.turni[jid] = t;
  });
  out.deleted = [...del].slice(-3000); out.sync = L.sync; out.notificato = L.notificato; out.timbro = L.timbro; out.updatedAt = Math.max(L.updatedAt || 0, R.updatedAt || 0);
  return out;
}
async function syncNow(silenzioso) {
  if (!S.sync.on || !S.sync.pass || syncBusy) return;
  await sbInit(); if (!sb || !sbUser) return;
  syncBusy = true;
  try {
    const key = await deriveKey(S.sync.pass, TE.encode('cedolino:' + sbUser.id), 120000);
    const { data, error } = await sb.from('cedolino_data').select('data').eq('user_id', sbUser.id).maybeSingle();
    if (error) throw error;
    let remoto = null;
    if (data && data.data && data.data.enc) { try { remoto = await decJSON(data.data, key); } catch (e) { throw new Error('frase'); } }
    const prima = JSON.stringify([S.lavori, S.buste, S.turni, S.cu]);
    if (remoto) S = mergeStati(S, remoto);
    const payload = Object.assign({}, S); delete payload.sync; delete payload.notificato; delete payload.timbro;
    const up = await sb.from('cedolino_data').upsert({ user_id: sbUser.id, data: await encJSON(payload, key), updated_at: new Date().toISOString() });
    if (up.error) throw up.error;
    S.sync.last = Date.now(); syncStato = ''; save({ noSync: true });
    if (prima !== JSON.stringify([S.lavori, S.buste, S.turni, S.cu]) || route() === 'impostazioni') render();
    if (!silenzioso) toast('Sincronizzato');
  } catch (e) { syncStato = e.message === 'frase' ? 'La frase segreta non corrisponde a quella usata sugli altri dispositivi.' : 'Sincronizzazione non riuscita: riprova più tardi.'; if (!silenzioso) toast(syncStato); if (route() === 'impostazioni') render(); }
  syncBusy = false;
}
function syncAttiva() {
  const sh = openSheet(`<h3>Sincronizzazione</h3><p class="lead">Scegli una frase segreta (almeno 8 caratteri). Cifra i tuoi dati prima che lascino il telefono: usa la stessa su ogni dispositivo. Se la dimentichi, la copia online non si può più leggere.</p>
    <form><label class="field"><span>Frase segreta</span><input class="inp" type="password" name="p1" minlength="8" required autocomplete="new-password"></label><label class="field"><span>Ripeti</span><input class="inp" type="password" name="p2" minlength="8" required autocomplete="new-password"></label>
    <div class="btns"><button type="button" class="btn ghost" data-x="cancel">Annulla</button><button class="btn" type="submit">Continua con Google</button></div></form>`);
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-x="cancel"]')) closeSheet(); });
  $('form', sh).addEventListener('submit', async (e) => {
    e.preventDefault(); const f = e.target; if (f.p1.value !== f.p2.value) { toast('Le due frasi non coincidono'); return; }
    S.sync = { on: true, pass: f.p1.value }; save({ noSync: true }); closeSheet(); await syncLogin();
  });
}
async function syncLogin() {
  await sbInit(); if (!sb) { toast(syncStato || 'Servizio non disponibile'); render(); return; }
  if (sbUser) { syncNow(); return; }
  const back = location.origin + location.pathname.replace(/index\.html$/, '');
  const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: back } });
  if (error) { syncStato = 'Accesso non riuscito: ' + error.message; render(); }
}

/* ============ Conto di Casa ============ */
async function inviaCdc(b, silenzioso) {
  if (!b.netto) { if (!silenzioso) toast('Per inviarla serve il netto'); return false; }
  const j = job(b.jobId); const date = dataPaga(b.ym);
  const item = { id: 'ced-' + b.id, date, cat: b.tipo === 'mensile' ? 'stipendio' : 'extra', amount: Math.round(b.netto * 100) / 100, in: true, note: `${b.tipo === 'mensile' ? 'Stipendio' : cap(b.tipo)} ${meseDi(b.ym)} ${b.ym.slice(0, 4)}${j ? ' · ' + j.azienda : ''} (da Cedolino)` };
  const put = (d) => { d = d && typeof d === 'object' ? d : {}; d.months = d.months || {}; Object.keys(d.months).forEach((k) => { d.months[k] = (d.months[k] || []).filter((x) => x.id !== item.id); }); (d.months[date.slice(0, 7)] = d.months[date.slice(0, 7)] || []).push(item); if (Array.isArray(d.deleted)) d.deleted = d.deleted.filter((x) => x !== item.id); if (d.profile && Array.isArray(d.profile.deleted)) d.profile.deleted = d.profile.deleted.filter((x) => x !== item.id); return d; };
  const dove = []; let bloccato = false;
  try { const raw = localStorage.getItem('contodicasa.v1'); if (raw) { const o = JSON.parse(raw); if (o && o.enc) bloccato = true; else { localStorage.setItem('contodicasa.v1', JSON.stringify(put(o))); dove.push('telefono'); } } } catch (e) {}
  try { if (S.sync.on) await sbInit(); if (sb && sbUser) { const { data, error } = await sb.from('conto_di_casa_data').select('data').eq('user_id', sbUser.id).maybeSingle(); if (!error) { const up = await sb.from('conto_di_casa_data').upsert({ user_id: sbUser.id, data: put(data ? data.data : {}), updated_at: new Date().toISOString() }); if (!up.error) dove.push('account'); } } } catch (e) {}
  if (dove.length) { b.cdc = { date, amount: item.amount, at: Date.now() }; save(); if (!silenzioso) toast(`Entrata di ${eur(item.amount)} del ${dateLabel(date)} inviata a Conto di Casa`); return true; }
  if (!silenzioso) {
    const sh = openSheet(`<h3>Non trovo Conto di Casa</h3><p class="lead">${bloccato ? 'Conto di Casa su questo telefono è protetto da PIN, quindi non posso scriverci direttamente.' : 'Su questo browser Conto di Casa non ha ancora dati, oppure è su un altro sito.'}</p><div class="chk info"><div class="dot">${ic.info}</div><div><b>Per collegarle</b><p>Accedi con lo stesso account Google sia in Conto di Casa sia qui (Impostazioni → Sincronizzazione): da quel momento le entrate arrivano ovunque. In alternativa apri Conto di Casa almeno una volta da questo telefono, dallo stesso sito di Cedolino.</p></div></div><button class="btn block" style="margin-top:12px" data-x="ok">Ho capito</button>`);
    sh.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) closeSheet(); });
  }
  return false;
}

/* ============ blocco PIN ============ */
let lockedAt = 0;
function lockScreen(verifica) {
  return new Promise((resolve) => {
    const el = document.createElement('div'); el.className = 'lock';
    el.innerHTML = `<div class="lock-in"><img src="icons/icon.svg?v=2" alt="" width="64" height="64"><h2>Cedolino è bloccato</h2><p class="muted" id="lkMsg">Inserisci il PIN</p><div class="pinDots" id="lkDots"></div><div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((k) => (k === '' ? '<span></span>' : `<button type="button" data-k="${k}" aria-label="${k === '⌫' ? 'Cancella' : k}">${k}</button>`)).join('')}</div><button class="btn block" id="lkOk">Sblocca</button><button class="link" id="lkForgot" style="margin-top:14px">Ho dimenticato il PIN</button></div>`;
    document.body.appendChild(el); let pin = '';
    const dots = () => { $('#lkDots', el).innerHTML = Array.from({ length: Math.max(4, pin.length) }, (_, i) => `<i class="${i < pin.length ? 'on' : ''}"></i>`).join(''); };
    dots();
    const prova = async () => {
      if (pin.length < 4) return; $('#lkMsg', el).textContent = 'Verifico…';
      const ok = await verifica(pin);
      if (ok) { el.remove(); resolve(true); }
      else { pin = ''; dots(); $('#lkMsg', el).textContent = 'PIN sbagliato, riprova'; el.querySelector('.lock-in').classList.add('shake'); setTimeout(() => el.querySelector('.lock-in').classList.remove('shake'), 400); }
    };
    el.addEventListener('click', async (e) => {
      const k = e.target.closest('[data-k]');
      if (k) { const v = k.dataset.k; if (v === '⌫') pin = pin.slice(0, -1); else if (pin.length < 6) pin += v; dots(); if (pin.length === 6) prova(); }
      if (e.target.closest('#lkOk')) prova();
      if (e.target.closest('#lkForgot')) {
        $('#lkMsg', el).innerHTML = 'Senza PIN i dati cifrati su questo telefono non si possono aprire. Puoi cancellarli e, se avevi la sincronizzazione, recuperarli accedendo con Google.';
        e.target.outerHTML = '<button class="btn danger block" id="lkReset" style="margin-top:12px">Cancella i dati di questo telefono</button>';
      }
      if (e.target.closest('#lkReset')) { try { localStorage.removeItem(KEY); localStorage.removeItem(LOCK_KEY); indexedDB.deleteDatabase('cedolino-files'); } catch (err) {} location.hash = '#benvenuto'; location.reload(); }
    });
    document.addEventListener('keydown', function kd(e) { if (!document.body.contains(el)) { document.removeEventListener('keydown', kd); return; } if (/^\d$/.test(e.key) && pin.length < 6) { pin += e.key; dots(); } if (e.key === 'Backspace') { pin = pin.slice(0, -1); dots(); } if (e.key === 'Enter') prova(); });
  });
}
async function verificaPin(pin) {
  const lc = lockCfg(); if (!lc) return true;
  try { const key = await deriveKey(pin, unb64(lc.salt)); await decJSON(lc.check, key); lockKey = key; return true; } catch (e) { return false; }
}
function pinForm() {
  const sh = openSheet(`<h3>${lockCfg() ? 'Nuovo PIN' : 'Imposta un PIN'}</h3><p class="lead">Da 4 a 6 cifre. Lo chiedo quando apri l'app o ci torni dopo un minuto. Se lo dimentichi, i dati su questo telefono non si possono recuperare (salvo backup o sincronizzazione).</p>
    <form><div class="fgrid"><label class="field"><span>PIN</span><input class="inp" type="password" inputmode="numeric" pattern="[0-9]{4,6}" maxlength="6" name="p1" required autocomplete="new-password"></label><label class="field"><span>Ripeti</span><input class="inp" type="password" inputmode="numeric" pattern="[0-9]{4,6}" maxlength="6" name="p2" required autocomplete="new-password"></label></div>
    <div class="btns"><button type="button" class="btn ghost" data-x="cancel">Annulla</button><button class="btn" type="submit">Salva PIN</button></div></form>`);
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-x="cancel"]')) closeSheet(); });
  $('form', sh).addEventListener('submit', async (e) => {
    e.preventDefault(); const f = e.target; if (!/^\d{4,6}$/.test(f.p1.value)) { toast('Usa da 4 a 6 cifre'); return; } if (f.p1.value !== f.p2.value) { toast('I due PIN non coincidono'); return; }
    const salt = crypto.getRandomValues(new Uint8Array(16)); const key = await deriveKey(f.p1.value, salt);
    localStorage.setItem(LOCK_KEY, JSON.stringify({ salt: b64(salt), check: await encJSON({ ok: 1 }, key) }));
    lockKey = key; save({ noSync: true }); closeSheet(); render(); toast('PIN impostato: i dati sono cifrati');
  });
}

/* ============ router ============ */
function route() { return (location.hash || '#home').slice(1); }
function render() {
  const r = route(); let html;
  const [base, arg] = [r.replace(/-.*$/, ''), r.includes('-') ? r.slice(r.indexOf('-') + 1) : null];
  const V = { home: viewHome, buste: viewBuste, turni: viewTurni, lavori: viewLavori, calcola: viewCalcola, guida: viewGuida, impostazioni: viewImpostazioni, benvenuto: viewBenvenuto, statistiche: viewStatistiche, promemoria: viewPromemoria, cv: viewCV };
  if (base === 'azione' || base === 'condiviso') {
    const az = arg; history.replaceState(null, '', location.pathname + '#home'); lastRoute = 'home';
    setTimeout(() => { if (base === 'condiviso') gestisciCondivisi(); else if (az === 'busta') actions['busta-upload'](); else if (az === 'timbra') actions[S.timbro ? 'timbra-fine' : 'timbra-inizio'](); }, 150);
    html = viewHome();
  } else if (base === 'busta' && arg) html = viewBusta(arg);
  else if (base === 'lavoro' && arg) html = viewLavoro(arg);
  else if (base === 'anno') html = viewAnno(arg);
  else if (base === 'fine') html = viewFine(arg);
  else html = (V[base] || viewHome)();
  app.innerHTML = `<div class="fade">${html}</div>`;
  aggiornaBadge();
  const sec = { busta: 'buste', lavoro: 'lavori', cv: 'lavori' }[base] || base;
  $$('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.nav === sec));
  document.body.classList.toggle('no-nav', base === 'benvenuto');
  const pf = $('form[data-form="profilo"]');
  if (pf) { const sync = () => { const d = $('[data-reg]'); if (d) d.style.display = pf.regione.value === 'personalizzata' ? '' : 'none'; }; pf.regione.addEventListener('change', sync); sync(); }
  const cf = $('#calcForm');
  if (cf) cf.addEventListener('change', () => {
    const fd = new FormData(cf); const prevCcnl = calc.ccnl;
    for (const [k, v] of fd.entries()) calc[k] = ['livello', 'periodo', 'ccnl'].includes(k) ? v : k === 'mensilita' ? Number(v) : (toNum(v) ?? v);
    calc.td = !!fd.get('td'); if (calc.ccnl !== prevCcnl) calc.livello = '';
    const y = scrollY; render(); scrollTo(0, y);
  });
}
let lastRoute = '';
window.addEventListener('hashchange', () => { closeAllSheets(); const r = route(); if (r !== lastRoute) { lastRoute = r; render(); scrollTo(0, 0); } });

/* ============ azioni ============ */
const actions = {
  plus() {
    const A = (a, icon, bg, t, s) => `<button class="action" data-a="${a}"><span class="ic" style="background:var(--${bg}-soft);color:var(--${bg === 'accent' ? 'accent' : bg === 'ok' ? 'ok' : 'blue'})">${icon}</span><span><b>${t}</b><small>${s}</small></span></button>`;
    const sh = openSheet(`<h3>Aggiungi</h3><p class="lead">Cosa vuoi fare?</p>
      ${A('busta-upload', ic.upload, 'accent', 'Carica una busta paga', 'PDF o foto: leggo io i valori')}
      ${A(S.timbro ? 'timbra-fine' : 'timbra-inizio', S.timbro ? ic.stop : ic.play, 'ok', S.timbro ? 'Fine turno' : 'Inizio turno adesso', S.timbro ? `In turno dalle ${S.timbro.inizio}` : 'Segna l’orario con un tocco')}
      ${A('turno-oggi', ic.cal, 'ok', 'Turno, ferie o permesso', 'Per oggi o un altro giorno')}
      ${A('import-turni', ic.import, 'blue', 'Importa il planning', 'Da foto, PDF, calendario o testo')}
      ${A('job-new', ic.bag, 'blue', 'Nuovo lavoro', 'Attuale o passato, anche dal contratto')}
      ${A('doc-any', ic.doc, 'accent', 'Carica un documento', 'Contratto, proroga, CU…')}
      ${A('busta-new', ic.pen, 'blue', 'Busta a mano', 'Se non hai il PDF')}`);
    sh.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; closeSheet();
      setTimeout(() => {
        if (a === 'turno-oggi') { if (!S.lavori.length) return actions['job-new'](); turniYM = curYM(); location.hash = '#turni'; setTimeout(() => giornoSheet(todayISO()), 60); return; }
        if (a === 'import-turni') { if (!S.lavori.length) return actions['job-new'](); location.hash = '#turni'; setTimeout(importaTurni, 60); return; }
        if (a === 'doc-any') {
          const s2 = openSheet(`<h3>Di quale lavoro?</h3><p class="lead">Se è il contratto di un lavoro nuovo, compilo io la scheda.</p><button class="action" data-j="nuovo"><span class="ic" style="background:var(--accent-soft);color:var(--accent)">${ic.plus}</span><span><b>Un lavoro nuovo</b><small>Leggo il contratto e creo il lavoro</small></span></button>${S.lavori.map((j) => `<button class="action" data-j="${j.id}">${jobAvatar(j)}<span><b>${esc(j.azienda)}</b><small>${jobPeriodo(j)}</small></span></button>`).join('')}`);
          s2.addEventListener('click', (ev) => { const x = ev.target.closest('[data-j]'); if (!x) return; const id = x.dataset.j; if (id === 'nuovo') { pickFile('application/pdf,image/*').then((fs) => { closeSheet(); if (fs[0]) setTimeout(() => nuovoLavoroDaContratto(fs[0]), 230); }); return; } pickFile('application/pdf,image/*', true).then((fs) => { closeSheet(); if (!fs.length) return; location.hash = '#lavoro-' + id; setTimeout(() => addDocs(id, fs), 120); }); }); return;
        }
        actions[a] && actions[a]();
      }, 230);
    });
  },
  'busta-upload'() { if (!S.lavori.length) { toast('Prima aggiungi il lavoro a cui appartiene'); return actions['job-new'](); } caricaBusta(); },
  'busta-new'() { bustaForm(); },
  'busta-rileggi'(el) { rileggiBusta(S.buste.find((x) => x.id === el.dataset.id)); },
  'busta-edit'(el) { const b = S.buste.find((x) => x.id === el.dataset.id); bustaForm(Object.assign({}, b), {}, null); },
  async 'busta-del'(el) { if (!(await ask('Eliminare la busta?', 'La busta e il documento allegato verranno rimossi.', 'Elimina'))) return; const b = S.buste.find((x) => x.id === el.dataset.id); if (b && b.fileId) fileDel(b.fileId); S.buste = S.buste.filter((x) => x.id !== el.dataset.id); segnaEliminato(el.dataset.id); save(); location.hash = '#buste'; toast('Busta eliminata'); },
  'filtro-buste'(el) { filtroBuste = el.dataset.id; render(); },
  'job-new'() { jobForm(); },
  'job-edit'(el) { jobForm(Object.assign({}, job(el.dataset.id))); },
  async 'job-del'(el) {
    const j = job(el.dataset.id); const nb = S.buste.filter((b) => b.jobId === j.id).length;
    if (!(await ask(`Eliminare ${j.azienda}?`, `Verranno eliminati anche documenti e turni di questo lavoro${nb ? `; le ${nb} buste restano senza lavoro collegato` : ''}.`, 'Elimina'))) return;
    (j.documenti || []).forEach((d) => fileDel(d.fileId)); delete S.turni[j.id]; S.buste.forEach((b) => { if (b.jobId === j.id) b.jobId = null; });
    S.lavori = S.lavori.filter((x) => x.id !== j.id); segnaEliminato(j.id); if (S.attivo === j.id) S.attivo = (S.lavori[0] || {}).id || null;
    save(); location.hash = '#lavori'; toast('Lavoro eliminato');
  },
  'set-attivo'(el) { S.attivo = el.dataset.id; save(); render(); toast('Lavoro principale aggiornato'); },
  'doc-add'(el) { addDocs(el.dataset.id); }, 'doc-menu'(el) { docMenu(el.dataset.job, el.dataset.id); }, 'view-file'(el) { viewFile(el.dataset.id, el.dataset.t); },
  'turni-job'(el) { turniJob = el.dataset.id; render(); }, 'turni-mese'(el) { turniYM = addYM(turniYM, Number(el.dataset.d)); render(); },
  giorno(el) { giornoSheet(el.dataset.d); }, modelli() { modelliSheet(); }, 'import-turni'() { importaTurni(); },
  'dettaglio-stima'(el) { dettaglioStima(el.dataset.ym, el.dataset.job); },
  'calc-modo'(el) { calc.modo = el.dataset.m; render(); },
  tema(el) { S.tema = el.dataset.v; save(); applyTheme(); render(); },
  info(el) { const t = TERMS[el.dataset.k]; if (!t) return; const sh = openSheet(`<h3>${esc(t[0])}</h3><p class="lead" style="color:var(--text)">${esc(t[1])}</p><button class="btn block" data-x="ok">Ho capito</button>`); sh.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) closeSheet(); }); },
  'timbra-inizio'() { const j = attivo(); if (!j) return actions['job-new'](); const d = new Date(); S.timbro = { jobId: j.id, data: todayISO(), inizio: `${pad(d.getHours())}:${pad(d.getMinutes())}` }; turniJob = j.id; save(); render(); toast(`Turno iniziato alle ${S.timbro.inizio}`); },
  'timbra-fine'() { const t = S.timbro; if (!t) return; const d = new Date(); turniJob = t.jobId; giornoSheet(t.data, { tipo: 'turno', inizio: t.inizio, fine: `${pad(d.getHours())}:${pad(d.getMinutes())}`, pausa: 0 }, () => { S.timbro = null; save(); toast('Turno salvato'); }); },
  lettera(el) { lettera(S.buste.find((x) => x.id === el.dataset.id)); },
  async 'cdc-invia'(el) { await inviaCdc(S.buste.find((x) => x.id === el.dataset.id)); render(); },
  async 'cdc-tutte'() { let n = 0; for (const b of S.buste.filter((x) => x.netto)) if (await inviaCdc(b, true)) n++; if (n) toast(`${n} buste inviate a Conto di Casa`); else inviaCdc(S.buste.find((x) => x.netto)); render(); },
  'cu-add'(el) { const y = Number(el.dataset.y) || annoSel; const jid = el.dataset.job || (attivo() || {}).id; caricaCU(jid, y); },
  'pdf-anno'(el) { toast('Preparo il PDF…'); pdfAnno(Number(el.dataset.y)); },
  'prom-new'() { promForm(); }, 'prom-fatto'(el) { const p = S.promemoria.find((x) => x.id === el.dataset.id); if (p) { p.fatto = true; save(); render(); } },
  ics() { creaICS(); },
  async notifiche() {
    if (!('Notification' in window)) { toast('Questo browser non supporta gli avvisi: usa "Aggiungi al calendario"'); return; }
    if (S.notifiche) { S.notifiche = false; save(); render(); toast('Avvisi disattivati'); return; }
    let p = 'denied'; try { p = await Notification.requestPermission(); } catch (e) {}
    if (p === 'granted') { S.notifiche = true; S.notificato = ''; save(); render(); toast('Ti avviso quando apri l’app'); avvisaSeServe(); } else toast('Permesso non concesso: usa "Aggiungi al calendario"');
  },
  'cv-lang'(el) { cvLang = el.dataset.l; render(); }, 'cv-copia'() { copia(`${cvLang === 'en' ? 'WORK EXPERIENCE' : 'ESPERIENZE DI LAVORO'}\n\n` + cvTesto(cvLang).map((x) => x.txt).join('\n\n')); }, 'cv-pdf'() { cvPDF(); },
  'ob-next'() { obSalva(); obStep = Math.min(4, obStep + 1); render(); scrollTo(0, 0); },
  'ob-back'() { obSalva(); obStep = Math.max(0, obStep - 1); render(); },
  'ob-skip'() { S.onboarded = true; save(); location.hash = '#home'; },
  'ob-job'(el) { obSalva(); const done = () => { obStep = 3; location.hash = '#benvenuto'; render(); }; if (el.dataset.m === 'pdf') pickFile('application/pdf,image/*').then((fs) => { if (fs[0]) nuovoLavoroDaContratto(fs[0], done); }); else jobForm({}, null, done); },
  'ob-fine'(el) { S.onboarded = true; save(); const g = el.dataset.go2; obStep = 0; if (g.startsWith('#')) location.hash = g; else { location.hash = '#home'; setTimeout(() => actions[g](), 120); } },
  install() { installa(); }, 'install-no'() { S.installNascosto = true; save(); render(); toast('Puoi installarla quando vuoi dalle Impostazioni'); }, aggiorna() { cercaAggiornamenti(); },
  'pin-set'() { pinForm(); },
  async 'pin-del'() { if (!(await ask('Togliere il PIN?', 'I dati su questo telefono non saranno più cifrati.', 'Togli PIN'))) return; localStorage.removeItem(LOCK_KEY); lockKey = null; save({ noSync: true }); render(); toast('PIN rimosso'); },
  'sync-on'() { syncAttiva(); }, 'sync-login'() { if (!S.sync.pass) return syncAttiva(); syncLogin(); }, 'sync-now'() { syncNow(); },
  async 'sync-logout'() { try { await sb.auth.signOut(); } catch (e) {} sbUser = null; render(); toast('Disconnesso: i dati restano su questo telefono'); },
  'sync-off'() { S.sync = { on: false, pass: '' }; save({ noSync: true }); render(); },
  export() {
    const data = JSON.stringify(S, null, 1); const name = `cedolino-backup-${todayISO()}.json`;
    scarica(new Blob([data], { type: 'application/json' }), name);
    const sh = openSheet(`<h3>Backup</h3><p class="lead">Se il download non parte, copia il testo e salvalo in una nota. I PDF non sono inclusi: restano su questo dispositivo.</p><textarea class="inp" style="min-height:160px" readonly>${esc(data)}</textarea><div class="btns" style="margin-top:12px"><button class="btn ghost" data-x="close">Chiudi</button><button class="btn" data-x="copy">${ic.copy} Copia</button></div>`);
    sh.addEventListener('click', (e) => { if (e.target.closest('[data-x="close"]')) closeSheet(); if (e.target.closest('[data-x="copy"]')) copia(data); });
  },
  import() {
    const sh = openSheet(`<h3>Importa backup</h3><p class="lead">Scegli il file .json oppure incolla il testo del backup. Sostituisce i dati attuali.</p><button class="btn ghost block" data-x="file">${ic.upload} Scegli file</button><textarea class="inp" style="margin-top:12px;min-height:120px" placeholder="Incolla qui il backup"></textarea><div class="btns" style="margin-top:12px"><button class="btn ghost" data-x="close">Annulla</button><button class="btn" data-x="ok">Importa</button></div>`);
    const apply = (txt) => { try { const o = JSON.parse(txt); if (!o || !Array.isArray(o.lavori)) throw 0; S = normalizza(o); S.onboarded = true; save(); applyTheme(); closeSheet(); location.hash = '#home'; render(); toast('Backup importato'); } catch (e) { toast('Backup non valido'); } };
    sh.addEventListener('click', async (e) => { if (e.target.closest('[data-x="close"]')) closeSheet(); if (e.target.closest('[data-x="ok"]')) apply($('textarea', sh).value); if (e.target.closest('[data-x="file"]')) { const f = (await pickFile('application/json,.json'))[0]; if (f) apply(await f.text()); } });
  },
  async reset() { if (!(await ask('Cancellare tutto?', 'Lavori, buste, turni e documenti verranno eliminati da questo dispositivo. Non si può annullare.', 'Cancella tutto'))) return; S = DEF(); lockKey = null; try { localStorage.removeItem(LOCK_KEY); indexedDB.deleteDatabase('cedolino-files'); dbP = null; } catch (e) {} save({ noSync: true }); applyTheme(); obStep = 0; location.hash = '#benvenuto'; render(); toast('Dati cancellati'); },
};
const changeActions = {
  vetro(el) { S.vetro = el.checked; save(); applyTheme(); },
  'cv-toggle'(el) { if (el.checked) cvEsclusi.delete(el.dataset.id); else cvEsclusi.add(el.dataset.id); render(); },
  'naspi-fatta'(el) { const j = job(el.dataset.id); if (j) { j.naspiFatta = el.checked; save(); } },
  'cdc-auto'(el) { S.cdc.auto = el.checked; save(); toast(el.checked ? 'Le nuove buste andranno in Conto di Casa' : 'Invio automatico disattivato'); },
};

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]'); if (go && !e.target.closest('[data-act]')) { location.hash = go.dataset.go; return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  if (a.tagName === 'INPUT') return;
  const fn = actions[a.dataset.act]; if (!fn) return;
  e.preventDefault(); e.stopPropagation(); fn(a, e);
});
document.addEventListener('change', (e) => { const t = e.target; if (t.dataset && changeActions[t.dataset.act]) changeActions[t.dataset.act](t); });
document.addEventListener('submit', (e) => {
  const f = e.target; if (f.dataset.form !== 'profilo') return;
  e.preventDefault(); const fd = new FormData(f); const P = S.profilo;
  P.nome = (fd.get('nome') || '').trim(); P.nascita = fd.get('nascita') || ''; P.regione = fd.get('regione'); P.aliquotaRegionale = toNum(fd.get('aliquotaRegionale')) ?? 1.23;
  P.aliquotaComunale = toNum(fd.get('aliquotaComunale')) ?? 0; P.esenzioneComunale = toNum(fd.get('esenzioneComunale')) ?? 0;
  P.contribRate = toNum(fd.get('contribRate')) || 9.19; P.reddito2025 = toNum(fd.get('reddito2025'));
  P.flatTax = !!fd.get('flatTax'); P.variabiliMeseSucc = !!fd.get('variabiliMeseSucc'); P.mese14 = Number(fd.get('mese14'));
  P.giornoPaga = Math.min(31, Math.max(1, toNum(fd.get('giornoPaga')) || 10)); P.pagaMeseSucc = fd.get('pagaMeseSucc') === '1'; P.giornoBusta = Math.min(31, Math.max(1, toNum(fd.get('giornoBusta')) || 15));
  const pt = (fd.get('patrono') || '').trim(); const m = pt.match(/^(\d{1,2})[-/.](\d{1,2})$/); P.patrono = m ? `${pad(m[2])}-${pad(m[1])}` : '';
  S.vetro = !!fd.get('vetro'); applyTheme(); save(); toast('Impostazioni salvate'); render();
});
document.addEventListener('dragover', (e) => { if (route() === 'buste' || route().startsWith('lavoro-')) e.preventDefault(); });
document.addEventListener('drop', (e) => {
  const r = route(); const files = Array.from((e.dataTransfer && e.dataTransfer.files) || []); if (!files.length) return;
  if (r === 'buste') { e.preventDefault(); caricaBusta(files); } else if (r.startsWith('lavoro-')) { e.preventDefault(); addDocs(r.slice(7), files); }
});
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) { lockedAt = Date.now(); return; }
  if (lockKey && lockedAt && Date.now() - lockedAt > 60000 && !$('.lock')) { await lockScreen(verificaPin); render(); }
  if (S.sync.on && sbUser) syncNow(true);
});

/* ============ avvio ============ */
async function boot() {
  try { const ui = JSON.parse(localStorage.getItem(UI_KEY) || 'null'); if (ui) { S.tema = ui.tema || S.tema; S.vetro = ui.vetro !== false; } } catch (e) { storageOK = false; }
  applyTheme();
  const lc = lockCfg();
  if (lc) {
    await lockScreen(async (pin) => {
      if (!(await verificaPin(pin))) return false;
      try { const raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.enc) S = normalizza(await decJSON(raw, lockKey)); else if (raw) S = normalizza(raw); } catch (e) {}
      return true;
    });
  } else {
    try { const raw = localStorage.getItem(KEY); if (raw) { const o = JSON.parse(raw); if (o && !o.enc) S = normalizza(o); } } catch (e) { storageOK = false; }
  }
  applyTheme();
  if (!S.onboarded && !S.lavori.length && (!location.hash || location.hash === '#home')) location.hash = '#benvenuto';
  if (new URLSearchParams(location.search).get('app') === 'pwa') history.replaceState(null, '', location.pathname + location.hash);
  lastRoute = route(); render();
  registraSW(); statoRete(); if (isStandalone()) proteggiDati();
  if (S.sync.on || new URLSearchParams(location.search).get('code')) sbInit().then(() => { if (sbUser) syncNow(true); });
  avvisaSeServe();
  setInterval(() => { if (S.timbro && ['home', 'turni'].includes(route()) && !sheetStack.length) render(); }, 60000);
}
matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => { if (S.tema === 'auto') applyTheme(); });
window.__cedolino = { get S() { return S; }, stima, controlla, parseBusta, leggiFile, parseContratto, parseCU, parsePlanning, annoFiscale, naspiDati, promemoria, mergeStati };
boot();
})();
