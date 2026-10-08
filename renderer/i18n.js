// Dvojjazyčné rozhraní CZ / EN. Čeština je výchozí; angličtina se doplňuje překladem textů za běhu.
// Delší bloky (Ovládání, Tipy a návody) mají dvě verze označené data-l="cs" / data-l="en".
(() => {
  const EN = {
    // horní lišta a záložky
    'Celý monitor': 'Full monitor', 'Výřez oblasti': 'Region capture', 'Oblast': 'Region', 'Zpět': 'Undo',
    'Hledat (název, poznámka, štítek)…': 'Search (title, note, tag)…',
    'Report z obrázků (PDF / Markdown)': 'Report from images (PDF / Markdown)', 'Report': 'Report', 'Koš': 'Trash',
    'Otevřít složku se snímky': 'Open the screenshots folder', 'Nastavení': 'Settings',
    'Vložit obrázek ze souboru…': 'Add image from file…', 'Vložit obrázek ze schránky (Ctrl+V)': 'Paste image from clipboard (Ctrl+V)',
    'Smazat nástěnku': 'Delete board', 'Nová nástěnka': 'New board',
    // šipky
    'Popisek (např. ×3)': 'Label (e.g. ×3)', 'Tvar šipky': 'Arrow shape', 'Zamknout šipku': 'Lock arrow', 'Odemknout šipku': 'Unlock arrow',
    'Smazat šipku': 'Delete arrow', '↳ Zalomená': '↳ Elbow', '— Přímá': '— Straight',
    // tlačítka na obrázku
    'Zamknout / odemknout': 'Lock / unlock', 'Zvětšit přes celé okno (Esc = zpět)': 'Enlarge to the whole window (Esc = back)',
    'Upravit / anotovat (QA) – nebo dvojklik na obrázek': 'Edit / annotate (QA) – or double-click the image',
    'Název, poznámka, štítky': 'Title, note, tags', 'Spojit šipkou s jiným obrázkem': 'Connect to another image with an arrow',
    'Porovnat s jiným snímkem': 'Compare with another image', 'Kopírovat obrázek do schránky': 'Copy the image to the clipboard', 'Smazat': 'Delete',
    // nastavení
    'Nástěnka': 'Board', 'Snímání': 'Capturing', 'Vzhled a jazyk': 'Appearance and language', 'Ukládání do složek': 'Saving to folders',
    'Tipy a návody': 'Tips and guides', 'Nástroje a nápověda': 'Tools and help',
    'Platí pro právě otevřenou záložku nástěnky.': 'Applies to the currently open board tab.',
    'Počet sloupců': 'Number of columns', 'Počet řádků': 'Number of rows', 'Mezera mezi obrázky': 'Gap between images', 'v pixelech': 'in pixels',
    'Zobrazení obrázku v buňce': 'Image display in a cell', 'Celý obrázek se vejde celý, „Vyplnit" ořízne okraje.': '“Whole image” fits the entire image, “Fill the cell” crops the edges.',
    'Celý obrázek': 'Whole image', 'Vyplnit buňku': 'Fill the cell',
    'Zkratky fungují v celém systému, i když je aplikace schovaná.': 'Shortcuts work system-wide, even when the app is hidden.',
    'Zkratka: celý monitor': 'Shortcut: full monitor', 'Klikni do pole a stiskni novou kombinaci kláves.': 'Click the field and press a new key combination.',
    'Zkratka: výřez oblasti': 'Shortcut: region capture', 'Po stisku označ oblast myší. Esc nebo pravé tlačítko zruší.': 'After pressing, select an area with the mouse. Esc or the right button cancels.',
    'Snímaný monitor': 'Monitor to capture', 'Automaticky = ten, kde je právě kurzor.': 'Automatic = the one with the cursor.',
    'Automaticky (kde je kurzor)': 'Automatic (where the cursor is)', '✖ obsazená': '✖ in use',
    'Barevné podání a jazyk celé aplikace.': 'Colour scheme and language of the whole app.', 'Motiv': 'Theme',
    '„Podle systému" se řídí nastavením Windows.': '“Follow system” uses your Windows setting.',
    'Světlý': 'Light', 'Tmavý': 'Dark', 'Podle systému': 'Follow system',
    'Přepne celou aplikaci mezi češtinou a angličtinou.': 'Switches the whole app between Czech and English.',
    'Na každém obrázku jsou dvě barevná tlačítka uložení. Každé ukládá kopii obrázku (včetně úprav) do jiné složky. Když složka není vybraná, vybere se při prvním kliknutí.':
      'Each image has two coloured save buttons. Each saves a copy of the image (including edits) to a different folder. If a folder is not chosen, it is chosen on the first click.',
    'Název tlačítka': 'Button name', 'zobrazí se v popisku tlačítka': 'shown in the button tooltip', 'Složka': 'Folder', 'kam se ukládají kopie obrázků': 'where image copies are saved',
    '(není vybrána)': '(not chosen)', 'Vybrat…': 'Choose…', 'Zrušit složku': 'Clear folder', 'Barva tlačítka': 'Button colour',
    '(klikni a vyber složku)': '(click and choose a folder)',
    'Složka se snímky': 'Screenshots folder', 'Otevře složku, kam aplikace ukládá všechny snímky.': 'Opens the folder where the app stores all screenshots.', 'Otevřít': 'Open',
    'Diagnostika': 'Diagnostics', 'Ukáže monitory, zkratky a záznam událostí. Hodí se při hledání chyb.': 'Shows monitors, shortcuts and the event log. Useful when troubleshooting.',
    'Ovládání': 'Controls', 'Vyzkoušet výřez': 'Try region capture', 'Kopírovat text': 'Copy text', 'Zkopírováno': 'Copied', '(prázdný náhled)': '(empty preview)',
    // koš, detail, porovnání, report
    'Vysypat koš': 'Empty trash', 'Smazané obrázky se sem ukládají. „Obnovit" je vrátí do první volné buňky aktivní nástěnky.': 'Deleted images are kept here. “Restore” returns them to the first free cell of the active board.',
    'Koš je prázdný.': 'The trash is empty.', 'Obnovit': 'Restore',
    'Název, poznámka a štítky': 'Title, note and tags', 'Název': 'Title', 'Poznámka': 'Note', 'Štítky (oddělené čárkou)': 'Tags (comma-separated)', 'recept': 'recipe',
    'Uložit': 'Save', 'Zrušit': 'Cancel', 'Porovnání snímků': 'Image comparison', 'Překrytí': 'Overlay', 'Posuvník': 'Slider', 'Rozdíl': 'Difference',
    'Průhlednost': 'Opacity', 'Pozice': 'Position', 'Citlivost': 'Sensitivity',
    'Report z obrázků': 'Report from images', 'Název reportu': 'Report title',
    'Pořadí podle nástěnky (zleva doprava, shora dolů). Název, poznámka a štítky se berou z ikony i (informace).': 'Order follows the board (left to right, top to bottom). Title, note and tags are taken from the i (information) icon.',
    'Export PDF': 'Export PDF', 'Export Markdown (složka)': 'Export Markdown (folder)', 'Nástěnka je prázdná.': 'The board is empty.',
    // editor
    'Zpět (Ctrl+Z)': 'Undo (Ctrl+Z)', 'Znovu (Ctrl+Y)': 'Redo (Ctrl+Y)', 'Kopírovat obrázek i s úpravami do schránky': 'Copy the image with its edits to the clipboard',
    'Velikost': 'Size', 'Při kliknutí pipetou zapíše do obrázku značku + a text s kódem barvy': 'When picking with the pipette, writes a + mark and the colour code text into the image',
    'Barva do obrázku': 'Colour into image', 'Potvrdit ořez (Enter)': 'Confirm crop (Enter)', 'Zrušit výběr (Esc)': 'Cancel selection (Esc)',
    'Zrušit ořez – vrátit celý snímek': 'Cancel crop – restore the whole image', 'Uložit úpravy': 'Save edits', 'Zrušit bez uložení (Esc)': 'Cancel without saving (Esc)',
    'Aktuální barva – klikni pro vlastní': 'Current colour – click to choose your own',
    'Šipka': 'Arrow', 'Obdélník': 'Rectangle', 'Elipsa': 'Ellipse', 'Zvýraznit': 'Highlight', 'Číslo': 'Number', 'Rozmazat': 'Blur', 'Pravítko': 'Ruler', 'Pipeta': 'Pipette', 'Ořez': 'Crop',
    'Obrázek (i s úpravami) je ve schránce': 'The image (with edits) is in the clipboard',
    // hlášky
    'Není co vracet': 'Nothing to undo', 'Šipka vytvořena – klikni na ni pro popisek, barvu a tvar': 'Arrow created – click it to set the label, colour and shape',
    'Spojování zrušeno': 'Linking cancelled', 'Obrázek je ve schránce': 'The image is in the clipboard', 'Kopírování se nepodařilo': 'Copying failed',
    'Obrázek je v koši': 'The image is in the trash', 'Vrátit': 'Undo',
    'Všechny buňky jsou zamknuté – snímek je v koši': 'All cells are locked – the screenshot is in the trash',
    'Obrázek je zamknutý – nejdřív ho odemkni': 'The image is locked – unlock it first', 'Cílová buňka je zamknutá': 'The target cell is locked',
    'Šipka je zamknutá – nejdřív ji odemkni': 'The arrow is locked – unlock it first',
    'Klikni na druhý snímek k porovnání (Esc = zrušit)': 'Click the second image to compare (Esc = cancel)', 'Klikni na cílový obrázek (Esc = zrušit)': 'Click the target image (Esc = cancel)',
    'Nástěnka smazána (snímky jsou v koši)': 'Board deleted (its images are in the trash)', 'Cílová nástěnka je plná': 'The target board is full',
    'Tuto zkratku už používá jiná aplikace – zvol jinou': 'This shortcut is already used by another application – choose another one',
    'Některá zkratka je obsazená jinou aplikací – změň ji v Nastavení': 'A shortcut is used by another application – change it in Settings',
    'Aktivní nástěnka je plná – uvolni buňku': 'The active board is full – free a cell',
    'Smazat obrázek z disku natrvalo?': 'Delete the image from disk permanently?', 'Vysypat celý koš? Soubory se smažou z disku natrvalo.': 'Empty the whole trash? The files will be deleted from disk permanently.',
    'Porovnání se nepodařilo načíst': 'The comparison could not be loaded', 'Vyber alespoň jeden obrázek': 'Select at least one image',
    'Text reportu je ve schránce': 'The report text is in the clipboard', 'Připravuji report…': 'Preparing the report…', 'Report uložen': 'Report saved', 'Zrušeno': 'Cancelled',
    'Ve schránce není žádný obrázek': 'There is no image in the clipboard',
    'Snímek obrazovky se nepodařilo pořídit – otevři Nastavení → Diagnostika': 'The screenshot could not be taken – open Settings → Diagnostics',
    'Snímek je prázdný': 'The screenshot is empty', 'Výběr oblasti se nepodařilo zobrazit – otevři Nastavení → Diagnostika': 'The region selector could not be shown – open Settings → Diagnostics',
    'Snímek pro výběr se nepodařilo načíst': 'The image for the selection could not be loaded', 'Složka neexistuje – vyber ji znovu v Nastavení': 'The folder does not exist – choose it again in Settings'
  };
  const RX = [
    [/^Nástěnka (\d+)$/, 'Board $1'], [/^Složka (\d+)$/, 'Folder $1'], [/^Obrázek (\d+)$/, 'Image $1'], [/^Krok (\d+)$/, 'Step $1'],
    [/^Tlačítko uložení (\d+)$/, 'Save button $1'], [/^Dvojklik = přejmenovat · Ctrl\+(\d+)$/, 'Double-click = rename · Ctrl+$1'],
    [/^Přesunuto do „(.*)"$/s, m => `Moved to “${m[1]}”`],
    [/^Uloženo \((.*)\): (.*)$/s, m => `Saved (${tr(m[1])}): ${m[2]}`],
    [/^(.*): \(klikni a vyber složku\)$/s, m => `${tr(m[1])}: (click and choose a folder)`],
    [/^Barva (.*) · zkopírováno$/s, 'Colour $1 · copied'],
    [/^Chyba: (.*)$/s, 'Error: $1'], [/^Soubor nelze načíst: (.*)$/s, 'Cannot read file: $1'],
    [/^Vložení ze schránky se nepodařilo: (.*)$/s, 'Pasting from the clipboard failed: $1'],
    [/^Uložení se nepodařilo: (.*)$/s, 'Saving failed: $1'], [/^Report se nepodařilo vytvořit: (.*)$/s, 'The report could not be created: $1']
  ];
  const SUBS = [['Jiný poměr stran – porovnání je přibližné.', 'Different aspect ratio – the comparison is approximate.'], [/Odlišných pixelů: ([\d.]+) %/, 'Different pixels: $1 %']];
  let lang = 'cs', busy = false;

  function look(core) {
    if (Object.prototype.hasOwnProperty.call(EN, core)) return EN[core];
    for (const [re, rep] of RX) { const x = core.match(re); if (x) return typeof rep === 'function' ? rep(x) : core.replace(re, rep); }
    const pm = core.match(/^([\u26a0\u2714\u2716\u{1F512}]\s+)([\s\S]+)$/u);   // ⚠ ✔ ✖ 🔒 na začátku hlášky
    if (pm) { const r = look(pm[2]); if (r !== null) return pm[1] + r; }
    let out = core, hit = false;
    for (const [a, b] of SUBS) if (typeof a === 'string' ? out.includes(a) : a.test(out)) { out = out.replace(a, b); hit = true; }
    return hit ? out : null;
  }
  function tr(s) {
    if (lang !== 'en' || !s) return s;
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/); if (!m[2]) return s;
    const r = look(m[2]); return r === null ? s : m[1] + r + m[3];
  }

  const SKIP = 'script,style,[data-l],#dgtxt,textarea,#chl', ATTRS = ['title', 'placeholder', 'data-tip'];
  function doText(n) {
    const p = n.parentElement; if (!p || p.closest(SKIP)) return;
    if (lang === 'en') {
      if (n.__en !== undefined && n.nodeValue === n.__en) return;   // vlastní zápis
      const o = n.nodeValue, t = tr(o);
      if (t !== o) { n.__cs = o; n.__en = t; n.nodeValue = t; } else { delete n.__cs; delete n.__en; }
    } else if (n.__cs !== undefined) { n.nodeValue = n.__cs; delete n.__cs; delete n.__en; }
  }
  function doAttrs(el) {
    if (el.closest && el.closest(SKIP)) return;
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      const cur = el.getAttribute(a), rec = el.__a && el.__a[a];
      if (lang === 'en') {
        if (rec && cur === rec.en) continue;
        const t = tr(cur);
        if (t !== cur) { (el.__a = el.__a || {})[a] = { cs: cur, en: t }; el.setAttribute(a, t); } else if (rec) delete el.__a[a];
      } else if (rec) { el.setAttribute(a, rec.cs); delete el.__a[a]; }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1) return;
    doAttrs(root); root.querySelectorAll('[title],[placeholder],[data-tip]').forEach(doAttrs);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), arr = []; let n;
    while ((n = w.nextNode())) arr.push(n);
    arr.forEach(doText);
  }
  const mo = new MutationObserver(ms => {
    if (busy || lang !== 'en') return;
    busy = true;
    try {
      for (const m of ms) {
        if (m.type === 'childList') m.addedNodes.forEach(walk);
        else if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') doAttrs(m.target);
      }
    } finally { busy = false; mo.takeRecords(); }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });

  function set(l) {
    lang = l === 'en' ? 'en' : 'cs';
    document.documentElement.lang = lang;
    busy = true; walk(document.body); busy = false; mo.takeRecords();
    document.querySelectorAll('.lg').forEach(e => e.classList.toggle('on', e.dataset.lCode === lang));
  }
  window.I18N = { set, tr, lang: () => lang };
  window.T = tr; window.LANG = () => lang;
  document.querySelectorAll('.lg').forEach(e => e.classList.toggle('on', e.dataset.lCode === lang));
})();
