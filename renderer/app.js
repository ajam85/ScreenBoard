const $ = s => document.querySelector(s);
const grid = $('#grid');
let S = newBoard('Nástěnka 1'), ALL = { boards: [S], active: S.id, trash: [] }, undo = [], dir = '', flashIdx = -1, from = -1, tt;
const N = () => S.cols * S.rows;
const url = f => (dir.startsWith('/') ? 'file://' : 'file:///') + dir.replace(/\\/g, '/') + '/' + encodeURIComponent(f);

function newBoard(name) { return { id: Date.now(), name, cols: 3, rows: 2, gap: 8, fit: 'contain', cells: [], arrows: [] }; }
function persist() { api.save(ALL); }
function commit() { persist(); render(); }
function setActive(id) { ALL.active = id; S = ALL.boards.find(b => b.id === id) || ALL.boards[0]; ALL.active = S.id; cancelLink(); closePop(); sync(); }
function snap() { undo.push(JSON.stringify({ b: ALL.boards, t: ALL.trash })); if (undo.length > 50) undo.shift(); }
function doUndo() { if (!undo.length) return toast('Není co vracet'); const o = JSON.parse(undo.pop()); ALL.boards = o.b; ALL.trash = o.t; setActive(ALL.active); commit(); }
function pad() { while (S.cells.length < N()) S.cells.push(null); }
function sync() { $('#cols').value = S.cols; $('#rows').value = S.rows; $('#gap').value = S.gap; $('#fit').value = S.fit; }

function toast(msg, btn, fn) {
  const t = $('#toast'); t.textContent = msg + ' ';
  if (btn) { const b = document.createElement('button'); b.textContent = btn; b.onclick = () => { t.style.display = 'none'; fn(); }; t.appendChild(b); }
  t.style.display = 'flex'; clearTimeout(tt); tt = setTimeout(() => t.style.display = 'none', 5000);
}

// Nový snímek: první volná buňka (zleva doprava, shora dolů); jinak nejstarší nezamknutý.
function place(file) {
  pad(); snap();
  const vis = S.cells.slice(0, N());
  let i = vis.findIndex(x => !x);
  if (i < 0) {
    let old = -1;
    vis.forEach((x, k) => { if (!x.locked && (old < 0 || x.t < vis[old].t)) old = k; });
    if (old < 0) { undo.pop(); toTrash({ id: Date.now(), file, t: Date.now() }, S.name); persist(); updTrash(); return toast('🔒 Všechny buňky jsou zamknuté – snímek je v koši'); }
    i = old;
  }
  if (S.cells[i]) { dropArrows(S.cells[i].id); toTrash(S.cells[i]); }
  S.cells[i] = { id: Date.now(), file, locked: false, t: Date.now() };
  flashIdx = i; commit();
  setTimeout(() => { flashIdx = -1; render(); }, 1300);
}

function render() {
  pad();
  grid.style.gridTemplateColumns = `repeat(${S.cols},1fr)`;
  grid.style.gridTemplateRows = `repeat(${S.rows},1fr)`;
  grid.style.gap = S.gap + 'px';
  grid.innerHTML = '';
  for (let i = 0; i < N(); i++) {
    const c = S.cells[i], d = document.createElement('div');
    d.className = 'cell' + (c ? '' : ' empty') + (c && c.locked ? ' locked' : '') + (i === flashIdx ? ' flash' : '') + (c && !matchQ(c) ? ' dim' : '');
    d.dataset.i = i;
    if (c) {
      d.draggable = !c.locked; d.dataset.id = c.id; const z = c.z || { s: 1, x: 0, y: 0 };
      d.innerHTML = `<img src="${url(c.view || c.file)}" style="object-fit:${S.fit};transform:translate(${z.x}px,${z.y}px) scale(${z.s})" draggable="false"><div class="bar"><button data-a="lock" title="Zamknout / odemknout">${c.locked ? '🔒' : '🔓'}</button><button data-a="max" title="Zvětšit přes celé okno (Esc = zpět)">⤢</button><button data-a="edit" title="Upravit / anotovat (QA) – nebo dvojklik na obrázek">✎</button><button data-a="info" title="Název, poznámka, štítky">ⓘ</button><button data-a="link" title="Spojit šipkou s jiným obrázkem">➜</button><button data-a="cmp" title="Porovnat s jiným snímkem">⇄</button><button data-a="save" title="Uložit jako…">${IC.save}</button><button data-a="del" title="Smazat">${IC.trash}</button></div>${capHtml(c)}`;
    }
    grid.appendChild(d);
  }
  renderTabs();
  updTrash();
  drawArrows();
}

