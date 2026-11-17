'use strict';
/* ================= Automaten ================= */
const LOW = ['J', 'Q', 'K', 'A'];
const MACH = [
  { n: 'Classic 7', s: 'Der Klassiker', c: '#ff6b5e', c2: '#3a0d0d', ic: '7', top: 200, syms: ['🍒', '🍋', '🍊', '🍇', '🔔', '7'] },
  { n: 'Starlight 7', s: 'Mit Mini-Jackpot', c: '#c88cff', c2: '#2a1450', ic: '⭐', t: 'j', jp: 'mini', top: 150, syms: ['🍒', '🍋', '🍇', '🔔', '⭐', '7'] },
  { n: 'Amalfi Amore', s: '5 Walzen · 10 Linien · Herz-Wild', c: '#f2c94c', c2: '#1a2c6c', ic: '🍋', t: 'v', mx: 100, hi: ['☕', '🌹', '🍨', '🍋'], wild: '❤️', scat: '🛵' },
  { n: 'Fruit Royal', s: 'Früchte satt', c: '#f2c94c', c2: '#3a2a05', ic: '7', top: 200, syms: ['🍒', '🍋', '🍊', '🍉', '🔔', '7'] },
  { n: 'Zuckerrausch', s: 'Süß und bunt', c: '#ff7ac8', c2: '#4a0f35', ic: '🍭', top: 200, syms: ['🍬', '🧁', '🍩', '🍫', '🍦', '🍭'] },
  { n: 'Grabkammer der Sphinx', s: '5 Walzen · 10 Linien · Freispiele', c: '#f2b844', c2: '#3a2408', ic: '📜', t: 'v', mx: 300, hi: ['🐍', '🏺', '🦂', '👁️'], wild: '⚱️', scat: '📜' },
  { n: 'Lucky Clover', s: 'Fast jeder 2. Dreh gewinnt', c: '#5fd17a', c2: '#0d3a1a', ic: '🍀', t: 'k', top: 250, syms: ['🌱', '🐞', '🍄', '🌈', '💰', '🍀'] },
  { n: 'Eiskristall', s: 'Mit Mini-Jackpot', c: '#7cc8ff', c2: '#0d2a4a', ic: '💎', t: 'j', jp: 'mini', top: 150, syms: ['❄️', '⛄', '🧊', '🔔', '💎', '7'] },
  { n: 'Tiefsee-Perle', s: 'Perlen vom Meeresgrund', c: '#5fe0d0', c2: '#06343a', ic: '🦪', top: 250, syms: ['🐚', '🐠', '🐙', '🦀', '🐬', '🦪'] },
  { n: 'Pharaos Gold', s: 'Mit Major-Jackpot', c: '#f5c84a', c2: '#3a2a05', ic: '👁️', t: 'j', jp: 'major', top: 150, syms: ['🏺', '🐍', '🪲', '🐫', '👑', '👁️'] },
  { n: 'Piratenbucht', s: 'Schatz in der Truhe', c: '#ffb35a', c2: '#3a1e05', ic: '🧰', top: 200, syms: ['🦜', '⚓', '🗺️', '🦈', '☠️', '🧰'] },
  { n: 'Neon Nights', s: 'Sterne und Neon', c: '#e070ff', c2: '#2a0a40', ic: '7', lvl: 7, top: 250, syms: ['🎵', '🍸', '🌙', '💜', '⭐', '7'] },
  { n: 'Goldrausch-Saloon', s: 'Nuggets und Dynamit', c: '#e0b050', c2: '#3a2408', ic: '🪙', lvl: 7, t: 'v', mx: 200, hi: ['🤠', '🐴', '🧨', '🪙'], wild: '🌵', scat: '⛏️' },
  { n: 'Hot Seven', s: 'Siebener-Regen', c: '#ff8a3a', c2: '#3a1005', ic: '7', lvl: 8, top: 300, syms: ['🍒', '🍋', '🍑', '🍇', '🔥', '7'] },
  { n: 'Tempel der Schriftrollen', s: 'Mit Major-Jackpot', c: '#e0c070', c2: '#2a2008', ic: '📜', lvl: 9, t: 'j', jp: 'major', top: 150, syms: ['🕯️', '🗝️', '🪔', '🐉', '⛩️', '📜'] },
  { n: 'Bar Royale', s: 'Bar, Bar, Bar!', c: '#4ad8ff', c2: '#05283a', ic: '🍸', lvl: 10, top: 300, syms: ['🍋', '🍒', '🍸', '🎲', '💵', '💎'] },
  { n: 'Drachenhort', s: '5 Walzen · Feuer-Wild', c: '#ff5a3a', c2: '#3a0805', ic: '🐉', lvl: 11, t: 'v', mx: 300, hi: ['🗡️', '🛡️', '🏰', '🐉'], wild: '🔥', scat: '🥚' },
  { n: 'Kirschblüte', s: 'Sanft und süß', c: '#ffa8d0', c2: '#3a0a28', ic: '🌸', lvl: 12, top: 300, syms: ['🍡', '🎐', '🏮', '🎎', '🦊', '🌸'] },
  { n: 'Vulkanfeuer', s: '5 Walzen · heiße Freispiele', c: '#ff6a2a', c2: '#3a0a02', ic: '🌋', lvl: 13, t: 'v', mx: 400, hi: ['🦖', '💥', '☄️', '🌋'], wild: '🔥', scat: '💎' },
  { n: 'Galaxy Spins', s: 'Planeten und Sterne', c: '#8a9cff', c2: '#0a0f3a', ic: '🪐', lvl: 14, top: 400, syms: ['☄️', '🌙', '🌍', '🛸', '👽', '🪐'] },
  { n: 'Wikinger-Beute', s: '5 Walzen · Axt-Wild', c: '#a0c0e0', c2: '#0a1a2a', ic: '🪓', lvl: 15, t: 'v', mx: 400, hi: ['🛡️', '⛵', '🍺', '👑'], wild: '🪓', scat: '🐺' },
  { n: 'Diamanten-Rausch', s: 'Mit Major-Jackpot', c: '#9ae8ff', c2: '#05283a', ic: '💎', lvl: 17, t: 'j', jp: 'major', top: 200, syms: ['💍', '📿', '🔷', '💠', '👑', '💎'] },
  { n: 'Mega Joker', s: 'Der Narr zahlt', c: '#ff5a5a', c2: '#3a0510', ic: '🃏', lvl: 19, top: 500, syms: ['🍒', '🍋', '🍉', '🔔', '⭐', '🃏'] },
  { n: 'Book of Gold', s: '5 Walzen · Buch-Freispiele', c: '#f2c94c', c2: '#2a1a05', ic: '📖', lvl: 21, t: 'v', mx: 500, hi: ['🦅', '🗿', '🏺', '🧭'], wild: '📖', scat: '📖' },
  { n: 'Royal Crown', s: 'Mit Grand-Jackpot', c: '#ffd65a', c2: '#2a1450', ic: '👑', lvl: 24, t: 'j', jp: 'grand', top: 200, syms: ['🍒', '🔔', '💍', '💰', '👑', '7'] },
  { n: 'Black Diamond', s: '5 Walzen · High Roller', c: '#d0d0d0', c2: '#101010', ic: '🖤', lvl: 28, t: 'v', mx: 1000, hi: ['🎩', '🥂', '🏎️', '🖤'], wild: '💎', scat: '🎰' },
];
MACH.forEach((m, i) => { m.i = i; m.t = m.t || 'c'; m.lvl = m.lvl || 1; });
const JP = { mini: { n: 'Mini', seed: 500, ch: 1 / 1500, ref: 2 }, major: { n: 'Major', seed: 5000, ch: 1 / 6000, ref: 10 }, grand: { n: 'Grand', seed: 50000, ch: 1 / 25000, ref: 50 } };
const LINES3 = [[1, 1, 1], [0, 0, 0], [2, 2, 2], [0, 1, 2], [2, 1, 0]];
const LINES5 = [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [1, 0, 1, 2, 1]];
const LINE_COLS = ['#ffd447', '#ff5a5a', '#4ad8ff', '#7cff6b', '#ff7ac8', '#ffa64a', '#b98cff', '#ffffff', '#5affd0', '#ff4ad8'];

