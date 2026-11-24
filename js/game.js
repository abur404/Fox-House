const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
let W, H;
function resize() { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; }
window.addEventListener('resize', resize);
resize();

let AC = null;
function initAudio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (AC && AC.state == 'suspended') AC.resume();
}

function beep(f, d, type = 'square', v = 0.06, slide = 0) {
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, AC.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, AC.currentTime + d);
  g.gain.setValueAtTime(v, AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, AC.currentTime + d);
  o.connect(g); g.connect(AC.destination);
  o.start(); o.stop(AC.currentTime + d);
}

function sfx(n) {
  if (!AC) return;
  if (n == 'shoot') beep(850, 0.06, 'square', 0.05, 200);
  if (n == 'hit') beep(320, 0.06, 'sawtooth', 0.07, 120);
  if (n == 'build') beep(620, 0.12, 'triangle', 0.1, 980);
  if (n == 'kill') { beep(500, 0.12, 'square', 0.1, 100); setTimeout(() => beep(900, 0.15, 'square', 0.1, 1300), 70); }
  if (n == 'vault') [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'sine', 0.1), i * 100));
  if (n == 'win') [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => beep(f, 0.25, 'sine', 0.12), i * 130));
}

const skins = [
  { name: 'Default', emoji: '🦸', body: '#1565c0', trim: '#42a5f5', helmet: '#263238', visor: '#00e5ff', cape: '#d32f2f', glow: 'rgba(66,165,245,.45)' },
  { name: 'Gold King', emoji: '👑', body: '#ffb300', trim: '#fff59d', helmet: '#ff6f00', visor: '#ffffff', cape: '#b71c1c', glow: 'rgba(255,215,0,.65)' },
  { name: 'Ninja', emoji: '🥷', body: '#1c1c1c', trim: '#ff1744', helmet: '#0a0a0a', visor: '#ff1744', cape: '#880e4f', glow: 'rgba(255,23,68,.5)' },
  { name: 'Army', emoji: '🪖', body: '#33691e', trim: '#8bc34a', helmet: '#1b5e20', visor: '#ffd54f', cape: '#4e342e', glow: 'rgba(139,195,74,.45)' },
  { name: 'Cyber', emoji: '🤖', body: '#00838f', trim: '#00e5ff', helmet: '#004d40', visor: '#76ff03', cape: '#311b92', glow: 'rgba(0,229,255,.65)' },
];
let curSkin = skins[0];
const skinRow = document.getElementById('skinRow');
skins.forEach((s, i) => {
  const b = document.createElement('button');
  b.className = 'skin' + (i == 0 ? ' active' : '');
  b.innerHTML = `${s.emoji} ${s.name}`;
  b.onclick = () => {
    curSkin = s;
    document.querySelectorAll('.skin').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById('skinName').innerText = s.name;
  };
  skinRow.appendChild(b);
});

let started = false, editOnlyMode = false, gameOver = false, keys = {}, joy = { x: 0, y: 0 }, aim = { x: 0, y: -1 };
let hp = 100, shield = 0, gold = 400, kills = 0, time = 180, hasLoot = false, curClass = 'Breaker';
let invisibleUntil = 0, shieldUntil = 0, shake = 0, buildMode = false, selectedBuild = 'tower';

const WORLD = { w: 1900, h: 2550 }, CX = 950, ECY = 780, MCY = 1980;
const wallR = 490, vaultR = 105, myWallR = 355, myVaultR = 78;

const p = { x: CX, y: MCY + 160, r: 18, speed: 5.7, vx: 0, vy: 0, runPhase: 0, jump: 0, recoil: 0 };
const bullets = [], enemyBullets = [], particles = [], floatTexts = [], tracers = [], smokePuffs = [];
const trees = [], houses = [], mountains = [];

