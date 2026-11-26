
/* =====================================================================
   Novità: timbro da Comandi rapidi/NFC, avvisi sul telefono, turni nel Calendario,
   busta contro turni, ferie pianificate, simulatore «e se», dossier PDF, traguardi
   ===================================================================== */
const avURL = () => SB_URL + '/functions/v1/cedolino-avvisi';
const VAPID_PUB = 'BCra21g86AZWEiTWpPmINgXkZxqLAnGIMLYZDX96vHwHkTC_X-n3Fpb0Zw3ybMbAd_PoVkCWLYBF4PvPsZO72yA';
/** id e segreto di questo telefono per gli avvisi (restano solo qui, non vanno nella sincronizzazione) */
function dispo() {
  let d = null; try { d = JSON.parse(localStorage.getItem('cedolino.dev') || 'null'); } catch (e) {}
  if (!d || !d.dev) {
    const r = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (x) => x.toString(16).padStart(2, '0')).join('');
    d = { dev: 'c' + r(10), sec: r(24) }; try { localStorage.setItem('cedolino.dev', JSON.stringify(d)); } catch (e) {}
  }
  return d;
}
function dispoSet(k, v) { const d = dispo(); d[k] = v; try { localStorage.setItem('cedolino.dev', JSON.stringify(d)); } catch (e) {} }
async function avApi(a, body = {}) {
  const d = dispo(); const r = await fetch(`${avURL()}?a=${a}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ dev: d.dev, sec: d.sec }, body)) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.errore || 'rete'); return j;
}
const isoLocale = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const oraLocale = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/* ---------- 1. Timbrare senza aprire l'app (Comandi rapidi, tasto Azione, NFC) ---------- */
async function comandiSheet() {
  const sh = openSheet(`<h3>Timbra senza aprire l'app</h3><p class="lead">Preparo il tuo collegamento personale…</p>`);
  let tok = dispo().tok;
  try { if (!tok) { tok = (await avApi('token')).token; dispoSet('tok', tok); } }
  catch (e) { sh.querySelector('.lead').textContent = 'Serve la connessione a internet per preparare il collegamento. Riprova tra poco.'; return; }
  const base = `${avURL()}?a=timbra&t=${tok}`;
  const riga = (t, u, d) => `<div class="cmd"><div><b>${t}</b><small>${d}</small></div><button type="button" class="btn sm ghost" data-copia="${esc(u)}">${ic.link || ''} Copia</button></div>`;
  sh.innerHTML = `<div class="grab"></div><h3>Timbra senza aprire l'app</h3>
    <p class="lead">Con un comando di iPhone segni inizio e fine turno da Siri, dal tasto Azione o avvicinando il telefono a un adesivo NFC al lavoro. Funziona anche con Cedolino chiusa: quando la riapri, il turno è già lì.</p>
    ${riga('Timbra (inizio o fine)', base, 'Un solo comando: se il turno è aperto lo chiude, altrimenti lo inizia. Ideale per NFC e tasto Azione.')}
    ${riga('Solo inizio turno', base + '&tipo=inizio', 'Per un comando «Inizio turno» da dire a Siri.')}
    ${riga('Solo fine turno', base + '&tipo=fine', 'Per un comando «Fine turno».')}
    <div class="sec-title" style="margin-top:16px">Crea il comando</div>
    <ol class="steps"><li>Apri <b>Comandi</b>, tocca <b>+</b>, poi <b>Aggiungi azione</b> e scegli <b>Ottieni contenuti dell'URL</b>.</li><li>Incolla il collegamento che hai copiato.</li><li>Aggiungi l'azione <b>Mostra notifica</b> e lasciale come testo i <b>Contenuti dell'URL</b>: vedrai «Turno iniziato alle 9:02 ✓».</li><li>Chiama il comando <b>Timbra</b>: puoi dire «Ehi Siri, timbra».</li></ol>
    <div class="sec-title">Tasto Azione</div><p class="small muted" style="margin:0 0 10px">Impostazioni › Tasto Azione › <b>Comando rapido</b> › scegli <b>Timbra</b>.</p>
    <div class="sec-title">Adesivo NFC al lavoro</div><p class="small muted" style="margin:0 0 10px">Comandi › <b>Automazione</b> › <b>+</b> › <b>NFC</b> › avvicina l'adesivo › <b>Esegui subito</b> › scegli il comando <b>Timbra</b>. Da quel momento basta toccare l'adesivo col telefono.</p>
    <p class="note">Il collegamento è personale: chi lo conosce può timbrare al posto tuo, quindi non condividerlo. Se serve, puoi cambiarlo.</p>
    <div class="btns"><button type="button" class="btn ghost" data-x="nuovo">Cambia collegamento</button><button type="button" class="btn" data-x="ok">Fatto</button></div>`;
  sh.addEventListener('click', async (e) => {
    const c = e.target.closest('[data-copia]'); if (c) copia(c.dataset.copia);
    if (e.target.closest('[data-x="ok"]')) closeSheet();
    if (e.target.closest('[data-x="nuovo"]')) { try { localStorage.removeItem('cedolino.dev'); } catch (err) {} closeSheet(); toast('Collegamento nuovo: rifai la copia nei Comandi'); comandiSheet(); }
  });
}
/** chiude il turno aperto con l'ora indicata (senza chiedere nulla) */
function chiudiTimbro(dataFine, oraFine) {
  const t = S.timbro; if (!t) return false;
  const T = (S.turni[t.jobId] = S.turni[t.jobId] || {});
  const rec = { tipo: 'turno', inizio: t.inizio, fine: oraFine, pausa: 0, u: Date.now() };
  if (E.durataTurno(rec).ore <= 0 && dataFine === t.data) return false;
  T[t.data] = rec; S.timbro = null; return true;
}
let timbriBusy = false;
/** recupera i timbri arrivati dai comandi rapidi; con «nuovo» avvisa il server di un timbro fatto nell'app */
async function recuperaTimbri(nuovo) {
  if (!dispo().tok || timbriBusy) return; timbriBusy = true;
  try {
    const r = await avApi('timbri', nuovo ? { nuovo: { tipo: nuovo } } : {}); let n = 0;
    for (const t of r.timbri || []) {
      const d = new Date(t.quando); const data = isoLocale(d), ora = oraLocale(d);
      if (t.tipo === 'inizio' && !S.timbro) { const j = attivo(); if (j) { S.timbro = { jobId: j.id, data, inizio: ora }; n++; } }
      else if (t.tipo === 'fine' && S.timbro && chiudiTimbro(data, ora)) n++;
    }
    if (n) { save(); render(); toast(n === 1 ? 'Ho aggiunto il timbro arrivato dal comando rapido' : `Ho aggiunto ${n} timbri arrivati dai comandi rapidi`); }
  } catch (e) { /* offline: ci riprovo alla prossima apertura */ }
  timbriBusy = false;
}

/* ---------- 2. Avvisi sul telefono (notifiche) ---------- */
const avvisiPossibili = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
function b64url(s) { const p = '='.repeat((4 - (s.length % 4)) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, (c) => c.charCodeAt(0)); }
async function attivaAvvisi() {
  if (inAppIOS) { toast('Nell’app per iPhone gli avvisi non ci sono: usa «Turni nel Calendario» in Impostazioni per i promemoria dei turni'); return; }
  if (isIOS() && !isStandalone()) { toast('Su iPhone gli avvisi arrivano solo dall’app aperta dalla schermata Home: aggiungila con Condividi › Aggiungi alla schermata Home e riprova da lì'); return; }
  if (!avvisiPossibili()) { toast('Questo browser non può ricevere avvisi: usa "Aggiungi al calendario"'); return; }
  if (!navigator.onLine) { toast('Serve la connessione per attivare gli avvisi'); return; }
  let passo = 'permesso';
  try {
    const p = await Notification.requestPermission();
    if (p !== 'granted') { toast(p === 'denied' ? 'Gli avvisi sono bloccati: sbloccali da Impostazioni › Notifiche › Cedolino e riprova' : 'Non hai dato il permesso: riprova e tocca «Consenti»'); return; }
    passo = 'iscrizione';
    const reg = swReg || (await navigator.serviceWorker.ready);
    let sub = await reg.pushManager.getSubscription(); if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64url(VAPID_PUB) });
    passo = 'servizio';
    await avApi('registra', { sub: sub.toJSON() });
    S.avvisi = { on: true }; S.notifiche = false; save(); await programmaAvvisi(); render(); toast('Avvisi attivi. Per controllare, manda un avviso di prova');
  } catch (e) {
    const m = String((e && (e.message || e.name)) || '');
    toast(passo === 'iscrizione' ? `Il telefono non ha accettato l'iscrizione agli avvisi (${m || 'errore'}): chiudi e riapri l'app dalla schermata Home, poi riprova` : passo === 'servizio' ? `Il servizio degli avvisi non ha risposto (${m === 'rete' ? 'connessione' : m}): riprova tra poco` : `Non sono riuscito a chiedere il permesso (${m || 'errore'})`);
  }
}
async function provaAvvisi() {
  if (!S.avvisi || !S.avvisi.on) { attivaAvvisi(); return; }
  if (window.Notification && Notification.permission !== 'granted') { toast('Gli avvisi sono bloccati nelle Impostazioni del telefono: sbloccali e riattivali'); return; }
  try { localStorage.setItem('cedolino.prova', String(Date.now())); } catch (e) {}
  try { const reg = swReg || (await navigator.serviceWorker.ready); const sub = await reg.pushManager.getSubscription(); if (!sub) { S.avvisi = { on: false }; save(); render(); toast('L’iscrizione agli avvisi è scaduta: toccali per riattivarli'); return; } await avApi('registra', { sub: sub.toJSON() }); await avApi('programma', { avvisi: elencoAvvisi() }); toast('Ti mando un avviso di prova entro 5 minuti: puoi anche chiudere l’app'); }
  catch (e) { toast('Il servizio degli avvisi non ha risposto: riprova tra poco'); }
}
async function spegniAvvisi() {
  S.avvisi = { on: false }; save(); render();
  try { await avApi('togli', { cosa: 'avvisi' }); const reg = swReg || (await navigator.serviceWorker.ready); const s = await reg.pushManager.getSubscription(); if (s) await s.unsubscribe(); } catch (e) {}
  toast('Avvisi spenti');
}
function elencoAvvisi() {
  const out = []; const ora = Date.now(), lim = ora + 45 * 864e5; const P = S.profilo;
  const at = (iso, h, m = 0) => { const d = new Date(iso + 'T00:00:00'); d.setHours(h, m, 0, 0); return d; };
  const add = (d, titolo, testo, url) => { if (d.getTime() > ora + 30000 && d.getTime() < lim) out.push({ quando: d.toISOString(), titolo, testo, url }); };
  try { const t = Number(localStorage.getItem('cedolino.prova')); if (t && ora < t + 10 * 60e3) out.push({ quando: new Date(Math.max(ora + 45000, t + 45000)).toISOString(), titolo: 'Cedolino', testo: 'Prova riuscita: gli avvisi arrivano anche ad app chiusa.', url: './#home' }); } catch (e) {}
  if (S.timbro) { const d = at(S.timbro.data, ...S.timbro.inizio.split(':').map(Number)); d.setHours(d.getHours() + 10); add(d, 'Turno ancora aperto', `Hai iniziato alle ${S.timbro.inizio}: ti sei dimenticato di chiuderlo?`, './#turni'); }
  for (const j of S.lavori.filter(corrente)) {
    const T = S.turni[j.id] || {};
    for (let i = 1; i <= 14; i++) { const k = addDays(todayISO(), i); const g = T[k]; if (g && g.tipo === 'turno') { const v = at(addDays(k, -1), 20); add(v, `Domani turno ${g.inizio}–${g.fine}`, `${j.azienda} · ${cap(new Date(k + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }))}`, './#turni'); } }
    if (j.fine) { [30, 7].forEach((n) => add(at(addDays(j.fine, -n), 9), `Il contratto con ${j.azienda} scade tra ${n} giorni`, `Scade il ${dateLabel(j.fine)}. Guarda liquidazione e NASpI per arrivare preparato.`, `./#fine-${j.id}`)); }
  }
  const j = attivo();
  for (let i = 0; i < 2 && j; i++) {
    const ym = addYM(curYM(), i); const [y, m] = ym.split('-').map(Number); const dim = new Date(y, m, 0).getDate();
    const gp = Math.min(dim, Number(P.giornoPaga) || 10); const ymPag = P.pagaMeseSucc ? addYM(ym, -1) : ym; const st = stima(j, ymPag);
    add(at(`${ym}-${pad(gp)}`, 9), 'Oggi arriva lo stipendio', `${st ? `Per ${meseDi(ymPag)} mi aspetto circa ${eur(st.res.netto)}. ` : ''}Quando arriva la busta, caricala: controllo che i conti tornino.`, './#home');
    const gb = Math.min(dim, Number(P.giornoBusta) || 15); const ymB = addYM(ym, -1);
    if (!S.buste.some((b) => b.jobId === j.id && b.ym === ymB)) add(at(`${ym}-${pad(gb)}`, 18), `È arrivata la busta di ${meseDi(ymB)}?`, 'Caricala in Cedolino: leggo io i numeri e controllo che tornino.', './#azione-busta');
  }
  return out.sort((a, b) => (a.quando < b.quando ? -1 : 1)).slice(0, 60);
}
async function programmaAvvisi() { if (!S.avvisi || !S.avvisi.on) return; try { await avApi('programma', { avvisi: elencoAvvisi() }); } catch (e) {} }

