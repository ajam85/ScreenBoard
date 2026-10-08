const { app, BrowserWindow, globalShortcut, desktopCapturer, screen, ipcMain, dialog, shell, clipboard, nativeImage } = require('electron');
const path = require('path'), fs = require('fs');
// Chromium se na Windows někdy nemůže přesunout/vytvořit složku s mezipamětí (přístup odepřen, běží druhá kopie aplikace).
// Mezipaměť proto dáváme do dočasné složky a spouštíme jen jednu instanci.
app.setName('ScreenBoard');
try {   // přejmenování PrintScreen -> ScreenBoard: převzít snímky a nástěnky ze staré složky
  const oldD = path.join(app.getPath('appData'), 'printscreen', 'data'), newD = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(newD) && fs.existsSync(oldD)) fs.cpSync(oldD, newD, { recursive: true });
} catch {}
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disk-cache-dir', path.join(app.getPath('temp'), 'ScreenBoard-cache'));
if (!app.requestSingleInstanceLock()) app.exit(0);
app.on('second-instance', () => { if (win && !win.isDestroyed()) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
let win, selWin, pending, settings, shortStatus = {};
const dataDir = () => path.join(app.getPath('userData'), 'data');
const imgDir = () => path.join(dataDir(), 'images');
const file = n => path.join(dataDir(), n);
const readJson = (n, d) => { try { return JSON.parse(fs.readFileSync(file(n), 'utf8')); } catch { return d; } };
const writeJson = (n, v) => fs.writeFileSync(file(n), JSON.stringify(v, null, 2));
const escH = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'report';
// zápis obrázku do schránky (novější verze Electronu mají jiné API než 33)
const putImage = img => { if (typeof clipboard.writeImage === 'function') clipboard.writeImage(img); else clipboard.write({ image: img }); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- log (soubor log.txt + posledních 200 řádků v paměti pro Diagnostiku)
const logLines = [];
function log(m) {
  const l = new Date().toISOString().slice(11, 19) + ' ' + m;
  logLines.push(l); if (logLines.length > 200) logLines.shift();
  try { fs.appendFileSync(file('log.txt'), l + '\n'); } catch {}
}
function err(m) { log('UPOZORNĚNÍ: ' + m); if (win && !win.isDestroyed()) win.webContents.send('err', m); }
const safe = fn => async (...a) => { try { await fn(...a); } catch (e) { log('CHYBA: ' + (e && e.stack || e)); err('Chyba: ' + (e && e.message || e)); } };

function createWindow() {
  const displays = screen.getAllDisplays();
  const saved = readJson('window.json', null);
  let b;
  if (saved && displays.some(d => { const a = d.workArea; return saved.x >= a.x && saved.y >= a.y && saved.x < a.x + a.width && saved.y < a.y + a.height; })) b = saved;
  else {
    const d = displays.find(x => x.id !== screen.getPrimaryDisplay().id) || displays[0];
    b = { x: d.workArea.x + 40, y: d.workArea.y + 40, width: Math.min(1200, d.workArea.width - 80), height: Math.min(800, d.workArea.height - 80) };
  }
  win = new BrowserWindow({ ...b, title: 'ScreenBoard', backgroundColor: '#15171c',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true } });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.on('close', () => writeJson('window.json', win.getBounds()));
}

// ---- nastavení a zkratky
const DEFAULTS = { fullKey: 'CommandOrControl+Shift+S', regKey: 'CommandOrControl+Shift+A', monitor: 'auto', theme: 'light',
  saveDirs: [{ name: 'Složka 1', path: '', color: '#2f5d8a' }, { name: 'Složka 2', path: '', color: '#3f8f5b' }] };
function applyShortcuts() {
  globalShortcut.unregisterAll();
  const reg = (key, fn, name) => {
    try { shortStatus[name] = globalShortcut.register(key, safe(fn)) && globalShortcut.isRegistered(key); } catch (e) { shortStatus[name] = false; }
    log(`Zkratka ${name} ${key}: ${shortStatus[name] ? 'OK' : 'NEJDE ZAREGISTROVAT (obsazená jinou aplikací?)'}`);
  };
  reg(settings.fullKey, captureFull, 'full');
  reg(settings.regKey, captureRegion, 'region');
}
const settingsInfo = () => ({ settings, status: shortStatus, version: app.getVersion(),
  displays: screen.getAllDisplays().map((d, i) => ({ id: d.id, label: `Monitor ${i + 1}${d.id === screen.getPrimaryDisplay().id ? ' (primární)' : ''} – ${d.size.width}×${d.size.height}` })) });

// ---- zachycení monitoru
function pickSource(sources, d) {
  let s = sources.find(x => x.display_id && x.display_id === String(d.id));
  if (s) return { s, how: 'display_id' };
  const ar = d.size.width / d.size.height;   // záloha: podle poměru stran, jinak podle pořadí
  const cand = sources.filter(x => { const z = x.thumbnail.getSize(); return z.width && Math.abs(z.width / z.height - ar) < 0.02; });
  if (cand.length === 1) return { s: cand[0], how: 'poměr stran' };
  const idx = screen.getAllDisplays().findIndex(x => x.id === d.id);
  return { s: sources[idx] || sources[0], how: 'pořadí' };
}
async function grab() {
  const all = screen.getAllDisplays();
  let d = settings.monitor !== 'auto' && all.find(x => String(x.id) === String(settings.monitor));
  if (!d) d = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  log(`Snímám displej ${d.id} (${d.size.width}x${d.size.height}, měřítko ${d.scaleFactor})`);
  for (const k of [1, 0.5]) for (let t = 0; t < 2; t++) {
    const sf = (d.scaleFactor || 1) * k;
    const sources = await desktopCapturer.getSources({ types: ['screen'],
      thumbnailSize: { width: Math.round(d.size.width * sf), height: Math.round(d.size.height * sf) } });
    const { s, how } = pickSource(sources, d);
    if (s && !s.thumbnail.isEmpty()) { const z = s.thumbnail.getSize(); log(`OK zdroj ${s.id} (${how}), ${z.width}x${z.height}`); return { d, img: s.thumbnail }; }
    log(`Prázdný snímek (zdrojů ${sources.length}, měřítko ${k}, pokus ${t + 1})`);
    await sleep(200);
  }
  err('Snímek obrazovky se nepodařilo pořídit – otevři Nastavení → Diagnostika');
  return null;
}
function saveShot(img) {
  if (img.isEmpty()) return err('Snímek je prázdný');
  const name = `shot-${Date.now()}.png`;
  fs.writeFileSync(path.join(imgDir(), name), img.toPNG());
  log('Uloženo ' + name);
  if (win && !win.isDestroyed()) win.webContents.send('shot', name);
}
async function captureFull() { const g = await grab(); if (g) saveShot(g.img); }

// ---- výřez: zamrazí monitor a nechá myší označit oblast
async function captureRegion() {
  if (selWin) return;
  const g = await grab(); if (!g) return;
  pending = g;
  const b = g.d.bounds;
  selWin = new BrowserWindow({ show: false, x: b.x, y: b.y, width: b.width, height: b.height, frame: false, resizable: false,
    movable: false, skipTaskbar: true, alwaysOnTop: true, hasShadow: false, backgroundColor: '#000',
    webPreferences: { preload: path.join(__dirname, 'preload-sel.js'), contextIsolation: true } });
  selWin.setAlwaysOnTop(true, 'screen-saver');
  selWin.webContents.on('preload-error', (e, p, er) => log('Chyba preload výběru: ' + er));
  selWin.webContents.on('did-fail-load', (e, c, desc) => log('Výběr se nenačetl: ' + desc));
  selWin.on('closed', () => { selWin = null; pending = null; });
  selWin.loadFile(path.join(__dirname, 'renderer', 'selector.html'));
  setTimeout(() => { if (selWin && !selWin.isVisible()) { selWin.close(); err('Výběr oblasti se nepodařilo zobrazit – otevři Nastavení → Diagnostika'); } }, 5000);
}

app.whenReady().then(() => {
  fs.mkdirSync(imgDir(), { recursive: true });
  try { fs.writeFileSync(file('log.txt'), ''); } catch {}
  settings = { ...DEFAULTS, ...readJson('settings.json', {}) };
  ipcMain.on('dir', e => { e.returnValue = imgDir(); });
  ipcMain.handle('load', () => readJson('board.json', null));
  ipcMain.on('save', (_, s) => writeJson('board.json', s));
  ipcMain.on('capture', safe(captureFull));
  ipcMain.on('capture-region', safe(captureRegion));
  ipcMain.on('open-folder', () => shell.openPath(imgDir()));
  ipcMain.handle('settings-get', () => settingsInfo());
  ipcMain.handle('settings-set', (_, s) => { settings = { ...settings, ...s }; writeJson('settings.json', settings); applyShortcuts(); return settingsInfo(); });
  ipcMain.handle('diag', async () => {
    const all = screen.getAllDisplays();
    const L = [`ScreenBoard ${app.getVersion()} · Electron ${process.versions.electron} · ${process.platform}`,
      'Nastavení: ' + JSON.stringify(settings), 'Stav zkratek: ' + JSON.stringify(shortStatus), 'Kurzor: ' + JSON.stringify(screen.getCursorScreenPoint())];
    all.forEach(d => L.push(`Displej ${d.id}: ${d.size.width}x${d.size.height} na ${d.bounds.x},${d.bounds.y}, měřítko ${d.scaleFactor}${d.id === screen.getPrimaryDisplay().id ? ' (primární)' : ''}`));
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 320, height: 200 } });
    const thumbs = sources.map(s => {
      const z = s.thumbnail.getSize();
      L.push(`Zdroj ${s.id} „${s.name}“ display_id="${s.display_id}" náhled ${z.width}x${z.height}${s.thumbnail.isEmpty() ? ' PRÁZDNÝ' : ''}`);
      return { label: `${s.name} (display_id ${s.display_id || '—'})`, url: s.thumbnail.isEmpty() ? '' : s.thumbnail.toDataURL() };
    });
    L.push('--- log ---', ...logLines.slice(-40));
    return { text: L.join('\n'), thumbs };
  });
  ipcMain.handle('delete-files', (_, names) => { for (const n of names) { try { fs.unlinkSync(path.join(imgDir(), path.basename(n))); } catch {} } log('Smazáno souborů: ' + names.length); });
  ipcMain.handle('report-pdf', async (_, { title, items }) => {
    try {
      const tg = t => t.map(x => `<span class="tg">${escH(x)}</span>`).join('');
      const html = `<!doctype html><meta charset="utf-8"><style>body{font:13px sans-serif;margin:0;color:#111}h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:0 0 4px}img{max-width:100%;border:1px solid #ccc}.tg{background:#e4ecfd;border-radius:3px;padding:1px 6px;margin-right:4px;font-size:11px}section{break-inside:avoid;margin:0 0 16px}</style><h1>${escH(title)}</h1><p>${new Date().toLocaleString('cs')}</p>` +
        items.map(it => `<section><h2>${it.n}. ${escH(it.title)}</h2>${tg(it.tags)}${it.note ? `<p>${escH(it.note).replace(/\n/g, '<br>')}</p>` : ''}<img src="data:image/png;base64,${fs.readFileSync(path.join(imgDir(), path.basename(it.file))).toString('base64')}"></section>`).join('');
      const tmp = file('report-tmp.html'); fs.writeFileSync(tmp, html);
      const w = new BrowserWindow({ show: false }); await w.loadFile(tmp);
      const pdf = await w.webContents.printToPDF({ pageSize: 'A4', printBackground: true }); w.close();
      const r = await dialog.showSaveDialog(win, { defaultPath: slug(title) + '.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }] });
      if (r.canceled || !r.filePath) return { ok: false };
      fs.writeFileSync(r.filePath, pdf); shell.showItemInFolder(r.filePath); return { ok: true };
    } catch (e) { log('Chyba reportu PDF: ' + e.stack); return { ok: false, msg: 'Report se nepodařilo vytvořit: ' + e.message }; }
  });
  ipcMain.handle('report-md', async (_, { title, items }) => {
    try {
      const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'], title: 'Kam uložit report' });
      if (r.canceled || !r.filePaths[0]) return { ok: false };
      const out = path.join(r.filePaths[0], slug(title) + '-' + new Date().toISOString().slice(0, 10)); fs.mkdirSync(out, { recursive: true });
      let md = `# ${title}\n\n_${new Date().toLocaleString('cs')}_\n\n`;
      for (const it of items) {
        const fn = `${String(it.n).padStart(2, '0')}-${slug(it.title)}.png`;
        fs.copyFileSync(path.join(imgDir(), path.basename(it.file)), path.join(out, fn));
        md += `## ${it.n}. ${it.title}\n\n` + (it.tags.length ? `Štítky: ${it.tags.join(', ')}\n\n` : '') + (it.note ? it.note + '\n\n' : '') + `![${it.title}](${fn})\n\n`;
      }
      fs.writeFileSync(path.join(out, 'report.md'), md); shell.openPath(out); return { ok: true };
    } catch (e) { log('Chyba reportu MD: ' + e.stack); return { ok: false, msg: 'Report se nepodařilo vytvořit: ' + e.message }; }
  });
  ipcMain.handle('paste-image', () => {   // Ctrl+V v galerii: obrázek ze schránky -> nový snímek v nástěnce
    try {
      const img = clipboard.readImage();
      if (!img || img.isEmpty()) return false;
      const name = `paste-${Date.now()}.png`; fs.writeFileSync(path.join(imgDir(), name), img.toPNG());
      const z = img.getSize(); log(`Vloženo ze schránky: ${name} (${z.width}x${z.height})`);
      if (win && !win.isDestroyed()) win.webContents.send('shot', name);
      return true;
    } catch (e) { log('Chyba vložení ze schránky: ' + e.message); err('Vložení ze schránky se nepodařilo: ' + e.message); return false; }
  });
  ipcMain.handle('copy-image', (_, du) => { putImage(nativeImage.createFromDataURL(du)); log('Obrázek (z editoru) zkopírován do schránky'); return true; });
  ipcMain.handle('copy-file', (_, name) => {
    const img = nativeImage.createFromPath(path.join(imgDir(), path.basename(name)));
    if (img.isEmpty()) return false; putImage(img); log('Obrázek zkopírován do schránky: ' + name); return true;
  });
  ipcMain.handle('pick-dir', async () => {
    const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'], title: 'Vyber složku pro ukládání obrázků' });
    return r.canceled ? null : r.filePaths[0];
  });
  ipcMain.handle('save-to', (_, name, dir, title) => {
    try {
      if (!dir || !fs.existsSync(dir)) return { ok: false, msg: 'Složka neexistuje – vyber ji znovu v Nastavení' };
      const base = title ? slug(title) : 'ScreenBoard-' + new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
      let fn = base + '.png', n = 1; while (fs.existsSync(path.join(dir, fn))) fn = `${base}-${n++}.png`;
      fs.copyFileSync(path.join(imgDir(), path.basename(name)), path.join(dir, fn)); log('Uloženo do složky: ' + path.join(dir, fn));
      return { ok: true, name: fn };
    } catch (e) { log('Chyba ukládání do složky: ' + e.message); return { ok: false, msg: 'Uložení se nepodařilo: ' + e.message }; }
  });
  ipcMain.handle('save-as', async (_, name) => {
    const src = path.join(imgDir(), path.basename(name));
    const r = await dialog.showSaveDialog(win, { defaultPath: path.basename(name), filters: [{ name: 'PNG', extensions: ['png'] }] });
    if (!r.canceled && r.filePath) { fs.copyFileSync(src, r.filePath); return true; }
    return false;
  });
  ipcMain.handle('read-png', (_, n) => 'data:image/png;base64,' + fs.readFileSync(path.join(imgDir(), path.basename(n))).toString('base64'));
  ipcMain.handle('write-png', (_, du) => { const name = `edit-${Date.now()}.png`; fs.writeFileSync(path.join(imgDir(), name), Buffer.from(du.split(',')[1], 'base64')); return name; });
  ipcMain.handle('sel-get', () => pending ? 'data:image/jpeg;base64,' + pending.img.toJPEG(92).toString('base64') : null);
  ipcMain.on('sel-ready', () => {
    if (!selWin || !pending) return;
    const b = pending.d.bounds;
    selWin.setBounds(b); selWin.show(); selWin.setBounds(b); selWin.focus();   // dvakrát: Windows při různém DPI poprvé nastaví špatnou velikost
    log(`Výběr zobrazen na ${b.x},${b.y} ${b.width}x${b.height}`);
  });
  ipcMain.on('sel-fail', () => { if (selWin) selWin.close(); err('Snímek pro výběr se nepodařilo načíst'); });
  ipcMain.on('sel-done', safe((_, r, v, why) => {
    const p = pending;
    if (selWin) selWin.close();
    if (!p || !r || !v) return log('Výběr zrušen: ' + (why || 'neznámý důvod'));
    const { width: W, height: H } = p.img.getSize();
    const kx = W / v.w, ky = H / v.h;   // poměr podle skutečné velikosti okna, nezávisí na DPI
    const x = Math.max(0, Math.min(W - 1, Math.round(r.x * kx))), y = Math.max(0, Math.min(H - 1, Math.round(r.y * ky)));
    const w = Math.max(1, Math.min(W - x, Math.round(r.w * kx))), h = Math.max(1, Math.min(H - y, Math.round(r.h * ky)));
    log(`Výřez ${w}x${h} z ${W}x${H}`);
    saveShot(p.img.crop({ x, y, width: w, height: h }));
  }));
  createWindow();
  applyShortcuts();
});
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
