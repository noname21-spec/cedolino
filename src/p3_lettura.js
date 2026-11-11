
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
    if (!vals.length && L[i + 1]) vals = importiIn(L[i + 1]);
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
    imponibilePrev: [/imponibile\s*(?:inps|previd|contrib|i\.?n\.?p\.?s)|imp\.?\s*(?:inps|prev)/i, /progress/i],
    imponibileFisc: [/imponibile\s*(?:irpef|fiscale)|imp\.?\s*(?:irpef|fisc)/i, /progress/i],
    contributi: [/(?:contribut[oi]|ritenut[ae])\s*(?:inps|ivs|previd|c\/dip)|contr\.?\s*ivs|c\.?\s*i\.?v\.?s|\bivs\b|inps\s*c\/dip|ritenute\s*previdenziali|tot\.?\s*contributi/i, /imponib|progress/i],
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
    const colOre = colonna(rows, /ore\s*\/\s*g+|^ore$|quantit[aà]|\bq\.?t[aà]\b|\bn\.?\s*ore/i);
    for (const [k, [re, not]] of Object.entries(RE)) {
      if (found[k] != null) continue;
      const labs = trovaEtichette(rows, re, not); const vals = [];
      for (const lab of labs) {
        const c = candidati(rows, lab);
        if (['contributi', 'irpef', 'addReg', 'addCom'].includes(k) && c.destra.length) {
          const inCol = colTratt && colTratt.p === lab.r.p && nellaColonna(lab.r, colTratt);
          if (inCol) vals.push(valImp(inCol.s));
          vals.push(c.destra[c.destra.length - 1].v, ...c.lista);
        } else if (k === 'oreExtra') {
          const inCol = colOre && colOre.p === lab.r.p && nellaColonna(lab.r, colOre);
          if (inCol) vals.push(valImp(inCol.s)); else vals.push(...c.lista);
        } else vals.push(...c.lista);
      }
      if (vals.length) C[k] = [...new Set(vals)];
    }
    // tabella ferie/permessi: riga × colonna "Saldo/Residuo"
    const colSaldo = colonna(rows, /\bsaldo\b|residu[oie](?!\s*a\.?\s*p)(?!\s*anno\s*prec)|spettant|da\s*godere|disponibil/i);
    const tab = (re) => {
      const labs = trovaEtichette(rows, re, /god(?:ute|uto)\s*$|matur/i).filter((l, i, arr) => arr.findIndex((q) => q.r === l.r) === i); let tot = null;
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
    const vals = C[k] ? [...C[k]] : [];
    for (let i = 0; i < L.length; i++) {
      const line = L[i]; const m = line.match(re); if (!m || (not && not.test(line.slice(Math.max(0, m.index - 7), m.index + m[0].length)))) continue;
      let after = importiIn(line.slice(m.index + m[0].length));
      if (['contributi', 'irpef', 'addReg', 'addCom'].includes(k) && after.length > 1) after = [after[after.length - 1], ...after];
      vals.push(...after);
      if (!after.length && L[i + 1]) {
        const sotto = importiIn(L[i + 1]); const pos = testate(line);
        if (pos.length > 1 && sotto.length === pos.length) { // intestazioni in fila con i valori sotto: associo per posizione
          const idx = pos.findIndex((x) => x >= m.index - 1 && x <= m.index + 1); if (idx >= 0) vals.unshift(sotto[idx]);
        }
        vals.push(...sotto);
      }
    }
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
  if (found.ferieRes == null) cercaEtichetta(L, found, 'ferieRes', /\bferie\b/i, { last: true, not: /god(?:ute)?\s*$/i });
  if (found.permessiRes == null) cercaEtichetta(L, found, 'permessiRes', /permess|r\.?o\.?l\.?\b|ex\s*fest/i, { last: true });
  const mesiRe = new RegExp(`\\b(${MESI.join('|')})\\s*[-/]?\\s*(20\\d{2})`, 'i');
  const pm = text.match(mesiRe);
  if (pm) found.ym = `${pm[2]}-${pad(MESI.indexOf(pm[1].toLowerCase()) + 1)}`;
  else { const n = text.match(/\b(0?[1-9]|1[0-2])\s*[/-]\s*(20\d{2})\b/); if (n) found.ym = `${n[2]}-${pad(n[1])}`; }
  if (/tredicesima|13\s*\^?\s*mens/i.test(text)) found.tipo = 'tredicesima'; else if (/quattordicesima|14\s*\^?\s*mens/i.test(text)) found.tipo = 'quattordicesima';
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
  else if (/cinematograf|cinema/i.test(flat)) { f.ccnl = 'altro'; f.ccnlNome = 'Esercizi cinematografici'; }
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
