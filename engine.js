/* Cedolino — motore di calcolo busta paga (Italia, regole 2026)
   Funziona sia nel browser (window.Engine) sia in Node (module.exports). */
(function (root) {
  'use strict';
  const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ---------- CCNL ---------- */
  // Minimi mensili lordi tempo pieno (paga base + contingenza + terzo elemento + altre voci fisse)
  // Fonte: tabelle CCNL Terziario Confcommercio, tranche 1/11/2025 e 1/11/2026.
  const COMMERCIO_LIVELLI = {
    Q: { label: 'Quadro', t2611: 3047.05, t2511: 2986.29, incr: 60.76, scatto: 25.46 },
    '1': { label: 'I livello', t2611: 2560.87, t2511: 2506.13, incr: 54.74, scatto: 24.84 },
    '2': { label: 'II livello', t2611: 2283.0, t2511: 2235.65, incr: 47.35, scatto: 22.83 },
    '3': { label: 'III livello', t2611: 2024.38, t2511: 1983.91, incr: 40.47, scatto: 21.95 },
    '4': { label: 'IV livello', t2611: 1818.75, t2511: 1783.75, incr: 35.0, scatto: 20.66 },
    '5': { label: 'V livello', t2611: 1691.7, t2511: 1660.08, incr: 31.62, scatto: 20.3 },
    '6': { label: 'VI livello', t2611: 1570.16, t2511: 1541.77, incr: 28.39, scatto: 19.73 },
    '7': { label: 'VII livello', t2611: 1422.27, t2511: 1397.96, incr: 24.31, scatto: 19.47 },
  };

  // Altri CCNL con tabella dei minimi (tempo pieno, mensile lordo)
  const TABELLE = {
    turismo: { nome: 'Turismo – Alberghi (Federalberghi)', breve: 'Turismo alberghi', mensilita: 14, divisoreOrario: 172, dal: '2026-05',
      livelli: { QA: ['Quadro A', 2491.82], QB: ['Quadro B', 2307.53], '1': ['1° livello', 2084.71], '2': ['2° livello', 1905.40], '3': ['3° livello', 1797.04], '4': ['4° livello', 1695.69], '5': ['5° livello', 1590.27], '6S': ['6° super', 1529.13], '6': ['6° livello', 1507.45], '7': ['7° livello', 1412.60] } },
    pubblici: { nome: 'Pubblici esercizi e ristorazione (FIPE)', breve: 'Pubblici esercizi', mensilita: 14, divisoreOrario: 172, dal: '2026-06',
      livelli: { QA: ['Quadro A', 2462.96], QB: ['Quadro B', 2271.62], '1': ['1° livello', 2107.66], '2': ['2° livello', 1916.32], '3': ['3° livello', 1800.74], '4': ['4° livello', 1692.69], '5': ['5° livello', 1580.08], '6S': ['6° super', 1514.82], '6': ['6° livello', 1491.58], '7': ['7° livello', 1390.20] } },
    multiservizi: { nome: 'Pulizie e Multiservizi (FISE/ANIP)', breve: 'Multiservizi', mensilita: 14, divisoreOrario: 173, dal: '2026-10',
      livelli: { Q: ['Quadro', 2362.93], '7': ['7° livello', 2182.11], '6': ['6° livello', 1954.56], '5': ['5° livello', 1670.94], '4': ['4° livello', 1572.03], '3': ['3° livello', 1488.38], '2': ['2° livello', 1413.50], '1': ['1° livello', 1338.83] } },
  };

  const CCNL = {
    commercio: {
      nome: 'Commercio – Terziario Confcommercio',
      mensilita: 14,
      divisoreOrario: 168,
      divisoreGiornaliero: 26,
      oreSettFull: 40,
      ferieGiorni: 26,
      exFestOre: 32,
      magg: { supplementare: 35, straord48: 15, straordOltre48: 20, domenicale: 30, festivo: 30, notturno: 15, straordNotturno: 50 },
      livelli: COMMERCIO_LIVELLI,
    },
  };

  // ym: "YYYY-MM"
  function ymNum(ym) { const [y, m] = ym.split('-').map(Number); return y * 12 + (m - 1); }
  const YM = (y, m) => y * 12 + (m - 1);

  /** Minimo tabellare tempo pieno per livello e mese. stima=true per periodi ricostruiti. */
  function minimoCommercio(livello, ym) {
    const L = COMMERCIO_LIVELLI[livello] || COMMERCIO_LIVELLI['4'];
    const r = L.incr / 35; // riparametrazione rispetto al IV livello
    const n = ymNum(ym);
    if (n >= YM(2026, 11)) return { valore: L.t2611, stima: false };
    if (n >= YM(2025, 11)) return { valore: L.t2511, stima: false };
    if (n >= YM(2025, 3)) return { valore: r2(L.t2511 - 40 * r), stima: true };
    if (n >= YM(2024, 4)) return { valore: r2(L.t2511 - 80 * r), stima: true };
    return { valore: r2(L.t2511 - 150 * r), stima: true };
  }

  /** Quota mensile (tempo pieno) degli aumenti del rinnovo 2024 pagata nel mese (per la flat tax 5%). */
  function aumentiRinnovoCommercio(livello, ym) {
    const L = COMMERCIO_LIVELLI[livello] || COMMERCIO_LIVELLI['4'];
    const r = L.incr / 35;
    const n = ymNum(ym);
    if (n >= YM(2026, 11)) return r2(185 * r);
    if (n >= YM(2025, 11)) return r2(150 * r);
    if (n >= YM(2025, 3)) return r2(110 * r);
    if (n >= YM(2024, 4)) return r2(70 * r);
    return 0;
  }

  /* ---------- Contratto: valori derivati ---------- */
  /** job: oggetto lavoro (vedi app). ym: mese di riferimento */
  function contratto(job, ym) {
    const tipoCcnl = job.ccnl || 'commercio';
    const oreFull = Number(job.oreSettFull) || 40;
    const oreSett = Number(job.oreSett) || oreFull;
    const p = clamp(oreSett / oreFull, 0.05, 1);
    let minimoFull, stima = false, mensilita, divOrario, magg, scattoImporto = 0, aumentiFull = 0;
    if (tipoCcnl === 'commercio') {
      const m = minimoCommercio(job.livello || '4', ym);
      minimoFull = Number(job.minimoManuale) > 0 ? Number(job.minimoManuale) : m.valore;
      stima = m.stima && !(Number(job.minimoManuale) > 0);
      mensilita = 14; divOrario = 168;
      magg = Object.assign({}, CCNL.commercio.magg, job.magg || {});
      scattoImporto = COMMERCIO_LIVELLI[job.livello || '4'].scatto;
      aumentiFull = aumentiRinnovoCommercio(job.livello || '4', ym);
    } else if (TABELLE[tipoCcnl]) {
      const T = TABELLE[tipoCcnl]; const lv = T.livelli[job.livello] || T.livelli['4'] || Object.values(T.livelli)[0];
      minimoFull = Number(job.minimoManuale) > 0 ? Number(job.minimoManuale) : lv[1];
      stima = !(Number(job.minimoManuale) > 0) && ymNum(ym) < ymNum(T.dal);
      mensilita = T.mensilita; divOrario = T.divisoreOrario;
      magg = Object.assign({}, CCNL.commercio.magg, job.magg || {});
      scattoImporto = Number(job.scattoImporto) || 0;
      aumentiFull = Number(job.aumentiRinnovo) || 0;
    } else {
      const cine = tipoCcnl === 'cinema';
      minimoFull = Number(job.minimoManuale) || 0;
      aumentiFull = Number(job.aumentiRinnovo) || 0;
      mensilita = Number(job.mensilita) || (cine ? 14 : 13);
      divOrario = Number(job.divisoreOrario) || (cine ? 173 : Math.round(oreFull * 4.2));
      // CCNL Esercizi cinematografici: straordinario +30%
      magg = Object.assign({}, CCNL.commercio.magg, cine ? { straord48: 30, straordOltre48: 30 } : {}, job.magg || {});
      scattoImporto = Number(job.scattoImporto) || 0;
    }
    const scatti = (Number(job.scatti) || 0) * scattoImporto;
    const superminimo = Number(job.superminimo) || 0; // importo reale mensile in busta
    const base = r2((minimoFull + scatti) * p + superminimo);
    const pagaOraria = r2((minimoFull + scatti + superminimo / p) / divOrario);
    return {
      p, oreSett, oreFull, minimoFull, stima, mensilita, divOrario, magg,
      scatti: r2(scatti * p), superminimo, base, pagaOraria,
      pagaGiornaliera: r2(base / 26),
      aumentiRinnovo: r2(aumentiFull * p),
    };
  }

  /* ---------- Fisco ---------- */
  function scaglioniIrpef(anno) {
    return anno >= 2026
      ? [[28000, 0.23], [50000, 0.33], [Infinity, 0.43]]
      : [[28000, 0.23], [50000, 0.35], [Infinity, 0.43]];
  }
  function perScaglioni(x, scaglioni, divisore = 1) {
    let tax = 0, prev = 0;
    for (const [lim, a] of scaglioni) {
      const L = lim / divisore;
      if (x > prev) tax += (Math.min(x, L) - prev) * a;
      prev = L;
      if (x <= L) break;
    }
    return tax;
  }
  const irpefLorda = (R, anno = 2026) => perScaglioni(Math.max(0, R), scaglioniIrpef(anno));

  /** Detrazione lavoro dipendente art. 13 c.1 TUIR, annua piena (poi rapportata ai giorni) */
  function detrazioneLavoro(R, td = false) {
    let d;
    if (R <= 15000) d = Math.max(1955, 0); // minimo 690 / 1380 applicati sotto
    else if (R <= 28000) d = 1910 + 1190 * (28000 - R) / 13000;
    else if (R <= 50000) d = 1910 * (50000 - R) / 22000;
    else d = 0;
    if (R > 25000 && R <= 35000) d += 65;
    return d;
  }
  function detrazioneMinima(td) { return td ? 1380 : 690; }

  /** Taglio cuneo fiscale (L. 207/2024): somma esente fino a 20.000, ulteriore detrazione 20-40.000 */
  function cuneo(R, redditoLavoro) {
    const RL = redditoLavoro == null ? R : redditoLavoro;
    if (R <= 20000) {
      const pct = RL <= 8500 ? 0.071 : RL <= 15000 ? 0.053 : 0.048;
      return { sommaEsentePct: pct, sommaEsente: RL * pct, ulterioreDetrazione: 0 };
    }
    let ud = 0;
    if (R <= 32000) ud = 1000;
    else if (R <= 40000) ud = 1000 * (40000 - R) / 8000;
    return { sommaEsentePct: 0, sommaEsente: 0, ulterioreDetrazione: ud };
  }

  /** Trattamento integrativo (ex bonus 100 €) */
  function trattamentoIntegrativo(R, lorda, detrLav, giorni = 365) {
    const quota = giorni / 365;
    if (R <= 15000) {
      return lorda > detrLav - 75 * quota ? 1200 * quota : 0;
    }
    if (R <= 28000) {
      const diff = detrLav - lorda;
      return diff > 0 ? Math.min(1200 * quota, diff) : 0;
    }
    return 0;
  }

  const REGIONI = {
    'emilia-romagna': { nome: 'Emilia-Romagna', scaglioni: [[15000, 0.0133], [28000, 0.0193], [50000, 0.0293], [Infinity, 0.0333]] },
    personalizzata: { nome: 'Altra regione (aliquota unica)', scaglioni: null },
  };
  function addizionaleRegionale(R, cfg) {
    const reg = REGIONI[cfg.regione] || REGIONI['emilia-romagna'];
    if (reg.scaglioni) return perScaglioni(R, reg.scaglioni);
    return R * (Number(cfg.aliquotaRegionale) || 1.23) / 100;
  }
  function addizionaleComunale(R, cfg) {
    const al = (cfg.aliquotaComunale == null ? 0.8 : Number(cfg.aliquotaComunale)) / 100;
    const es = cfg.esenzioneComunale == null ? 0 : Number(cfg.esenzioneComunale);
    if (R <= es) return 0;
    return R * al;
  }

  /**
   * Calcolo annuale (lordo -> netto).
   * o: { lordo, contribRate(%), anno, giorni, td, regione..., aliquotaComunale, esenzioneComunale,
   *      magg15 (importo lordo maggiorazioni notturno/festivo/riposo), aum5 (aumenti rinnovo lordi),
   *      reddito2025 (per verificare soglie flat tax) }
   */
  function calcolaAnnuo(o) {
    const anno = o.anno || 2026;
    const lordo = Math.max(0, Number(o.lordo) || 0);
    const cr = (o.contribRate == null ? 9.19 : Number(o.contribRate)) / 100;
    const giorni = clamp(Number(o.giorni) || 365, 1, 365);
    const contributi = lordo * cr;
    const imponibile = lordo - contributi;
    const red25 = o.reddito2025 == null ? imponibile : Number(o.reddito2025);

    // Flat tax 2026
    let base15 = 0, base5 = 0;
    if (anno === 2026 && o.flatTax !== false) {
      if (red25 <= 40000) base15 = Math.min(1500, (Number(o.magg15) || 0) * (1 - cr));
      if (red25 <= 33000) base5 = (Number(o.aum5) || 0) * (1 - cr);
    }
    const sost15 = base15 * 0.15, sost5 = base5 * 0.05;
    const R = Math.max(0, imponibile - base15 - base5); // reddito complessivo IRPEF
    const Rcheck = imponibile; // per il trattamento integrativo il reddito agevolato conta

    const lorda = irpefLorda(R, anno);
    let detr = detrazioneLavoro(R, o.td) * giorni / 365;
    if (R <= 15000) detr = Math.max(detr, detrazioneMinima(o.td));
    const cu = cuneo(R, R);
    const detrTot = detr + cu.ulterioreDetrazione;
    const irpefNetta = Math.max(0, lorda - detrTot);
    const lordaTI = irpefLorda(Rcheck, anno);
    const ti = trattamentoIntegrativo(R, lordaTI, detr, giorni);
    const dovutaIrpef = lorda - detr > 0;
    const addReg = dovutaIrpef ? addizionaleRegionale(R, o) : 0;
    const addCom = dovutaIrpef ? addizionaleComunale(R, o) : 0;
    const netto = lordo - contributi - irpefNetta - addReg - addCom - sost15 - sost5 + ti + cu.sommaEsente;
    return {
      lordo, contributi, imponibile, R, irpefLorda: lorda, detrazioneLavoro: detr,
      ulterioreDetrazione: cu.ulterioreDetrazione, irpefNetta, trattamentoIntegrativo: ti,
      sommaEsente: cu.sommaEsente, sommaEsentePct: cu.sommaEsentePct,
      addRegionale: addReg, addComunale: addCom, sostitutiva15: sost15, sostitutiva5: sost5,
      netto, aliquotaMedia: lordo ? (lordo - netto) / lordo : 0,
    };
  }

  /**
   * Calcolo di una singola busta (metodo mensile del sostituto d'imposta).
   * m: { ym, ordinario (competenze del mese esclusa mensilità aggiuntiva), aggiuntiva (13ª/14ª),
   *      magg15, aum5, Rannuo (imponibile annuo previsto), contribRate, td, flat15ok, flat5ok,
   *      addRegRata, addComRata, giorniMese }
   */
  function calcolaMese(m) {
    const [y, mo] = m.ym.split('-').map(Number);
    const anno = y;
    const cr = (m.contribRate == null ? 9.19 : Number(m.contribRate)) / 100;
    const giorniMese = m.giorniMese || new Date(y, mo, 0).getDate();
    const ord = Math.max(0, Number(m.ordinario) || 0);
    const agg = Math.max(0, Number(m.aggiuntiva) || 0);
    const lordo = ord + agg;
    const contributi = lordo * cr;
    const impOrd = ord * (1 - cr), impAgg = agg * (1 - cr);
    const base15 = m.flat15ok && anno === 2026 ? Math.min(Number(m.magg15) || 0, m.residuo15 == null ? 1500 : m.residuo15 / (1 - cr)) * (1 - cr) : 0;
    const base5 = m.flat5ok && anno === 2026 ? (Number(m.aum5) || 0) * (1 - cr) : 0;
    const sost = base15 * 0.15 + base5 * 0.05;
    const Rann = Math.max(0, Number(m.Rannuo) || (impOrd * 12 + impAgg));
    const sc = scaglioniIrpef(anno);
    const impOrdIrpef = Math.max(0, impOrd - base15 - base5 * (ord / (lordo || 1)));
    const impAggIrpef = Math.max(0, impAgg - base5 * (agg / (lordo || 1)));
    const lordaOrd = perScaglioni(impOrdIrpef, sc, 12);
    const lordaAgg = perScaglioni(impAggIrpef, sc, 12);
    let detrAnn = detrazioneLavoro(Rann, m.td);
    if (Rann <= 15000) detrAnn = Math.max(detrAnn, detrazioneMinima(m.td));
    const detr = ord > 0 ? detrAnn * giorniMese / 365 : 0;
    const cu = cuneo(Rann, Rann);
    const ulteriore = ord > 0 ? cu.ulterioreDetrazione / 12 : 0;
    const irpefLordaTot = lordaOrd + lordaAgg;
    const irpefNetta = Math.max(0, irpefLordaTot - detr - ulteriore);
    const lordaAnnTI = irpefLorda(Rann, anno);
    const tiAnn = trattamentoIntegrativo(Rann, lordaAnnTI, detrAnn, 365);
    const ti = ord > 0 ? tiAnn * giorniMese / 365 : 0;
    const sommaEsente = cu.sommaEsentePct * (impOrd + impAgg);
    const addReg = Number(m.addRegRata) || 0, addCom = Number(m.addComRata) || 0;
    const netto = lordo - contributi - irpefNetta - sost - addReg - addCom + ti + sommaEsente;
    return {
      lordo, contributi, imponibileFiscale: impOrd + impAgg, irpefLorda: irpefLordaTot,
      detrazioni: detr + ulteriore, irpefNetta, sostitutive: sost, trattamentoIntegrativo: ti,
      sommaEsente, addRegionale: addReg, addComunale: addCom, netto,
      totaleTrattenute: contributi + irpefNetta + sost + addReg + addCom,
    };
  }

  /** Rate mensili addizionali (saldo anno precedente in 11 rate gen–nov; acconto comunale 30% in 9 rate mar–nov) */
  function rateAddizionali(ym, RannoPrec, RannoCorr, cfg) {
    const mo = Number(ym.split('-')[1]);
    if (mo === 12) return { reg: 0, com: 0 };
    const detrOk = (R) => irpefLorda(R) - detrazioneLavoro(R) > 0;
    const regTot = detrOk(RannoPrec) ? addizionaleRegionale(RannoPrec, cfg) : 0;
    const comSaldo = detrOk(RannoPrec) ? addizionaleComunale(RannoPrec, cfg) * 0.7 : 0;
    const comAcc = detrOk(RannoCorr) && mo >= 3 ? addizionaleComunale(RannoCorr, cfg) * 0.3 / 9 : 0;
    return { reg: regTot / 11, com: comSaldo / 11 + comAcc };
  }

  /* ---------- Calendario e turni ---------- */
  function pasqua(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  function festivita(y, patrono) {
    const f = {
      [`${y}-01-01`]: 'Capodanno', [`${y}-01-06`]: 'Epifania', [`${y}-04-25`]: 'Liberazione',
      [`${y}-05-01`]: 'Festa del Lavoro', [`${y}-06-02`]: 'Festa della Repubblica', [`${y}-08-15`]: 'Ferragosto',
      [`${y}-11-01`]: 'Ognissanti', [`${y}-12-08`]: 'Immacolata', [`${y}-12-25`]: 'Natale', [`${y}-12-26`]: 'Santo Stefano',
    };
    if (y >= 2026) f[`${y}-10-04`] = 'San Francesco';
    const p = pasqua(y); const pm = new Date(p); pm.setDate(p.getDate() + 1);
    f[iso(pm)] = 'Lunedì dell’Angelo';
    if (patrono && /^\d{2}-\d{2}$/.test(patrono)) f[`${y}-${patrono}`] = f[`${y}-${patrono}`] || 'Santo patrono';
    return f;
  }
  const toMin = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
  /** minuti notturni (22–6) di un turno [s,e) in minuti, e può superare 1440 */
  function minutiNotturni(s, e) {
    let n = 0;
    for (let base = -1440; base <= 1440; base += 1440) {
      const ranges = [[base + 22 * 60, base + 30 * 60]];
      for (const [a, b] of ranges) n += Math.max(0, Math.min(e, b) - Math.max(s, a));
    }
    return n;
  }
  function durataTurno(t) {
    let s = toMin(t.inizio), e = toMin(t.fine);
    if (e <= s) e += 1440;
    const pausa = Number(t.pausa) || 0;
    const tot = Math.max(0, e - s - pausa);
    const notte = Math.max(0, Math.min(tot, minutiNotturni(s, e)));
    return { ore: tot / 60, oreNotte: notte / 60 };
  }
  function lunediDi(dateStr) {
    const d = new Date(dateStr + 'T12:00:00'); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return iso(d);
  }

  /**
   * Classifica i turni di un mese.
   * giorni: { 'YYYY-MM-DD': { tipo:'turno'|'ferie'|'permesso'|'malattia'|'assenza'|'riposo', inizio, fine, pausa, ore } }
   */
  function classificaMese(giorni, ym, job, patrono) {
    const c = contratto(job, ym);
    const oreGiorno = c.oreSett / (Number(job.giorniSett) || 5);
    const [y] = ym.split('-').map(Number);
    const fest = Object.assign({}, festivita(y - 1, patrono), festivita(y, patrono), festivita(y + 1, patrono));
    const out = { ordinarie: 0, supplementari: 0, straord15: 0, straord20: 0, festive: 0, domenicali: 0, notturne: 0,
      ferieGiorni: 0, permessiOre: 0, malattiaGiorni: 0, assenzaOre: 0, malattiaRidotti: 0, turni: 0, dettaglio: [] };
    // raggruppa per settimana (lun–dom) includendo i giorni a cavallo del mese
    const keys = Object.keys(giorni).sort();
    const settimane = {};
    for (const k of keys) { const w = lunediDi(k); (settimane[w] = settimane[w] || []).push(k); }
    // conteggio giorni consecutivi di malattia per la riduzione 4°–20° giorno
    let malStreak = 0, prevMal = null;
    const malIndex = {};
    for (const k of keys) {
      if (giorni[k] && giorni[k].tipo === 'malattia') {
        const d = new Date(k + 'T12:00:00');
        if (prevMal) { const p = new Date(prevMal + 'T12:00:00'); malStreak = (d - p) / 864e5 <= 1.5 ? malStreak + 1 : 1; }
        else malStreak = 1;
        prevMal = k; malIndex[k] = malStreak;
      }
    }
    for (const w of Object.keys(settimane).sort()) {
      let cum = 0;
      for (const k of settimane[w]) {
        const g = giorni[k]; if (!g) continue;
        const inMese = k.startsWith(ym);
        if (g.tipo === 'ferie' || g.tipo === 'permesso') {
          const ore = g.tipo === 'permesso' ? Number(g.ore) || oreGiorno : oreGiorno;
          cum += ore;
          if (inMese) { if (g.tipo === 'ferie') out.ferieGiorni += 1; else out.permessiOre += ore; }
          continue;
        }
        if (g.tipo === 'malattia') {
          cum += oreGiorno;
          if (inMese) { out.malattiaGiorni += 1; const i = malIndex[k]; if (i >= 4 && i <= 20) out.malattiaRidotti += 1; }
          continue;
        }
        if (g.tipo === 'assenza') { if (inMese) out.assenzaOre += Number(g.ore) || oreGiorno; continue; }
        if (g.tipo !== 'turno') continue;
        const { ore, oreNotte } = durataTurno(g);
        const dow = new Date(k + 'T12:00:00').getDay();
        const isFest = !!fest[k];
        const row = { data: k, ore, festivo: isFest ? fest[k] : null, domenica: dow === 0, ordinarie: 0, supplementari: 0, straord15: 0, straord20: 0 };
        if (isFest) {
          if (inMese) { out.festive += ore; out.turni += 1; out.notturne += oreNotte; out.dettaglio.push(row); }
          continue;
        }
        let resto = ore;
        const take = (cap) => { const q = Math.max(0, Math.min(resto, cap - cum)); cum += q; resto -= q; return q; };
        row.ordinarie = take(c.oreSett);
        row.supplementari = take(Math.max(c.oreSett, c.oreFull));
        row.straord15 = take(48);
        row.straord20 = resto; cum += resto; resto = 0;
        if (inMese) {
          out.turni += 1;
          out.ordinarie += row.ordinarie; out.supplementari += row.supplementari;
          out.straord15 += row.straord15; out.straord20 += row.straord20;
          if (row.domenica) out.domenicali += ore;
          out.notturne += oreNotte;
          out.dettaglio.push(row);
        }
      }
    }
    return out;
  }

  /** Importi delle voci variabili da una classificazione */
  function importiVariabili(cl, c, job) {
    const h = c.pagaOraria, M = c.magg;
    const contaDomenica = job.domenicaRiposo !== false;
    const v = {
      supplementare: cl.supplementari * h * (1 + M.supplementare / 100),
      straordinario: cl.straord15 * h * (1 + M.straord48 / 100) + cl.straord20 * h * (1 + M.straordOltre48 / 100),
      festivo: cl.festive * h * (1 + M.festivo / 100),
      maggDomenicale: cl.domenicali * h * (M.domenicale / 100),
      maggNotturno: cl.notturne * h * (M.notturno / 100),
      malattia: -cl.malattiaRidotti * c.pagaGiornaliera * 0.25,
      assenza: -cl.assenzaOre * h,
    };
    v.totale = Object.values(v).reduce((a, b) => a + b, 0);
    // maggiorazioni agevolabili al 15%: festivo (sola maggiorazione), notturno, domenica se giorno di riposo
    v.magg15 = cl.festive * h * (M.festivo / 100) + v.maggNotturno + (contaDomenica ? v.maggDomenicale : 0);
    return v;
  }

  /** Ratei: ferie (giorni), ROL ed ex festività (ore) maturati in un anno */
  function permessiAnnui(job, oggiISO) {
    const p = contratto(job, oggiISO.slice(0, 7)).p;
    const rolPieno = job.oltre15 === false ? 56 : 72;
    let fattore = 1;
    if (job.inizio && job.inizio > '2011-02-26') {
      const anni = (new Date(oggiISO) - new Date(job.inizio)) / (365.25 * 864e5);
      fattore = anni < 2 ? 0 : anni < 4 ? 0.5 : 1;
    }
    if (job.ccnl === 'cinema') return { ferieGiorni: 26, rolOre: 44 * p, exFestOre: 0 }; // 44 ore annue di riduzione d'orario
    return { ferieGiorni: 26, rolOre: rolPieno * fattore * p, exFestOre: 32 * p };
  }

  /* ---------- NASpI 2026 (circ. INPS 4/2026) ---------- */
  const NASPI = { rif: 1456.72, max: 1584.70 };
  function naspi(settimane, retribuzioneTot, over55) {
    const rmm = settimane > 0 ? retribuzioneTot / settimane * 4.33 : 0;
    let imp = rmm <= NASPI.rif ? rmm * 0.75 : NASPI.rif * 0.75 + (rmm - NASPI.rif) * 0.25;
    imp = Math.min(imp, NASPI.max);
    const durataSett = Math.min(104, Math.floor(settimane / 2));
    const mesiTot = durataSett / 4.33;
    const start = over55 ? 8 : 6;
    const mesi = []; let tot = 0;
    for (let m = 1; m <= Math.ceil(mesiTot); m++) {
      const f = m < start ? 1 : Math.pow(0.97, m - start + 1);
      const quota = Math.min(1, mesiTot - (m - 1));
      const v = imp * f * quota; mesi.push({ mese: m, importo: v, ridotto: f < 1, parziale: quota < 1 }); tot += v;
    }
    return { rmm, importo: imp, durataSett, mesiTot, mesi, totale: tot, requisito: settimane >= 13 };
  }
  /** IRPEF su una prestazione mensile assimilata a lavoro dipendente (es. NASpI) */
  function nettoAssimilato(lordoMese, mesiAnno = 12) {
    const R = lordoMese * mesiAnno;
    const lorda = irpefLorda(R);
    let detr = detrazioneLavoro(R) * mesiAnno / 12; if (R <= 15000) detr = Math.max(detr, 690);
    const imposta = Math.max(0, lorda - detr) / mesiAnno;
    return lordoMese - imposta;
  }
  /** Tassazione separata del TFR: aliquota media sul reddito di riferimento */
  function tassaTFR(tfr, anni) {
    if (tfr <= 0) return { imposta: 0, aliquota: 0 };
    const RR = tfr / Math.max(anni, 1 / 12) * 12;
    const al = irpefLorda(RR, 2026) / RR;
    return { imposta: tfr * al, aliquota: al };
  }

  const api = {
    TABELLE, NASPI, naspi, nettoAssimilato, tassaTFR,
    r2, CCNL, COMMERCIO_LIVELLI, REGIONI, minimoCommercio, aumentiRinnovoCommercio, contratto,
    irpefLorda, detrazioneLavoro, cuneo, trattamentoIntegrativo, addizionaleRegionale, addizionaleComunale,
    calcolaAnnuo, calcolaMese, rateAddizionali, festivita, pasqua, durataTurno, classificaMese,
    importiVariabili, permessiAnnui, iso, lunediDi,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
