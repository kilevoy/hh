const storeKey = "career-ops-state-v1";

const initialState = {
  view: "today",
  profile: {
    role: "",
    level: "",
    format: "Удаленно",
    location: "",
    minPay: "",
    targetPay: "",
    strengths: "",
    limits: "",
    links: "",
  },
  applications: [],
  interviews: [],
  tasks: [
    { id: id(), title: "Заполнить профиль кандидата", status: "Нужно сделать", due: today(), type: "Стратегия" },
    { id: id(), title: "Добавить базовое резюме", status: "Нужно сделать", due: today(), type: "Материалы" },
    { id: id(), title: "Разобрать 10 вакансий", status: "Нужно сделать", due: today(), type: "Вакансии" },
  ],
  notes: "",
};

const labels = {
  today: { title: "Сегодня", subtitle: "План дня, фокус и ближайшие действия" },
  applications: { title: "Вакансии", subtitle: "Воронка откликов и решений" },
  interviews: { title: "Интервью", subtitle: "Раунды, подготовка и итоги" },
  resume: { title: "Резюме", subtitle: "Печатная версия для откликов и отправки работодателям" },
  resumeAlt: { title: "Резюме 2", subtitle: "Копия в стиле документа со структурными таблицами" },
  resumeWord: { title: "Резюме 3", subtitle: "Строгая Word-версия для отправки работодателям" },
  resumeExecutive: { title: "Резюме 4", subtitle: "Executive Design для управленческих позиций" },
  profile: { title: "Профиль", subtitle: "Целевая роль, ограничения и позиционирование" },
  playbooks: { title: "Плейбуки", subtitle: "Процессы поиска вакансий и подготовки к интервью" },
};

const nav = [
  ["today", "◧", "Сегодня"],
  ["applications", "□", "Вакансии"],
  ["interviews", "◇", "Интервью"],
  ["resume", "▣", "Резюме"],
  ["resumeAlt", "▧", "Резюме 2"],
  ["resumeWord", "◫", "Резюме 3"],
  ["resumeExecutive", "◩", "Резюме 4"],
  ["profile", "◎", "Профиль"],
  ["playbooks", "▤", "Плейбуки"],
];

let state = loadState();
let modal = null;
let toastTimer = null;

function id() {
  return Math.random().toString(36).slice(2, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey));
    return saved ? { ...initialState, ...saved, view: saved.view || "today" } : initialState;
  } catch {
    return initialState;
  }
}

function saveState() {
  localStorage.setItem(storeKey, JSON.stringify(state));
}

function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statusClass(status) {
  if (["Отклик отправлен", "Интервью", "Оффер", "Готово"].includes(status)) return "good";
  if (["На паузе", "Нужно сделать", "Ждем ответ"].includes(status)) return "warn";
  if (["Отказ", "Пропустить"].includes(status)) return "bad";
  return "";
}

function fitClass(fit) {
  if (fit === "Сильный") return "good";
  if (fit === "Средний") return "warn";
  if (fit === "Слабый") return "bad";
  return "";
}

function showToast(text) {
  clearTimeout(toastTimer);
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = text;
  document.body.append(node);
  toastTimer = setTimeout(() => node.remove(), 2200);
}

