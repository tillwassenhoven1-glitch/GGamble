'use strict';
/* ================= Erfolge ================= */
const ACH = [
  ['first', 'Erster Einsatz', 'Spiel deine erste Runde', 25, s => s.st.rounds >= 1],
  ['r100', 'Stammgast', '100 Runden gespielt', 150, s => s.st.rounds >= 100],
  ['x10', 'Zehnfach', 'Ein Gewinn mit mindestens 10×', 100, s => s.st.maxMult >= 10],
  ['sc1', 'Rubbelfinger', 'Rubbel dein erstes Los', 20, s => s.st.scratches >= 1],
  ['bet1', 'Tippspieler', 'Platziere deine erste Sportwette', 20, s => s.st.bets >= 1],
  ['tr1', 'Trader', 'Schließ deinen ersten Trade', 30, s => s.st.trades >= 1],
  ['drink', 'Glückspilz', 'Trink einen Glückstrank', 50, s => s.st.potsDrunk >= 1],
  ['perfect', 'Perfektionist', 'Schaff ein perfektes Minispiel', 100, s => s.st.perfect >= 1],
  ['l5', 'Aufsteiger', 'Erreiche Level 5', 100, s => s.level >= 5],
  ['shop1', 'Unternehmer', 'Kauf dein erstes Geschäft', 100, s => Object.keys(s.shops).length >= 1],
  ['treff', 'Gesellig', 'Tritt einem Treff-Raum bei', 50, s => s.st.treff >= 1],
  ['inkasso', 'Neustart', 'Verkauf deine Schulden ans Inkasso', 10, s => s.st.inkasso >= 1],
  ['b10k', 'Fünfstellig', 'Hab 10.000 € auf dem Konto', 500, s => s.st.maxBal >= 1e4],
  ['r1000', 'Dauerzocker', '1.000 Runden gespielt', 1000, s => s.st.rounds >= 1000],
  ['x100', 'Hundertfach', 'Ein Gewinn mit mindestens 100×', 1000, s => s.st.maxMult >= 100],
  ['sc50', 'Rubbelkönig', 'Rubbel 50 Lose', 500, s => s.st.scratches >= 50],
  ['betW5', 'Wettprofi', 'Gewinn 5 Sportwetten', 300, s => s.st.betWins >= 5],
  ['combi', 'Kombi-König', 'Gewinn eine Kombi mit 3+ Spielen', 750, s => s.st.combiWin >= 1],
  ['tr10', 'Wolf der GG Street', '10 Trades mit Gewinn', 800, s => s.st.tradeProfit >= 10],
  ['pot6', 'Alchemist', 'Brau einen ×6-Trank', 500, s => (s.st.pot6 || 0) >= 1],
  ['streak7', 'Treue Seele', '7 Tage Tagesbonus am Stück', 1000, s => s.st.bonusStreak >= 7],
  ['l10', 'Profi', 'Erreiche Level 10', 500, s => s.level >= 10],
  ['jp', 'Jackpot!', 'Knack einen Jackpot', 2500, s => s.st.jackpots >= 1],
  ['b100k', 'Sechsstellig', 'Hab 100.000 € auf dem Konto', 5000, s => s.st.maxBal >= 1e5],
  ['shop5', 'Ketten-Chef', 'Besitze 5 verschiedene Geschäfte', 5000, s => Object.keys(s.shops).length >= 5],
  ['l20', 'Veteran', 'Erreiche Level 20', 5000, s => s.level >= 20],
  ['b1m', 'Millionär', 'Hab 1 Mio. € auf dem Konto', 50000, s => s.st.maxBal >= 1e6],
  ['l30', 'Legende', 'Erreiche Level 30', 50000, s => s.level >= 30],
  ['shopAll', 'Imperator', 'Besitze alle 8 Geschäfte', 500000, s => Object.keys(s.shops).length >= 8],
  ['b1b', 'Milliardär', 'Hab 1 Mrd. € auf dem Konto', 5e6, s => s.st.maxBal >= 1e9],
];
let achBusy = false;
function checkAch() {
  if (!S || achBusy) return; achBusy = true;
  try {
    ACH.forEach(([id, n, d, rw, f], k) => {
      if (S.ach[id] || !f(S)) return;
      S.ach[id] = Date.now();
      S.bal = r2(S.bal + rw); touchToday(); S.today.v = r2(S.today.v + rw); S.st.maxBal = Math.max(S.st.maxBal, S.bal);
      setTimeout(() => { toast(`🏆 Erfolg: <b>${n}</b> · +${fmt(rw)}`, 'good', 4000); SND.win(); FX.burst(40, { cols: ['#f5cf5a', '#fff'] }); hdr(true); }, 700 + k * 50);
    });
  } finally { achBusy = false; }
  save();
}