for (let i = 0; i < 90; i++) {
  const x = 120 + Math.random() * (WORLD.w - 240), y = 120 + Math.random() * (WORLD.h - 240);
  if (Math.hypot(x - CX, y - ECY) > wallR + 105 && Math.hypot(x - CX, y - MCY) > myWallR + 80) {
    trees.push({ x, y, r: 14 + Math.random() * 9, h: 13 + Math.random() * 8 });
  }
}
for (let i = 0; i < 10; i++) {
  const a = Math.random() * Math.PI * 2, r = wallR + 150 + Math.random() * 120;
  const x = CX + Math.cos(a) * r, y = ECY + Math.sin(a) * r;
  if (y < MCY - myWallR - 95) houses.push({ x, y, w: 52, h: 42 });
}
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2;
  const x = CX + Math.cos(a) * 780, y = ECY + Math.sin(a) * 780;
  if (y < MCY - myWallR - 105) mountains.push({ x, y, r: 72 + Math.random() * 26 });
}

const gates = [
  { a: Math.PI / 2, x: CX, y: ECY + wallR, hp: 80, max: 80 },
  { a: -Math.PI / 2, x: CX, y: ECY - wallR, hp: 50, max: 50 },
  { a: 0, x: CX + wallR, y: ECY, hp: 50, max: 50 },
  { a: Math.PI, x: CX - wallR, y: ECY, hp: 50, max: 50 },
];
const vault = { x: CX, y: ECY, open: 0 };
const guards = [], enemies = [];
for (let i = 0; i < 10; i++) {
  const a = Math.random() * Math.PI * 2, r = 160 + Math.random() * 260;
  guards.push({ x: CX + Math.cos(a) * r, y: ECY + Math.sin(a) * r, hp: 32, max: 32, dx: (Math.random() - 0.5) * 1.3, dy: (Math.random() - 0.5) * 1.3 });
}
for (let i = 0; i < 8; i++) {
  const a = Math.random() * Math.PI * 2, r = wallR + 80 + Math.random() * 140;
  enemies.push({ name: ['Sakib', 'Tamim', 'Rahim', 'Karim', 'Arif', 'Fahim', 'Joy', 'Rafi'][i], x: CX + Math.cos(a) * r, y: ECY + Math.sin(a) * r, hp: 55, max: 55, speed: 1.8, shootCd: 40 });
}

function pushKillFeed(txt) {
  const box = document.getElementById('killFeed');
  const d = document.createElement('div');
  d.className = 'kitem';
  d.innerText = txt;
  box.prepend(d);
  setTimeout(() => d.remove(), 2600);
}

let timerStarted = false;
function startGame(isEdit) {
  initAudio();
  document.getElementById('lobby').style.display = 'none';
  started = true;
  editOnlyMode = !!isEdit;
  if (!timerStarted) {
    timerStarted = true;
    setInterval(() => {
      if (started && !gameOver && !editOnlyMode && time > 0) {
        time--;
        document.getElementById('time').innerText = time;
        const facs = myItems.filter(it => it.type === 'factory');
        if (facs.length > 0) {
          const earned = facs.length * 15;
          gold += earned;
          document.getElementById('gold').innerText = gold;
          facs.forEach(f => addFloat(CX + f.dx, MCY + f.dy - 18, '+15💰', '#ffd700'));
        }
        myItems.filter(it => it.type === 'fountain').forEach(fn => {
          if (Math.hypot(p.x - (CX + fn.dx), p.y - (MCY + fn.dy)) < 90 && hp < 100) {
            hp = Math.min(100, hp + 6);
            document.getElementById('hp').innerText = Math.floor(hp);
            document.getElementById('hpFill').style.width = hp + '%';
            addFloat(p.x, p.y - 20, '+6 ❤️', '#00ff88');
          }
        });
        if (time == 0) endGame(false);
      }
    }, 1000);
  }
  if (!isEdit) showMsg('🏰 উত্তরে শত্রু রাজ্যে যাও! লাল ভল্ট ভেঙে গোল্ড নিজের রাজ্যে আনো!');
}

