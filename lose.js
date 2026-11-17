'use strict';
/* ================= Rubbellose ================= */
const LOSE = [
  { id: 'gp', n: 'Glückspfennig', p: 1, top: 1000, ic: 'coins', ty: '3', a: '#c7834e', b: '#e7b88a', lvl: 1 },
  { id: 'vb', n: 'Vierblatt', p: 3, top: 6000, ic: 'clover', ty: 'sym', a: '#4f8a5a', b: '#a6d1ad', lvl: 1 },
  { id: 'ga', n: 'Goldader', p: 10, top: 25000, ic: 'pick', ty: 'num', a: '#9c7a3e', b: '#dcc08a', lvl: 1 },
  { id: 'tk', n: 'Tresorknacker', p: 50, top: 200000, ic: 'vault', ty: '3', a: '#6f7a88', b: '#cfd6df', lvl: 4 },
  { id: 'dm', n: 'Diamantmine', p: 250, top: 1.25e6, ic: 'diamond', ty: 'num', a: '#4b5056', b: '#8c9298', lvl: 12, dark: 1 },
  { id: 'kj', n: 'Kronjuwel', p: 2000, top: 12e6, ic: 'crown', ty: '3', a: '#5a5450', b: '#9d958c', lvl: 16, dark: 1 },
  { id: 'ml', n: 'Millionenlos', p: 20000, top: 160e6, ic: 'cash', ty: 'num', a: '#474747', b: '#8a8a8a', lvl: 22, dark: 1 },
  { id: 'sl', n: 'Schwarzes Los', p: 250000, top: 2.5e9, ic: 'eye', ty: '3', a: '#2a2a2a', b: '#6a6a6a', lvl: 30, dark: 1 },
];
const TIER_M = [1, 2, 5, 10, 20, 50, 100, 500];
const TIER_P = [.17, .085, .032, .012, .005, .0015, .0006, .00008];
const VB_SYM = ['🌻', '🐞', '🍄', '🌈', '🦋', '⭐', '💰', '👑', '🍀'];
const TK = {}; // aktive Lose: id -> {res, cells, revealed}
function loseMults(L) { return [...TIER_M, L.top / L.p]; }
function drawPrize(L) {
  const ms = loseMults(L), ps = [...TIER_P, .02 / (L.top / L.p)];
  let r = Math.random();
  for (let i = ms.length - 1; i >= 0; i--) { r -= ps[i]; if (r < 0) return i; }
  return -1;
}
function shortMoney(v) { return v >= 1e6 ? fmt(v).replace(',00', '') : NF0.format(v) + ' €'; }
function genTicket(L) {
  const ti = drawPrize(L), ms = loseMults(L), vals = ms.map(m => m * L.p);
  const res = { ti, win: ti >= 0 ? vals[ti] : 0 };
  if (L.ty === '3' || L.ty === 'sym') {
    const cnt = {}, cells = [];
    if (ti >= 0) { for (let k = 0; k < 3; k++) cells.push(ti); cnt[ti] = 3; }
    while (cells.length < 9) {
      // eher kleine Werte als Füller, aber auch mal große (Spannung!)
      const j = Math.random() < .75 ? rint(0, 5) : rint(0, ms.length - 1);
      if (j === ti || (cnt[j] || 0) >= 2) continue;
      cnt[j] = (cnt[j] || 0) + 1; cells.push(j);
    }
    cells.sort(() => Math.random() - .5);
    res.cells = cells.map(j => ({ j, txt: L.ty === 'sym' ? `<span class="sym">${VB_SYM[j]}</span>` : shortMoney(vals[j]), hit: j === ti }));
  } else {
    const wn = []; while (wn.length < 2) { const n = rint(1, 30); if (!wn.includes(n)) wn.push(n); }
    const mine = []; const hitAt = ti >= 0 ? rint(0, 7) : -1;
    for (let k = 0; k < 8; k++) {
      if (k === hitAt) { mine.push({ n: pick(wn), j: ti }); continue; }
      let n; do { n = rint(1, 30); } while (wn.includes(n));
      mine.push({ n, j: Math.random() < .8 ? rint(0, 4) : rint(0, ms.length - 1) });
    }
    res.wn = wn;
    res.cells = mine.map((c, k) => ({ j: c.j, txt: `${c.n}<small>${shortMoney(vals[c.j])}</small>`, hit: k === hitAt, n: c.n }));
  }
  return res;
}
function renderLose(el) {
  el.innerHTML = `<h1 class="t">Rubbellose</h1><p class="sub">Such dir ein Los aus – vor dem Rubbeln zeigen wir dir genau, wie es geht.</p>
    ${LOSE.map(L => `<div class="ticket ${S.level < L.lvl ? 'tklocked' : ''}" id="tk_${L.id}"></div>`).join('')}`;
  LOSE.forEach(L => drawTicket(L));
}
function drawTicket(L) {
  const box = $('#tk_' + L.id); if (!box) return;
  const t = TK[L.id], lk = S.level < L.lvl;
  const ms = loseMults(L), vals = ms.map(m => m * L.p);
  const grid = L.ty === 'num'
    ? `<div class="lab">GEWINNZAHLEN</div><div class="grid g2" data-g="w">${[0, 1].map(k => `<div class="sc" data-w="${k}">${t ? t.res.wn[k] : ''}</div>`).join('')}</div>
       <div class="lab" style="margin-top:14px">DEINE ZAHLEN</div><div class="grid g4">${Array.from({ length: 8 }, (_, k) => `<div class="sc" data-k="${k}">${t ? t.res.cells[k].txt : ''}</div>`).join('')}</div>`
    : `<div class="grid g3">${Array.from({ length: 9 }, (_, k) => `<div class="sc" data-k="${k}">${t ? t.res.cells[k].txt : ''}</div>`).join('')}</div>
       ${L.ty === 'sym' ? `<div class="legend">${VB_SYM.map((s, j) => `<span>${s} ${shortMoney(vals[j])}</span>`).join('')}</div>` : ''}`;
  box.innerHTML = `<div class="tk ${L.dark ? 'dark' : ''}" style="--a:${L.a};--b:${L.b}">
      <span class="brand">GG <em>LOTTO</em></span><div class="price num">${shortMoney(L.p)}</div>
      <div class="emb">${icon(L.ic)}</div><div class="burst"><div><small>HAUPTGEWINN</small><b>${shortMoney(L.top)}</b></div></div>
      <h3>${esc(L.n)}</h3>
      <div class="scrz">${grid}</div>
      <div class="rule">${L.ty === 'num' ? 'Deine Zahl = Gewinnzahl? Gewinn!' : L.ty === 'sym' ? '3 gleiche Symbole = Gewinn' : '3 gleiche Beträge = Gewinn'}</div>
      <div class="foot"><div class="barcode"></div><div class="nr">Nr. ${t ? t.nr : '————'}<small>Nur Spielgeld</small></div></div>
    </div>
    <div class="tkres" id="tr_${L.id}"></div>
    <div class="tkbar">${lk ? `<span class="chip">${icon('lock')} Level ${L.lvl}</span><span class="chip">${shortMoney(L.p)}</span>`
      : t && !t.done ? `<button class="btn dark w" data-all>Alles aufdecken</button>`
        : `<button class="btn white w" data-buy>${t ? 'Nochmal' : 'Kaufen'} · ${shortMoney(L.p)}</button>`}</div>`;
  // Rubbelschicht
  $$('.sc', box).forEach(sc => {
    const isW = sc.dataset.w != null, k = isW ? 'w' + sc.dataset.w : 'c' + sc.dataset.k;
    if (t && t.rev[k]) { if (!isW && t.done && t.res.cells[+sc.dataset.k].hit) sc.classList.add('hit'); return; }
    foil(sc, t && !t.done ? () => { t.rev[k] = 1; checkTicket(L); } : null);
  });
  const b = $('[data-buy]', box); if (b) b.onclick = () => buyTicket(L);
  const a = $('[data-all]', box); if (a) a.onclick = () => { $$('.sc canvas', box).forEach(c => c._reveal && c._reveal()); };
}
function foil(sc, onReveal) {
  const cv = document.createElement('canvas'); sc.appendChild(cv);
  requestAnimationFrame(() => {
    const w = sc.offsetWidth, h = sc.offsetHeight, d = devicePixelRatio || 1;
    cv.width = w * d; cv.height = h * d; const c = cv.getContext('2d'); c.scale(d, d);
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#b9bcc2'); g.addColorStop(.35, '#eef0f3'); g.addColorStop(.5, '#a9adb4'); g.addColorStop(.7, '#e3e6ea'); g.addColorStop(1, '#9ca0a7');
    c.fillStyle = g; c.beginPath(); c.roundRect ? c.roundRect(0, 0, w, h, 12) : c.rect(0, 0, w, h); c.fill();
    for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${Math.random() * .25})`; c.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    c.fillStyle = 'rgba(90,95,105,.55)'; c.font = `900 ${Math.min(w, h) * .38}px Georgia,serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, h / 2 + 2);
    if (!onReveal) return;
    cv.style.cursor = 'grab';
    let down = false, last = null, n = 0, done = false;
    const reveal = () => { if (done) return; done = true; cv.classList.add('gone'); setTimeout(() => cv.remove(), 450); onReveal(); };
    cv._reveal = reveal;
    const er = (x, y) => {
      c.globalCompositeOperation = 'destination-out'; c.lineCap = 'round'; c.lineWidth = Math.max(18, w * .22);
      c.beginPath(); if (last) { c.moveTo(last[0], last[1]); c.lineTo(x, y); c.stroke(); } else { c.arc(x, y, c.lineWidth / 2, 0, 7); c.fill(); }
      last = [x, y];
      if (++n % 4 === 0) { SND.scratch(); check(); }
    };
    const check = () => {
      const im = c.getImageData(0, 0, cv.width, cv.height).data; let cl = 0, tot = 0;
      for (let i = 3; i < im.length; i += 4 * 37) { tot++; if (im[i] < 40) cl++; }
      if (cl / tot > .42) reveal();
    };
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', e => { down = true; last = null; cv.setPointerCapture(e.pointerId); er(...pos(e)); });
    cv.addEventListener('pointermove', e => { if (down) er(...pos(e)); });
    const up = () => { down = false; last = null; check(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  });
}
function buyTicket(L) {
  if (!S.tut) S.tut = {};
  if (!S.tut[L.ty]) {
    const txt = L.ty === 'num' ? 'Rubbel oben die <b>2 Gewinnzahlen</b> frei und dann <b>deine 8 Zahlen</b>. Steht eine deiner Zahlen auch bei den Gewinnzahlen, gewinnst du den Betrag darunter.'
      : L.ty === 'sym' ? 'Rubbel alle 9 Felder frei. Findest du <b>3 gleiche Symbole</b>, gewinnst du den Betrag aus der Legende darunter. 🍀🍀🍀 ist der Hauptgewinn!'
        : 'Rubbel alle 9 Felder frei. Findest du <b>3 gleiche Beträge</b>, gewinnst du genau diesen Betrag.';
    const o = sheet(`<h2>So geht's: ${esc(L.n)}</h2><p class="hint" style="font-size:18px">${txt}<br><br>👆 Mit dem Finger (oder der Maus) über die silbernen Felder wischen. Keine Lust? Dann tipp auf <b>„Alles aufdecken“</b>.</p><button class="btn white w" id="okT" style="margin-top:10px">Verstanden – Los kaufen</button>`, { center: true });
    $('#okT', o).onclick = () => { S.tut[L.ty] = 1; save(); o.close(); setTimeout(() => buyTicket(L), 300); };
    return;
  }
  if (!bet(L.p, L.n)) return;
  S.st.scratches++; taskProg('scratch', 1);
  let rolls = 1; if (S.potAct) { rolls = S.potAct.m; S.potAct.left--; }
  let res = null; for (let k = 0; k < rolls; k++) { const r = genTicket(L); if (!res || r.win > res.win) res = r; }
  if (S.potAct && S.potAct.left <= 0) { S.potAct = null; toast('Dein Glückstrank ist aufgebraucht.'); }
  TK[L.id] = { res, rev: {}, done: false, nr: `${rint(1000, 9999)}-${rint(10000, 99999)}-${rint(10, 99)}` };
  SND.coin(); drawTicket(L);
  const box = $('#tk_' + L.id); box.querySelector('.tk').animate([{ transform: 'rotateX(25deg) scale(.94)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  save();
}
async function checkTicket(L) {
  const t = TK[L.id]; const need = (L.ty === 'num' ? 10 : 9);
  if (Object.keys(t.rev).length < need || t.done) return;
  t.done = true;
  const box = $('#tk_' + L.id), res = $('#tr_' + L.id);
  if (t.res.win > 0) {
    $$('.sc[data-k]', box).forEach(sc => { if (t.res.cells[+sc.dataset.k].hit) sc.classList.add('hit'); });
    if (L.ty === 'num') $$('.sc[data-w]', box).forEach(sc => { const hitN = t.res.cells.find(c => c.hit).n; if (+sc.textContent === hitN) sc.classList.add('hit'); });
    payout(t.res.win, L.n, L.p);
    res.innerHTML = `<span class="goldc">Gewinn: ${fmt(t.res.win)} 🎉</span>`;
    await celebrate(t.res.win, t.res.win / L.p);
  } else { res.innerHTML = '<span style="color:var(--mut)">Leider nichts – nächstes Mal!</span>'; SND.lose(); }
  checkAch(); save();
  const bar = $('.tkbar', box); bar.innerHTML = `<button class="btn white w" data-buy>Nochmal · ${shortMoney(L.p)}</button>`;
  $('[data-buy]', bar).onclick = () => buyTicket(L);
}