/* ---------- Kalibrierung (Auszahlungsquote) ---------- */
function prep(m) {
  if (m.ready) return m;
  if (m.t !== 'v') {
    const W = m.t === 'k' ? [50, 18, 13, 10, 6, 3] : [30, 24, 18, 13, 9, 6];
    const raw = m.t === 'k' ? [1.5, 10, 20, 40, 80] : [5, 8, 12, 20, 40];
    const tot = W.reduce((a, b) => a + b), p = W.map(w => w / tot);
    const target = m.t === 'j' ? .9 : .95;
    const topPart = p[5] ** 3 * m.top;
    const rest = raw.reduce((a, r, i) => a + p[i] ** 3 * r, 0);
    const k = (target - topPart) / rest;
    m.W = W; m.pay = [...raw.map(r => Math.max(1, Math.round(r * k * 10) / 10)), m.top];
    m.cells = m.syms;
  } else {
    m.cells = [...LOW, ...m.hi, m.wild]; if (m.scat !== m.wild) m.cells.push(m.scat);
    m.W = [14, 13, 12, 11, 8, 6, 5, 3.5, 2.6]; if (m.scat !== m.wild) m.W.push(2.3); else m.W[8] = 3.4;
    const raw = [[2, 5, 15], [2, 6, 18], [3, 8, 25], [3, 10, 30], [5, 15, 50], [8, 25, 80], [10, 40, 120], [20, 80, 250]];
    m.pay = [...raw, [25, 120, m.mx * 10]];
    // Monte-Carlo: Linien-Anteil skalieren
    const rng = mulberry(1234 + m.i); let line = 0, scat = 0, N = 30000;
    for (let i = 0; i < N; i++) {
      let fs = 0, first = true;
      while (first || fs > 0) {
        const g = genGrid(m, rng), ev = evalV(m, g, 1);
        const mul = first ? 1 : 2; line += ev.line * mul; scat += ev.scat * mul;
        if (!first) fs--; if (ev.fs) fs += 10; first = false; if (fs > 40) fs = 40;
      }
    }
    line /= N; scat /= N;
    const k = Math.max(.2, (.95 - scat) / line);
    m.pay = m.pay.map((r, i) => r.map((v, j) => (i === 8 && j === 2) ? v : Math.max(1, Math.round(v * k * 10) / 10)));
  }
  m.ready = true; return m;
}
function wpick(m, rng) { const tot = m.W.reduce((a, b) => a + b); let r = rng() * tot; for (let i = 0; i < m.W.length; i++) { r -= m.W[i]; if (r < 0) return m.cells[i]; } return m.cells[0]; }
function genGrid(m, rng = Math.random) { const R = m.t === 'v' ? 5 : 3; const g = []; for (let r = 0; r < R; r++) { g.push([wpick(m, rng), wpick(m, rng), wpick(m, rng)]); } return g; }
/* Auswertung 3-Walzen: Gewinn in Vielfachen des Einsatzes */
function evalC(m, g) {
  let tot = 0; const wins = [];
  LINES3.forEach((L, li) => {
    const a = g[0][L[0]], b = g[1][L[1]], c = g[2][L[2]];
    if (a === b && b === c) { const si = m.cells.indexOf(a), w = m.pay[si] / 5; tot += w; wins.push({ li, cells: L.map((r, x) => [x, r]), w }); }
  });
  return { tot, wins };
}
function evalV(m, g, stake = 1) {
  const lb = stake / 10; let line = 0; const wins = [];
  LINES5.forEach((L, li) => {
    const sy = L.map((r, x) => g[x][r]);
    let base = sy.find(s => s !== m.wild && s !== m.scat);
    if (m.scat === m.wild) base = sy.find(s => s !== m.wild);
    let best = 0, bestN = 0;
    // reine Wild-Kette
    let wn = 0; while (wn < 5 && sy[wn] === m.wild) wn++;
    if (wn >= 3) { best = m.pay[8][wn - 3]; bestN = wn; }
    if (base && base !== m.scat) {
      let n = 0; while (n < 5 && (sy[n] === base || sy[n] === m.wild)) n++;
      const bi = m.cells.indexOf(base);
      if (n >= 3 && bi >= 0 && bi < 8) { const v = m.pay[bi][n - 3]; if (v > best) { best = v; bestN = n; } }
    }
    if (best > 0) { line += best * lb; wins.push({ li, cells: L.slice(0, bestN).map((r, x) => [x, r]), w: best * lb }); }
  });
  let sc = 0; const scCells = [];
  g.forEach((col, x) => col.forEach((s, y) => { if (s === m.scat) { sc++; scCells.push([x, y]); } }));
  let scat = 0; if (sc >= 3) { scat = [2, 10, 50][Math.min(sc, 5) - 3] * stake; wins.push({ li: -1, cells: scCells, w: scat }); }
  return { line, scat, tot: line + scat, wins, fs: sc >= 3 };
}
function symHTML(s) {
  if (s === '7') return '<span class="seven">7</span>';
  if (LOW.includes(s)) return `<span class="let l${s}">${s}</span>`;
  return s;
}

