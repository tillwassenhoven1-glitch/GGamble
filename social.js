'use strict';
/* ================= Rangliste ================= */
const BOTS = [['Kalle Kasse', 1], ['Moneten-Mia', 3], ['Zocker-Zoe', 2], ['Dispo-Dieter', 5], ['Jackpot-Jens', 4], ['Lotto-Lena', 1], ['Börsen-Bernd', 2], ['Glücks-Gabi', 3]];
function botBal(i) { const t = Date.now() / 36e5, b = [2.1e6, 640000, 185000, 52000, 9800, 3100, 870, 240][i]; return r2(b * (1 + .25 * Math.sin(t / 7 + i * 1.7) + .1 * Math.sin(t / 1.3 + i))); }
function ago(ts) { const s = (Date.now() - ts) / 1000; return s < 3600 ? `vor ${Math.max(1, Math.floor(s / 60))} Min.` : s < 86400 ? `vor ${Math.floor(s / 3600)} Std.` : `vor ${Math.floor(s / 86400)} T.`; }
function renderRang(el) {
  persist();
  const all = Accounts.all();
  const rows = Object.entries(all).map(([k, a]) => ({ k, disp: a.disp || a.name, name: a.name, photo: a.photo, color: a.save?.color || 0, bal: a.save ? a.save.bal : 0, lvl: a.save?.level || 1, ts: a.ts || a.created, me: k === ACC }))
    .concat(BOTS.map(([n, c], i) => ({ k: 'bot' + i, disp: n, name: 'bot', bot: 1, color: c, bal: botBal(i), lvl: 8 + i * 3 % 17, ts: Date.now() - (i + 1) * 47 * 6e4 })));
  rows.sort((a, b) => b.bal - a.bal);
  const top = rows.slice(0, 3), meI = rows.findIndex(r => r.me);
  const pod = (r, i) => r ? `<div class="p${i + 1}"><div class="pa">${avaHTML(r)}<span class="rk" style="background:${['#d8b85a', '#cfcfd4', '#c8875a'][i]}">${i + 1}</span></div><div class="nm">${esc(r.disp)}</div><div class="vv num">${fmt(r.bal)}</div><div class="blk" style="height:${[150, 110, 80][i]}px"></div></div>` : '<div></div>';
  el.innerHTML = `<h1 class="t">Rangliste</h1><p class="sub">Die reichsten Zocker${meI >= 0 ? ` · du bist auf Platz ${meI + 1}` : ''}</p>
    <div class="podium">${pod(top[1], 1)}${pod(top[0], 0)}${pod(top[2], 2)}</div>
    <div class="card tight list rl">${rows.map((r, i) => `<div class="it ${r.me ? 'me' : ''}" data-k="${r.k}"><span class="rn">${i + 1}</span>${avaHTML(r)}<div class="who"><b>${esc(r.disp)}${r.bot ? ' <span style="font-size:13px;color:var(--mut)">🤖 Bot</span>' : ''}</b><small>${r.bot ? 'Computer-Gegner' : '@' + esc(r.name)} · ${ago(r.ts)}</small></div><span class="w num ${r.bal < 0 ? 'neg' : ''}">${fmt(r.bal)}</span>${icon('right', 'chev')}</div>`).join('')}</div>
    <p class="hint">Die Rangliste zeigt alle Konten, die auf diesem Gerät angelegt wurden, plus Computer-Gegner.</p>`;
  el.querySelector('.rl').onclick = e => {
    const it = e.target.closest('[data-k]'); if (!it) return; const r = rows.find(x => x.k === it.dataset.k);
    if (r.me) { go('profil'); return; }
    sheet(`<div class="row sb"><div class="row">${avaHTML(r)}<div><h2 style="font-size:26px">${esc(r.disp)}</h2><small style="color:var(--mut)">${r.bot ? 'Computer-Gegner' : '@' + esc(r.name)}</small></div></div><button class="x" data-close>${icon('x')}</button></div>
      <div class="stats" style="margin-top:18px"><div class="stat"><small>Level</small><b>${r.lvl}</b></div><div class="stat"><small>Kontostand</small><b class="num ${r.bal < 0 ? 'neg' : ''}">${fmt(r.bal)}</b></div></div>`);
  };
}

