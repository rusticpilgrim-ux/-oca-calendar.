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
    [/\bAfterfeast of\b/gi, 'Попразднство'],[/\bForefeast of\b/gi, 'Предпразднство'],[/\bLeavetaking of\b/gi, 'Отдание праздника'],
    [/\bSynaxis of\b/gi, 'Собор'],[/\bTranslation of the Relics of\b/gi, 'Перенесение мощей'],[/\bTranslation of the Image\b/gi, 'Перенесение образа'],
    [/\bNativity of\b/gi, 'Рождество'],[/\bDormition of\b/gi, 'Успение'],[/\bMeeting of Our Lord\b/gi, 'Сретение Господне'],
    [/\bTheophany\b/gi, 'Богоявление'],[/\bTransfiguration of Our Lord\b/gi, 'Преображение Господне'],[/\bElevation of the Holy Cross\b/gi, 'Воздвижение Креста Господня'],
    [/\bHoly Fathers\b/gi, 'Святые Отцы'],[/\bTheotokos\b/gi, 'Богородицы'],[/\bMother of God\b/gi, 'Божией Матери'],[/\bEver-Virgin Mary\b/gi, 'Приснодевы Марии'],
    [/\bOur Lord Jesus Christ\b/gi, 'Господа нашего Иисуса Христа'],[/\bEqual-to-the-Apostles\b/gi, 'равноапостольный'],[/\bWonderworker\b/gi, 'чудотворец'],
    [/\bUnmercenary Physician\b/gi, 'бессребреник и врач'],[/\bHoly Unmercenary\b/gi, 'святой бессребреник'],[/\bNew Martyr\b/gi, 'новомученик'],
    [/\bHieromartyr\b/gi, 'священномученик'],[/\bGreatmartyr\b/gi, 'великомученик'],[/\bMartyrs\b/gi, 'мученики'],[/\bMartyr\b/gi, 'мученик'],
    [/\bVenerable\b/gi, 'преподобный'],[/\bVen\.\b/gi, 'прп.'],[/\bSts\.\b/gi, 'свв.'],[/\bSt\.\b/gi, 'св.'],[/\bApostle\b/gi, 'апостол'],
    [/\bProphet\b/gi, 'пророк'],[/\bArchbishop\b/gi, 'архиепископ'],[/\bMetropolitan\b/gi, 'митрополит'],[/\bBishop\b/gi, 'епископ'],
    [/\bPope of Rome\b/gi, 'папа Римский'],[/\bConfessor\b/gi, 'исповедник'],[/\bRighteous\b/gi, 'праведный'],[/\bIcon of the Mother of God\b/gi, 'икона Божией Матери'],
    [/\bTone (\d+)\b/gi, 'Глас $1']
  ];

  function pad(n) { return String(n).padStart(2, '0'); }
  function dayUrl(date) { return `https://www.oca.org/readings/daily/${date.getFullYear()}/${pad(date.getMonth()+1)}/${pad(date.getDate())}`; }

  function cleanupMarkdown(s) {
    return String(s || '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim();
  }

  function looksLikeReading(s) {
    const books = Object.keys(BOOKS).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
    return new RegExp(`^(?:${books})\\s+\\d`, 'i').test(String(s||'').trim());
  }

  function parsePlainText(text) {
    const raw = String(text || '').replace(/\r/g, '');
    const marker = /Today[’']s commemorated feasts and saints/i;
    const m = marker.exec(raw);
    if (!m) return { readings: [], commemorations: '' };
    const before = raw.slice(0, m.index);
    let after = raw.slice(m.index + m[0].length);

    const readings = [];
    const lines = before.split('\n').map(x=>cleanupMarkdown(x)).filter(Boolean);
    for (const line of lines) {
      const stripped = line.replace(/^[-*•]\s*/, '').trim();
      if (looksLikeReading(stripped) && stripped.length < 120) readings.push(stripped);
    }

    const stop = after.search(/\bPrevious Day\b|\bNext Day\b|\bSearch for a reading by date\b|\bThe New King James Version\b/i);
    if (stop >= 0) after = after.slice(0, stop);
    const commemorations = cleanupMarkdown(after.replace(/^\s*[:#-]*/, ''));
    return { readings: [...new Set(readings)], commemorations };
  }

  function parseOcaMarkdown(text) { return parsePlainText(text); }

  function htmlToText(html) {
    try {
      const doc = new DOMParser().parseFromString(String(html||''), 'text/html');
      return (doc && doc.body && doc.body.innerText) ? doc.body.innerText : String(html||'').replace(/<[^>]+>/g,' ');
    } catch (_) { return String(html||'').replace(/<[^>]+>/g,' '); }
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
    const multi = [['shch','щ'],['sch','щ'],['zh','ж'],['kh','х'],['ts','ц'],['ch','ч'],['sh','ш'],['yu','ю'],['ya','я'],['yo','ё'],['ye','е'],['th','т'],['ph','ф']];
    const one = {a:'а',b:'б',c:'к',d:'д',e:'е',f:'ф',g:'г',h:'х',i:'и',j:'дж',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',q:'к',r:'р',s:'с',t:'т',u:'у',v:'в',w:'в',x:'кс',y:'и',z:'з'};
    return text.replace(/\b[A-Za-z][A-Za-z'’-]{2,}\b/g, word => {
      if (/^(of|the|and|in|with|from|our|holy|saint|saints|icon|all|those|his|her|their|to|at|by)$/i.test(word)) return word;
      let lower = word.toLowerCase();
      for (const [a,b] of multi) lower = lower.split(a).join(b);
      let out = ''; for (const ch of lower) out += one[ch] || ch;
      if (/^[A-Z]/.test(word)) out = out.charAt(0).toUpperCase() + out.slice(1);
      return out;
    });
  }

  function localChurchTranslation(text) {
    let out = cleanupMarkdown(text);
    for (const [rx, ru] of PHRASES) out = out.replace(rx, ru);
    out = out.replace(/\bof the\b/gi, '').replace(/\bof\b/gi, '').replace(/\band\b/gi, 'и').replace(/\bwith\b/gi, 'с').replace(/\bin\b/gi, 'в').replace(/\bfrom\b/gi, 'из').replace(/\s+([,.;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
    return transliterateLatinWords(out);
  }

  function chunkUtf8(text, maxBytes) {
    const enc = new TextEncoder(); const sentences = String(text).split(/(?<=[.!?;])\s+/); const chunks=[]; let current='';
    for (const s of sentences) {
      const candidate=current?`${current} ${s}`:s;
      if (enc.encode(candidate).length<=maxBytes) { current=candidate; continue; }
      if (current) chunks.push(current);
      if (enc.encode(s).length<=maxBytes) { current=s; continue; }
      let part=''; for (const word of s.split(/\s+/)) { const c=part?`${part} ${word}`:word; if (enc.encode(c).length>maxBytes && part){chunks.push(part);part=word;} else part=c; } current=part;
    }
    if (current) chunks.push(current); return chunks;
  }

  async function fetchWithTimeout(url, options={}, ms=12000) {
    const ctl = new AbortController(); const timer=setTimeout(()=>ctl.abort(),ms);
    try { return await fetch(url, {...options, signal:ctl.signal, cache:'no-store'}); }
    finally { clearTimeout(timer); }
  }

  async function fetchOcaDay(date) {
    const target = dayUrl(date);
    const attempts = [
      {name:'Jina Reader', url:`https://r.jina.ai/${target}`, kind:'text'},
      {name:'AllOrigins', url:`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`, kind:'html'},
      {name:'CodeTabs', url:`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`, kind:'html'}
    ];
    const errors=[];
    for (const a of attempts) {
      try {
        const r = await fetchWithTimeout(a.url, {headers:{'Accept': a.kind==='text'?'text/plain':'text/html,*/*'}}, 14000);
        if (!r.ok) throw new Error(String(r.status));
        const body = await r.text();
        const parsed = a.kind==='html' ? parsePlainText(htmlToText(body)) : parseOcaMarkdown(body);
        if (parsed.readings.length || parsed.commemorations) return {...parsed, sourceUrl:target, via:a.name};
        throw new Error('empty');
      } catch(e) { errors.push(`${a.name}: ${e && e.message ? e.message : 'ошибка'}`); }
    }
    throw new Error(errors.join(' | '));
  }

  async function myMemoryTranslate(text) {
    const chunks=chunkUtf8(text,430), out=[];
    for (const chunk of chunks) {
      const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en%7Cru`;
      const r=await fetchWithTimeout(url,{headers:{'Accept':'application/json'}},10000); if(!r.ok) throw new Error('translation');
      const j=await r.json(); const tr=j&&j.responseData&&j.responseData.translatedText; if(!tr) throw new Error('translation'); out.push(tr);
    }
    return out.join(' ');
  }

  async function googleTranslate(text) {
    const chunks=chunkUtf8(text,650), out=[];
    for (const chunk of chunks) {
      const url=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(chunk)}`;
      const r=await fetchWithTimeout(url,{headers:{'Accept':'application/json'}},10000); if(!r.ok) throw new Error('translation');
      const j=await r.json();
      const tr = Array.isArray(j && j[0]) ? j[0].map(x=>Array.isArray(x)?x[0]:'').join('') : '';
      if(!tr) throw new Error('translation'); out.push(tr);
    }
    return out.join(' ');
  }

  async function translateCommemorations(text) {
    if (!text) return '';
    try { const t=await myMemoryTranslate(text); if(t&&t.length>5) return t; } catch(_) {}
    try { const t=await googleTranslate(text); if(t&&t.length>5) return t; } catch(_) {}
    return localChurchTranslation(text);
  }

  window.OCAReader = { fetchOcaDay, translateCommemorations, translateReadingRef, localChurchTranslation, dayUrl };
})();