/* ---------- 3. Turni nel Calendario dell'iPhone (calendario a cui ci si iscrive) ---------- */
function icsTesto(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
function costruisciIcs() {
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cedolino//Turni//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Turni (Cedolino)', 'X-WR-TIMEZONE:Europe/Rome', 'REFRESH-INTERVAL;VALUE=DURATION:PT1H', 'X-PUBLISHED-TTL:PT1H',
    'BEGIN:VTIMEZONE', 'TZID:Europe/Rome', 'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT', 'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD', 'END:VTIMEZONE'];
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); const da = addDays(todayISO(), -62);
  const d8 = (k) => k.replace(/-/g, ''); const t6 = (h) => h.replace(':', '') + '00';
  for (const j of S.lavori) {
    for (const [k, g] of Object.entries(S.turni[j.id] || {})) {
      if (k < da) continue; const uid = `${j.id}-${k}@cedolino`;
      if (g.tipo === 'turno') {
        const fineK = g.fine <= g.inizio ? addDays(k, 1) : k; const du = E.durataTurno(g);
        L.push('BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`, `DTSTART;TZID=Europe/Rome:${d8(k)}T${t6(g.inizio)}`, `DTEND;TZID=Europe/Rome:${d8(fineK)}T${t6(g.fine)}`, `SUMMARY:${icsTesto(`Turno · ${j.azienda}`)}`, `DESCRIPTION:${icsTesto(`${num(du.ore, 2)} ore${g.pausa ? `, pausa ${g.pausa} min` : ''}. Da Cedolino.`)}`, 'TRANSP:OPAQUE', 'END:VEVENT');
      } else {
        const nome = { ferie: 'Ferie', permesso: 'Permesso', malattia: 'Malattia', assenza: 'Assenza' }[g.tipo] || g.tipo;
        L.push('BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d8(k)}`, `DTEND;VALUE=DATE:${d8(addDays(k, 1))}`, `SUMMARY:${icsTesto(`${nome} · ${j.azienda}`)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT');
      }
    }
  }
  L.push('END:VCALENDAR'); return L.join('\r\n') + '\r\n';
}
const calURL = (tok, webcal) => `${webcal ? avURL().replace(/^https:/, 'webcal:') : avURL()}?a=cal&t=${tok}`;
async function aggiornaCalendario() {
  if (!S.cal || !S.cal.on) return;
  try { const r = await avApi('ics', { ics: costruisciIcs() }); if (r.token && r.token !== S.cal.token) { S.cal.token = r.token; save({ noSync: true }); } } catch (e) {}
}
async function attivaCalendario() {
  try { const r = await avApi('ics', { ics: costruisciIcs() }); S.cal = { on: true, token: r.token }; save(); render(); calendarioSheet(); }
  catch (e) { toast('Serve la connessione a internet: riprova tra poco'); }
}
function calendarioSheet() {
  if (!S.cal || !S.cal.token) return;
  const sh = openSheet(`<h3>Turni nel Calendario</h3><p class="lead">Tocca il tasto e conferma «Iscriviti»: i turni, le ferie e i permessi compaiono nel Calendario dell'iPhone accanto agli altri impegni, e si aggiornano da soli quando li cambi qui.</p>
    <a class="btn block" href="${esc(calURL(S.cal.token, true))}">${ic.cal} Aggiungi al Calendario</a>
    <button type="button" class="btn ghost block" style="margin-top:10px" data-x="copia">${ic.link || ''} Copia l'indirizzo</button>
    <p class="note">Su Android o al computer: in Google Calendar scegli «Altri calendari › Da URL» e incolla l'indirizzo. Il Calendario controlla le novità più o meno ogni ora.</p>
    <button type="button" class="btn ghost block" data-x="ok">Fatto</button>`);
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-x="copia"]')) copia(calURL(S.cal.token)); if (e.target.closest('[data-x="ok"]')) closeSheet(); });
}
async function spegniCalendario() { S.cal = { on: false }; save(); render(); try { await avApi('togli', { cosa: 'cal' }); } catch (e) {} toast('Calendario dei turni spento'); }

