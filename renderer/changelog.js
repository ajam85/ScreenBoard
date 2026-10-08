const CHANGELOG = [
  { v: '0.9.0', items: [
    'Pole galerie: ikona složky (vložení obrázku ze souboru) a ikona vložení ze schránky, vpravo v liště záložek.',
    'Návod v části Tipy a návody je přepsán ve formálním stylu; české a anglické názvy v prohlížeči jsou zapsány ve tvaru CZ (EN) a český název příkazu je upraven na „…s celou velikostí".',
    'Přepínač jazyka CZ / EN (v záhlaví i v Nastavení) a kompletní anglická verze aplikace včetně nápovědy a poznámek k verzím.' ] },
  { v: '0.8.3', items: [
    'Nastavení: nová část „Tipy a návody" – postup pro snímek celé webové stránky přes vývojářské nástroje prohlížeče (česky i anglicky), jak snímek dostat do ScreenBoardu a řešení potíží.' ] },
  { v: '0.8.2', items: [
    'Vložení obrázku ze schránky: Ctrl+V v galerii přidá obrázek do první volné buňky aktivní nástěnky (hodí se pro snímky stránek vytvořené v prohlížeči nebo jiném nástroji).' ] },
  { v: '0.8.1', items: [
    'Editor: Uložit a Zrušit jsou ikony s popiskem při najetí; Zpět a Znovu jsou před Velikostí.',
    'Kopírování obrázku do schránky: v editoru i s úpravami ještě před uložením, v galerii tlačítkem u každého obrázku.' ] },
  { v: '0.8.0', items: [
    'Editor: nástroje jsou svislý pás ikon vlevo (jako ve Photoshopu), bez popisků – název se ukáže až po najetí myší.',
    'Editor: výběr barev je pod nástroji – velké okénko aktuální barvy (klik = vlastní barva) a paleta rychlých barev.',
    'Editor: potvrzení a zrušení ořezu jsou ikony s popiskem při najetí.',
    'Další ikony: zvýrazňovač, potvrdit (✔), zavřít okno, přidat nástěnku, export PDF a Markdown, motiv (slunce / měsíc / podle systému).' ] },
  { v: '0.7.1', items: [
    'Nové ikony (Lucide) v celé aplikaci: horní lišta, tlačítka na obrázku, nástroje editoru, zámek a mazání šipek.',
    'Nastavení je přehlednější: vlevo nabídka částí (Nástěnka, Snímání, Vzhled, Ukládání do složek, Nástroje a nápověda), vpravo vždy jen jedna část s popisky u každé volby.',
    'Motiv se volí přepínačem, složky pro ukládání jsou přehledné karty (název, složka, barva).' ] },
  { v: '0.7.0', items: [
    'Aplikace se jmenuje ScreenBoard (dříve PrintScreen). Stávající snímky a nástěnky se při prvním spuštění převezmou.',
    'Nové barevné podání: teplá šedá, bílé karty, jemné okraje, záložky nástěnek s podtržením; světlý motiv je výchozí.',
    'Nastavení: části Ovládání (přehledná tabulka) a Verze jsou rozbalovací; u verze je uvedeno, že na vývoji pomáhala AI (Claude Sonnet 5.5).',
    'Dvě barevná tlačítka uložení na každém obrázku – každé ukládá kopii do jiné složky; složky, názvy a barvy tlačítek se volí v Nastavení.',
    'Ořez v editoru: výběr se nejdřív potvrdí, potom se zobrazí jen vybraná oblast; „Zrušit ořez" vrátí celý snímek.',
    'Editor: „Tloušťka" je nově „Velikost" s číselným polem, které lze přepsat.',
    'Texty zapsané do obrázku (text, pravítko, pipeta) mají zvolenou barvu, takže lze vždy zvolit kontrastní. Pipeta s volbou „Barva do obrázku" už aktuální barvu nepřepisuje.' ] },
  { v: '0.6.1', items: [
    'Dvojklik na obrázek otevře rovnou režim úprav (QA); zvětšení přes celé okno je nově tlačítko ⤢.',
    'Pipeta: zaškrtávátko „Barva do obrázku" zapíše do snímku značku + a vedle ní text s kódem barvy.',
    'Šipky mezi obrázky se zobrazují jen v galerii (ne v editoru ani ve zvětšeném obrázku).',
    'Opraveno: chyby mezipaměti při spuštění na Windows (přístup odepřen); aplikace běží jen v jedné kopii.' ] },
  { v: '0.6.0', items: [
    'Světlý motiv (a volba tmavý / světlý / podle systému) v Nastavení.',
    'Nastavení je teď samostatné okno (ozubené kolo), obsahuje i poznámky k verzím.',
    'Koš: smazané a přepsané obrázky se ukládají do koše, jdou obnovit nebo smazat natrvalo.',
    'Šipky: zamykání, volba přímé nebo zalomené šipky, šipky mezi stejnými obrázky se už nepřekrývají.',
    'Porovnání dvou snímků: překrytí, posuvník a zvýraznění rozdílů (tlačítko ⇄).',
    'Editor: pipeta (zjištění barvy) a pravítko (měření v pixelech).',
    'Report z vybraných obrázků do PDF nebo Markdownu, případně zkopírování textu.',
    'Název, poznámka a štítky u obrázků (ⓘ) a hledání přes všechny nástěnky.' ] },
  { v: '0.5.2', items: ['Opraveno: výřez oblasti se už nezasekává při tažení myši.', 'V záznamu událostí je vidět důvod zrušení výběru.'] },
  { v: '0.5.1', items: ['Změna zkratek, volba monitoru a Diagnostika.', 'Spolehlivější přiřazení snímku k monitoru.'] },
  { v: '0.5.0', items: ['Editor pro QA: šipky, tvary, text, číslované značky, rozmazání, ořez.', 'Zoom a posun obrázku v buňce.'] },
  { v: '0.4.0', items: ['Více nástěnek v záložkách, přesun obrázků mezi nimi, Ctrl+1 až 9.'] },
  { v: '0.3.0', items: ['Šipky mezi obrázky s popiskem a barvou.'] },
  { v: '0.2.1', items: ['Oprava výřezu na vedlejším monitoru.'] },
  { v: '0.2.0', items: ['Výřez části obrazovky, nové ikony, uložení a otevření složky.'] },
  { v: '0.1.0', items: ['První verze: snímek zkratkou, nástěnka s mřížkou, zamykání, mazání, přesun.'] }
];

