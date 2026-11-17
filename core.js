'use strict';
/* ================= Helfer ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const r2 = v => Math.round(v * 100) / 100;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NF2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const NF0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const MINUS = '−';
function fmt(v, opt = {}) {
  const neg = v < 0, a = Math.abs(v);
  let s;
  if (a >= 1e9) s = NF2.format(a / 1e9) + ' Mrd.';
  else if (a >= 1e6) s = NF2.format(a / 1e6) + ' Mio.';
  else if (opt.int && a >= 100) s = NF0.format(a);
  else s = NF2.format(a);
  return (neg ? MINUS : (opt.sign && v > 0 ? '+' : '')) + s + ' €';
}
const fmtInt = v => (v < 0 ? MINUS : '') + (Math.abs(v) >= 1e6 ? fmt(Math.abs(v)).replace(' €', '') : NF0.format(Math.abs(v))) + ' €';
const dayKey = (d = new Date()) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
function weekKey(d = new Date()) { const t = new Date(d); t.setHours(0, 0, 0, 0); t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); return dayKey(t); }
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash32(n) { n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); n ^= n >>> 16; return (n >>> 0) / 4294967296; }

/* ================= Icons ================= */
const IC = {
  cherry: '<circle cx="7" cy="17" r="4"/><circle cx="17" cy="17" r="4"/><path d="M7 13c0-5 4-9 10-10M17 13c-1-4-3-7-6-8M11 3c3 0 6 1 8 3"/>',
  ticket: '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 9v6M8 7v1M8 16v1M13 6v8M13 4v1M13 15v2M18 10v4M18 8v1M18 15v1"/><rect x="6.5" y="9" width="3" height="6" rx="1"/><rect x="11.5" y="6" width="3" height="8" rx="1"/><rect x="16.5" y="10" width="3" height="4" rx="1"/>',
  dice: '<rect x="3" y="11" width="10" height="10" rx="2"/><circle cx="8" cy="16" r=".6" fill="currentColor"/><path d="M13 13l5-5a2 2 0 0 0 0-3l-2-2a2 2 0 0 0-3 0l-5 5"/><circle cx="15.5" cy="5.5" r=".5" fill="currentColor"/><circle cx="18" cy="8" r=".5" fill="currentColor"/>',
  medal: '<path d="M7 3h10l-3 6h-4z"/><path d="M5 3l5 9M19 3l-5 9"/><circle cx="12" cy="16" r="5"/><path d="M12 14v4"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7.5v.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3v4M17 5h4"/><circle cx="5" cy="19" r="2"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/><path d="M12 22c-2 0-3-1.5-3-3.5S12 15 12 13c1 2 3 3.5 3 5.5S14 22 12 22z"/>',
  bank: '<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18M3 18h18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.6-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.6 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>',
  building: '<rect x="4" y="3" width="12" height="18" rx="2"/><path d="M16 9h3a1 1 0 0 1 1 1v11H16M8 7h1M11 7h1M8 11h1M11 11h1M8 15h4v6H8z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  hand: '<circle cx="9" cy="5" r="2.5"/><circle cx="15" cy="7.5" r="2.5"/><path d="M3 15l4-1 6 2c1 .3 1 2-.5 2H9M3 15v4l7 2 9-5c1-.6.5-2.3-.9-1.9L13 16"/>',
  beer: '<path d="M6 8h10v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M16 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M9 12v6M13 12v6M6 8a3 3 0 0 1 2-5 3 3 0 0 1 5 0 3 3 0 0 1 3 5"/>',
  crown: '<path d="M3 7l4.5 5L12 5l4.5 7L21 7l-2 11H5z"/><path d="M5 21h14"/>',
  face: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  wand: '<path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5"/>',
  battery: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2M10 9l-2 3h4l-2 3"/>',
  warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  diamond: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M10 3 8 9l4 12 4-12-2-6"/>',
  pick: '<path d="M14.5 3.5c3 0 6 3 6 6"/><path d="M3 21l11-11"/><path d="M8 4c4-1 9 0 12 4-3-2-6-2-8-1L9 7z"/>',
  vault: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 7l2.5 2.5M17 7l-2.5 2.5M7 17l2.5-2.5M17 17l-2.5-2.5"/>',
  clover: '<path d="M12 12c-2-3-6-4-6-1s4 2 6 1zm0 0c3-2 4-6 1-6s-2 4-1 6zm0 0c2 3 6 4 6 1s-4-2-6-1zm0 0c-3 2-4 6-1 6s2-4 1-6zM12 12l5 9"/>',
  coins: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="9" r="5"/><path d="M15 7v4M8.5 12.5 9 12v4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>', down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${IC[n] || ''}</svg>`;

/* ================= Sound ================= */
const SND = {
  ctx: null,
  get on() { return !S || S.set.snd !== false; },
  c() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
  tone(f, d = .1, type = 'sine', v = .15, when = 0, slide = 0) {
    if (!this.on) return; const c = this.c(); if (!c) return;
    const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .02);
  },
  noise(d = .2, v = .1, when = 0, f = 2000) {
    if (!this.on) return; const c = this.c(); if (!c) return;
    const b = c.createBuffer(1, c.sampleRate * d, c.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / a.length);
    const s = c.createBufferSource(), g = c.createGain(), fl = c.createBiquadFilter();
    fl.type = 'bandpass'; fl.frequency.value = f; s.buffer = b; g.gain.value = v;
    s.connect(fl).connect(g).connect(c.destination); s.start(c.currentTime + when);
  },
  click() { this.tone(1800, .03, 'square', .04); },
  tick() { this.tone(2400, .02, 'square', .03); },
  stop() { this.tone(160, .08, 'triangle', .2); this.noise(.06, .08, 0, 900); },
  coin(i = 0) { this.tone(1320 + i * 90, .12, 'square', .05); this.tone(1980 + i * 90, .18, 'square', .04, .05); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .22, 'triangle', .12, i * .09)); },
  big() { [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) => { this.tone(f, .35, 'sawtooth', .06, i * .1); this.tone(f * 2, .3, 'triangle', .07, i * .1); }); this.noise(.8, .05, .7, 6000); },
  lose() { this.tone(300, .25, 'triangle', .1, 0, 180); },
  scratch() { this.noise(.05, .05, 0, 5000); },
  err() { this.tone(200, .15, 'square', .06); this.tone(150, .2, 'square', .06, .1); },
};
const vib = p => { try { if (S && S.set.vib !== false && navigator.vibrate) navigator.vibrate(p); } catch (e) { } };