/* ================= Router ================= */
const NAV = [['halle', 'cherry', 'Halle'], ['lose', 'ticket', 'Lose'], ['wetten', 'trophy', 'Wetten'], ['boerse', 'chart', 'Börse'], ['spiele', 'dice', 'Spiele'], ['rang', 'medal', 'Rang'], ['treff', 'video', 'Treff']];
const PAGES = { halle: renderHalle, lose: renderLose, wetten: renderWetten, boerse: renderBoerse, spiele: renderSpiele, rang: renderRang, treff: renderTreff, profil: renderProfil, konto: renderKonto, imperium: renderImperium };
let curPage = 'halle'; const PT = {};
function pageTimer(fn, ms, key = 'main') { if (PT[key]) clearInterval(PT[key]); PT[key] = setInterval(fn, ms); }
function go(p, keep) {
  Object.keys(PT).forEach(k => { clearInterval(PT[k]); delete PT[k]; });
  const y = scrollY; curPage = p;
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.p === p || (p === 'imperium' && b.dataset.p === 'spiele')));
  const m = $('#main'); m.innerHTML = '<div class="page"></div>';
  PAGES[p]($('.page', m));
  if (keep) { $('.page', m).style.animation = 'none'; scrollTo(0, y); } else scrollTo(0, 0);
}

