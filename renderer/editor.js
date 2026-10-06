// Editor anotací pro QA: nedestruktivní – originál zůstává, anotace se ukládají jako vrstvy (c.ann), do buňky jde sloučený PNG (c.view).
(() => {
  const ed = $('#ed'), cv = $('#edc'), ctx = cv.getContext('2d'), txt = $('#edtxt');
  const TOOLS = [['arrow', '➜ Šipka'], ['rect', '▭ Obdélník'], ['ellipse', '◯ Elipsa'], ['hl', '▮ Zvýraznit'], ['num', '① Číslo'], ['text', 'T Text'], ['blur', '▦ Rozmazat'], ['ruler', '📏 Pravítko'], ['pick', '💧 Pipeta'], ['crop', IC.crop + ' Ořez']];
  const COLS = ['#ff3b30', '#ffcc00', '#4cd964', '#4aa3ff', '#ffffff', '#000000'];
  let custom = null, img, items, crop, tool = 'arrow', color = COLS[0], hist, hi, cur, onSave, pending;

  const snapH = () => { hist = hist.slice(0, hi + 1); hist.push(JSON.stringify({ items, crop })); hi = hist.length - 1; };
  const restore = () => { const s = JSON.parse(hist[hi]); items = s.items; crop = s.crop; draw(); };
  const undoE = () => { if (hi > 0) { hi--; restore(); } };
  const redoE = () => { if (hi < hist.length - 1) { hi++; restore(); } };
  const lum = c => { const n = parseInt(c.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000; };

  function pix(g, x, y, w, h) {
    const bs = Math.max(8, Math.round(cv.width / 160)), tw = Math.max(1, Math.ceil(w / bs)), th = Math.max(1, Math.ceil(h / bs));
    const t = document.createElement('canvas'); t.width = tw; t.height = th;
    t.getContext('2d').drawImage(img, x, y, w, h, 0, 0, tw, th);
    g.imageSmoothingEnabled = false; g.drawImage(t, 0, 0, tw, th, x, y, w, h);
  }
  function drawItem(g, it) {
    const { x1, y1, x2, y2 } = it, x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
    g.save(); g.strokeStyle = g.fillStyle = it.color; g.lineWidth = it.w; g.lineCap = 'round';
    switch (it.t) {
      case 'rect': g.strokeRect(x, y, w, h); break;
      case 'ellipse': g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7); g.stroke(); break;
      case 'hl': g.globalAlpha = .35; g.fillRect(x, y, w, h); break;
      case 'blur': pix(g, x, y, w, h); break;
      case 'crop': g.setLineDash([8, 6]); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, w, h); break;
      case 'arrow': {
        const a = Math.atan2(y2 - y1, x2 - x1), L = 10 + it.w * 3;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - L * Math.cos(a - .45), y2 - L * Math.sin(a - .45)); g.lineTo(x2 - L * Math.cos(a + .45), y2 - L * Math.sin(a + .45)); g.closePath(); g.fill(); break;
      }
      case 'ruler': {
        const len = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * 8, ny = Math.cos(a) * 8;
        g.lineWidth = Math.min(it.w, 3);
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.moveTo(x1 - nx, y1 - ny); g.lineTo(x1 + nx, y1 + ny); g.moveTo(x2 - nx, y2 - ny); g.lineTo(x2 + nx, y2 + ny); g.stroke();
        const t = `${Math.round(len)} px  (${Math.round(w)}×${Math.round(h)})`; g.font = 'bold 14px sans-serif';
        const tw = g.measureText(t).width + 12, mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 16;
        g.fillStyle = '#000c'; g.fillRect(mx - tw / 2, my - 10, tw, 20); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, mx, my); break;
      }
      case 'pickmark': {   // značka + v místě kliknutí a vedle ní text s kódem barvy
        const arm = 8 + it.w * 1.5, fs = 13 + it.w;
        const cross = () => { g.beginPath(); g.moveTo(x1 - arm, y1); g.lineTo(x1 + arm, y1); g.moveTo(x1, y1 - arm); g.lineTo(x1, y1 + arm); g.stroke(); };
        g.lineCap = 'butt'; g.strokeStyle = '#000'; g.lineWidth = 4; cross(); g.strokeStyle = '#fff'; g.lineWidth = 2; cross();
        g.font = `bold ${fs}px sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'left';
        const tw = g.measureText(it.text).width + 12, bx = x1 + arm + 6 + tw < cv.width ? x1 + arm + 6 : x1 - arm - 6 - tw;
        g.fillStyle = '#000c'; g.fillRect(bx, y1 - fs * 0.9, tw, fs * 1.8); g.fillStyle = '#fff'; g.fillText(it.text, bx + 6, y1); break;
      }
      case 'num': {
        const r = 12 + it.w * 2; g.beginPath(); g.arc(x1, y1, r, 0, 7); g.fill();
        g.fillStyle = lum(it.color) > 150 ? '#000' : '#fff'; g.font = `bold ${r * 1.3}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(it.n, x1, y1 + 1); break;
      }
      case 'text': {
        const fs = 14 + it.w * 3; g.font = `bold ${fs}px sans-serif`; g.textBaseline = 'top'; g.lineWidth = fs / 6; g.lineJoin = 'round';
        g.strokeStyle = lum(it.color) > 150 ? '#000' : '#fff'; g.strokeText(it.text, x1, y1); g.fillText(it.text, x1, y1); break;
      }
    }
    g.restore();
  }
  function paint(g, ui) {
    g.drawImage(img, 0, 0);
    items.forEach(it => drawItem(g, it));
    if (ui) {
      if (crop) { g.save(); g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.rect(0, 0, cv.width, cv.height); g.rect(crop.x, crop.y, crop.w, crop.h); g.fill('evenodd'); g.restore(); }
      if (cur) drawItem(g, cur);
    }
  }
  function draw() { ctx.clearRect(0, 0, cv.width, cv.height); paint(ctx, true); }

  function bar() {
    $('#edtools').innerHTML = TOOLS.map(([k, l]) => `<button data-t="${k}" class="${k === tool ? 'on' : ''}">${l}</button>`).join('');
    $('#edpicklbl').hidden = tool !== 'pick';
    $('#edcols').innerHTML = (custom ? [...COLS, custom] : COLS).map(c => `<i data-c="${c}" style="background:${c}" class="${c === color ? 'on' : ''}"></i>`).join('');
  }
  $('#edtools').onclick = e => { const b = e.target.closest('button'); if (b) { tool = b.dataset.t; bar(); } };
  $('#edcols').onclick = e => { if (e.target.dataset.c) { color = e.target.dataset.c; bar(); } };
  $('#edundo').onclick = undoE; $('#edredo').onclick = redoE;

  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
  cv.onpointerdown = e => {
    if (e.button) return;
    const p = pos(e), w = +$('#edw').value;
    if (tool === 'pick') {   // pipeta: barva z originálního snímku, zkopíruje se do schránky a nastaví jako aktuální
      const t = document.createElement('canvas'); t.width = cv.width; t.height = cv.height; const tg = t.getContext('2d'); tg.drawImage(img, 0, 0);
      const d = tg.getImageData(Math.max(0, Math.min(cv.width - 1, Math.floor(p.x))), Math.max(0, Math.min(cv.height - 1, Math.floor(p.y))), 1, 1).data;
      const hex = '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('');
      const label = `${hex} (rgb ${d[0]}, ${d[1]}, ${d[2]})`;
      color = hex; if (!COLS.includes(hex)) custom = hex; bar(); navigator.clipboard.writeText(hex).catch(() => {});
      $('#edinfo').textContent = `Barva ${label} · zkopírováno`;
      if ($('#edpickmk').checked) { items.push({ t: 'pickmark', x1: p.x, y1: p.y, x2: p.x, y2: p.y, color: hex, w, text: label }); snapH(); draw(); }
      return;
    }
    if (tool === 'text') { pending = { p, w }; txt.style.left = e.clientX + 'px'; txt.style.top = e.clientY + 'px'; txt.value = ''; txt.hidden = false; setTimeout(() => txt.focus(), 0); return; }
    if (tool === 'num') { items.push({ t: 'num', x1: p.x, y1: p.y, x2: p.x, y2: p.y, color, w, n: items.filter(i => i.t === 'num').length + 1 }); snapH(); draw(); return; }
    cur = { t: tool, x1: p.x, y1: p.y, x2: p.x, y2: p.y, color, w }; cv.setPointerCapture(e.pointerId);
  };
  cv.onpointermove = e => { if (!cur) return; const p = pos(e); cur.x2 = p.x; cur.y2 = p.y; draw(); };
  cv.onpointerup = () => {
    if (!cur) return;
    const c = cur; cur = null;
    if (Math.hypot(c.x2 - c.x1, c.y2 - c.y1) > 6) {
      if (c.t === 'crop') {
        const x = Math.max(0, Math.round(Math.min(c.x1, c.x2))), y = Math.max(0, Math.round(Math.min(c.y1, c.y2)));
        crop = { x, y, w: Math.min(cv.width - x, Math.round(Math.abs(c.x2 - c.x1))), h: Math.min(cv.height - y, Math.round(Math.abs(c.y2 - c.y1))) };
      } else items.push(c);
      snapH();
    }
    draw();
  };
  function commitText() {
    const v = txt.value.trim(); txt.hidden = true;
    if (v && pending) { items.push({ t: 'text', x1: pending.p.x, y1: pending.p.y, x2: pending.p.x, y2: pending.p.y, text: v, color, w: pending.w }); snapH(); draw(); }
    pending = null;
  }
  txt.onblur = () => { txt.hidden = true; };

  function key(e) {   // v editoru nesmí proběhnout zkratky nástěnky
    e.stopPropagation();
    if (e.target === txt) { if (e.key === 'Enter') commitText(); else if (e.key === 'Escape') txt.hidden = true; else return; e.preventDefault(); return; }
    const k = e.key.toLowerCase(), m = e.ctrlKey || e.metaKey;
    if (m && k === 'z') e.shiftKey ? redoE() : undoE();
    else if (m && k === 'y') redoE();
    else if (e.key === 'Escape') close();
    else return;
    e.preventDefault();
  }
  function close() { ed.hidden = true; txt.hidden = true; document.removeEventListener('keydown', key, true); }

  $('#edcancel').onclick = close;
  $('#edsave').onclick = async () => {
    if (!items.length && !crop) { close(); return onSave(null, null); }
    const full = document.createElement('canvas'); full.width = cv.width; full.height = cv.height;
    paint(full.getContext('2d'), false);
    let out = full;
    if (crop) { out = document.createElement('canvas'); out.width = crop.w; out.height = crop.h; out.getContext('2d').drawImage(full, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h); }
    const name = await api.writePng(out.toDataURL('image/png'));
    close(); onSave(name, { items, crop });
  };

  window.openEditor = async (c, cb) => {
    onSave = cb;
    const du = await api.readPng(c.file);
    img = new Image(); await new Promise(r => { img.onload = r; img.src = du; });
    cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    const a = c.ann || { items: [], crop: null };
    items = JSON.parse(JSON.stringify(a.items)); crop = a.crop; hist = []; hi = -1; snapH();
    tool = 'arrow'; cur = null; custom = null; $('#edinfo').textContent = ''; bar(); ed.hidden = false; draw();
    document.addEventListener('keydown', key, true);
  };
})();