/* ================= FX: Konfetti, Münzen ================= */
const FX = {
  cv: null, cx: null, ps: [], run: false,
  init() { this.cv = $('#fx'); this.cx = this.cv.getContext('2d'); const rs = () => { this.cv.width = innerWidth * devicePixelRatio; this.cv.height = innerHeight * devicePixelRatio; }; rs(); addEventListener('resize', rs); },
  burst(n = 120, opts = {}) {
    const W = innerWidth, H = innerHeight, cols = opts.cols || ['#f5cf5a', '#fff2b8', '#e8524a', '#4cc265', '#3b7be0', '#c487f0', '#ffffff'];
    for (let i = 0; i < n; i++) {
      const coin = opts.coins && Math.random() < .55;
      this.ps.push({
        x: opts.x ?? W / 2 + rnd(-40, 40), y: opts.y ?? H * .45, vx: rnd(-1, 1) * (opts.spread || 11), vy: rnd(-18, -6) * (opts.power || 1),
        g: .42, r: coin ? rnd(9, 15) : rnd(4, 8), rot: rnd(0, 6.28), vr: rnd(-.3, .3), c: pick(cols), coin, life: rnd(110, 190), shape: rint(0, 2)
      });
    }
    if (!this.run) { this.run = true; requestAnimationFrame(() => this.loop()); }
  },
  rain(n = 80, dur = 2500) {
    const W = innerWidth; let made = 0; const iv = setInterval(() => {
      for (let i = 0; i < 6; i++) { this.ps.push({ x: rnd(0, W), y: -20, vx: rnd(-1, 1), vy: rnd(2, 6), g: .18, r: rnd(10, 16), rot: rnd(0, 6), vr: rnd(-.2, .2), c: '#f5cf5a', coin: true, life: 260 }); made++; }
      if (made > n) clearInterval(iv);
    }, dur / (n / 6));
    if (!this.run) { this.run = true; requestAnimationFrame(() => this.loop()); }
  },
  loop() {
    const c = this.cx, d = devicePixelRatio; c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, innerWidth, innerHeight);
    this.ps = this.ps.filter(p => p.life > 0 && p.y < innerHeight + 40);
    for (const p of this.ps) {
      p.vy += p.g; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = Math.min(1, p.life / 30);
      if (p.coin) {
        const sx = Math.abs(Math.cos(p.rot * 2)); c.scale(Math.max(.15, sx), 1);
        const gr = c.createRadialGradient(-p.r * .3, -p.r * .3, 1, 0, 0, p.r); gr.addColorStop(0, '#fff3c0'); gr.addColorStop(.5, '#f2c447'); gr.addColorStop(1, '#a3751a');
        c.fillStyle = gr; c.beginPath(); c.arc(0, 0, p.r, 0, 6.29); c.fill(); c.strokeStyle = '#7a560f'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#8a6514'; c.font = `900 ${p.r}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('€', 0, 1);
      } else {
        c.fillStyle = p.c;
        if (p.shape === 0) c.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        else if (p.shape === 1) { c.beginPath(); c.arc(0, 0, p.r / 1.5, 0, 6.29); c.fill(); }
        else { c.beginPath(); c.moveTo(0, -p.r); c.lineTo(p.r, p.r); c.lineTo(-p.r, p.r); c.fill(); }
      }
      c.restore();
    }
    if (this.ps.length) requestAnimationFrame(() => this.loop()); else { this.run = false; c.clearRect(0, 0, innerWidth, innerHeight); }
  }
};
function countUp(el, from, to, ms, f = fmt) {
  return new Promise(res => {
    const t0 = performance.now(); let lastTick = 0;
    const st = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = f(from + (to - from) * e); if (t - lastTick > 70 && k < 1) { SND.tick(); lastTick = t; } if (k < 1) requestAnimationFrame(st); else res(); };
    requestAnimationFrame(st);
  });
}
function flash() { const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 800); }
function shake(el = document.body) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 700); }
/* Gewinn feiern: mult = Gewinn / Einsatz */
function celebrate(amount, mult, label) {
  if (amount <= 0) return Promise.resolve();
  if (mult < 10) {
    SND.win(); vib(30);
    FX.burst(mult >= 3 ? 70 : 30, { coins: true, power: .8 });
    return Promise.resolve();
  }
  let tier = mult >= 200 ? 'EPIC WIN' : mult >= 50 ? 'MEGA WIN' : 'BIG WIN';
  if (label) tier = label;
  return new Promise(res => {
    flash(); shake($('#app')); SND.big(); vib([60, 40, 120, 40, 200]);
    const o = document.createElement('div'); o.id = 'bigwin'; if (mult >= 200 || label) o.className = 'epic';
    o.innerHTML = `<div class="rays"></div><div class="bw-t">${tier.replace(' ', '<br>')}</div><div class="bw-a num">0,00 €</div><div class="bw-s">Tippen zum Fortfahren</div>`;
    document.body.appendChild(o);
    FX.burst(160, { coins: true, power: 1.2 }); FX.rain(mult >= 50 ? 160 : 80, 2600);
    const iv = setInterval(() => FX.burst(40, { x: rnd(40, innerWidth - 40), y: rnd(100, innerHeight * .5) }), 600);
    let done = false;
    const fin = () => { if (done) return; done = true; clearInterval(iv); o.style.transition = 'opacity .4s'; o.style.opacity = 0; setTimeout(() => { o.remove(); res(); }, 400); };
    countUp($('.bw-a', o), 0, amount, mult >= 50 ? 3200 : 2200).then(() => { SND.coin(5); setTimeout(fin, 2600); });
    setTimeout(() => o.onclick = fin, 500);
  });
}