function cardComodita() {
  const av = S.avvisi && S.avvisi.on, cal = S.cal && S.cal.on;
  return `<div class="sec-title">Comodità</div><div class="card">
    <div class="row"><div class="ic b icbox">${ic.clock}</div><div class="grow"><b>Timbra senza aprire l'app</b><div class="small muted">Da Siri, dal tasto Azione o con un adesivo NFC al lavoro.</div></div><button class="btn sm ghost" data-act="comandi">Prepara</button></div>
    ${inAppIOS ? '' : `    <div class="row" style="margin-top:14px"><div class="ic a icbox">${ic.bell}</div><div class="grow"><b>Avvisi sul telefono</b><div class="small muted">${av ? 'Attivi: turno non chiuso, turno di domani, stipendio, busta da caricare, contratto in scadenza.' : 'Turno non chiuso, turno di domani, giorno di paga, busta da caricare, contratto in scadenza.'}</div></div>${av ? '<button class="btn sm ghost" data-act="avvisi-off">Spegni</button>' : '<button class="btn sm" data-act="avvisi-on">Attiva</button>'}</div>
    ${av ? '<button class="link" style="margin-top:8px" data-act="avvisi-prova">Manda un avviso di prova</button>' : ''}`}
    <div class="row" style="margin-top:14px"><div class="ic g icbox">${ic.cal}</div><div class="grow"><b>Turni nel Calendario</b><div class="small muted">${cal ? 'Attivo: si aggiorna da solo.' : 'I turni compaiono nel Calendario dell’iPhone e si aggiornano da soli.'}</div></div>${cal ? '<button class="btn sm ghost" data-act="cal-apri">Indirizzo</button>' : '<button class="btn sm" data-act="cal-on">Attiva</button>'}</div>
    ${cal ? '<button class="link" style="margin-top:10px" data-act="cal-off">Spegni il calendario dei turni</button>' : ''}
    <p class="note" style="margin-bottom:0">Avvisi e calendario passano da un piccolo servizio di Cedolino: riceve solo gli orari dei turni e i testi degli avvisi, non le buste né gli importi del contratto.</p></div>`;
}

