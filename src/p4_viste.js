
/* ============ viste: elementi comuni ============ */
const topbar = (title, sub, right = '', back = '') => `<div class="top">${back ? `<a class="iconbtn back" href="${back}" aria-label="Indietro">${ic.back}</a>` : ''}<h1>${title}${sub ? `<span class="sub">${sub}</span>` : ''}</h1>${right}</div>`;
const gearBtn = `<a class="iconbtn" href="#impostazioni" aria-label="Impostazioni">${ic.gear}</a>`;
function accountBtn() {
  const m = (sbUser && sbUser.user_metadata) || {};
  if (sbUser) return `<button class="iconbtn avatar" data-act="account" aria-label="Il tuo account">${m.avatar_url ? `<img src="${esc(m.avatar_url)}" alt="" referrerpolicy="no-referrer">` : esc(((m.full_name || sbUser.email || '?')[0] || '?').toUpperCase())}</button>`;
  return `<button class="iconbtn" data-act="login-google" aria-label="Accedi con Google">${GOOGLE_G}</button>`;
}
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
  let h = topbar(`${saluto}${P.nome ? `, ${esc(P.nome)}` : ''}`, cap(new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })), `<div class="row" style="gap:8px">${accountBtn()}${gearBtn}</div>`);
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
