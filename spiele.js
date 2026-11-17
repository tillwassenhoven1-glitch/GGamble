'use strict';
/* ================= Aufgaben ================= */
const TASKS_D = [['trades', 3, 'Schließ {g} Trades'], ['shifts', 2, 'Erledige {g} Schichten'], ['wager', 90, 'Setz insgesamt {g} €'], ['spins', 40, 'Dreh {g}-mal am Automaten'], ['scratch', 5, 'Rubbel {g} Lose'], ['bets', 2, 'Platziere {g} Wetten'], ['rounds', 80, 'Spiel {g} Runden']];
function mkTasks(seed, mult, money, xp) {
  const r = mulberry(seed), pool = [...TASKS_D].sort(() => r() - .5).slice(0, 3);
  return pool.map(([k, g, n]) => { const goal = k === 'wager' ? Math.round(g * S.level * mult) : g * mult; return { k, g: goal, n: n.replace('{g}', NF0.format(goal)), p: 0, rew: r2(base() * money), xp: Math.round(xp), done: false }; });
}
function ensureTasks() {
  const d = dayKey(), w = weekKey();
  if (!S.tasks) S.tasks = {};
  if (S.tasks.d !== d) { S.tasks.d = d; S.tasks.day = mkTasks(hashStr(d + ACC), 1, 2.67, 14 + S.level * 14); }
  if (S.tasks.w !== w) { S.tasks.w = w; S.tasks.week = mkTasks(hashStr(w + ACC + 'w'), 6, 8.7, 240); }
}
function hashStr(s) { let h = 7; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 2654435761); return h >>> 0; }
function taskProg(k, v) {
  if (!S) return; ensureTasks();
  [...S.tasks.day, ...S.tasks.week].forEach(t => {
    if (t.k !== k || t.done) return; t.p = Math.min(t.g, t.p + v);
    if (t.p >= t.g) { t.done = true; setTimeout(() => { earn(t.rew, 'Aufgabe'); addXP(t.xp); toast(`Aufgabe erledigt: ${t.n} → +${fmt(t.rew)} · ${t.xp} XP ✅`, 'good', 4000); SND.win(); FX.burst(50); hdr(true); save(); }, 600); }
  });
}
function tasksHTML(list) {
  return list.map(t => `<div class="task ${t.done ? 'done' : ''}"><div class="row sb"><b>${t.n}</b><span class="num" style="color:var(--mut)">${NF0.format(t.p)} / ${NF0.format(t.g)}</span></div><div class="bar"><i style="width:${t.p / t.g * 100}%"></i></div><span class="chip gold">${t.done ? '✓ ' : '+'}${fmt(t.rew)} · ${t.xp} XP</span></div>`).join('');
}
function untilMidnight() { const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); const s = (m - n) / 1000; return `${Math.floor(s / 3600)} Std. ${Math.floor(s % 3600 / 60)} Min.`; }

/* ================= Glückstränke ================= */
const POT_R = { 2: 25, 4: 15, 6: 10 };
function potionsHTML() {
  return `<div class="pots">${[2, 4, 6].map(m => `<div><div class="pot p${m}"><i>×${m}</i></div><b class="num">${S.pot[m]}×</b><button class="btn dark sm w" data-drink="${m}" ${S.pot[m] < 1 || S.potAct ? 'disabled' : ''}>Trinken</button></div>`).join('')}</div>`;
}
function bindPotions(root, cb) {
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-drink]'); if (!b) return; const m = +b.dataset.drink;
    if (S.potAct) { toast('Es wirkt schon ein Glückstrank.'); return; }
    if (S.pot[m] < 1) return;
    S.pot[m]--; S.potAct = { m, left: POT_R[m] }; S.st.potsDrunk++;
    SND.big(); flash(); FX.burst(80, { cols: m === 2 ? ['#7ad07a', '#fff'] : m === 4 ? ['#5fa0f5', '#fff'] : ['#c487f0', '#fff'] });
    toast(`Glückstrank ×${m} wirkt für ${POT_R[m]} Runden ✨`, 'good'); checkAch(); save(); cb && cb();
  });
}

