# Cedolino

App (PWA) per le buste paga: calcolo del netto con le regole 2026, archivio delle buste con lettura dei PDF (e regole insegnate dall'utente), controllo e lettera all'ufficio paghe, turni con timbratura e importazione del planning, archivio dei datori di lavoro con contratti e documenti, anno fiscale con più datori e CU, fine contratto con TFR e NASpI, statistiche, promemoria (.ics), esportazione per il CV, blocco PIN con cifratura, sincronizzazione cifrata su Supabase e invio dello stipendio a Conto di Casa.

- I dati restano nel browser (localStorage + IndexedDB); con il PIN sono cifrati (AES-GCM).
- Sincronizzazione: tabella `cedolino_data` (RLS per utente) nel progetto Supabase, dati cifrati lato client con una frase segreta.
- Pubblicazione: carica questi file nella radice del repository e attiva GitHub Pages.
- `app.js` è generato da `src/*.js` (in quest'ordine: p1_core, p2_dominio, p3_lettura, p4_viste, p5_strumenti, p55_pwa, p57_effetti, p58_novita, p6_avvio).
- Le stime non sostituiscono consulente del lavoro, CAF o sindacato.
