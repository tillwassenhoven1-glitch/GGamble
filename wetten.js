'use strict';
/* ================= Sportwetten: GG Liga ================= */
const TEAMS = [
  ['Borussia Kiosk', '#e6b93a', 1.25], ['Fortuna Feierabend', '#a0782a', 1.0], ['FC Schrebergarten', '#3a8a4a', 1.1], ['SV Bolzplatz', '#4cc265', 1.05],
  ['Rot-Weiß Späti', '#c0392b', 1.15], ['Dönerstadt 04', '#c8742a', 1.2], ['Kiez Kickers', '#e05a3a', 1.3], ['Dynamo Pfandflasche', '#8a3ad0', .9],
  ['VfB Wurstbude', '#a0522d', .95], ['Union Dorfteich', '#3a6ad0', .85], ['Hertha Hängematte', '#5a9ae0', .8], ['Eintracht Couch', '#d03a6a', .9],
  ['Bayer Bierbank', '#e0d03a', 1.35], ['Werder Waschsalon', '#2ab0a0', 1.0], ['Arminia Autobahn', '#6a6a6a', .88], ['Viktoria Vorgarten', '#7ac03a', .92],
  ['Alemannia Altbau', '#e0e0e0', 1.08], ['Sportfreunde Sofa', '#d07a3a', .78],
];
const SLOT = 300000, LIVE = 60000, MD0 = Math.floor(Date.UTC(2026, 10, 16) / SLOT);
const curMd = () => Math.floor(Date.now() / SLOT) - MD0;
const kickoff = md => (md + MD0 + 1) * SLOT;
const mdCache = {};
function poisson(l, r) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; }
function pois(l, k) { let f = 1; for (let i = 2; i <= k; i++) f *= i; return Math.exp(-l) * Math.pow(l, k) / f; }
function matchday(md) {
  if (mdCache[md]) return mdCache[md];
  const r = mulberry(md * 7919 + 17), ids = TEAMS.map((_, i) => i).sort(() => r() - .5), ms = [];
  for (let k = 0; k < 6; k++) {
    const h = ids[k * 2], a = ids[k * 2 + 1];
    const sh = TEAMS[h][2] * (.85 + r() * .3), sa = TEAMS[a][2] * (.85 + r() * .3);
    const lh = clamp(1.4 * sh / sa, .25, 3.6), la = clamp(1.1 * sa / sh, .2, 3.2);
    let pH = 0, pD = 0, pA = 0, pO = 0, pB = 0;
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
      const p = pois(lh, i) * pois(la, j);
      if (i > j) pH += p; else if (i === j) pD += p; else pA += p;
      if (i + j > 2) pO += p; if (i > 0 && j > 0) pB += p;
    }
    const od = p => Math.max(1.05, Math.floor(100 / (p * 1.07)) / 100);
    const gh = poisson(lh, r), ga = poisson(la, r);
    const goals = [...Array(gh).fill(0), ...Array(ga).fill(1)].map(s => ({ s, m: rint.call(null, 1, 90) }));
    // deterministische Minuten
    goals.forEach(g => g.m = 1 + Math.floor(r() * 90)); goals.sort((x, y) => x.m - y.m);
    ms.push({ k, h, a, gh, ga, goals, o: { '1': od(pH), 'X': od(pD), '2': od(pA), 'O': od(pO), 'U': od(1 - pO), 'BJ': od(pB), 'BN': od(1 - pB) } });
  }
  return mdCache[md] = ms;
}
const MK = { '1': 'Heimsieg', 'X': 'Unentschieden', '2': 'Auswärtssieg', 'O': 'Über 2,5 Tore', 'U': 'Unter 2,5 Tore', 'BJ': 'Beide treffen: Ja', 'BN': 'Beide treffen: Nein' };
function selWon(m, mk) {
  const t = m.gh + m.ga;
  return mk === '1' ? m.gh > m.ga : mk === 'X' ? m.gh === m.ga : mk === '2' ? m.ga > m.gh : mk === 'O' ? t > 2 : mk === 'U' ? t < 3 : mk === 'BJ' ? (m.gh > 0 && m.ga > 0) : !(m.gh > 0 && m.ga > 0);
}
function settleBets() {
  let ch = false;
  for (const b of S.bets) {
    if (b.st !== 'open' || Date.now() < kickoff(b.md) + LIVE) continue;
    const ms = matchday(b.md); const ok = b.sels.every(s => selWon(ms[s.mi], s.mk));
    b.st = ok ? 'won' : 'lost'; ch = true;
    if (ok) {
      const w = r2(b.stake * b.odd); b.win = w; payout(w, 'Sportwetten', b.stake); S.st.betWins++;
      if (b.sels.length >= 3) S.st.combiWin++;
      setTimeout(() => { toast(`Wette gewonnen: ${fmt(w)} ⚽`, 'good'); celebrate(w, b.odd); }, 400);
    }
  }
  if (S.bets.length > 60) S.bets = S.bets.slice(-60);
  if (ch) { checkAch(); save(); }
}
let SLIP = {}; let slipStake = 10; let wTab = 0;
function renderWetten(el) {
  settleBets();
  const md = curMd();
  el.innerHTML = `<h1 class="t">Sportwetten</h1><p class="sub">GG Liga · alle 5 Minuten ein neuer Spieltag</p>
   <div class="tabs" id="wTabs"><button data-t="0">Spieltag ${md}</button><button data-t="1">Live &amp; Ergebnisse</button><button data-t="2">Meine Wetten (${S.bets.filter(b => b.st === 'open').length})</button></div>
   <div id="wBody"></div>`;
  const tabs = $('#wTabs', el);
  const show = t => { wTab = t; $$('button', tabs).forEach(b => b.classList.toggle('on', +b.dataset.t === t)); [wDay, wLive, wMine][t]($('#wBody', el), md); };
  tabs.onclick = e => { const b = e.target.closest('button'); if (b) { SND.click(); show(+b.dataset.t); } };
  show(wTab);
  let lastMd = md;
  pageTimer(() => {
    if (curMd() !== lastMd) { SLIP = {}; renderWetten(el); return; }
    const cd = $('#wCd', el); if (cd) { const s = Math.max(0, Math.ceil((kickoff(md) - Date.now()) / 1000)); cd.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    if (wTab === 1) wLive($('#wBody', el), md, true);
    settleBets();
  }, 1000);
}
function teamCell(i, right) { return `<div class="n ${right ? 'r' : ''}">${right ? '' : `<span class="dot" style="background:${TEAMS[i][1]}"></span>`}<span>${esc(TEAMS[i][0])}</span>${right ? `<span class="dot" style="background:${TEAMS[i][1]}"></span>` : ''}</div>`; }
function wDay(b, md) {
  const ms = matchday(md);
  b.innerHTML = `<div class="card row sb"><span class="row" style="gap:12px;color:#b0b0b6;font-size:20px">${icon('clock')} Anstoß in</span><b id="wCd" class="num" style="font-size:36px">–:––</b></div>
    ${ms.map(m => `<div class="card match" data-m="${m.k}"><div class="tm">${teamCell(m.h)}<span class="vs">vs</span>${teamCell(m.a, 1)}</div>
      <div class="odds">${['1', 'X', '2'].map(k => `<button class="odd ${SLIP[m.k]?.mk === k ? 'on' : ''}" data-mk="${k}"><small>${k}</small><b class="num">${NF2.format(m.o[k]).replace(/0$/, '')}</b></button>`).join('')}
      <button class="odd plus ${SLIP[m.k] && !'1X2'.includes(SLIP[m.k].mk) ? 'on' : ''}" data-more>+</button></div></div>`).join('')}
    <div class="card betslip" id="slip"></div>`;
  b.onclick = e => {
    const c = e.target.closest('.match'); if (!c) return; const mi = +c.dataset.m, m = ms[mi];
    const o = e.target.closest('[data-mk]');
    if (o) { toggleSel(mi, o.dataset.mk, m); wDay(b, md); return; }
    if (e.target.closest('[data-more]')) {
      const sh = sheet(`<div class="row sb"><h2 style="font-size:24px">${esc(TEAMS[m.h][0])} – ${esc(TEAMS[m.a][0])}</h2><button class="x" data-close>${icon('x')}</button></div>
        <div class="lbl2">Tore</div><div class="two">${['O', 'U'].map(k => `<button class="odd ${SLIP[mi]?.mk === k ? 'on' : ''}" data-mk="${k}"><small>${MK[k]}</small><b>${NF2.format(m.o[k])}</b></button>`).join('')}</div>
        <div class="lbl2">Beide Teams treffen</div><div class="two">${['BJ', 'BN'].map(k => `<button class="odd ${SLIP[mi]?.mk === k ? 'on' : ''}" data-mk="${k}"><small>${k === 'BJ' ? 'Ja' : 'Nein'}</small><b>${NF2.format(m.o[k])}</b></button>`).join('')}</div>`);
      sh.onclick = ev => { const x = ev.target.closest('[data-mk]'); if (x) { toggleSel(mi, x.dataset.mk, m); sh.close(); wDay(b, md); } };
    }
  };
  slipUI($('#slip', b), md);
}
function toggleSel(mi, mk, m) { SND.click(); if (SLIP[mi]?.mk === mk) delete SLIP[mi]; else SLIP[mi] = { mi, mk, odd: m.o[mk] }; }
function slipUI(el, md) {
  const sels = Object.values(SLIP), ms = matchday(md);
  if (!sels.length) { el.innerHTML = `<h3 style="font-size:28px">Wettschein</h3><p class="hint" style="font-size:18px">Tippe auf eine Quote. Mehrere Spiele ergeben eine Kombiwette – die Quoten werden multipliziert.</p>`; return; }
  const odd = r2(sels.reduce((a, s) => a * s.odd, 1));
  el.innerHTML = `<h3 style="font-size:28px">Wettschein ${sels.length > 1 ? '· Kombi' : ''}</h3>
    ${sels.map(s => `<div class="sel"><span>${esc(TEAMS[ms[s.mi].h][0])} – ${esc(TEAMS[ms[s.mi].a][0])}<br><b>${MK[s.mk]}</b></span><b class="num">${NF2.format(s.odd)}</b></div>`).join('')}
    <div class="row sb" style="margin:14px 0"><span>Gesamtquote</span><b class="num" style="font-size:22px">${NF2.format(odd)}</b></div>
    <input class="inp num" id="wSt" type="number" inputmode="decimal" min="0.1" step="0.1" value="${slipStake}">
    <div class="qch">${[5, 20, 100, 500].map(v => `<button data-v="${v}">${v} €</button>`).join('')}</div>
    <div class="row sb" style="margin:14px 0"><span>Möglicher Gewinn</span><b class="num goldc" id="wPot" style="font-size:22px">${fmt(slipStake * odd)}</b></div>
    <button class="btn white w" id="wGo">Wette platzieren</button>`;
  const inp = $('#wSt', el), upd = () => { slipStake = Math.max(0, +inp.value || 0); $('#wPot', el).textContent = fmt(slipStake * odd); };
  inp.oninput = upd;
  $('.qch', el).onclick = e => { const b = e.target.closest('[data-v]'); if (b) { inp.value = b.dataset.v; upd(); } };
  $('#wGo', el).onclick = () => {
    const st = r2(slipStake); if (st < .1) { toast('Mindesteinsatz 0,10 €', 'bad'); return; }
    if (Date.now() >= kickoff(md)) { toast('Anstoß ist schon – nächster Spieltag!', 'bad'); return; }
    if (!bet(st, 'Sportwetten')) return;
    S.bets.push({ id: Date.now(), md, sels, stake: st, odd, st: 'open' }); S.st.bets++; taskProg('bets', 1);
    SLIP = {}; save(); SND.coin(); FX.burst(25, { cols: ['#fff', '#f5cf5a'] });
    toast(`Wette platziert: ${fmt(st)} @ ${NF2.format(odd)} ✅`, 'good');
    renderWetten($('#main .page') || $('#main'));
  };
}
function liveCard(md, m, now) {
  const k = kickoff(md), el = now - k, min = Math.min(90, Math.floor(el / LIVE * 90)), fin = el >= LIVE;
  const g = m.goals.filter(x => fin || x.m <= min), gh = g.filter(x => x.s === 0).length, ga = g.length - gh;
  return `<div class="card match"><div class="tm">${teamCell(m.h)}<div><div class="score num">${gh} : ${ga}</div>${fin ? '<div style="text-align:center;color:var(--mut);font-size:13px">Ende</div>' : `<div class="live">${min}'</div>`}</div>${teamCell(m.a, 1)}</div>
    ${g.length ? `<div style="color:var(--mut);font-size:14px;text-align:center">⚽ ${g.map(x => `${x.m}' ${esc(TEAMS[x.s ? m.a : m.h][0].split(' ').pop())}`).join(' · ')}</div>` : ''}</div>`;
}
function wLive(b, md, tick) {
  const now = Date.now(), prev = md - 1, prev2 = md - 2, isLive = now - kickoff(prev) < LIVE;
  b.innerHTML = `<div class="sec" style="margin-top:6px">Spieltag ${prev} ${isLive ? '<small class="live">LIVE</small>' : '<small>Endstand</small>'}</div>
    ${matchday(prev).map(m => liveCard(prev, m, now)).join('')}
    <div class="sec">Spieltag ${prev2} <small>Endstand</small></div>${matchday(prev2).map(m => liveCard(prev2, m, now)).join('')}`;
}
function wMine(b) {
  const L = [...S.bets].reverse();
  b.innerHTML = L.length ? L.map(x => { const ms = matchday(x.md); return `<div class="card"><div class="row sb"><b>Spieltag ${x.md}${x.sels.length > 1 ? ' · Kombi' : ''}</b>
      <span class="chip ${x.st === 'won' ? 'gold' : x.st === 'lost' ? 'red' : ''}">${x.st === 'won' ? 'Gewonnen ' + fmt(x.win) : x.st === 'lost' ? 'Verloren' : 'Offen'}</span></div>
      ${x.sels.map(s => { const m = ms[s.mi], done = Date.now() >= kickoff(x.md) + LIVE; return `<div class="row sb" style="padding:8px 0;border-bottom:1px solid var(--line);font-size:15px"><span>${esc(TEAMS[m.h][0])} – ${esc(TEAMS[m.a][0])}${done ? ` <b>${m.gh}:${m.ga}</b>` : ''}<br><span style="color:var(--mut)">${MK[s.mk]}</span></span><span class="num">${done ? (selWon(m, s.mk) ? '✅' : '❌') : ''} ${NF2.format(s.odd)}</span></div>`; }).join('')}
      <div class="row sb" style="margin-top:10px;color:var(--mut)"><span>Einsatz ${fmt(x.stake)}</span><span>Quote ${NF2.format(x.odd)}</span></div></div>`; }).join('')
    : '<div class="empty">Noch keine Wetten.</div>';
}