grid.addEventListener('click', e => {
  if (linkFrom !== null) {   // režim spojování: klik na cílový obrázek vytvoří šipku
    const cc = e.target.closest('.cell'), t = cc && S.cells[+cc.dataset.i];
    if (t && t.id !== linkFrom && linkMode === 'cmp') { const a = S.cells.find(x => x && x.id === linkFrom); cancelLink(); return openCompare(a, t); }
    if (t && t.id !== linkFrom) { snap(); S.arrows.push({ id: Date.now(), from: linkFrom, to: t.id, label: '', color: COLORS[0], style: 'straight', locked: false }); commit(); toast('Šipka vytvořena – klikni na ni pro popisek, barvu a tvar'); }
    else toast('Spojování zrušeno');
    cancelLink(); return;
  }
  const b = e.target.closest('button'); if (!b) return;
  const i = +b.closest('.cell').dataset.i, c = S.cells[i];
  if (b.dataset.a === 'save') api.saveAs(c.view || c.file);
  else if (b.dataset.a === 'link') startLink(c);
  else if (b.dataset.a === 'cmp') startLink(c, 'cmp');
  else if (b.dataset.a === 'info') openDetail(c);
  else if (b.dataset.a === 'edit') editCell(c);
  else if (b.dataset.a === 'max') { b.closest('.cell').classList.toggle('max'); drawArrows(); }
  else if (b.dataset.a === 'lock') { snap(); c.locked = !c.locked; commit(); }
  else if (c.locked) toast('🔒 Obrázek je zamknutý – nejdřív ho odemkni');
  else { snap(); dropArrows(c.id); toTrash(c); S.cells[i] = null; commit(); toast('Obrázek je v koši', 'Vrátit', doUndo); }
});
const editCell = c => openEditor(c, (name, ann) => { snap(); c.view = name; c.ann = ann; commit(); });
grid.addEventListener('dblclick', e => {   // dvojklik na obrázek = rovnou režim úprav (QA)
  if (e.target.closest('button')) return;
  const el = e.target.closest('.cell'), c = el && S.cells[+el.dataset.i];
  if (c && !el.classList.contains('max')) editCell(c);
});
grid.addEventListener('dragstart', e => { const c = e.target.closest('.cell'); if (c) { from = +c.dataset.i; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'x'); } });
grid.addEventListener('dragover', e => { if (from >= 0) e.preventDefault(); });
grid.addEventListener('dragend', () => from = -1);
grid.addEventListener('drop', e => {
  e.preventDefault();
  const c = e.target.closest('.cell'); if (!c || from < 0) return;
  const to = +c.dataset.i; if (to === from) return;
  const a = S.cells[from], b = S.cells[to];
  if (b && b.locked) return toast('🔒 Cílová buňka je zamknutá');
  snap(); S.cells[to] = a; S.cells[from] = b; commit();   // prázdná = přesun, obsazená = prohození
});

for (const id of ['cols', 'rows', 'gap']) $('#' + id).onchange = e => {
  const v = Math.max(+e.target.min, Math.min(+e.target.max, +e.target.value || +e.target.min));
  snap(); S[id] = v; sync(); commit();
};
$('#fit').onchange = e => { snap(); S.fit = e.target.value; commit(); };
$('#undo').onclick = doUndo;
$('#cap').onclick = () => api.capture();
$('#reg').onclick = () => api.captureRegion();
$('#folder').onclick = () => api.openFolder();
$('#cfg').onclick = () => openModal('#set');
$('#q').oninput = () => render();
document.querySelectorAll('[data-ic]').forEach(b => b.insertAdjacentHTML('afterbegin', IC[b.dataset.ic]));
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.target.tagName !== 'INPUT') { e.preventDefault(); doUndo(); }
  if (e.key === 'Escape') { document.querySelectorAll('.modal:not([hidden])').forEach(m => m.hidden = true); document.querySelectorAll('.cell.max').forEach(c => c.classList.remove('max')); cancelLink(); closePop(); drawArrows(); }
});

