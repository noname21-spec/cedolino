
/* ---- Impostazioni ---- */
function viewImpostazioni() {
  const P = S.profilo; const lc = lockCfg();
  let h = topbar('Impostazioni', '', '', '#home');
  h += `<div class="sec-title" style="margin-top:4px">Account</div>${cardAccount()}`;
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
  <div class="field" style="margin-bottom:6px"><span>Tema</span></div>
  <div class="seg" style="margin-bottom:8px">${[['auto', 'Automatico'], ['chiaro', 'Chiaro'], ['nero', 'Nero']].map(([v, l]) => `<button type="button" data-act="tema" data-v="${v}" class="${S.tema === v ? 'on' : ''}">${l}</button>`).join('')}</div>
  <label class="check"><input type="checkbox" name="vetro" ${S.vetro ? 'checked' : ''} data-act="vetro"><span class="switch"></span><span class="grow">Effetto vetro</span></label>
  <label class="check"><input type="checkbox" name="intro" ${S.intro !== false ? 'checked' : ''} data-act="intro"><span class="switch"></span><span class="grow">Animazione di apertura</span></label>
  <label class="check"><input type="checkbox" name="fx" ${S.fx !== false ? 'checked' : ''} data-act="fx"><span class="switch"></span><span class="grow">Effetti divertenti<small class="muted" style="display:block;font-size:12.5px">Rotelle del netto, scontrino, timbro, monetine, cartellino</small></span></label></div>
  <button class="btn block" type="submit">Salva impostazioni</button></form>`;
  h += `<div class="sec-title">Sicurezza</div><div class="card"><div class="row"><div class="ic b icbox">${ic.lock}</div><div class="grow"><b>Blocco con PIN</b><div class="small muted">${lc ? 'Attivo: i dati su questo telefono sono cifrati.' : 'Chiede un PIN all’apertura e cifra i dati sul telefono.'}</div></div></div>
    <div class="btns" style="margin-top:12px">${lc ? `<button class="btn ghost" data-act="pin-set">Cambia PIN</button><button class="btn danger" data-act="pin-del">Togli</button>` : `<button class="btn" data-act="pin-set">${ic.lock} Imposta un PIN</button>`}</div>
    ${lc && bioDisp ? `<label class="check" style="margin-top:12px"><input type="checkbox" name="bio" ${lc.bio ? 'checked' : ''} data-act="bio"><span class="switch"></span><span class="grow">Sblocca con ${BIO_NOME}<small class="muted" style="display:block;font-size:12.5px">Il PIN resta per quando ${BIO_NOME} non va.</small></span></label>` : ''}
    ${!lc && bioDisp ? `<p class="small muted" style="margin:10px 0 0">Dopo aver impostato il PIN potrai sbloccare anche con ${BIO_NOME}.</p>` : ''}</div>`;
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
let sb = null, sbUser = null, syncStato = '', syncBusy = false, appenaEntrato = false;
async function sbInit() {
  if (sb) return sb;
  try {
    if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
    sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, storageKey: 'cedolino-auth', detectSessionInUrl: false, flowType: 'pkce' } });
    const qs = new URLSearchParams(location.search);
    if (qs.get('code')) {
      try { await sb.auth.exchangeCodeForSession(qs.get('code')); appenaEntrato = true; } catch (e) { syncStato = 'Accesso con Google non completato: riprova.'; }
      let rit = ''; try { rit = sessionStorage.getItem('cedolino.ritorno') || ''; sessionStorage.removeItem('cedolino.ritorno'); } catch (e) {}
      history.replaceState(null, '', location.pathname + (rit || location.hash || '#home'));
    } else if (qs.get('error_description')) { syncStato = 'Accesso con Google non riuscito: ' + qs.get('error_description'); history.replaceState(null, '', location.pathname + '#impostazioni'); }
    const { data } = await sb.auth.getSession(); sbUser = data.session ? data.session.user : null;
    sb.auth.onAuthStateChange((_e, s) => { const was = sbUser; sbUser = s ? s.user : null; if (sbUser && !was && S.sync.on) syncNow(true); if (!!was !== !!sbUser && ['impostazioni', 'home'].includes(route()) && !sheetStack.length) render(); });
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
    syncBusy = false; return true;
  } catch (e) { syncStato = e.message === 'frase' ? 'La frase segreta non corrisponde a quella usata sugli altri dispositivi.' : 'Sincronizzazione non riuscita: riprova più tardi.'; if (!silenzioso) toast(syncStato); if (route() === 'impostazioni') render(); }
  syncBusy = false; return false;
}
const nomeUtente = () => { const m = (sbUser && sbUser.user_metadata) || {}; return m.given_name || (m.full_name || m.name || '').split(' ')[0] || ''; };
const sitoUfficiale = () => /github\.io$|^localhost$|^127\.0\.0\.1$/.test(location.hostname);
function cardAccount() {
  if (!sbUser) return `<div class="card"><div class="row"><div class="ic b icbox">${ic.user}</div><div class="grow"><b>Accedi con Google</b><div class="small muted">Per ritrovare buste, lavori e turni su tutti i tuoi dispositivi e collegare Conto di Casa.</div></div></div>
    ${syncStato ? `<p class="banner" style="margin:12px 0 0">${esc(syncStato)}</p>` : ''}
    <button class="btn google block" style="margin-top:12px" data-act="login-google">${GOOGLE_G} Accedi con Google</button>
    <p class="note">Non serve per usare l'app: senza account i dati restano solo su questo telefono.</p></div>`;
  const m = sbUser.user_metadata || {}; const ultimo = S.sync.last ? new Date(S.sync.last).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
  return `<div class="card"><div class="row"><div class="avatar big">${m.avatar_url ? `<img src="${esc(m.avatar_url)}" alt="" referrerpolicy="no-referrer">` : esc(((m.full_name || sbUser.email || '?')[0]).toUpperCase())}</div><div class="grow"><b>${esc(m.full_name || m.name || 'Account Google')}</b><div class="small muted">${esc(sbUser.email || '')}</div></div></div>
    <div class="chk ${S.sync.on ? 'ok' : 'info'}" style="margin-top:12px"><div class="dot">${ic.cloud}</div><div><b>${S.sync.on ? 'Sincronizzazione attiva' : 'Sincronizzazione spenta'}</b><p>${S.sync.on ? `Dati cifrati e allineati su tutti i dispositivi${ultimo ? ` · ultima: ${ultimo}` : ''}.` : 'Accendila per avere gli stessi dati sul telefono e sul computer.'}</p></div></div>
    ${syncStato ? `<p class="banner" style="margin:12px 0 0">${esc(syncStato)}</p>` : ''}
    <div class="btns" style="margin-top:12px">${S.sync.on ? `<button class="btn" data-act="sync-now">${ic.cloud} Sincronizza ora</button><button class="btn ghost" data-act="sync-off">Spegni</button>` : `<button class="btn" data-act="sync-on">${ic.cloud} Accendi la sincronizzazione</button>`}</div>
    <button class="link" style="margin-top:12px" data-act="sync-logout">Esci dall'account</button>
    <p class="note">I dati vengono cifrati sul telefono con una frase segreta che conosci solo tu. I PDF restano sul dispositivo.</p></div>`;
}
async function loginGoogle() {
  if (sbUser) { return S.sync.on ? accountSheet() : offriSync(); }
  if (!sitoUfficiale()) {
    const sh = openSheet(`<h3>Accedi dall'app</h3><p class="lead">L'accesso con Google funziona nell'app pubblicata sul sito. Aprila da lì (e installala): i dati di questa anteprima puoi portarli con un backup.</p><div class="btns"><button class="btn ghost" data-x="1">Chiudi</button><a class="btn" href="https://noname21-spec.github.io/cedolino/" target="_blank" rel="noopener">Apri Cedolino</a></div>`);
    sh.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) closeSheet(); }); return;
  }
  if (!navigator.onLine) { toast('Serve la connessione a Internet per accedere'); return; }
  await sbInit(); if (!sb) { toast(syncStato || 'Accesso non disponibile in questo momento'); return; }
  if (sbUser) { return S.sync.on ? accountSheet() : offriSync(); }
  try { sessionStorage.setItem('cedolino.ritorno', location.hash || '#home'); } catch (e) {}
  const back = location.origin + location.pathname.replace(/index\.html$/, '');
  const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: back, queryParams: { prompt: 'select_account' } } });
  if (error) { syncStato = 'Accesso non riuscito: ' + error.message; toast(syncStato); render(); }
}
function accountSheet() {
  const sh = openSheet(`<h3>Il tuo account</h3>${cardAccount()}<button class="btn ghost block" data-x="1">Chiudi</button>`);
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) closeSheet(); else if (e.target.closest('[data-act]')) closeSheet(); });
}
async function offriSync() {
  if (!sbUser) return loginGoogle();
  let esiste = false; try { const { data } = await sb.from('cedolino_data').select('user_id').eq('user_id', sbUser.id).maybeSingle(); esiste = !!data; } catch (e) {}
  const nome = nomeUtente();
  const sh = openSheet(`<h3>${appenaEntrato ? `Ciao${nome ? ' ' + esc(nome) : ''}, sei dentro` : 'Sincronizzazione'}</h3>
    <p class="lead">${esiste ? 'Su questo account ci sono già i tuoi dati di Cedolino da un altro dispositivo. Scrivi la frase segreta che hai scelto lì: li scarico e da ora restano allineati.' : 'Scegli una frase segreta (almeno 8 caratteri): cifra i dati prima che lascino il telefono, così nessun altro può leggerli. Usa la stessa su ogni dispositivo e non perderla.'}</p>
    <form><label class="field"><span>Frase segreta</span><input class="inp" type="password" name="p1" minlength="8" required autocomplete="${esiste ? 'current-password' : 'new-password'}"></label>${esiste ? '' : '<label class="field"><span>Ripeti</span><input class="inp" type="password" name="p2" minlength="8" required autocomplete="new-password"></label>'}
    <p class="banner" data-err style="display:none;margin:0 0 12px"></p>
    <div class="btns"><button type="button" class="btn ghost" data-x="1">Non ora</button><button class="btn" type="submit">${ic.cloud} ${esiste ? 'Scarica i dati' : 'Accendi'}</button></div></form>`);
  appenaEntrato = false;
  const err = (t) => { const el = $('[data-err]', sh); el.textContent = t; el.style.display = ''; };
  sh.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) { closeSheet(); render(); } });
  $('form', sh).addEventListener('submit', async (e) => {
    e.preventDefault(); const f = e.target;
    if (!esiste && f.p1.value !== f.p2.value) return err('Le due frasi non coincidono');
    const bt = $('button[type=submit]', sh); bt.disabled = true; bt.textContent = 'Un attimo…';
    S.sync = { on: true, pass: f.p1.value }; save({ noSync: true });
    const ok = await syncNow(true);
    if (!ok) { S.sync = { on: false, pass: '' }; save({ noSync: true }); bt.disabled = false; bt.innerHTML = `${ic.cloud} Riprova`; return err(syncStato || 'Non sono riuscito a sincronizzare: riprova.'); }
    closeSheet(); syncStato = '';
    if (route() === 'benvenuto' && (S.lavori.length || S.buste.length)) { S.onboarded = true; save({ noSync: true }); location.hash = '#home'; }
    render(); toast(esiste ? 'Dati scaricati: ora sono allineati' : 'Sincronizzazione accesa');
  });
}

