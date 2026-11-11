
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
    if (Math.abs(diff) > Math.max(3, atteso * 0.06)) out.push({ s: 'warn', t: `Contributi INPS diversi dal ${num(cr, 2)}%`, p: `Su ${eur(base)} ci si aspetta circa ${eur(atteso)}, in busta ${eur(b.contributi)}. Se ci sono rimborsi o voci non soggette a contributi è normale; altrimenti chiedi spiegazioni.` });
    else out.push({ s: 'ok', t: 'Contributi INPS corretti', p: `${eur(b.contributi)}, circa il ${num(cr, 2)}% dell'imponibile.` });
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
    ['Straordinario', /straordin/i, 'Ore oltre le 40 settimanali: +15% fino alla 48ª ora, +20% oltre; straordinario notturno +50%.'],
    ['Lavoro festivo / domenicale', /festiv|domenic/i, 'Ore lavorate nei festivi o di domenica: nel Commercio +30%. Nel 2026 queste maggiorazioni sono tassate al 15% fino a 1.500 € se il reddito 2025 non supera 40.000 €.'],
    ['Festività non goduta', /fest.*(non\s*god|cadent)/i, 'Quando una festività cade di domenica o nel giorno di riposo spetta una giornata di paga in più.'],
    ['Tredicesima / Quattordicesima', /13\s*\^?|14\s*\^?|tredicesima|quattordicesima|mensilit/i, 'Mensilità aggiuntive: la 13ª a dicembre, la 14ª a giugno/luglio. Si maturano 1/12 per ogni mese lavorato.'],
    ['Indennità di disponibilità', /disponibilit/i, 'Nel lavoro a chiamata con obbligo di rispondere spetta un’indennità pari al 20% della retribuzione per i periodi in cui resti a disposizione.'],
  ]],
  ['Trattenute', [
    ['Contributi INPS (IVS)', /i\.?v\.?s|inps|contribut/i, 'Contributi per la pensione a tuo carico: in genere il 9,19% dell’imponibile.'],
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