// ---------- Šipky mezi buňkami (vázané na obrázek, ne na pozici) ----------
const COLORS = ['#ffcc00', '#ff5252', '#4cd964', '#4aa3ff', '#ffffff'];
let linkFrom = null, linkMode = 'link', popId = null, popSnap = false;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const arrowOf = id => (S.arrows || []).find(a => a.id === id);
function dropArrows(id) { S.arrows = (S.arrows || []).filter(a => a.from !== id && a.to !== id); }
function startLink(c, mode) { linkFrom = c.id; linkMode = mode || 'link'; grid.classList.add('linking'); toast(linkMode === 'cmp' ? 'Klikni na druhý snímek k porovnání (Esc = zrušit)' : 'Klikni na cílový obrázek (Esc = zrušit)'); }
function cancelLink() { linkFrom = null; linkMode = 'link'; grid.classList.remove('linking'); }
function edge(r, c, o) {
  const dx = o.x - c.x, dy = o.y - c.y;
  const t = Math.min((r.width / 2) / (Math.abs(dx) || 1e-6), (r.height / 2) / (Math.abs(dy) || 1e-6));
  return { x: c.x + dx * t, y: c.y + dy * t };
}
function drawArrows() {
  const g = $('#ag'); g.innerHTML = '';
  if (grid.querySelector('.cell.max')) return;
  const W = $('#wrap').getBoundingClientRect(); let h = '';
  const key = a => Math.min(a.from, a.to) + '-' + Math.max(a.from, a.to), groups = {};
  (S.arrows || []).forEach(a => (groups[key(a)] = groups[key(a)] || []).push(a));
  for (const a of S.arrows || []) {
    const A = grid.querySelector(`.cell[data-id="${a.from}"]`), B = grid.querySelector(`.cell[data-id="${a.to}"]`);
    if (!A || !B) continue;
    const ra = A.getBoundingClientRect(), rb = B.getBoundingClientRect();
    const ca = { x: ra.left + ra.width / 2 - W.left, y: ra.top + ra.height / 2 - W.top };
    const cb = { x: rb.left + rb.width / 2 - W.left, y: rb.top + rb.height / 2 - W.top };
    const grp = groups[key(a)], off = (grp.indexOf(a) - (grp.length - 1) / 2) * 18;   // šipky mezi stejnou dvojicí se rozestoupí
    const cf = a.from < a.to ? [ca, cb] : [cb, ca];
    let px = -(cf[1].y - cf[0].y), py = cf[1].x - cf[0].x; const pl = Math.hypot(px, py) || 1; px /= pl; py /= pl;
    let pts;
    if (a.style === 'elbow') {
      const dx = cb.x - ca.x, dy = cb.y - ca.y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        const sx = (dx > 0 ? ra.right : ra.left) - W.left, ex = (dx > 0 ? rb.left : rb.right) - W.left, mx = (sx + ex) / 2;
        pts = [[sx, ca.y + off], [mx, ca.y + off], [mx, cb.y + off], [ex, cb.y + off]];
      } else {
        const sy = (dy > 0 ? ra.bottom : ra.top) - W.top, ey = (dy > 0 ? rb.top : rb.bottom) - W.top, my = (sy + ey) / 2;
        pts = [[ca.x + off, sy], [ca.x + off, my], [cb.x + off, my], [cb.x + off, ey]];
      }
    } else {
      const p1 = edge(ra, ca, cb), p2 = edge(rb, cb, ca);
      pts = [[p1.x + px * off, p1.y + py * off], [p2.x + px * off, p2.y + py * off]];
    }
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
    const m = pts.length === 4 ? [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2] : [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
    h += `<g data-id="${a.id}"><path class="hit" d="${d}"/><path d="${d}" stroke="${a.color}" stroke-width="3" fill="none" stroke-linejoin="round" marker-end="url(#ah)"/>`;
    const txt = (a.locked ? '🔒 ' : '') + (a.label || '');
    if (txt) {
      const w = txt.length * 7.5 + 14;
      h += `<rect class="lb" x="${m[0] - w / 2}" y="${m[1] - 11}" width="${w}" height="22" rx="4" fill="#000d" stroke="${a.color}"/><text class="lb" x="${m[0]}" y="${m[1] + 4}" fill="#fff" font-size="13" text-anchor="middle">${esc(txt)}</text>`;
    }
    h += '</g>';
  }
  g.innerHTML = h;
}
function drawSwatches() {
  const a = arrowOf(popId); if (!a) return;
  $('#pcol').innerHTML = COLORS.map(c => `<i data-c="${c}" style="background:${c}" class="${c === a.color ? 'on' : ''}"></i>`).join('');
}
function popRefresh() {
  const a = arrowOf(popId); if (!a) return;
  $('#plabel').value = a.label; $('#plabel').disabled = !!a.locked;
  $('#plock').textContent = a.locked ? '🔒' : '🔓'; $('#plock').title = a.locked ? 'Odemknout šipku' : 'Zamknout šipku';
  $('#pstyle').textContent = a.style === 'elbow' ? '↳ Zalomená' : '— Přímá';
  drawSwatches();
}
function openPop(id, x, y) {
  popId = id; popSnap = false;
  const a = arrowOf(id); if (!a) return;
  const p = $('#pop'); p.hidden = false;
  p.style.left = Math.min(x, innerWidth - 400) + 'px'; p.style.top = Math.min(y + 8, innerHeight - 110) + 'px';
  popRefresh(); if (!a.locked) $('#plabel').focus();
}
function closePop() { popId = null; $('#pop').hidden = true; }
function modArrow(fn, force) {
  const a = arrowOf(popId); if (!a) return;
  if (a.locked && !force) return toast('🔒 Šipka je zamknutá – nejdřív ji odemkni');
  if (!popSnap) { snap(); popSnap = true; }
  fn(a); persist(); drawArrows(); popRefresh();
}
$('#ag').addEventListener('click', e => { const g = e.target.closest('g[data-id]'); if (g) openPop(+g.dataset.id, e.clientX, e.clientY); });
$('#plabel').addEventListener('input', e => modArrow(a => a.label = e.target.value.slice(0, 40)));
$('#plabel').addEventListener('keydown', e => { if (e.key === 'Enter') closePop(); });
$('#pcol').addEventListener('click', e => { const c = e.target.dataset.c; if (c) modArrow(a => a.color = c); });
$('#pstyle').onclick = () => modArrow(a => a.style = a.style === 'elbow' ? 'straight' : 'elbow');
$('#plock').onclick = () => modArrow(a => a.locked = !a.locked, true);
$('#pdel').onclick = () => { const a = arrowOf(popId); if (a && a.locked) return toast('🔒 Šipka je zamknutá – nejdřív ji odemkni'); snap(); S.arrows = S.arrows.filter(x => x.id !== popId); closePop(); commit(); };
document.addEventListener('mousedown', e => { if (!e.target.closest('#pop') && !e.target.closest('#ag g')) closePop(); });
new ResizeObserver(drawArrows).observe($('#wrap'));