const CHANGELOG_EN = [
  { v: '0.9.0', items: [
    'Gallery field: a folder icon (add an image from a file) and a paste icon (add from the clipboard), at the right end of the tab bar.',
    'The guide in Tips and guides was rewritten in a formal style; Czech and English names in the browser are written as CZ (EN) and the Czech command name was corrected to “…s celou velikostí”.',
    'Language switch CZ / EN (in the header and in Settings) and a complete English version of the app, including help and release notes.' ] },
  { v: '0.8.3', items: ['Settings: new section “Tips and guides” – how to take a screenshot of a whole web page with the browser developer tools, how to add it to ScreenBoard, and troubleshooting.'] },
  { v: '0.8.2', items: ['Paste an image from the clipboard: Ctrl+V in the gallery adds the image to the first free cell of the active board.'] },
  { v: '0.8.1', items: ['Editor: Save and Cancel are icons with a tooltip; Undo and Redo are before Size.', 'Copying an image to the clipboard: in the editor including edits before saving, in the gallery with a button on every image.'] },
  { v: '0.8.0', items: ['Editor: tools are a vertical strip of icons on the left (like in Photoshop) without labels – the name appears on hover.', 'Editor: colour selection under the tools – a large current-colour box (click for a custom colour) and a palette of quick colours.', 'Editor: confirming and cancelling a crop are icons with a tooltip.', 'More icons: highlighter, confirm, close window, add board, export PDF and Markdown, theme (sun / moon / follow system).'] },
  { v: '0.7.1', items: ['New icons (Lucide) throughout the app: top bar, image buttons, editor tools, lock and delete of an arrow.', 'Settings are clearer: a menu of sections on the left, only one section on the right, with a description of every option.', 'The theme is chosen with a switch; saving folders are clear cards (name, folder, colour).'] },
  { v: '0.7.0', items: ['The app is named ScreenBoard (formerly PrintScreen). Existing screenshots and boards are taken over on first start.', 'New colour scheme: warm grey, white cards, subtle borders, board tabs with an underline; the light theme is the default.', 'Settings: Controls (a clear table) and Version are collapsible; the version line states that AI helped with development (Claude Sonnet 5.5).', 'Two coloured save buttons on every image – each saves a copy to a different folder; folders, names and button colours are set in Settings.', 'Crop in the editor: the selection is confirmed first, then only the selected area is shown; “Cancel crop” restores the whole image.', 'Editor: “Thickness” is now “Size” with a number field you can type into.', 'Texts written into the image (text, ruler, pipette) use the chosen colour, so a contrasting one can always be chosen.'] },
  { v: '0.6.1', items: ['Double-clicking an image opens the editing mode (QA); enlarging to the whole window is now the ⤢ button.', 'Pipette: the “Colour into image” checkbox writes a + mark and the colour code text into the image.', 'Arrows between images are shown only in the gallery (not in the editor or in an enlarged image).', 'Fixed: cache errors on startup on Windows (access denied); the app runs in a single instance.'] },
  { v: '0.6.0', items: ['Light theme (and a choice of dark / light / follow system) in Settings.', 'Settings became a separate window (gear icon) and contain release notes.', 'Trash: deleted and overwritten images go to the trash and can be restored or deleted permanently.', 'Arrows: locking, straight or elbow shape, arrows between the same images no longer overlap.', 'Comparing two images: overlay, slider and highlighted differences (⇄ button).', 'Editor: pipette (colour picking) and ruler (measuring in pixels).', 'Report from selected images to PDF or Markdown, or copy the text.', 'Title, note and tags on images (ⓘ) and search across all boards.'] },
  { v: '0.5.2', items: ['Fixed: region capture no longer freezes when dragging the mouse.', 'The event log shows why a selection was cancelled.'] },
  { v: '0.5.1', items: ['Changing shortcuts, choosing the monitor and Diagnostics.', 'More reliable assignment of a screenshot to a monitor.'] },
  { v: '0.5.0', items: ['QA editor: arrows, shapes, text, numbered marks, blur, crop.', 'Zoom and pan of an image in a cell.'] },
  { v: '0.4.0', items: ['Multiple boards in tabs, moving images between them, Ctrl+1 to 9.'] },
  { v: '0.3.0', items: ['Arrows between images with a label and colour.'] },
  { v: '0.2.1', items: ['Fix of region capture on a secondary monitor.'] },
  { v: '0.2.0', items: ['Capturing part of the screen, new icons, saving and opening the folder.'] },
  { v: '0.1.0', items: ['First version: capture with a shortcut, a board with a grid, locking, deleting, moving.'] }
];
