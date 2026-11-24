function drawProPlayer(px, py) {
  const isInv = Date.now() < invisibleUntil;
  ctx.save();
  ctx.globalAlpha = isInv ? 0.35 : 1;
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath(); ctx.ellipse(px, py + p.jump + 17, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = curSkin.glow; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(px, py + p.jump + 17, 22, 9, 0, 0, Math.PI * 2); ctx.stroke();

  const capeWave = Math.sin(p.runPhase * 0.8) * 3;
  ctx.fillStyle = curSkin.cape;
  ctx.beginPath();
  ctx.moveTo(px - 11, py - 4); ctx.lineTo(px + 11, py - 4);
  ctx.lineTo(px + 14 + capeWave, py + 16); ctx.lineTo(px - 14 + capeWave, py + 16);
  ctx.closePath(); ctx.fill();

  const legOff = (Math.abs(p.vx) + Math.abs(p.vy) > 1) ? Math.sin(p.runPhase) * 5 : 0;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(px - 10, py + 9 + legOff, 7, 10);
  ctx.fillRect(px + 3, py + 9 - legOff, 7, 10);
  ctx.fillStyle = curSkin.trim;
  ctx.fillRect(px - 11, py + 16 + legOff, 9, 4);
  ctx.fillRect(px + 2, py + 16 - legOff, 9, 4);

  ctx.fillStyle = curSkin.body;
  ctx.beginPath(); ctx.roundRect(px - 14, py - 8, 28, 22, 8); ctx.fill();
  ctx.strokeStyle = curSkin.trim; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(px - 14, py - 8, 28, 22, 8); ctx.stroke();
  ctx.fillStyle = curSkin.visor;
  ctx.beginPath(); ctx.arc(px, py + 2, 4.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = curSkin.helmet;
  ctx.beginPath(); ctx.arc(px - 15, py - 4, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 15, py - 4, 6.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#ffcc80';
  ctx.beginPath(); ctx.arc(px, py - 13, 9.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = curSkin.helmet;
  ctx.beginPath(); ctx.arc(px, py - 15, 11, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = curSkin.visor; ctx.shadowColor = curSkin.visor; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.roundRect(px - 8, py - 15, 16, 5, 2.5); ctx.fill();
  ctx.shadowBlur = 0;

  if (curSkin.name == 'Gold King') {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(px - 8, py - 23); ctx.lineTo(px - 4, py - 29); ctx.lineTo(px, py - 24);
    ctx.lineTo(px + 4, py - 29); ctx.lineTo(px + 8, py - 23);
    ctx.closePath(); ctx.fill();
  }

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(Math.atan2(aim.y, aim.x));
  ctx.translate(-p.recoil * 0.35, 0);
  ctx.fillStyle = '#1c1c1c'; ctx.fillRect(10, -3.5, 30, 7);
  ctx.fillStyle = curSkin.trim; ctx.fillRect(12, -4.5, 10, 9);
  ctx.fillStyle = '#ffd700'; ctx.fillRect(34, -2.5, 6, 5);
  if (p.recoil > 2) {
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath(); ctx.arc(46, 0, 9, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  if (Date.now() < shieldUntil) {
    ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(px, py - 2, 26, 0, Math.PI * 2); ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.beginPath(); ctx.roundRect(px - 42, py + 24, 84, 15, 6); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '700 10px Outfit'; ctx.textAlign = 'center';
  ctx.fillText(hasLoot ? '💰 LOOT CARRY' : 'YOU • ' + curClass, px, py + 34);
  ctx.restore();
}

function draw25DStructure(it, sx, sy) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(sx + 3, sy + 12, 22, 9, 0, 0, Math.PI * 2); ctx.fill();

  if (it.type === 'tower') {
    ctx.fillStyle = '#607d8b'; ctx.fillRect(sx - 14, sy - 26, 28, 36);
    ctx.fillStyle = '#90a4ae'; ctx.fillRect(sx - 12, sy - 26, 12, 36);
    ctx.fillStyle = '#cfd8dc'; ctx.fillRect(sx - 17, sy - 32, 34, 7);
    ctx.fillStyle = '#ffd700'; ctx.fillRect(sx - 2, sy - 44, 4, 12);
    ctx.fillStyle = '#e53935';
    ctx.beginPath(); ctx.moveTo(sx + 2, sy - 44); ctx.lineTo(sx + 14, sy - 40); ctx.lineTo(sx + 2, sy - 36); ctx.closePath(); ctx.fill();
  } else if (it.type === 'factory') {
    ctx.fillStyle = '#455a64'; ctx.fillRect(sx - 24, sy - 16, 48, 28);
    ctx.fillStyle = '#d84315';
    ctx.beginPath(); ctx.moveTo(sx - 26, sy - 16); ctx.lineTo(sx - 12, sy - 28); ctx.lineTo(sx + 2, sy - 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#78909c'; ctx.fillRect(sx + 8, sy - 34, 10, 18);
    ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(sx - 10, sy + 8, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '900 7.5px Outfit'; ctx.fillText('+15💰', sx - 18, sy - 2);
  } else if (it.type === 'camp') {
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath(); ctx.moveTo(sx, sy - 22); ctx.lineTo(sx + 20, sy + 6); ctx.lineTo(sx - 20, sy + 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#4e342e';
    ctx.beginPath(); ctx.moveTo(sx, sy - 10); ctx.lineTo(sx + 7, sy + 6); ctx.lineTo(sx - 7, sy + 6); ctx.closePath(); ctx.fill();
  } else if (it.type === 'fountain') {
    ctx.fillStyle = '#66bb6a'; ctx.beginPath(); ctx.ellipse(sx, sy + 4, 24, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eceff1'; ctx.beginPath(); ctx.ellipse(sx, sy + 2, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#00b0ff'; ctx.beginPath(); ctx.ellipse(sx, sy + 1, 10, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ['#ff4081', '#ffeb3b', '#ff6e40'].forEach((c, idx) => {
      const a = idx * 2.1;
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx + Math.cos(a) * 17, sy + 3 + Math.sin(a) * 9, 3.5, 0, Math.PI * 2); ctx.fill();
    });
  }

  if (movingItem === it) {
    ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(sx, sy - 4, 26, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  const viewW = W / zoom, viewH = H / zoom;
  const cam = {
    x: Math.max(0, Math.min(WORLD.w - viewW, p.x - viewW / 2)),
    y: Math.max(0, Math.min(WORLD.h - viewH, p.y - viewH / 2))
  };
  const shX = (Math.random() - 0.5) * shake, shY = (Math.random() - 0.5) * shake;
  if (shake > 0) shake *= 0.85;

  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(shX, shY);

  const bg = ctx.createLinearGradient(0, 0, 0, viewH);
  bg.addColorStop(0, '#66bb6a'); bg.addColorStop(1, '#2e7d32');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, viewW, viewH);

  ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 26;
  ctx.beginPath(); ctx.moveTo(CX - cam.x, MCY - myWallR - cam.y); ctx.lineTo(CX - cam.x, ECY + wallR - cam.y); ctx.stroke();
  ctx.strokeStyle = '#a1887f'; ctx.lineWidth = 4; ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(CX - cam.x, MCY - myWallR - cam.y); ctx.lineTo(CX - cam.x, ECY + wallR - cam.y); ctx.stroke();
  ctx.setLineDash([]);

  mountains.forEach(m => {
    const sx = m.x - cam.x, sy = m.y - cam.y;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(sx, sy + m.r * 0.62, m.r * 1.05, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#546e7a'; ctx.beginPath(); ctx.moveTo(sx - m.r, sy + m.r * 0.6); ctx.lineTo(sx, sy - m.r); ctx.lineTo(sx, sy + m.r * 0.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#90a4ae'; ctx.beginPath(); ctx.moveTo(sx, sy - m.r); ctx.lineTo(sx + m.r, sy + m.r * 0.6); ctx.lineTo(sx, sy + m.r * 0.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(sx - 18, sy - m.r + 22); ctx.lineTo(sx, sy - m.r); ctx.lineTo(sx + 18, sy - m.r + 22); ctx.lineTo(sx, sy - m.r + 12); ctx.closePath(); ctx.fill();
  });

  ctx.strokeStyle = '#0277bd'; ctx.lineWidth = 32; ctx.beginPath(); ctx.arc(CX - cam.x, ECY - cam.y, wallR + 110, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(CX - cam.x, ECY - cam.y, wallR + 110, 0, Math.PI * 2); ctx.stroke();
  [0.7, 2.4, 3.9, 5.5].forEach(ang => {
    const bx = CX + Math.cos(ang) * (wallR + 110) - cam.x, by = ECY + Math.sin(ang) * (wallR + 110) - cam.y;
    ctx.fillStyle = '#8d6e63'; ctx.fillRect(bx - 18, by - 12, 36, 24);
  });

  houses.forEach(h => {
    const sx = h.x - cam.x, sy = h.y - cam.y;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(sx + 4, sy + 6, h.w, h.h);
    ctx.fillStyle = '#efebe9'; ctx.fillRect(sx, sy, h.w, h.h);
    ctx.fillStyle = '#ff8f00'; ctx.beginPath(); ctx.moveTo(sx - 6, sy); ctx.lineTo(sx + h.w / 2, sy - 20); ctx.lineTo(sx + h.w + 6, sy); ctx.closePath(); ctx.fill();
  });

  trees.forEach(t => {
    const sx = t.x - cam.x, sy = t.y - cam.y;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(sx + 4, sy + t.r * 0.7, t.r * 0.9, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b5e20'; ctx.beginPath(); ctx.arc(sx, sy, t.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#43a047'; ctx.beginPath(); ctx.arc(sx - 4, sy - t.h * 0.45, t.r * 0.62, 0, Math.PI * 2); ctx.fill();
  });

  ctx.fillStyle = '#fffdf5'; ctx.beginPath(); ctx.arc(CX - cam.x, ECY - cam.y, wallR, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 32; ctx.beginPath(); ctx.arc(CX - cam.x, ECY - cam.y, wallR - 20, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#78909c'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(CX - cam.x, ECY - cam.y, wallR, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = 'rgba(229,57,53,.22)'; ctx.beginPath(); ctx.arc(CX - cam.x, ECY - cam.y, vaultR + 20, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e53935'; ctx.lineWidth = 13; ctx.beginPath(); ctx.arc(CX - cam.x, ECY - cam.y, vaultR + 16, 0, Math.PI * 2); ctx.stroke();
  ctx.save(); ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 22;
  ctx.fillStyle = vault.open >= 100 ? '#ffd700' : '#f5f5f5'; ctx.fillRect(CX - 52 - cam.x, ECY - 45 - cam.y, 104, 90); ctx.restore();
  ctx.fillStyle = '#8d6e63'; ctx.fillRect(CX - 56 - cam.x, ECY - 52 - cam.y, 112, 12);
  ctx.fillStyle = '#ffd700'; ctx.font = '900 11px Outfit'; ctx.fillText(vault.open >= 100 ? '💰 LOOTED' : '🔒 ENEMY VAULT', CX - 44 - cam.x, ECY + 4 - cam.y);
  if (vault.open > 0 && vault.open < 100) { ctx.fillStyle = '#ffd700'; ctx.fillRect(CX - 52 - cam.x, ECY - 60 - cam.y, 104 * (vault.open / 100), 6); }

  gates.forEach((g, i) => {
    const gx = g.x - cam.x, gy = g.y - cam.y;
    if (g.hp > 0) {
      if (i == 0) {
        ctx.fillStyle = '#e53935'; ctx.fillRect(gx - 35, gy - 22, 70, 10); ctx.fillRect(gx - 30, gy - 12, 60, 8);
        ctx.fillStyle = '#8e0000'; ctx.fillRect(gx - 28, gy - 12, 8, 32); ctx.fillRect(gx + 20, gy - 12, 8, 32);
        ctx.fillStyle = '#fff'; ctx.font = '700 10px sans-serif'; ctx.fillText('GATE ' + Math.ceil(g.hp), gx - 24, gy + 34);
      } else {
        ctx.fillStyle = '#bdbdbd'; ctx.fillRect(gx - 28, gy - 16, 56, 32);
      }
    } else {
      ctx.fillStyle = '#00e676'; ctx.font = '700 11px sans-serif'; ctx.fillText('✓ OPEN', gx - 18, gy + 5);
    }
  });

  ctx.fillStyle = '#fffef5'; ctx.beginPath(); ctx.arc(CX - cam.x, MCY - cam.y, myWallR, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ff8f00'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(CX - cam.x, MCY - cam.y, myWallR - 16, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(CX - cam.x, MCY - cam.y, myWallR - 26, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 20; ctx.beginPath(); ctx.arc(CX - cam.x, MCY - cam.y, myWallR, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(CX - cam.x, MCY - cam.y, myWallR - 4, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = '#fffef5'; ctx.fillRect(CX - 44 - cam.x, MCY - myWallR - 18 - cam.y, 88, 36);
  ctx.fillStyle = '#d32f2f'; ctx.fillRect(CX - 42 - cam.x, MCY - myWallR - 26 - cam.y, 84, 8);
  ctx.fillStyle = '#b71c1c'; ctx.fillRect(CX - 34 - cam.x, MCY - myWallR - 18 - cam.y, 9, 34); ctx.fillRect(CX + 25 - cam.x, MCY - myWallR - 18 - cam.y, 9, 34);

  if (buildMode) {
    ctx.save(); ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(CX - cam.x, MCY - cam.y, myWallR - 10, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  myItems.forEach(it => {
    draw25DStructure(it, CX + it.dx - cam.x, MCY + it.dy - cam.y);
  });

  ctx.fillStyle = 'rgba(229,57,53,.2)'; ctx.beginPath(); ctx.arc(CX - cam.x, MCY - cam.y, myVaultR + 16, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e53935'; ctx.lineWidth = 11; ctx.beginPath(); ctx.arc(CX - cam.x, MCY - cam.y, myVaultR + 12, 0, Math.PI * 2); ctx.stroke();
  ctx.save();
  if (hasLoot) { ctx.shadowColor = '#00e676'; ctx.shadowBlur = 25; }
  ctx.fillStyle = '#fff8e1'; ctx.fillRect(CX - 44 - cam.x, MCY - 38 - cam.y, 88, 76);
  ctx.restore();
  ctx.fillStyle = '#ffb300'; ctx.fillRect(CX - 48 - cam.x, MCY - 45 - cam.y, 96, 11);
  ctx.fillStyle = '#111'; ctx.font = '900 10px Outfit'; ctx.textAlign = 'center';
  ctx.fillText('👑 MY VAULT', CX - cam.x, MCY - 2 - cam.y);
  ctx.fillStyle = hasLoot ? '#00c853' : '#e65100'; ctx.font = '700 9px sans-serif';
  ctx.fillText(hasLoot ? '✅ এখানে জমা দাও!' : '💰 ' + gold + ' GOLD', CX - cam.x, MCY + 14 - cam.y);
  ctx.textAlign = 'left';

  smokePuffs.forEach(sp => {
    ctx.fillStyle = `rgba(255,255,255,${sp.life / 40 * 0.55})`;
    ctx.beginPath(); ctx.arc(sp.x - cam.x, sp.y - cam.y, sp.r, 0, Math.PI * 2); ctx.fill();
  });

  guards.forEach(g => {
    if (g.hp <= 0) return;
    const sx = g.x - cam.x, sy = g.y - cam.y;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(sx, sy + 13, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b71c1c'; ctx.beginPath(); ctx.arc(sx, sy, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffccbc'; ctx.beginPath(); ctx.arc(sx, sy - 3, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(sx - 15, sy - 24, 30, 5);
    ctx.fillStyle = '#ff1744'; ctx.fillRect(sx - 15, sy - 24, 30 * (g.hp / g.max), 5);
  });

  enemies.forEach(e => {
    if (e.hp <= 0) return;
    const sx = e.x - cam.x, sy = e.y - cam.y;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(sx, sy + 13, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d84315'; ctx.beginPath(); ctx.arc(sx, sy, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx, sy - 3, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 10px sans-serif'; ctx.fillText(e.name, sx - 16, sy - 20);
  });

  drawProPlayer(p.x - cam.x, p.y - cam.y - p.jump);

  tracers.forEach(t => {
    const sx1 = t.x1 - cam.x, sy1 = t.y1 - cam.y, sx2 = t.x2 - cam.x, sy2 = t.y2 - cam.y;
    ctx.strokeStyle = 'rgba(255,235,59,.95)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(sx1, sy1); ctx.lineTo(sx2, sy2); ctx.stroke();
  });

  ctx.fillStyle = '#ffeb3b';
  bullets.forEach(b => { const sx = b.x - cam.x, sy = b.y - cam.y; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill(); });

  ctx.fillStyle = '#ff5252';
  enemyBullets.forEach(b => { const sx = b.x - cam.x, sy = b.y - cam.y; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill(); });

  particles.forEach(pt => {
    const sx = pt.x - cam.x, sy = pt.y - cam.y;
    ctx.fillStyle = pt.color; ctx.globalAlpha = pt.life / 20;
    ctx.beginPath(); ctx.arc(sx, sy, pt.big ? 10 : 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  });

  floatTexts.forEach(f => {
    const sx = f.x - cam.x, sy = f.y - cam.y;
    ctx.fillStyle = f.color; ctx.font = '900 13px Outfit'; ctx.fillText(f.t, sx, sy);
  });
  ctx.restore();

  const targetObj = hasLoot ? { x: CX, y: MCY } : { x: CX, y: ECY };
  const ang = Math.atan2(targetObj.y - p.y, targetObj.x - p.x);
  ctx.save();
  ctx.translate(W / 2 + Math.cos(ang) * 52, H / 2 + Math.sin(ang) * 52);
  ctx.rotate(ang);
  ctx.fillStyle = hasLoot ? '#00e676' : '#ffd700';
  ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -6); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 16, 0, Math.PI * 2); ctx.stroke();
}