/* ================= Halle ================= */
function cabHTML(m, sm) {
  const bulbs = Array.from({ length: sm ? 7 : 11 }, (_, i) => { const a = Math.PI * (i / ((sm ? 7 : 11) - 1)); return `<i style="left:calc(${50 - Math.cos(a) * 44}% - 7px);top:${(sm ? 44 : 86) - Math.sin(a) * (sm ? 36 : 74)}px;animation-delay:${i * .11}s"></i>`; }).join('');
  const R = m.t === 'v' ? 5 : 3;
  const sample = m.t === 'v' ? [m.hi[3], m.wild, m.hi[2], LOW[3], m.scat] : [m.cells ? m.cells[5] : m.syms[5], m.syms[5], m.syms[5]];
  return `<div class="cab ${sm ? 'sm' : ''}" style="--c:${m.c};--c2:${m.c2}">
    <div class="arch"><div class="bulbs">${bulbs}</div></div>
    <div class="body">
      <div class="scr"><div class="marq"><span>${esc(m.s.toUpperCase())} · ${m.t === 'v' ? '10 LINIEN' : '5 LINIEN'} · ${esc(m.n.toUpperCase())}</span></div>
        <div class="ttl">${esc(m.n)}</div><div class="ttl-ic">${symHTML(m.ic)}${symHTML(m.ic)}${symHTML(m.ic)}</div></div>
      <div class="reelbox">${sm ? '' : '<div class="fsbadge hidden" id="fsB"></div>'}
        <div class="reels" ${sm ? '' : 'id="reels"'}>${Array.from({ length: R }, (_, x) => `<div class="reel"><div class="strip">${sm ? `<div class="cell" style="height:34px;--fs:22px">${symHTML(sample[x])}</div>` : ''}</div></div>`).join('')}</div>
        ${sm ? '' : '<svg class="lines" id="lines"></svg>'}
      </div>
      <div class="led num">${sm ? '<div>88.88</div><div>5.00</div>' : '<div><small>GUTHABEN</small><span id="ledC"></span></div><div><small>EINSATZ</small><span id="ledB"></span></div><div><small>GEWINN</small><span id="ledW">0,00</span></div>'}</div>
      <div class="btns"><i></i><i></i><i></i><b></b></div>
    </div></div>`;
}
const isLockedM = m => S.level < m.lvl;
function payChips(m) {
  prep(m);
  if (m.t === 'v') return [[m.wild, m.pay[8][2]], [m.hi[3], m.pay[7][2]], [m.hi[2], m.pay[6][2]], [m.scat, 'Freispiele']].map(([s, v]) => `<span><em>${symHTML(s)}${symHTML(s)}${symHTML(s)}</em>${typeof v === 'number' ? (v / 10) + '×' : v}</span>`).join('');
  return [5, 4, 3, 2, 1, 0].map(i => `<span><em>${symHTML(m.cells[i])}${symHTML(m.cells[i])}${symHTML(m.cells[i])}</em>${m.pay[i] / 5 >= 1 ? r2(m.pay[i] / 5) : r2(m.pay[i] / 5)}×</span>`).join('');
}
const maxLabel = m => m.t === 'j' ? 'Jackpot' : m.t === 'v' ? `bis ${m.mx}× + Freispiele` : `bis ${m.top}×`;
function renderHalle(el) {
  el.innerHTML = `<div class="halle-top"><h1 class="t">Spielhalle</h1><div class="icons">
     <button class="pill" id="bGift">${icon('gift')}</button><button class="pill" id="bAll">${icon('layers')}</button><button class="pill" id="bGames">${icon('dice')}</button></div></div>
   <div class="stage"><div class="floor"></div>
     <div class="neon" style="left:12px;top:150px;color:#7fe6ff;text-shadow:0 0 12px #2bc6ff">BAR</div>
     <div class="neon" style="right:20px;top:110px;color:#ffd75a;text-shadow:0 0 12px #ffb31a">★</div>
     <div class="neon" style="left:46%;top:6px;color:#e48bff;font-size:15px;text-shadow:0 0 12px #c040ff">JACKPOT</div>
     <div class="carousel" id="car">${MACH.map(m => `<div class="mini" data-i="${m.i}">${cabHTML(m, 1)}</div>`).join('')}</div>
     <button class="pill arrow l" id="aL">${icon('left')}</button><button class="pill arrow r" id="aR">${icon('right')}</button>
   </div>
   <div class="card slotcard" id="scard"></div>`;
  const car = $('#car', el); let cur = -1;
  const W = () => (car.firstElementChild.offsetWidth + 18);
  const setCur = i => {
    i = clamp(i, 0, MACH.length - 1); if (i === cur) return; cur = i; S.lastSlot = i;
    $$('.mini', car).forEach((d, k) => d.classList.toggle('cur', k === i));
    const m = prep(MACH[i]), lk = isLockedM(m), fav = S.favs.includes(i);
    $('#scard', el).innerHTML = `<div class="top"><span class="num" style="color:#a8a8ad;font-size:24px;font-weight:700">${i + 1} / ${MACH.length}</span><div class="bar"><i style="width:${(i + 1) / MACH.length * 100}%"></i></div>
       <button class="star ${fav ? 'on' : ''}" id="sFav" style="width:58px;height:58px;border-radius:50%;background:#26262a;display:grid;place-items:center">${icon('star')}</button>
       <button class="btn dark sm" id="sAll">${icon('layers')} Alle</button></div>
       <div class="row sb" style="align-items:flex-start"><h3>${esc(m.n)}</h3><span class="chip gold" style="margin-top:24px;white-space:nowrap">${m.t === 'j' ? 'Jackpot' : m.t === 'v' ? 'bis ' + m.mx + '×' : 'bis ' + m.top + '×'}</span></div>
       <p class="sub" style="margin:6px 0 0;font-size:20px">${esc(m.s)}</p>
       <div class="paychips">${payChips(m)}</div>
       ${lk ? `<button class="btn dark w" disabled>${icon('lock')} Ab Level ${m.lvl}</button>` : `<button class="btn white w" id="sPlay" style="font-size:22px;padding:20px">Spielen</button>`}`;
    $('#sFav', el).onclick = () => { const k = S.favs.indexOf(i); k < 0 ? S.favs.push(i) : S.favs.splice(k, 1); save(); SND.click(); cur = -1; setCur(i); };
    $('#sAll', el).onclick = openSlotList;
    const p = $('#sPlay', el); if (p) p.onclick = () => openMachine(i);
  };
  let st; car.addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(() => { const i = Math.round(car.scrollLeft / W()); if (i !== cur) SND.tick(); setCur(i); }, 60); }, { passive: true });
  car.addEventListener('click', e => { const d = e.target.closest('.mini'); if (!d) return; const i = +d.dataset.i; if (i === cur) { if (!isLockedM(MACH[i])) openMachine(i); } else car.scrollTo({ left: i * W(), behavior: 'smooth' }); });
  $('#aL', el).onclick = () => car.scrollTo({ left: (cur - 1) * W(), behavior: 'smooth' });
  $('#aR', el).onclick = () => car.scrollTo({ left: (cur + 1) * W(), behavior: 'smooth' });
  $('#bGift', el).onclick = openBonus; $('#bAll', el).onclick = openSlotList; $('#bGames', el).onclick = () => go('spiele');
  requestAnimationFrame(() => { car.scrollLeft = (S.lastSlot || 0) * W(); setCur(S.lastSlot || 0); });
}
function openSlotList() {
  const ord = [...MACH].sort((a, b) => (S.favs.includes(b.i) - S.favs.includes(a.i)) || (isLockedM(a) - isLockedM(b)) || a.lvl - b.lvl);
  const o = sheet(`<div class="row sb" style="margin-bottom:16px"><h2>Alle Automaten</h2><button class="x" data-close>${icon('x')}</button></div>
    <div class="sl-list">${ord.map(m => { const lk = isLockedM(m); return `<div class="sl ${lk ? 'locked' : ''} ${m.i === S.lastSlot ? 'sel' : ''}" data-i="${m.i}" style="color:${m.c};background:linear-gradient(90deg,${m.c}22,${m.c}08)">
      <div class="ico">${symHTML(m.ic)}</div><div style="flex:1;min-width:0;color:#fff"><div class="nm">${esc(m.n)}</div><div class="ds">${esc(m.s)}</div><div class="mx" style="color:${m.c}">${lk ? 'Ab Level ' + m.lvl : maxLabel(m)}</div></div>
      <button class="star ${S.favs.includes(m.i) ? 'on' : ''}" data-f="${m.i}" style="color:#ddd">${icon('star')}</button></div>`; }).join('')}</div>`);
  o.querySelector('.sl-list').onclick = e => {
    const f = e.target.closest('[data-f]');
    if (f) { const i = +f.dataset.f, k = S.favs.indexOf(i); k < 0 ? S.favs.push(i) : S.favs.splice(k, 1); f.classList.toggle('on'); save(); return; }
    const d = e.target.closest('.sl'); if (!d) return; const i = +d.dataset.i;
    if (isLockedM(MACH[i])) { toast(`${MACH[i].n} gibt's ab Level ${MACH[i].lvl}`); return; }
    o.close(); S.lastSlot = i; setTimeout(() => openMachine(i), 200);
  };
}