function setClass(c, el) {
  curClass = c;
  document.querySelectorAll('.cbtn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  showMsg(c + ' সিলেক্ট!');
}

function showMsg(t) { document.getElementById('msg').innerText = t; }
function showCenter(t) {
  const e = document.getElementById('center');
  e.innerText = t; e.style.display = 'block';
  setTimeout(() => e.style.display = 'none', 1000);
}
function addFloat(x, y, t, color) { floatTexts.push({ x, y, t, color, life: 50 }); }

function useSkill() {
  if (hudEditMode || didDrag || !started || gameOver) return;
  beep(600, 0.2, 'sine', 0.1, 1200);
  if (curClass == 'Breaker') {
    gates.forEach(g => { if (Math.hypot(p.x - g.x, p.y - g.y) < 200) g.hp -= 60; });
    guards.forEach(g => { if (Math.hypot(p.x - g.x, p.y - g.y) < 200) g.hp -= 40; });
    shake = 8; showMsg('🔨 ROCKET PUNCH! গেট ভেঙে গেছে!');
  }
  if (curClass == 'Ghost') { invisibleUntil = Date.now() + 5000; showMsg('👻 5s Invisible!'); }
  if (curClass == 'Guardian') { shield = 60; shieldUntil = Date.now() + 8000; showMsg('🛡️ Shield Wall!'); }
  if (curClass == 'Hunter') { [...guards, ...enemies].forEach(g => { if (Math.hypot(p.x - g.x, p.y - g.y) < 500) g.hp -= 30; }); showMsg('🎯 Sniper!'); }
}

function findTarget() {
  const all = [...guards.filter(g => g.hp > 0), ...enemies.filter(e => e.hp > 0), ...gates.filter(g => g.hp > 0)];
  let best = null, bd = 500;
  all.forEach(t => { const d = Math.hypot(p.x - t.x, p.y - t.y); if (d < bd) { bd = d; best = t; } });
  return best;
}

function shoot() {
  if (hudEditMode || didDrag || !started || gameOver) return;
  const tgt = findTarget();
  if (tgt) { const d = Math.hypot(tgt.x - p.x, tgt.y - p.y); aim.x = (tgt.x - p.x) / d; aim.y = (tgt.y - p.y) / d; }
  sfx('shoot');
  const dmg = curClass == 'Hunter' ? 28 : curClass == 'Breaker' ? 20 : 14;
  p.recoil = 6; shake = Math.max(shake, 1.5);
  const mx = p.x + aim.x * 32, my = p.y + aim.y * 32;
  tracers.push({ x1: p.x, y1: p.y, x2: p.x + aim.x * 190, y2: p.y + aim.y * 190, life: 5 });
  bullets.push({ x: mx, y: my, dx: aim.x * 16, dy: aim.y * 16, dmg: dmg, life: 45 });
  particles.push({ x: mx, y: my, vx: 0, vy: 0, life: 4, color: '#FFEB3B', big: true });
}

function endGame(win) {
  gameOver = true;
  if (win) sfx('win');
  showMsg(win ? `🏆 নিজের ভল্টে লুট জমা হয়েছে! মোট ${gold} GOLD!` : '💀 হেরে গেছো!');
  showCenter(win ? '🏆 KINGDOM VICTORY!' : '💀 DEFEAT');
  setTimeout(() => { if (confirm('আবার খেলবা?')) location.reload(); }, 1000);
}

function takeDamage(d) {
  if (Date.now() < shieldUntil) d = Math.ceil(d / 2);
  if (shield > 0) { shield -= d; if (shield < 0) { hp += shield; shield = 0; } }
  else hp -= d;
  hp = Math.max(0, hp);
  document.getElementById('hp').innerText = Math.floor(hp);
  document.getElementById('hpFill').style.width = hp + '%';
  if (hp <= 0) endGame(false);
}

document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = 1;
  if (e.code == 'Space') { e.preventDefault(); shoot(); }
  if (e.key.toLowerCase() == 'q') useSkill();
  if (e.key.toLowerCase() == 'b') toggleBuildMode();
  if (e.key === '=' || e.key === '+') changeZoom(0.15);
  if (e.key === '-') changeZoom(-0.15);
});
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = 0; });