/* ================= Seite: Minispiele ================= */
function renderSpiele(el) {
  regenEnergy(); ensureTasks();
  const nextE = S.energy < 10 ? Math.ceil((S.enTs + 600e3 - Date.now()) / 60e3) : 0;
  el.innerHTML = `<h1 class="t">Minispiele</h1><p class="sub">Aufgaben erledigen, Geld zurückholen, Glückstränke brauen</p>
   <div class="pill energy">${icon('battery')} <span class="num">${S.energy} / 10</span>${nextE ? `<small style="font-size:14px;color:var(--mut);font-weight:600">+1 in ${nextE} Min.</small>` : ''}</div>
   ${S.bal < 0 ? `<div class="card warn" style="margin-top:18px"><div class="row" style="align-items:flex-start">${icon('warn')}<div><h4>Du bist im Minus (${fmt(S.bal)})</h4><p class="hint" style="font-size:18px;margin:6px 0 0;color:#cfcfd4">Jedes Minispiel zahlt zuerst deine Schulden ab. ${isLocked() ? 'Dein Konto ist gesperrt, bis du wieder über dem Dispo bist.' : ''}</p></div></div></div>` : ''}
   <div class="sec">Aufgaben <small>neue Tagesaufgaben in ${untilMidnight()}</small></div>
   <div class="card"><h3 style="font-size:24px">Heute</h3>${tasksHTML(S.tasks.day)}</div>
   <div class="card"><h3 style="font-size:24px">Diese Woche</h3>${tasksHTML(S.tasks.week)}</div>
   <div class="sec">Glückstränke ${S.potAct ? `<small class="goldc">×${S.potAct.m} aktiv · noch ${S.potAct.left} Runden</small>` : ''}</div>
   <div class="card" id="potCard">${potionsHTML()}
     <p style="font-size:19px;line-height:1.45;margin:20px 4px 10px">Ein Glückstrank lässt jeden Dreh am Automaten und jedes Rubbellos mehrmals würfeln – du bekommst immer das beste Ergebnis. ×2 wirkt 25 Runden, ×4 15 Runden, ×6 10 Runden. Bei All-In wirkt er nicht.</p>
     <p class="hint" style="font-size:17px">Brauen ist schwer: 6 Treffer für ×2, 10 Treffer für ×4, 14 Treffer für ×6. Bester Lauf bisher: ${S.brewBest}.</p>
     <button class="btn white w" id="lab" style="font-size:22px">${icon('spark')} Glückslabor · 2 Energie</button></div>
   <div class="sec">Geld verdienen</div>
   ${[['hut', 'target', 'Hütchenspiel', 'Behalt die Kugel im Auge.', 1], ['kasse', 'hand', 'Kassensturz', 'Zähl die Kasse schneller als der Chef.'], ['pfand', 'beer', 'Pfandflaschen', 'Fang die Flaschen, meide die Scherben.'], ['inv', 'layers', 'Inventur', 'Merk dir das Regal – dann wird gezählt.']].map(([id, ic, n, d, neu]) => `<button class="card gm" data-g="${id}" style="position:relative">${neu ? '<span class="neu">NEU</span>' : ''}<div class="ibox">${icon(ic)}</div><h4>${n}</h4><p>${d}</p><span class="chip gold">bis ${fmt(base())} · 1 Energie</span></button>`).join('')}
   <p class="hint">Perfekte Spiele haben eine kleine Chance auf einen Glückstrank ×2.</p>
   <div class="sec">Imperium</div>
   <button class="card gm row" id="imp" style="display:flex;gap:16px;align-items:center"><div class="ibox">${icon('building')}</div><div style="flex:1"><h4 style="margin:0">Eigene Geschäfte</h4><p style="margin:6px 0 0">Kauf Kiosk, Späti, Hotel … – sie bringen jede Stunde Geld, auch wenn du offline bist.</p></div><b class="pos num" style="font-size:22px;white-space:nowrap">${fmt(shopRate())}/h</b>${icon('right', 'chev')}</button>`;
  bindPotions($('#potCard', el), () => renderSpiele(el));
  $('#lab', el).onclick = () => startGame('lab');
  $$('[data-g]', el).forEach(b => b.onclick = () => startGame(b.dataset.g));
  $('#imp', el).onclick = () => go('imperium');
}