// ---------- Víc nástěnek (záložky) ----------
function renderTabs() {
  $('#tabs').innerHTML = ALL.boards.map(b => `<button class="tab${b.id === ALL.active ? ' on' : ''}" data-id="${b.id}" title="Dvojklik = přejmenovat · Ctrl+${ALL.boards.indexOf(b) + 1}">${esc(b.name)}${tabCnt(b)}${b.id === ALL.active && ALL.boards.length > 1 ? '<span class="x" title="Smazat nástěnku">×</span>' : ''}</button>`).join('') + '<button id="addb" class="tab" title="Nová nástěnka">+</button>';
}
const tabs = $('#tabs');
tabs.addEventListener('click', e => {
  if (e.target.id === 'addb') { snap(); const b = newBoard('Nástěnka ' + (ALL.boards.length + 1)); ALL.boards.push(b); setActive(b.id); return commit(); }
  const t = e.target.closest('.tab[data-id]'); if (!t) return;
  if (e.target.classList.contains('x')) {
    snap(); const gone = ALL.boards.find(b => b.id === ALL.active); gone.cells.forEach(c => toTrash(c, gone.name));
    ALL.boards = ALL.boards.filter(b => b.id !== ALL.active); setActive(ALL.boards[0].id); commit();
    return toast('Nástěnka smazána (snímky jsou v koši)', 'Vrátit', doUndo);
  }
  if (+t.dataset.id !== ALL.active) { setActive(+t.dataset.id); persist(); render(); }
});
tabs.addEventListener('dblclick', e => {
  const t = e.target.closest('.tab[data-id]'); if (!t || e.target.classList.contains('x')) return;
  const b = ALL.boards.find(x => x.id === +t.dataset.id), inp = document.createElement('input');
  inp.value = b.name; inp.maxLength = 30; inp.className = 'tabinp'; t.replaceWith(inp); inp.focus(); inp.select();
  let done = false;
  const fin = ok => { if (done) return; done = true; const v = inp.value.trim(); if (ok && v && v !== b.name) { snap(); b.name = v; persist(); } renderTabs(); };
  inp.onkeydown = ev => { if (ev.key === 'Enter') fin(true); if (ev.key === 'Escape') fin(false); ev.stopPropagation(); };
  inp.onblur = () => fin(true);
});
// přetažení obrázku na záložku = přesun do jiné nástěnky
tabs.addEventListener('dragover', e => { const t = e.target.closest('.tab[data-id]'); if (from >= 0 && t) { e.preventDefault(); t.classList.add('over'); } });
tabs.addEventListener('dragleave', e => { const t = e.target.closest('.tab'); if (t) t.classList.remove('over'); });
tabs.addEventListener('drop', e => {
  e.preventDefault();
  const t = e.target.closest('.tab[data-id]'); if (!t || from < 0) return;
  const T = ALL.boards.find(b => b.id === +t.dataset.id), c = S.cells[from];
  if (!T || T === S || !c) return renderTabs();
  const n = T.cols * T.rows; while (T.cells.length < n) T.cells.push(null);
  const k = T.cells.slice(0, n).findIndex(x => !x);
  if (k < 0) { renderTabs(); return toast('Cílová nástěnka je plná'); }
  snap(); T.cells[k] = c; S.cells[from] = null; dropArrows(c.id); commit();
  toast('Přesunuto do „' + T.name + '"');
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key) && ALL.boards[+e.key - 1] && e.target.tagName !== 'INPUT') { e.preventDefault(); setActive(ALL.boards[+e.key - 1].id); persist(); render(); }
});