function render() {
  const view = labels[state.view] ? state.view : "today";
  const app = document.querySelector("#app");
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        ${brand()}
        ${navHtml()}
        <div class="sidebar-footer">
          <button class="ghost" data-action="export"><span class="ico">⇩</span>Экспорт</button>
          <button class="ghost" data-action="import"><span class="ico">⇧</span>Импорт</button>
        </div>
      </aside>
      <main class="main">
        <select class="mobile-nav" data-action="mobile-nav">
          ${nav.map(([key, , text]) => `<option value="${key}" ${key === view ? "selected" : ""}>${text}</option>`).join("")}
        </select>
        <div class="topbar">
          <div>
            <h2>${labels[view].title}</h2>
            <p>${labels[view].subtitle}</p>
          </div>
          ${toolbar(view)}
        </div>
        ${renderView(view)}
      </main>
    </div>
    ${modal ? renderModal() : ""}
  `;
  bindEvents();
}

function brand() {
  return `
    <div class="brand">
      <div class="mark">CO</div>
      <div>
        <h1>Карьерный штаб</h1>
        <p>Штаб поиска работы</p>
      </div>
    </div>
  `;
}

function navHtml() {
  return `
    <nav class="nav">
      ${nav.map(([key, icon, text]) => `
        <button class="${state.view === key ? "active" : ""}" data-view="${key}">
          <span class="ico">${icon}</span>
          <span>${text}</span>
        </button>
      `).join("")}
    </nav>
  `;
}

function toolbar(view) {
  if (view === "applications") {
    return `<div class="toolbar"><button class="action" data-action="new-application"><span class="ico">＋</span>Вакансия</button></div>`;
  }
  if (view === "interviews") {
    return `<div class="toolbar"><button class="action" data-action="new-interview"><span class="ico">＋</span>Интервью</button></div>`;
  }
  if (view === "resume" || view === "resumeAlt" || view === "resumeWord" || view === "resumeExecutive") {
    return `
      <div class="toolbar">
        <button class="action" data-action="print-resume"><span class="ico">⎙</span>Печать / PDF</button>
        <button class="ghost" data-action="download-word"><span class="ico">▣</span>Скачать Word</button>
      </div>
    `;
  }
  if (view === "today") {
    return `<div class="toolbar"><button class="action" data-action="new-task"><span class="ico">＋</span>Задача</button><button class="ghost" data-view="applications"><span class="ico">□</span>Воронка</button></div>`;
  }
  if (view === "profile") {
    return `<div class="toolbar"><button class="action" data-action="save-profile"><span class="ico">✓</span>Сохранить</button></div>`;
  }
  return `<div class="toolbar"><button class="ghost" data-action="open-jobops"><span class="ico">↗</span>Панель вакансий</button></div>`;
}

function renderView(view) {
  if (view === "today") return todayView();
  if (view === "applications") return applicationsView();
  if (view === "interviews") return interviewsView();
  if (view === "resume") return resumeView();
  if (view === "resumeAlt") return resumeAltView();
  if (view === "resumeWord") return resumeWordView();
  if (view === "resumeExecutive") return resumeExecutiveView();
  if (view === "profile") return profileView();
  return playbooksView();
}

function todayView() {
  const active = state.applications.filter((item) => !["Отказ", "Пропустить"].includes(item.status));
  const interviews = state.interviews.filter((item) => item.status !== "Завершено");
  const tasks = state.tasks.filter((item) => item.status !== "Готово");
  return `
    <section class="kpis">
      ${kpi(active.length, "Активных вакансий")}
      ${kpi(state.applications.filter((x) => x.status === "Отклик отправлен").length, "Откликов")}
      ${kpi(interviews.length, "Интервью в работе")}
      ${kpi(tasks.length, "Открытых задач")}
    </section>
    <section class="grid two">
      <div class="panel">
        <div class="panel-head">
          <div><h3>Фокус дня</h3><p>Что двигает поиск прямо сейчас</p></div>
        </div>
        <div class="panel-body">
          <textarea data-field="notes" placeholder="Например: разобрать 5 вакансий руководителя продаж, адаптировать резюме под две сильные роли, подготовить историю S001.">${escapeHtml(state.notes)}</textarea>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div><h3>Ближайшие задачи</h3><p>Незакрытые действия</p></div>
          <button class="ghost" data-action="new-task">＋</button>
        </div>
        <div class="panel-body">
          ${taskList(tasks.slice(0, 6))}
        </div>
      </div>
    </section>
    <section class="grid two" style="margin-top:14px">
      <div class="panel">
        <div class="panel-head">
          <div><h3>Сильные вакансии</h3><p>Сначала работаем с ними</p></div>
        </div>
        <div class="panel-body">
          ${applicationCards(state.applications.filter((x) => x.fit === "Сильный").slice(0, 5))}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div><h3>Ближайшие интервью</h3><p>Подготовка и раунды</p></div>
        </div>
        <div class="panel-body">
          ${interviewCards(interviews.slice(0, 5))}
        </div>
      </div>
    </section>
  `;
}

function kpi(value, label) {
  return `<div class="kpi"><strong>${value}</strong><span>${label}</span></div>`;
}

function taskList(tasks) {
  if (!tasks.length) return `<div class="empty">Нет открытых задач.</div>`;
  return `
    <div class="card-list">
      ${tasks.map((task) => `
        <div class="item">
          <div class="item-title">
            <strong>${escapeHtml(task.title)}</strong>
            <button class="ghost" data-action="done-task" data-id="${task.id}">✓</button>
          </div>
          <div class="chips">
            <span class="chip">${escapeHtml(task.type)}</span>
            <span class="chip">${escapeHtml(task.due || "Без даты")}</span>
            <span class="status ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function applicationCards(items) {
  if (!items.length) return `<div class="empty">Добавь первую вакансию.</div>`;
  return `
    <div class="card-list">
      ${items.map((item) => `
        <div class="item">
          <div class="item-title">
            <strong>${escapeHtml(item.company)} · ${escapeHtml(item.role)}</strong>
            <span class="fit ${fitClass(item.fit)}">${escapeHtml(item.fit)}</span>
          </div>
          <div class="muted small">${escapeHtml(item.source || "Источник не указан")}</div>
          <div class="chips">
            <span class="status ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
            <span class="chip">${escapeHtml(item.next || "Следующий шаг не задан")}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function interviewCards(items) {
  if (!items.length) return `<div class="empty">Интервью пока нет.</div>`;
  return `
    <div class="card-list">
      ${items.map((item) => `
        <div class="item">
          <div class="item-title">
            <strong>${escapeHtml(item.company)} · ${escapeHtml(item.round)}</strong>
            <span class="status ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
          </div>
          <div class="muted small">${escapeHtml(item.role)} · ${escapeHtml(item.format)} · ${escapeHtml(item.date)}</div>
          <div>${escapeHtml(item.notes || "")}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function applicationsView() {
  return `
    <div class="panel">
      <div class="panel-head">
        <div><h3>Воронка откликов</h3><p>Каждая вакансия получает вердикт и следующий шаг</p></div>
      </div>
      <div class="panel-body table-wrap">
        ${state.applications.length ? `
          <table>
            <thead>
              <tr>
                <th>Дата</th><th>Компания</th><th>Роль</th><th>Подходит</th><th>Статус</th><th>Источник</th><th>Следующий шаг</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${state.applications.map((item) => `
                <tr>
                  <td>${escapeHtml(item.date)}</td>
                  <td><strong>${escapeHtml(item.company)}</strong></td>
                  <td>${escapeHtml(item.role)}</td>
                  <td><span class="fit ${fitClass(item.fit)}">${escapeHtml(item.fit)}</span></td>
                  <td><span class="status ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
                  <td>${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(item.source || "Ссылка")}</a>` : escapeHtml(item.source)}</td>
                  <td>${escapeHtml(item.next)}</td>
                  <td><button class="ghost" data-action="edit-application" data-id="${item.id}">Открыть</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : `<div class="empty">Воронка пустая. Добавь первую вакансию.</div>`}
      </div>
    </div>
  `;
}

function interviewsView() {
  return `
    <div class="panel">
      <div class="panel-head">
        <div><h3>Раунды</h3><p>Подготовка, формат и результат каждого интервью</p></div>
      </div>
      <div class="panel-body table-wrap">
        ${state.interviews.length ? `
          <table>
            <thead>
              <tr>
                <th>Дата</th><th>Компания</th><th>Роль</th><th>Раунд</th><th>Формат</th><th>Статус</th><th>Итог</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${state.interviews.map((item) => `
                <tr>
                  <td>${escapeHtml(item.date)}</td>
                  <td><strong>${escapeHtml(item.company)}</strong></td>
                  <td>${escapeHtml(item.role)}</td>
                  <td>${escapeHtml(item.round)}</td>
                  <td>${escapeHtml(item.format)}</td>
                  <td><span class="status ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
                  <td>${escapeHtml(item.outcome)}</td>
                  <td><button class="ghost" data-action="edit-interview" data-id="${item.id}">Открыть</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : `<div class="empty">Добавь интервью, когда появится первый раунд.</div>`}
      </div>
    </div>
  `;
}

function legacyResumeView() {
  return `
    <article class="resume-page">
      <header class="resume-hero">
        <div>
          <p class="resume-kicker">Резюме</p>
          <h1>Рыкунов Андрей Николаевич</h1>
          <p class="resume-role">Заместитель коммерческого директора / Руководитель направления продаж</p>
          <div class="resume-contacts">
            <span>г. Челябинск</span>
            <span>31 мая 1971 г.</span>
            <span>+7 (919) 343-48-71</span>
            <span>rykunov@gmail.com</span>
            <span>готов к командировкам</span>
          </div>
        </div>
        <div class="resume-summary-card">
          <strong>18+ лет</strong>
          <span>управления продажами в металлоконструкциях и строительных материалах</span>
        </div>
      </header>

      <section class="resume-strip">
        <div><strong>Формат</strong><span>полная занятость, полный день</span></div>
        <div><strong>Компенсация</strong><span>по договоренности</span></div>
        <div><strong>Масштаб</strong><span>команды до 85 человек, оборот более 1 млрд рублей</span></div>
      </section>

      <section class="resume-section">
        <h2>Профессиональный профиль</h2>
        <p>Опытный руководитель коммерческого блока с экспертизой в развитии продаж, филиальных сетей и цифровизации коммерческих процессов. Успешно управлял региональными дивизионами, командами продаж и бюджетами с годовым оборотом более 1 млрд рублей. Сильная сторона — соединение коммерческого управления, отраслевой экспертизы и внедрения CRM, аналитики и внутренних сервисов для ускорения продаж.</p>
      </section>

      <div class="resume-body">
        <aside class="resume-aside">
          <section>
            <h2>Ключевые навыки</h2>
            ${compactSkillGroup("Управление", ["Руководство продажами", "Филиальные сети", "Стратегическое планирование", "Бюджетирование", "Развитие команд", "Переговоры с первыми лицами"])}
            ${compactSkillGroup("Технологии", ["MS Dynamics CRM", "1C CRM", "amoCRM", "Power BI", "Excel", "1С:Предприятие"])}
            ${compactSkillGroup("Отрасль", ["Металлоконструкции", "Строительные материалы", "Металлургия", "B2B-продажи", "Дистрибуция", "Логистика"])}
          </section>
          <section>
            <h2>Образование</h2>
            <div class="aside-item"><strong>2006</strong><span>Южно-Уральский государственный университет<br>Экономика и управление на предприятии</span></div>
            <div class="aside-item"><strong>1998</strong><span>Университет Российской академии образования<br>Юридический факультет</span></div>
          </section>
          <section>
            <h2>Дополнительно</h2>
            <ul class="clean-list">
              <li>Готовность к командировкам</li>
              <li>Водительские права категории B</li>
              <li>Русский язык — родной</li>
              <li>Рекомендации по запросу</li>
            </ul>
          </section>
        </aside>

        <main class="resume-main">
          <section class="resume-section">
            <h2>Ключевые достижения</h2>
            <div class="resume-achievements">
              <div>
                <strong>1 млрд+ рублей оборота</strong>
                <span>управление полным коммерческим циклом: планирование, ценообразование, дебиторская задолженность, выполнение финансовых показателей.</span>
              </div>
              <div>
                <strong>Филиальная сеть</strong>
                <span>участие в запуске и масштабировании региональных представительств, стандартизация коммерческих процессов.</span>
              </div>
              <div>
                <strong>CRM и аналитика</strong>
                <span>бизнес-заказчик внедрения MS Dynamics CRM, 1C CRM, amoCRM; дашборды Power BI используются с 2016 года.</span>
              </div>
              <div>
                <strong>30% ускорение расчетов</strong>
                <span>создание внутренних калькуляторов и сервисов для подготовки коммерческих предложений.</span>
              </div>
            </div>
          </section>

          <section class="resume-section">
            <h2>Опыт работы</h2>
            <div class="timeline">
              ${jobBlock("04.2008 — н.в.", "ООО «ИНСИ Стальные конструкции»", "г. Челябинск · производство и продажа металлоконструкций, строительных материалов", [
                ["08.2025 — н.в.", "Заместитель коммерческого директора, служба сбыта"],
                ["10.2019 — 07.2025", "Заместитель директора, служба сбыта"],
                ["04.2008 — 09.2019", "Руководитель направления"]
              ], [
                "Управление продажами с годовым оборотом более 1 млрд рублей.",
                "Развитие региональной и филиальной сети, контроль эффективности подразделений.",
                "Внедрение CRM-ландшафта: MS Dynamics CRM, 1C CRM, amoCRM.",
                "Разработка управленческих дашбордов Power BI для мониторинга KPI.",
                "Управление дивизионами: Урал, Запад, направления «Кровля», «Кровля и фасады».",
                "Подбор, обучение и развитие персонала, формирование кадрового резерва."
              ])}
              ${jobBlock("12.2003 — 02.2008", "АО «Челябинский трубопрокатный завод»", "г. Челябинск · металлургическое производство и торговля трубной продукцией", [
                ["4 года 2 мес.", "Начальник отдела продаж"]
              ], [
                "Организация системной работы отдела продаж трубной продукции.",
                "Развитие клиентской базы и переговоры с первыми лицами крупных компаний.",
                "Подбор и обучение команды менеджеров, выполнение плановых показателей."
              ])}
              ${jobBlock("06.2000 — 12.2003", "ЗАО «Челябинский профнастил»", "г. Челябинск · производство профнастила, металлочерепицы, сэндвич-панелей", [
                ["Карьерный рост", "Менеджер по продажам → директор по стратегическому маркетингу → директор по сбыту → директор центра продаж"]
              ], [
                "Управление сбытовой структурой завода и филиальной сетью.",
                "Развитие продаж в промышленном и строительном сегментах.",
                "Участие в открытии филиалов, совмещение коммерческого и маркетингового функционала."
              ])}
              ${jobBlock("08.1992 — 06.2000", "ОАО «Связьинформ» / Челябгорэлектросвязь", "г. Челябинск · телекоммуникации", [
                ["7 лет 10 мес.", "Кабельщик"]
              ], [
                "Техническое обслуживание и монтаж кабельных линий связи."
              ])}
            </div>
          </section>
        </main>
      </div>
    </article>
  `;
}

function jobBlock(period, company, meta, roles, points) {
  return `
    <div class="timeline-item">
      <div class="timeline-period">${period}</div>
      <div class="timeline-content">
        <h3>${company}</h3>
        <p>${meta}</p>
        <div class="role-list">
          ${roles.map(([date, title]) => `<div><span>${date}</span><strong>${title}</strong></div>`).join("")}
        </div>
        <ul>
          ${points.map((point) => `<li>${point}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}

function compactSkillGroup(title, skills) {
  return `
    <div class="skill-group">
      <h3>${title}</h3>
      <div class="skill-tags">
        ${skills.map((skill) => `<span>${skill}</span>`).join("")}
      </div>
    </div>
  `;
}

function resumeView() {
  return `
    <article class="resume-document">
      <header>
        <div class="resume-doc-top">
          ${profilePhoto("resume-doc-photo")}
          <div>
            <h1>РЫКУНОВ АНДРЕЙ НИКОЛАЕВИЧ</h1>
            <div class="resume-doc-header-info">
              <div class="resume-doc-contact-row">г. Челябинск | 31 мая 1971 г.</div>
              <div class="resume-doc-contact-row">+7 (919) 343-48-71 | rykunov@gmail.com | готов к командировкам</div>
            </div>
          </div>
        </div>
        <div class="resume-doc-meta-row">
          <strong>Желаемая должность:</strong> Заместитель коммерческого директора / Руководитель направления продаж<br>
          <strong>Занятость:</strong> полная | <strong>График:</strong> полный день | <strong>Зарплата:</strong> по договоренности
        </div>
      </header>

      <section>
        <h2 class="resume-doc-title">Профессиональный профиль</h2>
        <p>Опытный руководитель коммерческого блока с 18+ годами управления продажами в сегменте металлоконструкций и строительных материалов. Эксперт в развитии филиальных сетей, внедрении CRM-систем и автоматизации коммерческих процессов. Успешный опыт управления командами до 85 человек и коммерческими бюджетами с годовым оборотом более 1 млрд рублей.</p>
      </section>

      <section>
        <h2 class="resume-doc-title">Опыт работы</h2>
        <div class="resume-doc-job">
          <div class="resume-doc-job-header">
            <span class="resume-doc-job-title">ООО «ИНСИ Стальные конструкции» (ранее ЗАО «ИНСИ»), г. Челябинск</span>
            <span class="resume-doc-job-period">04.2008 — н.в. | 18 лет 1 мес.</span>
          </div>
          <div class="resume-doc-company">Производство и продажа металлоконструкций, строительных материалов</div>
          <p><strong>Карьера:</strong> Руководитель направления (04.2008–09.2019) → Заместитель директора (10.2019–07.2025) → Заместитель коммерческого директора (с 08.2025)</p>
          <ul>
            <li>Управление продажами с годовым оборотом более 1 млрд рублей: полное сопровождение коммерческого цикла — от планирования и ценообразования до контроля дебиторской задолженности и выполнения финансовых показателей</li>
            <li>Участие в запуске филиальной сети: масштабирование бизнеса в регионах РФ, организация работы представительств, стандартизация коммерческих процессов</li>
            <li>Внедрение CRM-ландшафта: MS Dynamics CRM, 1C CRM, amoCRM (бизнес-заказчик: от ТЗ до внедрения и обучения пользователей)</li>
            <li>Разработка и внедрение управленческих дашбордов в Power BI для мониторинга KPI в реальном времени (используются с 2016 г.)</li>
            <li>Создание внутренних калькуляторов и сервисов, ускоривших подготовку коммерческих предложений на 30%</li>
            <li>Управление дивизионами: Урал, Запад, направления «Кровля», «Кровля и фасады»</li>
          </ul>
        </div>

        <div class="resume-doc-job">
          <div class="resume-doc-job-header">
            <span class="resume-doc-job-title">АО «Челябинский трубопрокатный завод» (в т.ч. ЗАО ТД «Уралтрубосталь»), г. Челябинск</span>
            <span class="resume-doc-job-period">12.2003 — 02.2008 | 4 года 2 мес.</span>
          </div>
          <div class="resume-doc-company">Металлургическое производство и торговля трубной продукцией</div>
          <p><strong>Начальник отдела продаж</strong></p>
          <ul>
            <li>Организация системной работы отдела продаж трубной продукции</li>
            <li>Развитие клиентской базы, переговоры с первыми лицами крупных компаний</li>
            <li>Подбор и обучение команды менеджеров, выполнение плановых показателей</li>
          </ul>
        </div>

        <div class="resume-doc-job">
          <div class="resume-doc-job-header">
            <span class="resume-doc-job-title">ЗАО «Челябинский профнастил» (ОАО «ЧЗПСН-Профнастил»), г. Челябинск</span>
            <span class="resume-doc-job-period">06.2000 — 12.2003 | 3 года 6 мес.</span>
          </div>
          <div class="resume-doc-company">Производство профнастила, металлочерепицы, сэндвич-панелей</div>
          <p><strong>Карьерный рост:</strong> Менеджер по продажам → Менеджер отдела стратегического маркетинга → Директор по стратегическому маркетингу → Директор по сбыту → Директор центра продаж</p>
          <ul>
            <li>Управление сбытовой структурой завода и филиальной сетью</li>
            <li>Развитие продаж в промышленном и строительном сегментах</li>
            <li>Участие в открытии филиалов, совмещение коммерческого и маркетингового функционала</li>
          </ul>
        </div>

        <div class="resume-doc-job">
          <div class="resume-doc-job-header">
            <span class="resume-doc-job-title">ОАО «Связьинформ» / Челябгорэлектросвязь, г. Челябинск</span>
            <span class="resume-doc-job-period">08.1992 — 06.2000 | 7 лет 10 мес.</span>
          </div>
          <div class="resume-doc-company">Сфера телекоммуникаций</div>
          <p><strong>Кабельщик</strong></p>
          <ul>
            <li>Техническое обслуживание и монтаж кабельных линий связи</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 class="resume-doc-title">Ключевые навыки</h2>
        <div class="resume-doc-skills-grid">
          <div class="resume-doc-skill-col">
            <h3>Управление</h3>
            <ul>
              <li>Руководство продажами</li>
              <li>Управление филиальными сетями</li>
              <li>Стратегическое планирование</li>
              <li>Бюджетирование и финансовый контроль</li>
              <li>Подбор и развитие команд</li>
              <li>Переговоры на уровне первых лиц</li>
            </ul>
          </div>
          <div class="resume-doc-skill-col">
            <h3>Технологии</h3>
            <ul>
              <li>MS Dynamics CRM, 1C CRM, amoCRM</li>
              <li>Power BI, Excel</li>
              <li>1С:Предприятие</li>
              <li>Электронный документооборот</li>
              <li>Автоматизация процессов</li>
            </ul>
          </div>
          <div class="resume-doc-skill-col">
            <h3>Отраслевые знания</h3>
            <ul>
              <li>Рынок металлопродукции РФ</li>
              <li>Строительные материалы</li>
              <li>Металлургическая отрасль</li>
              <li>Региональные рынки Урала</li>
              <li>B2B-продажи</li>
              <li>Дистрибуция и логистика</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 class="resume-doc-title">Образование</h2>
        <div class="resume-doc-edu-item">
          <span class="resume-doc-edu-year">2006</span> | Высшее<br>
          <span class="resume-doc-edu-univ">Южно-Уральский государственный университет</span>, г. Челябинск<br>
          <span class="resume-doc-edu-spec">Экономика и управление на предприятии</span>
        </div>
        <div class="resume-doc-edu-item">
          <span class="resume-doc-edu-year">1998</span> | Высшее<br>
          <span class="resume-doc-edu-univ">Университет Российской академии образования</span>, г. Москва<br>
          <span class="resume-doc-edu-spec">Юридический факультет</span>
        </div>
      </section>

      <section>
        <h2 class="resume-doc-title">Достижения и проекты</h2>
        <ul class="resume-doc-achievements-list">
          <li><strong>Цифровизация продаж:</strong> Бизнес-заказчик внедрения CRM-систем в ООО «ИНСИ Стальные конструкции». Разработка и внедрение дашбордов в Power BI для регулярного мониторинга продаж</li>
          <li><strong>Масштабирование бизнеса:</strong> Участие в запуске филиальной сети компании в разных регионах РФ. Оптимизация коммерческих процессов, сокращение времени расчетов на 30%</li>
          <li><strong>Развитие команд:</strong> Построение эффективной структуры службы сбыта. Наставничество и развитие руководителей филиалов</li>
        </ul>
      </section>

      <section class="resume-doc-additional-info">
        <h2 class="resume-doc-title">Дополнительная информация</h2>
        <ul>
          <li>Готовность к командировкам</li>
          <li>Водительские права категории B</li>
          <li>Русский — родной</li>
          <li>Рекомендации предоставляются по запросу</li>
        </ul>
      </section>

    </article>
  `;
}

function resumeAltView() {
  return `
    <article class="resume-qwen">
      <header class="resume-qwen-header">
        <div class="resume-qwen-top">
          ${profilePhoto("resume-qwen-photo")}
          <div>
            <h1>РЫКУНОВ АНДРЕЙ НИКОЛАЕВИЧ</h1>
            <div class="resume-qwen-lines">
              <div>📍 Челябинск | 📅 31 мая 1971 г.</div>
              <div>📞 +7 (919) 343-48-71 | ✉ rykunov@gmail.com | 🚗 готов к командировкам</div>
            </div>
          </div>
        </div>
        <p><strong>Желаемая должность:</strong> Заместитель коммерческого директора / Руководитель направления продаж</p>
        <p><strong>Занятость:</strong> полная | <strong>График:</strong> полный день | <strong>Зарплата:</strong> по договоренности</p>
      </header>

      ${qwenSection("🎯", "Профессиональный профиль", `
        <p>Опытный руководитель коммерческого блока с 18+ годами управления продажами в сегменте металлоконструкций и строительных материалов. Эксперт в развитии филиальных сетей, внедрении CRM-систем и автоматизации коммерческих процессов. Успешный опыт управления командами до 85 человек и коммерческими бюджетами с годовым оборотом более 1 млрд рублей.</p>
      `)}

      <section class="resume-qwen-section">
        <h2>💼 Опыт работы</h2>
        <div class="resume-qwen-job">
          <h3>04.2008 — н.в. | 18 лет 1 мес.</h3>
          <p><strong>ООО «ИНСИ Стальные конструкции»</strong> (ранее ЗАО «ИНСИ»), г. Челябинск<br><em>Производство и продажа металлоконструкций, строительных материалов</em></p>
          <table class="resume-qwen-table">
            <thead><tr><th>Период</th><th>Должность</th></tr></thead>
            <tbody>
              <tr><td>08.2025 — н.в.</td><td>Заместитель коммерческого директора, служба сбыта</td></tr>
              <tr><td>10.2019 — 07.2025</td><td>Заместитель директора, служба сбыта</td></tr>
              <tr><td>04.2008 — 09.2019</td><td>Руководитель направления</td></tr>
            </tbody>
          </table>
          <h4>🔹 Ключевые достижения:</h4>
          <ul class="resume-qwen-checks">
            <li>Управление продажами с годовым оборотом более 1 млрд рублей: полное сопровождение коммерческого цикла — от планирования и ценообразования до контроля дебиторской задолженности и выполнения финансовых показателей</li>
            <li>Участие в запуске филиальной сети: масштабирование бизнеса в регионах РФ, организация работы представительств, стандартизация коммерческих процессов</li>
            <li>Внедрение CRM-ландшафта: MS Dynamics CRM, 1C CRM, amoCRM (бизнес-заказчик: от ТЗ до внедрения и обучения пользователей)</li>
            <li>Разработка и внедрение управленческих дашбордов в Power BI для мониторинга KPI в реальном времени (используются с 2016 г.)</li>
            <li>Создание внутренних калькуляторов и сервисов, ускоривших подготовку коммерческих предложений на 30%</li>
            <li>Управление дивизионами: Урал, Запад, направления «Кровля», «Кровля и фасады»</li>
          </ul>
          <h4>🔹 Зоны ответственности:</h4>
          <ul>
            <li>Стратегическое планирование продаж, бюджетирование и прогнозирование</li>
            <li>Развитие региональной и филиальной сети, контроль эффективности подразделений</li>
            <li>Подбор, обучение и развитие персонала, формирование кадрового резерва</li>
            <li>Аналитика рынка, мониторинг конкурентов, формирование ценовой политики</li>
            <li>Автоматизация коммерческих процессов, цифровизация отчетности</li>
          </ul>
        </div>

        ${qwenJob("12.2003 — 02.2008 | 4 года 2 мес.", "АО «Челябинский трубопрокатный завод»", "г. Челябинск", "Металлургическое производство и торговля трубной продукцией", "Начальник отдела продаж", [
          "Организация системной работы отдела продаж трубной продукции",
          "Развитие клиентской базы, переговоры с первыми лицами крупных компаний",
          "Подбор и обучение команды менеджеров, выполнение плановых показателей"
        ])}

        ${qwenJob("06.2000 — 12.2003 | 3 года 6 мес.", "ЗАО «Челябинский профнастил»", "г. Челябинск", "Производство профнастила, металлочерепицы, сэндвич-панелей", "Карьерный рост: менеджер по продажам → директор по стратегическому маркетингу → директор по сбыту → директор центра продаж", [
          "Управление сбытовой структурой завода и филиальной сетью",
          "Развитие продаж в промышленном и строительном сегментах",
          "Участие в открытии филиалов, совмещение коммерческого и маркетингового функционала"
        ])}

        ${qwenJob("08.1992 — 06.2000 | 7 лет 10 мес.", "ОАО «Связьинформ» / Челябгорэлектросвязь", "г. Челябинск", "Сфера телекоммуникаций", "Кабельщик", [
          "Техническое обслуживание и монтаж кабельных линий связи"
        ])}
      </section>

      <section class="resume-qwen-section">
        <h2>🔑 Ключевые навыки</h2>
        <table class="resume-qwen-skill-table">
          <thead><tr><th>Управление</th><th>Технологии</th><th>Отраслевые знания</th></tr></thead>
          <tbody>
            <tr><td>✅ Руководство продажами</td><td>✅ MS Dynamics CRM</td><td>✅ Рынок металлопродукции РФ</td></tr>
            <tr><td>✅ Управление филиальными сетями</td><td>✅ 1C CRM, amoCRM</td><td>✅ Строительные материалы</td></tr>
            <tr><td>✅ Стратегическое планирование</td><td>✅ Power BI, Excel</td><td>✅ Металлургическая отрасль</td></tr>
            <tr><td>✅ Бюджетирование и финансовый контроль</td><td>✅ 1С:Предприятие</td><td>✅ Региональные рынки Урала</td></tr>
            <tr><td>✅ Подбор и развитие команд</td><td>✅ Электронный документооборот</td><td>✅ B2B-продажи</td></tr>
            <tr><td>✅ Переговоры на уровне первых лиц</td><td>✅ Автоматизация процессов</td><td>✅ Дистрибуция и логистика</td></tr>
          </tbody>
        </table>
      </section>

      ${qwenSection("🎓", "Образование", `
        <p><strong>2006 | Высшее</strong><br>Южно-Уральский государственный университет, г. Челябинск<br><em>Экономика и управление на предприятии</em></p>
        <p><strong>1998 | Высшее</strong><br>Университет Российской академии образования, г. Москва<br><em>Юридический факультет</em></p>
      `)}

      ${qwenSection("📈", "Достижения и проекты", `
        <p><strong>🏆 Цифровизация продаж:</strong></p>
        <ul>
          <li>Бизнес-заказчик внедрения CRM-систем в ООО «ИНСИ Стальные конструкции»</li>
          <li>Разработка и внедрение дашбордов в Power BI для регулярного мониторинга продаж</li>
        </ul>
        <p><strong>🏆 Масштабирование бизнеса:</strong></p>
        <ul>
          <li>Участие в запуске филиальной сети компании в разных регионах РФ</li>
          <li>Оптимизация коммерческих процессов, сокращение времени расчетов на 30%</li>
        </ul>
        <p><strong>🏆 Развитие команд:</strong></p>
        <ul>
          <li>Построение эффективной структуры службы сбыта</li>
          <li>Наставничество и развитие руководителей филиалов</li>
        </ul>
      `)}

      ${qwenSection("ℹ️", "Дополнительная информация", `
        <ul>
          <li>🌐 Готовность к командировкам по РФ и СНГ</li>
          <li>💼 Водительские права категории B</li>
          <li>🗣 Русский — родной</li>
          <li>🤝 Рекомендации предоставляются по запросу</li>
        </ul>
      `)}

    </article>
  `;
}

function resumeWordView() {
  return `
    <article class="resume-word">
      <header class="resume-word-header">
        <div>
          <h1>РЫКУНОВ АНДРЕЙ НИКОЛАЕВИЧ</h1>
          <p class="resume-word-position">Заместитель коммерческого директора / Руководитель направления продаж</p>
          <div class="resume-word-contact">
            <span>г. Челябинск</span>
            <span>31 мая 1971 г.</span>
            <span>+7 (919) 343-48-71</span>
            <span>rykunov@gmail.com</span>
            <span>готов к командировкам</span>
          </div>
        </div>
        ${profilePhoto("resume-word-photo")}
      </header>

      <section class="resume-word-meta">
        <div><strong>Занятость:</strong> полная</div>
        <div><strong>График:</strong> полный день</div>
        <div><strong>Зарплата:</strong> по договоренности</div>
      </section>

      <section class="resume-word-section">
        <h2>Профессиональный профиль</h2>
        <p>Опытный руководитель коммерческого блока с 18+ годами управления продажами в сегменте металлоконструкций и строительных материалов. Эксперт в развитии филиальных сетей, внедрении CRM-систем и автоматизации коммерческих процессов. Успешный опыт управления командами до 85 человек и коммерческими бюджетами с годовым оборотом более 1 млрд рублей.</p>
      </section>

      <section class="resume-word-section">
        <h2>Ключевые компетенции</h2>
        <div class="resume-word-competencies">
          <span>Управление продажами</span>
          <span>Филиальные сети</span>
          <span>B2B-переговоры</span>
          <span>Коммерческое планирование</span>
          <span>CRM и автоматизация</span>
          <span>Power BI и управленческая аналитика</span>
          <span>Бюджетирование</span>
          <span>Развитие команд</span>
        </div>
      </section>

      <section class="resume-word-section">
        <h2>Опыт работы</h2>
        ${wordJob("04.2008 — н.в.", "ООО «ИНСИ Стальные конструкции», г. Челябинск", "Заместитель коммерческого директора / Заместитель директора / Руководитель направления", [
          "Управление продажами с годовым оборотом более 1 млрд рублей.",
          "Масштабирование бизнеса в регионах РФ и участие в запуске филиальной сети.",
          "Внедрение MS Dynamics CRM, 1C CRM, amoCRM как бизнес-заказчик: от ТЗ до обучения пользователей.",
          "Разработка управленческих дашбордов Power BI для мониторинга KPI в реальном времени.",
          "Создание внутренних калькуляторов и сервисов, ускоривших подготовку коммерческих предложений на 30%.",
          "Управление дивизионами: Урал, Запад, направления «Кровля», «Кровля и фасады»."
        ])}
        ${wordJob("12.2003 — 02.2008", "АО «Челябинский трубопрокатный завод», г. Челябинск", "Начальник отдела продаж", [
          "Организация системной работы отдела продаж трубной продукции.",
          "Развитие клиентской базы и переговоры с первыми лицами крупных компаний.",
          "Подбор и обучение команды менеджеров, выполнение плановых показателей."
        ])}
        ${wordJob("06.2000 — 12.2003", "ЗАО «Челябинский профнастил», г. Челябинск", "Менеджер по продажам → директор по стратегическому маркетингу → директор по сбыту → директор центра продаж", [
          "Управление сбытовой структурой завода и филиальной сетью.",
          "Развитие продаж в промышленном и строительном сегментах.",
          "Участие в открытии филиалов, совмещение коммерческого и маркетингового функционала."
        ])}
        ${wordJob("08.1992 — 06.2000", "ОАО «Связьинформ» / Челябгорэлектросвязь, г. Челябинск", "Кабельщик", [
          "Техническое обслуживание и монтаж кабельных линий связи."
        ])}
      </section>

      <section class="resume-word-section">
        <h2>Навыки</h2>
        <table class="resume-word-table">
          <thead>
            <tr><th>Управление</th><th>Технологии</th><th>Отрасль</th></tr>
          </thead>
          <tbody>
            <tr><td>Руководство продажами</td><td>MS Dynamics CRM</td><td>Рынок металлопродукции РФ</td></tr>
            <tr><td>Филиальные сети</td><td>1C CRM, amoCRM</td><td>Строительные материалы</td></tr>
            <tr><td>Стратегическое планирование</td><td>Power BI, Excel</td><td>Металлургическая отрасль</td></tr>
            <tr><td>Финансовый контроль</td><td>1С:Предприятие</td><td>B2B-продажи</td></tr>
            <tr><td>Развитие команд</td><td>Электронный документооборот</td><td>Дистрибуция и логистика</td></tr>
          </tbody>
        </table>
      </section>

      <section class="resume-word-grid">
        <div class="resume-word-section">
          <h2>Образование</h2>
          <p><strong>2006</strong> — Южно-Уральский государственный университет, экономика и управление на предприятии</p>
          <p><strong>1998</strong> — Университет Российской академии образования, юридический факультет</p>
        </div>
        <div class="resume-word-section">
          <h2>Дополнительно</h2>
          <ul>
            <li>Готовность к командировкам</li>
            <li>Водительские права категории B</li>
            <li>Русский — родной</li>
            <li>Рекомендации по запросу</li>
          </ul>
        </div>
      </section>
    </article>
  `;
}

function resumeExecutiveView() {
  return `
    <article class="resume-exec">
      <header class="resume-exec-hero">
        <div class="resume-exec-title">
          <p class="resume-exec-kicker">Executive Design</p>
          <h1>РЫКУНОВ АНДРЕЙ НИКОЛАЕВИЧ</h1>
          <p>Коммерческий директор / Директор по продажам / Заместитель коммерческого директора</p>
          <div class="resume-exec-contact">
            <span>Челябинск</span>
            <span>+7 (919) 343-48-71</span>
            <span>rykunov@gmail.com</span>
            <span>Полная занятость</span>
            <span>Полный день</span>
            <span>Готов к командировкам</span>
          </div>
        </div>
        <figure class="resume-exec-photo resume-photo">
          <img src="assets/executive-photo.png" alt="Фото Рыкунова Андрея Николаевича" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
          <span>РА</span>
        </figure>
      </header>

      <section class="resume-exec-block">
        <div>
          <h2>Позиционирование</h2>
          <p>Коммерческий руководитель с 18+ годами управления продажами в металлоконструкциях, строительных материалах и B2B-дистрибуции. Сильная зона - управление филиальной сетью, CRM/BI-аналитика, стандартизация процессов и рост операционной управляемости продаж.</p>
        </div>
        <div class="resume-exec-metrics">
          <div><strong>18+</strong><span>лет управления продажами</span></div>
          <div><strong>85</strong><span>сотрудников в командах</span></div>
          <div><strong>1+ млрд ₽</strong><span>годовой оборот</span></div>
          <div><strong>12+</strong><span>филиалы и регионы</span></div>
        </div>
      </section>

      <section class="resume-exec-cards">
        ${execCard("Коммерческий контур", "Планирование, ценообразование, дебиторская задолженность, KPI и финансовый контроль.")}
        ${execCard("Цифровизация продаж", "MS Dynamics CRM, 1C CRM, amoCRM, Power BI; постановка ТЗ, внедрение, обучение.")}
        ${execCard("Филиальная сеть", "Запуск представительств, стандартизация процессов, управление руководителями и регионами.")}
      </section>

      <section class="resume-exec-section">
        <h2>Опыт работы</h2>
        ${execJob("04.2008 - н.в.", "18 лет 1 мес.", "ООО «ИНСИ Стальные конструкции», Челябинск", "Производство и продажа металлоконструкций, строительных материалов", "Карьерный рост: Руководитель направления -> Заместитель директора -> Заместитель коммерческого директора", [
          "Управление продажами с годовым оборотом более 1 млрд рублей; сопровождение коммерческого цикла от планирования и ценообразования до контроля дебиторской задолженности и финансовых показателей.",
          "Управление дивизионами: Урал, Запад, направления «Кровля», «Кровля и фасады»; координация руководителей и региональных команд.",
          "Участие в развитии филиальной сети: запуск представительств, стандартизация процессов, внедрение единых правил работы с клиентами, планами и отчетностью.",
          "Внедрение CRM-ландшафта: MS Dynamics CRM, 1C CRM, amoCRM; описание бизнес-логики, постановка ТЗ, обучение пользователей, контроль качества внедрения.",
          "Разработка управленческих дашбордов Power BI для контроля KPI, продаж, динамики и исполнения планов.",
          "Запуск внутренних калькуляторов и сервисов для подготовки коммерческих предложений; сокращение времени расчетов примерно на 30%."
        ])}
      </section>

      <section class="resume-exec-section">
        <h2>Предыдущий опыт</h2>
        ${execJob("12.2003 - 02.2008", "4 года 2 мес.", "АО «Челябинский трубопрокатный завод», Челябинск", "Металлургическое производство и торговля трубной продукцией", "Начальник отдела продаж", [
          "Организация системной работы отдела продаж трубной продукции.",
          "Развитие клиентской базы и переговоры с первыми лицами крупных компаний.",
          "Подбор и обучение менеджеров, контроль выполнения плановых показателей."
        ])}
        ${execJob("06.2000 - 12.2003", "3 года 6 мес.", "ЗАО «Челябинский профнастил», Челябинск", "Производство профнастила, металлочерепицы, сэндвич-панелей", "Директор центра продаж / директор по сбыту / директор по стратегическому маркетингу", [
          "Управление сбытовой структурой завода и филиальной сетью.",
          "Развитие продаж в промышленном и строительном сегментах.",
          "Участие в открытии филиалов, совмещение коммерческого и маркетингового функционала."
        ])}
        ${execJob("08.1992 - 06.2000", "7 лет 10 мес.", "ОАО «Связьинформ» / Челябгорэлектросвязь", "Сфера телекоммуникаций", "Кабельщик", [
          "Техническое обслуживание и монтаж кабельных линий связи."
        ])}
      </section>

      <section class="resume-exec-cards resume-exec-projects">
        ${execCard("CRM и BI", "Бизнес-заказчик внедрения CRM-систем и дашбордов Power BI для регулярного контроля продаж.")}
        ${execCard("Масштабирование", "Участие в запуске и стандартизации филиальной сети компании в разных регионах РФ.")}
        ${execCard("Команды", "Построение управляемой структуры сбыта, наставничество и развитие руководителей филиалов.")}
      </section>

      <section class="resume-exec-section">
        <h2>Ключевые компетенции</h2>
        <div class="resume-exec-skill-grid">
          ${execSkillColumn("Управление", ["Продажи B2B", "Филиальная сеть", "Команды до 85 чел.", "Бюджеты и KPI", "Переговоры с ЛПР"])}
          ${execSkillColumn("Технологии", ["MS Dynamics CRM", "1C CRM / 1C", "amoCRM", "Power BI", "Excel, ЭДО"])}
          ${execSkillColumn("Отрасль", ["Металлоконструкции", "Металлопродукция", "Стройматериалы", "Дистрибуция", "Логистика"])}
        </div>
      </section>

      <section class="resume-exec-bottom">
        <div>
          <h2>Образование</h2>
          <p><strong>2006 | Высшее</strong><br>Южно-Уральский государственный университет, Челябинск<br><em>Экономика и управление на предприятии</em></p>
          <p><strong>1998 | Высшее</strong><br>Университет Российской академии образования, Москва<br><em>Юридический факультет</em></p>
        </div>
        <div>
          <h2>Дополнительно</h2>
          <ul>
            <li>Готовность к командировкам</li>
            <li>Водительские права категории B</li>
            <li>Русский - родной</li>
            <li>Рекомендации по запросу</li>
          </ul>
        </div>
      </section>
    </article>
  `;
}

function execCard(title, text) {
  return `
    <div class="resume-exec-card">
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}

function execJob(period, duration, company, industry, role, points) {
  return `
    <div class="resume-exec-job">
      <div class="resume-exec-job-head">
        <div><strong>${period}</strong><span>${duration}</span></div>
        <h3>${company}</h3>
      </div>
      <p><em>${industry}</em></p>
      <p class="resume-exec-role">${role}</p>
      <ul>
        ${points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </div>
  `;
}

function execSkillColumn(title, items) {
  return `
    <div class="resume-exec-skill-col">
      <h3>${title}</h3>
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
}

function wordJob(period, company, role, points) {
  return `
    <div class="resume-word-job">
      <div class="resume-word-job-head">
        <strong>${company}</strong>
        <span>${period}</span>
      </div>
      <p><em>${role}</em></p>
      <ul>
        ${points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </div>
  `;
}

function qwenSection(icon, title, content) {
  return `
    <section class="resume-qwen-section">
      <h2>${icon} ${title}</h2>
      ${content}
    </section>
  `;
}

function qwenJob(period, company, city, industry, role, points) {
  return `
    <div class="resume-qwen-job">
      <h3>${period}</h3>
      <p><strong>${company}</strong>, ${city}<br><em>${industry}</em></p>
      <p><strong>${role}</strong></p>
      <h4>🔹 Достижения:</h4>
      <ul>
        ${points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </div>
  `;
}

function profilePhoto(className) {
  return `
    <figure class="${className} resume-photo">
      <img src="https://img.hhcdn.ru/photo/826210724.png?t=1778740954&h=b5YHAC9IaLqr6De63w810Q" alt="Фото Рыкунова Андрея Николаевича" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
      <span>РА</span>
    </figure>
  `;
}

function downloadCurrentResumeAsWord() {
  const resume = document.querySelector(".resume-document, .resume-qwen, .resume-word, .resume-exec");
  if (!resume) {
    showToast("Откройте резюме для экспорта");
    return;
  }

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");

  const titleByView = {
    resume: "Рыкунов Андрей Николаевич - резюме",
    resumeAlt: "Рыкунов Андрей Николаевич - резюме 2",
    resumeWord: "Рыкунов Андрей Николаевич - резюме 3",
    resumeExecutive: "Рыкунов Андрей Николаевич - резюме 4 Executive Design",
  };
  const title = titleByView[state.view] || "Рыкунов Андрей Николаевич - резюме";

  const html = `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          body { background: #ffffff; margin: 0; padding: 0; }
          .sidebar, .topbar, .mobile-nav, .toolbar { display: none !important; }
          ${styles}
          .resume-document, .resume-qwen, .resume-word, .resume-exec {
            box-shadow: none !important;
            margin: 0 auto !important;
          }
        </style>
      </head>
      <body>${resume.outerHTML}</body>
    </html>
  `;

  const blob = new Blob(["\ufeff", html], {
    type: "application/msword;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${title}.doc`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Файл Word сформирован");
}

function profileView() {
  const p = state.profile;
  return `
    <div class="panel">
      <div class="panel-head">
        <div><h3>Карьерный профиль</h3><p>Эти данные задают стратегию поиска</p></div>
      </div>
      <div class="panel-body">
        <form class="form" data-form="profile">
          ${input("role", "Основная роль", p.role)}
          ${input("level", "Уровень", p.level)}
          ${select("format", "Формат", p.format, ["Удаленно", "Гибрид", "Офис", "Любой"])}
          ${input("location", "География", p.location)}
          ${input("minPay", "Минимальная компенсация", p.minPay)}
          ${input("targetPay", "Желаемая компенсация", p.targetPay)}
          ${textarea("strengths", "Сильные стороны", p.strengths)}
          ${textarea("limits", "Ограничения", p.limits)}
          ${textarea("links", "Ссылки и материалы", p.links)}
        </form>
      </div>
    </div>
  `;
}

function playbooksView() {
  return `
    <section class="grid two">
      <div class="panel playbook">
        <div class="panel-head">
          <div><h3>Цикл поиска</h3><p>Повторять каждый день</p></div>
        </div>
        <div class="panel-body steps">
          ${step("Найти 5-10 вакансий в панели вакансий или других источниках.")}
          ${step("Дать каждой вакансии вердикт: сильная, средняя или слабая.")}
          ${step("Для сильной вакансии выполнить decode и выписать требования.")}
          ${step("Адаптировать резюме и отправить качественный отклик.")}
          ${step("Обновить статус и следующий шаг в воронке.")}
        </div>
      </div>
      <div class="panel playbook">
        <div class="panel-head">
          <div><h3>Подготовка к интервью</h3><p>Использовать после ответа рекрутера</p></div>
        </div>
        <div class="panel-body steps">
          ${step("Добавить интервью в раздел “Интервью”.")}
          ${step("Подготовить prep по компании и роли.")}
          ${step("Выбрать 3-5 историй из storybank.")}
          ${step("Провести тренировку или пробное интервью перед раундом.")}
          ${step("После интервью сделать debrief и обновить итоги.")}
        </div>
      </div>
    </section>
    <section class="panel" style="margin-top:14px">
      <div class="panel-head">
        <div><h3>Команды коуча</h3><p>Используй в чате рядом с этим проектом</p></div>
      </div>
      <div class="panel-body">
        <div class="chips">
          ${["Старт", "Питч", "Истории", "Резюме", "Разбор вакансии", "Подготовка", "Вопросы", "Тренировка", "Пробное интервью", "Разбор раунда", "Фидбэк", "Прогресс", "Зарплата", "Переговоры"].map((x) => `<span class="chip">${x}</span>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function step(text) {
  return `<div class="step">${escapeHtml(text)}</div>`;
}

function input(name, label, value) {
  return `<label>${label}<input name="${name}" value="${escapeHtml(value)}"></label>`;
}

function textarea(name, label, value) {
  return `<label class="wide">${label}<textarea name="${name}">${escapeHtml(value)}</textarea></label>`;
}

function select(name, label, value, options) {
  return `<label>${label}<select name="${name}">${options.map((x) => `<option ${x === value ? "selected" : ""}>${x}</option>`).join("")}</select></label>`;
}

function renderModal() {
  const title = modal.type.includes("application") ? "Вакансия" : modal.type.includes("interview") ? "Интервью" : "Задача";
  return `
    <div class="modal-backdrop">
      <div class="modal">
        <div class="modal-head">
          <h3>${title}</h3>
          <button class="close" data-action="close-modal">×</button>
        </div>
        <div class="modal-body">
          ${modalForm()}
        </div>
      </div>
    </div>
  `;
}

function modalForm() {
  if (modal.type.includes("application")) return applicationForm(modal.item);
  if (modal.type.includes("interview")) return interviewForm(modal.item);
  return taskForm(modal.item);
}

function applicationForm(item) {
  return `
    <form class="form" data-form="application">
      ${input("date", "Дата", item.date || today())}
      ${input("company", "Компания", item.company || "")}
      ${input("role", "Роль", item.role || "")}
      ${select("fit", "Насколько подходит", item.fit || "Средний", ["Сильный", "Средний", "Слабый"])}
      ${select("status", "Статус", item.status || "Новая", ["Новая", "Разобрать", "Отклик отправлен", "Ждем ответ", "Интервью", "Оффер", "Отказ", "Пропустить"])}
      ${input("source", "Источник", item.source || "")}
      ${input("link", "Ссылка", item.link || "")}
      ${input("next", "Следующий шаг", item.next || "")}
      ${textarea("notes", "Заметки", item.notes || "")}
      <div class="wide toolbar">
        <button class="action" data-action="save-application" type="submit">Сохранить</button>
        ${item.id ? `<button class="danger" data-action="delete-application" type="button" data-id="${item.id}">Удалить</button>` : ""}
      </div>
    </form>
  `;
}

function interviewForm(item) {
  return `
    <form class="form" data-form="interview">
      ${input("date", "Дата", item.date || today())}
      ${input("company", "Компания", item.company || "")}
      ${input("role", "Роль", item.role || "")}
      ${input("round", "Раунд", item.round || "")}
      ${select("format", "Формат", item.format || "Поведенческое", ["Скрининг", "Поведенческое", "Техническое", "Системный дизайн", "Кейс", "Панель", "Финальное"])}
      ${select("status", "Статус", item.status || "Запланировано", ["Запланировано", "Готовлюсь", "Завершено", "Ждем ответ", "Отказ", "Оффер"])}
      ${input("outcome", "Итог", item.outcome || "")}
      ${textarea("notes", "Заметки", item.notes || "")}
      <div class="wide toolbar">
        <button class="action" data-action="save-interview" type="submit">Сохранить</button>
        ${item.id ? `<button class="danger" data-action="delete-interview" type="button" data-id="${item.id}">Удалить</button>` : ""}
      </div>
    </form>
  `;
}

function taskForm(item) {
  return `
    <form class="form" data-form="task">
      ${input("title", "Задача", item.title || "")}
      ${input("due", "Дата", item.due || today())}
      ${select("type", "Тип", item.type || "Вакансии", ["Стратегия", "Материалы", "Вакансии", "Интервью", "Нетворкинг"])}
      ${select("status", "Статус", item.status || "Нужно сделать", ["Нужно сделать", "На паузе", "Готово"])}
      <div class="wide toolbar">
        <button class="action" data-action="save-task" type="submit">Сохранить</button>
      </div>
    </form>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setState({ view: button.dataset.view }));
  });

  document.querySelector("[data-action='mobile-nav']")?.addEventListener("change", (event) => {
    setState({ view: event.target.value });
  });

  document.querySelector("[data-field='notes']")?.addEventListener("input", (event) => {
    state.notes = event.target.value;
    saveState();
  });

  document.querySelector("[data-action='save-profile']")?.addEventListener("click", () => {
    const form = document.querySelector("[data-form='profile']");
    if (!form) return;
    state.profile = Object.fromEntries(new FormData(form).entries());
    saveState();
    showToast("Профиль сохранен");
  });

  bindAction("new-application", () => openModal("new-application", {}));
  bindAction("new-interview", () => openModal("new-interview", {}));
  bindAction("new-task", () => openModal("new-task", {}));
  bindAction("close-modal", closeModal);
  bindAction("export", exportData);
  bindAction("import", importData);
  bindAction("open-jobops", () => window.open("http://localhost:3005", "_blank"));
  bindAction("print-resume", () => window.print());
  bindAction("download-word", downloadCurrentResumeAsWord);

  document.querySelectorAll("[data-action='edit-application']").forEach((button) => {
    button.addEventListener("click", () => {
      openModal("edit-application", state.applications.find((x) => x.id === button.dataset.id) || {});
    });
  });

  document.querySelectorAll("[data-action='edit-interview']").forEach((button) => {
    button.addEventListener("click", () => {
      openModal("edit-interview", state.interviews.find((x) => x.id === button.dataset.id) || {});
    });
  });

  document.querySelectorAll("[data-action='done-task']").forEach((button) => {
    button.addEventListener("click", () => {
      state.tasks = state.tasks.map((task) => task.id === button.dataset.id ? { ...task, status: "Готово" } : task);
      setState({ tasks: state.tasks });
      showToast("Задача закрыта");
    });
  });

  document.querySelector("[data-form='application']")?.addEventListener("submit", saveApplication);
  document.querySelector("[data-form='interview']")?.addEventListener("submit", saveInterview);
  document.querySelector("[data-form='task']")?.addEventListener("submit", saveTask);

  bindAction("delete-application", (event) => {
    state.applications = state.applications.filter((item) => item.id !== event.target.dataset.id);
    closeModal();
    setState({ applications: state.applications });
  });
  bindAction("delete-interview", (event) => {
    state.interviews = state.interviews.filter((item) => item.id !== event.target.dataset.id);
    closeModal();
    setState({ interviews: state.interviews });
  });
}

function bindAction(action, handler) {
  document.querySelectorAll(`[data-action='${action}']`).forEach((node) => {
    node.addEventListener("click", handler);
  });
}

function openModal(type, item) {
  modal = { type, item };
  render();
}

function closeModal() {
  modal = null;
  render();
}

function saveApplication(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const item = { ...modal.item, ...data, id: modal.item.id || id() };
  const exists = state.applications.some((x) => x.id === item.id);
  state.applications = exists
    ? state.applications.map((x) => x.id === item.id ? item : x)
    : [item, ...state.applications];
  closeModal();
  setState({ applications: state.applications, view: "applications" });
  showToast("Вакансия сохранена");
}

function saveInterview(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const item = { ...modal.item, ...data, id: modal.item.id || id() };
  const exists = state.interviews.some((x) => x.id === item.id);
  state.interviews = exists
    ? state.interviews.map((x) => x.id === item.id ? item : x)
    : [item, ...state.interviews];
  closeModal();
  setState({ interviews: state.interviews, view: "interviews" });
  showToast("Интервью сохранено");
}

function saveTask(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  state.tasks = [{ ...data, id: id() }, ...state.tasks];
  closeModal();
  setState({ tasks: state.tasks, view: "today" });
  showToast("Задача добавлена");
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `career-ops-${today()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const next = JSON.parse(await file.text());
      state = { ...initialState, ...next };
      saveState();
      render();
      showToast("Данные импортированы");
    } catch {
      showToast("Не удалось импортировать файл");
    }
  });
  input.click();
}

render();