/* ================= Automat spielen ================= */
const STAKES = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1e6, 2.5e6, 1e7];
let MS = null; // Maschinen-Session
function openMachine(i) {
  const m = prep(MACH[i]); S.lastSlot = i; save();
  if (S.stakeI == null) S.stakeI = 5;
  const f = document.createElement('div'); f.className = 'full';
  f.innerHTML = `<div class="machine">
    <div class="mhead"><button class="pill circbtn" id="mBack">${icon('left')}</button><div class="pill mtitle"><b>${esc(m.n)}</b><small>${m.t === 'v' ? '10' : '5'} Linien</small></div><button class="pill circbtn" id="mInfo">${icon('info')}</button></div>
    ${m.t === 'j' ? `<div class="jpbar" style="--c:${m.c}"><span>${JP[m.jp].n}-Jackpot: <b id="jpV" class="num">${fmt(S.jp[m.jp])}</b></span></div>` : ''}
    ${cabHTML(m, 0)}
  </div>
  <div class="pill mpanel">
    <div class="row1">
      <div class="g"><small>Guthaben</small><b id="mBal" class="num"></b><em id="mHere" class="num">±0,00 € hier</em></div>
      <div class="stake"><button class="rb" id="sMinus">−</button><div class="sv"><small>Einsatz</small><b id="mStake" class="num"></b></div><button class="rb" id="sPlus">+</button></div>
    </div>
    <div class="side"><button id="mLuck">${icon('spark')} Glück</button><button class="allin" id="mAll">${icon('flame')} All-In</button></div>
    <button class="btn white w" id="spinBtn">Drehen</button>
  </div>`;
  document.body.appendChild(f);
  MS = { m, f, busy: false, here: 0, allIn: false, fs: 0, fsWin: 0, grid: genGrid(m), auto: false };
  const R = m.t === 'v' ? 5 : 3;
  const reels = $$('.reel', f);
  requestAnimationFrame(() => {
    const w = reels[0].offsetWidth; MS.h = Math.round(w * (m.t === 'v' ? 1.0 : .82)); f.style.setProperty('--fs', Math.round(MS.h * .6) + 'px');
    reels.forEach((r, x) => { r.style.height = MS.h * 3 + 'px'; $('.strip', r).innerHTML = MS.grid[x].map(s => cellH(s)).join(''); });
    const lines = $('#lines', f), rb = $('#reels', f); lines.setAttribute('viewBox', `0 0 ${rb.offsetWidth} ${rb.offsetHeight}`);
  });
  const upd = () => {
    $('#mBal', f).textContent = fmt(S.bal); $('#mBal', f).classList.toggle('neg', S.bal < 0);
    $('#mHere', f).textContent = (Math.abs(MS.here) < .005 ? '±' + fmt(0) : fmt(MS.here, { sign: true })) + ' hier';
    $('#mStake', f).textContent = MS.allIn ? 'ALL-IN' : fmt(STAKES[S.stakeI]);
    $('#ledC', f).textContent = NF2.format(S.bal).replace(/\./g, ''); $('#ledB', f).textContent = NF2.format(MS.allIn ? Math.max(0, S.bal) : STAKES[S.stakeI]);
    $('#mLuck', f).classList.toggle('on', !!S.potAct); $('#mLuck', f).innerHTML = icon('spark') + (S.potAct ? ` ×${S.potAct.m} · ${S.potAct.left}` : ' Glück');
    $('#mAll', f).classList.toggle('on', MS.allIn);
    const jv = $('#jpV', f); if (jv) jv.textContent = fmt(S.jp[m.jp]);
  };
  MS.upd = upd; upd();
  $('#sMinus', f).onclick = () => { if (MS.busy) return; MS.allIn = false; S.stakeI = Math.max(0, S.stakeI - 1); SND.click(); upd(); };
  $('#sPlus', f).onclick = () => { if (MS.busy) return; MS.allIn = false; S.stakeI = Math.min(STAKES.length - 1, S.stakeI + 1); SND.click(); upd(); };
  $('#mAll', f).onclick = () => { if (MS.busy) return; MS.allIn = !MS.allIn; SND.click(); upd(); };
  $('#mLuck', f).onclick = () => openPotions(upd);
  $('#mInfo', f).onclick = () => machInfo(m);
  $('#mBack', f).onclick = () => { if (MS.fs > 0) { toast('Erst die Freispiele zu Ende spielen!'); return; } f.classList.add('closing'); setTimeout(() => { f.remove(); MS = null; }, 300); hdr(); };
  $('#spinBtn', f).onclick = () => doSpin();
}
const cellH = s => `<div class="cell ${LOW.includes(s) ? 'L' : ''}" style="height:${MS.h}px">${symHTML(s)}</div>`;
function machInfo(m) {
  const rows = m.t === 'v'
    ? m.cells.filter(s => s !== m.scat || m.scat === m.wild).map(s => { const i = m.cells.indexOf(s); return `<div class="row sb" style="padding:8px 0;border-bottom:1px solid var(--line)"><span style="font-size:28px">${symHTML(s)}</span><span class="num">3× ${m.pay[i][0] / 10} · 4× ${m.pay[i][1] / 10} · 5× ${m.pay[i][2] / 10}</span></div>`; }).join('')
    : m.cells.map((s, i) => `<div class="row sb" style="padding:8px 0;border-bottom:1px solid var(--line)"><span style="font-size:28px">${symHTML(s)}${symHTML(s)}${symHTML(s)}</span><span class="num">${r2(m.pay[i] / 5)}× Einsatz</span></div>`).reverse().join('');
  sheet(`<div class="row sb"><h2>${esc(m.n)}</h2><button class="x" data-close>${icon('x')}</button></div>
    <p class="hint">${m.t === 'v' ? `5 Walzen, 10 Gewinnlinien von links nach rechts. ${symHTML(m.wild)} ist Wild und ersetzt alle Symbole${m.scat === m.wild ? ' und ist gleichzeitig Scatter' : ''}. 3+ ${symHTML(m.scat)} irgendwo = 10 Freispiele, in den Freispielen zählt jeder Gewinn doppelt. Werte = Vielfaches des Einsatzes.` : `3 Walzen, 5 Gewinnlinien (3 Reihen + 2 Diagonalen). Werte = Gewinn pro Linie als Vielfaches des Gesamteinsatzes.`}
    ${m.t === 'j' ? `<br><br>🎰 Bei jedem Dreh kannst du den <b>${JP[m.jp].n}-Jackpot</b> knacken (aktuell ${fmt(S.jp[m.jp])}). Volle Auszahlung ab ${fmt(JP[m.jp].ref)} Einsatz.` : ''}
    <br><br>Mit einem Glückstrank wird jeder Dreh mehrmals gewürfelt – du bekommst das beste Ergebnis.</p>
    ${m.t === 'v' ? `<div class="row sb" style="padding:8px 0;border-bottom:1px solid var(--line)"><span style="font-size:28px">${symHTML(m.scat)}</span><span>3× 2 · 4× 10 · 5× 50 + Freispiele</span></div>` : ''}${rows}`);
}
async function doSpin() {
  if (!MS || MS.busy) return;
  const m = MS.m, free = MS.fs > 0;
  let stake = free ? MS.fsStake : STAKES[S.stakeI];
  const allIn = !free && MS.allIn;
  if (allIn) { stake = r2(S.bal); if (stake <= 0) { toast('All-In geht nur mit Guthaben im Plus.', 'bad'); SND.err(); return; } }
  if (!free) { if (!bet(stake, m.n)) return; MS.here = r2(MS.here - stake); S.st.spins++; taskProg('spins', 1); }
  MS.busy = true; const btn = $('#spinBtn', MS.f); btn.classList.add('spinning'); btn.textContent = free ? `Freispiel ${MS.fsN - MS.fs + 1} / ${MS.fsN}` : 'Dreht…';
  $$('.cell.win', MS.f).forEach(c => c.classList.remove('win')); $('#lines', MS.f).innerHTML = ''; $('#ledW', MS.f).textContent = '0,00';
  // Jackpot-Pool wächst
  if (m.t === 'j' && !free) S.jp[m.jp] = r2(S.jp[m.jp] + stake * .02);
  // Ergebnis (mit Glückstrank: bestes aus N)
  let rolls = 1; const usePot = S.potAct && !allIn;
  if (usePot) { rolls = S.potAct.m; S.potAct.left--; S.st.potUse = (S.st.potUse || 0) + 1; }
  let best = null;
  for (let k = 0; k < rolls; k++) {
    const g = genGrid(m), ev = m.t === 'v' ? evalV(m, g, stake) : (() => { const e = evalC(m, g); return { tot: e.tot * stake, wins: e.wins.map(w => ({ ...w, w: w.w * stake })) }; })();
    if (!best || ev.tot > best.ev.tot || (ev.fs && !best.ev.fs)) best = { g, ev };
  }
  let jackpot = 0;
  if (m.t === 'j' && !free) {
    let ch = JP[m.jp].ch * rolls;
    if (Math.random() < ch) {
      jackpot = r2(S.jp[m.jp] * clamp(stake / JP[m.jp].ref, .02, 1));
      S.jp[m.jp] = r2(S.jp[m.jp] - jackpot + JP[m.jp].seed * .1); if (S.jp[m.jp] < JP[m.jp].seed) S.jp[m.jp] = JP[m.jp].seed;
      best.g[0][1] = best.g[1][1] = best.g[2][1] = m.cells[5];
    }
  }
  if (usePot && S.potAct.left <= 0) { S.potAct = null; setTimeout(() => toast('Dein Glückstrank ist aufgebraucht.'), 1500); }
  MS.upd();
  await animateReels(best.g);
  MS.grid = best.g;
  let win = best.ev.tot * (free ? 2 : 1);
  if (best.ev.wins.length) showWins(best.ev.wins);
  win = r2(win + jackpot);
  if (free) MS.fsWin = r2(MS.fsWin + win);
  if (win > 0) {
    const got = payout(win, m.n, stake); MS.here = r2(MS.here + got);
    countUp($('#ledW', MS.f), 0, win, 700, v => NF2.format(v));
    if (jackpot) { S.st.jackpots++; await celebrate(jackpot, 999, JP[m.jp].n.toUpperCase() + ' JACKPOT'); }
    else if (!free) await celebrate(win, win / stake);
    else { SND.win(); FX.burst(30, { coins: true }); }
  } else if (!free) { if (allIn) SND.lose(); }
  if (best.ev.fs) {
    if (!free) { MS.fsStake = stake; MS.fsN = 0; MS.fsWin = 0; }
    MS.fs += 10; MS.fsN += 10;
    flash(); SND.big(); vib([80, 40, 80]); toast(`🎉 ${free ? '+10 weitere' : '10'} FREISPIELE! Alle Gewinne ×2`, 'good', 3000);
    FX.burst(90);
  }
  if (allIn) MS.allIn = false;
  if (free) MS.fs--;
  const fb = $('#fsB', MS.f);
  if (MS.fs > 0) { fb.classList.remove('hidden'); fb.textContent = `FREISPIELE ${MS.fs} · Gewinn ${fmt(MS.fsWin)}`; }
  else fb.classList.add('hidden');
  MS.upd(); hdr(true); checkAch(); save();
  btn.classList.remove('spinning'); btn.textContent = MS.fs > 0 ? 'Freispiel…' : 'Drehen';
  MS.busy = false;
  if (MS.fs > 0) setTimeout(() => MS && doSpin(), 1300);
  else if (free) { fb.classList.add('hidden'); const t = MS.fsWin; setTimeout(() => celebrate(t, Math.max(10, t / MS.fsStake), 'FREISPIEL GEWINN'), 400); }
}
function animateReels(g) {
  const reels = $$('.reel', MS.f), h = MS.h, N = 18;
  return new Promise(res => {
    let left = reels.length;
    reels.forEach((r, x) => {
      const strip = $('.strip', r), prev = MS.grid[x];
      const fill = Array.from({ length: N + x * 4 }, () => wpick(MS.m, Math.random));
      const all = [...g[x], ...fill, ...prev];
      strip.style.transition = 'none'; strip.innerHTML = all.map(cellH).join('');
      const startY = -(all.length - 3) * h; strip.style.transform = `translateY(${startY}px)`;
      void strip.offsetHeight; r.classList.add('spin');
      const dur = 900 + x * 260;
      strip.style.transition = `transform ${dur}ms cubic-bezier(.3,.05,.2,1.03)`; strip.style.transform = 'translateY(0)';
      let tk = setInterval(() => SND.tick(), 70);
      setTimeout(() => {
        clearInterval(tk); r.classList.remove('spin'); SND.stop(); vib(8);
        strip.style.transition = 'none'; strip.innerHTML = g[x].map(cellH).join(''); strip.style.transform = 'none';
        if (--left === 0) setTimeout(res, 120);
      }, dur);
    });
  });
}
function showWins(wins) {
  const reels = $$('.reel', MS.f), svg = $('#lines', MS.f), rb = $('#reels', MS.f);
  const rbR = rb.getBoundingClientRect(); svg.setAttribute('viewBox', `0 0 ${rbR.width} ${rbR.height}`);
  let paths = '';
  wins.forEach((w, k) => {
    w.cells.forEach(([x, y]) => { const c = $$('.cell', reels[x])[y]; c && c.classList.add('win'); });
    if (w.li >= 0) {
      const L = (MS.m.t === 'v' ? LINES5 : LINES3)[w.li];
      const pts = L.map((y, x) => { const rr = reels[x].getBoundingClientRect(); return [rr.left - rbR.left + rr.width / 2, rr.top - rbR.top + (y + .5) * MS.h]; });
      const col = LINE_COLS[w.li % LINE_COLS.length];
      paths += `<path d="M${pts.map(p => p.join(',')).join(' L')}" stroke="${col}" style="color:${col};animation-delay:${k * .12}s"/>`;
    }
  });
  svg.innerHTML = paths;
  wins.forEach((w, k) => setTimeout(() => SND.coin(k), k * 110));
}

