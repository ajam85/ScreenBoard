const CHANGELOG = [
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
