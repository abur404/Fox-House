let zoom = 1.0, pinchStartDist = 0, pinchStartZoom = 1.0, isPinching = false;

function setZoom(val) {
  zoom = Math.max(0.55, Math.min(1.5, +val.toFixed(2)));
  const label = document.getElementById('zoomLabel');
  if (label) label.innerText = zoom.toFixed(1) + 'x';
}

function changeZoom(delta) {
  setZoom(zoom + delta);
}

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  changeZoom(e.deltaY < 0 ? 0.1 : -0.1);
}, { passive: false });

canvas.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    isPinching = true;
    movingItem = null;
    pinchStartDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    ) || 1;
    pinchStartZoom = zoom;
  }
}, { passive: true });

canvas.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && isPinching) {
    const curDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    ) || 1;
    setZoom(pinchStartZoom * (curDist / pinchStartDist));
  }
}, { passive: true });

canvas.addEventListener('touchend', e => {
  if (e.touches.length < 2) isPinching = false;
});