/* ================= Profil ================= */
function renderProfil(el) {
  const got = ACH.filter(a => S.ach[a[0]]).length;
  const ordered = [...ACH].sort((a, b) => (!!S.ach[b[0]]) - (!!S.ach[a[0]]));
  el.innerHTML = `<div class="card prof"><div class="ban"></div><div class="pa">${avaHTML(S)}</div>
      <div class="pinfo"><b>${esc(S.disp)}</b><small>@${esc(S.name)}</small><button class="btn dark sm" id="pEd" style="align-self:flex-start">${icon('edit')} Bearbeiten</button></div></div>
    <div class="stats">
      <div class="stat"><small>Level</small><b>${S.level}</b></div>
      <div class="stat"><small>Kontostand</small><b class="num ${S.bal < 0 ? 'neg' : ''}">${fmt(S.bal)}</b></div>
      <div class="stat"><small>Größter Gewinn</small><b class="num">${fmtInt(S.st.biggest)}</b></div>
      <div class="stat"><small>Plus / Minus</small><b class="num ${S.st.net < 0 ? '' : 'pos'}">${fmt(S.st.net, { sign: true })}</b></div>
      <div class="stat"><small>Börse</small><b class="num">${S.bx.pnl >= 0 ? '+' : ''}${fmtInt(S.bx.pnl)}</b></div>
      <div class="stat"><small>Umsatz</small><b class="num">${fmt(S.st.wagered)}</b></div>
    </div>
    <p class="hint">Dabei seit ${new Date(S.created).toLocaleDateString('de-DE')}${S.st.bestGame ? ` · bester Treffer an ${esc(S.st.bestGame)}` : ''}</p>
    <div class="sec">Mein Konto</div>
    <div class="card tight list">
      <div class="it" data-go="konto"><div class="ibox">${icon('bank')}</div><span class="lbl">Konto &amp; Schulden</span><span class="val num">${fmt(S.bal)}</span>${icon('right', 'chev')}</div>
      <div class="it" data-go="spiele"><div class="ibox">${icon('dice')}</div><span class="lbl">Minispiele &amp; Glückstränke</span>${icon('right', 'chev')}</div>
      <div class="it" id="pSet"><div class="ibox">${icon('gear')}</div><span class="lbl">Einstellungen &amp; Spielstand</span>${icon('right', 'chev')}</div>
      <div class="it" data-go="imperium"><div class="ibox">${icon('building')}</div><span class="lbl">Imperium (Geschäfte)</span>${icon('right', 'chev')}</div>
    </div>
    <div class="sec">Erfolge · ${got} / ${ACH.length}</div>
    ${ordered.map(([id, n, d, rw]) => `<div class="ach ${S.ach[id] ? 'got' : ''}"><div class="ic">${icon('trophy')}</div><div class="tx"><b>${n}</b><small>${d}</small></div><span class="rw num">+${fmt(rw)}</span></div>`).join('')}`;
  $$('[data-go]', el).forEach(i => i.onclick = () => go(i.dataset.go));
  $('#pSet', el).onclick = openSettings; $('#pEd', el).onclick = editProfile;
}
function editProfile() {
  const o = sheet(`<div class="row sb"><h2>Profil bearbeiten</h2><button class="x" data-close>${icon('x')}</button></div>
    <div class="lbl2">Anzeigename</div><input class="inp" id="eN" maxlength="18" value="${esc(S.disp)}">
    <div class="lbl2">Farbe</div><div class="row" style="flex-wrap:wrap;gap:10px" id="eC">${AVA_COLS.map((c, i) => `<button data-c="${i}" class="avatar" style="background:${c};${S.color === i ? 'outline:3px solid #fff;outline-offset:2px' : ''}">${initials(S.disp)}</button>`).join('')}</div>
    <div class="lbl2">Profilbild</div><div class="row"><label class="btn dark sm" style="cursor:pointer">${icon('face')} Foto wählen<input type="file" accept="image/*" id="eP" hidden></label>${S.photo ? '<button class="btn dark sm" id="eR">Entfernen</button>' : ''}</div>
    <button class="btn white w" id="eS" style="margin-top:22px">Speichern</button>`);
  let col = S.color, photo = S.photo;
  $('#eC', o).onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; col = +b.dataset.c; $$('#eC button', o).forEach(x => x.style.outline = x === b ? '3px solid #fff' : ''); };
  $('#eP', o).onchange = e => {
    const f = e.target.files[0]; if (!f) return; const img = new Image(); img.onload = () => {
      const cv = document.createElement('canvas'), s = 180; cv.width = cv.height = s; const c = cv.getContext('2d'), m = Math.min(img.width, img.height);
      c.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s); photo = cv.toDataURL('image/jpeg', .8); toast('Foto ausgewählt – jetzt speichern.');
    }; img.src = URL.createObjectURL(f);
  };
  const r = $('#eR', o); if (r) r.onclick = () => { photo = ''; r.remove(); };
  $('#eS', o).onclick = () => { const n = $('#eN', o).value.trim(); if (n.length < 2) { toast('Name zu kurz', 'bad'); return; } S.disp = n; S.color = col; S.photo = photo; S.st.edits++; persist(); hdr(); o.close(); go('profil', true); toast('Profil gespeichert ✓', 'good'); };
}
function openSettings() {
  const o = sheet(`<div class="row sb"><h2>Einstellungen</h2><button class="x" data-close>${icon('x')}</button></div>
    <div class="card tight list" style="margin-top:16px;background:#151517">
      <div class="it"><span class="lbl">Sound</span><button class="tog ${S.set.snd !== false ? 'on' : ''}" data-t="snd"></button></div>
      <div class="it"><span class="lbl">Vibration</span><button class="tog ${S.set.vib !== false ? 'on' : ''}" data-t="vib"></button></div>
    </div>
    <div class="lbl2">Passwort ändern</div><div class="row"><input class="inp" type="password" id="nPw" placeholder="Neues Passwort"><button class="btn dark sm" id="sPw">OK</button></div>
    <div class="lbl2">Spielstand-Code (zum Übertragen auf ein anderes Gerät)</div>
    <div class="two"><button class="btn dark sm" id="exp">Code kopieren</button><button class="btn dark sm" id="imp">Code laden</button></div>
    <div class="two" style="margin-top:22px"><button class="btn dark" id="out">${icon('out')} Abmelden</button><button class="btn red" id="del">Konto löschen</button></div>`);
  $$('[data-t]', o).forEach(b => b.onclick = () => { const k = b.dataset.t; S.set[k] = S.set[k] === false; b.classList.toggle('on', S.set[k] !== false); save(); SND.click(); });
  $('#sPw', o).onclick = async () => { const p = $('#nPw', o).value; if (p.length < 4) { toast('Mindestens 4 Zeichen', 'bad'); return; } const all = Accounts.all(), a = all[ACC]; a.salt = Math.random().toString(36).slice(2); a.hash = await Accounts.hash(p, a.salt); Accounts.put(all); persist(); $('#nPw', o).value = ''; toast('Passwort geändert ✓', 'good'); };
  $('#exp', o).onclick = async () => { persist(); const code = 'GG1:' + btoa(unescape(encodeURIComponent(JSON.stringify({ ...S, photo: '' })))); try { await navigator.clipboard.writeText(code); toast('Spielstand-Code kopiert 📋', 'good'); } catch (e) { sheet(`<h2>Dein Code</h2><textarea class="inp" style="height:200px;font-size:12px" readonly>${code}</textarea>`, { center: true }); } };
  $('#imp', o).onclick = () => {
    const s2 = sheet(`<h2>Code laden</h2><p class="hint">Achtung: überschreibt den Spielstand von <b>${esc(S.disp)}</b>.</p><textarea class="inp" id="ic" style="height:160px;font-size:12px"></textarea><button class="btn white w" id="ig" style="margin-top:12px">Laden</button>`, { center: true });
    $('#ig', s2).onclick = () => { try { const t = $('#ic', s2).value.trim(); if (!t.startsWith('GG1:')) throw 0; const d = JSON.parse(decodeURIComponent(escape(atob(t.slice(4))))); if (typeof d.bal !== 'number') throw 0; const nm = S.name; S = Object.assign(newState(nm), d, { name: nm }); persist(); location.reload(); } catch (e) { toast('Ungültiger Code', 'bad'); } };
  };
  $('#out', o).onclick = () => { persist(); localStorage.removeItem(SES_KEY); location.reload(); };
  $('#del', o).onclick = async () => { if (await confirmBox('Konto löschen?', `<b>${esc(S.disp)}</b> und der komplette Spielstand werden gelöscht. Das geht nicht rückgängig.`, 'Löschen', true)) { const all = Accounts.all(); delete all[ACC]; Accounts.put(all); localStorage.removeItem(SES_KEY); S = null; location.reload(); } };
}

