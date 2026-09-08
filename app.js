(function () {
  'use strict';
  const fmtMonth = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
  const fmtLong = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtToday = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  const now = new Date(); now.setHours(12,0,0,0);
  let selected = new Date(now);
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();

  const grid = document.getElementById('calendarGrid');
  const title = document.getElementById('monthTitle');
  const details = document.getElementById('dayDetails');
  const todayCard = document.getElementById('todayCard');

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function escapeHtml(s) { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

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
    let startDow = first.getDay(); // Sun=0
    const mondayIndex = (startDow + 6) % 7;
    const start = new Date(viewYear, viewMonth, 1 - mondayIndex, 12);

    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day';
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
        if (d.getMonth() !== viewMonth || d.getFullYear() !== viewYear) {
          viewMonth = d.getMonth(); viewYear = d.getFullYear();
        }
        renderCalendar(); renderDetails();
      });
      grid.appendChild(btn);
    }
  }

  function renderDetails() {
    const events = OCA.eventsFor(selected);
    const fasting = OCA.fastingInfo(selected);
    const hasPascha = events.some(e => e.kind === 'pascha');
    const heading = hasPascha ? 'Пасха Христова' : (events[0]?.ru || 'Календарь OCA');
    const eventHtml = events.length ? `<div class="event-list">${events.map(e => `<div class="event"><strong>${escapeHtml(e.ru)}</strong><small>${escapeHtml(e.en)}</small></div>`).join('')}</div>` : '<p class="empty">Крупный праздник в локальной базе не отмечен. Полный список святых дня смотрите на официальной странице OCA.</p>';

    details.innerHTML = `
      <div class="details-date">${escapeHtml(cap(fmtLong.format(selected)))}</div>
      <h2>${escapeHtml(heading)}</h2>
      ${eventHtml}
      ${fasting ? `<div class="fast-note">☦ ${escapeHtml(fasting)}</div>` : ''}
      <div class="actions">
        <a class="action-link" href="${OCA.ocaReadingUrl(selected)}" target="_blank" rel="noopener">📖 Чтения OCA</a>
        <a class="action-link secondary" href="${OCA.ocaSaintsUrl(selected)}" target="_blank" rel="noopener">☦ Святые дня</a>
      </div>`;
  }

  document.getElementById('prevMonth').addEventListener('click', () => {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });
  function goToday() {
    selected = new Date(now); viewYear = now.getFullYear(); viewMonth = now.getMonth(); renderCalendar(); renderDetails();
  }
  document.getElementById('todayBtn').addEventListener('click', goToday);
  document.getElementById('monthTitle').addEventListener('click', goToday);

  renderToday(); renderCalendar(); renderDetails();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
