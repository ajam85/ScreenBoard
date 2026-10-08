// Koš, detail obrázku (název/poznámka/štítky), porovnání snímků, report
const openModal = s => { $(s).hidden = false; };
document.addEventListener('click', e => {
  const mc = e.target.closest('.mclose'); if (mc) mc.closest('.modal').hidden = true;
  else if (e.target.classList.contains('modal')) e.target.hidden = true;
});

// ---------- Koš ----------
function renderTrash() {
  const t = ALL.trash;
  $('#trgrid').innerHTML = t.length ? t.map((c, i) => `<figure data-i="${i}"><img src="${url(c.view || c.file)}"><div class="cp">${esc(c.title || new Date(c.deleted).toLocaleString(LANG() === 'en' ? 'en-GB' : 'cs'))}<br><small>${esc(c.board || '')}</small></div><div><button data-a="rs">Obnovit</button><button data-a="rm" class="ghost">Smazat</button></div></figure>`).join('') : '<p>Koš je prázdný.</p>';
}
$('#trashb').onclick = () => { renderTrash(); openModal('#trash'); };
$('#trgrid').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  const i = +b.closest('figure').dataset.i, c = ALL.trash[i]; if (!c) return;
  if (b.dataset.a === 'rs') {
    pad(); const k = S.cells.slice(0, N()).findIndex(x => !x);
    if (k < 0) return toast('Aktivní nástěnka je plná – uvolni buňku');
    snap(); const { deleted, board, ...r } = c; r.locked = false; S.cells[k] = r; ALL.trash.splice(i, 1); commit(); renderTrash();
  } else if (confirm(T('Smazat obrázek z disku natrvalo?'))) {
    api.deleteFiles([c.file, c.view].filter(Boolean)); undo.length = 0; ALL.trash.splice(i, 1); persist(); updTrash(); renderTrash();
  }
};
$('#trempty').onclick = () => {
  if (!ALL.trash.length || !confirm(T('Vysypat celý koš? Soubory se smažou z disku natrvalo.'))) return;
  api.deleteFiles(ALL.trash.flatMap(c => [c.file, c.view].filter(Boolean))); undo.length = 0; ALL.trash = []; persist(); updTrash(); renderTrash();
};

// ---------- Detail obrázku ----------
let dcell = null;
function openDetail(c) {
  dcell = c; $('#dtitle').value = c.title || ''; $('#dnote').value = c.note || ''; $('#dtags').value = (c.tags || []).join(', ');
  openModal('#detail'); $('#dtitle').focus();
}
$('#dq').onclick = e => {
  const t = e.target.dataset.t; if (!t) return;
  const v = $('#dtags').value.split(',').map(s => s.trim()).filter(Boolean); if (!v.includes(t)) v.push(t); $('#dtags').value = v.join(', ');
};
$('#dsave').onclick = () => {
  if (!dcell) return; snap();
  dcell.title = $('#dtitle').value.trim(); dcell.note = $('#dnote').value.trim();
  dcell.tags = [...new Set($('#dtags').value.split(',').map(s => s.trim()).filter(Boolean))];
  $('#detail').hidden = true; commit();
};

