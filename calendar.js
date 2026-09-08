(function () {
  'use strict';

  const FIXED = {
    '01-01': [{ ru: 'Обрезание Господне · Святитель Василий Великий', en: 'Circumcision of Our Lord · St. Basil the Great', kind: 'feast' }],
    '01-06': [{ ru: 'Богоявление (Крещение Господне)', en: 'Theophany of Our Lord', kind: 'great' }],
    '02-02': [{ ru: 'Сретение Господне', en: 'Meeting of Our Lord in the Temple', kind: 'great' }],
    '03-25': [{ ru: 'Благовещение Пресвятой Богородицы', en: 'Annunciation of the Most Holy Theotokos', kind: 'great' }],
    '06-24': [{ ru: 'Рождество святого Иоанна Предтечи', en: 'Nativity of St. John the Baptist', kind: 'feast' }],
    '06-29': [{ ru: 'Святые первоверховные апостолы Петр и Павел', en: 'Holy Apostles Peter and Paul', kind: 'feast' }],
    '08-06': [{ ru: 'Преображение Господне', en: 'Transfiguration of Our Lord', kind: 'great' }],
    '08-15': [{ ru: 'Успение Пресвятой Богородицы', en: 'Dormition of the Most Holy Theotokos', kind: 'great' }],
    '08-29': [{ ru: 'Усекновение главы святого Иоанна Предтечи', en: 'Beheading of St. John the Baptist', kind: 'feast' }],
    '09-08': [{ ru: 'Рождество Пресвятой Богородицы', en: 'Nativity of the Most Holy Theotokos', kind: 'great' }],
    '09-14': [{ ru: 'Воздвижение Честного и Животворящего Креста Господня', en: 'Elevation of the Holy Cross', kind: 'great' }],
    '10-01': [{ ru: 'Покров Пресвятой Богородицы', en: 'Protection of the Most Holy Theotokos', kind: 'feast' }],
    '11-21': [{ ru: 'Введение во храм Пресвятой Богородицы', en: 'Entrance of the Theotokos into the Temple', kind: 'great' }],
    '12-06': [{ ru: 'Святитель Николай Чудотворец', en: 'St. Nicholas the Wonderworker', kind: 'feast' }],
    '12-25': [{ ru: 'Рождество Христово', en: 'Nativity of Our Lord Jesus Christ', kind: 'great' }]
  };

  function localDate(y, m, d) { return new Date(y, m - 1, d, 12, 0, 0, 0); }
  function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function iso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  function mmdd(date) { return `${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }

  // Orthodox Pascha: Julian computus, converted to Gregorian using JDN.
  function julianToJdn(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a;
    const mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - 32083;
  }
  function jdnToGregorian(jdn) {
    let a = jdn + 32044;
    let b = Math.floor((4 * a + 3) / 146097);
    let c = a - Math.floor((146097 * b) / 4);
    let d = Math.floor((4 * c + 3) / 1461);
    let e = c - Math.floor((1461 * d) / 4);
    let m = Math.floor((5 * e + 2) / 153);
    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = 100 * b + d - 4800 + Math.floor(m / 10);
    return localDate(year, month, day);
  }
  function orthodoxPascha(year) {
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31);
    const day = ((d + e + 114) % 31) + 1;
    return jdnToGregorian(julianToJdn(year, month, day));
  }

  function movableEvents(year) {
    const p = orthodoxPascha(year);
    return [
      { date: addDays(p, -70), ru: 'Неделя о мытаре и фарисее', en: 'Sunday of the Publican and the Pharisee', kind: 'feast' },
      { date: addDays(p, -63), ru: 'Неделя о блудном сыне', en: 'Sunday of the Prodigal Son', kind: 'feast' },
      { date: addDays(p, -56), ru: 'Неделя о Страшном суде (Мясопустная)', en: 'Sunday of the Last Judgment (Meatfare)', kind: 'feast' },
      { date: addDays(p, -49), ru: 'Прощеное воскресенье (Сыропустная неделя)', en: 'Forgiveness Sunday (Cheesefare)', kind: 'feast' },
      { date: addDays(p, -48), ru: 'Чистый понедельник · начало Великого поста', en: 'Clean Monday · Great Lent begins', kind: 'fast' },
      { date: addDays(p, -8), ru: 'Лазарева суббота', en: 'Lazarus Saturday', kind: 'feast' },
      { date: addDays(p, -7), ru: 'Вход Господень в Иерусалим (Вербное воскресенье)', en: 'Entrance of Our Lord into Jerusalem (Palm Sunday)', kind: 'great' },
      { date: addDays(p, -3), ru: 'Великий Четверг', en: 'Great and Holy Thursday', kind: 'holyweek' },
      { date: addDays(p, -2), ru: 'Великая Пятница', en: 'Great and Holy Friday', kind: 'holyweek' },
      { date: addDays(p, -1), ru: 'Великая Суббота', en: 'Great and Holy Saturday', kind: 'holyweek' },
      { date: p, ru: 'СВЕТЛОЕ ХРИСТОВО ВОСКРЕСЕНИЕ · ПАСХА', en: 'HOLY PASCHA · Resurrection of Our Lord', kind: 'pascha' },
      { date: addDays(p, 7), ru: 'Антипасха · Неделя апостола Фомы', en: 'St. Thomas Sunday', kind: 'feast' },
      { date: addDays(p, 14), ru: 'Неделя святых жен-мироносиц', en: 'Sunday of the Myrrhbearing Women', kind: 'feast' },
      { date: addDays(p, 21), ru: 'Неделя о расслабленном', en: 'Sunday of the Paralytic', kind: 'feast' },
      { date: addDays(p, 24), ru: 'Преполовение Пятидесятницы', en: 'Midfeast of Pentecost', kind: 'feast' },
      { date: addDays(p, 28), ru: 'Неделя о самаряныне', en: 'Sunday of the Samaritan Woman', kind: 'feast' },
      { date: addDays(p, 35), ru: 'Неделя о слепом', en: 'Sunday of the Blind Man', kind: 'feast' },
      { date: addDays(p, 38), ru: 'Отдание Пасхи', en: 'Leavetaking of Pascha', kind: 'feast' },
      { date: addDays(p, 39), ru: 'Вознесение Господне', en: 'Ascension of Our Lord', kind: 'great' },
      { date: addDays(p, 42), ru: 'Неделя святых отцов Первого Вселенского Собора', en: 'Fathers of the First Ecumenical Council', kind: 'feast' },
      { date: addDays(p, 49), ru: 'День Святой Троицы · Пятидесятница', en: 'Holy Pentecost', kind: 'great' },
      { date: addDays(p, 50), ru: 'День Святого Духа', en: 'Day of the Holy Spirit', kind: 'feast' },
      { date: addDays(p, 56), ru: 'Неделя Всех Святых', en: 'Sunday of All Saints', kind: 'feast' },
      { date: addDays(p, 57), ru: 'Начало Петрова поста', en: 'Apostles’ Fast begins', kind: 'fast' },
      { date: addDays(p, 63), ru: 'Все святые Северной Америки', en: 'All Saints of North America', kind: 'feast' }
    ];
  }

  function inRange(date, start, end) { return date >= start && date <= end; }

  function fastingInfo(date) {
    const y = date.getFullYear();
    const p = orthodoxPascha(y);

    // Cheesefare week: abstinence from meat, dairy remains permitted in general practice.
    if (inRange(date, addDays(p, -55), addDays(p, -49))) return 'Сырная седмица · без мяса';

    // Great Lent + Holy Week, through Holy Saturday.
    if (inRange(date, addDays(p, -48), addDays(p, -1))) return 'Великий пост';

    // Dormition Fast.
    if (inRange(date, localDate(y, 8, 1), localDate(y, 8, 14))) return 'Успенский пост';

    // Nativity Fast.
    if (inRange(date, localDate(y, 11, 15), localDate(y, 12, 24))) return 'Рождественский пост';

    // Apostles’ Fast: Monday after All Saints through June 28, when a positive interval exists.
    const apostlesStart = addDays(p, 57);
    const apostlesEnd = localDate(y, 6, 28);
    if (apostlesStart <= apostlesEnd && inRange(date, apostlesStart, apostlesEnd)) return 'Петров пост';

    // Common single-day fasts on OCA's Revised Julian civil dates.
    const key = mmdd(date);
    if (key === '01-05') return 'Навечерие Богоявления · пост';
    if (key === '08-29') return 'Усекновение главы Иоанна Предтечи · пост';
    if (key === '09-14') return 'Воздвижение Креста Господня · пост';

    // Do not mark regular Wed/Fri during clearly fast-free periods.
    const fastFree = [
      [addDays(p, -69), addDays(p, -63)], // Publican/Pharisee week approximation
      [p, addDays(p, 6)],                 // Bright Week
      [addDays(p, 50), addDays(p, 56)],   // Week after Pentecost
      [localDate(y, 12, 25), localDate(y, 12, 31)],
      [localDate(y, 1, 1), localDate(y, 1, 4)]
    ].some(([s,e]) => inRange(date,s,e));

    const dow = date.getDay();
    if (!fastFree && (dow === 3 || dow === 5)) return 'Обычный постный день (среда/пятница)';
    return null;
  }

  function eventsFor(date) {
    const result = [];
    const fixed = FIXED[mmdd(date)] || [];
    fixed.forEach(e => result.push({ ...e, date }));
    movableEvents(date.getFullYear()).forEach(e => { if (sameDay(date, e.date)) result.push(e); });
    return result;
  }

  function ocaReadingUrl(date) {
    return `https://www.oca.org/readings/daily/${date.getFullYear()}/${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}`;
  }
  function ocaSaintsUrl(date) {
    // OCA's all-lives URL accepts a stable numeric segment followed by MM/DD.
    return `https://www.oca.org/saints/all-lives/201540/${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}`;
  }

  window.OCA = { FIXED, orthodoxPascha, movableEvents, eventsFor, fastingInfo, ocaReadingUrl, ocaSaintsUrl, iso, sameDay, addDays, localDate };
})();
