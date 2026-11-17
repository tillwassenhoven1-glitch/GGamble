'use strict';
/* ================= Börse (erfundene Märkte) ================= */
const SYMS = {
  XRZ: { n: 'XRZ-Coin', k: 'KRYPTO', base: 4700, vol: .06, lev: 20, cs: 1, sp: .0009, dec: 2 },
  DNR: { n: 'Döner AG', k: 'AKTIE', base: 81, vol: .025, lev: 5, cs: 10, sp: .0012, dec: 2 },
  KSK: { n: 'Kiosk-Kette', k: 'AKTIE', base: 23.5, vol: .03, lev: 5, cs: 100, sp: .0015, dec: 2 },
  GLD: { n: 'Goldbarren', k: 'ROHSTOFF', base: 2380, vol: .012, lev: 20, cs: 1, sp: .0004, dec: 2 },
  GGE: { n: 'GG/EUR', k: 'DEVISEN', base: 1.0842, vol: .006, lev: 100, cs: 10000, sp: .0001, dec: 4 },
};
Object.entries(SYMS).forEach(([k, s], i) => {
  s.id = k; const r = mulberry(99 + i * 31);
  s.waves = [86400, 21600, 5400, 1800, 600, 180].map((T, j) => ({ T, a: s.vol * [1, .55, .35, .22, .12, .06][j] * (.7 + r() * .6), ph: r() * 6.28 }));
  s.seed = i * 7777;
});
function vnoise(s, t, step) { const i = Math.floor(t / step), f = t / step - i, u = f * f * (3 - 2 * f); return (hash32(s.seed + i) * (1 - u) + hash32(s.seed + i + 1) * u) - .5; }
function mid(sym, tMs) {
  const s = SYMS[sym], t = tMs / 1000; let x = 0;
  for (const w of s.waves) x += w.a * Math.sin(2 * Math.PI * t / w.T + w.ph);
  x += vnoise(s, t, 20) * s.vol * .08 + vnoise(s, t, 3) * s.vol * .03;
  return s.base * Math.exp(x);
}
function quote(sym, t = Date.now()) { const m = mid(sym, t), sp = m * SYMS[sym].sp; return { bid: m - sp / 2, ask: m + sp / 2, mid: m, sp }; }
const pf = (sym, v) => v.toLocaleString('de-DE', { minimumFractionDigits: SYMS[sym].dec, maximumFractionDigits: SYMS[sym].dec });
const effLev = sym => Math.min(S.bx.lev, SYMS[sym].lev);
const TFS = { M1: 60, M5: 300, M15: 900, H1: 3600, H4: 14400, D1: 86400 };
function posPL(p, q = quote(p.sym)) { const cur = p.dir > 0 ? q.bid : q.ask; return (cur - p.op) * p.lot * SYMS[p.sym].cs * p.dir; }
function bxStats() {
  const B = S.bx; let pl = 0, mg = 0;
  B.pos.forEach(p => { pl += posPL(p); mg += p.mg; });
  const eq = B.bal + pl; return { pl, mg, eq, free: eq - mg, lvl: mg > 0 ? eq / mg * 100 : null };
}
function closePos(p, why) {
  const B = S.bx, q = quote(p.sym), pl = r2(posPL(p, q));
  B.bal = r2(B.bal + pl); B.pnl = r2(B.pnl + pl); B.pos = B.pos.filter(x => x !== p);
  B.hist.unshift({ id: p.id, sym: p.sym, dir: p.dir, lot: p.lot, op: p.op, cl: p.dir > 0 ? q.bid : q.ask, pl, why: why || 'Manuell', t: Date.now() });
  if (B.hist.length > 50) B.hist.length = 50;
  S.st.trades++; if (pl > 0) S.st.tradeProfit++; taskProg('trades', 1);
  if (B.bal < 0) B.bal = 0;
  checkAch(); save();
  return pl;
}
/* Prüft SL/TP, Pending Orders, Stop-Out */
function bxTick() {
  const B = S.bx; if (!B) return;
  for (const p of [...B.pos]) {
    const q = quote(p.sym), cur = p.dir > 0 ? q.bid : q.ask;
    if (p.sl && (p.dir > 0 ? cur <= p.sl : cur >= p.sl)) { const pl = closePos(p, 'Stop Loss'); toast(`Stop Loss ausgelöst: ${fmt(pl, { sign: true })}`, pl >= 0 ? 'good' : 'bad'); }
    else if (p.tp && (p.dir > 0 ? cur >= p.tp : cur <= p.tp)) { const pl = closePos(p, 'Take Profit'); toast(`Take Profit erreicht: ${fmt(pl, { sign: true })} 🎯`, 'good'); FX.burst(40, { coins: true }); SND.win(); }
  }
  for (const o of [...B.ord]) {
    const q = quote(o.sym), px = o.dir > 0 ? q.ask : q.bid;
    const hit = o.ty === 'L' ? (o.dir > 0 ? px <= o.px : px >= o.px) : (o.dir > 0 ? px >= o.px : px <= o.px);
    if (hit) { B.ord = B.ord.filter(x => x !== o); if (openPos(o.sym, o.dir, o.lot, o.sl, o.tp, true)) toast(`Order #${o.id} ausgeführt (${o.sym})`, 'good'); }
  }
  const st = bxStats();
  if (st.lvl !== null && st.lvl < 50) { B.pos.slice().forEach(p => closePos(p, 'Stop-Out')); toast('Margin Call! Alle Positionen wurden geschlossen (Stop-Out bei 50 %).', 'bad', 5000); SND.err(); }
}
function openPos(sym, dir, lot, sl, tp, quiet) {
  const B = S.bx, q = quote(sym), op = dir > 0 ? q.ask : q.bid, mg = r2(op * lot * SYMS[sym].cs / effLev(sym));
  const st = bxStats();
  if (mg > st.free + 1e-9) { if (!quiet) { toast(`Nicht genug freie Margin (${fmt(mg)} nötig). Zahl erst Geld aufs Handelskonto ein.`, 'bad'); SND.err(); } return false; }
  B.pos.push({ id: B.id++, sym, dir, lot, op, sl: sl || 0, tp: tp || 0, mg, t: Date.now() });
  SND.coin(); vib(15); save(); return true;
}
let bxUI = { lot: .1, sl: '', tp: '', ty: 'M', px: '', tab: 0 };
function renderBoerse(el) {
  const B = S.bx;
  el.innerHTML = `<h1 class="t">Börse</h1><p class="sub">Erfundene Märkte, echte Mechanik – Kaufen, Verkaufen, Stop Loss, Take Profit</p>
   <button class="btn dark" id="bxIO" style="margin-bottom:16px">Ein-/Auszahlen</button>
   <div class="card"><div class="row sb" style="margin-bottom:14px"><h3 style="font-size:26px">Marktübersicht</h3><span style="color:var(--mut)">Bid / Ask</span></div><div class="mkts" id="mkts"></div></div>
   <div class="card"><div style="font-size:24px"><b id="symN"></b> <span style="color:var(--mut);font-size:19px" id="symI"></span></div>
     <div class="tfs" id="tfs">${Object.keys(TFS).map(k => `<button data-tf="${k}" class="${B.tf === k ? 'on' : ''}">${k}</button>`).join('')}</div>
     <canvas id="chart"></canvas></div>
   <div class="card">
     <div class="trade"><button class="tb s" id="bSell"><small>SELL</small><b class="num" id="pBid"></b></button><button class="tb b" id="bBuy"><small>BUY</small><b class="num" id="pAsk"></b></button></div>
     <p style="text-align:center;color:var(--mut);margin:14px 0 4px;font-size:17px" id="pSp"></p>
     <div class="lbl2">Volumen (Lot)</div>
     <div class="lotrow"><button class="rb" id="lM">−</button><input class="inp num" id="lot" inputmode="decimal" value="${bxUI.lot}"><button class="rb" id="lP">+</button></div>
     <div class="qch" id="lq">${[.01, .1, 1, 5].map(v => `<button data-v="${v}">${NF2.format(v).replace(/,?0+$/, '')}</button>`).join('')}</div>
     <div class="two"><div><div class="lbl2">Stop Loss</div><input class="inp num" id="sl" inputmode="decimal" placeholder="–" value="${bxUI.sl}"></div><div><div class="lbl2">Take Profit</div><input class="inp num" id="tp" inputmode="decimal" placeholder="–" value="${bxUI.tp}"></div></div>
     <div class="three"><button id="fL">Long ±</button><button id="fS">Short ±</button><button id="fC">leeren</button></div>
     <div class="lbl2">Ordertyp</div>
     <select class="inp" id="oty"><option value="M">Sofort (Markt)</option><option value="L">Limit</option><option value="S">Stop</option></select>
     <input class="inp num hidden" id="opx" inputmode="decimal" placeholder="Auslösepreis" style="margin-top:10px" value="${bxUI.px}">
     <div class="row sb" style="margin-top:18px;font-size:18px"><span style="color:var(--mut)">Margin nötig</span><b class="num neg" id="mgN"></b></div>
     <div class="row sb" style="margin-top:12px;font-size:18px"><span style="color:var(--mut)">Hebel</span><select class="inp" id="lev" style="width:120px;padding:10px 14px">${[1, 5, 10, 20, 50, 100].map(v => `<option value="${v}" ${B.lev === v ? 'selected' : ''}>1:${v}</option>`).join('')}</select></div>
     <p class="hint" id="effL"></p>
   </div>
   <div class="card">
     <div class="acct" id="acct"></div>
     <button class="btn dark sm" id="bxIO2" style="margin:16px 0 6px">Ein-/Auszahlen</button>
     <div class="tabs" id="ptabs" style="margin-top:10px"><button data-t="0"></button><button data-t="1"></button><button data-t="2">Historie</button></div>
     <div class="ptable" id="ptab"></div>
   </div>`;
  $('#oty', el).value = bxUI.ty; $('#opx', el).classList.toggle('hidden', bxUI.ty === 'M');
  const cv = $('#chart', el);
  const getLot = () => Math.max(.01, Math.round((+String($('#lot', el).value).replace(',', '.') || .01) * 100) / 100);
  const num = id => { const v = +String($(id, el).value).replace(',', '.'); return v > 0 ? v : 0; };
  const draw = () => {
    const sym = B.sym, s = SYMS[sym], q = quote(sym);
    $('#mkts', el).innerHTML = Object.keys(SYMS).map(k => { const qq = quote(k), ch = (qq.mid / mid(k, Date.now() - 864e5) - 1) * 100; return `<button class="mkt ${ch < 0 ? 'dn' : ''} ${k === sym ? 'on' : ''}" data-s="${k}"><b>${k}</b><span class="p num">${pf(k, qq.bid)}</span><small>${SYMS[k].k}</small><span class="c num ${ch < 0 ? 'neg' : 'pos'}">${ch >= 0 ? '+' : ''}${ch.toFixed(2)} %</span></button>`; }).join('');
    $('#symN', el).textContent = s.n; $('#symI', el).textContent = `${sym} · Kontrakt ${NF0.format(s.cs)} · Hebel bis 1:${s.lev}`;
    $('#pBid', el).textContent = pf(sym, q.bid); $('#pAsk', el).textContent = pf(sym, q.ask); $('#pSp', el).textContent = 'Spread ' + pf(sym, q.sp);
    const lot = getLot(); $('#mgN', el).textContent = fmt(q.ask * lot * s.cs / effLev(sym));
    $('#effL', el).textContent = `Effektiv 1:${effLev(sym)} für ${sym}`;
    const st = bxStats();
    $('#acct', el).innerHTML = [['Saldo', B.bal], ['Equity', st.eq], ['Margin', st.mg], ['Frei', st.free]].map(([n, v]) => `<div><small>${n.toUpperCase()}</small><b class="num">${NF2.format(v).replace(/,00$/, '')}</b></div>`).join('') +
      `<div style="grid-column:span 2"><small>MARGIN-LEVEL</small><b class="num">${st.lvl === null ? '–' : NF0.format(st.lvl) + ' %'}</b></div><div style="grid-column:span 2"><small>G/V OFFEN</small><b class="num ${st.pl >= 0 ? 'pos' : 'neg'}">${st.pl >= 0 ? '+' : ''}${NF2.format(st.pl).replace(/,00$/, '')}</b></div>`;
    const pt = $('#ptabs', el); pt.children[0].textContent = `Positionen (${B.pos.length})`; pt.children[1].textContent = `Orders (${B.ord.length})`;
    $$('button', pt).forEach(b => b.classList.toggle('on', +b.dataset.t === bxUI.tab));
    const tb = $('#ptab', el);
    if (bxUI.tab === 0) tb.innerHTML = B.pos.length ? `<table><tr><th>#</th><th>Symbol</th><th>Typ</th><th>Lot</th><th>Eröffnung</th><th>Aktuell</th><th>SL</th><th>TP</th><th>G/V</th><th></th></tr>${B.pos.map(p => { const qq = quote(p.sym), pl = posPL(p, qq); return `<tr><td>${p.id}</td><td>${p.sym}</td><td>${p.dir > 0 ? 'Long' : 'Short'}</td><td>${p.lot}</td><td>${pf(p.sym, p.op)}</td><td>${pf(p.sym, p.dir > 0 ? qq.bid : qq.ask)}</td><td>${p.sl ? pf(p.sym, p.sl) : '–'}</td><td>${p.tp ? pf(p.sym, p.tp) : '–'}</td><td class="${pl >= 0 ? 'pos' : 'neg'}">${pl >= 0 ? '+' : ''}${NF2.format(pl)}</td><td><button class="btn xs dark" data-cl="${p.id}">✕</button></td></tr>`; }).join('')}</table>` : '<div class="empty">Keine offenen Positionen</div>';
    else if (bxUI.tab === 1) tb.innerHTML = B.ord.length ? `<table><tr><th>#</th><th>Symbol</th><th>Typ</th><th>Lot</th><th>Preis</th><th></th></tr>${B.ord.map(o => `<tr><td>${o.id}</td><td>${o.sym}</td><td>${o.dir > 0 ? 'Buy' : 'Sell'} ${o.ty === 'L' ? 'Limit' : 'Stop'}</td><td>${o.lot}</td><td>${pf(o.sym, o.px)}</td><td><button class="btn xs dark" data-co="${o.id}">✕</button></td></tr>`).join('')}</table>` : '<div class="empty">Keine Orders</div>';
    else tb.innerHTML = B.hist.length ? `<table><tr><th>#</th><th>Symbol</th><th>Typ</th><th>Lot</th><th>Eröffnung</th><th>Schluss</th><th>Grund</th><th>G/V</th></tr>${B.hist.map(h => `<tr><td>${h.id}</td><td>${h.sym}</td><td>${h.dir > 0 ? 'Long' : 'Short'}</td><td>${h.lot}</td><td>${pf(h.sym, h.op)}</td><td>${pf(h.sym, h.cl)}</td><td>${h.why}</td><td class="${h.pl >= 0 ? 'pos' : 'neg'}">${h.pl >= 0 ? '+' : ''}${NF2.format(h.pl)}</td></tr>`).join('')}</table>` : '<div class="empty">Noch keine Trades</div>';
    drawChart(cv, sym, B.tf);
  };
  $('#mkts', el).onclick = e => { const b = e.target.closest('[data-s]'); if (b) { B.sym = b.dataset.s; bxUI.sl = bxUI.tp = ''; $('#sl', el).value = $('#tp', el).value = ''; SND.click(); save(); draw(); } };
  $('#tfs', el).onclick = e => { const b = e.target.closest('[data-tf]'); if (!b) return; B.tf = b.dataset.tf; $$('#tfs button', el).forEach(x => x.classList.toggle('on', x === b)); SND.click(); save(); draw(); };
  $('#lM', el).onclick = () => { $('#lot', el).value = Math.max(.01, r2(getLot() - (getLot() > 1 ? 1 : getLot() > .1 ? .1 : .01))); bxUI.lot = getLot(); draw(); };
  $('#lP', el).onclick = () => { $('#lot', el).value = r2(getLot() + (getLot() >= 1 ? 1 : getLot() >= .1 ? .1 : .01)); bxUI.lot = getLot(); draw(); };
  $('#lot', el).oninput = () => { bxUI.lot = getLot(); };
  $('#lq', el).onclick = e => { const b = e.target.closest('[data-v]'); if (b) { $('#lot', el).value = b.dataset.v; bxUI.lot = +b.dataset.v; draw(); } };
  const fill = d => { const q = quote(B.sym), m = q.mid, s = SYMS[B.sym].vol * .25; $('#sl', el).value = pf(B.sym, m * (1 - d * s)).replace(/\./g, ''); $('#tp', el).value = pf(B.sym, m * (1 + d * s * 1.5)).replace(/\./g, ''); bxUI.sl = $('#sl', el).value; bxUI.tp = $('#tp', el).value; SND.click(); };
  $('#fL', el).onclick = () => fill(1); $('#fS', el).onclick = () => fill(-1); $('#fC', el).onclick = () => { $('#sl', el).value = $('#tp', el).value = ''; bxUI.sl = bxUI.tp = ''; };
  $('#sl', el).oninput = e => bxUI.sl = e.target.value; $('#tp', el).oninput = e => bxUI.tp = e.target.value;
  $('#oty', el).onchange = e => { bxUI.ty = e.target.value; $('#opx', el).classList.toggle('hidden', bxUI.ty === 'M'); };
  $('#opx', el).oninput = e => bxUI.px = e.target.value;
  $('#lev', el).onchange = e => { B.lev = +e.target.value; save(); draw(); };
  const trade = dir => {
    const lot = getLot(), sl = num('#sl'), tp = num('#tp'), q = quote(B.sym), ref = dir > 0 ? q.ask : q.bid;
    if (sl && (dir > 0 ? sl >= ref : sl <= ref)) { toast(`Stop Loss muss ${dir > 0 ? 'unter' : 'über'} dem Kurs liegen.`, 'bad'); return; }
    if (tp && (dir > 0 ? tp <= ref : tp >= ref)) { toast(`Take Profit muss ${dir > 0 ? 'über' : 'unter'} dem Kurs liegen.`, 'bad'); return; }
    if (bxUI.ty !== 'M') {
      const px = num('#opx'); if (!px) { toast('Bitte einen Auslösepreis eingeben.', 'bad'); return; }
      B.ord.push({ id: B.id++, sym: B.sym, dir, lot, ty: bxUI.ty, px, sl, tp }); save(); toast(`${bxUI.ty === 'L' ? 'Limit' : 'Stop'}-Order gesetzt ✅`, 'good'); bxUI.tab = 1; draw(); return;
    }
    if (openPos(B.sym, dir, lot, sl, tp)) { toast(`${dir > 0 ? 'Long' : 'Short'} ${lot} ${B.sym} @ ${pf(B.sym, ref)} eröffnet`, 'good'); bxUI.tab = 0; draw(); }
  };
  $('#bBuy', el).onclick = () => trade(1); $('#bSell', el).onclick = () => trade(-1);
  $('#ptabs', el).onclick = e => { const b = e.target.closest('[data-t]'); if (b) { bxUI.tab = +b.dataset.t; draw(); } };
  $('#ptab', el).onclick = e => {
    const c = e.target.closest('[data-cl]'); if (c) { const p = B.pos.find(x => x.id === +c.dataset.cl); if (p) { const pl = closePos(p); toast(`Position geschlossen: ${fmt(pl, { sign: true })}`, pl >= 0 ? 'good' : 'bad'); if (pl > 0) { SND.win(); FX.burst(30, { coins: true }); } draw(); } return; }
    const o = e.target.closest('[data-co]'); if (o) { B.ord = B.ord.filter(x => x.id !== +o.dataset.co); save(); draw(); }
  };
  $('#bxIO', el).onclick = $('#bxIO2', el).onclick = () => openKonto(true);
  draw();
  pageTimer(() => { bxTick(); if (!document.activeElement || !el.contains(document.activeElement) || document.activeElement.tagName === 'BUTTON') draw(); else { drawChart(cv, B.sym, B.tf); } }, 1000);
}
function drawChart(cv, sym, tf) {
  const d = devicePixelRatio || 1, W = cv.offsetWidth, H = cv.offsetHeight; if (!W) return;
  if (cv.width !== W * d) { cv.width = W * d; cv.height = H * d; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H);
  const step = TFS[tf] * 1000, now = Date.now(), N = 44, cur = Math.floor(now / step) * step, cs = [];
  for (let i = N - 1; i >= 0; i--) {
    const t0 = cur - i * step, t1 = Math.min(now, t0 + step); let o = mid(sym, t0), h = o, l = o, cl = o;
    for (let k = 1; k <= 12; k++) { const v = mid(sym, t0 + (t1 - t0) * k / 12); h = Math.max(h, v); l = Math.min(l, v); cl = v; }
    cs.push({ t: t0, o, h, l, c: cl });
  }
  const q = quote(sym), PR = 82, PB = 30, cw = W - PR, ch = H - PB;
  let hi = Math.max(...cs.map(x => x.h), q.ask), lo = Math.min(...cs.map(x => x.l), q.bid); const pad = (hi - lo) * .12 || 1; hi += pad; lo -= pad;
  const Y = v => (hi - v) / (hi - lo) * ch;
  c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 1; c.fillStyle = '#8a8a90'; c.font = '13px -apple-system,system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
  for (let k = 0; k <= 5; k++) { const v = lo + (hi - lo) * k / 5, y = Y(v); c.beginPath(); c.moveTo(0, y); c.lineTo(cw, y); c.stroke(); c.fillText(v.toFixed(SYMS[sym].dec), cw + 8, y); }
  c.beginPath(); c.moveTo(cw, 0); c.lineTo(cw, ch); c.stroke();
  const bw = cw / N;
  cs.forEach((x, i) => {
    const cx = i * bw + bw / 2, up = x.c >= x.o; c.strokeStyle = c.fillStyle = up ? '#4cc265' : '#e8524a';
    c.beginPath(); c.moveTo(cx, Y(x.h)); c.lineTo(cx, Y(x.l)); c.stroke();
    const y1 = Y(Math.max(x.o, x.c)), y2 = Y(Math.min(x.o, x.c)); c.fillRect(cx - bw * .32, y1, bw * .64, Math.max(1.5, y2 - y1));
    if (i % 11 === 0) { const dt = new Date(x.t); c.fillStyle = '#8a8a90'; c.textAlign = 'center'; c.fillText(tf === 'D1' ? dt.getDate() + '.' + (dt.getMonth() + 1) + '.' : String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0'), cx, ch + 16); c.textAlign = 'left'; }
  });
  [[q.bid, '#e8524a', '#fff'], [q.ask, '#fff', '#111']].forEach(([v, bg, fg], k) => {
    const y = Y(v); c.setLineDash([4, 4]); c.strokeStyle = k ? 'rgba(255,255,255,.35)' : '#e8524a'; c.beginPath(); c.moveTo(0, y); c.lineTo(cw, y); c.stroke(); c.setLineDash([]);
    c.fillStyle = bg; c.fillRect(cw + 2, y - 11 + (k ? -12 : 10), PR - 2, 22); c.fillStyle = fg; c.font = '600 13px -apple-system,system-ui,sans-serif'; c.fillText(v.toFixed(SYMS[sym].dec), cw + 8, y + (k ? -12 : 10));
  });
  S.bx.pos.filter(p => p.sym === sym).forEach(p => { const y = Y(p.op); c.strokeStyle = p.dir > 0 ? '#3b7be0' : '#e8a24a'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(0, y); c.lineTo(cw, y); c.stroke(); c.setLineDash([]); c.fillStyle = c.strokeStyle; c.fillText(`#${p.id} ${p.dir > 0 ? 'Long' : 'Short'}`, 6, y - 9); });
}