// ---------- Porovnání dvou snímků ----------
let CMP = null, cmode = 'ov';
const cvals = { ov: 50, sp: 50, df: 30 }, clbl = { ov: 'Průhlednost', sp: 'Pozice', df: 'Citlivost' };
const loadImg = u => new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = u; });
async function openCompare(a, b) {
  try {
    const [ia, ib] = await Promise.all([api.readPng(a.view || a.file), api.readPng(b.view || b.file)].map(p => p.then(loadImg)));
    const W = Math.min(ia.naturalWidth, 1600), H = Math.round(W * ia.naturalHeight / ia.naturalWidth);
    const mk = im => { const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(im, 0, 0, W, H); return c; };
    CMP = { A: mk(ia), B: mk(ib), W, H, diffAspect: Math.abs(ia.naturalWidth / ia.naturalHeight - ib.naturalWidth / ib.naturalHeight) > 0.02, dA: null, dB: null };
    cmode = 'ov'; cmpUi(); openModal('#cmp'); cmpDraw();
  } catch (e) { toast('⚠ Porovnání se nepodařilo načíst'); }
}
function cmpUi() {
  document.querySelectorAll('#cmpmodes button').forEach(b => b.classList.toggle('on', b.dataset.m === cmode));
  $('#cmplbl').textContent = clbl[cmode]; $('#cmprng').value = cvals[cmode];
}
function cmpDraw() {
  if (!CMP) return;
  const cv = $('#cmpc'), g = cv.getContext('2d'), { A, B, W, H } = CMP, v = cvals[cmode];
  cv.width = W; cv.height = H; let info = CMP.diffAspect ? 'Jiný poměr stran – porovnání je přibližné. ' : '';
  g.drawImage(A, 0, 0);
  if (cmode === 'ov') { g.globalAlpha = v / 100; g.drawImage(B, 0, 0); g.globalAlpha = 1; }
  else if (cmode === 'sp') {
    const x = Math.round(W * v / 100);
    g.save(); g.beginPath(); g.rect(0, 0, x, H); g.clip(); g.drawImage(B, 0, 0); g.restore();
    g.fillStyle = '#fff'; g.fillRect(x - 1, 0, 2, H);
  } else {
    CMP.dA = CMP.dA || A.getContext('2d').getImageData(0, 0, W, H); CMP.dB = CMP.dB || B.getContext('2d').getImageData(0, 0, W, H);
    const a = CMP.dA.data, b = CMP.dB.data, o = g.createImageData(W, H), od = o.data, thr = v * 1.5; let n = 0;
    for (let i = 0; i < a.length; i += 4) {
      const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
      if (d > thr) { od[i] = 255; od[i + 1] = 0; od[i + 2] = 60; n++; } else { od[i] = a[i] * .35; od[i + 1] = a[i + 1] * .35; od[i + 2] = a[i + 2] * .35; }
      od[i + 3] = 255;
    }
    g.putImageData(o, 0, 0); info += `Odlišných pixelů: ${(100 * n / (W * H)).toFixed(2)} %`;
  }
  $('#cmpinfo').textContent = info;
}
$('#cmpmodes').onclick = e => { const m = e.target.dataset.m; if (m) { cmode = m; cmpUi(); cmpDraw(); } };
$('#cmprng').oninput = e => { cvals[cmode] = +e.target.value; cmpDraw(); };

// ---------- Report ----------
$('#repb').onclick = () => {
  $('#rtitle').value = 'Report – ' + S.name;
  const html = S.cells.slice(0, N()).map((c, i) => c ? `<label><input type="checkbox" data-i="${i}" checked><img src="${url(c.view || c.file)}"> ${esc(c.title || 'Obrázek ' + (i + 1))}${(c.tags || []).map(t => `<span class="tg">${esc(t)}</span>`).join('')}</label>` : '').join('');
  $('#rlist').innerHTML = html || '<p>Nástěnka je prázdná.</p>';
  openModal('#rep');
};
function repItems() {
  return [...document.querySelectorAll('#rlist input:checked')].map(x => +x.dataset.i).map((i, n) => {
    const c = S.cells[i]; return { n: n + 1, title: c.title || (LANG() === 'en' ? 'Step ' : 'Krok ') + (n + 1), note: c.note || '', tags: c.tags || [], file: c.view || c.file };
  });
}
async function doRep(kind) {
  const items = repItems(); if (!items.length) return toast('Vyber alespoň jeden obrázek');
  const title = $('#rtitle').value.trim() || 'Report';
  if (kind === 'txt') {
    const md = `# ${title}\n\n` + items.map(it => `## ${it.n}. ${it.title}\n` + (it.tags.length ? `${LANG() === 'en' ? 'Tags' : 'Štítky'}: ${it.tags.join(', ')}\n` : '') + (it.note ? `${it.note}\n` : '') + `${LANG() === 'en' ? 'Attachment' : 'Příloha'}: ${it.file}\n`).join('\n');
    await navigator.clipboard.writeText(md); return toast('Text reportu je ve schránce');
  }
  toast('Připravuji report…');
  const r = await (kind === 'pdf' ? api.reportPdf : api.reportMd)({ title, items });
  toast(r.ok ? '✔ Report uložen' : (r.msg || 'Zrušeno'));
}
$('#rpdf').onclick = () => doRep('pdf'); $('#rmd').onclick = () => doRep('md'); $('#rtxt').onclick = () => doRep('txt');

// ---------- Nastavení: levá navigace po částech ----------
function showSec(id) {
  document.querySelectorAll('.snav button').forEach(b => b.classList.toggle('on', b.dataset.s === id));
  document.querySelectorAll('.spane').forEach(p => p.hidden = p.dataset.s !== id);
}
$('.snav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) showSec(b.dataset.s); });
$('#openimg').onclick = () => api.openFolder();

// ---------- Vložení obrázku ze schránky (Ctrl+V) ----------
document.addEventListener('keydown', async e => {
  if (!((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v')) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;   // psaní textu nechat být
  if (document.querySelector('.modal:not([hidden])') || !$('#ed').hidden) return;
  e.preventDefault();
  if (!(await api.pasteImage())) toast('Ve schránce není žádný obrázek');
});

// ---------- Pole galerie: vložení ze souboru a ze schránky ----------
$('#impf').onclick = () => api.importFiles();
$('#impc').onclick = async () => { if (!(await api.pasteImage())) toast('Ve schránce není žádný obrázek'); };
