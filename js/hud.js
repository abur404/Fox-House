let hudEditMode = false;
const movableIds = ['joy', 'fire', 'skill', 'jump', 'buildToggle'];
let savedHud = JSON.parse(localStorage.getItem('vaultfall_hud_pos_v2') || '{}');

function applySavedHud() {
  movableIds.forEach(id => {
    const el = document.getElementById(id);
    if (savedHud[id]) {
      el.style.left = savedHud[id].left + 'px';
      el.style.top = savedHud[id].top + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    }
  });
}
applySavedHud();

function setHudEditState(active) {
  hudEditMode = active;
  document.getElementById('hudEditBtn').classList.toggle('active', hudEditMode);
  document.getElementById('hudResetBtn').style.display = hudEditMode ? 'inline-block' : 'none';
  movableIds.forEach(id => document.getElementById(id).classList.toggle('hudEditing', hudEditMode));
  joyEnd();
}

function toggleHudEdit() {
  setHudEditState(!hudEditMode);
  showMsg(hudEditMode ? '🎛️ বাটন চেপে ধরে টেনে বসাও! আবার HUD EDIT চাপলে সেভ হবে' : '✅ বাটনের নতুন পজিশন সেভ হয়েছে!');
}

function resetHudPositions() {
  localStorage.removeItem('vaultfall_hud_pos_v2');
  savedHud = {};
  movableIds.forEach(id => {
    const el = document.getElementById(id);
    el.style.left = '';
    el.style.top = '';
    el.style.right = '';
    el.style.bottom = '';
  });
  showMsg('↺ বাটনগুলো আগের জায়গায় রিসেট হয়েছে!');
}

let draggingEl = null, dragOffset = { x: 0, y: 0 }, pressTimer = null, didDrag = false;
movableIds.forEach(id => {
  const el = document.getElementById(id);
  function startDrag(cx, cy) {
    draggingEl = el;
    didDrag = true;
    const r = el.getBoundingClientRect();
    dragOffset.x = cx - r.left;
    dragOffset.y = cy - r.top;
  }
  function moveDrag(cx, cy) {
    if (draggingEl !== el) return;
    const r = el.getBoundingClientRect();
    const nx = Math.max(4, Math.min(W - r.width - 4, cx - dragOffset.x));
    const ny = Math.max(4, Math.min(H - r.height - 4, cy - dragOffset.y));
    el.style.left = nx + 'px';
    el.style.top = ny + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    savedHud[id] = { left: nx, top: ny };
  }
  function endDrag() {
    clearTimeout(pressTimer);
    if (draggingEl === el) {
      draggingEl = null;
      localStorage.setItem('vaultfall_hud_pos_v2', JSON.stringify(savedHud));
      setTimeout(() => { didDrag = false; }, 80);
    }
  }

  el.addEventListener('touchstart', e => {
    if (!e.touches[0]) return;
    const t = e.touches[0];
    if (hudEditMode) { e.preventDefault(); e.stopPropagation(); startDrag(t.clientX, t.clientY); }
    else { pressTimer = setTimeout(() => { setHudEditState(true); startDrag(t.clientX, t.clientY); showMsg('🎛️ ড্র্যাগ মোড চালু! টেনে বসাও'); }, 350); }
  }, { passive: false });

  el.addEventListener('touchmove', e => {
    if (!e.touches[0]) return;
    const t = e.touches[0];
    if (hudEditMode && draggingEl === el) { e.preventDefault(); e.stopPropagation(); moveDrag(t.clientX, t.clientY); }
    else clearTimeout(pressTimer);
  }, { passive: false });

  el.addEventListener('touchend', endDrag);
  el.addEventListener('touchcancel', endDrag);
  el.addEventListener('mousedown', e => { if (hudEditMode) { e.preventDefault(); e.stopPropagation(); startDrag(e.clientX, e.clientY); } });
});

window.addEventListener('mousemove', e => {
  if (hudEditMode && draggingEl) {
    const r = draggingEl.getBoundingClientRect();
    const nx = Math.max(4, Math.min(W - r.width - 4, e.clientX - dragOffset.x));
    const ny = Math.max(4, Math.min(H - r.height - 4, e.clientY - dragOffset.y));
    draggingEl.style.left = nx + 'px';
    draggingEl.style.top = ny + 'px';
    draggingEl.style.right = 'auto';
    draggingEl.style.bottom = 'auto';
    savedHud[draggingEl.id] = { left: nx, top: ny };
  }
});

window.addEventListener('mouseup', () => {
  if (draggingEl) {
    draggingEl = null;
    localStorage.setItem('vaultfall_hud_pos_v2', JSON.stringify(savedHud));
    setTimeout(() => { didDrag = false; }, 80);
  }
});

const joyEl = document.getElementById('joy'), knob = document.getElementById('knob');
function joyMove(e) {
  if (hudEditMode) return;
  const t = e.touches ? e.touches[0] : e;
  const r = joyEl.getBoundingClientRect();
  let dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2);
  const len = Math.hypot(dx, dy), max = 36;
  if (len > max) { dx = dx / len * max; dy = dy / len * max; }
  knob.style.transform = `translate(${dx}px,${dy}px)`;
  joy.x = dx / max;
  joy.y = dy / max;
}
function joyEnd() { joy.x = 0; joy.y = 0; knob.style.transform = 'translate(0,0)'; }
joyEl.addEventListener('touchstart', e => { if (hudEditMode) return; joyMove(e); e.preventDefault(); }, { passive: false });
joyEl.addEventListener('touchmove', e => { if (hudEditMode) return; joyMove(e); e.preventDefault(); }, { passive: false });
joyEl.addEventListener('touchend', joyEnd);
joyEl.addEventListener('touchcancel', joyEnd);

document.getElementById('fire').addEventListener('touchstart', e => { if (hudEditMode) return; e.preventDefault(); initAudio(); shoot(); });
document.getElementById('fire').addEventListener('mousedown', () => { if (!hudEditMode) shoot(); });
document.getElementById('skill').addEventListener('click', () => { if (!hudEditMode && !didDrag) useSkill(); });
document.getElementById('jump').addEventListener('click', () => { if (!hudEditMode && !didDrag) p.jump = 16; });