/* ================= Glückstränke wählen ================= */
function openPotions(cb) {
  const o = sheet(`<div class="row sb"><h2>Glückstränke</h2><button class="x" data-close>${icon('x')}</button></div>
    <p class="hint">${S.potAct ? `Aktiv: <b>×${S.potAct.m}</b> – noch ${S.potAct.left} Runden.` : 'Ein Trank würfelt jeden Dreh und jedes Los mehrmals – du bekommst das beste Ergebnis. Bei All-In wirkt er nicht.'}</p>
    ${potionsHTML()}<button class="btn dark w" style="margin-top:16px" id="toLab">Zum Glückslabor</button>`);
  bindPotions(o, () => { o.close(); cb && cb(); });
  $('#toLab', o).onclick = () => { o.close(); if (MS) { MS.f.remove(); MS = null; } go('spiele'); };
}

/* ================= Tagesbonus-Rad ================= */
const WHEEL = [5, 1, 1.5, 1, 2, 1, 1.5, 1, 3, 1, 1.5, 1];
function bonusReady() { return S.bonus.last !== dayKey(); }
function openBonus() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  const streak = bonusReady() ? (S.bonus.last === dayKey(y) ? S.bonus.streak + 1 : 1) : S.bonus.streak;
  const basis = r2(base() * (1 + .1 * (Math.min(streak, 7) - 1)));
  const o = sheet(`<div class="row sb"><div><h2>Tagesbonus</h2><p class="hint" style="margin:6px 0 0;font-size:17px">Serie ${streak} Tag${streak > 1 ? 'e' : ''} · Basis ${fmt(basis)}</p></div><button class="x" data-close>${icon('x')}</button></div>
    <div class="wheelwrap"><svg class="wheelpin" viewBox="0 0 36 56"><path d="M18 54 L4 20 A15 15 0 1 1 32 20 Z" fill="#f4f4f4" stroke="#bbb"/><circle cx="18" cy="16" r="6" fill="#111"/></svg><canvas id="wcv" width="840" height="840"></canvas></div>
    ${bonusReady() ? '<button class="btn white w" id="wGo" style="font-size:22px;padding:20px">Gratis drehen</button>' : `<button class="btn dark w" disabled>Morgen wieder – Serie: ${S.bonus.streak} Tage</button>`}`, { center: true });
  const cv = $('#wcv', o), c = cv.getContext('2d'), R = 420, n = WHEEL.length, seg = Math.PI * 2 / n;
  c.translate(R, R);
  c.beginPath(); c.arc(0, 0, R - 4, 0, 7); c.fillStyle = '#d6d6d8'; c.fill();
  c.beginPath(); c.arc(0, 0, R - 26, 0, 7); c.fillStyle = '#111'; c.fill();
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 - seg / 2 + i * seg; // Segment 0 oben mittig? -> Zeiger zeigt auf Segment-Mitte
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R - 30, a0, a0 + seg); c.closePath();
    c.fillStyle = WHEEL[i] >= 3 ? '#b38a2e' : ['#2c2c30', '#232326', '#323236'][i % 3]; c.fill();
    c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; c.stroke();
    c.save(); c.rotate(a0 + seg / 2); c.fillStyle = '#eee'; c.font = '600 46px -apple-system,system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.translate(R * .68, 0); c.rotate(Math.PI / 2); c.fillText(WHEEL[i] + 'x', 0, 0); c.restore();
  }
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 - seg / 2 + i * seg; c.beginPath(); c.arc(Math.cos(a) * (R - 16), Math.sin(a) * (R - 16), 9, 0, 7); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#999'; c.stroke(); }
  const g = c.createRadialGradient(-20, -20, 10, 0, 0, 90); g.addColorStop(0, '#fff'); g.addColorStop(.5, '#888'); g.addColorStop(1, '#222');
  c.beginPath(); c.arc(0, 0, 90, 0, 7); c.fillStyle = g; c.fill(); c.beginPath(); c.arc(0, 0, 44, 0, 7); c.fillStyle = '#050505'; c.fill();
  const bt = $('#wGo', o);
  if (bt) bt.onclick = () => {
    bt.disabled = true; o.querySelector('[data-close]').style.visibility = 'hidden';
    const w = { 1: 50, 1.5: 25, 2: 12, 3: 9, 5: 4 }; let r = Math.random() * 100, mult = 1;
    for (const k of [5, 3, 2, 1.5, 1]) { r -= w[k]; if (r < 0) { mult = k; break; } }
    const idxs = WHEEL.map((v, i) => v === mult ? i : -1).filter(i => i >= 0), idx = pick(idxs);
    const deg = 360 * 7 - idx * (360 / n) + rnd(-10, 10);
    cv.style.transform = `rotate(${deg}deg)`;
    let t = 40, alive = true; const tk = () => { if (!alive) return; SND.tick(); t *= 1.07; if (t < 600) setTimeout(tk, t); }; tk();
    setTimeout(async () => {
      alive = false; const amt = r2(basis * mult);
      S.bonus = { last: dayKey(), streak }; S.st.bonusStreak = Math.max(S.st.bonusStreak, streak);
      earn(amt, 'Tagesbonus'); o.close(); hdr(true);
      await celebrate(amt, mult >= 3 ? 12 : mult * 3, mult >= 3 ? 'TAGES BONUS' : null);
      toast(`Tagesbonus: ${mult}× → ${fmt(amt)} 🎁`, 'good');
    }, 5400);
  };
}