/* ================= Spiel-Rahmen ================= */
const GAMES = {
  hut: { n: 'Hütchenspiel', run: gameHut }, kasse: { n: 'Kassensturz', run: gameKasse }, pfand: { n: 'Pfandflaschen', run: gamePfand }, inv: { n: 'Inventur', run: gameInv },
  lab: { n: 'Glückslabor', run: gameLab, cost: 2 },
};
function startGame(id) {
  const G = GAMES[id], cost = G.cost || 1; regenEnergy();
  if (S.energy < cost) { toast(`Keine Energie mehr – alle 10 Minuten gibt's 1 neue.`, 'bad'); SND.err(); return; }
  S.energy -= cost; if (S.energy < 10 && S.enTs > Date.now()) S.enTs = Date.now(); save();
  const o = document.createElement('div'); o.className = 'game-ov';
  o.innerHTML = `<div class="gh"><button class="pill circbtn" style="margin:0;width:54px;height:54px" id="gX">${icon('x')}</button><b>${G.n}</b><span class="chip">${icon('battery')} ${S.energy}</span></div><div class="gbody"></div>`;
  document.body.appendChild(o);
  let ended = false; const cleanup = [];
  const body = $('.gbody', o);
  const close = () => { cleanup.forEach(f => f()); o.style.transition = 'opacity .3s'; o.style.opacity = 0; setTimeout(() => o.remove(), 300); if (curPage === 'spiele') go('spiele', true); };
  $('#gX', o).onclick = () => { ended = true; close(); };
  const done = (score, max, extra) => {
    if (ended) return; ended = true; cleanup.forEach(f => f());
    let html;
    if (id === 'lab') {
      S.st.brews++; S.brewBest = Math.max(S.brewBest, score);
      const m = score >= 14 ? 6 : score >= 10 ? 4 : score >= 6 ? 2 : 0;
      if (m) { S.pot[m]++; if (m === 6) S.st.pot6 = (S.st.pot6 || 0) + 1; }
      html = `<h2>${m ? `Trank ×${m} gebraut!` : 'Misslungen…'}</h2><p>${score} Treffer${m ? '' : ' – du brauchst mindestens 6.'}</p>${m ? `<div class="pot p${m}" style="margin:0 auto 24px;animation:pop .6s var(--spring)"><i>×${m}</i></div>` : ''}`;
      if (m) { SND.big(); FX.burst(100, { cols: ['#c487f0', '#5fa0f5', '#7ad07a', '#fff'] }); } else SND.lose();
    } else {
      const amt = r2(base() * clamp(score / max, 0, 1));
      S.st.shifts++; taskProg('shifts', 1);
      let potTxt = '';
      if (score >= max) { S.st.perfect++; if (Math.random() < .15) { S.pot[2]++; potTxt = '<br>✨ Bonus: Glückstrank ×2!'; } }
      if (amt > 0) { earn(amt, G.n); FX.burst(score >= max ? 120 : 50, { coins: true }); score >= max ? SND.big() : SND.win(); } else SND.lose();
      html = `<h2>${score >= max ? 'Perfekt! 🔥' : score > 0 ? 'Gut gemacht!' : 'Schade…'}</h2><p>${score} / ${max} · +${fmt(amt)}${S.bal - amt < 0 && amt > 0 ? ' (geht zuerst an deine Schulden)' : ''}${potTxt}</p>`;
    }
    checkAch(); save(); hdr(true);
    body.innerHTML = `<div class="result">${html}<div class="two" style="width:min(90vw,420px)"><button class="btn dark" id="gEnd">Fertig</button><button class="btn white" id="gAgain">Nochmal · ${G.cost || 1} ⚡</button></div></div>`;
    $('#gEnd', o).onclick = close;
    $('#gAgain', o).onclick = () => { o.remove(); cleanup.length = 0; startGame(id); };
  };
  G.run(body, done, cleanup, () => ended);
}
function countdown(body, then) {
  let n = 3; body.innerHTML = `<div style="font-size:120px;font-weight:900" id="cd">3</div>`;
  const t = () => { const e = $('#cd', body); if (!e) return; if (n === 0) { then(); return; } e.textContent = n; e.animate([{ transform: 'scale(1.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 400, easing: 'cubic-bezier(.34,1.56,.64,1)' }); SND.tone(600 + (3 - n) * 200, .15, 'square', .06); n--; setTimeout(t, 700); };
  t();
}

/* ---------- Kassensturz ---------- */
const MONEY = [[.05, 'cu', '5ct'], [.1, '', '10ct'], [.2, '', '20ct'], [.5, '', '50ct'], [1, 'bi', '1€'], [2, 'bi', '2€'], [5, 'n', '5€', '#7a8a6a'], [10, 'n', '10€', '#c04a4a'], [20, 'n', '20€', '#3a6ad0'], [50, 'n', '50€', '#e08a2a']];
function gameKasse(body, done, cl, isEnded) {
  let round = 0, score = 0; const R = 5;
  const next = () => {
    if (isEnded()) return; if (round >= R) return done(score, R);
    round++; const items = Array.from({ length: rint(3, 4 + round) }, () => pick(MONEY.slice(0, 6 + Math.min(4, round))));
    const sum = r2(items.reduce((a, m) => a + m[0], 0));
    const opts = new Set([sum]); while (opts.size < 4) opts.add(r2(Math.max(.05, sum + pick([-1, 1]) * pick([.1, .2, .5, 1, 2, 5, .05, 10]))));
    const ol = [...opts].sort(() => Math.random() - .5);
    body.innerHTML = `<div class="hud"><span>Runde ${round}/${R}</span><span>✓ ${score}</span></div>
      <div class="bar" style="width:min(90vw,420px);margin:18px 0"><i id="tb" style="width:100%;transition:width 7s linear;background:linear-gradient(90deg,#f5cf5a,#e8524a)"></i></div>
      <div class="money">${items.map((m, i) => m[1] === 'n' ? `<div class="note" style="background:${m[3]};animation-delay:${i * .06}s">${m[2]}</div>` : `<div class="coin ${m[1]}" style="animation-delay:${i * .06}s">${m[2]}</div>`).join('')}</div>
      <p style="margin-top:14px;color:var(--mut);font-size:18px">Wie viel liegt in der Kasse?</p>
      <div class="opts">${ol.map(v => `<button data-v="${v}">${fmt(v)}</button>`).join('')}</div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => { const tb = $('#tb', body); if (tb) tb.style.width = '0%'; }));
    let answered = false;
    const to = setTimeout(() => { if (!answered) { answered = true; SND.err(); $$('.opts button', body).forEach(b => { if (+b.dataset.v === sum) b.classList.add('ok'); }); setTimeout(next, 900); } }, 7000);
    cl.push(() => clearTimeout(to));
    $('.opts', body).onclick = e => {
      const b = e.target.closest('button'); if (!b || answered) return; answered = true; clearTimeout(to);
      const ok = +b.dataset.v === sum; b.classList.add(ok ? 'ok' : 'no'); if (ok) { score++; SND.coin(); } else { SND.err(); $$('.opts button', body).forEach(x => { if (+x.dataset.v === sum) x.classList.add('ok'); }); }
      setTimeout(next, 700);
    };
  };
  countdown(body, next);
}
/* ---------- Inventur ---------- */
function gameInv(body, done, cl, isEnded) {
  let round = 0, score = 0; const R = 5, SETS = [['🥫', '🧃', '🍫', '🧻'], ['🍎', '🍌', '🥕', '🥖'], ['🍺', '🥤', '🍾', '🧀'], ['📦', '🧴', '🧼', '🪥']];
  const next = () => {
    if (isEnded()) return; if (round >= R) return done(score, R);
    round++; const set = pick(SETS), n = 8 + round * 2, items = Array.from({ length: n }, () => pick(set)), ask = pick(set), cnt = items.filter(x => x === ask).length;
    body.innerHTML = `<div class="hud"><span>Runde ${round}/${R}</span><span>✓ ${score}</span></div><p style="margin:16px 0;color:var(--mut);font-size:18px">Merk dir das Regal!</p><div class="shelf">${items.map((x, i) => `<span style="animation-delay:${i * .03}s">${x}</span>`).join('')}</div>`;
    const t = setTimeout(() => {
      if (isEnded()) return;
      const opts = new Set([cnt]); while (opts.size < 4) opts.add(Math.max(0, cnt + rint(-3, 3)));
      body.innerHTML = `<div class="hud"><span>Runde ${round}/${R}</span><span>✓ ${score}</span></div><div style="font-size:90px;margin:20px 0">${ask}</div><p style="font-size:22px;font-weight:700">Wie viele waren im Regal?</p>
        <div class="opts">${[...opts].sort((a, b) => a - b).map(v => `<button data-v="${v}">${v}</button>`).join('')}</div>`;
      $('.opts', body).onclick = e => { const b = e.target.closest('button'); if (!b || b.parentNode.dataset.a) return; b.parentNode.dataset.a = 1; const ok = +b.dataset.v === cnt; b.classList.add(ok ? 'ok' : 'no'); if (ok) { score++; SND.coin(); } else { SND.err(); $$('.opts button', body).forEach(x => +x.dataset.v === cnt && x.classList.add('ok')); } setTimeout(next, 800); };
    }, 2400 + round * 300);
    cl.push(() => clearTimeout(t));
  };
  countdown(body, next);
}
/* ---------- Hütchenspiel ---------- */
function gameHut(body, done, cl, isEnded) {
  let round = 0, score = 0; const R = 5;
  const cupSVG = '<svg viewBox="0 0 110 130"><defs><linearGradient id="cg" x1="0" x2="1"><stop offset="0" stop-color="#7a1f14"/><stop offset=".4" stop-color="#e0553e"/><stop offset="1" stop-color="#6a160d"/></linearGradient></defs><path d="M22 10h66l18 110H4z" fill="url(#cg)"/><ellipse cx="55" cy="10" rx="33" ry="7" fill="#a33626"/><ellipse cx="55" cy="120" rx="51" ry="9" fill="#5a120a"/><rect x="10" y="90" width="90" height="8" fill="#f5cf5a" opacity=".8"/></svg>';
  const next = () => {
    if (isEnded()) return; if (round >= R) return done(score, R);
    round++;
    body.innerHTML = `<div class="hud"><span>Runde ${round}/${R}</span><span>✓ ${score}</span></div><p style="margin:16px 0;color:var(--mut);font-size:18px" id="hm">Hier ist die Kugel …</p><div class="cups" id="cups"><div class="ball" id="ball"></div>${[0, 1, 2].map(i => `<div class="cup" data-c="${i}">${cupSVG}</div>`).join('')}</div>`;
    const W = $('#cups', body).offsetWidth, pos = [0, 1, 2], X = i => (W / 3) * i + (W / 3 - 110) / 2;
    const cups = $$('.cup', body), ball = $('#ball', body); let ballCup = rint(0, 2);
    const place = (fast) => cups.forEach((c, i) => { c.style.transitionDuration = fast + 'ms'; c.style.left = X(pos[i]) + 'px'; });
    place(0); ball.style.left = X(pos[ballCup]) + 38 + 'px';
    cups[ballCup].classList.add('up');
    const t1 = setTimeout(() => {
      cups[ballCup].classList.remove('up');
      setTimeout(() => {
        ball.style.opacity = 0; $('#hm', body).textContent = 'Gut aufpassen!';
        let swaps = 4 + round * 2, sp = Math.max(160, 420 - round * 55);
        const sw = () => {
          if (isEnded()) return;
          if (swaps-- <= 0) { $('#hm', body).textContent = 'Wo ist die Kugel?'; ask(); return; }
          const a = rint(0, 2); let b; do { b = rint(0, 2); } while (b === a);
          [pos[a], pos[b]] = [pos[b], pos[a]]; place(sp); SND.tone(300 + rint(0, 200), .05, 'triangle', .05); setTimeout(sw, sp + 40);
        }; sw();
      }, 450);
    }, 1300);
    cl.push(() => clearTimeout(t1));
    const ask = () => {
      $('#cups', body).onclick = e => {
        const c = e.target.closest('.cup'); if (!c || $('#cups', body).dataset.a) return; $('#cups', body).dataset.a = 1;
        const i = +c.dataset.c, ok = i === ballCup;
        ball.style.transition = 'none'; ball.style.left = X(pos[ballCup]) + 38 + 'px'; ball.style.opacity = 1;
        c.classList.add('up'); if (!ok) setTimeout(() => cups[ballCup].classList.add('up'), 400);
        if (ok) { score++; SND.coin(); FX.burst(20, { coins: true }); } else SND.err();
        $('#hm', body).textContent = ok ? 'Richtig! 🎉' : 'Daneben!'; setTimeout(next, 1300);
      };
    };
  };
  countdown(body, next);
}
/* ---------- Pfandflaschen & Glückslabor (Canvas) ---------- */
function canvasGame(body, cl, isEnded, cfg) {
  body.innerHTML = `<div class="hud" id="hud"></div><canvas id="gc" style="width:min(94vw,460px);height:min(64vh,560px);margin-top:12px;border-radius:24px;background:${cfg.bg}"></canvas><p style="color:var(--mut);margin-top:10px">${cfg.help}</p>`;
  const cv = $('#gc', body), d = devicePixelRatio || 1, W = cv.offsetWidth, H = cv.offsetHeight;
  cv.width = W * d; cv.height = H * d; const c = cv.getContext('2d'); c.scale(d, d);
  let alive = true; cl.push(() => alive = false);
  const st = { W, H, c, cv, t0: performance.now(), score: 0 };
  cfg.init && cfg.init(st);
  const loop = t => { if (!alive || isEnded()) return; st.t = (t - st.t0) / 1000; c.clearRect(0, 0, W, H); if (cfg.step(st) === false) { alive = false; return; } $('#hud', body).innerHTML = cfg.hud(st); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  return st;
}
function gamePfand(body, done, cl, isEnded) {
  countdown(body, () => {
    const T = 30, GOAL = 22;
    const st = canvasGame(body, cl, isEnded, {
      bg: 'linear-gradient(180deg,#14202e,#0a0f16)', help: 'Finger/Maus bewegen den Korb',
      init(s) { s.x = s.W / 2; s.items = []; s.lives = 3; s.next = 0; const mv = e => { const r = s.cv.getBoundingClientRect(); s.x = clamp(e.clientX - r.left, 40, s.W - 40); }; s.cv.addEventListener('pointermove', mv); s.cv.addEventListener('pointerdown', mv); },
      hud: s => `<span>⏱ ${Math.max(0, Math.ceil(T - s.t))}</span><span>🍾 ${s.score}/${GOAL}</span><span>${'❤️'.repeat(s.lives)}${'🖤'.repeat(3 - s.lives)}</span>`,
      step(s) {
        const c = s.c;
        if (s.t > s.next) { s.next = s.t + Math.max(.32, .9 - s.t * .02); const bad = Math.random() < .28 + s.t * .006; s.items.push({ x: rnd(25, s.W - 25), y: -30, v: rnd(2.4, 3.6) + s.t * .09, bad, e: bad ? '' : pick(['🍾', '🥤', '🧃', '🍺']), r: rnd(0, 6) }); }
        c.font = '34px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        for (const it of s.items) {
          it.y += it.v; it.r += .05;
          if (it.bad) { c.save(); c.translate(it.x, it.y); c.rotate(it.r); c.fillStyle = 'rgba(180,220,230,.8)'; c.strokeStyle = '#e0f4ff'; c.beginPath(); c.moveTo(-14, 10); c.lineTo(0, -16); c.lineTo(6, -2); c.lineTo(16, 12); c.closePath(); c.fill(); c.stroke(); c.restore(); }
          else c.fillText(it.e, it.x, it.y);
          if (!it.dead && it.y > s.H - 70 && it.y < s.H - 30 && Math.abs(it.x - s.x) < 46) { it.dead = true; if (it.bad) { s.lives--; SND.err(); vib(60); } else { s.score++; SND.coin(s.score % 5); } }
        }
        s.items = s.items.filter(i => !i.dead && i.y < s.H + 40);
        c.font = '62px serif'; c.fillText('🧺', s.x, s.H - 40);
        if (s.t >= T || s.lives <= 0) { done(Math.min(s.score, GOAL), GOAL); return false; }
      }
    });
  });
}
function gameLab(body, done, cl, isEnded) {
  countdown(body, () => {
    const T = 20;
    canvasGame(body, cl, isEnded, {
      bg: 'radial-gradient(circle at 50% 100%,#3a1a5a,#0a0612 70%)', help: 'Tipp die bunten Blasen – nicht die schwarzen!',
      init(s) {
        s.b = []; s.next = 0; s.fx = [];
        s.cv.addEventListener('pointerdown', e => {
          const r = s.cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
          for (const b of s.b) if (!b.dead && Math.hypot((b.xx ?? b.x) - x, b.y - y) < b.r + 12) { b.dead = true; if (b.bad) { s.score = Math.max(0, s.score - 2); SND.err(); vib(50); } else { s.score++; SND.coin(s.score % 6); } s.fx.push({ x: b.xx ?? b.x, y: b.y, t: 0, c: b.c }); break; }
        });
      },
      hud: s => `<span>⏱ ${Math.max(0, Math.ceil(T - s.t))}</span><span>✨ ${s.score}</span><span>${s.score >= 14 ? '×6' : s.score >= 10 ? '×4' : s.score >= 6 ? '×2' : '–'}</span>`,
      step(s) {
        const c = s.c;
        c.fillStyle = '#1a1a1a'; c.beginPath(); c.ellipse(s.W / 2, s.H + 10, s.W * .42, 60, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(160,90,255,.35)'; c.beginPath(); c.ellipse(s.W / 2, s.H - 34, s.W * .36, 16, 0, 0, 7); c.fill();
        if (s.t > s.next) { s.next = s.t + Math.max(.28, .75 - s.t * .02); const bad = Math.random() < .3; s.b.push({ x: s.W / 2 + rnd(-s.W * .3, s.W * .3), y: s.H - 40, r: rnd(16, 28), v: rnd(1.6, 2.8) + s.t * .08, w: rnd(0, 6), bad, c: bad ? '#111' : pick(['#7ad07a', '#5fa0f5', '#c487f0', '#f5cf5a', '#ff7ac8']) }); }
        for (const b of s.b) {
          b.y -= b.v; b.w += .06; const x = b.x + Math.sin(b.w) * 14;
          b.xx = x;
          const g = c.createRadialGradient(x - b.r * .3, b.y - b.r * .3, 2, x, b.y, b.r); g.addColorStop(0, b.bad ? '#555' : '#fff'); g.addColorStop(.3, b.c); g.addColorStop(1, b.bad ? '#000' : b.c + '88');
          c.fillStyle = g; c.beginPath(); c.arc(x, b.y, b.r, 0, 7); c.fill();
          if (b.bad) { c.strokeStyle = '#e8524a'; c.lineWidth = 2; c.stroke(); }
        }
        s.b = s.b.filter(b => !b.dead && b.y > -40);
        for (const f of s.fx) { f.t++; c.strokeStyle = f.c; c.globalAlpha = 1 - f.t / 20; c.lineWidth = 3; c.beginPath(); c.arc(f.x, f.y, 10 + f.t * 2.5, 0, 7); c.stroke(); c.globalAlpha = 1; }
        s.fx = s.fx.filter(f => f.t < 20);
        if (s.t >= T) { done(s.score, 14); return false; }
      }
    });
  });
}

/* ================= Imperium ================= */
const SHOPS = [['kiosk', 'Kiosk', '🏪', 500, 10], ['spaeti', 'Späti', '🏬', 2500, 45], ['doener', 'Dönerbude', '🥙', 10000, 160], ['wasch', 'Waschsalon', '🧺', 40000, 560], ['bar', 'Cocktailbar', '🍸', 150000, 1900], ['hotel', 'Hotel', '🏨', 750000, 8500], ['casino', 'Casino', '🎰', 5e6, 50000], ['bank', 'Privatbank', '🏦', 4e7, 350000]];
const shopInc = (s, l) => l > 0 ? s[4] * Math.pow(1.5, l - 1) : 0;
const shopCost = (s, l) => r2(s[3] * Math.pow(1.8, l));
function shopRate() { return r2(SHOPS.reduce((a, s) => a + shopInc(s, S.shops[s[0]] || 0), 0)); }
function shopPending() { const h = Math.min(24, (Date.now() - S.shopTs) / 36e5); return r2(shopRate() * h); }
function collectShops(silent) { const p = shopPending(); S.shopTs = Date.now(); if (p > 0) { earn(p, 'Imperium'); if (!silent) { toast(`Geschäfte eingesammelt: +${fmt(p)} 🏪`, 'good'); SND.coin(); FX.burst(50, { coins: true }); } } save(); }
function renderImperium(el) {
  const pend = shopPending();
  el.innerHTML = `<button class="btn dark sm" id="back">${icon('left')} Minispiele</button><h1 class="t" style="margin-top:16px">Imperium</h1>
    <p class="sub">Deine Geschäfte verdienen jede Stunde Geld – auch offline (max. 24 Std. ansammeln).</p>
    <div class="card"><div class="row sb"><div><small style="color:var(--mut)">Einnahmen</small><b style="display:block;font-size:30px" class="pos num">${fmt(shopRate())}/h</b></div>
      <button class="btn gold" id="col" ${pend <= 0 ? 'disabled' : ''}>Einsammeln<br>${fmt(pend)}</button></div></div>
    ${SHOPS.map(s => { const l = S.shops[s[0]] || 0, c = shopCost(s, l), lk = l === 0 && SHOPS.indexOf(s) > 0 && !(S.shops[SHOPS[SHOPS.indexOf(s) - 1][0]]); return `<div class="card shop" style="${lk ? 'opacity:.5' : ''}"><div class="em">${s[2]}</div><div class="inf"><b>${s[1]}</b>${l ? ` <span class="chip" style="padding:3px 10px;font-size:12px">Stufe ${l}</span>` : ''}<small>${l ? `${fmt(shopInc(s, l))}/h → ${fmt(shopInc(s, l + 1))}/h` : `bringt ${fmt(s[4])}/h`}</small></div>
      <button class="btn ${l ? 'dark' : 'white'} sm" data-s="${s[0]}" ${lk ? 'disabled' : ''}>${l ? 'Ausbauen' : 'Kaufen'}<br><span class="num" style="font-size:13px">${fmt(c)}</span></button></div>`; }).join('')}`;
  $('#back', el).onclick = () => go('spiele');
  $('#col', el).onclick = () => { collectShops(); renderImperium(el); };
  el.onclick = e => {
    const b = e.target.closest('[data-s]'); if (!b) return; const s = SHOPS.find(x => x[0] === b.dataset.s), l = S.shops[s[0]] || 0, c = shopCost(s, l);
    if (S.bal < c) { toast(`Dafür brauchst du ${fmt(c)} Guthaben (Dispo zählt nicht).`, 'bad'); SND.err(); return; }
    collectShops(true);
    S.bal = r2(S.bal - c); S.shops[s[0]] = l + 1; SND.big(); FX.burst(70); toast(l ? `${s[1]} auf Stufe ${l + 1} ausgebaut! 📈` : `${s[1]} gekauft! ${s[2]}`, 'good');
    hdr(true); checkAch(); save(); renderImperium(el);
  };
  pageTimer(() => { const b = $('#col', el); if (b) { const p = shopPending(); b.innerHTML = `Einsammeln<br>${fmt(p)}`; b.disabled = p <= 0; } }, 5000);
}
