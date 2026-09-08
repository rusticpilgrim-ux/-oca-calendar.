(function () {
  'use strict';
  const fmtMonth = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
  const fmtLong = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtToday = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  const now = new Date(); now.setHours(12,0,0,0);
  let selected = new Date(now);
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();
  let loadToken = 0;

  const grid = document.getElementById('calendarGrid');
  const title = document.getElementById('monthTitle');
  const details = document.getElementById('dayDetails');
  const todayCard = document.getElementById('todayCard');
  const readerPanel = document.getElementById('ocaReader');

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function escapeHtml(s) { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function cacheKey(d) { return `oca-ru-${OCA.iso(d)}`; }
  function autoTranslateOn() { return localStorage.getItem('oca-auto-translate') !== '0'; }
  function translatedPageUrl(url) { return `https://translate.google.com/translate?sl=en&tl=ru&u=${encodeURIComponent(url)}`; }

  function renderToday() {
    const events = OCA.eventsFor(now);
    const fasting = OCA.fastingInfo(now);
    const primary = events.find(e => e.kind === 'pascha') || events.find(e => e.kind === 'great') || events[0];
    todayCard.innerHTML = `
      <div class="today-kicker">Сегодня · OCA</div>
      <div class="today-date">${escapeHtml(fmtToday.format(now))}</div>
      <div class="today-feast">${primary ? escapeHtml(primary.ru) : 'День по календарю OCA'}</div>
      <div class="today-meta">
        ${fasting ? `<span class="chip">☦ ${escapeHtml(fasting)}</span>` : '<span class="chip">Крупного поста нет</span>'}
        ${events.length ? `<span class="chip">${events.length} ${events.length === 1 ? 'событие' : 'события'}</span>` : ''}
      </div>`;
  }

  function renderCalendar() {
    title.textContent = cap(fmtMonth.format(new Date(viewYear, viewMonth, 1)));
    grid.innerHTML = '';

    const first = new Date(viewYear, viewMonth, 1, 12);
    const mondayIndex = (first.getDay() + 6) % 7;
    const start = new Date(viewYear, viewMonth, 1 - mondayIndex, 12);

    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'day';
      if (d.getMonth() !== viewMonth) btn.classList.add('outside');
      if (OCA.sameDay(d, now)) btn.classList.add('today');
      if (OCA.sameDay(d, selected)) btn.classList.add('selected');

      const events = OCA.eventsFor(d);
      const fasting = OCA.fastingInfo(d);
      const hasPascha = events.some(e => e.kind === 'pascha');
      const hasFeast = events.length > 0;
      btn.innerHTML = `<span class="num">${d.getDate()}</span><span class="marks">${hasPascha ? '<i class="mark pascha"></i>' : ''}${hasFeast && !hasPascha ? '<i class="mark"></i>' : ''}${fasting ? '<i class="mark fast"></i>' : ''}</span>`;
      btn.setAttribute('aria-label', fmtLong.format(d));
      btn.addEventListener('click', () => {
        selected = new Date(d);
        if (d.getMonth() !== viewMonth || d.getFullYear() !== viewYear) { viewMonth = d.getMonth(); viewYear = d.getFullYear(); }
        renderCalendar(); renderDetails();
      });
      grid.appendChild(btn);
    }
  }

  function renderDetails() {
    loadToken++;
    const events = OCA.eventsFor(selected);
    const fasting = OCA.fastingInfo(selected);
    const hasPascha = events.some(e => e.kind === 'pascha');
    const heading = hasPascha ? 'Пасха Христова' : (events[0]?.ru || 'Календарь OCA');
    const eventHtml = events.length
      ? `<div class="event-list">${events.map(e => `<div class="event"><strong>${escapeHtml(e.ru)}</strong><small>${escapeHtml(e.en)}</small></div>`).join('')}</div>`
      : '<p class="empty">Крупный праздник в локальной базе не отмечен. Ниже можно загрузить официальный список OCA на русском.</p>';

    details.innerHTML = `
      <div class="details-date">${escapeHtml(cap(fmtLong.format(selected)))}</div>
      <h2>${escapeHtml(heading)}</h2>
      ${eventHtml}
      ${fasting ? `<div class="fast-note">☦ ${escapeHtml(fasting)}</div>` : ''}
      <div class="actions">
        <button id="ruReaderBtn" class="action-link" type="button">🇷🇺 Святые и чтения по-русски</button>
        <a class="action-link secondary" href="${OCA.ocaReadingUrl(selected)}" target="_blank" rel="noopener">OCA оригинал ↗</a>
      </div>`;

    document.getElementById('ruReaderBtn').addEventListener('click', () => loadRussianReader(true));
    renderReaderPlaceholder();
    if (autoTranslateOn()) setTimeout(() => loadRussianReader(false), 180);
  }

  function renderReaderPlaceholder() {
    readerPanel.innerHTML = `
      <div class="reader-head">
        <div><div class="reader-kicker">OCA · внутри приложения</div><h2>Русский перевод</h2></div>
        <button class="mini-btn" id="readerLoadBtn" type="button">Загрузить</button>
      </div>
      <p class="empty">Полный список праздников, святых и ссылки на библейские чтения загружаются с официальной страницы OCA и показываются здесь, не переходя в Safari.</p>`;
    document.getElementById('readerLoadBtn').addEventListener('click', () => loadRussianReader(true));
  }

  function renderReaderData(data, translated, fromCache) {
    const readings = data.readings || [];
    readerPanel.innerHTML = `
      <div class="reader-head">
        <div><div class="reader-kicker">OCA · ${escapeHtml(OCA.iso(selected))}</div><h2>Святые и чтения</h2></div>
        <span class="status-pill">${fromCache ? 'сохранено' : 'обновлено'}</span>
      </div>
      <div class="reader-section">
        <h3>☦ Праздники и святые</h3>
        <p class="translated-text">${escapeHtml(translated || 'На странице OCA список не найден.')}</p>
        ${data.commemorations ? `<details><summary>Показать оригинал на английском</summary><p class="original-text">${escapeHtml(data.commemorations)}</p></details>` : ''}
      </div>
      <div class="reader-section">
        <h3>📖 Чтения дня</h3>
        ${readings.length ? `<ul class="reading-list">${readings.map(r => `<li>${escapeHtml(OCAReader.translateReadingRef(r))}</li>`).join('')}</ul>` : '<p class="empty">Ссылки на чтения не найдены.</p>'}
        <p class="copyright-note">Показываются ссылки на книги, главы и стихи. Полный текст перевода Библии OCA здесь не копируется.</p>
      </div>
      <div class="reader-footer">
        <button id="refreshReader" class="mini-btn" type="button">Обновить</button>
        <a href="${escapeHtml(data.sourceUrl || OCA.ocaReadingUrl(selected))}" target="_blank" rel="noopener">Официальная страница OCA ↗</a>
      </div>`;
    document.getElementById('refreshReader').addEventListener('click', () => loadRussianReader(true, true));
  }

  async function loadRussianReader(userInitiated, force) {
    const token = ++loadToken;
    const d = new Date(selected);
    const key = cacheKey(d);
    if (!force) {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved && saved.data && saved.translated) { renderReaderData(saved.data, saved.translated, true); return; }
      } catch (_) {}
    }

    readerPanel.innerHTML = `<div class="reader-loading"><span class="spinner"></span><div><strong>Загружаю OCA…</strong><small>Получаю официальный список и готовлю русский перевод.</small></div></div>`;
    try {
      const data = await OCAReader.fetchOcaDay(d);
      if (token !== loadToken) return;
      const translated = await OCAReader.translateCommemorations(data.commemorations);
      if (token !== loadToken) return;
      try { localStorage.setItem(key, JSON.stringify({ data, translated, savedAt: Date.now() })); } catch (_) {}
      renderReaderData(data, translated, false);
    } catch (err) {
      if (token !== loadToken) return;
      const local = OCA.eventsFor(d).map(e => e.ru).join('. ');
      const readingRu = translatedPageUrl(OCA.ocaReadingUrl(d));
      const saintsRu = translatedPageUrl(OCA.ocaSaintsUrl(d));
      readerPanel.innerHTML = `
        <div class="reader-head"><div><div class="reader-kicker">OCA · внутри приложения</div><h2>Русский перевод</h2></div></div>
        <div class="reader-error">Сейчас не удалось автоматически получить страницу OCA. ${local ? `Из локального календаря: <strong>${escapeHtml(local)}</strong>` : 'Попробуй ещё раз при хорошем интернете.'}</div>
        <div class="actions">
          <button id="retryReader" class="action-link" type="button">Повторить внутри приложения</button>
          <a class="action-link secondary" href="${escapeHtml(readingRu)}" target="_blank" rel="noopener">📖 Чтения — перевод на русский ↗</a>
          <a class="action-link secondary" href="${escapeHtml(saintsRu)}" target="_blank" rel="noopener">☦ Жития святых — перевод на русский ↗</a>
        </div>`;
      document.getElementById('retryReader').addEventListener('click', () => loadRussianReader(true, true));
    }
  }

  function openSettings() {
    const modal = document.getElementById('settingsModal');
    const check = document.getElementById('autoTranslate');
    check.checked = autoTranslateOn();
    modal.hidden = false;
  }
  function closeSettings() { document.getElementById('settingsModal').hidden = true; }

  document.getElementById('prevMonth').addEventListener('click', () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCalendar(); });
  document.getElementById('nextMonth').addEventListener('click', () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCalendar(); });
  function goToday() { selected = new Date(now); viewYear = now.getFullYear(); viewMonth = now.getMonth(); renderCalendar(); renderDetails(); }
  document.getElementById('todayBtn').addEventListener('click', goToday);
  document.getElementById('monthTitle').addEventListener('click', goToday);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  document.getElementById('closeSettings').addEventListener('click', closeSettings);
  document.getElementById('settingsModal').addEventListener('click', e => { if (e.target.id === 'settingsModal') closeSettings(); });
  document.getElementById('autoTranslate').addEventListener('change', e => {
    localStorage.setItem('oca-auto-translate', e.target.checked ? '1' : '0');
    if (e.target.checked) loadRussianReader(false);
  });

  renderToday(); renderCalendar(); renderDetails();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw-v4.js').catch(() => {}));
  }
})();
