// Editor anotací pro QA: nedestruktivní – originál zůstává, anotace se ukládají jako vrstvy (c.ann), do buňky jde sloučený PNG (c.view).
(() => {
  const ed = $('#ed'), cv = $('#edc'), ctx = cv.getContext('2d'), txt = $('#edtxt');
  const TOOLS = [['arrow', IC['arrow-big-right-dash'], 'Šipka'], ['rect', IC.square, 'Obdélník'], ['ellipse', IC.circle, 'Elipsa'], ['hl', IC.highlighter, 'Zvýraznit'], ['num', IC.number, 'Číslo'], ['text', IC['type-outline'], 'Text'], ['blur', IC.blur, 'Rozmazat'], ['ruler', IC.ruler, 'Pravítko'], ['pick', IC.pipette, 'Pipeta'], ['crop', IC.crop, 'Ořez']];
  const COLS = ['#ff3b30', '#ffcc00', '#4cd964', '#4aa3ff', '#ffffff', '#000000'];
  let custom = null, img, items, crop, sel = null, tool = 'arrow', color = COLS[0], hist, hi, cur, onSave, pending;

  const snapH = () => { hist = hist.slice(0, hi + 1); hist.push(JSON.stringify({ items, crop })); hi = hist.length - 1; };
  const restore = () => { const s = JSON.parse(hist[hi]); items = s.items; crop = s.crop; sel = null; applyView(); };
  const undoE = () => { if (hi > 0) { hi--; restore(); } };
  const redoE = () => { if (hi < hist.length - 1) { hi++; restore(); } };
  const lum = c => { const n = parseInt(c.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000; };
  const contrast = c => lum(c) > 150 ? '#000' : '#fff';
  const ox = () => crop ? crop.x : 0, oy = () => crop ? crop.y : 0;
  const size = () => +$('#edw').value;

  // text zapsaný do obrázku má vždy zvolenou barvu (obrys v opačném odstínu jen pomáhá čitelnosti)
  function label(g, t, x, y, fs, col, align, base) {
    g.font = `bold ${fs}px sans-serif`; g.textAlign = align; g.textBaseline = base; g.lineJoin = 'round'; g.lineWidth = fs / 5;
    g.strokeStyle = contrast(col); g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y);
  }
  function pix(g, x, y, w, h) {
    const bs = Math.max(8, Math.round(img.naturalWidth / 160)), tw = Math.max(1, Math.ceil(w / bs)), th = Math.max(1, Math.ceil(h / bs));
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
        label(g, `${Math.round(len)} px  (${Math.round(w)}×${Math.round(h)})`, (x1 + x2) / 2, (y1 + y2) / 2 - 14 - it.w, 11 + it.w, it.color, 'center', 'middle'); break;
      }
      case 'pickmark': {   // značka + v místě kliknutí a vedle ní text s kódem barvy (ve zvolené barvě)
        const arm = 8 + it.w * 1.5, fs = 11 + it.w;
        const cross = () => { g.beginPath(); g.moveTo(x1 - arm, y1); g.lineTo(x1 + arm, y1); g.moveTo(x1, y1 - arm); g.lineTo(x1, y1 + arm); g.stroke(); };
        g.lineCap = 'butt'; g.strokeStyle = contrast(it.color); g.lineWidth = 4; cross(); g.strokeStyle = it.color; g.lineWidth = 2; cross();
        g.font = `bold ${fs}px sans-serif`;
        const tw = g.measureText(it.text).width, minX = crop ? crop.x : 0, maxX = crop ? crop.x + crop.w : img.naturalWidth;
        if (x1 + arm + 6 + tw < maxX) label(g, it.text, x1 + arm + 6, y1, fs, it.color, 'left', 'middle');                 // vpravo
        else if (x1 - arm - 6 - tw > minX) label(g, it.text, x1 - arm - 6, y1, fs, it.color, 'right', 'middle');          // vlevo
        else label(g, it.text, Math.max(minX + tw / 2, Math.min(maxX - tw / 2, x1)), y1 + arm + fs, fs, it.color, 'center', 'middle'); break;   // pod značkou
      }
      case 'num': {
        const r = 12 + it.w * 2; g.beginPath(); g.arc(x1, y1, r, 0, 7); g.fill();
        g.fillStyle = contrast(it.color); g.font = `bold ${r * 1.3}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(it.n, x1, y1 + 1); break;
      }
      case 'text': label(g, it.text, x1, y1, 14 + it.w * 3, it.color, 'left', 'top'); break;
    }
    g.restore();
  }
  const paintScene = g => { g.drawImage(img, 0, 0); items.forEach(it => drawItem(g, it)); };
  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save(); ctx.translate(-ox(), -oy());
    paintScene(ctx);
    if (cur) drawItem(ctx, cur);
    if (sel) {   // čekající výběr ořezu: ztmavit okolí
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.rect(ox(), oy(), cv.width, cv.height); ctx.rect(sel.x, sel.y, sel.w, sel.h); ctx.fill('evenodd');
      ctx.setLineDash([8, 6]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
    }
    ctx.restore();
    ui();
  }
  function applyView() { cv.width = crop ? crop.w : img.naturalWidth; cv.height = crop ? crop.h : img.naturalHeight; draw(); }
  function ui() {
    $('#edcropbar').hidden = !sel; $('#edcropreset').hidden = !crop;
    $('#edcropinfo').textContent = sel ? `${sel.w} × ${sel.h} px` : '';
  }
  function bar() {
    $('#edtools').innerHTML = TOOLS.map(([k, ic, name]) => `<button data-t="${k}" class="tipr${k === tool ? ' on' : ''}" data-tip="${name}">${ic}</button>`).join('');
    $('#edpicklbl').hidden = tool !== 'pick';
    $('#edcols').innerHTML = (custom ? [...COLS, custom] : COLS).map(c => `<i data-c="${c}" style="background:${c}" class="${c === color ? 'on' : ''}"></i>`).join('');
    $('#edcolor').value = color;
  }
  $('#edcolor').oninput = e => { color = e.target.value; if (!COLS.includes(color)) custom = color; bar(); };
  $('#edtools').onclick = e => { const b = e.target.closest('button'); if (b) { tool = b.dataset.t; sel = null; bar(); draw(); } };
  $('#edcols').onclick = e => { if (e.target.dataset.c) { color = e.target.dataset.c; bar(); } };
  $('#edundo').onclick = undoE; $('#edredo').onclick = redoE;

  // velikost: posuvník + číslo, které lze přepsat
  $('#edw').oninput = e => { $('#edwn').value = e.target.value; };
  $('#edwn').oninput = e => { const v = Math.round(+e.target.value); if (v) $('#edw').value = Math.max(1, Math.min(40, v)); };
  $('#edwn').onchange = () => { $('#edwn').value = $('#edw').value; };

  // ořez: výběr -> potvrzení -> zobrazí se jen vybraná oblast
  const cropOk = () => { if (!sel) return; crop = sel; sel = null; snapH(); applyView(); };
  const cropNo = () => { sel = null; draw(); };
  $('#edcropok').onclick = cropOk; $('#edcropno').onclick = cropNo;
  $('#edcropreset').onclick = () => { crop = null; sel = null; snapH(); applyView(); };

  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width + ox(), y: (e.clientY - r.top) * cv.height / r.height + oy() }; };
  cv.onpointerdown = e => {
    if (e.button) return;
    const p = pos(e), w = size();
    if (tool === 'pick') {   // pipeta: barva z originálního snímku, kód se zkopíruje do schránky
      const t = document.createElement('canvas'); t.width = img.naturalWidth; t.height = img.naturalHeight; const tg = t.getContext('2d'); tg.drawImage(img, 0, 0);
      const d = tg.getImageData(Math.max(0, Math.min(t.width - 1, Math.floor(p.x))), Math.max(0, Math.min(t.height - 1, Math.floor(p.y))), 1, 1).data;
      const hex = '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('');
      const text = `${hex} (rgb ${d[0]}, ${d[1]}, ${d[2]})`;
      navigator.clipboard.writeText(hex).catch(() => {});
      $('#edinfo').textContent = `Barva ${text} · zkopírováno`;
      if ($('#edpickmk').checked) {   // zapsat do obrázku zvolenou barvou (aktuální barva se nemění)
        items.push({ t: 'pickmark', x1: p.x, y1: p.y, x2: p.x, y2: p.y, color, w, text }); snapH(); draw();
      } else { color = hex; if (!COLS.includes(hex)) custom = hex; bar(); }
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
        const x0 = ox(), y0 = oy(), x1 = Math.max(x0, Math.min(x0 + cv.width, Math.min(c.x1, c.x2))), y1 = Math.max(y0, Math.min(y0 + cv.height, Math.min(c.y1, c.y2)));
        const x2 = Math.max(x0, Math.min(x0 + cv.width, Math.max(c.x1, c.x2))), y2 = Math.max(y0, Math.min(y0 + cv.height, Math.max(c.y1, c.y2)));
        if (x2 - x1 > 4 && y2 - y1 > 4) sel = { x: Math.round(x1), y: Math.round(y1), w: Math.round(x2 - x1), h: Math.round(y2 - y1) };
      } else { items.push(c); snapH(); }
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
    else if (e.key === 'Enter' && sel) cropOk();
    else if (e.key === 'Escape') sel ? cropNo() : close();
    else return;
    e.preventDefault();
  }
  function close() { ed.hidden = true; txt.hidden = true; document.removeEventListener('keydown', key, true); }

  $('#edcancel').onclick = close;
  // výsledný obrázek (originál + anotace, případně oříznutý) – pro uložení i kopírování
  function renderOut() {
    const full = document.createElement('canvas'); full.width = img.naturalWidth; full.height = img.naturalHeight;
    paintScene(full.getContext('2d'));
    if (!crop) return full;
    const out = document.createElement('canvas'); out.width = crop.w; out.height = crop.h;
    out.getContext('2d').drawImage(full, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h); return out;
  }
  $('#edcopy').onclick = async () => {
    try { await api.copyImage(renderOut().toDataURL('image/png')); toast('Obrázek (i s úpravami) je ve schránce'); }
    catch (e) { toast('\u26a0 Kopírování se nepodařilo'); }
  };
  $('#edsave').onclick = async () => {
    if (!items.length && !crop) { close(); return onSave(null, null); }
    const out = renderOut();
    const name = await api.writePng(out.toDataURL('image/png'));
    close(); onSave(name, { items, crop });
  };

  window.openEditor = async (c, cb) => {
    onSave = cb;
    const du = await api.readPng(c.file);
    img = new Image(); await new Promise(r => { img.onload = r; img.src = du; });
    const a = c.ann || { items: [], crop: null };
    items = JSON.parse(JSON.stringify(a.items)); crop = a.crop; sel = null; hist = []; hi = -1; snapH();
    tool = 'arrow'; cur = null; custom = null; $('#edinfo').textContent = ''; bar(); ed.hidden = false; applyView();
    document.addEventListener('keydown', key, true);
  };
})();
