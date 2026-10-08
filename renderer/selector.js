if (new URLSearchParams(location.search).get('lang') === 'en') document.getElementById('help').textContent = 'Drag with the mouse to select an area · Esc / right button = cancel';
const box = document.getElementById('box'), lbl = document.getElementById('lbl');
let x0, y0, drag = false;
const bg = document.getElementById('bg');
bg.onload = () => sel.ready();
bg.onerror = () => sel.fail();
sel.get().then(u => u ? bg.src = u : sel.fail());
const rect = e => ({ x: Math.min(x0, e.clientX), y: Math.min(y0, e.clientY), w: Math.abs(e.clientX - x0), h: Math.abs(e.clientY - y0) });
addEventListener('dragstart', e => e.preventDefault());
addEventListener('mousedown', e => { e.preventDefault(); if (e.button) return sel.done(null, null, 'pravé tlačítko'); drag = true; x0 = e.clientX; y0 = e.clientY; box.style.display = lbl.style.display = 'block'; });
addEventListener('mousemove', e => {
  if (!drag) return;
  const r = rect(e);
  Object.assign(box.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
  lbl.textContent = `${r.w} × ${r.h}`; lbl.style.left = r.x + 'px'; lbl.style.top = Math.max(0, r.y - 22) + 'px';
});
addEventListener('mouseup', e => { if (!drag) return; drag = false; const r = rect(e); if (r.w > 4 && r.h > 4) sel.done(r, { w: innerWidth, h: innerHeight }); else sel.done(null, null, 'příliš malá oblast'); });
addEventListener('keydown', e => { if (e.key === 'Escape') sel.done(null, null, 'Esc'); });
addEventListener('contextmenu', e => e.preventDefault());
