
/* ============ lettura PDF / foto ============ */
function loadScript(src) { return new Promise((res, rej) => { if ($(`script[src="${src}"]`)) { res(); return; } const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Impossibile caricare ' + src)); document.head.appendChild(s); }); }
function pdfLib() { const l = window.pdfjsLib || window['pdfjs-dist/build/pdf']; if (l && !l.__cfg) { try { l.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; } catch (e) {} l.__cfg = true; } return l; }
async function pdfText(blob) {
  const lib = pdfLib(); if (!lib) throw new Error('Lettore PDF non disponibile');
  const pdf = await lib.getDocument({ data: await blob.arrayBuffer() }).promise; const lines = [];
  for (let p = 1; p <= Math.min(pdf.numPages, 6); p++) {
    const page = await pdf.getPage(p); const tc = await page.getTextContent(); const rows = {};
    for (const it of tc.items) { if (!it.str || !it.str.trim()) continue; const y = Math.round(it.transform[5] / 3); (rows[y] = rows[y] || []).push({ x: it.transform[4], s: it.str }); }
    Object.keys(rows).map(Number).sort((a, b) => b - a).forEach((y) => lines.push(rows[y].sort((a, b) => a.x - b.x).map((r) => r.s).join(' ').replace(/\s+/g, ' ').trim()));
  }
  return lines.join('\n');
}
async function ocrText(blob, onProg) {
  if (!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
  const r = await window.Tesseract.recognize(blob, 'ita', { logger: (m) => { if (m.status === 'recognizing text' && onProg) onProg(m.progress); } });
  return r.data.text;
}
async function leggiFile(file, onProg) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return pdfText(file);
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
    if (!vals.length && L[i + 1]) vals = importiIn(L[i + 1]);
    if (vals.length) { found[key] = opts.last ? vals[vals.length - 1] : vals[0]; return; }
  }
}
function parseBusta(text) {
  const L = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const found = {}; const appresi = [];
  // 1) regole insegnate dall'utente
  for (const r of S.regole || []) {
    if (found[r.campo] != null) continue;
    const line = L.find((l) => chiaveRiga(l) === r.chiave) || L.find((l) => r.chiave.length > 8 && chiaveRiga(l).includes(r.chiave));
    if (line) { const v = importiIn(line); if (v[r.idx] != null) { found[r.campo] = v[r.idx]; appresi.push(r.campo); } }
  }
  // 2) etichette dei programmi paghe più diffusi (Zucchetti, TeamSystem, ADP, Inaz…)
  const g = (k, re, o) => cercaEtichetta(L, found, k, re, o);
  g('netto', /netto\s*(del\s*mese|in\s*busta|a\s*pagare|busta|da\s*pagare|mese|corrisposto|retribuzione)|netto\b/i, { not: /imponib|lordo/i });
  g('lordo', /totale\s*competenze|tot\.?\s*competenze|totale\s*lordo|lordo\s*(mensile|del\s*mese)|competenze\s*lorde|retribuzione\s*lorda|totale\s*retribuzione/i);
  g('trattenute', /totale\s*trattenute|tot\.?\s*trattenute|totale\s*ritenute|tot\.?\s*ritenute/i);
  g('imponibilePrev', /imponibile\s*(inps|previd|contrib|i\.?n\.?p\.?s)|imp\.?\s*(inps|prev)/i);
  g('contributi', /(contribut[oi]|ritenut[ae])\s*(inps|ivs|previd|c\/dip)|contr\.?\s*ivs|c\.?\s*i\.?v\.?s|ivs\b|inps\s*c\/dip|ritenute\s*previdenziali|tot\.?\s*contributi/i, { not: /imponib/i });
  g('imponibileFisc', /imponibile\s*(irpef|fiscale)|imp\.?\s*(irpef|fisc)/i);
  g('irpef', /irpef\s*(netta|trattenut|mese|a\s*debito|pagata)|ritenut[ae]\s*irpef|ritenuta\s*fiscale/i, { not: /imponib|lorda/i });
  g('irpef', /irpef/i, { not: /imponib|lorda|detraz|add/i });
  g('addReg', /add(izionale|\.|\s)*\s*reg/i, { not: /imponib/i });
  g('addCom', /add(izionale|\.|\s)*\s*com/i, { not: /imponib/i });
  g('tfr', /quota\s*t\.?f\.?r|t\.?f\.?r\.?\s*(mese|quota|maturat|del\s*mese)/i);
  g('ferieRes', /ferie/i, { last: true, not: /god(ute)?\s*$/i });
  g('permessiRes', /permess|r\.?o\.?l\.?\b|ex\s*fest/i, { last: true });
  g('oreExtra', /(ore\s*)?(supplementar|straordinar)/i, { not: /magg/i });
  if (found.oreExtra != null && found.oreExtra > 120) delete found.oreExtra;
  const mesiRe = new RegExp(`\\b(${MESI.join('|')})\\s*[-/]?\\s*(20\\d{2})`, 'i');
  const pm = text.match(mesiRe);
  if (pm) found.ym = `${pm[2]}-${pad(MESI.indexOf(pm[1].toLowerCase()) + 1)}`;
  else { const n = text.match(/\b(0?[1-9]|1[0-2])\s*[/-]\s*(20\d{2})\b/); if (n) found.ym = `${n[2]}-${pad(n[1])}`; }
  if (/tredicesima|13\s*\^?\s*mens/i.test(text)) found.tipo = 'tredicesima'; else if (/quattordicesima|14\s*\^?\s*mens/i.test(text)) found.tipo = 'quattordicesima';
  const jl = S.lavori.find((j) => j.azienda && text.toLowerCase().includes(j.azienda.toLowerCase().split(/\s+/)[0]));
  if (jl) found.jobId = jl.id;
  if (found.netto && found.lordo && found.netto > found.lordo * 1.6) delete found.netto;
  found._appresi = appresi;
  return found;
}
function parseContratto(text) {
  const f = {}; const romani = { I: '1', II: '2', III: '3', IV: '4', V: '5', VI: '6', VII: '7' };
  if (/turismo|alberghi|federalberghi/i.test(text)) f.ccnl = 'turismo';
  else if (/pubblici\s*esercizi|fipe|ristorazione/i.test(text)) f.ccnl = 'pubblici';
  else if (/multiservizi|pulizi/i.test(text)) f.ccnl = 'multiservizi';
  else if (/terziario|commercio|confcommercio/i.test(text)) f.ccnl = 'commercio';
  let m = text.match(/\b(I{1,3}|IV|V|VI|VII|[1-7])\s*°?\s*(super\s*)?livello/i) || text.match(/livello\s*:?\s*(I{1,3}|IV|V|VI{0,2}|[1-7]|quadro)\b/i);
  if (m) { const k = m[1].toUpperCase(); f.livello = k === 'QUADRO' ? 'Q' : romani[k] || k; if (m[2] && f.ccnl !== 'commercio') f.livello += 'S'; }
  m = text.match(/(\d{1,2}(?:[.,]\d)?)\s*ore\s*(settimanali|a\s*settimana|sett)/i) || text.match(/orario[^.\n]{0,40}?(\d{1,2})\s*ore/i);
  if (m) f.oreSett = toNum(m[1]);
  const d = '(\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4})';
  const toIso = (s) => { const [a, b, c] = s.split(/[/.-]/).map(Number); const y = c < 100 ? 2000 + c : c; return `${y}-${pad(b)}-${pad(a)}`; };
  m = text.match(new RegExp(`(?:dal|decorrenza|a\\s*decorrere\\s*dal|data\\s*(?:di\\s*)?(?:assunzione|inizio))\\s*:?\\s*${d}`, 'i')); if (m) f.inizio = toIso(m[1]);
  for (const mm of text.matchAll(new RegExp(`(?:\\bal|fino\\s*al|scadenza|termine)\\s*:?\\s*${d}`, 'gi'))) { const v = toIso(mm[1]); if ((!f.inizio || v > f.inizio) && (!f.fine || v > f.fine)) f.fine = v; }
  if (/intermittente|a\s*chiamata/i.test(text)) f.tipo = 'chiamata'; else if (/apprendistato/i.test(text)) f.tipo = 'apprendistato'; else if (/tempo\s*determinato|a\s*termine/i.test(text)) f.tipo = 'determinato'; else if (/tempo\s*indeterminato/i.test(text)) f.tipo = 'indeterminato';
  m = text.match(/superminimo[^\d\n]{0,30}(\d{1,3}(?:\.\d{3})*,\d{2})/i); if (m) f.superminimo = pnum(m[1]);
  m = text.match(/mansion[ei][^:\n]{0,20}:?\s*([^\n.]{4,60})/i); if (m) f.ruolo = cap(m[1].trim().replace(/^di\s+/i, ''));
  if (/obbligo\s*di\s*(risposta|disponibilit)|indennit[aà]\s*di\s*disponibilit/i.test(text)) f.disponibilita = true;
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