function update() {
  if (!started || gameOver) { draw(); requestAnimationFrame(update); return; }

  let mx = 0, my = 0;
  if (keys['w']) my -= 1; if (keys['s']) my += 1; if (keys['a']) mx -= 1; if (keys['d']) mx += 1;
  if (!hudEditMode && (Math.abs(joy.x) > 0.08 || Math.abs(joy.y) > 0.08)) { mx = joy.x; my = joy.y; }
  const len = Math.hypot(mx, my);
  if (len > 0) { mx /= len; my /= len; }
  p.vx = mx * p.speed; p.vy = my * p.speed;
  const nx = p.x + p.vx, ny = p.y + p.vy;

  const distToEnemyCenter = Math.hypot(nx - CX, ny - ECY);
  let blocked = false;
  if (Math.abs(distToEnemyCenter - wallR) < 18) {
    const nearOpenGate = gates.some(g => g.hp <= 0 && Math.hypot(nx - g.x, ny - g.y) < 60);
    const nearClosedGate = gates.some(g => g.hp > 0 && Math.hypot(nx - g.x, ny - g.y) < 55);
    if (!nearOpenGate && !nearClosedGate) {
      if (Math.hypot(p.x - CX, p.y - ECY) < wallR && distToEnemyCenter > wallR) blocked = true;
      if (Math.hypot(p.x - CX, p.y - ECY) > wallR && distToEnemyCenter < wallR) blocked = true;
    }
    if (nearClosedGate) blocked = true;
  }

  const distToMyCenter = Math.hypot(nx - CX, ny - MCY);
  if (Math.abs(distToMyCenter - myWallR) < 16) {
    const nearMyGate = (Math.abs(nx - CX) < 44 && ny < MCY);
    if (!nearMyGate) {
      if (Math.hypot(p.x - CX, p.y - MCY) < myWallR && distToMyCenter > myWallR) blocked = true;
      if (Math.hypot(p.x - CX, p.y - MCY) > myWallR && distToMyCenter < myWallR) blocked = true;
    }
  }

  if (!blocked) { p.x = nx; p.y = ny; }
  p.x = Math.max(20, Math.min(WORLD.w - 20, p.x));
  p.y = Math.max(20, Math.min(WORLD.h - 20, p.y));
  if (Math.abs(p.vx) + Math.abs(p.vy) > 0.5) p.runPhase += 0.3;
  if (p.jump > 0) p.jump -= 1;
  if (p.recoil > 0) p.recoil -= 0.6;

  const dEnemy = Math.hypot(p.x - CX, p.y - ECY);
  const dMy = Math.hypot(p.x - CX, p.y - MCY);
  document.getElementById('layer').innerText = dMy < myWallR ? '👑 আমার রাজ্য' : dEnemy < vaultR + 25 ? '💰 শত্রু ভল্ট' : dEnemy < wallR ? '🏰 শত্রু রাজ্য' : '🌲 যুদ্ধক্ষেত্র';

  myItems.forEach(it => {
    const tx = CX + it.dx, ty = MCY + it.dy;
    if (it.type === 'tower') {
      if (it.cd > 0) { it.cd--; return; }
      const target = [...enemies.filter(e => e.hp > 0), ...guards.filter(g => g.hp > 0)].find(t => Math.hypot(t.x - tx, t.y - ty) < 390);
      if (target) {
        const d = Math.hypot(target.x - tx, target.y - ty) || 1;
        bullets.push({ x: tx, y: ty - 24, dx: (target.x - tx) / d * 15, dy: (target.y - ty) / d * 15, dmg: 18, life: 32 });
        tracers.push({ x1: tx, y1: ty - 24, x2: target.x, y2: target.y, life: 4 });
        it.cd = 35;
      }
    } else if (it.type === 'factory' && Math.random() < 0.05) {
      smokePuffs.push({ x: tx + 13, y: ty - 36, r: 5, life: 38 });
    }
  });

  smokePuffs.forEach((sp, i) => { sp.y -= 0.7; sp.x += 0.25; sp.r += 0.15; sp.life--; if (sp.life <= 0) smokePuffs.splice(i, 1); });

  bullets.forEach((b, bi) => {
    b.x += b.dx; b.y += b.dy; b.life--;
    if (b.life <= 0) bullets.splice(bi, 1);
    gates.forEach(g => {
      if (g.hp > 0 && Math.hypot(b.x - g.x, b.y - g.y) < 38) {
        g.hp -= curClass == 'Breaker' ? b.dmg * 2 : b.dmg;
        addFloat(g.x, g.y, '-' + b.dmg, 'white');
        bullets.splice(bi, 1);
        if (g.hp <= 0) { showMsg('✅ শত্রুর গেট ভেঙেছে! ভিতরে ঢোকো!'); sfx('vault'); }
      }
    });
    guards.forEach(g => {
      if (g.hp > 0 && Math.hypot(b.x - g.x, b.y - g.y) < 22) {
        g.hp -= b.dmg; sfx('hit'); addFloat(g.x, g.y, '-' + b.dmg, '#ffeb3b'); bullets.splice(bi, 1);
        if (g.hp <= 0) { kills++; document.getElementById('kills').innerText = kills; sfx('kill'); showCenter('🔥 KILL!'); pushKillFeed('YOU eliminated Guard'); }
      }
    });
    enemies.forEach(e => {
      if (e.hp > 0 && Math.hypot(b.x - e.x, b.y - e.y) < 22) {
        e.hp -= b.dmg; sfx('hit'); addFloat(e.x, e.y, '-' + b.dmg, '#ffeb3b'); bullets.splice(bi, 1);
        if (e.hp <= 0) { kills++; document.getElementById('kills').innerText = kills; sfx('kill'); showCenter('🔥 KILL!'); pushKillFeed('YOU eliminated ' + e.name); }
      }
    });
    if (Math.hypot(b.x - CX, b.y - ECY) < 80) {
      const alive = guards.filter(g => g.hp > 0).length;
      if (alive == 0) {
        vault.open += 3; bullets.splice(bi, 1);
        if (vault.open >= 100 && !hasLoot) {
          hasLoot = true; gold += 1000; document.getElementById('gold').innerText = gold;
          sfx('vault'); showCenter('💰 VAULT LOOTED!');
          showMsg('👑 ১০০০ গোল্ড লুট! দক্ষিণে তোমার রাজ্যের লাল ভল্টে জমা দাও!');
        }
      }
    }
  });

  guards.forEach(g => {
    if (g.hp <= 0) return;
    g.x += g.dx; g.y += g.dy;
    const dc = Math.hypot(g.x - CX, g.y - ECY);
    if (dc < 140 || dc > wallR - 30) { g.dx *= -1; g.dy *= -1; }
    if (Date.now() > invisibleUntil && Math.hypot(p.x - g.x, p.y - g.y) < 240 && Math.random() < 0.02) {
      const d = Math.hypot(p.x - g.x, p.y - g.y);
      enemyBullets.push({ x: g.x, y: g.y, dx: (p.x - g.x) / d * 5, dy: (p.y - g.y) / d * 5 });
    }
  });

  enemies.forEach(e => {
    if (e.hp <= 0) return;
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (d > 120) { e.x += dx / d * e.speed; e.y += dy / d * e.speed; }
    if (Date.now() > invisibleUntil && d < 300) {
      e.shootCd--;
      if (e.shootCd <= 0) { e.shootCd = 60; enemyBullets.push({ x: e.x, y: e.y, dx: dx / d * 6, dy: dy / d * 6 }); }
    }
  });

  enemyBullets.forEach((b, bi) => {
    b.x += b.dx; b.y += b.dy;
    if (Math.hypot(b.x - p.x, b.y - p.y) < 18) { takeDamage(4); enemyBullets.splice(bi, 1); }
    if (b.x < 0 || b.x > WORLD.w || b.y < 0 || b.y > WORLD.h) enemyBullets.splice(bi, 1);
  });

  if (hasLoot && Math.hypot(p.x - CX, p.y - MCY) < myVaultR + 15) endGame(true);

  particles.forEach((pt, i) => { pt.life--; if (pt.life <= 0) particles.splice(i, 1); });
  floatTexts.forEach((f, i) => { f.y -= 1; f.life--; if (f.life <= 0) floatTexts.splice(i, 1); });
  tracers.forEach((t, i) => { t.life--; if (t.life <= 0) tracers.splice(i, 1); });
  document.getElementById('hp').innerText = Math.floor(hp);
  draw();
  requestAnimationFrame(update);
}

draw();
update();