/* ================= Toast / Sheets ================= */
function toast(msg, kind = '', ms = 3200) {
  const t = document.createElement('div'); t.className = 'toast ' + kind;
  t.innerHTML = `<div class="ti">${kind === 'good' ? '✓' : kind === 'bad' ? '!' : 'i'}</div><div>${msg}</div>`;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms);
}
function sheet(html, opts = {}) {
  const o = document.createElement('div'); o.className = 'ov' + (opts.center ? ' center' : '');
  o.innerHTML = `<div class="sheet">${html}</div>`;
  const close = () => { if (o.closing) return; o.closing = 1; o.classList.add('closing'); setTimeout(() => { o.remove(); opts.onClose && opts.onClose(); }, 280); };
  o.addEventListener('click', e => { if (e.target === o && !opts.lock) close(); });
  $$('[data-close]', o).forEach(b => b.onclick = close);
  document.body.appendChild(o); o.close = close;
  $$('[data-close]', o).forEach(b => b.onclick = close);
  return o;
}
function confirmBox(title, text, okText = 'OK', danger) {
  return new Promise(res => {
    const o = sheet(`<h2>${title}</h2><p class="hint" style="font-size:17px">${text}</p><div class="two" style="margin-top:18px"><button class="btn dark" data-c="0">Abbrechen</button><button class="btn ${danger ? 'red' : 'white'}" data-c="1">${okText}</button></div>`, { center: true, onClose: () => res(false) });
    $$('[data-c]', o).forEach(b => b.onclick = () => { const v = b.dataset.c === '1'; o.close(); setTimeout(() => res(v), 0); });
  });
}

