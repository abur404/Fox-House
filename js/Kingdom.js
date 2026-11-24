const defaultLayout = {
  items: [
    { type: 'tower', dx: -230, dy: -220, cd: 0 },
    { type: 'tower', dx: 230, dy: -220, cd: 0 },
    { type: 'tower', dx: -280, dy: 40, cd: 0 },
    { type: 'tower', dx: 280, dy: 40, cd: 0 },
    { type: 'factory', dx: -115, dy: -115, cd: 0 },
    { type: 'factory', dx: 115, dy: -115, cd: 0 },
    { type: 'camp', dx: 140, dy: 115, cd: 0 },
    { type: 'camp', dx: 205, dy: 105, cd: 0 },
    { type: 'fountain', dx: -150, dy: 105, cd: 0 }
  ]
};

let savedLayout = JSON.parse(localStorage.getItem('vaultfall_kingdom_free_v1') || 'null');
let myItems = (savedLayout && Array.isArray(savedLayout.items))
  ? savedLayout.items.map(it => ({ ...it, cd: 0 }))
  : defaultLayout.items.map(it => ({ ...it }));

function saveMyKingdom() {
  localStorage.setItem('vaultfall_kingdom_free_v1', JSON.stringify({
    items: myItems.map(it => ({ type: it.type, dx: it.dx, dy: it.dy }))
  }));
}

function enterKingdomEditor() {
  startGame(true);
  buildMode = true;
  document.getElementById('buildToggle').classList.add('active');
  document.getElementById('buildDock').style.display = 'flex';
  document.getElementById('startRaidBtn').style.display = 'block';
  showMsg('🏗️ রাজ্যের ভিতরে যেখানে খুশি বসাও বা বসিয়ে রাখা জিনিস টেনে সরাও!');
}

function startRaidFromEdit() {
  editOnlyMode = false;
  buildMode = false;
  movingItem = null;
  document.getElementById('buildToggle').classList.remove('active');
  document.getElementById('buildDock').style.display = 'none';
  document.getElementById('startRaidBtn').style.display = 'none';
  showMsg('⚔️ যুদ্ধ শুরু! উত্তরে শত্রু রাজ্যের লাল ভল্ট লুট করে নিজের রাজ্যে আনো!');
}

function toggleBuildMode() {
  if (hudEditMode || didDrag) return;
  buildMode = !buildMode;
  movingItem = null;
  document.getElementById('buildToggle').classList.toggle('active', buildMode);
  document.getElementById('buildDock').style.display = buildMode ? 'flex' : 'none';
  showMsg(buildMode ? '🏗️ যেকোনো জায়গায় বসাও বা স্থাপনা টেনে সরাও!' : '⚔️ ব্যাটল মোড চালু!');
}

function selectBuild(type, el) {
  selectedBuild = type;
  movingItem = null;
  document.querySelectorAll('.bitem').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
}

function screenToWorld(clientX, clientY) {
  const viewW = W / zoom, viewH = H / zoom;
  const camX = Math.max(0, Math.min(WORLD.w - viewW, p.x - viewW / 2));
  const camY = Math.max(0, Math.min(WORLD.h - viewH, p.y - viewH / 2));
  return { x: clientX / zoom + camX, y: clientY / zoom + camY };
}

const buildCost = { tower: 80, factory: 100, camp: 60, fountain: 50 };
let movingItem = null;

function clampToMyKingdom(dx, dy) {
  let d = Math.hypot(dx, dy);
  const maxR = myWallR - 26;
  if (d > maxR) { dx = dx / d * maxR; dy = dy / d * maxR; d = maxR; }
  if (d < myVaultR + 24) {
    const ang = Math.atan2(dy, dx) || 0.5;
    dx = Math.cos(ang) * (myVaultR + 24);
    dy = Math.sin(ang) * (myVaultR + 24);
  }
  return { dx, dy };
}

canvas.addEventListener('pointerdown', e => {
  if (hudEditMode || isPinching || !started || gameOver || !buildMode) return;
  const wPos = screenToWorld(e.clientX, e.clientY);
  const wx = wPos.x, wy = wPos.y;
  const dx = wx - CX, dy = wy - MCY;

  let hitIdx = -1;
  for (let i = myItems.length - 1; i >= 0; i--) {
    const it = myItems[i];
    if (Math.hypot(wx - (CX + it.dx), wy - (MCY + it.dy)) < 28) { hitIdx = i; break; }
  }

  if (selectedBuild === 'delete') {
    if (hitIdx >= 0) {
      const removed = myItems.splice(hitIdx, 1)[0];
      const refund = Math.floor((buildCost[removed.type] || 50) * 0.75);
      gold += refund;
      document.getElementById('gold').innerText = gold;
      saveMyKingdom();
      sfx('hit');
      addFloat(CX + removed.dx, MCY + removed.dy - 14, `+${refund}💰`, '#ff8a80');
    }
    return;
  }

  if (hitIdx >= 0) {
    movingItem = myItems[hitIdx];
    canvas.setPointerCapture(e.pointerId);
    return;
  }

  if (Math.hypot(dx, dy) > myWallR - 10) {
    showMsg('⚠️ রাজ্যের প্রাচীরের ভিতরে যেকোনো জায়গায় বসাও!');
    return;
  }
  if (Math.hypot(dx, dy) < myVaultR + 22) {
    showMsg('⚠️ ভল্টের ঠিক মাঝখানে না বসিয়ে চারপাশে যেকোনো জায়গায় বসাও!');
    return;
  }

  const cost = buildCost[selectedBuild] || 60;
  if (gold < cost) { showMsg(`⚠️ পর্যাপ্ত গোল্ড নেই! (${cost} গোল্ড লাগবে)`); return; }

  const clamped = clampToMyKingdom(dx, dy);
  gold -= cost;
  document.getElementById('gold').innerText = gold;
  const newIt = { type: selectedBuild, dx: clamped.dx, dy: clamped.dy, cd: 0 };
  myItems.push(newIt);
  movingItem = newIt;
  canvas.setPointerCapture(e.pointerId);
  saveMyKingdom();
  sfx('build');
  addFloat(CX + clamped.dx, MCY + clamped.dy - 18, 'PLACED! টেনে সরাতে পারো', '#ffd700');
});

canvas.addEventListener('pointermove', e => {
  if (!movingItem || isPinching || !buildMode) return;
  const wPos = screenToWorld(e.clientX, e.clientY);
  const clamped = clampToMyKingdom(wPos.x - CX, wPos.y - MCY);
  movingItem.dx = clamped.dx;
  movingItem.dy = clamped.dy;
});

canvas.addEventListener('pointerup', () => {
  if (movingItem) { movingItem = null; saveMyKingdom(); }
});