/* ---------- 4. Busta contro turni ---------- */
function cardConfronto(b) {
  const j = job(b.jobId); if (!j || b.tipo !== 'mensile') return '';
  const st = stima(j, b.ym); if (!st || !st.cl) return '';
  const cl = st.cl;
  const righe = [['Supplementari e straordinari', cl.supplementari + cl.straord15 + cl.straord20, b.oreExtra], ['Ore di domenica', cl.domenicali, b.oreDom], ['Ore festive', cl.festive, b.oreFest], ['Ore notturne (22–6)', cl.notturne, b.oreNott]].filter((r) => r[1] > 0.01 || r[2] != null);
  if (!righe.length) return '';
  const diffe = righe.filter((r) => r[2] != null && Math.abs(r[2] - r[1]) > 0.5); const mancano = righe.filter((r) => r[2] == null);
  return `<div class="card"><h2><span class="grow">Busta contro turni</span><span class="badge n">${cap(meseDi(st.vym))}</span></h2>
    <div class="cmp"><span class="h">Voce</span><span class="h">Turni</span><span class="h">Busta</span><span class="h">Diff.</span>
    ${righe.map(([k, t, v]) => { const d = v == null ? null : v - t; return `<span>${k}</span><span>${num(t, 2)} h</span><span>${v == null ? '—' : num(v, 2) + ' h'}</span><span class="${d == null ? 'faint' : Math.abs(d) <= 0.5 ? 'pos' : 'neg'}">${d == null ? '—' : Math.abs(d) <= 0.5 ? '✓' : (d > 0 ? '+' : '') + num(d, 2)}</span>`; }).join('')}</div>
    ${diffe.length ? `<p class="small" style="margin:10px 0 0;color:var(--bad)">${diffe.length === 1 ? 'Una voce non torna' : `${diffe.length} voci non tornano`}: possono essere pagate il mese dopo o finite in banca ore, ma è giusto chiedere.</p><button class="btn block" style="margin-top:10px" data-act="lettera" data-id="${b.id}">${ic.mail} Chiedi all'ufficio paghe</button>` : righe.some((r) => r[2] != null) ? '<p class="small" style="margin:10px 0 0;color:var(--ok)">Le ore che hai segnato sono pagate tutte ✓</p>' : ''}
    ${mancano.length ? `<p class="note" style="margin-bottom:0">Per le voci con «—» scrivi le ore che trovi in busta: <button class="link" data-act="busta-edit" data-id="${b.id}">Modifica › Altri dati</button>.</p>` : ''}</div>`;
}

/* ---------- 5. Ferie pianificate ---------- */
let modoFerie = false;
function previsioneFerie(j) {
  const y = todayISO().slice(0, 4); const fine = `${y}-12-31`; const T = S.turni[j.id] || {}; const oggi = todayISO();
  const pian = Object.entries(T).filter(([k, g]) => k > oggi && k <= fine && g.tipo === 'ferie').length;
  const sd = saldi(j, fine); return sd ? { pian, fine: sd.ferie, og: sd.oreGiorno, anno: y } : null;
}
function cardPianificaFerie(j) {
  const p = previsioneFerie(j); if (!p) return '';
  return `<div class="kv tot"><span class="k">A fine ${p.anno} ti resteranno</span><span class="v ${p.fine < -0.01 ? 'neg' : ''}">${fmtFerie(p.fine, p.og)}</span></div>
    <p class="small muted" style="margin:6px 0 0">${p.pian ? `Conto già ${p.pian} ${p.pian === 1 ? 'giorno' : 'giorni'} di ferie segnati da qui a dicembre e quelle che maturerai nei prossimi mesi.` : 'Conto le ferie che maturerai nei prossimi mesi. Segna i giorni che vuoi prendere per vedere quante te ne restano.'}${p.fine < -0.01 ? ' <b style="color:var(--bad)">Ne hai segnate più di quelle che avrai.</b>' : ''}</p>
    <button class="btn ${modoFerie ? '' : 'ghost'} block" style="margin-top:12px" data-act="pianifica-ferie">${ic.sun} ${modoFerie ? 'Fatto' : 'Pianifica le ferie sul calendario'}</button>`;
}
function bannerFerie(j) {
  if (!modoFerie) return ''; const p = previsioneFerie(j);
  return `<div class="banner ferie">${ic.sun}<div class="grow"><b>Tocca i giorni da prendere in ferie</b><div class="small">${p ? `A fine ${p.anno} te ne resteranno ${fmtFerie(p.fine, p.og)}` : ''}</div></div><button class="btn sm" data-act="pianifica-ferie">Fatto</button></div>`;
}
function toggleFerie(k) {
  const j = job(turniJob) || attivo(); if (!j) return; const T = (S.turni[j.id] = S.turni[j.id] || {}); const g = T[k];
  if (g && g.tipo !== 'ferie') { toast('In quel giorno c’è già un turno o un permesso'); return; }
  if (g) { delete T[k]; segnaEliminato(`T|${j.id}|${k}|${Date.now()}`); } else T[k] = { tipo: 'ferie', u: Date.now() };
  save(); const y = scrollY; render(); scrollTo(0, y);
}

/* ---------- 6. Simulatore «e se…» ---------- */
let sim = null;
function simCalcola(j, o) {
  const P = S.profilo; const cr = crDi(j); const ym = curYM();
  const jj = Object.assign({}, jCalc(j), { oreSett: o.ore, livello: o.livello });
  const c = E.contratto(jj, ym); const og = c.oreSett / (Number(j.giorniSett) || 5); const full = c.oreSett >= (Number(j.oreSettFull) || 40) - 0.01;
  const cl = { ordinarie: 0, supplementari: full ? 0 : o.extra, straord15: full ? o.extra : 0, straord20: 0, festive: o.fest * og, domenicali: o.dom * og, notturne: o.nott, malattiaRidotti: 0, assenzaOre: 0 };
  const v = E.importiVariabili(cl, c, j); const mens = c.mensilita; const red25 = toNum(P.reddito2025);
  const a = E.calcolaAnnuo(Object.assign({}, P, { lordo: c.base * mens + v.totale * 12, anno: 2026, giorni: 365, td: isTD(j), magg15: v.magg15 * 12, aum5: (c.aumentiRinnovo || 0) * mens, reddito2025: red25 == null ? undefined : red25, contribRate: cr }));
  const m = E.calcolaMese({ ym, ordinario: c.base + v.totale, aggiuntiva: 0, magg15: v.magg15, aum5: c.aumentiRinnovo || 0, Rannuo: a.imponibile, RagevAnnuo: a.imponibile - a.R, giorniAnno: 365, contribRate: cr, td: isTD(j), flat15ok: P.flatTax && (red25 == null || red25 <= 40000), flat5ok: P.flatTax && (red25 == null || red25 <= 33000) });

  return { c, v, a, mese: m.netto, anno: a.netto, lordoMese: c.base + v.totale, oraria: a.netto / Math.max(1, c.oreSett * 52 + o.extra * 12) };
}
function viewSeFosse() {
  let h = topbar('E se…', 'Prova a cambiare ore, livello e turni', '', '#home');
  const j = attivo();
  if (!j || j.tipo === 'chiamata' || j.ccnl === 'altro') return h + vuoto(ic.calc, 'Serve un lavoro con contratto', 'Il simulatore parte dal tuo contratto attuale (CCNL, livello e ore). Per i lavori a chiamata o con contratto «altro» usa Calcola netto.');
  if (!sim || sim.jobId !== j.id) sim = { jobId: j.id, ore: Number(j.oreSett) || 40, livello: String(j.livello || '4'), dom: 0, fest: 0, extra: 0, nott: 0 };
  const oggi = simCalcola(j, { ore: Number(j.oreSett) || 40, livello: String(j.livello || '4'), dom: 0, fest: 0, extra: 0, nott: 0 });
  const se = simCalcola(j, sim); const dM = se.mese - oggi.mese, dA = se.anno - oggi.anno;
  const liv = livelliDi(j.ccnl || 'commercio');
  const rng = (n, l, v, min, max, step, u) => `<label class="field sim"><span>${l}<b>${num(v, step < 1 ? 1 : 0)}${u}</b></span><input type="range" name="${n}" min="${min}" max="${max}" step="${step}" value="${v}"></label>`;
  h += `<div class="card hero fade"><span class="kicker">Con le modifiche · busta di un mese normale</span><div class="big">${eur(se.mese)}</div>
    <div class="muted small">Oggi ${eur(oggi.mese)} · ${dM >= 0 ? '+' : ''}${eur(dM)} al mese · <b style="color:var(${dA >= 0 ? '--ok' : '--bad'})">${dA >= 0 ? '+' : ''}${eur0(dA)} netti l'anno</b></div>
    <div class="kv" style="margin-top:12px"><span class="k">Lordo del mese</span><span class="v">${eur(se.lordoMese)}</span></div>
    <div class="kv"><span class="k">Netto in un anno (con 13ª${se.c.mensilita >= 14 ? ' e 14ª' : ''})</span><span class="v">${eur(se.anno)}</span></div>
    <div class="kv"><span class="k">Netto per ogni ora lavorata</span><span class="v">${eur(se.oraria)}</span></div></div>`;
  h += `<form class="card" id="simForm"><h2>Cosa cambia</h2>
    ${rng('ore', 'Ore a settimana ', sim.ore, 8, 40, 1, ' h')}
    <label class="field"><span>Livello</span><select class="inp" name="livello">${liv.map(([k, l, v]) => `<option value="${k}" ${sim.livello === k ? 'selected' : ''}>${l} · ${eur(v)}</option>`).join('')}</select></label>
    ${rng('dom', 'Domeniche lavorate in più al mese ', sim.dom, 0, 5, 1, '')}
    ${rng('fest', 'Festivi lavorati in più al mese ', sim.fest, 0, 3, 1, '')}
    ${rng('extra', 'Ore extra al mese ', sim.extra, 0, 40, 1, ' h')}
    ${rng('nott', 'Ore di notte al mese (22–6) ', sim.nott, 0, 60, 2, ' h')}
    <button type="button" class="btn ghost block" data-act="sim-reset">Torna a com'è oggi</button></form>
    <p class="note">Stesse regole della stima della busta: ${esc(CCNL_NOMI[j.ccnl || 'commercio'] || '')}, maggiorazioni del contratto, tasse 2026 e detassazione al 15% delle maggiorazioni dove spetta. Le domeniche contano come giorno di riposo${j.domenicaRiposo === false ? ' (per te no: lo hai indicato nel lavoro)' : ''}.</p>`;
  return h;
}

/* ---------- 7. Dossier reddito in PDF ---------- */
function dossierSheet() {
  const j0 = attivo(); if (!S.lavori.length) { toast('Aggiungi prima un lavoro'); return; }
  const sh = openSheet(`<h3>Dossier reddito</h3><p class="lead">Un unico PDF ordinato con riepilogo, buste paga, CU e contratto: pronto per un affitto, un finanziamento o il CAF.</p>
    <form><label class="field"><span>Lavoro</span><select class="inp" name="job">${S.lavori.map((j) => `<option value="${j.id}" ${j0 && j.id === j0.id ? 'selected' : ''}>${esc(j.azienda)}</option>`).join('')}</select></label>
    <label class="field"><span>Buste paga</span><select class="inp" name="n"><option value="3">Le ultime 3</option><option value="6">Le ultime 6</option><option value="12">Le ultime 12</option></select></label>
    <label class="check"><input type="checkbox" name="cu" checked><span class="switch"></span><span class="grow">Aggiungi l'ultima CU</span></label>
    <label class="check"><input type="checkbox" name="contr" checked><span class="switch"></span><span class="grow">Aggiungi contratto e proroghe</span></label>
    <div class="btns" style="margin-top:12px"><button type="button" class="btn ghost" data-x="cancel">Annulla</button><button class="btn" type="submit">${ic.download} Crea il PDF</button></div></form>`);
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-x="cancel"]')) closeSheet(); });
  $('form', sh).addEventListener('submit', async (e) => {
    e.preventDefault(); const f = e.target; const bt = $('button[type=submit]', f); bt.disabled = true; bt.textContent = 'Preparo il PDF…';
    try { await creaDossier(job(f.job.value), Number(f.n.value), f.cu.checked, f.contr.checked); closeSheet(); }
    catch (err) { bt.disabled = false; bt.textContent = 'Riprova'; toast('Non sono riuscito a creare il PDF: ' + (err.message || 'errore')); }
  });
}
async function creaDossier(j, n, conCU, conContr) {
  if (!window.PDFLib) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
  const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
  const doc = await PDFDocument.create(); const fR = await doc.embedFont(StandardFonts.Helvetica), fB = await doc.embedFont(StandardFonts.HelveticaBold);
  const INK = rgb(0.075, 0.125, 0.353), MUT = rgb(0.36, 0.39, 0.5), LINE = rgb(0.85, 0.87, 0.92);
  const safe = (s) => String(s == null ? '' : s).replace(/[‘’]/g, "'").replace(/[“”«»]/g, '"').replace(/[^\x20-\x7E\u00A0-\u00FF€–—•…]/g, '');
  const P = S.profilo; const bs = S.buste.filter((b) => b.jobId === j.id && b.netto != null).sort((a, b) => (a.ym < b.ym ? 1 : -1)).slice(0, n);
  let pg = doc.addPage([595.28, 841.89]); let y = 790;
  const tx = (t, x, yy, size = 11, font = fR, color = INK) => pg.drawText(safe(t), { x, y: yy, size, font, color });
  const rx = (t, xr, yy, size = 11, font = fR, color = INK) => { const s = safe(t); pg.drawText(s, { x: xr - font.widthOfTextAtSize(s, size), y: yy, size, font, color }); };
  tx('Dossier reddito', 50, y, 24, fB); y -= 22; tx(`${P.nome || ''}${P.nascita ? ' · nato/a il ' + dateLabel(P.nascita) : ''}`, 50, y, 12, fR, MUT); y -= 14;
  tx(`Preparato con Cedolino il ${dateLabel(todayISO())}`, 50, y, 10, fR, MUT); y -= 30;
  pg.drawRectangle({ x: 50, y: y - 4, width: 495, height: 1, color: LINE }); y -= 22;
  tx('Lavoro', 50, y, 13, fB); y -= 18;
  const tipoTxt = { indeterminato: 'Tempo indeterminato', determinato: 'Tempo determinato', apprendistato: 'Apprendistato', chiamata: 'A chiamata', stagionale: 'Stagionale', somministrazione: 'Somministrazione' }[j.tipo] || j.tipo || '';
  const c = j.tipo !== 'chiamata' ? E.contratto(jCalc(j), curYM()) : null;
  [['Datore di lavoro', j.azienda], ['Mansione', j.ruolo || '—'], ['Contratto', tipoTxt], ['Periodo', jobPeriodo(j)], ['CCNL e livello', `${(j.ccnl === 'altro' && j.ccnlNome) || CCNL_NOMI[j.ccnl || 'commercio'] || ''} · ${livelloLabel(j)}`], ['Orario', j.tipo === 'chiamata' ? 'a chiamata' : `${num(c.oreSett)} ore a settimana`], c ? ['Retribuzione lorda mensile', eur(c.base)] : null].filter(Boolean)
    .forEach(([k, v]) => { tx(k, 50, y, 10.5, fR, MUT); tx(v, 210, y, 10.5); y -= 16; });
  y -= 14; tx(`Buste paga (${bs.length})`, 50, y, 13, fB); y -= 20;
  tx('Mese', 50, y, 10, fB, MUT); rx('Lordo', 400, y, 10, fB, MUT); rx('Netto', 545, y, 10, fB, MUT); y -= 6; pg.drawRectangle({ x: 50, y, width: 495, height: 0.8, color: LINE }); y -= 15;
  bs.forEach((b) => { tx(`${ymLabel(b.ym)}${b.tipo !== 'mensile' ? ' (' + b.tipo + ')' : ''}`, 50, y, 10.5); rx(b.lordo != null ? eur(b.lordo) : '—', 400, y, 10.5); rx(eur(b.netto), 545, y, 10.5, fB); y -= 16; });
  if (bs.length) { const mens = bs.filter((b) => b.tipo === 'mensile'); const media = mens.length ? mens.reduce((a, b) => a + b.netto, 0) / mens.length : 0;
    y -= 2; pg.drawRectangle({ x: 50, y: y + 10, width: 495, height: 0.8, color: LINE }); if (media) { tx('Netto medio mensile', 50, y - 4, 11, fB); rx(eur(media), 545, y - 4, 11, fB); y -= 22; } }
  y -= 16; tx('Allegati', 50, y, 13, fB); y -= 18;
  const allegati = [];
  bs.slice().reverse().forEach((b) => { if (b.fileId) allegati.push([b.fileId, `Busta paga ${ymLabel(b.ym)}`]); });
  const docs = (j.documenti || []).slice().sort((a, b) => (a.data < b.data ? 1 : -1));
  if (conCU) { const cu = docs.find((d) => d.categoria === 'cu'); if (cu) allegati.push([cu.fileId, 'Certificazione Unica: ' + cu.nome]); }
  if (conContr) docs.filter((d) => d.categoria === 'contratto' || d.categoria === 'proroga').reverse().forEach((d) => allegati.push([d.fileId, (d.categoria === 'proroga' ? 'Proroga: ' : 'Contratto: ') + d.nome]));
  const saltati = [];
  for (const [fid, nome] of allegati) {
    const rec = fid ? await fileGet(fid) : null; if (!rec || !rec.blob) { saltati.push(nome); continue; }
    const bytes = new Uint8Array(await rec.blob.arrayBuffer()); const t = rec.type || '';
    try {
      if (t === 'application/pdf' || /\.pdf$/i.test(rec.name || '')) { const src = await PDFDocument.load(bytes, { ignoreEncryption: true }); const pp = await doc.copyPages(src, src.getPageIndices()); pp.forEach((p) => doc.addPage(p)); }
      else if (/image\/(jpe?g|png)/.test(t)) { const im = /png/.test(t) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes); const p = doc.addPage([595.28, 841.89]); const s = Math.min(515 / im.width, 760 / im.height); p.drawImage(im, { x: (595.28 - im.width * s) / 2, y: (841.89 - im.height * s) / 2, width: im.width * s, height: im.height * s }); }
      else { saltati.push(nome); continue; }
      tx('• ' + nome, 50, y, 10.5); y -= 15;
    } catch (e) { saltati.push(nome); }
    if (y < 80) { pg = doc.addPage([595.28, 841.89]); y = 790; }
  }
  if (!allegati.length) { tx('Nessun documento salvato in Cedolino per questo lavoro.', 50, y, 10.5, fR, MUT); y -= 15; }
  if (saltati.length) { y -= 6; tx(`Non inclusi (formato non leggibile o file mancante): ${saltati.join(', ')}`.slice(0, 110), 50, y, 9, fR, MUT); }
  // il riepilogo è la prima pagina anche se l'ho riempito per ultimo
  const out = await doc.save(); const nome = `Dossier reddito - ${(P.nome || 'Cedolino').replace(/[^\w\s-]/g, '')} - ${j.azienda.replace(/[^\w\s-]/g, '')}.pdf`;
  const blob = new Blob([out], { type: 'application/pdf' });
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], nome, { type: 'application/pdf' })] })) { try { await navigator.share({ files: [new File([blob], nome, { type: 'application/pdf' })], title: 'Dossier reddito' }); toast('Dossier pronto'); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  scarica(blob, nome);
}

/* ---------- 8. Traguardi ---------- */
const TRAGUARDI = [
  ['prima-busta', '📄', 'Prima busta', 'Hai caricato la prima busta paga.', () => S.buste.length >= 1],
  ['dieci-buste', '🗂️', 'Archivio in ordine', 'Dieci buste paga archiviate.', () => S.buste.length >= 10],
  ['busta-perfetta', '✅', 'Busta perfetta', 'Una busta in cui tutti i controlli tornano.', () => S.buste.some((b) => b.lordo && b.netto && controlla(b).every((c) => c.s === 'ok'))],
  ['primo-turno', '🗓️', 'Primo turno', 'Hai segnato il primo turno.', () => Object.values(S.turni).some((T) => Object.values(T).some((g) => g.tipo === 'turno'))],
  ['primo-timbro', '⏱️', 'Timbrato!', 'Hai usato il timbro di inizio turno.', () => !!(S.traguardi && S.traguardi['primo-timbro'])],
  ['cento-ore', '💪', '100 ore', 'Cento ore di lavoro in un mese.', () => S.lavori.some((j) => [curYM(), addYM(curYM(), -1), addYM(curYM(), -2)].some((ym) => { const cl = E.classificaMese(S.turni[j.id] || {}, ym, jCalc(j), S.profilo.patrono); return cl.ordinarie + cl.supplementari + cl.straord15 + cl.straord20 + cl.festive >= 100; }))],
  ['stipendio-su', '📈', 'Stipendio in salita', 'Un netto più alto del mese prima.', () => S.lavori.some((j) => { const L = S.buste.filter((b) => b.jobId === j.id && b.tipo === 'mensile' && b.netto).sort((a, b) => (a.ym < b.ym ? -1 : 1)); return L.some((b, i) => i && b.netto > L[i - 1].netto + 1); })],
  ['ferie', '🏖️', 'Vacanze in vista', 'Almeno 5 giorni di ferie pianificati.', () => S.lavori.some((j) => Object.entries(S.turni[j.id] || {}).filter(([k, g]) => k > todayISO() && g.tipo === 'ferie').length >= 5)],
  ['anniversario', '🎂', 'Un anno insieme', 'Un anno nello stesso lavoro.', () => S.lavori.some((j) => j.inizio && corrente(j) && addDays(j.inizio, 365) <= todayISO())],
];
function controllaTraguardi(festeggia = true) {
  S.traguardi = S.traguardi || {}; const nuovi = [];
  for (const [id, , , , ok] of TRAGUARDI) { if (S.traguardi[id] && S.traguardi[id] !== true) continue; let si = false; try { si = ok(); } catch (e) {} if (si) { S.traguardi[id] = todayISO(); nuovi.push(id); } }
  if (!nuovi.length) return; save({ noSync: false });
  if (festeggia && fxOn() && !$('.lock') && !document.getElementById('intro')) fxTraguardo(nuovi);
}
function fxTraguardo(ids) {
  const t = TRAGUARDI.find((x) => x[0] === ids[0]);
  const coriandoli = Array.from({ length: 18 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 6) * 0.05}s;--r:${(i * 47) % 360}deg;--c:${['#F2BE3D', '#3D63E0', '#159A5C', '#FF8A73', '#7E9BFF'][i % 5]}"></i>`).join('');
  fxLayer('fx-tg', `<div class="fx-conf">${coriandoli}</div><div class="fx-medal"><span>${t[1]}</span></div><div class="fx-tt">${ids.length > 1 ? `${ids.length} traguardi nuovi` : 'Traguardo!'}</div><div class="fx-cap">${esc(t[2])}${ids.length > 1 ? ` e altri ${ids.length - 1}` : ''}</div>`, 2600);
}
function cardTraguardi() {
  const T = S.traguardi || {}; const n = TRAGUARDI.filter((t) => T[t[0]]).length;
  return `<div class="card"><h2><span class="grow">Traguardi</span><span class="badge n">${n}/${TRAGUARDI.length}</span></h2><div class="tg-grid">${TRAGUARDI.map(([id, em, nome, desc]) => `<div class="tg ${T[id] ? 'on' : ''}" title="${esc(desc)}"><span class="em">${T[id] ? em : '🔒'}</span><b>${esc(nome)}</b><small>${T[id] ? (T[id] === true ? 'Sbloccato' : dateLabel(T[id])) : esc(desc)}</small></div>`).join('')}</div></div>`;
}

/* ---------- aggiornamenti dopo ogni salvataggio ---------- */
let novitaT = null;
function dopoSalvataggio() {
  clearTimeout(novitaT);
  novitaT = setTimeout(() => { programmaAvvisi(); aggiornaCalendario(); controllaTraguardi(); }, 2500);
}
// tocco su un avviso con l'app già aperta: il service worker mi chiede di andare alla pagina giusta
if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', (e) => { if (e.data && e.data.vai) location.href = e.data.vai; });