/* ================= Konten ================= */
const ACC_KEY = 'gg_accounts_v1', SES_KEY = 'gg_session_v1';
const Accounts = {
  all() { try { return JSON.parse(localStorage.getItem(ACC_KEY)) || {}; } catch (e) { return {}; } },
  put(all) { try { localStorage.setItem(ACC_KEY, JSON.stringify(all)); } catch (e) { toast('Speichern fehlgeschlagen (Speicher voll?)', 'bad'); } },
  async hash(pw, salt) {
    const data = new TextEncoder().encode(salt + '::' + pw);
    if (crypto.subtle) { const h = await crypto.subtle.digest('SHA-256', data); return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join(''); }
    let h = 2166136261; for (const b of data) { h ^= b; h = Math.imul(h, 16777619); } return 'f' + (h >>> 0).toString(16);
  },
};
let S = null, ACC = null;
function newState(name) {
  const now = Date.now();
  return {
    v: 1, name, disp: name, color: 0, photo: '', created: now,
    bal: 500, today: { d: dayKey(), v: 0 }, xp: 0, level: 1,
    st: { biggest: 0, net: 0, wagered: 0, rounds: 0, spins: 0, scratches: 0, bets: 0, betWins: 0, trades: 0, tradeProfit: 0, bestGame: '', shifts: 0, perfect: 0, jackpots: 0, maxMult: 0, maxBal: 500, bonusStreak: 0, brews: 0, potsDrunk: 0, combiWin: 0, inkasso: 0, insolv: 0, treff: 0, edits: 0 },
    favs: [], set: { snd: true, vib: true },
    pot: { 2: 0, 4: 0, 6: 0 }, potAct: null, brewBest: 0,
    energy: 10, enTs: now,
    bonus: { last: '', streak: 0 },
    note: 0, lastInt: now,
    jp: { mini: 500, major: 5000, grand: 50000 },
    bx: { bal: 0, pos: [], ord: [], hist: [], lev: 50, sym: 'XRZ', tf: 'M5', id: 1, pnl: 0 },
    bets: [], shops: {}, shopTs: now, ach: {}, tasks: null, lastSlot: 3,
  };
}
function persist() {
  if (!S || !ACC) return;
  const all = Accounts.all(); if (!all[ACC]) return;
  all[ACC].save = S; all[ACC].bal = S.bal; all[ACC].level = S.level; all[ACC].disp = S.disp; all[ACC].photo = S.photo; all[ACC].ts = Date.now();
  Accounts.put(all);
}
let saveT = 0; function save() { clearTimeout(saveT); saveT = setTimeout(persist, 250); }
addEventListener('pagehide', persist); document.addEventListener('visibilitychange', () => document.hidden && persist());

