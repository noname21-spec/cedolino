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
const CCNL_NOMI = { commercio: 'Commercio – Terziario Confcommercio', turismo: E.TABELLE.turismo.nome, pubblici: E.TABELLE.pubblici.nome, multiservizi: E.TABELLE.multiservizi.nome, altro: 'Altro contratto (es. cinema)' };
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