/* ================= Treff: Video-Räume (PeerJS) ================= */
const ROOMS = [['lounge', 'Lounge', 'video', 1], ['hinterzimmer', 'Hinterzimmer', 'video', 1], ['vip', 'VIP-Separee', 'crown', 30]];
const FILTERS = { Normal: 'none', Gold: 'sepia(.7) saturate(1.7) hue-rotate(-12deg) brightness(1.05)', Noir: 'grayscale(1) contrast(1.4)', Neon: 'saturate(2.4) hue-rotate(190deg) contrast(1.2)', Retro: 'sepia(.45) contrast(.9) brightness(1.1) saturate(1.5)', Comic: 'contrast(2) saturate(2.2)', Spiegel: 'none' };
const T = { peer: null, room: null, stream: null, conns: {}, calls: {}, names: {}, filt: {}, host: false, log: [], ov: null };
function filterCSS(f, mine) { return (FILTERS[f] || 'none') + ((mine && f === 'Spiegel') || (mine && S.set.mirror !== false) ? '' : ''); }
function renderTreff(el) {
  el.innerHTML = `<h1 class="t">Treff</h1><p class="sub">Video-Räume mit Chat – laufen weiter, während du spielst</p>
    <button class="btn dark" id="camT" style="margin-bottom:18px">${icon('wand')} Kamera &amp; Filter testen</button>
    ${ROOMS.map(([id, n, ic, lvl]) => `<div class="card room"><div class="ibox">${icon(ic)}</div><div class="inf"><b>${n}</b><small>${T.room === id ? `Du bist drin · ${Object.keys(T.names).length + 1} Leute` : 'Video-Raum · bis 6 Leute'}</small></div>
      ${S.level < lvl ? `<span class="chip">${icon('lock')} Level ${lvl}</span>` : T.room === id ? `<button class="btn white sm" data-open>Öffnen</button>` : `<button class="btn white sm" data-r="${id}">Beitreten</button>`}</div>`).join('')}
    <div class="card"><div class="row" style="align-items:flex-start">${icon('face')}<p class="hint" style="margin:0">Räume laufen direkt zwischen den Geräten (über PeerJS). Wer zuerst im Raum ist, ist der Gastgeber – verlässt er den Raum, schließt er sich. In manchen Schul- oder Firmen-WLANs kann die Verbindung blockiert sein.</p></div></div>`;
  $('#camT', el).onclick = camTest;
  el.onclick = e => { const b = e.target.closest('[data-r]'); if (b) joinRoom(b.dataset.r); if (e.target.closest('[data-open]')) roomUI(); };
}
async function getCam() {
  if (T.stream) return T.stream;
  try { T.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 640 }, audio: true }); return T.stream; }
  catch (e) { toast('Kamera/Mikro nicht erlaubt – du kannst trotzdem chatten.', 'bad'); return null; }
}
async function camTest() {
  const st = await getCam(); if (!st) return;
  const cur = S.set.filter || 'Normal';
  const o = sheet(`<div class="row sb"><h2>Kamera &amp; Filter</h2><button class="x" data-close>${icon('x')}</button></div>
    <div style="border-radius:24px;overflow:hidden;margin-top:14px;aspect-ratio:3/4;background:#111"><video id="tv" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1)"></video></div>
    <div class="filters">${Object.keys(FILTERS).filter(k => k !== 'Spiegel').map(k => `<button data-f="${k}" class="${k === cur ? 'on' : ''}">${k}</button>`).join('')}</div>
    <p class="hint">Dein Filter wird auch den anderen im Raum angezeigt.</p>`, { onClose: () => { if (!T.room) stopCam(); } });
  const v = $('#tv', o); v.srcObject = st; v.style.filter = FILTERS[cur];
  $('.filters', o).onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; S.set.filter = b.dataset.f; save(); v.style.filter = FILTERS[b.dataset.f]; $$('.filters button', o).forEach(x => x.classList.toggle('on', x === b)); broadcast({ t: 'filt', f: b.dataset.f }); };
}
function stopCam() { if (T.stream) { T.stream.getTracks().forEach(t => t.stop()); T.stream = null; } }
function loadPeer() {
  if (window.Peer) return Promise.resolve();
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'; s.onload = res; s.onerror = () => rej(new Error('PeerJS konnte nicht geladen werden')); document.head.appendChild(s); });
}
async function joinRoom(id) {
  if (T.room) { if (T.room === id) return roomUI(); await leaveRoom(); }
  toast('Verbinde mit dem Raum …');
  try { await loadPeer(); } catch (e) { toast(e.message, 'bad'); return; }
  await getCam();
  T.room = id; T.names = {}; T.log = []; T.conns = {}; T.calls = {}; T.filt = {};
  const hostId = 'ggamble-treff-v1-' + id;
  const setup = (peer, host) => {
    T.peer = peer; T.host = host;
    peer.on('connection', conn => wireConn(conn));
    peer.on('call', call => { call.answer(T.stream || undefined); wireCall(call); });
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { } });
  };
  const asHost = new Peer(hostId);
  asHost.on('open', () => { setup(asHost, true); sysMsg('Du hast den Raum eröffnet. Warte auf andere …'); S.st.treff++; checkAch(); roomUI(); go(curPage, true); });
  asHost.on('error', err => {
    if (err.type === 'unavailable-id') {
      asHost.destroy();
      const g = new Peer();
      g.on('open', () => { setup(g, false); const c = g.connect(hostId, { reliable: true }); wireConn(c, true); S.st.treff++; checkAch(); roomUI(); go(curPage, true); });
      g.on('error', e2 => { if (e2.type === 'peer-unavailable') { toast('Raum nicht erreichbar – versuch es nochmal.', 'bad'); leaveRoom(); } });
    } else if (!T.peer) { toast('Verbindung fehlgeschlagen: ' + err.type, 'bad'); T.room = null; }
  });
}
function wireConn(conn, toHost) {
  conn.on('open', () => {
    T.conns[conn.peer] = conn;
    conn.send({ t: 'hi', name: S.disp, f: S.set.filter || 'Normal' });
  });
  conn.on('data', d => {
    if (!d || !d.t) return;
    if (d.t === 'hi') {
      T.names[conn.peer] = d.name; T.filt[conn.peer] = d.f; sysMsg(`${esc(d.name)} ist da 👋`);
      if (T.host) { conn.send({ t: 'peers', list: Object.keys(T.conns).filter(p => p !== conn.peer).map(p => ({ id: p, name: T.names[p] })) }); }
      refreshRoom();
    } else if (d.t === 'peers') {
      // Gast: zu allen anderen verbinden + anrufen
      d.list.forEach(p => { if (!T.conns[p.id]) { const c = T.peer.connect(p.id, { reliable: true }); wireConn(c); } });
      [conn.peer, ...d.list.map(p => p.id)].forEach(p => { if (T.stream && !T.calls[p]) { const call = T.peer.call(p, T.stream); wireCall(call); } });
    } else if (d.t === 'chat') { addMsg(d.name, d.txt); }
    else if (d.t === 'filt') { T.filt[conn.peer] = d.f; refreshRoom(); }
  });
  conn.on('close', () => { const n = T.names[conn.peer]; delete T.conns[conn.peer]; delete T.names[conn.peer]; if (T.calls[conn.peer]) { T.calls[conn.peer].close(); delete T.calls[conn.peer]; } if (n) sysMsg(`${esc(n)} ist gegangen`); if (toHost) { toast('Der Gastgeber hat den Raum geschlossen.'); leaveRoom(); } refreshRoom(); });
}
function wireCall(call) { T.calls[call.peer] = call; call.on('stream', s => { call._s = s; refreshRoom(); }); call.on('close', () => { delete T.calls[call.peer]; refreshRoom(); }); }
function broadcast(m) { Object.values(T.conns).forEach(c => { try { c.open && c.send(m); } catch (e) { } }); }
function sysMsg(t) { T.log.push(`<p style="color:var(--mut)">${t}</p>`); refreshChat(); }
function addMsg(n, t) { T.log.push(`<p><b>${esc(n)}:</b> ${esc(t)}</p>`); if (T.log.length > 100) T.log.shift(); refreshChat(); if (!T.ov) { toast(`💬 ${esc(n)}: ${esc(t).slice(0, 60)}`); } }
function refreshChat() { $$('.chatlog').forEach(l => { l.innerHTML = T.log.join(''); l.scrollTop = 1e6; }); }
function roomUI() {
  if (!T.room) return;
  if (T.ov) T.ov.close();
  const rn = ROOMS.find(r => r[0] === T.room)[1];
  const o = sheet(`<div class="row sb"><div><h2>${rn}</h2><small style="color:var(--mut)" id="rCnt"></small></div><button class="x" data-close>${icon('down')}</button></div>
    <div class="vgrid" id="vg"></div>
    <div class="chatlog"></div>
    <div class="row"><input class="inp" id="cIn" placeholder="Nachricht …" maxlength="200"><button class="btn white sm" id="cGo">Senden</button></div>
    <button class="btn red w" id="rLeave" style="margin-top:14px">Raum verlassen</button>`, { onClose: () => { T.ov = null; updMini(); } });
  T.ov = o; refreshRoom(); refreshChat(); updMini();
  const send = () => { const i = $('#cIn', o), t = i.value.trim(); if (!t) return; i.value = ''; addMsg(S.disp, t); broadcast({ t: 'chat', name: S.disp, txt: t }); };
  $('#cGo', o).onclick = send; $('#cIn', o).onkeydown = e => e.key === 'Enter' && send();
  $('#rLeave', o).onclick = () => { o.close(); leaveRoom(); };
}
function refreshRoom() {
  const vg = T.ov && $('#vg', T.ov);
  if (vg) {
    const tiles = [`<div class="v"><video autoplay playsinline muted id="vMe" style="transform:scaleX(-1);filter:${FILTERS[S.set.filter || 'Normal']}"></video><span>${esc(S.disp)} (du)</span></div>`]
      .concat(Object.keys(T.names).map(p => `<div class="v"><video autoplay playsinline data-p="${p}" style="filter:${FILTERS[T.filt[p] || 'Normal']}"></video><span>${esc(T.names[p])}</span></div>`));
    vg.innerHTML = tiles.join('');
    const me = $('#vMe', vg); if (T.stream) me.srcObject = T.stream;
    $$('video[data-p]', vg).forEach(v => { const c = T.calls[v.dataset.p]; if (c && c._s) v.srcObject = c._s; });
    const rc = $('#rCnt', T.ov); if (rc) rc.textContent = `${Object.keys(T.names).length + 1} im Raum${T.host ? ' · du bist Gastgeber' : ''}`;
  }
  updMini();
}
function updMini() {
  let m = $('#miniCam');
  if (!T.room || T.ov || !T.stream) { m && m.remove(); return; }
  if (!m) { m = document.createElement('div'); m.id = 'miniCam'; m.innerHTML = `<video autoplay playsinline muted style="transform:scaleX(-1)"></video>`; document.body.appendChild(m); m.onclick = roomUI; }
  const v = $('video', m); if (v.srcObject !== T.stream) v.srcObject = T.stream; v.style.filter = FILTERS[S.set.filter || 'Normal'];
}
async function leaveRoom() {
  Object.values(T.calls).forEach(c => { try { c.close(); } catch (e) { } });
  Object.values(T.conns).forEach(c => { try { c.close(); } catch (e) { } });
  if (T.peer) { try { T.peer.destroy(); } catch (e) { } }
  T.peer = null; T.room = null; T.conns = {}; T.calls = {}; T.names = {}; stopCam(); updMini();
  if (curPage === 'treff') go('treff', true);
}
function openChat() {
  if (T.room) return roomUI();
  sheet(`<div class="row sb"><h2>Chat</h2><button class="x" data-close>${icon('x')}</button></div><p class="hint" style="font-size:18px">Der Chat läuft in den Treff-Räumen. Tritt einem Raum bei – Video und Chat laufen weiter, während du spielst.</p><button class="btn white w" id="toT">Zum Treff</button>`).querySelector('#toT').onclick = function () { this.closest('.ov').close(); go('treff'); };
}