/* ================= Konto & Schulden ================= */
function openKonto(bx) { go('konto'); if (bx) setTimeout(() => { const e = $('#bxSec'); e && e.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120); }
function renderKonto(el) {
  applyInterest();
  const neg = S.bal < 0, lk = isLocked(), pct = neg ? Math.min(100, -S.bal / DISPO * 100) : 100;
  el.innerHTML = `<h1 class="t">Konto</h1><p class="sub">Guthaben, Schulden und Börsenkonto</p>
    <button class="btn dark" id="kMini" style="margin-bottom:16px">${icon('dice')} Minispiele</button>
    <div class="card"><small style="color:#b0b0b6;font-size:18px">Kontostand</small><div class="num ${neg ? 'neg' : ''}" style="font-size:clamp(44px,14vw,72px);font-weight:800;letter-spacing:-2px;margin:6px 0 14px">${fmt(S.bal)}</div>
      <div class="row" style="flex-wrap:wrap;gap:10px">${lk ? '<span class="chip red">Gesperrt</span>' : neg ? '<span class="chip red">Im Dispo</span>' : '<span class="chip gold">Im Plus</span>'}<span class="chip num">Dispo bis ${fmt(-DISPO)}</span></div>
      <div class="bar" style="margin:22px 0 16px;height:8px"><i style="width:${pct}%;background:${neg ? 'var(--red)' : 'var(--green)'}"></i></div>
      <p class="hint" style="font-size:18px">Du darfst bis ${fmt(-DISPO)} ins Minus spielen (0,5 % Zinsen pro Stunde). Darunter wird gesperrt – dann in den Minispielen Geld zurückholen oder die Schulden ans Inkasso verkaufen.</p></div>
    <div class="sec">Schulden</div><div class="card" id="debt"></div>
    <div class="sec" id="bxSec">Handelskonto (Börse)</div>
    <div class="card"><div class="row sb"><span style="font-size:20px">Guthaben Börse</span><b class="num" style="font-size:22px">${fmt(S.bx.bal)}</b></div>
      <div style="border-top:1px solid var(--line);margin:16px -20px;"></div>
      <input class="inp num" id="bxAmt" type="number" inputmode="decimal" placeholder="Betrag in €">
      <div style="border-top:1px solid var(--line);margin:16px -20px;"></div>
      <div class="two"><button class="btn dark" id="bxIn">Einzahlen ${icon('up')}</button><button class="btn dark" id="bxOut">Auszahlen ${icon('down')}</button></div></div>
    <p class="hint">Geld auf dem Handelskonto kannst du an der Börse einsetzen. Auszahlen geht nur mit freier Margin.</p>`;
  $('#kMini', el).onclick = () => go('spiele');
  const d = $('#debt', el); let h = '';
  if (neg) h += `<p style="font-size:19px;line-height:1.5">Du bist mit <b class="neg">${fmt(-S.bal)}</b> im Minus. Verkauf die Schulden an „Inkasso Krause“: Dein Konto steht sofort auf 0. Dafür bekommst du einen Schuldschein über 130 %, 40 % jedes Gewinns gehen dann dorthin.</p>
      <button class="btn red w" id="dSell" style="margin-top:18px">Schulden verkaufen</button>`;
  if (S.note > 0) h += `${neg ? '<div style="border-top:1px solid var(--line);margin:18px -20px"></div>' : ''}<div class="row sb"><span style="font-size:20px">Schuldschein offen</span><b class="num neg" style="font-size:24px">${fmt(S.note)}</b></div>
      <div style="border-top:1px solid var(--line);margin:16px -20px"></div><div class="row"><input class="inp num" id="dAmt" type="number" inputmode="decimal" placeholder="Betrag"><button class="btn white" id="dPay">Tilgen</button></div>`;
  if (neg || S.note > 0) h += `<div style="border-top:1px solid var(--line);margin:18px -20px 0"></div><button class="linkbtn" id="dIns">Privatinsolvenz anmelden</button>`;
  if (!h) h = '<p style="font-size:19px">Keine Schulden 🎉</p>';
  d.innerHTML = h;
  const sell = $('#dSell', el); if (sell) sell.onclick = () => {
    const debt = -S.bal, nn = r2(debt * 1.3); S.note = r2(S.note + nn); S.bal = 0; S.st.inkasso++;
    toast(`Schulden verkauft – Schuldschein über ${fmt(S.note)}`); SND.coin(); hdr(true); checkAch(); save(); go('konto', true);
  };
  const pay = $('#dPay', el); if (pay) pay.onclick = () => {
    const a = r2(Math.min(+$('#dAmt', el).value || 0, S.note));
    if (a <= 0) return; if (S.bal < a) { toast('Nicht genug Guthaben zum Tilgen.', 'bad'); return; }
    S.bal = r2(S.bal - a); S.note = r2(S.note - a); toast(S.note <= 0 ? 'Schuldschein komplett getilgt! 🎉' : `${fmt(a)} getilgt`, 'good'); if (S.note <= 0) { S.note = 0; FX.burst(80); SND.win(); }
    hdr(true); save(); go('konto', true);
  };
  const ins = $('#dIns', el); if (ins) ins.onclick = async () => {
    if (!await confirmBox('Privatinsolvenz?', 'Alle Schulden und der Schuldschein werden gelöscht und dein Konto startet bei 0 €. Dafür verlierst du <b>alle Geschäfte, dein Handelskonto, alle Glückstränke</b> und die Hälfte deiner Level.', 'Insolvenz anmelden', true)) return;
    Object.assign(S, { bal: 0, note: 0, shops: {}, pot: { 2: 0, 4: 0, 6: 0 }, potAct: null, level: Math.max(1, Math.floor(S.level / 2)), xp: 0 });
    S.bx = Object.assign(S.bx, { bal: 0, pos: [], ord: [] }); S.st.insolv++; S.shopTs = Date.now();
    toast('Privatinsolvenz durch – Neustart bei 0 €.'); hdr(true); save(); go('konto', true);
  };
  const amt = () => r2(+$('#bxAmt', el).value || 0);
  $('#bxIn', el).onclick = () => { const a = amt(); if (a <= 0) return; if (S.bal < a) { toast('Nicht genug Guthaben (Dispo zählt nicht).', 'bad'); SND.err(); return; } S.bal = r2(S.bal - a); S.bx.bal = r2(S.bx.bal + a); SND.coin(); toast(`${fmt(a)} aufs Handelskonto eingezahlt`, 'good'); hdr(true); save(); go('konto', true); };
  $('#bxOut', el).onclick = () => { const a = amt(); if (a <= 0) return; const st = bxStats(); if (a > Math.min(S.bx.bal, st.free) + 1e-9) { toast(`Auszahlbar: höchstens ${fmt(Math.max(0, Math.min(S.bx.bal, st.free)))}`, 'bad'); SND.err(); return; } S.bx.bal = r2(S.bx.bal - a); S.bal = r2(S.bal + a); SND.coin(); toast(`${fmt(a)} ausgezahlt`, 'good'); hdr(true); save(); go('konto', true); };
}

/* ================= Login ================= */
function showLogin() {
  $('#login').classList.remove('hidden');
  let reg = !Object.keys(Accounts.all()).length || true;
  const setMode = r => { reg = r; $('#tReg').classList.toggle('on', r); $('#tLog').classList.toggle('on', !r); $('#lPw2').classList.toggle('hidden', !r); $('#lGo').textContent = r ? 'Konto erstellen' : 'Anmelden'; $('#lErr').textContent = ''; };
  setMode(Object.keys(Accounts.all()).length === 0);
  $('#tReg').onclick = () => setMode(true); $('#tLog').onclick = () => setMode(false);
  const go_ = async () => {
    const name = $('#lName').value.trim(), pw = $('#lPw').value, key = name.toLowerCase(), all = Accounts.all(), err = t => { $('#lErr').textContent = t; SND.err(); };
    if (name.length < 2) return err('Name: mindestens 2 Zeichen');
    if (!/^[\p{L}\p{N} _.\-]+$/u.test(name)) return err('Name: nur Buchstaben, Zahlen, Leerzeichen, _ . -');
    if (pw.length < 4) return err('Passwort: mindestens 4 Zeichen');
    if (reg) {
      if (all[key]) return err('Den Namen gibt es schon – melde dich an.');
      if (pw !== $('#lPw2').value) return err('Passwörter stimmen nicht überein');
      const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
      all[key] = { name, salt, hash: await Accounts.hash(pw, salt), created: Date.now(), save: newState(name) };
      Accounts.put(all);
    } else {
      const a = all[key]; if (!a) return err('Konto nicht gefunden');
      if (await Accounts.hash(pw, a.salt) !== a.hash) return err('Falsches Passwort');
    }
    localStorage.setItem(SES_KEY, key);
    $('#login').style.transition = 'opacity .5s'; $('#login').style.opacity = 0;
    setTimeout(() => { $('#login').classList.add('hidden'); startApp(key); if (reg) setTimeout(() => toast(`Willkommen, ${esc(name)}! Du startest mit ${fmt(500)} Spielgeld 🎰`, 'good', 4500), 600); }, 500);
  };
  $('#lGo').onclick = go_;
  $$('#login input').forEach(i => i.onkeydown = e => e.key === 'Enter' && go_());
}
function startApp(key) {
  const all = Accounts.all(); ACC = key;
  S = Object.assign(newState(all[key].name), all[key].save || {});
  S.st = Object.assign(newState('').st, S.st); S.bx = Object.assign(newState('').bx, S.bx); S.set = Object.assign({ snd: true, vib: true }, S.set);
  const away = Date.now() - (all[key].ts || Date.now());
  applyInterest(); regenEnergy(); ensureTasks(); settleBets();
  $('#app').classList.remove('hidden');
  $('#nav').innerHTML = NAV.map(([p, ic, n]) => `<button data-p="${p}">${icon(ic)}<span>${n}</span></button>`).join('');
  $('#nav').onclick = e => { const b = e.target.closest('[data-p]'); if (b && b.dataset.p !== curPage) { SND.click(); vib(5); go(b.dataset.p); } else if (b) scrollTo({ top: 0, behavior: 'smooth' }); };
  $('#hBalPill').onclick = () => go('konto'); $('#hLvl').onclick = () => go('profil');
  $('#hChat').innerHTML = icon('chat'); $('#hChat').onclick = openChat;
  $('#hLock').innerHTML = icon('lock');
  hdr(); go('halle'); checkAch();
  const pend = shopPending(); if (pend > 1 && away > 6e4) setTimeout(() => toast(`Deine Geschäfte haben ${fmt(pend)} verdient – im Imperium einsammeln 🏪`, 'good', 4500), 1600);
  if (bonusReady()) setTimeout(() => S && openBonus(), 900);
  setInterval(() => { if (!S) return; applyInterest(); regenEnergy(); hdr(); save(); }, 30000);
  setInterval(() => { if (!S) return; if (S.bx.pos.length || S.bx.ord.length) bxTick(); settleBets(); }, 2000);
  document.addEventListener('pointerdown', () => SND.c(), { once: true });
}

/* ================= Start ================= */
FX.init();
setTimeout(() => {
  $('#splash').classList.add('out'); setTimeout(() => $('#splash').remove(), 800);
  const k = localStorage.getItem(SES_KEY), all = Accounts.all();
  if (k && all[k]) startApp(k); else showLogin();
}, 1500);