/* ============ Conto di Casa ============ */
async function inviaCdc(b, silenzioso) {
  if (!b.netto) { if (!silenzioso) toast('Per inviarla serve il netto'); return false; }
  const j = job(b.jobId); const date = dataPaga(b.ym);
  const item = { id: 'ced-' + b.id, date, cat: b.tipo === 'mensile' ? 'stipendio' : 'extra', amount: Math.round(b.netto * 100) / 100, in: true, note: `${b.tipo === 'mensile' ? 'Stipendio' : cap(b.tipo)} ${meseDi(b.ym)} ${b.ym.slice(0, 4)}${j ? ' · ' + j.azienda : ''} (da Cedolino)` };
  const put = (d) => { d = d && typeof d === 'object' ? d : {}; d.months = d.months || {}; Object.keys(d.months).forEach((k) => { d.months[k] = (d.months[k] || []).filter((x) => x.id !== item.id); }); (d.months[date.slice(0, 7)] = d.months[date.slice(0, 7)] || []).push(item); if (Array.isArray(d.deleted)) d.deleted = d.deleted.filter((x) => x !== item.id); if (d.profile && Array.isArray(d.profile.deleted)) d.profile.deleted = d.profile.deleted.filter((x) => x !== item.id); return d; };
  const dove = []; let bloccato = false;
  try { const raw = localStorage.getItem('contodicasa.v1'); if (raw) { const o = JSON.parse(raw); if (o && o.enc) bloccato = true; else { localStorage.setItem('contodicasa.v1', JSON.stringify(put(o))); dove.push('telefono'); } } } catch (e) {}
  try { if (S.sync.on || haSessione()) await sbInit(); if (sb && sbUser) { const { data, error } = await sb.from('conto_di_casa_data').select('data').eq('user_id', sbUser.id).maybeSingle(); if (!error) { const up = await sb.from('conto_di_casa_data').upsert({ user_id: sbUser.id, data: put(data ? data.data : {}), updated_at: new Date().toISOString() }); if (!up.error) dove.push('account'); } } } catch (e) {}
  if (dove.length) { b.cdc = { date, amount: item.amount, at: Date.now() }; save(); if (!silenzioso) toast(`Entrata di ${eur(item.amount)} del ${dateLabel(date)} inviata a Conto di Casa`); return true; }
  if (!silenzioso) {
    const sh = openSheet(`<h3>Non trovo Conto di Casa</h3><p class="lead">${bloccato ? 'Conto di Casa su questo telefono è protetto da PIN, quindi non posso scriverci direttamente.' : 'Su questo browser Conto di Casa non ha ancora dati, oppure è su un altro sito.'}</p><div class="chk info"><div class="dot">${ic.info}</div><div><b>Per collegarle</b><p>Accedi con lo stesso account Google sia in Conto di Casa sia qui (Impostazioni → Sincronizzazione): da quel momento le entrate arrivano ovunque. In alternativa apri Conto di Casa almeno una volta da questo telefono, dallo stesso sito di Cedolino.</p></div></div><button class="btn block" style="margin-top:12px" data-x="ok">Ho capito</button>`);
    sh.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) closeSheet(); });
  }
  return false;
}