/* ================= Geld / Level ================= */
const DISPO = 180;
const isLocked = () => S.bal < -DISPO;
const base = () => r2(40 * Math.pow(1.13, S.level));
const xpNeed = l => Math.round(100 * Math.pow(l, 1.8));
function touchToday() { if (S.today.d !== dayKey()) S.today = { d: dayKey(), v: 0 }; }
function canPay(a) {
  if (isLocked()) { toast('Dein Konto ist gesperrt – hol dir Geld in den Minispielen oder verkauf die Schulden.', 'bad'); SND.err(); return false; }
  if (S.bal - a < -DISPO - 1e-9) { toast(`Nicht genug Guthaben – Dispo nur bis ${fmt(-DISPO)}.`, 'bad'); SND.err(); return false; }
  return true;
}
/* Einsatz abbuchen (Glücksspiel) */
function bet(a, game) {
  if (!canPay(a)) return false;
  S.bal = r2(S.bal - a); touchToday(); S.today.v = r2(S.today.v - a);
  S.st.wagered += a; S.st.rounds++; S.st.net = r2(S.st.net - a);
  addXP(Math.min(a, 25 + S.level * 25));
  taskProg('wager', a); taskProg('rounds', 1);
  hdr(); checkAch(); save(); return true;
}
/* Gewinn gutschreiben (Glücksspiel) – Inkasso bekommt 40 % */
function payout(a, game, stake) {
  if (a <= 0) return 0;
  let cut = 0;
  if (S.note > 0) { cut = r2(Math.min(S.note, a * .4)); S.note = r2(S.note - cut); if (S.note <= 0.004) { S.note = 0; toast('Schuldschein komplett abbezahlt! 🎉', 'good'); } }
  const got = r2(a - cut);
  S.bal = r2(S.bal + got); touchToday(); S.today.v = r2(S.today.v + got); S.st.net = r2(S.st.net + got);
  if (a > S.st.biggest) { S.st.biggest = r2(a); S.st.bestGame = game; }
  if (stake) S.st.maxMult = Math.max(S.st.maxMult, a / stake);
  if (cut > 0) setTimeout(() => toast(`Inkasso Krause kassiert ${fmt(cut)} (40 %)`), 900);
  afterMoney(); return got;
}
/* Geld aus Minispielen, Bonus, Aufgaben, Geschäften */
function earn(a, why) {
  if (a <= 0) return;
  S.bal = r2(S.bal + a); touchToday(); S.today.v = r2(S.today.v + a);
  afterMoney();
}
function afterMoney() { S.st.maxBal = Math.max(S.st.maxBal, S.bal); hdr(true); checkAch(); save(); }
function addXP(x) {
  S.xp += x; let up = false;
  while (S.xp >= xpNeed(S.level)) { S.xp -= xpNeed(S.level); S.level++; up = true; }
  if (up) { setTimeout(() => { toast(`Level ${S.level} erreicht! Neue Spiele &amp; höhere Belohnungen 🎉`, 'good'); FX.burst(80); SND.win(); }, 300); checkAch(); }
}
function applyInterest() {
  const now = Date.now(), h = (now - S.lastInt) / 36e5;
  if (S.bal < 0 && h > 0) { const nb = r2(S.bal * Math.pow(1.005, h)); if (nb !== S.bal) S.bal = nb; }
  S.lastInt = now;
}
function regenEnergy() {
  const now = Date.now(), per = 10 * 60e3;
  if (S.energy >= 10) { S.enTs = now; return; }
  const n = Math.floor((now - S.enTs) / per);
  if (n > 0) { S.energy = Math.min(10, S.energy + n); S.enTs += n * per; if (S.energy >= 10) S.enTs = now; }
}

/* ================= Header ================= */
let lastBal = null;
function initials(n) { const p = String(n).trim().split(/\s+/); return (p.length > 1 ? p[0][0] + p[1][0] : String(n).slice(0, 2)).toUpperCase(); }
const AVA_COLS = ['radial-gradient(circle at 35% 30%,#e3c25a,#a8862a)', 'radial-gradient(circle at 35% 30%,#8fd0ff,#2f6fd0)', 'radial-gradient(circle at 35% 30%,#ff9ea0,#c23a4a)', 'radial-gradient(circle at 35% 30%,#b5f59a,#3d9a3a)', 'radial-gradient(circle at 35% 30%,#e0b0ff,#7a3ad0)', 'radial-gradient(circle at 35% 30%,#f0f0f0,#8a8a8a)'];
function avaHTML(o, cls = '') {
  const st = o.photo ? `background-image:url(${o.photo})` : `background:${AVA_COLS[o.color || 0]}`;
  return `<div class="avatar ${cls}" style="${st}">${o.photo ? '' : esc(o.ini || initials(o.disp || o.name))}</div>`;
}
function hdr(anim) {
  if (!S) return; touchToday();
  const b = $('#hBal'); b.textContent = fmt(S.bal); b.classList.toggle('neg', S.bal < 0);
  if (anim && lastBal !== null && Math.abs(lastBal - S.bal) > .001) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  lastBal = S.bal;
  const t = S.today.v; $('#hToday').textContent = (Math.abs(t) < .005 ? '±' + fmt(0) : fmt(t, { sign: true })) + ' heute';
  $('#hLock').classList.toggle('hidden', !isLocked());
  $('#lvlNum').textContent = S.level;
  $('#lvlArc').style.strokeDashoffset = 125.66 * (1 - S.xp / xpNeed(S.level));
  const a = $('#hAva'); a.style.cssText = S.photo ? `background-image:url(${S.photo})` : `background:${AVA_COLS[S.color || 0]}`; a.textContent = S.photo ? '' : initials(S.disp);
}