// ---------- Zoom a posun uvnitř buňky ----------
let pan = null, zt;
const cellOf = e => { const el = e.target.closest('.cell'); return el && { el, c: S.cells[+el.dataset.i] }; };
function clampZ(z, r) {
  if (z.s <= 1.001) { z.s = 1; z.x = z.y = 0; return; }
  z.x = Math.min(0, Math.max(r.width - r.width * z.s, z.x)); z.y = Math.min(0, Math.max(r.height - r.height * z.s, z.y));
}
function applyZ(el, z) { const im = el.querySelector('img'); if (im) im.style.transform = `translate(${z.x}px,${z.y}px) scale(${z.s})`; }
grid.addEventListener('wheel', e => {
  const o = cellOf(e); if (!o || !o.c || o.el.classList.contains('max')) return;
  e.preventDefault();
  const r = o.el.getBoundingClientRect(), z = o.c.z || (o.c.z = { s: 1, x: 0, y: 0 }), mx = e.clientX - r.left, my = e.clientY - r.top;
  const s2 = Math.max(1, Math.min(8, z.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15))), k = s2 / z.s;
  z.x = mx - (mx - z.x) * k; z.y = my - (my - z.y) * k; z.s = s2;
  clampZ(z, r); applyZ(o.el, z); clearTimeout(zt); zt = setTimeout(persist, 400);
}, { passive: false });
grid.addEventListener('mousedown', e => {
  const o = cellOf(e); if (!o || !o.c || e.target.closest('button')) return;
  if (e.button === 1) { e.preventDefault(); o.c.z = null; applyZ(o.el, { s: 1, x: 0, y: 0 }); return persist(); }   // střední tlačítko = reset zoomu
  if (e.button || !o.c.z || o.c.z.s <= 1 || o.el.classList.contains('max')) return;
  o.el.draggable = false; e.preventDefault();
  pan = { ...o, x: e.clientX, y: e.clientY, zx: o.c.z.x, zy: o.c.z.y, r: o.el.getBoundingClientRect() };
});
addEventListener('mousemove', e => { if (!pan) return; const z = pan.c.z; z.x = pan.zx + e.clientX - pan.x; z.y = pan.zy + e.clientY - pan.y; clampZ(z, pan.r); applyZ(pan.el, z); });
addEventListener('mouseup', () => { if (!pan) return; pan.el.draggable = !pan.c.locked; pan = null; persist(); });