/* ============ blocco PIN e Face ID ============ */
let lockedAt = 0, pinMem = null, bioDisp = false;
const BIO_NOME = /iPhone|iPad|Mac/.test(navigator.userAgent) ? 'Face ID' : 'impronta o volto';
const IC_BIO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 9v1.5M15 9v1.5M12 9v4h-1M9 16c1.5 1.2 4.5 1.2 6 0"/></svg>';
function lockScreen(verifica) {
  return new Promise((resolve) => {
    const lc = lockCfg() || {}, bio = !!(lc.bio && bioDisp !== null);
    const el = document.createElement('div'); el.className = 'lock';
    el.innerHTML = `<div class="lock-in"><img src="icons/icon.svg?v=2" alt="" width="64" height="64"><h2>Bentornato${S.profilo && S.profilo.nome ? ', ' + esc(S.profilo.nome) : ''}</h2><p class="muted" id="lkMsg">${bio ? `Usa ${BIO_NOME} o inserisci il PIN` : 'Inserisci il PIN'}</p><div class="pinDots" id="lkDots"></div><div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((k) => (k === '' ? (bio ? `<button type="button" class="kbio" data-bio aria-label="Usa ${BIO_NOME}">${IC_BIO}</button>` : '<span></span>') : `<button type="button" data-k="${k}" aria-label="${k === '⌫' ? 'Cancella' : k}">${k}</button>`)).join('')}</div><button class="btn block" id="lkOk">Sblocca</button><button class="link" id="lkForgot" style="margin-top:14px">Ho dimenticato il PIN</button></div>`;
    document.body.appendChild(el); let pin = '', occupato = false;
    const msg = (t) => { $('#lkMsg', el).innerHTML = t; };
    const dots = () => { $('#lkDots', el).innerHTML = Array.from({ length: Math.max(4, pin.length) }, (_, i) => `<i class="${i < pin.length ? 'on' : ''}"></i>`).join(''); };
    dots();
    const apri = () => { el.classList.add('ok'); setTimeout(() => { el.classList.add('via'); setTimeout(() => { el.remove(); resolve(true); }, 300); }, 260); };
    const prova = async (p = pin) => {
      if (p.length < 4 || occupato) return; occupato = true; msg('Verifico…');
      const ok = await verifica(p); occupato = false;
      if (ok) { pinMem = p; pin = '9'.repeat(Math.max(4, p.length)); dots(); apri(); }
      else { pin = ''; dots(); msg('PIN sbagliato, riprova'); el.querySelector('.lock-in').classList.add('shake'); setTimeout(() => el.querySelector('.lock-in').classList.remove('shake'), 400); }
    };
    const conBio = async () => {
      if (!bio || occupato) return;
      try { msg(`Guarda il telefono per ${BIO_NOME}…`); const p = await bioSblocca(); await prova(p); }
      catch (e) { msg(e && e.name === 'NotAllowedError' ? `Tocca ${IC_BIO.replace('<svg', '<svg width="16" height="16" style="vertical-align:-3px"')} per usare ${BIO_NOME}, o inserisci il PIN` : `${BIO_NOME} non ha funzionato: inserisci il PIN`); }
    };
    el.addEventListener('click', async (e) => {
      const k = e.target.closest('[data-k]');
      if (k) { const v = k.dataset.k; if (v === '⌫') pin = pin.slice(0, -1); else if (pin.length < 6) pin += v; dots(); if (pin.length === 6) prova(); }
      if (e.target.closest('[data-bio]')) conBio();
      if (e.target.closest('#lkOk')) prova();
      if (e.target.closest('#lkForgot')) {
        msg('Senza PIN i dati cifrati su questo telefono non si possono aprire. Puoi cancellarli e, se avevi la sincronizzazione, recuperarli accedendo con Google.');
        e.target.outerHTML = '<button class="btn danger block" id="lkReset" style="margin-top:12px">Cancella i dati di questo telefono</button>';
      }
      if (e.target.closest('#lkReset')) { try { localStorage.removeItem(KEY); localStorage.removeItem(LOCK_KEY); indexedDB.deleteDatabase('cedolino-files'); } catch (err) {} location.hash = '#benvenuto'; location.reload(); }
    });
    document.addEventListener('keydown', function kd(e) { if (!document.body.contains(el)) { document.removeEventListener('keydown', kd); return; } if (/^\d$/.test(e.key) && pin.length < 6) { pin += e.key; dots(); } if (e.key === 'Backspace') { pin = pin.slice(0, -1); dots(); } if (e.key === 'Enter') prova(); });
    /* se l'intro sta girando, il logo sale al suo posto e la richiesta di sblocco compare sotto */
    const intro = document.getElementById('intro');
    if (intro && intro.classList.contains('blk')) {
      el.classList.add('da-intro');
      setTimeout(() => {
        const lg = $('.in-logo', intro), im = $('img', el);
        if (lg && im) { const a = lg.getBoundingClientRect(), b = im.getBoundingClientRect(); lg.style.setProperty('--to', `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px,${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(${b.width / a.width})`); }
        intro.classList.add('su'); el.classList.add('vis');
        setTimeout(() => { intro.remove(); el.classList.add('fine'); conBio(); }, 480);
      }, Math.max(0, 1300 - performance.now()));
    } else { if (intro) intro.remove(); setTimeout(conBio, 250); }
  });
}
async function verificaPin(pin) {
  const lc = lockCfg(); if (!lc) return true;
  try { const key = await deriveKey(pin, unb64(lc.salt)); await decJSON(lc.check, key); lockKey = key; pinMem = pin; return true; } catch (e) { return false; }
}
/* Face ID / impronta con i passkey: dopo il riconoscimento il telefono dà una chiave segreta (PRF) che apre il PIN custodito qui */
const rnd = (n) => crypto.getRandomValues(new Uint8Array(n));
async function bioDisponibile() { try { return !!(window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); } catch (e) { return false; } }
async function bioChiave(lc) {
  const a = await navigator.credentials.get({ publicKey: { challenge: rnd(32), allowCredentials: [{ type: 'public-key', id: unb64(lc.bio.id), transports: ['internal', 'hybrid'] }], userVerification: 'required', timeout: 60000, extensions: { prf: { eval: { first: unb64(lc.bio.salt) } } } } });
  const r = a.getClientExtensionResults().prf; if (!r || !r.results || !r.results.first) { const e = new Error('noprf'); e.name = 'NoPrf'; throw e; }
  return crypto.subtle.importKey('raw', new Uint8Array(r.results.first), 'AES-GCM', false, ['encrypt', 'decrypt']);
}
async function bioSblocca() { const lc = lockCfg(); return (await decJSON(lc.bio.pin, await bioChiave(lc))).p; }
async function bioAttiva(pin) {
  const salt = rnd(32);
  const cred = await navigator.credentials.create({ publicKey: { rp: { name: 'Cedolino' }, user: { id: rnd(16), name: 'Cedolino', displayName: 'Cedolino · sblocco' }, challenge: rnd(32), pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }], authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' }, timeout: 60000, extensions: { prf: { eval: { first: salt } } } } });
  const ext = cred.getClientExtensionResults().prf;
  if (!ext || ext.enabled === false) { const e = new Error('noprf'); e.name = 'NoPrf'; throw e; }
  const lc = lockCfg(); lc.bio = { id: b64(cred.rawId), salt: b64(salt) };
  const key = ext.results && ext.results.first ? await crypto.subtle.importKey('raw', new Uint8Array(ext.results.first), 'AES-GCM', false, ['encrypt', 'decrypt']) : await bioChiave(lc);
  lc.bio.pin = await encJSON({ p: pin }, key);
  localStorage.setItem(LOCK_KEY, JSON.stringify(lc));
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
    const avevaBio = !!(lockCfg() || {}).bio; lockKey = key; pinMem = f.p1.value; save({ noSync: true }); closeSheet(); render(); toast(avevaBio ? `PIN cambiato: riattiva ${BIO_NOME} in Sicurezza` : 'PIN impostato: i dati sono cifrati');
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
  app.innerHTML = `<div class="fade${navDir ? (navDir > 0 ? ' swl' : ' swr') : ''}">${html}</div>`; navDir = 0;
  aggiornaBadge();
  const sec = { busta: 'buste', lavoro: 'lavori', cv: 'lavori' }[base] || base;
  navSync(sec);
  if (base === 'home') fxHome();
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
/* barra delle sezioni: schede in alto, si scorre col dito per cambiare sezione, e mentre si scorre in giù si riduce a un'etichetta */
const SEZ = ['home', 'buste', 'turni', 'lavori'], SEZN = { home: 'Home', buste: 'Buste', turni: 'Turni', lavori: 'Lavori' };
let navDir = 0, navSec = 'home';
function navSync(sec) {
  const i = SEZ.indexOf(sec), nav = $('.nav'); navSec = sec;
  $$('.nav a').forEach((a) => { const on = a.dataset.nav === sec; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  if (nav) { nav.classList.toggle('fuori', i < 0); if (i >= 0) nav.style.setProperty('--ni', i); }
  const m = $('.nav-mini'); if (m) { $('span', m).textContent = i >= 0 ? SEZN[sec] : 'Sezioni'; $('small', m).textContent = i >= 0 ? `${i + 1}/4` : ''; }
}
function navMin(on) { document.documentElement.classList.toggle('navmin', !!on); }
(() => {
  let lastY = scrollY, acc = 0;
  addEventListener('scroll', () => {
    const y = scrollY, d = y - lastY; lastY = y;
    if (y < 60) { acc = 0; navMin(false); return; }
    acc = (d > 0) === (acc > 0) ? acc + d : d;
    if (acc > 24) navMin(true); else if (acc < -18) navMin(false);
  }, { passive: true });
  /* scorrere a destra o a sinistra cambia sezione (solo nelle quattro sezioni principali) */
  let sx = 0, sy = 0, st = 0, ok = false;
  const scorrevole = (el) => { for (let e = el; e && e !== app; e = e.parentElement) { const o = getComputedStyle(e).overflowX; if ((o === 'auto' || o === 'scroll') && e.scrollWidth > e.clientWidth + 2) return true; } return false; };
  app.addEventListener('touchstart', (e) => {
    const t = e.touches[0]; ok = e.touches.length === 1 && SEZ.includes(route()) && !$('.scrim.show') && !e.target.closest('input,textarea,select,.switch,[data-noswipe]') && !scorrevole(e.target);
    sx = t.clientX; sy = t.clientY; st = Date.now();
    if (sx < 20 || sx > innerWidth - 20) ok = false;
  }, { passive: true });
  app.addEventListener('touchend', (e) => {
    if (!ok) return; ok = false; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6 || Date.now() - st > 700) return;
    const i = SEZ.indexOf(route()), j = i + (dx < 0 ? 1 : -1);
    if (j < 0 || j >= SEZ.length) return;
    location.hash = '#' + SEZ[j];
  }, { passive: true });
})();
window.addEventListener('hashchange', () => {
  closeAllSheets(); const r = route();
  if (r !== lastRoute) { const a = SEZ.indexOf(lastRoute), b = SEZ.indexOf(r); navDir = a >= 0 && b >= 0 && a !== b ? Math.sign(b - a) : 0; lastRoute = r; render(); scrollTo(0, 0); navMin(false); }
});

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
  'nav-apri'() { navMin(false); },
  info(el) { const t = TERMS[el.dataset.k]; if (!t) return; const sh = openSheet(`<h3>${esc(t[0])}</h3><p class="lead" style="color:var(--text)">${esc(t[1])}</p><button class="btn block" data-x="ok">Ho capito</button>`); sh.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) closeSheet(); }); },
  'timbra-inizio'() { const j = attivo(); if (!j) return actions['job-new'](); const d = new Date(); S.timbro = { jobId: j.id, data: todayISO(), inizio: `${pad(d.getHours())}:${pad(d.getMinutes())}` }; turniJob = j.id; save(); render(); if (!fxCartellino(S.timbro.inizio)) toast(`Turno iniziato alle ${S.timbro.inizio}`); },
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
  'sync-on'() { offriSync(); }, 'sync-login'() { loginGoogle(); }, 'login-google'() { loginGoogle(); }, account() { accountSheet(); }, 'sync-now'() { syncNow(); },
  async 'sync-logout'() { if (!(await ask('Uscire dall\u2019account?', 'I dati restano su questo telefono, ma smettono di sincronizzarsi.', 'Esci'))) return; try { await sb.auth.signOut(); } catch (e) {} sbUser = null; S.sync = { on: false, pass: '' }; save({ noSync: true }); closeSheet(); render(); toast('Sei uscito: i dati restano su questo telefono'); },
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
  intro(el) { S.intro = el.checked; save(); },
  fx(el) { S.fx = el.checked; save(); },
  async bio(el) {
    const lc = lockCfg(); if (!lc) return;
    if (!el.checked) { delete lc.bio; localStorage.setItem(LOCK_KEY, JSON.stringify(lc)); toast(`${BIO_NOME} spento: si sblocca solo col PIN`); return; }
    if (!pinMem) { el.checked = false; toast('Blocca e riapri l’app col PIN, poi riprova'); return; }
    try { await bioAttiva(pinMem); toast(`${BIO_NOME} attivo: la prossima volta basta guardare il telefono`); }
    catch (e) { el.checked = false; toast(e.name === 'NoPrf' ? `Su questo telefono ${BIO_NOME} non può aprire i dati cifrati: serve iOS 18 o più recente` : `${BIO_NOME} non attivato`); }
  },
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
  try { const ui = JSON.parse(localStorage.getItem(UI_KEY) || 'null'); if (ui) { S.tema = ui.tema || S.tema; S.vetro = ui.vetro !== false; if (ui.intro === false) S.intro = false; } } catch (e) { storageOK = false; }
  applyTheme();
  const lc = lockCfg();
  bioDisp = await Promise.race([bioDisponibile(), new Promise((ok) => setTimeout(() => ok(false), 400))]);
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
  if (!S.onboarded && !S.lavori.length && (!location.hash || location.hash === '#home')) history.replaceState(null, '', location.pathname + location.search + '#benvenuto');
  if (new URLSearchParams(location.search).get('app') === 'pwa') history.replaceState(null, '', location.pathname + location.hash);
  lastRoute = route(); render();
  registraSW(); statoRete(); if (isStandalone()) proteggiDati();
  const qs = new URLSearchParams(location.search);
  if (S.sync.on || haSessione() || qs.get('code') || qs.get('error_description')) sbInit().then(() => {
    if (!sbUser) { if (syncStato) render(); return; }
    if (!S.profilo.nome && nomeUtente()) { S.profilo.nome = nomeUtente(); save({ noSync: true }); }
    lastRoute = route(); render();
    if (S.sync.on && S.sync.pass) syncNow(true); else if (appenaEntrato) setTimeout(() => { if (!sheetStack.length) offriSync(); }, 350);
  });
  avvisaSeServe();
  setInterval(() => { if (S.timbro && ['home', 'turni'].includes(route()) && !sheetStack.length) render(); }, 60000);
}
matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => { if (S.tema === 'auto') applyTheme(); });
window.__cedolino = { get S() { return S; }, stima, controlla, parseBusta, leggiFile, parseContratto, parseCU, parsePlanning, annoFiscale, naspiDati, promemoria, mergeStati, fxScontrino, fxCartellino };
boot();
})();
