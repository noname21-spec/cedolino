
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
    <button class="btn block" data-act="ob-next">Iniziamo</button><button class="btn google block" style="margin-top:10px" data-act="login-google">${GOOGLE_G} Accedi con Google</button><div class="row" style="justify-content:center;gap:18px;margin-top:10px"><button class="link" data-act="import">Ho un backup</button><button class="link" data-act="ob-skip">Salta</button></div><p class="note" style="text-align:center">Con Google ritrovi i tuoi dati su ogni dispositivo. Senza account restano solo su questo telefono.</p>`;
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