// ---------- Zkratky, monitor, diagnostika ----------
let SET = null;
function showSet() {
  if (!SET) return;
  $('#kfull').value = SET.settings.fullKey.replace('CommandOrControl', 'Ctrl'); $('#kreg').value = SET.settings.regKey.replace('CommandOrControl', 'Ctrl');
  for (const [id, k] of [['sfull', 'full'], ['sreg', 'region']]) {
    const el = $('#' + id), ok = SET.status[k];
    el.textContent = ok ? '✔' : '✖ obsazená'; el.className = ok ? 'ok' : 'bad';
  }
  $('#mon').innerHTML = '<option value="auto">Automaticky (kde je kurzor)</option>' + SET.displays.map(d => `<option value="${d.id}">${esc(d.label)}</option>`).join('');
  $('#mon').value = SET.settings.monitor;
  $('#theme').value = SET.settings.theme || 'dark'; applyTheme();
  $('#ver').textContent = 'Verze ' + SET.version;
  $('#chl').innerHTML = CHANGELOG.map(r => `<h5>${r.v}</h5><ul>${r.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`).join('');
}
function applyTheme() {
  const t = (SET && SET.settings.theme) || 'dark';
  document.documentElement.dataset.theme = (t === 'light' || (t === 'auto' && matchMedia('(prefers-color-scheme: light)').matches)) ? 'light' : 'dark';
}
matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
$('#theme').onchange = async e => { SET = await api.setSettings({ theme: e.target.value }); showSet(); };
// ---------- Koš, hledání, popisky ----------
function toTrash(c, board) {
  if (!c) return;
  ALL.trash.unshift({ ...c, locked: false, deleted: Date.now(), board: board || S.name });
  if (ALL.trash.length > 300) ALL.trash.length = 300;
}
function updTrash() { $('#trashb .bd').textContent = ALL.trash.length || ''; }
function matchQ(c) {
  const q = ($('#q').value || '').trim().toLowerCase(); if (!q) return true;
  return [c.title, c.note, (c.tags || []).join(' ')].join(' ').toLowerCase().includes(q);
}
function tabCnt(b) { const q = ($('#q').value || '').trim(); return q ? `<small>(${b.cells.filter(c => c && matchQ(c)).length})</small>` : ''; }
function capHtml(c) { return (c.title || (c.tags && c.tags.length)) ? `<div class="cap">${esc(c.title || '')}${(c.tags || []).map(t => `<span class="tg">${esc(t)}</span>`).join('')}</div>` : ''; }
function accel(e) {
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return null;
  const m = []; if (e.ctrlKey || e.metaKey) m.push('CommandOrControl'); if (e.altKey) m.push('Alt'); if (e.shiftKey) m.push('Shift');
  const map = { ' ': 'Space', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', Escape: null, Tab: null };
  let k = e.key; if (k in map) k = map[k]; if (!k) return null;
  if (k.length === 1) k = k.toUpperCase();
  if (!m.length && !/^F\d+$|^PrintScreen$/.test(k)) return null;
  return [...m, k].join('+');
}
for (const [id, key] of [['kfull', 'fullKey'], ['kreg', 'regKey']]) {
  const h = async e => {
    if (e.type === 'keyup' && e.key !== 'PrintScreen') return;
    e.preventDefault(); const a = accel(e); if (!a) return;
    SET = await api.setSettings({ [key]: a }); showSet();
    if (!SET.status[key === 'fullKey' ? 'full' : 'region']) toast('⚠ Tuto zkratku už používá jiná aplikace – zvol jinou');
  };
  $('#' + id).addEventListener('keydown', h); $('#' + id).addEventListener('keyup', h);
}
$('#mon').onchange = async e => { SET = await api.setSettings({ monitor: e.target.value }); showSet(); };
$('#diag').onclick = async () => {
  const r = await api.diag();
  $('#dgtxt').textContent = r.text;
  $('#dgth').innerHTML = r.thumbs.map(t => `<figure>${t.url ? `<img src="${t.url}">` : '<div>(prázdný náhled)</div>'}<figcaption>${esc(t.label)}</figcaption></figure>`).join('');
  $('#dg').hidden = false;
};
$('#dgcopy').onclick = () => { navigator.clipboard.writeText($('#dgtxt').textContent); toast('Zkopírováno'); };
$('#dgtest').onclick = () => { $('#dg').hidden = true; api.captureRegion(); };

(async () => {
  dir = api.dir();
  const saved = await api.load();
  if (saved && saved.boards) { ALL = { ...saved, trash: saved.trash || [], boards: saved.boards.map(b => ({ ...newBoard(''), ...b })) }; }
  else if (saved) ALL.boards[0] = { ...ALL.boards[0], ...saved, id: ALL.boards[0].id, name: 'Nástěnka 1' };   // starý formát z v0.1–0.3
  setActive(ALL.active); sync(); render();
  api.onShot(place);
  api.onError(m => toast('⚠ ' + m));
  SET = await api.getSettings(); showSet();
  if (!SET.status.full || !SET.status.region) { openModal('#set'); toast('⚠ Některá zkratka je obsazená jinou aplikací – změň ji v Nastavení'); }
})();
