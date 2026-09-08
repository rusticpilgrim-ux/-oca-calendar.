(function () {
  'use strict';

  const BOOKS = {
    'Genesis':'Бытие','Exodus':'Исход','Leviticus':'Левит','Numbers':'Числа','Deuteronomy':'Второзаконие',
    'Joshua':'Иисус Навин','Judges':'Судьи','Ruth':'Руфь','1 Samuel':'1 Царств','2 Samuel':'2 Царств',
    '1 Kings':'3 Царств','2 Kings':'4 Царств','1 Chronicles':'1 Паралипоменон','2 Chronicles':'2 Паралипоменон',
    'Ezra':'Ездра','Nehemiah':'Неемия','Esther':'Есфирь','Job':'Иов','Psalms':'Псалтирь','Psalm':'Псалом',
    'Proverbs':'Притчи','Ecclesiastes':'Екклесиаст','Song of Songs':'Песнь песней','Isaiah':'Исаия','Jeremiah':'Иеремия',
    'Lamentations':'Плач Иеремии','Ezekiel':'Иезекииль','Daniel':'Даниил','Hosea':'Осия','Joel':'Иоиль','Amos':'Амос',
    'Obadiah':'Авдий','Jonah':'Иона','Micah':'Михей','Nahum':'Наум','Habakkuk':'Аввакум','Zephaniah':'Софония',
    'Haggai':'Аггей','Zechariah':'Захария','Malachi':'Малахия',
    'Matthew':'Матфея','Mark':'Марка','Luke':'Луки','John':'Иоанна','Acts':'Деяния',
    'Romans':'Римлянам','1 Corinthians':'1 Коринфянам','2 Corinthians':'2 Коринфянам','Galatians':'Галатам',
    'Ephesians':'Ефесянам','Philippians':'Филиппийцам','Colossians':'Колоссянам','1 Thessalonians':'1 Фессалоникийцам',
    '2 Thessalonians':'2 Фессалоникийцам','1 Timothy':'1 Тимофею','2 Timothy':'2 Тимофею','Titus':'Титу','Philemon':'Филимону',
    'Hebrews':'Евреям','James':'Иакова','1 Peter':'1 Петра','2 Peter':'2 Петра','1 John':'1 Иоанна','2 John':'2 Иоанна',
    '3 John':'3 Иоанна','Jude':'Иуды','Revelation':'Откровение'
  };

  const PHRASES = [
    [/\bSUNDAY AFTER PENTECOST\b/gi, 'НЕДЕЛЯ ПО ПЯТИДЕСЯТНИЦЕ'],
    [/\bSunday after Pentecost\b/gi, 'Неделя по Пятидесятнице'],
    [/\bSUNDAY OF PASCHA\b/gi, 'НЕДЕЛЯ ПАСХИ'],
    [/\bAfterfeast of\b/gi, 'Попразднство'],
    [/\bForefeast of\b/gi, 'Предпразднство'],
    [/\bLeavetaking of\b/gi, 'Отдание праздника'],
    [/\bSynaxis of\b/gi, 'Собор'],
    [/\bTranslation of the Relics of\b/gi, 'Перенесение мощей'],
    [/\bTranslation of the Image\b/gi, 'Перенесение образа'],
    [/\bNativity of\b/gi, 'Рождество'],
    [/\bDormition of\b/gi, 'Успение'],
    [/\bMeeting of Our Lord\b/gi, 'Сретение Господне'],
    [/\bTheophany\b/gi, 'Богоявление'],
    [/\bTransfiguration of Our Lord\b/gi, 'Преображение Господне'],
    [/\bElevation of the Holy Cross\b/gi, 'Воздвижение Креста Господня'],
    [/\bHoly Fathers\b/gi, 'Святые Отцы'],
    [/\bTheotokos\b/gi, 'Богородицы'],
    [/\bMother of God\b/gi, 'Божией Матери'],
    [/\bEver-Virgin Mary\b/gi, 'Приснодевы Марии'],
    [/\bOur Lord Jesus Christ\b/gi, 'Господа нашего Иисуса Христа'],
    [/\bEqual-to-the-Apostles\b/gi, 'равноапостольный'],
    [/\bWonderworker\b/gi, 'чудотворец'],
    [/\bUnmercenary Physician\b/gi, 'бессребреник и врач'],
    [/\bHoly Unmercenary\b/gi, 'святой бессребреник'],
    [/\bNew Martyr\b/gi, 'новомученик'],
    [/\bHieromartyr\b/gi, 'священномученик'],
    [/\bGreatmartyr\b/gi, 'великомученик'],
    [/\bMartyrs\b/gi, 'мученики'],
    [/\bMartyr\b/gi, 'мученик'],
    [/\bVenerable\b/gi, 'преподобный'],
    [/\bVen\.\b/gi, 'прп.'],
    [/\bSts\.\b/gi, 'свв.'],
    [/\bSt\.\b/gi, 'св.'],
    [/\bApostle\b/gi, 'апостол'],
    [/\bProphet\b/gi, 'пророк'],
    [/\bArchbishop\b/gi, 'архиепископ'],
    [/\bMetropolitan\b/gi, 'митрополит'],
    [/\bBishop\b/gi, 'епископ'],
    [/\bPope of Rome\b/gi, 'папа Римский'],
    [/\bConfessor\b/gi, 'исповедник'],
    [/\bRighteous\b/gi, 'праведный'],
    [/\bIcon of the Mother of God\b/gi, 'икона Божией Матери'],
    [/\bTone (\d+)\b/gi, 'Глас $1']
  ];

  function pad(n) { return String(n).padStart(2, '0'); }
  function dayUrl(date) {
    return `https://www.oca.org/readings/daily/${date.getFullYear()}/${pad(date.getMonth()+1)}/${pad(date.getDate())}`;
  }
  function readerUrl(date) { return `https://r.jina.ai/${dayUrl(date)}`; }

  function cleanupMarkdown(s) {
    return String(s || '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[*_`#>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseOcaMarkdown(text) {
    const raw = String(text || '').replace(/\r/g, '');
    const marker = /Today[’']s commemorated feasts and saints/i;
    const match = marker.exec(raw);
    let before = match ? raw.slice(0, match.index) : raw;
    let after = match ? raw.slice(match.index + match[0].length) : '';

    const readings = [];
    const lines = before.split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*[-*]\s+(.+?)\s*$/);
      if (!m) continue;
      const item = cleanupMarkdown(m[1]);
      if (/^[1-3]?\s?[A-Z][A-Za-z ]+\s+\d/.test(item) && item.length < 90) readings.push(item);
    }

    let commemorations = '';
    if (after) {
      after = after.replace(/^\s*[:#-]*/,'').trim();
      const stop = after.search(/\n\s*#{1,3}\s|\n\s*The New King James Version|\n\s*Scripture Readings\s*$/i);
      commemorations = cleanupMarkdown(stop >= 0 ? after.slice(0, stop) : after.slice(0, 2500));
    }

    return { readings: [...new Set(readings)], commemorations };
  }

  function translateReadingRef(ref) {
    let out = ref;
    const names = Object.keys(BOOKS).sort((a,b) => b.length - a.length);
    for (const en of names) {
      const rx = new RegExp(`^${en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`, 'i');
      if (rx.test(out)) return out.replace(rx, BOOKS[en]);
    }
    return out;
  }

  function transliterateLatinWords(text) {
    // Gentle fallback: transliterate only standalone Latin words that remain after church-term replacement.
    const multi = [
      ['shch','щ'],['sch','щ'],['zh','ж'],['kh','х'],['ts','ц'],['ch','ч'],['sh','ш'],['yu','ю'],['ya','я'],['yo','ё'],['ye','е'],['th','т'],['ph','ф']
    ];
    const one = {a:'а',b:'б',c:'к',d:'д',e:'е',f:'ф',g:'г',h:'х',i:'и',j:'дж',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',q:'к',r:'р',s:'с',t:'т',u:'у',v:'в',w:'в',x:'кс',y:'и',z:'з'};
    return text.replace(/\b[A-Za-z][A-Za-z'’-]{2,}\b/g, word => {
      if (/^(of|the|and|in|with|from|our|holy|saint|saints|icon|all|those|his|her|their|to|at|by)$/i.test(word)) return word;
      let lower = word.toLowerCase();
      for (const [a,b] of multi) lower = lower.split(a).join(b);
      let out = '';
      for (const ch of lower) out += one[ch] || ch;
      if (/^[A-Z]/.test(word)) out = out.charAt(0).toUpperCase() + out.slice(1);
      return out;
    });
  }

  function localChurchTranslation(text) {
    let out = cleanupMarkdown(text);
    for (const [rx, ru] of PHRASES) out = out.replace(rx, ru);
    out = out
      .replace(/\bof the\b/gi, '')
      .replace(/\bof\b/gi, '')
      .replace(/\band\b/gi, 'и')
      .replace(/\bwith\b/gi, 'с')
      .replace(/\bin\b/gi, 'в')
      .replace(/\bfrom\b/gi, 'из')
      .replace(/\s+([,.;:])/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return transliterateLatinWords(out);
  }

  function chunkUtf8(text, maxBytes) {
    const encoder = new TextEncoder();
    const sentences = String(text).split(/(?<=[.!?;])\s+/);
    const chunks = [];
    let current = '';
    for (const s of sentences) {
      const candidate = current ? `${current} ${s}` : s;
      if (encoder.encode(candidate).length <= maxBytes) { current = candidate; continue; }
      if (current) chunks.push(current);
      if (encoder.encode(s).length <= maxBytes) { current = s; continue; }
      let part = '';
      for (const word of s.split(/\s+/)) {
        const c = part ? `${part} ${word}` : word;
        if (encoder.encode(c).length > maxBytes && part) { chunks.push(part); part = word; }
        else part = c;
      }
      current = part;
    }
    if (current) chunks.push(current);
    return chunks;
  }

  async function myMemoryTranslate(text) {
    const chunks = chunkUtf8(text, 430);
    const out = [];
    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en%7Cru`;
      const r = await fetch(url, { headers: { 'Accept':'application/json' } });
      if (!r.ok) throw new Error('translation');
      const j = await r.json();
      const tr = j && j.responseData && j.responseData.translatedText;
      if (!tr) throw new Error('translation');
      out.push(tr);
    }
    return out.join(' ');
  }

  async function fetchOcaDay(date) {
    const url = readerUrl(date);
    const response = await fetch(url, { headers: { 'Accept':'text/plain' }, cache:'no-store' });
    if (!response.ok) throw new Error(`OCA ${response.status}`);
    const text = await response.text();
    const parsed = parseOcaMarkdown(text);
    if (!parsed.readings.length && !parsed.commemorations) throw new Error('Не удалось разобрать страницу OCA');
    return { ...parsed, sourceUrl: dayUrl(date) };
  }

  async function translateCommemorations(text) {
    if (!text) return '';
    try {
      const machine = await myMemoryTranslate(text);
      if (machine && machine.length > 5) return machine;
    } catch (_) {}
    return localChurchTranslation(text);
  }

  window.OCAReader = { fetchOcaDay, translateCommemorations, translateReadingRef, localChurchTranslation, dayUrl };
})();
