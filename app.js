const STORAGE_KEY = "hurma-marketplace-state-v1";
const memoryStorage = {};
const HURMA_AREAS = ["Все районы", "Marina", "Sheraton", "Mamsha", "Sahl Hasheesh", "El Gouna", "Dahar", "Эль-Ахья"];
const HURMA_SPORTS = ["Все виды спорта", "Футбол", "Йога", "Дайвинг", "Бег", "Падел"];
const HURMA_EVENT_CARDS = [
  {
    title: "Вечерняя прогулка по Marina Hurghada",
    date: "Сегодня, 19:30",
    area: "Marina",
    location: "Hurghada Marina",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Hurghada%20Marina",
    text: "Набережная, кафе, закат и мягкий маршрут для первого знакомства с городом.",
    request: false,
  },
  {
    title: "Снорклинг на островах",
    date: "Завтра, 09:00",
    area: "Marina",
    location: "New Marina Hurghada",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=New%20Marina%20Hurghada",
    text: "Морская программа на день: трансфер, лодка, остановки у рифов и отдых на пляже.",
    request: true,
  },
  {
    title: "Семейная афиша на выходные",
    date: "Суббота, 17:00",
    area: "Mamsha",
    location: "Hurghada Mamsha Promenade",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Hurghada%20Mamsha%20Promenade",
    text: "Подборка мест для детей и взрослых: шоу, прогулки, рестораны и спокойные локации.",
    request: false,
  },
  {
    title: "Утренняя йога у моря",
    date: "Пятница, 07:30",
    area: "Sahl Hasheesh",
    sport: "Йога",
    location: "Sahl Hasheesh Old Town",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sahl%20Hasheesh%20Old%20Town",
    text: "Легкая тренировка на рассвете, дыхание, растяжка и спокойный темп для любого уровня.",
    request: true,
  },
  {
    title: "Любительский футбол 5x5",
    date: "Среда, 20:00",
    area: "Dahar",
    sport: "Футбол",
    location: "Dahar Hurghada Sports Field",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Dahar%20Hurghada%20football%20field",
    text: "Сборная игра для взрослых. Можно прийти одному, команды формируются на месте.",
    request: true,
  },
  {
    title: "Пробное погружение с инструктором",
    date: "Воскресенье, 10:00",
    area: "Sheraton",
    sport: "Дайвинг",
    location: "Sheraton Road Hurghada Diving Center",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sheraton%20Road%20Hurghada%20diving%20center",
    text: "Знакомство с дайвингом: инструктаж, снаряжение и сопровождение инструктора.",
    request: true,
  },
];
const SERVICE_OPTIONS = ["Трансфер", "Клининг", "Афиша"];
const SERVICE_EVENT_CARDS = [
  {
    title: "Вечерняя прогулка по Marina Hurghada",
    date: "Сегодня, 19:30",
    text: "Набережная, кафе, закат и мягкий маршрут для первого знакомства с городом.",
  },
  {
    title: "Снорклинг на островах",
    date: "Завтра, 09:00",
    text: "Морская программа на день: трансфер, лодка, остановки у рифов и отдых на пляже.",
  },
  {
    title: "Семейная афиша на выходные",
    date: "Суббота, 17:00",
    text: "Подборка мест для детей и взрослых: шоу, прогулки, рестораны и спокойные локации.",
  },
];
const demoServiceExecutors = [
  {
    id: "exec-transfer-1",
    role: "executor",
    name: "Ахмед Салех",
    email: "transfer@hurma.local",
    password: "123456",
    city: "Хургада",
    category: "Трансфер",
    title: "Трансфер из аэропорта и поездки по городу",
    price: "от 12 $",
    experience: "7 лет",
    rating: 4.9,
    about: "Встречаю в аэропорту Хургады, помогаю с багажом, делаю поездки до отелей, Marina, Senzo Mall и Эль-Гуны.",
    skills: ["аэропорт", "минивэн", "русский язык"],
  },
  {
    id: "exec-transfer-2",
    role: "executor",
    name: "Мина Фарид",
    email: "driver@hurma.local",
    password: "123456",
    city: "Хургада",
    category: "Трансфер",
    title: "Персональный водитель для семьи",
    price: "от 18 $",
    experience: "5 лет",
    rating: 4.8,
    about: "Аккуратные поездки по Хургаде и окрестностям. Детское кресло по запросу, чистый автомобиль, связь в мессенджере.",
    skills: ["семьи", "детское кресло", "Эль-Гуна"],
  },
  {
    id: "exec-cleaning-1",
    role: "executor",
    name: "Нур Хасан",
    email: "clean@hurma.local",
    password: "123456",
    city: "Хургада",
    category: "Клининг",
    title: "Уборка квартир и апартаментов",
    price: "от 20 $",
    experience: "6 лет",
    rating: 4.95,
    about: "Делаю регулярную и разовую уборку апартаментов у моря, после арендаторов и перед заселением гостей.",
    skills: ["апартаменты", "после гостей", "окна"],
  },
  {
    id: "exec-cleaning-2",
    role: "executor",
    name: "Сара Махмуд",
    email: "sara.clean@hurma.local",
    password: "123456",
    city: "Хургада",
    category: "Клининг",
    title: "Клининг вилл и уборка после ремонта",
    price: "от 35 $",
    experience: "4 года",
    rating: 4.7,
    about: "Командная уборка больших помещений, вилл и коммерческих объектов. Привозим инвентарь и химию.",
    skills: ["виллы", "после ремонта", "команда"],
  },
];

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStorage[key] || null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStorage[key] = value;
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    delete memoryStorage[key];
  }
}

const seedState = {
  users: [
    {
      id: "exec-1",
      role: "executor",
      name: "Анна Белова",
      email: "anna@hurma.local",
      password: "123456",
      city: "Москва",
      category: "Ремонт",
      title: "Мастер по ремонту квартир",
      price: "от 2500 ₽",
      experience: "8 лет",
      rating: 4.9,
      about:
        "Беру косметический ремонт, плитку, покраску и мелкие задачи по дому. Помогаю с расчетом материалов и всегда показываю понятную смету.",
      skills: ["плитка", "покраска", "сантехника"],
    },
    {
      id: "exec-2",
      role: "executor",
      name: "Илья Савин",
      email: "ilya@hurma.local",
      password: "123456",
      city: "Санкт-Петербург",
      category: "IT",
      title: "Разработчик приложений и ботов",
      price: "от 4000 ₽",
      experience: "6 лет",
      rating: 4.8,
      about:
        "Делаю лендинги, личные кабинеты, интеграции с CRM и Telegram-ботов. Быстро собираю прототип и довожу до запуска.",
      skills: ["React", "боты", "CRM"],
    },
    {
      id: "exec-3",
      role: "executor",
      name: "Мария Круглова",
      email: "maria@hurma.local",
      password: "123456",
      city: "Казань",
      category: "Красота",
      title: "Визажист и стилист по волосам",
      price: "от 3200 ₽",
      experience: "5 лет",
      rating: 5,
      about:
        "Собираю на съемки, свадьбы и деловые мероприятия. Работаю с выездом, подбираю образ под свет, одежду и формат события.",
      skills: ["макияж", "укладки", "свадьбы"],
    },
    {
      id: "exec-4",
      role: "executor",
      name: "Тимур Ахметов",
      email: "timur@hurma.local",
      password: "123456",
      city: "Москва",
      category: "Обучение",
      title: "Репетитор по математике",
      price: "от 1800 ₽",
      experience: "10 лет",
      rating: 4.95,
      about:
        "Готовлю школьников к ОГЭ, ЕГЭ и олимпиадам. Даю понятную систему, домашние задания и регулярную обратную связь родителям.",
      skills: ["ЕГЭ", "ОГЭ", "алгебра"],
    },
    {
      id: "exec-5",
      role: "executor",
      name: "Олег Власов",
      email: "oleg@hurma.local",
      password: "123456",
      city: "Нижний Новгород",
      category: "Фото",
      title: "Фотограф для бизнеса и семей",
      price: "от 5500 ₽",
      experience: "7 лет",
      rating: 4.85,
      about:
        "Снимаю портреты, каталоги, мероприятия и семейные истории. Помогаю с референсами, локацией и отдаю готовые фото в срок.",
      skills: ["портрет", "предметка", "репортаж"],
    },
    {
      id: "exec-6",
      role: "executor",
      name: "Екатерина Орлова",
      email: "kate@hurma.local",
      password: "123456",
      city: "Екатеринбург",
      category: "Дом",
      title: "Клининг после ремонта",
      price: "от 3000 ₽",
      experience: "4 года",
      rating: 4.7,
      about:
        "Убираю квартиры, офисы и помещения после ремонта. Привожу оборудование, аккуратно работаю с поверхностями и сложными пятнами.",
      skills: ["окна", "после ремонта", "офисы"],
    },
  ],
  messages: [
    {
      id: "m-1",
      from: "exec-2",
      to: "client-demo",
      text: "Здравствуйте! Могу оценить задачу, если пришлете пару деталей.",
      createdAt: Date.now() - 1000 * 60 * 38,
    },
  ],
  sessionUserId: null,
};

let state = loadState();
state.sessionUserId = null;
let view = "services";
let authMode = "register";
let authRole = "client";
let selectedDialogUserId = null;
let filters = { q: "", category: "Трансфер", city: "Все" };

function loadState() {
  const saved = storageGet(STORAGE_KEY);
  if (!saved) {
    const withClient = {
      ...seedState,
      users: [
        ...seedState.users,
        {
          id: "client-demo",
          role: "client",
          name: "Демо клиент",
          email: "client@hurma.local",
          password: "123456",
          city: "Москва",
        },
      ],
    };
    ensureDemoData(withClient);
    storageSet(STORAGE_KEY, JSON.stringify(withClient));
    return withClient;
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.messages)) {
      throw new Error("Bad saved state");
    }
    ensureDemoData(parsed);
    storageSet(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    storageRemove(STORAGE_KEY);
    return loadState();
  }
}

function ensureDemoData(targetState) {
  targetState.messages = targetState.messages.filter((message) => {
    return message.text !== "Здравствуйте! Хочу обсудить задачу и условия.";
  });

  demoServiceExecutors.forEach((executor) => {
    const existing = targetState.users.find((user) => user.id === executor.id || user.email === executor.email);
    if (existing) {
      Object.assign(existing, executor);
      return;
    }
    targetState.users.push({ ...executor });
  });

  if (!targetState.users.some((user) => user.id === "guest-client")) {
    targetState.users.push({
      id: "guest-client",
      role: "client",
      name: "Гость ХурМа",
      email: "guest@hurma.local",
      password: "",
      city: "Хургада",
      isGuest: true,
    });
  }
}

function saveState() {
  storageSet(STORAGE_KEY, JSON.stringify(state));
}

function currentUser() {
  return state.users.find((user) => user.id === state.sessionUserId) || null;
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function makeId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function categories() {
  return SERVICE_OPTIONS;
}

function cities() {
  return ["Все", ...new Set(state.users.filter((u) => u.role === "executor").map((u) => u.city).filter(Boolean))];
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function app() {
  const root = document.querySelector("#app");
  const user = currentUser();
  root.innerHTML = `
    <div class="app-shell">
      ${renderTopbar(user)}
      <main class="main">${user ? renderWorkspace(user) : renderAuth()}</main>
    </div>
    <div id="toast"></div>
  `;
  bindEvents();
}

function renderTopbar(user) {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">Х</div>
        <div>
          <h1 class="brand-title">ХурМа</h1>
          <p class="brand-subtitle">исполнители и клиенты рядом</p>
        </div>
      </div>
      ${
        user
          ? `<div class="user-tools">
              <span class="role-pill">${user.role === "executor" ? "Исполнитель" : "Клиент"} · ${escapeHtml(user.name)}</span>
              <button class="secondary" data-action="logout">Выйти</button>
            </div>`
          : `<span class="role-pill">Демо: client@hurma.local / 123456</span>`
      }
    </header>
  `;
}

function renderAuth() {
  return `
    <section class="auth-layout">
      <div class="intro">
        <div>
          <h1>Найдите своего мастера или получите новые заказы</h1>
          <p>Прототип сервиса наподобие profi.ru: клиенты выбирают специалиста, исполнители оформляют профиль, а договоренности начинаются прямо в чате.</p>
        </div>
        <div class="intro-stats">
          <div class="stat"><strong>2 роли</strong><span>отдельный вход для клиентов и исполнителей</span></div>
          <div class="stat"><strong>6 сфер</strong><span>ремонт, IT, обучение, красота, фото и дом</span></div>
          <div class="stat"><strong>чат</strong><span>переписка хранится локально в браузере</span></div>
        </div>
      </div>
      <div class="panel auth-panel">
        <div class="tabs">
          <button class="tab ${authMode === "login" ? "active" : ""}" data-auth-mode="login">Вход</button>
          <button class="tab ${authMode === "register" ? "active" : ""}" data-auth-mode="register">Регистрация</button>
        </div>
        <h2 class="section-title">${authMode === "login" ? "Войти в ХурМа" : "Создать аккаунт"}</h2>
        <p class="section-note">${authMode === "login" ? "Выберите роль и войдите в свой кабинет." : "После регистрации откроется нужный кабинет."}</p>
        <form class="form" data-form="auth">
          <div class="role-toggle">
            <button type="button" class="toggle-option ${authRole === "client" ? "active" : ""}" data-auth-role="client">Клиент</button>
            <button type="button" class="toggle-option ${authRole === "executor" ? "active" : ""}" data-auth-role="executor">Исполнитель</button>
          </div>
          ${
            authMode === "register"
              ? `<label class="field"><span>Имя</span><input name="name" autocomplete="name" required placeholder="Например, Ольга Иванова"></label>
                 <label class="field"><span>Город</span><input name="city" required placeholder="Москва"></label>`
              : ""
          }
          <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label>
          <label class="field"><span>Пароль</span><input name="password" type="password" autocomplete="current-password" required placeholder="Минимум 6 символов"></label>
          <div class="error" data-error></div>
          <button class="primary" type="submit">${authMode === "login" ? "Войти" : "Зарегистрироваться"}</button>
        </form>
      </div>
    </section>
  `;
}

function renderWorkspace(user) {
  const nav = user.role === "executor"
    ? [
        ["profile", "Профиль"],
        ["messages", "Чаты"],
        ["catalog", "Каталог"],
      ]
    : [
        ["catalog", "Каталог"],
        ["messages", "Чаты"],
        ["profile", "Профиль"],
      ];

  return `
    <section class="workspace">
      <aside class="panel sidebar">
        <nav class="nav">
          ${nav.map(([id, label]) => `<button class="${view === id ? "active" : ""}" data-view="${id}">${label}</button>`).join("")}
        </nav>
      </aside>
      <section class="content">
        ${renderDashboard(user)}
        ${view === "catalog" ? renderCatalog(user) : ""}
        ${view === "profile" ? renderProfile(user) : ""}
        ${view === "messages" ? renderMessages(user) : ""}
      </section>
    </section>
  `;
}

function renderDashboard(user) {
  return `
    <div class="dashboard-band">
      <div class="panel hero-card">
        <h2>${user.role === "executor" ? "Ваш профиль видят клиенты" : "Выберите исполнителя под задачу"}</h2>
        <p>${user.role === "executor" ? "Заполните услуги, цену и опыт, чтобы клиенту было проще написать первым." : "Сравните специалистов по городу, сфере, опыту и начните диалог в один клик."}</p>
      </div>
      <div class="panel quick-card">
        <h2>${escapeHtml(user.name)}</h2>
        <p class="section-note">${user.role === "executor" ? "Кабинет исполнителя" : "Кабинет клиента"} · ${escapeHtml(user.city || "город не указан")}</p>
        <div class="quick-actions">
          <button class="primary" data-view="${user.role === "executor" ? "profile" : "catalog"}">${user.role === "executor" ? "Заполнить профиль" : "Найти специалиста"}</button>
          <button class="secondary" data-view="messages">Открыть чаты</button>
        </div>
      </div>
    </div>
  `;
}

function renderCatalog(user) {
  const items = state.users
    .filter((executor) => executor.role === "executor")
    .filter((executor) => {
      const haystack = `${executor.name} ${executor.title} ${executor.about} ${(executor.skills || []).join(" ")}`.toLowerCase();
      return (
        (!filters.q || haystack.includes(filters.q.toLowerCase())) &&
        (filters.category === "Все" || executor.category === filters.category) &&
        (filters.city === "Все" || executor.city === filters.city)
      );
    });

  return `
    <div class="panel searchbar">
      <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск: сервис, задача, исполнитель..." />
      <select data-filter="category">${categories().map((cat) => `<option ${filters.category === cat ? "selected" : ""}>${escapeHtml(cat)}</option>`).join("")}</select>
      <select data-filter="city">${cities().map((city) => `<option ${filters.city === city ? "selected" : ""}>${escapeHtml(city)}</option>`).join("")}</select>
    </div>
    ${
      items.length
        ? `<div class="cards-grid">${items.map((executor) => renderExecutorCard(executor, user)).join("")}</div>`
        : `<div class="panel empty-state"><div><strong>Ничего не найдено</strong><span>Попробуйте изменить город, сферу или запрос.</span></div></div>`
    }
  `;
}

function renderExecutorCard(executor, user) {
  return `
    <article class="executor-card">
      <div class="executor-top">
        <div class="avatar">${initials(executor.name)}</div>
        <div>
          <h3>${escapeHtml(executor.name)}</h3>
          <div class="meta">
            <span>${escapeHtml(executor.city || "Город не указан")}</span>
            <span>★ ${executor.rating || "новый"}</span>
          </div>
        </div>
      </div>
      <div>
        <span class="tag">${escapeHtml(executor.category || "Услуги")}</span>
      </div>
      <p><strong>${escapeHtml(executor.title || "Исполнитель")}</strong></p>
      <p>${escapeHtml(executor.about || "Описание пока не заполнено.")}</p>
      <div class="meta">${(executor.skills || []).map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
      <div class="executor-footer">
        <span class="price">${escapeHtml(executor.price || "Цена по договоренности")}</span>
        <button class="primary" data-chat-with="${executor.id}" ${user.id === executor.id ? "disabled" : ""}>Написать</button>
      </div>
    </article>
  `;
}

function renderProfile(user) {
  if (user.role === "client") {
    return `
      <div class="panel profile-panel">
        <h2 class="section-title">Профиль клиента</h2>
        <p class="section-note">Эти данные видит исполнитель в переписке.</p>
        <form class="form" data-form="client-profile">
          <div class="two-col">
            <label class="field"><span>Имя</span><input name="name" value="${escapeHtml(user.name)}" required></label>
            <label class="field"><span>Город</span><input name="city" value="${escapeHtml(user.city || "")}" required></label>
          </div>
          <button class="primary" type="submit">Сохранить</button>
        </form>
      </div>
    `;
  }

  return `
    <div class="profile-layout">
      <div class="panel profile-panel">
        <h2 class="section-title">Анкета исполнителя</h2>
        <p class="section-note">Заполните карточку так, чтобы клиент быстро понял специализацию, стоимость и опыт.</p>
        <form class="form" data-form="executor-profile">
          <div class="two-col">
            <label class="field"><span>Имя</span><input name="name" value="${escapeHtml(user.name)}" required></label>
            <label class="field"><span>Город</span><input name="city" value="${escapeHtml(user.city || "")}" required></label>
          </div>
          <div class="two-col">
            <label class="field"><span>Сфера</span><input name="category" value="${escapeHtml(user.category || "")}" placeholder="Ремонт, IT, Фото..." required></label>
            <label class="field"><span>Стоимость</span><input name="price" value="${escapeHtml(user.price || "")}" placeholder="от 3000 ₽"></label>
          </div>
          <div class="two-col">
            <label class="field"><span>Заголовок</span><input name="title" value="${escapeHtml(user.title || "")}" placeholder="Чем вы занимаетесь" required></label>
            <label class="field"><span>Опыт</span><input name="experience" value="${escapeHtml(user.experience || "")}" placeholder="5 лет"></label>
          </div>
          <label class="field"><span>Навыки через запятую</span><input name="skills" value="${escapeHtml((user.skills || []).join(", "))}" placeholder="дизайн, верстка, запуск"></label>
          <label class="field"><span>О себе</span><textarea name="about" required>${escapeHtml(user.about || "")}</textarea></label>
          <button class="primary" type="submit">Сохранить анкету</button>
        </form>
      </div>
      <aside class="panel profile-panel profile-preview">
        <div class="preview-photo"></div>
        ${renderExecutorCard(user, user)}
      </aside>
    </div>
  `;
}

function renderMessages(user) {
  const partnerIds = [...new Set(state.messages.flatMap((message) => {
    if (message.from === user.id) return [message.to];
    if (message.to === user.id) return [message.from];
    return [];
  }))];

  if (!selectedDialogUserId && partnerIds.length) {
    selectedDialogUserId = partnerIds[0];
  }

  const partner = state.users.find((item) => item.id === selectedDialogUserId);
  const dialogMessages = partner
    ? state.messages
        .filter((message) => [message.from, message.to].includes(user.id) && [message.from, message.to].includes(partner.id))
        .sort((a, b) => a.createdAt - b.createdAt)
    : [];

  return `
    <div class="chat-layout">
      <div class="panel chat-list">
        <h2 class="section-title">Чаты</h2>
        ${
          partnerIds.length
            ? partnerIds.map((id) => renderDialogButton(id)).join("")
            : `<div class="empty-state"><div><strong>Пока нет диалогов</strong><span>${user.role === "client" ? "Откройте каталог и напишите исполнителю." : "Когда клиент напишет, диалог появится здесь."}</span></div></div>`
        }
      </div>
      ${
        partner
          ? `<div class="panel chat-window">
              <button class="secondary chat-back" type="button" data-view="services">Назад к сервисам</button>
              <div class="chat-head">
                <div>
                  <h2 class="section-title">${escapeHtml(partner.name)}</h2>
                  <p class="section-note">${partner.role === "executor" ? escapeHtml(partner.title || "Исполнитель") : "Клиент"} · ${escapeHtml(partner.city || "город не указан")}</p>
                </div>
                ${partner.role === "executor" ? `<span class="status-pill">${escapeHtml(partner.price || "Цена по договоренности")}</span>` : ""}
              </div>
              <div class="messages">
                ${dialogMessages.map((message) => renderMessage(message, user)).join("")}
              </div>
              <form class="chat-input" data-form="message">
                <textarea name="text" placeholder="Напишите сообщение..." required></textarea>
                <button class="primary" type="submit">Отправить</button>
              </form>
            </div>`
          : `<div class="panel empty-state"><div><strong>Выберите диалог</strong><span>Или начните новый из каталога исполнителей.</span></div></div>`
      }
    </div>
  `;
}

function renderDialogButton(id) {
  const partner = state.users.find((user) => user.id === id);
  if (!partner) return "";
  const last = state.messages
    .filter((message) => [message.from, message.to].includes(id))
    .sort((a, b) => b.createdAt - a.createdAt)[0];
  return `
    <button class="dialog-button ${selectedDialogUserId === id ? "active" : ""}" data-dialog="${id}">
      <span class="mini-avatar">${initials(partner.name)}</span>
      <span class="dialog-main">
        <strong>${escapeHtml(partner.name)}</strong>
        <span>${escapeHtml(last?.text || "Новый диалог")}</span>
      </span>
    </button>
  `;
}

function renderMessage(message, user) {
  return `
    <div class="message ${message.from === user.id ? "mine" : ""}">
      ${escapeHtml(message.text)}
      <small>${formatTime(message.createdAt)}</small>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authMode;
      app();
    });
  });

  document.querySelectorAll("[data-auth-role]").forEach((button) => {
    button.addEventListener("click", () => {
      authRole = button.dataset.authRole;
      app();
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      app();
    });
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    state.sessionUserId = null;
    selectedDialogUserId = null;
    saveState();
    app();
  });

  document.querySelector("[data-form='auth']")?.addEventListener("submit", handleAuth);
  document.querySelector("[data-form='executor-profile']")?.addEventListener("submit", handleExecutorProfile);
  document.querySelector("[data-form='client-profile']")?.addEventListener("submit", handleClientProfile);
  document.querySelector("[data-form='message']")?.addEventListener("submit", handleMessage);

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      filters[field.dataset.filter] = field.value;
      app();
    });
  });

  document.querySelectorAll("[data-chat-with]").forEach((button) => {
    button.addEventListener("click", () => startChat(button.dataset.chatWith));
  });

  document.querySelectorAll("[data-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDialogUserId = button.dataset.dialog;
      app();
    });
  });
}

function handleAuth(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get("email")).trim().toLowerCase();
  const password = String(form.get("password")).trim();
  const error = document.querySelector("[data-error]");

  if (password.length < 6) {
    error.textContent = "Пароль должен быть не короче 6 символов.";
    return;
  }

  if (authMode === "login") {
    const user = state.users.find((item) => item.email === email && item.password === password && item.role === authRole);
    if (!user) {
      error.textContent = "Аккаунт с такой ролью, email и паролем не найден.";
      return;
    }
    state.sessionUserId = user.id;
    view = user.role === "executor" ? "profile" : "catalog";
    saveState();
    app();
    return;
  }

  if (state.users.some((item) => item.email === email)) {
    error.textContent = "Такой email уже зарегистрирован.";
    return;
  }

  const user = {
    id: makeId(authRole),
    role: authRole,
    name: String(form.get("name")).trim(),
    email,
    password,
    city: String(form.get("city")).trim(),
    rating: authRole === "executor" ? 5 : undefined,
    category: authRole === "executor" ? "Новая услуга" : undefined,
    title: authRole === "executor" ? "Новый исполнитель" : undefined,
    price: authRole === "executor" ? "по договоренности" : undefined,
    experience: authRole === "executor" ? "опыт не указан" : undefined,
    about: authRole === "executor" ? "Расскажите о себе, услугах и формате работы." : undefined,
    skills: authRole === "executor" ? ["новый профиль"] : undefined,
  };

  state.users.push(user);
  state.sessionUserId = user.id;
  view = user.role === "executor" ? "profile" : "catalog";
  saveState();
  app();
}

filters.city = "Хургада";

function cities() {
  return ["Хургада"];
}

function renderCatalog(user) {
  const selectedService = SERVICE_OPTIONS.includes(filters.category) ? filters.category : SERVICE_OPTIONS[0];
  filters.category = selectedService;

  if (selectedService === SERVICE_OPTIONS[2]) {
    filters.area = filters.area || "Все районы";
    filters.sport = filters.sport || "Все виды спорта";
    const events = HURMA_EVENT_CARDS.filter((event) => {
      const areaOk = filters.area === "Все районы" || event.area === filters.area;
      const sportOk = filters.sport === "Все виды спорта" || event.sport === filters.sport;
      const query = `${event.title} ${event.text} ${event.location} ${event.area} ${event.sport || ""}`.toLowerCase();
      const queryOk = !filters.q || query.includes(filters.q.toLowerCase());
      return areaOk && sportOk && queryOk;
    });

    return `
      ${renderServiceTabs(selectedService)}
      <div class="panel event-filters">
        <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск по афише..." />
        <select data-filter="area">${HURMA_AREAS.map((area) => `<option ${filters.area === area ? "selected" : ""}>${area}</option>`).join("")}</select>
        <select data-filter="sport">${HURMA_SPORTS.map((sport) => `<option ${filters.sport === sport ? "selected" : ""}>${sport}</option>`).join("")}</select>
      </div>
      ${
        events.length
          ? `<div class="event-grid">${events.map((event) => renderEventCard(event)).join("")}</div>`
          : `<div class="panel empty-state"><div><strong>Событий не найдено</strong><span>Попробуйте другой район, вид спорта или запрос.</span></div></div>`
      }
    `;
  }

  const items = state.users
    .filter((executor) => executor.role === "executor" && executor.category === selectedService)
    .filter((executor) => {
      const haystack = `${executor.name} ${executor.title} ${executor.about} ${(executor.skills || []).join(" ")}`.toLowerCase();
      return (
        (!filters.q || haystack.includes(filters.q.toLowerCase())) &&
        (filters.city === "Все" || executor.city === filters.city)
      );
    });

  return `
    ${renderServiceTabs(selectedService)}
    <div class="panel searchbar">
      <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск внутри сервиса..." />
      <select data-filter="city">${cities().map((city) => `<option ${filters.city === city ? "selected" : ""}>${escapeHtml(city)}</option>`).join("")}</select>
    </div>
    ${
      items.length
        ? `<div class="cards-grid">${items.map((executor) => renderExecutorCard(executor, user)).join("")}</div>`
        : `<div class="panel empty-state"><div><strong>Пока нет исполнителей</strong><span>Скоро добавим специалистов в этот сервис.</span></div></div>`
    }
  `;
}

function renderEventCard(event) {
  return `
    <article class="event-card">
      <div class="event-card-top">
        <span class="tag">${event.sport ? "Спорт" : "Афиша"}</span>
        ${event.sport ? `<span class="tag">${escapeHtml(event.sport)}</span>` : ""}
      </div>
      <h3>${escapeHtml(event.title)}</h3>
      <strong>${escapeHtml(event.date)}</strong>
      <p>${escapeHtml(event.text)}</p>
      <div class="event-meta">
        <span>${escapeHtml(event.area)}</span>
        <a class="map-link" href="${escapeHtml(event.mapUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.location)}</a>
      </div>
      ${
        event.request
          ? `<button class="primary" data-event-request="${escapeHtml(event.title)}">Оставить заявку</button>`
          : ""
      }
    </article>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authMode;
      app();
    });
  });

  document.querySelectorAll("[data-auth-role]").forEach((button) => {
    button.addEventListener("click", () => {
      authRole = button.dataset.authRole;
      app();
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      app();
    });
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      filters.category = button.dataset.service;
      filters.q = "";
      filters.area = "Все районы";
      filters.sport = "Все виды спорта";
      view = "services";
      app();
    });
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    state.sessionUserId = null;
    selectedDialogUserId = null;
    authMode = "register";
    saveState();
    app();
  });

  document.querySelector("[data-action='guest']")?.addEventListener("click", continueAsGuest);
  document.querySelector("[data-form='auth']")?.addEventListener("submit", handleAuth);
  document.querySelector("[data-form='executor-profile']")?.addEventListener("submit", handleExecutorProfile);
  document.querySelector("[data-form='client-profile']")?.addEventListener("submit", handleClientProfile);
  document.querySelector("[data-form='message']")?.addEventListener("submit", handleMessage);

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      filters[field.dataset.filter] = field.value;
      app();
    });
  });

  document.querySelectorAll("[data-chat-with]").forEach((button) => {
    button.addEventListener("click", () => startChat(button.dataset.chatWith));
  });

  document.querySelectorAll("[data-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDialogUserId = button.dataset.dialog;
      app();
    });
  });

  document.querySelectorAll("[data-event-request]").forEach((button) => {
    button.addEventListener("click", () => {
      toast(`Заявка на мероприятие «${button.dataset.eventRequest}» сохранена.`);
    });
  });
}

function handleExecutorProfile(event) {
  event.preventDefault();
  const user = currentUser();
  const form = new FormData(event.currentTarget);
  Object.assign(user, {
    name: String(form.get("name")).trim(),
    city: String(form.get("city")).trim(),
    category: String(form.get("category")).trim(),
    price: String(form.get("price")).trim(),
    title: String(form.get("title")).trim(),
    experience: String(form.get("experience")).trim(),
    about: String(form.get("about")).trim(),
    skills: String(form.get("skills"))
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
  });
  saveState();
  toast("Анкета сохранена.");
  app();
}

function handleClientProfile(event) {
  event.preventDefault();
  const user = currentUser();
  const form = new FormData(event.currentTarget);
  user.name = String(form.get("name")).trim();
  user.city = String(form.get("city")).trim();
  saveState();
  toast("Профиль сохранен.");
  app();
}

function startChat(partnerId) {
  const user = currentUser();
  if (!user) return;
  selectedDialogUserId = partnerId;

  const exists = state.messages.some((message) => {
    return [message.from, message.to].includes(user.id) && [message.from, message.to].includes(partnerId);
  });

  if (!exists) {
    state.messages.push({
      id: makeId("m"),
      from: user.id,
      to: partnerId,
      text: "Здравствуйте! Хочу обсудить задачу и условия.",
      createdAt: Date.now(),
    });
    saveState();
  }

  view = "messages";
  app();
}

function handleMessage(event) {
  event.preventDefault();
  const user = currentUser();
  const form = new FormData(event.currentTarget);
  const text = String(form.get("text")).trim();
  if (!text || !selectedDialogUserId) return;
  state.messages.push({
    id: makeId("m"),
    from: user.id,
    to: selectedDialogUserId,
    text,
    createdAt: Date.now(),
  });
  saveState();
  app();
}

function toast(message) {
  const holder = document.querySelector("#toast");
  if (!holder) return;
  holder.innerHTML = `<div class="toast">${escapeHtml(message)}</div>`;
  setTimeout(() => {
    holder.innerHTML = "";
  }, 2200);
}

function renderTopbar(user) {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">Х</div>
        <div>
          <h1 class="brand-title">ХурМа</h1>
          <p class="brand-subtitle">сервисы для жизни в Хургаде</p>
        </div>
      </div>
      ${
        user
          ? `<div class="user-tools">
              <span class="role-pill">${user.role === "executor" ? "Исполнитель" : user.isGuest ? "Гость" : "Клиент"} · ${escapeHtml(user.name)}</span>
              <button class="secondary" data-action="logout">Выйти</button>
            </div>`
          : `<span class="role-pill">Демо: client@hurma.local / 123456</span>`
      }
    </header>
  `;
}

function renderAuth() {
  return `
    <section class="auth-layout">
      <div class="intro">
        <div>
          <h1><span class="hero-brand-word">ХурМа</span> для солнечной Хургады</h1>
          <p>Найдите трансфер, клининг или события рядом. Клиенты выбирают сервис и пишут исполнителю, а исполнители регистрируются в своей категории.</p>
        </div>
        <div class="intro-stats">
          <div class="stat"><strong>3 сервиса</strong><span>трансфер, клининг и афиша для жителей и гостей</span></div>
          <div class="stat"><strong>2 роли</strong><span>клиент выбирает, исполнитель публикует анкету</span></div>
          <div class="stat"><strong>чат</strong><span>можно начать диалог даже в демо-режиме</span></div>
        </div>
      </div>
      <div class="panel auth-panel">
        <div class="tabs">
          <button class="tab ${authMode === "register" ? "active" : ""}" data-auth-mode="register">Регистрация</button>
          <button class="tab ${authMode === "login" ? "active" : ""}" data-auth-mode="login">Вход</button>
        </div>
        <h2 class="section-title">${authMode === "login" ? "Войти в ХурМа" : "Создать аккаунт"}</h2>
        <p class="section-note">${authMode === "login" ? "Выберите роль и войдите в свой кабинет." : "Зарегистрируйтесь или посмотрите сервисы без аккаунта."}</p>
        <form class="form" data-form="auth">
          <div class="role-toggle">
            <button type="button" class="toggle-option ${authRole === "client" ? "active" : ""}" data-auth-role="client">Клиент</button>
            <button type="button" class="toggle-option ${authRole === "executor" ? "active" : ""}" data-auth-role="executor">Исполнитель</button>
          </div>
          ${
            authMode === "register"
              ? `<label class="field"><span>Имя</span><input name="name" autocomplete="name" required placeholder="Например, Ольга Иванова"></label>
                 <label class="field"><span>Город</span><input name="city" required placeholder="Хургада"></label>
                 ${
                   authRole === "executor"
                     ? `<label class="field"><span>Сервис</span><select name="category" required>${SERVICE_OPTIONS.map((service) => `<option>${service}</option>`).join("")}</select></label>`
                     : ""
                 }`
              : ""
          }
          <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label>
          <label class="field"><span>Пароль</span><input name="password" type="password" autocomplete="current-password" required placeholder="Минимум 6 символов"></label>
          <div class="error" data-error></div>
          <button class="primary" type="submit">${authMode === "login" ? "Войти" : "Зарегистрироваться"}</button>
          <button class="secondary" type="button" data-action="guest">Продолжить без регистрации</button>
        </form>
      </div>
    </section>
  `;
}

function renderWorkspace(user) {
  const nav = user.role === "executor"
    ? [
        ["profile", "Профиль"],
        ["services", "Сервисы"],
        ["messages", "Чат"],
      ]
    : [
        ["services", "Сервисы"],
        ["messages", "Чат"],
        ...(user.isGuest ? [] : [["profile", "Профиль"]]),
      ];

  return `
    <section class="workspace">
      <aside class="panel sidebar">
        <nav class="nav">
          ${nav.map(([id, label]) => `<button class="${view === id ? "active" : ""}" data-view="${id}">${label}</button>`).join("")}
        </nav>
      </aside>
      <section class="content">
        ${renderDashboard(user)}
        ${view === "services" || view === "catalog" ? renderCatalog(user) : ""}
        ${view === "profile" ? renderProfile(user) : ""}
        ${view === "messages" ? renderMessages(user) : ""}
      </section>
    </section>
  `;
}

function renderDashboard(user) {
  return `
    <div class="dashboard-band">
      <div class="panel hero-card">
        <h2>${user.role === "executor" ? "Ваш сервис видят клиенты" : "Выберите сервис в Хургаде"}</h2>
        <p>${user.role === "executor" ? "Заполните анкету, цену и формат работы, чтобы клиенту было проще написать первым." : "Трансфер, клининг и афиша собраны в одном месте. Выберите раздел и начните диалог."}</p>
      </div>
      <div class="panel quick-card">
        <h2>${escapeHtml(user.name)}</h2>
        <p class="section-note">${user.role === "executor" ? `Исполнитель · ${escapeHtml(user.category || "сервис не выбран")}` : user.isGuest ? "Гостевой просмотр · Хургада" : "Кабинет клиента · Хургада"}</p>
        <div class="quick-actions">
          <button class="primary" data-view="services">Сервисы</button>
          <button class="secondary" data-view="messages">Чат</button>
        </div>
      </div>
    </div>
  `;
}

function renderCatalog(user) {
  const selectedService = SERVICE_OPTIONS.includes(filters.category) ? filters.category : "Трансфер";
  filters.category = selectedService;

  if (selectedService === "Афиша") {
    return `
      ${renderServiceTabs(selectedService)}
      <div class="event-grid">
        ${SERVICE_EVENT_CARDS.map((event) => `
          <article class="event-card">
            <span class="tag">Афиша</span>
            <h3>${escapeHtml(event.title)}</h3>
            <strong>${escapeHtml(event.date)}</strong>
            <p>${escapeHtml(event.text)}</p>
          </article>
        `).join("")}
      </div>
    `;
  }

  const items = state.users
    .filter((executor) => executor.role === "executor" && executor.category === selectedService)
    .filter((executor) => {
      const haystack = `${executor.name} ${executor.title} ${executor.about} ${(executor.skills || []).join(" ")}`.toLowerCase();
      return (
        (!filters.q || haystack.includes(filters.q.toLowerCase())) &&
        (filters.city === "Все" || executor.city === filters.city)
      );
    });

  return `
    ${renderServiceTabs(selectedService)}
    <div class="panel searchbar">
      <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск внутри сервиса..." />
      <select data-filter="city">${cities().map((city) => `<option ${filters.city === city ? "selected" : ""}>${escapeHtml(city)}</option>`).join("")}</select>
    </div>
    ${
      items.length
        ? `<div class="cards-grid">${items.map((executor) => renderExecutorCard(executor, user)).join("")}</div>`
        : `<div class="panel empty-state"><div><strong>Пока нет исполнителей</strong><span>Скоро добавим специалистов в этот сервис.</span></div></div>`
    }
  `;
}

function renderServiceTabs(selectedService) {
  if (selectedService) {
    return `
      <div class="service-tabs service-tabs-compact">
        <button class="active" data-service="${selectedService}">
          ${selectedService}
        </button>
        <button class="service-tabs-reset" type="button" data-action="show-all-services">
          Все сервисы
        </button>
      </div>
    `;
  }

  return `
    <div class="service-tabs">
      ${SERVICE_OPTIONS.map((service) => `
        <button class="${selectedService === service ? "active" : ""}" data-service="${service}">
          ${service}
        </button>
      `).join("")}
    </div>
  `;
}

function renderExecutorCard(executor, user) {
  return `
    <article class="executor-card">
      <div class="executor-top">
        <div class="avatar">${initials(executor.name)}</div>
        <div>
          <h3>${escapeHtml(executor.name)}</h3>
          <div class="meta">
            <span>${escapeHtml(executor.city || "Город не указан")}</span>
            <span>★ ${executor.rating || "новый"}</span>
          </div>
        </div>
      </div>
      <div><span class="tag">${escapeHtml(executor.category || "Услуги")}</span></div>
      <p><strong>${escapeHtml(executor.title || "Исполнитель")}</strong></p>
      <p>${escapeHtml(executor.about || "Описание пока не заполнено.")}</p>
      <div class="meta">${(executor.skills || []).map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
      <div class="executor-footer">
        <span class="price">${escapeHtml(executor.price || "Цена по договоренности")}</span>
        <button class="primary" data-chat-with="${executor.id}" ${user.id === executor.id ? "disabled" : ""}>Написать</button>
      </div>
    </article>
  `;
}

function renderProfile(user) {
  if (user.role === "client") {
    return `
      <div class="panel profile-panel">
        <h2 class="section-title">Профиль клиента</h2>
        <p class="section-note">Эти данные видит исполнитель в переписке.</p>
        <form class="form" data-form="client-profile">
          <div class="two-col">
            <label class="field"><span>Имя</span><input name="name" value="${escapeHtml(user.name)}" required></label>
            <label class="field"><span>Город</span><input name="city" value="${escapeHtml(user.city || "")}" required></label>
          </div>
          <button class="primary" type="submit">Сохранить</button>
        </form>
      </div>
    `;
  }

  return `
    <div class="profile-layout">
      <div class="panel profile-panel">
        <h2 class="section-title">Анкета исполнителя</h2>
        <p class="section-note">Выберите сервис, опишите формат работы и стоимость.</p>
        <form class="form" data-form="executor-profile">
          <div class="two-col">
            <label class="field"><span>Имя</span><input name="name" value="${escapeHtml(user.name)}" required></label>
            <label class="field"><span>Город</span><input name="city" value="${escapeHtml(user.city || "")}" required></label>
          </div>
          <div class="two-col">
            <label class="field"><span>Сервис</span><select name="category" required>${SERVICE_OPTIONS.map((service) => `<option ${user.category === service ? "selected" : ""}>${service}</option>`).join("")}</select></label>
            <label class="field"><span>Стоимость</span><input name="price" value="${escapeHtml(user.price || "")}" placeholder="от 20 $"></label>
          </div>
          <div class="two-col">
            <label class="field"><span>Заголовок</span><input name="title" value="${escapeHtml(user.title || "")}" placeholder="Чем вы занимаетесь" required></label>
            <label class="field"><span>Опыт</span><input name="experience" value="${escapeHtml(user.experience || "")}" placeholder="5 лет"></label>
          </div>
          <label class="field"><span>Навыки через запятую</span><input name="skills" value="${escapeHtml((user.skills || []).join(", "))}" placeholder="аэропорт, апартаменты, окна"></label>
          <label class="field"><span>О себе</span><textarea name="about" required>${escapeHtml(user.about || "")}</textarea></label>
          <button class="primary" type="submit">Сохранить анкету</button>
        </form>
      </div>
      <aside class="panel profile-panel profile-preview">
        <div class="preview-photo"></div>
        ${renderExecutorCard(user, user)}
      </aside>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authMode;
      app();
    });
  });

  document.querySelectorAll("[data-auth-role]").forEach((button) => {
    button.addEventListener("click", () => {
      authRole = button.dataset.authRole;
      app();
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      app();
    });
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      filters.category = button.dataset.service;
      filters.q = "";
      view = "services";
      app();
    });
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    state.sessionUserId = null;
    selectedDialogUserId = null;
    authMode = "register";
    saveState();
    app();
  });

  document.querySelector("[data-action='guest']")?.addEventListener("click", continueAsGuest);
  document.querySelector("[data-form='auth']")?.addEventListener("submit", handleAuth);
  document.querySelector("[data-form='executor-profile']")?.addEventListener("submit", handleExecutorProfile);
  document.querySelector("[data-form='client-profile']")?.addEventListener("submit", handleClientProfile);
  document.querySelector("[data-form='message']")?.addEventListener("submit", handleMessage);

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      filters[field.dataset.filter] = field.value;
      app();
    });
  });

  document.querySelectorAll("[data-chat-with]").forEach((button) => {
    button.addEventListener("click", () => startChat(button.dataset.chatWith));
  });

  document.querySelectorAll("[data-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDialogUserId = button.dataset.dialog;
      app();
    });
  });
}

function continueAsGuest() {
  ensureDemoData(state);
  state.sessionUserId = "guest-client";
  view = "services";
  filters.category = "Трансфер";
  saveState();
  app();
}

function handleAuth(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get("email")).trim().toLowerCase();
  const password = String(form.get("password")).trim();
  const error = document.querySelector("[data-error]");

  if (password.length < 6) {
    error.textContent = "Пароль должен быть не короче 6 символов.";
    return;
  }

  if (authMode === "login") {
    const user = state.users.find((item) => item.email === email && item.password === password && item.role === authRole);
    if (!user) {
      error.textContent = "Аккаунт с такой ролью, email и паролем не найден.";
      return;
    }
    state.sessionUserId = user.id;
    view = user.role === "executor" ? "profile" : "services";
    filters.category = user.role === "executor" && SERVICE_OPTIONS.includes(user.category) ? user.category : "Трансфер";
    saveState();
    app();
    return;
  }

  if (state.users.some((item) => item.email === email)) {
    error.textContent = "Такой email уже зарегистрирован.";
    return;
  }

  const selectedService = String(form.get("category") || "Трансфер").trim();
  const user = {
    id: makeId(authRole),
    role: authRole,
    name: String(form.get("name")).trim(),
    email,
    password,
    city: String(form.get("city")).trim(),
    rating: authRole === "executor" ? 5 : undefined,
    category: authRole === "executor" ? selectedService : undefined,
    title: authRole === "executor" ? `Исполнитель: ${selectedService}` : undefined,
    price: authRole === "executor" ? "по договоренности" : undefined,
    experience: authRole === "executor" ? "опыт не указан" : undefined,
    about: authRole === "executor" ? "Расскажите о себе, услугах и формате работы." : undefined,
    skills: authRole === "executor" ? [selectedService.toLowerCase()] : undefined,
  };

  state.users.push(user);
  state.sessionUserId = user.id;
  view = user.role === "executor" ? "profile" : "services";
  filters.category = user.role === "executor" ? user.category : "Трансфер";
  saveState();
  app();
}

const chatDrafts = {};

function startChat(partnerId) {
  const user = currentUser();
  if (!user) return;
  selectedDialogUserId = partnerId;
  if (!chatDrafts[partnerId]) {
    chatDrafts[partnerId] = "Здравствуйте! Хочу обсудить задачу и условия.";
  }
  view = "messages";
  app();
}

function renderMessages(user) {
  const partnerIds = [...new Set(state.messages.flatMap((message) => {
    if (message.from === user.id) return [message.to];
    if (message.to === user.id) return [message.from];
    return [];
  }))];

  if (selectedDialogUserId && !partnerIds.includes(selectedDialogUserId)) {
    partnerIds.unshift(selectedDialogUserId);
  }

  if (!selectedDialogUserId && partnerIds.length) {
    selectedDialogUserId = partnerIds[0];
  }

  const partner = state.users.find((item) => item.id === selectedDialogUserId);
  const dialogMessages = partner
    ? state.messages
        .filter((message) => [message.from, message.to].includes(user.id) && [message.from, message.to].includes(partner.id))
        .sort((a, b) => a.createdAt - b.createdAt)
    : [];
  const draft = partner ? chatDrafts[partner.id] || "" : "";

  return `
    <div class="chat-layout">
      <div class="panel chat-list">
        <h2 class="section-title">Чат</h2>
        ${
          partnerIds.length
            ? partnerIds.map((id) => renderDialogButton(id, user)).join("")
            : `<div class="empty-state"><div><strong>Пока нет диалогов</strong><span>${user.role === "client" ? "Откройте сервисы и выберите исполнителя." : "Когда клиент напишет, диалог появится здесь."}</span></div></div>`
        }
      </div>
      ${
        partner
          ? `<div class="panel chat-window">
              <button class="secondary chat-back" type="button" data-view="services">Назад к сервисам</button>
              <div class="chat-head">
                <div>
                  <h2 class="section-title">${escapeHtml(partner.name)}</h2>
                  <p class="section-note">${partner.role === "executor" ? escapeHtml(partner.title || "Исполнитель") : "Клиент"} · ${escapeHtml(partner.city || "город не указан")}</p>
                </div>
                ${partner.role === "executor" ? `<span class="status-pill">${escapeHtml(partner.price || "Цена по договоренности")}</span>` : ""}
              </div>
              <div class="messages">
                ${dialogMessages.length ? dialogMessages.map((message) => renderMessage(message, user)).join("") : `<div class="empty-state"><div><strong>Диалог еще не начат</strong><span>Сообщение подготовлено в поле ниже. Отправлять его или нет решаете вы.</span></div></div>`}
              </div>
              <form class="chat-input" data-form="message">
                <textarea name="text" placeholder="Напишите сообщение..." required>${escapeHtml(draft)}</textarea>
                <button class="primary" type="submit">Отправить</button>
              </form>
            </div>`
          : `<div class="panel empty-state"><div><strong>Выберите диалог</strong><span>Или начните новый из раздела сервисов.</span></div></div>`
      }
    </div>
  `;
}

function renderDialogButton(id, user = currentUser()) {
  const partner = state.users.find((item) => item.id === id);
  if (!partner) return "";
  const last = user
    ? state.messages
        .filter((message) => [message.from, message.to].includes(user.id) && [message.from, message.to].includes(id))
        .sort((a, b) => b.createdAt - a.createdAt)[0]
    : null;
  return `
    <button class="dialog-button ${selectedDialogUserId === id ? "active" : ""}" data-dialog="${id}">
      <span class="mini-avatar">${initials(partner.name)}</span>
      <span class="dialog-main">
        <strong>${escapeHtml(partner.name)}</strong>
        <span>${escapeHtml(last?.text || "Новый диалог")}</span>
      </span>
    </button>
  `;
}

function handleMessage(event) {
  event.preventDefault();
  const user = currentUser();
  const form = new FormData(event.currentTarget);
  const text = String(form.get("text")).trim();
  if (!text || !selectedDialogUserId) return;
  state.messages.push({
    id: makeId("m"),
    from: user.id,
    to: selectedDialogUserId,
    text,
    createdAt: Date.now(),
  });
  chatDrafts[selectedDialogUserId] = "";
  saveState();
  app();
}

function renderCatalog(user) {
  const selectedService = SERVICE_OPTIONS.includes(filters.category) ? filters.category : SERVICE_OPTIONS[0];
  filters.category = selectedService;

  if (selectedService === SERVICE_OPTIONS[2]) {
    filters.area = filters.area || "Все районы";
    filters.sport = filters.sport || "Все виды спорта";
    const events = HURMA_EVENT_CARDS.filter((event) => {
      const areaOk = filters.area === "Все районы" || event.area === filters.area;
      const sportOk = filters.sport === "Все виды спорта" || event.sport === filters.sport;
      const query = `${event.title} ${event.text} ${event.location} ${event.area} ${event.sport || ""}`.toLowerCase();
      return areaOk && sportOk && (!filters.q || query.includes(filters.q.toLowerCase()));
    });

    return `
      ${renderServiceTabs(selectedService)}
      <div class="panel event-filters">
        <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск по афише..." />
        <select data-filter="area">${HURMA_AREAS.map((area) => `<option ${filters.area === area ? "selected" : ""}>${area}</option>`).join("")}</select>
        <select data-filter="sport">${HURMA_SPORTS.map((sport) => `<option ${filters.sport === sport ? "selected" : ""}>${sport}</option>`).join("")}</select>
      </div>
      ${
        events.length
          ? `<div class="event-grid">${events.map((event) => renderEventCard(event)).join("")}</div>`
          : `<div class="panel empty-state"><div><strong>Событий не найдено</strong><span>Попробуйте другой район, вид спорта или запрос.</span></div></div>`
      }
    `;
  }

  const items = state.users
    .filter((executor) => executor.role === "executor" && executor.category === selectedService)
    .filter((executor) => {
      const haystack = `${executor.name} ${executor.title} ${executor.about} ${(executor.skills || []).join(" ")}`.toLowerCase();
      return (
        (!filters.q || haystack.includes(filters.q.toLowerCase())) &&
        executor.city === "Хургада"
      );
    });

  return `
    ${renderServiceTabs(selectedService)}
    <div class="panel searchbar">
      <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск внутри сервиса..." />
      <select data-filter="city"><option selected>Хургада</option></select>
    </div>
    ${
      items.length
        ? `<div class="cards-grid">${items.map((executor) => renderExecutorCard(executor, user)).join("")}</div>`
        : `<div class="panel empty-state"><div><strong>Пока нет исполнителей</strong><span>Скоро добавим специалистов в этот сервис.</span></div></div>`
    }
  `;
}

function renderEventCard(event) {
  return `
    <article class="event-card">
      <div class="event-card-top">
        <span class="tag">${event.sport ? "Спорт" : "Афиша"}</span>
        ${event.sport ? `<span class="tag">${escapeHtml(event.sport)}</span>` : ""}
      </div>
      <h3>${escapeHtml(event.title)}</h3>
      <strong>${escapeHtml(event.date)}</strong>
      <p>${escapeHtml(event.text)}</p>
      <div class="event-meta">
        <span>${escapeHtml(event.area)}</span>
        <a class="map-link" href="${escapeHtml(event.mapUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.location)}</a>
      </div>
      ${
        event.request
          ? `<button class="primary" data-event-request="${escapeHtml(event.title)}">Оставить заявку</button>`
          : ""
      }
    </article>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authMode;
      app();
    });
  });

  document.querySelectorAll("[data-auth-role]").forEach((button) => {
    button.addEventListener("click", () => {
      authRole = button.dataset.authRole;
      app();
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      app();
    });
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      filters.category = button.dataset.service;
      filters.q = "";
      filters.area = "Все районы";
      filters.sport = "Все виды спорта";
      filters.city = "Хургада";
      view = "services";
      app();
    });
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    state.sessionUserId = null;
    selectedDialogUserId = null;
    authMode = "register";
    saveState();
    app();
  });

  document.querySelector("[data-action='guest']")?.addEventListener("click", continueAsGuest);
  document.querySelector("[data-form='auth']")?.addEventListener("submit", handleAuth);
  document.querySelector("[data-form='executor-profile']")?.addEventListener("submit", handleExecutorProfile);
  document.querySelector("[data-form='client-profile']")?.addEventListener("submit", handleClientProfile);
  document.querySelector("[data-form='message']")?.addEventListener("submit", handleMessage);

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      filters[field.dataset.filter] = field.value;
      app();
    });
  });

  document.querySelectorAll("[data-chat-with]").forEach((button) => {
    button.addEventListener("click", () => startChat(button.dataset.chatWith));
  });

  document.querySelectorAll("[data-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDialogUserId = button.dataset.dialog;
      app();
    });
  });

  document.querySelectorAll("[data-event-request]").forEach((button) => {
    button.addEventListener("click", () => {
      toast(`Заявка на мероприятие «${button.dataset.eventRequest}» сохранена.`);
    });
  });
}

function renderDashboard() {
  return "";
}

const HURMA_EVENT_TYPES = ["Все мероприятия", "Спорт", "Для детей", "Экскурсии", "Отдых"];
const HURMA_AGES = ["Любой возраст", "0+", "3+", "6+", "12+", "16+"];
const HURMA_FINAL_EVENTS = [
  {
    title: "Вечерняя прогулка по Marina Hurghada",
    date: "Сегодня, 19:30",
    type: "Отдых",
    area: "Marina",
    age: "12+",
    location: "Hurghada Marina",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Hurghada%20Marina",
    text: "Набережная, кафе, закат и мягкий маршрут для первого знакомства с городом.",
    request: false,
  },
  {
    title: "Снорклинг на островах",
    date: "Завтра, 09:00",
    type: "Экскурсии",
    area: "Marina",
    age: "6+",
    location: "New Marina Hurghada",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=New%20Marina%20Hurghada",
    text: "Морская программа на день: трансфер, лодка, остановки у рифов и отдых на пляже.",
    request: true,
  },
  {
    title: "Семейная афиша на выходные",
    date: "Суббота, 17:00",
    type: "Для детей",
    area: "Mamsha",
    age: "3+",
    location: "Hurghada Mamsha Promenade",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Hurghada%20Mamsha%20Promenade",
    text: "Подборка мест для детей и взрослых: шоу, прогулки, рестораны и спокойные локации.",
    request: false,
  },
  {
    title: "Детский мастер-класс у моря",
    date: "Воскресенье, 11:00",
    type: "Для детей",
    area: "El Gouna",
    age: "6+",
    location: "El Gouna Downtown",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=El%20Gouna%20Downtown",
    text: "Творческий час для детей: рисование, игры и мини-прогулка для родителей рядом.",
    request: true,
  },
  {
    title: "Утренняя йога у моря",
    date: "Пятница, 07:30",
    type: "Спорт",
    sport: "Йога",
    area: "Sahl Hasheesh",
    age: "12+",
    location: "Sahl Hasheesh Old Town",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sahl%20Hasheesh%20Old%20Town",
    text: "Легкая тренировка на рассвете, дыхание, растяжка и спокойный темп для любого уровня.",
    request: true,
  },
  {
    title: "Любительский футбол 5x5",
    date: "Среда, 20:00",
    type: "Спорт",
    sport: "Футбол",
    area: "Dahar",
    age: "16+",
    location: "Dahar Hurghada Sports Field",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Dahar%20Hurghada%20football%20field",
    text: "Сборная игра для взрослых. Можно прийти одному, команды формируются на месте.",
    request: true,
  },
  {
    title: "Пробное погружение с инструктором",
    date: "Воскресенье, 10:00",
    type: "Спорт",
    sport: "Дайвинг",
    area: "Sheraton",
    age: "12+",
    location: "Sheraton Road Hurghada Diving Center",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sheraton%20Road%20Hurghada%20diving%20center",
    text: "Знакомство с дайвингом: инструктаж, снаряжение и сопровождение инструктора.",
    request: true,
  },
];

["Волейбол", "Баскетбол"].forEach((sport) => {
  if (!HURMA_SPORTS.includes(sport)) {
    HURMA_SPORTS.push(sport);
  }
});

HURMA_FINAL_EVENTS.push(
  {
    title: "Пляжный волейбол у моря",
    date: "Четверг, 18:00",
    type: "Спорт",
    sport: "Волейбол",
    area: "Mamsha",
    age: "12+",
    location: "Mamsha Beach Volleyball Court",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Mamsha%20Hurghada%20beach%20volleyball",
    text: "Открытая игра на песке для любителей. Можно прийти одному, команды собираются на месте.",
    request: true,
  },
  {
    title: "Баскетбол 3x3 вечером",
    date: "Понедельник, 19:00",
    type: "Спорт",
    sport: "Баскетбол",
    area: "Dahar",
    age: "16+",
    location: "Dahar Hurghada Basketball Court",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Dahar%20Hurghada%20basketball%20court",
    text: "Вечерняя игра 3x3 для взрослых и подростков. Формат быстрый, дружеский, без обязательной команды.",
    request: true,
  }
);

function renderCatalog(user) {
  const selectedService = SERVICE_OPTIONS.includes(filters.category) ? filters.category : SERVICE_OPTIONS[0];
  filters.category = selectedService;

  if (selectedService === SERVICE_OPTIONS[2]) {
    filters.area = filters.area || "Все районы";
    filters.eventType = filters.eventType || "Все мероприятия";
    filters.sport = filters.sport || "Все виды спорта";
    filters.age = filters.age || "Любой возраст";

    const events = HURMA_FINAL_EVENTS.filter((event) => {
      const areaOk = filters.area === "Все районы" || event.area === filters.area;
      const typeOk = filters.eventType === "Все мероприятия" || event.type === filters.eventType;
      const sportOk = filters.eventType !== "Спорт" || filters.sport === "Все виды спорта" || event.sport === filters.sport;
      const ageOk = filters.eventType !== "Для детей" || filters.age === "Любой возраст" || event.age === filters.age;
      const query = `${event.title} ${event.text} ${event.location} ${event.area} ${event.type} ${event.sport || ""} ${event.age || ""}`.toLowerCase();
      return areaOk && typeOk && sportOk && ageOk && (!filters.q || query.includes(filters.q.toLowerCase()));
    });

    return `
      ${renderServiceTabs(selectedService)}
      <div class="panel event-filters event-filters-dynamic">
        <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск по афише..." />
        <select data-filter="area">${HURMA_AREAS.map((area) => `<option ${filters.area === area ? "selected" : ""}>${area}</option>`).join("")}</select>
        <select data-filter="eventType">${HURMA_EVENT_TYPES.map((type) => `<option ${filters.eventType === type ? "selected" : ""}>${type}</option>`).join("")}</select>
        ${
          filters.eventType === "Спорт"
            ? `<select data-filter="sport">${HURMA_SPORTS.map((sport) => `<option ${filters.sport === sport ? "selected" : ""}>${sport}</option>`).join("")}</select>`
            : ""
        }
        ${
          filters.eventType === "Для детей"
            ? `<select data-filter="age">${HURMA_AGES.map((age) => `<option ${filters.age === age ? "selected" : ""}>${age}</option>`).join("")}</select>`
            : ""
        }
      </div>
      ${
        events.length
          ? `<div class="event-grid">${events.map((event) => renderEventCard(event)).join("")}</div>`
          : `<div class="panel empty-state"><div><strong>Событий не найдено</strong><span>Попробуйте другой район, тип мероприятия или фильтр.</span></div></div>`
      }
    `;
  }

  const items = state.users
    .filter((executor) => executor.role === "executor" && executor.category === selectedService)
    .filter((executor) => {
      const haystack = `${executor.name} ${executor.title} ${executor.about} ${(executor.skills || []).join(" ")}`.toLowerCase();
      return (!filters.q || haystack.includes(filters.q.toLowerCase())) && executor.city === "Хургада";
    });

  return `
    ${renderServiceTabs(selectedService)}
    <div class="panel searchbar">
      <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск внутри сервиса..." />
      <select data-filter="city"><option selected>Хургада</option></select>
    </div>
    ${
      items.length
        ? `<div class="cards-grid">${items.map((executor) => renderExecutorCard(executor, user)).join("")}</div>`
        : `<div class="panel empty-state"><div><strong>Пока нет исполнителей</strong><span>Скоро добавим специалистов в этот сервис.</span></div></div>`
    }
  `;
}

function renderEventCard(event) {
  return `
    <article class="event-card">
      <div class="event-card-top">
        <span class="tag">${escapeHtml(event.type)}</span>
        ${event.sport ? `<span class="tag">${escapeHtml(event.sport)}</span>` : ""}
        ${event.type === "Для детей" ? `<span class="tag">${escapeHtml(event.age)}</span>` : ""}
      </div>
      <h3>${escapeHtml(event.title)}</h3>
      <strong>${escapeHtml(event.date)}</strong>
      <p>${escapeHtml(event.text)}</p>
      <div class="event-meta">
        <span>${escapeHtml(event.area)}</span>
        <a class="map-link" href="${escapeHtml(event.mapUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.location)}</a>
      </div>
      ${event.request ? `<button class="primary" data-event-request="${escapeHtml(event.title)}">Оставить заявку</button>` : ""}
    </article>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authMode;
      app();
    });
  });

  document.querySelectorAll("[data-auth-role]").forEach((button) => {
    button.addEventListener("click", () => {
      authRole = button.dataset.authRole;
      app();
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      app();
    });
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      filters.category = button.dataset.service;
      filters.q = "";
      filters.area = "Все районы";
      filters.eventType = "Все мероприятия";
      filters.sport = "Все виды спорта";
      filters.age = "Любой возраст";
      filters.city = "Хургада";
      view = "services";
      app();
    });
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    state.sessionUserId = null;
    selectedDialogUserId = null;
    authMode = "register";
    saveState();
    app();
  });

  document.querySelector("[data-action='guest']")?.addEventListener("click", continueAsGuest);
  document.querySelector("[data-form='auth']")?.addEventListener("submit", handleAuth);
  document.querySelector("[data-form='executor-profile']")?.addEventListener("submit", handleExecutorProfile);
  document.querySelector("[data-form='client-profile']")?.addEventListener("submit", handleClientProfile);
  document.querySelector("[data-form='message']")?.addEventListener("submit", handleMessage);

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      filters[field.dataset.filter] = field.value;
      if (field.dataset.filter === "eventType") {
        filters.sport = "Все виды спорта";
        filters.age = "Любой возраст";
      }
      app();
    });
  });

  document.querySelectorAll("[data-chat-with]").forEach((button) => {
    button.addEventListener("click", () => startChat(button.dataset.chatWith));
  });

  document.querySelectorAll("[data-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDialogUserId = button.dataset.dialog;
      app();
    });
  });

  document.querySelectorAll("[data-event-request]").forEach((button) => {
    button.addEventListener("click", () => {
      toast(`Заявка на мероприятие «${button.dataset.eventRequest}» сохранена.`);
    });
  });
}

let activeMapEventTitle = null;
let serviceChoiceMade = false;

function renderCatalog(user) {
  const selectedService = SERVICE_OPTIONS.includes(filters.category) ? filters.category : SERVICE_OPTIONS[0];

  if (!serviceChoiceMade && !activeMapEventTitle) {
    return renderServiceTabs(null);
  }

  filters.category = selectedService;

  if (selectedService === SERVICE_OPTIONS[2]) {
    if (activeMapEventTitle) {
      const event = HURMA_FINAL_EVENTS.find((item) => item.title === activeMapEventTitle);
      if (event) {
        return `
          ${renderServiceTabs(selectedService)}
          <section class="panel map-panel">
            <button class="secondary chat-back" type="button" data-action="back-afisha">Назад к афише</button>
            <div>
              <span class="tag">Место проведения</span>
              <h2 class="section-title">${escapeHtml(event.location)}</h2>
              <p class="section-note">${escapeHtml(event.title)} · ${escapeHtml(event.area)}</p>
            </div>
            <div class="map-preview">
              <div>
                <strong>${escapeHtml(event.location)}</strong>
                <span>${escapeHtml(event.date)}</span>
              </div>
            </div>
            <div class="quick-actions">
              <a class="primary" href="${escapeHtml(event.mapUrl)}" target="_blank" rel="noopener noreferrer">Открыть в Google Maps</a>
              <button class="secondary" type="button" data-action="back-afisha">Вернуться</button>
            </div>
          </section>
        `;
      }
      activeMapEventTitle = null;
    }

    filters.area = filters.area || "Все районы";
    filters.eventType = filters.eventType || "Все мероприятия";
    filters.sport = filters.sport || "Все виды спорта";
    filters.age = filters.age || "Любой возраст";

    const events = HURMA_FINAL_EVENTS.filter((event) => {
      const areaOk = filters.area === "Все районы" || event.area === filters.area;
      const typeOk = filters.eventType === "Все мероприятия" || event.type === filters.eventType;
      const sportOk = filters.eventType !== "Спорт" || filters.sport === "Все виды спорта" || event.sport === filters.sport;
      const ageOk = filters.eventType !== "Для детей" || filters.age === "Любой возраст" || event.age === filters.age;
      const query = `${event.title} ${event.text} ${event.location} ${event.area} ${event.type} ${event.sport || ""} ${event.age || ""}`.toLowerCase();
      return areaOk && typeOk && sportOk && ageOk && (!filters.q || query.includes(filters.q.toLowerCase()));
    });

    return `
      ${renderServiceTabs(selectedService)}
      <div class="panel event-filters event-filters-dynamic">
        <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск по афише..." />
        <select data-filter="area">${HURMA_AREAS.map((area) => `<option ${filters.area === area ? "selected" : ""}>${area}</option>`).join("")}</select>
        <select data-filter="eventType">${HURMA_EVENT_TYPES.map((type) => `<option ${filters.eventType === type ? "selected" : ""}>${type}</option>`).join("")}</select>
        ${
          filters.eventType === "Спорт"
            ? `<select data-filter="sport">${HURMA_SPORTS.map((sport) => `<option ${filters.sport === sport ? "selected" : ""}>${sport}</option>`).join("")}</select>`
            : ""
        }
        ${
          filters.eventType === "Для детей"
            ? `<select data-filter="age">${HURMA_AGES.map((age) => `<option ${filters.age === age ? "selected" : ""}>${age}</option>`).join("")}</select>`
            : ""
        }
      </div>
      ${
        events.length
          ? `<div class="event-grid">${events.map((event) => renderEventCard(event)).join("")}</div>`
          : `<div class="panel empty-state"><div><strong>Событий не найдено</strong><span>Попробуйте другой район, тип мероприятия или фильтр.</span></div></div>`
      }
    `;
  }

  const items = state.users
    .filter((executor) => executor.role === "executor" && executor.category === selectedService)
    .filter((executor) => {
      const haystack = `${executor.name} ${executor.title} ${executor.about} ${(executor.skills || []).join(" ")}`.toLowerCase();
      return (!filters.q || haystack.includes(filters.q.toLowerCase())) && executor.city === "Хургада";
    });

  return `
    ${renderServiceTabs(selectedService)}
    <div class="panel searchbar">
      <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск внутри сервиса..." />
      <select data-filter="city"><option selected>Хургада</option></select>
    </div>
    ${
      items.length
        ? `<div class="cards-grid">${items.map((executor) => renderExecutorCard(executor, user)).join("")}</div>`
        : `<div class="panel empty-state"><div><strong>Пока нет исполнителей</strong><span>Скоро добавим специалистов в этот сервис.</span></div></div>`
    }
  `;
}

function renderEventCard(event) {
  return `
    <article class="event-card">
      <div class="event-card-top">
        <span class="tag">${escapeHtml(event.type)}</span>
        ${event.sport ? `<span class="tag">${escapeHtml(event.sport)}</span>` : ""}
        ${event.type === "Для детей" ? `<span class="tag">${escapeHtml(event.age)}</span>` : ""}
      </div>
      <h3>${escapeHtml(event.title)}</h3>
      <strong>${escapeHtml(event.date)}</strong>
      <p>${escapeHtml(event.text)}</p>
      <div class="event-meta">
        <span>${escapeHtml(event.area)}</span>
        <button class="map-link" type="button" data-map-event="${escapeHtml(event.title)}">${escapeHtml(event.location)}</button>
      </div>
      ${event.request ? `<button class="primary" data-event-request="${escapeHtml(event.title)}">Оставить заявку</button>` : ""}
    </article>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authMode;
      app();
    });
  });

  document.querySelectorAll("[data-auth-role]").forEach((button) => {
    button.addEventListener("click", () => {
      authRole = button.dataset.authRole;
      app();
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      app();
    });
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      filters.category = button.dataset.service;
      filters.q = "";
      filters.area = "Все районы";
      filters.eventType = "Все мероприятия";
      filters.sport = "Все виды спорта";
      filters.age = "Любой возраст";
      filters.city = "Хургада";
      activeMapEventTitle = null;
      view = "services";
      app();
    });
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    state.sessionUserId = null;
    selectedDialogUserId = null;
    activeMapEventTitle = null;
    authMode = "register";
    saveState();
    app();
  });

  document.querySelector("[data-action='guest']")?.addEventListener("click", continueAsGuest);
  document.querySelector("[data-action='back-afisha']")?.addEventListener("click", () => {
    activeMapEventTitle = null;
    view = "services";
    filters.category = SERVICE_OPTIONS[2];
    app();
  });
  document.querySelector("[data-form='auth']")?.addEventListener("submit", handleAuth);
  document.querySelector("[data-form='executor-profile']")?.addEventListener("submit", handleExecutorProfile);
  document.querySelector("[data-form='client-profile']")?.addEventListener("submit", handleClientProfile);
  document.querySelector("[data-form='message']")?.addEventListener("submit", handleMessage);

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      filters[field.dataset.filter] = field.value;
      if (field.dataset.filter === "eventType") {
        filters.sport = "Все виды спорта";
        filters.age = "Любой возраст";
      }
      activeMapEventTitle = null;
      app();
    });
  });

  document.querySelectorAll("[data-map-event]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMapEventTitle = button.dataset.mapEvent;
      view = "services";
      filters.category = SERVICE_OPTIONS[2];
      app();
    });
  });

  document.querySelectorAll("[data-chat-with]").forEach((button) => {
    button.addEventListener("click", () => startChat(button.dataset.chatWith));
  });

  document.querySelectorAll("[data-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDialogUserId = button.dataset.dialog;
      app();
    });
  });

  document.querySelectorAll("[data-event-request]").forEach((button) => {
    button.addEventListener("click", () => {
      toast(`Заявка на мероприятие «${button.dataset.eventRequest}» сохранена.`);
    });
  });
}

const COMMUNITY_CHATS = [
  {
    id: "community-tiba-royal-paradise",
    title: "Чат дома Tiba Royal / Paradise",
    subtitle: "Общий чат жильцов",
    messages: [
      {
        text: "Добро пожаловать в общий чат дома Tiba Royal / Paradise.",
        time: "09:00",
      },
      {
        text: "Здесь можно обсудить бытовые вопросы, услуги, объявления и помощь соседям.",
        time: "09:05",
      },
    ],
    canWrite: true,
  },
  {
    id: "community-new-house-news",
    title: "Новости NEW HOUSE",
    subtitle: "Объявления и новости дома",
    messages: [
      {
        text: "Раздел новостей NEW HOUSE: здесь будут появляться объявления, важные обновления и полезная информация.",
        time: "10:00",
      },
      {
        text: "Следующее обновление: добавим категории новостей и закрепленные объявления.",
        time: "10:15",
      },
    ],
    canWrite: false,
  },
];

function communityChatById(id) {
  return COMMUNITY_CHATS.find((chat) => chat.id === id);
}

function renderMessages(user) {
  const partnerIds = [...new Set(state.messages.flatMap((message) => {
    if (message.from === user.id) return [message.to];
    if (message.to === user.id) return [message.from];
    return [];
  }))];

  if (selectedDialogUserId && !partnerIds.includes(selectedDialogUserId) && !communityChatById(selectedDialogUserId)) {
    partnerIds.unshift(selectedDialogUserId);
  }

  if (!selectedDialogUserId && partnerIds.length) {
    selectedDialogUserId = partnerIds[0];
  }

  const communityChat = communityChatById(selectedDialogUserId);

  if (communityChat) {
    const userMessages = state.messages
      .filter((message) => message.to === communityChat.id || message.from === communityChat.id)
      .sort((a, b) => a.createdAt - b.createdAt);

    return `
      <div class="chat-layout">
        <div class="panel chat-list">
          <h2 class="section-title">Чат</h2>
          ${COMMUNITY_CHATS.map((chat) => renderDialogButton(chat.id, user)).join("")}
          ${partnerIds.map((id) => renderDialogButton(id, user)).join("")}
        </div>
        <div class="panel chat-window">
          <button class="secondary chat-back" type="button" data-view="services">Назад к сервисам</button>
          <div class="chat-head">
            <div>
              <h2 class="section-title">${escapeHtml(communityChat.title)}</h2>
              <p class="section-note">${escapeHtml(communityChat.subtitle)}</p>
            </div>
          </div>
          <div class="messages">
            ${communityChat.messages.map((message) => `
              <div class="message">
                ${escapeHtml(message.text)}
                <small>${escapeHtml(message.time)}</small>
              </div>
            `).join("")}
            ${userMessages.map((message) => renderMessage(message, user)).join("")}
          </div>
          ${
            communityChat.canWrite
              ? `<form class="chat-input" data-form="message">
                  <textarea name="text" placeholder="Напишите сообщение..." required></textarea>
                  <button class="primary" type="submit">Отправить</button>
                </form>`
              : `<div class="empty-state"><div><strong>Только новости</strong><span>В этом разделе сообщения публикуются как объявления.</span></div></div>`
          }
        </div>
      </div>
    `;
  }

  const partner = state.users.find((item) => item.id === selectedDialogUserId);
  const dialogMessages = partner
    ? state.messages
        .filter((message) => [message.from, message.to].includes(user.id) && [message.from, message.to].includes(partner.id))
        .sort((a, b) => a.createdAt - b.createdAt)
    : [];
  const draft = partner ? chatDrafts[partner.id] || "" : "";

  return `
    <div class="chat-layout">
      <div class="panel chat-list">
        <h2 class="section-title">Чат</h2>
        ${COMMUNITY_CHATS.map((chat) => renderDialogButton(chat.id, user)).join("")}
        ${
          partnerIds.length
            ? partnerIds.map((id) => renderDialogButton(id, user)).join("")
            : `<div class="empty-state"><div><strong>Пока нет личных диалогов</strong><span>Откройте сервисы и выберите исполнителя.</span></div></div>`
        }
      </div>
      ${
        partner
          ? `<div class="panel chat-window">
              <button class="secondary chat-back" type="button" data-view="services">Назад к сервисам</button>
              <div class="chat-head">
                <div>
                  <h2 class="section-title">${escapeHtml(partner.name)}</h2>
                  <p class="section-note">${partner.role === "executor" ? escapeHtml(partner.title || "Исполнитель") : "Клиент"} · ${escapeHtml(partner.city || "город не указан")}</p>
                </div>
                ${partner.role === "executor" ? `<span class="status-pill">${escapeHtml(partner.price || "Цена по договоренности")}</span>` : ""}
              </div>
              <div class="messages">
                ${dialogMessages.length ? dialogMessages.map((message) => renderMessage(message, user)).join("") : `<div class="empty-state"><div><strong>Диалог еще не начат</strong><span>Сообщение подготовлено в поле ниже. Отправлять его или нет решаете вы.</span></div></div>`}
              </div>
              <form class="chat-input" data-form="message">
                <textarea name="text" placeholder="Напишите сообщение..." required>${escapeHtml(draft)}</textarea>
                <button class="primary" type="submit">Отправить</button>
              </form>
            </div>`
          : `<div class="panel empty-state"><div><strong>Выберите чат</strong><span>Откройте общий чат дома, новости или личный диалог.</span></div></div>`
      }
    </div>
  `;
}

function renderDialogButton(id, user = currentUser()) {
  const communityChat = communityChatById(id);
  if (communityChat) {
    return `
      <button class="dialog-button ${selectedDialogUserId === id ? "active" : ""}" data-dialog="${id}">
        <span class="mini-avatar">${communityChat.title.includes("Новости") ? "Н" : "Т"}</span>
        <span class="dialog-main">
          <strong>${escapeHtml(communityChat.title)}</strong>
          <span>${escapeHtml(communityChat.subtitle)}</span>
        </span>
      </button>
    `;
  }

  const partner = state.users.find((item) => item.id === id);
  if (!partner) return "";
  const last = user
    ? state.messages
        .filter((message) => [message.from, message.to].includes(user.id) && [message.from, message.to].includes(id))
        .sort((a, b) => b.createdAt - a.createdAt)[0]
    : null;
  return `
    <button class="dialog-button ${selectedDialogUserId === id ? "active" : ""}" data-dialog="${id}">
      <span class="mini-avatar">${initials(partner.name)}</span>
      <span class="dialog-main">
        <strong>${escapeHtml(partner.name)}</strong>
        <span>${escapeHtml(last?.text || "Новый диалог")}</span>
      </span>
    </button>
  `;
}

function renderMessages(user) {
  const personalIds = [...new Set(state.messages.flatMap((message) => {
    if (message.from === user.id) return [message.to];
    if (message.to === user.id) return [message.from];
    return [];
  }))].filter((id) => !communityChatById(id));

  if (selectedDialogUserId && !personalIds.includes(selectedDialogUserId) && !communityChatById(selectedDialogUserId)) {
    personalIds.unshift(selectedDialogUserId);
  }

  const chatIds = [...COMMUNITY_CHATS.map((chat) => chat.id), ...personalIds];

  if (!selectedDialogUserId || !chatIds.includes(selectedDialogUserId)) {
    selectedDialogUserId = chatIds[0] || null;
  }

  const communityChat = communityChatById(selectedDialogUserId);
  const partner = communityChat ? null : state.users.find((item) => item.id === selectedDialogUserId);
  const title = communityChat ? communityChat.title : partner ? partner.name : "Чат";
  const subtitle = communityChat
    ? communityChat.subtitle
    : partner
      ? `${partner.role === "executor" ? partner.title || "Исполнитель" : "Клиент"} · ${partner.city || "Хургада"}`
      : "Выберите диалог";
  const avatar = communityChat ? (communityChat.title.includes("Новости") ? "Н" : "Т") : partner ? initials(partner.name) : "Х";

  const baseMessages = communityChat
    ? communityChat.messages.map((message) => ({
        from: communityChat.id,
        text: message.text,
        createdAt: message.time,
        systemTime: message.time,
      }))
    : [];
  const savedMessages = communityChat
    ? state.messages
        .filter((message) => message.to === communityChat.id || message.from === communityChat.id)
        .sort((a, b) => a.createdAt - b.createdAt)
    : partner
      ? state.messages
          .filter((message) => [message.from, message.to].includes(user.id) && [message.from, message.to].includes(partner.id))
          .sort((a, b) => a.createdAt - b.createdAt)
      : [];
  const allMessages = [...baseMessages, ...savedMessages];
  const draft = partner ? chatDrafts[partner.id] || "" : "";

  return `
    <div class="wa-shell">
      <aside class="wa-sidebar">
        <div class="wa-sidebar-head">
          <div>
            <h2>Чаты</h2>
            <span>ХурМа</span>
          </div>
          <button class="wa-icon-button" type="button" data-view="services">←</button>
        </div>
        <div class="wa-search">Поиск или новый чат</div>
        <div class="wa-dialogs">
          ${chatIds.map((id) => renderDialogButton(id, user)).join("")}
        </div>
      </aside>
      <section class="wa-chat">
        ${
          selectedDialogUserId
            ? `<div class="wa-chat-head">
                <button class="wa-mobile-back" type="button" data-view="services">←</button>
                <span class="wa-avatar">${escapeHtml(avatar)}</span>
                <div class="wa-chat-title">
                  <strong>${escapeHtml(title)}</strong>
                  <span>${escapeHtml(subtitle)}</span>
                </div>
              </div>
              <div class="wa-messages">
                ${
                  allMessages.length
                    ? allMessages.map((message) => renderMessage(message, user)).join("")
                    : `<div class="wa-empty"><strong>Диалог еще не начат</strong><span>Сообщение подготовлено в поле ниже. Отправлять его или нет решаете вы.</span></div>`
                }
              </div>
              ${
                communityChat && !communityChat.canWrite
                  ? `<div class="wa-readonly">Это новостной канал. Сообщения публикуются как объявления.</div>`
                  : `<form class="wa-input" data-form="message">
                      <textarea name="text" placeholder="Напишите сообщение..." required>${escapeHtml(draft)}</textarea>
                      <button type="submit">Отправить</button>
                    </form>`
              }`
            : `<div class="wa-empty"><strong>Выберите чат</strong><span>Откройте общий чат дома, новости или личный диалог.</span></div>`
        }
      </section>
    </div>
  `;
}

function renderDialogButton(id, user = currentUser()) {
  const communityChat = communityChatById(id);
  const partner = communityChat ? null : state.users.find((item) => item.id === id);
  if (!communityChat && !partner) return "";

  const title = communityChat ? communityChat.title : partner.name;
  const subtitle = communityChat ? communityChat.subtitle : partner.title || "Новый диалог";
  const avatar = communityChat ? (communityChat.title.includes("Новости") ? "Н" : "Т") : initials(partner.name);
  const last = communityChat
    ? state.messages.filter((message) => message.to === id || message.from === id).sort((a, b) => b.createdAt - a.createdAt)[0]
    : user
      ? state.messages
          .filter((message) => [message.from, message.to].includes(user.id) && [message.from, message.to].includes(id))
          .sort((a, b) => b.createdAt - a.createdAt)[0]
      : null;
  const preview = last ? last.text : communityChat ? subtitle : "Новый диалог";
  const time = last ? formatTime(last.createdAt) : "";

  return `
    <button class="wa-dialog ${selectedDialogUserId === id ? "active" : ""}" data-dialog="${id}">
      <span class="wa-avatar">${escapeHtml(avatar)}</span>
      <span class="wa-dialog-main">
        <span class="wa-dialog-row">
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(time)}</small>
        </span>
        <span class="wa-dialog-preview">${escapeHtml(preview)}</span>
      </span>
    </button>
  `;
}

function renderMessage(message, user) {
  const mine = message.from === user.id;
  const time = message.systemTime || formatTime(message.createdAt);
  return `
    <div class="wa-bubble ${mine ? "mine" : ""}">
      <span>${escapeHtml(message.text)}</span>
      <small>${escapeHtml(time)}</small>
    </div>
  `;
}

let chatScreenMode = "list";

function startChat(partnerId) {
  const user = currentUser();
  if (!user) return;
  selectedDialogUserId = partnerId;
  if (!chatDrafts[partnerId]) {
    chatDrafts[partnerId] = "Здравствуйте! Хочу обсудить задачу и условия.";
  }
  chatScreenMode = "chat";
  view = "messages";
  app();
}

function renderMessages(user) {
  const personalIds = [...new Set(state.messages.flatMap((message) => {
    if (message.from === user.id) return [message.to];
    if (message.to === user.id) return [message.from];
    return [];
  }))].filter((id) => !communityChatById(id));

  if (selectedDialogUserId && !personalIds.includes(selectedDialogUserId) && !communityChatById(selectedDialogUserId)) {
    personalIds.unshift(selectedDialogUserId);
  }

  const chatIds = [...COMMUNITY_CHATS.map((chat) => chat.id), ...personalIds];

  if (!selectedDialogUserId || !chatIds.includes(selectedDialogUserId)) {
    selectedDialogUserId = chatIds[0] || null;
  }

  const listMarkup = `
    <aside class="wa-sidebar wa-sidebar-full">
      <div class="wa-sidebar-head">
        <div>
          <h2>Чаты</h2>
          <span>ХурМа</span>
        </div>
        <button class="wa-icon-button" type="button" data-view="services">←</button>
      </div>
      <div class="wa-search">Поиск или новый чат</div>
      <div class="wa-dialogs">
        ${chatIds.map((id) => renderDialogButton(id, user)).join("")}
      </div>
    </aside>
  `;

  if (chatScreenMode !== "chat") {
    return `<div class="wa-shell wa-list-only">${listMarkup}</div>`;
  }

  const communityChat = communityChatById(selectedDialogUserId);
  const partner = communityChat ? null : state.users.find((item) => item.id === selectedDialogUserId);
  const title = communityChat ? communityChat.title : partner ? partner.name : "Чат";
  const subtitle = communityChat
    ? communityChat.subtitle
    : partner
      ? `${partner.role === "executor" ? partner.title || "Исполнитель" : "Клиент"} · ${partner.city || "Хургада"}`
      : "Выберите диалог";
  const avatar = communityChat ? (communityChat.title.includes("Новости") ? "Н" : "Т") : partner ? initials(partner.name) : "Х";
  const baseMessages = communityChat
    ? communityChat.messages.map((message) => ({
        from: communityChat.id,
        text: message.text,
        createdAt: message.time,
        systemTime: message.time,
      }))
    : [];
  const savedMessages = communityChat
    ? state.messages
        .filter((message) => message.to === communityChat.id || message.from === communityChat.id)
        .sort((a, b) => a.createdAt - b.createdAt)
    : partner
      ? state.messages
          .filter((message) => [message.from, message.to].includes(user.id) && [message.from, message.to].includes(partner.id))
          .sort((a, b) => a.createdAt - b.createdAt)
      : [];
  const allMessages = [...baseMessages, ...savedMessages];
  const draft = partner ? chatDrafts[partner.id] || "" : "";

  return `
    <div class="wa-shell wa-chat-only">
      <section class="wa-chat">
        <div class="wa-chat-head">
          <button class="wa-mobile-back" type="button" data-action="chat-list">←</button>
          <span class="wa-avatar">${escapeHtml(avatar)}</span>
          <div class="wa-chat-title">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(subtitle)}</span>
          </div>
        </div>
        <div class="wa-messages">
          ${
            allMessages.length
              ? allMessages.map((message) => renderMessage(message, user)).join("")
              : `<div class="wa-empty"><strong>Диалог еще не начат</strong><span>Сообщение подготовлено в поле ниже. Отправлять его или нет решаете вы.</span></div>`
          }
        </div>
        ${
          communityChat && !communityChat.canWrite
            ? `<div class="wa-readonly">Это новостной канал. Сообщения публикуются как объявления.</div>`
            : `<form class="wa-input" data-form="message">
                <textarea name="text" placeholder="Напишите сообщение..." required>${escapeHtml(draft)}</textarea>
                <button type="submit">Отправить</button>
              </form>`
        }
      </section>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authMode;
      app();
    });
  });

  document.querySelectorAll("[data-auth-role]").forEach((button) => {
    button.addEventListener("click", () => {
      authRole = button.dataset.authRole;
      app();
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      if (view === "messages") chatScreenMode = "list";
      app();
    });
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      filters.category = button.dataset.service;
      filters.q = "";
      filters.area = "Все районы";
      filters.eventType = "Все мероприятия";
      filters.sport = "Все виды спорта";
      filters.age = "Любой возраст";
      filters.city = "Хургада";
      activeMapEventTitle = null;
      view = "services";
      app();
    });
  });

  document.querySelector("[data-action='chat-list']")?.addEventListener("click", () => {
    chatScreenMode = "list";
    app();
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    state.sessionUserId = null;
    selectedDialogUserId = null;
    activeMapEventTitle = null;
    chatScreenMode = "list";
    authMode = "register";
    saveState();
    app();
  });

  document.querySelector("[data-action='guest']")?.addEventListener("click", continueAsGuest);
  document.querySelector("[data-action='back-afisha']")?.addEventListener("click", () => {
    activeMapEventTitle = null;
    view = "services";
    filters.category = SERVICE_OPTIONS[2];
    app();
  });
  document.querySelector("[data-form='auth']")?.addEventListener("submit", handleAuth);
  document.querySelector("[data-form='executor-profile']")?.addEventListener("submit", handleExecutorProfile);
  document.querySelector("[data-form='client-profile']")?.addEventListener("submit", handleClientProfile);
  document.querySelector("[data-form='message']")?.addEventListener("submit", handleMessage);

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      filters[field.dataset.filter] = field.value;
      if (field.dataset.filter === "eventType") {
        filters.sport = "Все виды спорта";
        filters.age = "Любой возраст";
      }
      activeMapEventTitle = null;
      app();
    });
  });

  document.querySelectorAll("[data-map-event]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMapEventTitle = button.dataset.mapEvent;
      view = "services";
      filters.category = SERVICE_OPTIONS[2];
      app();
    });
  });

  document.querySelectorAll("[data-chat-with]").forEach((button) => {
    button.addEventListener("click", () => startChat(button.dataset.chatWith));
  });

  document.querySelectorAll("[data-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDialogUserId = button.dataset.dialog;
      chatScreenMode = "chat";
      app();
    });
  });

  document.querySelectorAll("[data-event-request]").forEach((button) => {
    button.addEventListener("click", () => {
      toast(`Заявка на мероприятие «${button.dataset.eventRequest}» сохранена.`);
    });
  });
}

const bindEventsBeforeServiceChoiceGate = bindEvents;
bindEvents = function bindEventsWithServiceChoiceGate() {
  bindEventsBeforeServiceChoiceGate();

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.view === "services") {
        serviceChoiceMade = false;
        activeMapEventTitle = null;
        app();
      }
    });
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      serviceChoiceMade = true;
      app();
    });
  });

  document.querySelector("[data-action='show-all-services']")?.addEventListener("click", () => {
    serviceChoiceMade = false;
    activeMapEventTitle = null;
    filters.q = "";
    app();
  });
};

const continueAsGuestBeforeServiceChoiceGate = continueAsGuest;
continueAsGuest = function continueAsGuestWithServiceChoiceGate() {
  serviceChoiceMade = false;
  activeMapEventTitle = null;
  continueAsGuestBeforeServiceChoiceGate();
};

const handleAuthBeforeServiceChoiceGate = handleAuth;
handleAuth = function handleAuthWithServiceChoiceGate(event) {
  serviceChoiceMade = false;
  activeMapEventTitle = null;
  handleAuthBeforeServiceChoiceGate(event);
};

let authEntryMode = "choice";
let subscriptionModalOpen = false;

function hasActiveSubscription(user) {
  return Boolean(user && !user.isGuest && user.subscriptionActive === true);
}

function renderSubscriptionModal() {
  if (!subscriptionModalOpen) return "";

  return `
    <div class="modal-backdrop">
      <section class="subscription-modal" role="dialog" aria-modal="true" aria-labelledby="subscription-title">
        <span class="tag">Подписка ХурМа</span>
        <h2 id="subscription-title">Оформите подписку</h2>
        <p>Гостевой режим позволяет смотреть сервисы и афишу. Чтобы написать исполнителю или оставить заявку, нужна регистрация и активная подписка.</p>
        <div class="quick-actions">
          <button class="primary" type="button" data-action="subscribe-register">Зарегистрироваться</button>
          <button class="secondary" type="button" data-action="close-subscription">Позже</button>
        </div>
      </section>
    </div>
  `;
}

function openSubscriptionModal() {
  subscriptionModalOpen = true;
  app();
}

const renderAuthBeforeSubscriptionGate = renderAuth;
renderAuth = function renderAuthWithEntryChoice() {
  if (authEntryMode !== "choice") {
    return renderAuthBeforeSubscriptionGate();
  }

  return `
    <section class="auth-layout">
      <div class="intro">
        <div>
          <h1><span class="hero-brand-word">ХурМа</span> для солнечной Хургады</h1>
          <p>Выберите сервис, найдите исполнителя, посмотрите афишу и начните общение после регистрации.</p>
        </div>
        <div class="intro-stats">
          <div class="stat"><strong>3 сервиса</strong><span>трансфер, клининг и афиша рядом</span></div>
          <div class="stat"><strong>чат</strong><span>диалог с исполнителем после подписки</span></div>
          <div class="stat"><strong>Хургада</strong><span>локальные услуги для жителей и гостей</span></div>
        </div>
      </div>
      <div class="panel auth-panel auth-choice-panel">
        <div class="auth-choice-actions">
          <button class="primary" type="button" data-action="start-login" data-hint="Откроется форма входа для зарегистрированных пользователей.">Вход</button>
          <button class="primary" type="button" data-action="start-register" data-hint="Создайте аккаунт, выберите роль и район поиска.">Регистрация</button>
          <button class="secondary" type="button" data-action="guest" data-hint="Можно посмотреть сервисы и афишу без аккаунта. Для заявок понадобится подписка.">Продолжить без регистрации</button>
        </div>
      </div>
    </section>
  `;
};

const appBeforeSubscriptionGate = app;
app = function appWithSubscriptionGate() {
  appBeforeSubscriptionGate();
  document.querySelector("#app").insertAdjacentHTML("beforeend", renderSubscriptionModal());
  document.querySelector("[data-action='close-subscription']")?.addEventListener("click", () => {
    subscriptionModalOpen = false;
    app();
  });
  document.querySelector("[data-action='subscribe-register']")?.addEventListener("click", () => {
    subscriptionModalOpen = false;
    authEntryMode = "form";
    authMode = "register";
    state.sessionUserId = null;
    saveState();
    app();
  });
};

const bindEventsBeforeSubscriptionGate = bindEvents;
bindEvents = function bindEventsWithSubscriptionGate() {
  bindEventsBeforeSubscriptionGate();

  document.querySelector("[data-action='start-register']")?.addEventListener("click", () => {
    authEntryMode = "form";
    authMode = "register";
    app();
  });

  document.querySelector("[data-action='start-login']")?.addEventListener("click", () => {
    authEntryMode = "form";
    authMode = "login";
    app();
  });

  document.querySelectorAll("[data-chat-with], [data-event-request]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (hasActiveSubscription(currentUser())) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openSubscriptionModal();
    }, true);
  });
};

const continueAsGuestBeforeSubscriptionGate = continueAsGuest;
continueAsGuest = function continueAsGuestWithSubscriptionGate() {
  authEntryMode = "choice";
  subscriptionModalOpen = false;
  continueAsGuestBeforeSubscriptionGate();
};

const handleAuthBeforeSubscriptionGate = handleAuth;
handleAuth = function handleAuthWithSubscriptionGate(event) {
  handleAuthBeforeSubscriptionGate(event);
  const user = currentUser();
  if (user && !user.isGuest) {
    user.subscriptionActive = true;
    authEntryMode = "choice";
    saveState();
  }
};

const LOCATION_CITIES = ["Хургада"];
const LOCATION_AREAS = ["Marina", "Sheraton", "Mamsha", "Sahl Hasheesh", "El Gouna", "Dahar", "Эль-Ахья"];

function selectedLocation() {
  return state.location || { city: "Хургада", area: "Marina" };
}

function renderLocationScreen() {
  const location = selectedLocation();
  return `
    <div class="app-shell">
      <main class="main location-main">
        <section class="location-screen">
          <div class="location-copy">
            <div class="brand location-brand">
              <div class="brand-mark">Х</div>
              <div>
                <h1 class="brand-title">ХурМа</h1>
                <p class="brand-subtitle">сервисы рядом с вами</p>
              </div>
            </div>
            <div>
              <h2>Где ищем услуги?</h2>
              <p>Выберите город и район, чтобы ХурМа сразу показывала актуальные сервисы, афишу и исполнителей поблизости.</p>
            </div>
          </div>
          <form class="panel location-panel" data-form="location">
            <span class="tag">Локация</span>
            <h2 class="section-title">Выберите место</h2>
            <label class="field">
              <span>Город</span>
              <select name="city" required>
                ${LOCATION_CITIES.map((city) => `<option ${location.city === city ? "selected" : ""}>${city}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Район</span>
              <select name="area" required>
                ${LOCATION_AREAS.map((area) => `<option ${location.area === area ? "selected" : ""}>${area}</option>`).join("")}
              </select>
            </label>
            <button class="primary" type="submit">Продолжить</button>
          </form>
        </section>
      </main>
    </div>
  `;
}

function handleLocation(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.location = {
    city: String(form.get("city") || "Хургада"),
    area: String(form.get("area") || "Marina"),
  };
  state.locationConfirmed = true;
  filters.city = state.location.city;
  filters.area = state.location.area;
  saveState();
  app();
}

const renderTopbarBeforeLocation = renderTopbar;
renderTopbar = function renderTopbarWithLocation(user) {
  const location = selectedLocation();
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">Х</div>
        <div>
          <h1 class="brand-title">ХурМа</h1>
          <p class="brand-subtitle">сервисы для жизни в Хургаде</p>
        </div>
      </div>
      <div class="user-tools">
        <button class="location-pill" type="button" data-action="change-location">
          <span>${escapeHtml(location.city)}</span>
          <strong>${escapeHtml(location.area)}</strong>
        </button>
        ${
          user
            ? `<span class="role-pill">${user.role === "executor" ? "Исполнитель" : user.isGuest ? "Гость" : "Клиент"} · ${escapeHtml(user.name)}</span>
               <button class="secondary" data-action="logout">Выйти</button>`
            : `<span class="role-pill">Демо: client@hurma.local / 123456</span>`
        }
      </div>
    </header>
  `;
};

const appBeforeLocationGate = app;
app = function appWithLocationGate() {
  if (!state.locationConfirmed) {
    document.querySelector("#app").innerHTML = renderLocationScreen();
    document.querySelector("[data-form='location']")?.addEventListener("submit", handleLocation);
    return;
  }

  appBeforeLocationGate();
  document.querySelector("[data-action='change-location']")?.addEventListener("click", () => {
    state.locationConfirmed = false;
    saveState();
    app();
  });
};

const SEARCH_AREAS = ["Marina", "Sheraton", "Mamsha", "Sahl Hasheesh", "El Gouna", "Dahar", "Эль-Ахья"];

function renderSearchAreaField(selectedArea = "Marina") {
  return `
    <label class="field">
      <span>Район поиска</span>
      <select name="searchArea" required>
        ${SEARCH_AREAS.map((area) => `<option ${selectedArea === area ? "selected" : ""}>${area}</option>`).join("")}
      </select>
    </label>
  `;
}

const CITY_AREAS_FORM = {
  "Хургада": ["Marina", "Sheraton", "Mamsha", "Sahl Hasheesh", "El Gouna", "Dahar", "Эль-Ахья"],
  "Шарм-эль-Шейх": ["Naama Bay", "Hadaba", "Sharks Bay", "Nabq Bay", "Old Market", "SOHO Square"],
};

const SEARCH_CITIES_FORM = Object.keys(CITY_AREAS_FORM);

function renderCitySelectField(selectedCity = "Хургада") {
  return `
    <label class="field">
      <span>Город</span>
      <select name="city" data-auth-city required>
        ${SEARCH_CITIES_FORM.map((city) => `<option ${selectedCity === city ? "selected" : ""}>${city}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderSearchAreaOptions(city = "Хургада", selectedArea = "") {
  const areas = CITY_AREAS_FORM[city] || CITY_AREAS_FORM["Хургада"];
  const currentArea = selectedArea || areas[0];
  return areas.map((area) => `<option ${currentArea === area ? "selected" : ""}>${area}</option>`).join("");
}

renderSearchAreaField = function renderSearchAreaFieldByCity(selectedArea = "Marina", city = "Хургада") {
  return `
    <label class="field">
      <span>Район поиска</span>
      <select name="searchArea" data-search-area required>
        ${renderSearchAreaOptions(city, selectedArea)}
      </select>
    </label>
  `;
};

function bindCityAreaPicker() {
  const citySelect = document.querySelector("[data-auth-city]");
  const areaSelect = document.querySelector("[data-search-area]");
  if (!citySelect || !areaSelect) return;

  citySelect.addEventListener("change", () => {
    areaSelect.innerHTML = renderSearchAreaOptions(citySelect.value);
  });
}

const renderAuthBeforeSearchArea = renderAuth;
renderAuth = function renderAuthWithSearchArea() {
  const html = renderAuthBeforeSearchArea();
  if (authEntryMode === "choice") {
    return html;
  }

  const withoutAuthModeTabs = html.replace(/<div class="tabs">[\s\S]*?<\/div>\s*/, "");

  const withCitySelect = authMode === "register"
    ? withoutAuthModeTabs.replace(
        /<label class="field"><span>.*?<\/span><input name="city"[^>]*><\/label>/s,
        renderCitySelectField()
      )
    : withoutAuthModeTabs;

  const withArea = authMode === "register" && !withCitySelect.includes('name="searchArea"')
    ? withCitySelect.replace(
        /(<label class="field">[\s\S]*?<select name="city"[\s\S]*?<\/select>\s*<\/label>)/s,
        `$1${renderSearchAreaField()}`
      ).replace(
        /(<label class="field"><span>.*?<\/span><input name="city"[^>]*><\/label>)/s,
        `$1${renderSearchAreaField()}`
      )
    : withCitySelect;

  const formSwitch = authMode === "login"
    ? `<div class="auth-form-switch"><span>Еще нет аккаунта?</span><button class="ghost auth-link-button" type="button" data-action="switch-register">Зарегистрироваться</button></div>`
    : `<div class="auth-form-switch"><span>Уже есть аккаунт?</span><button class="ghost auth-link-button" type="button" data-action="switch-login">Войти</button></div>`;

  const withFormNav = withArea
    .replace(
      '<div class="panel auth-panel">',
      '<div class="panel auth-panel"><button class="ghost auth-back-button" type="button" data-action="back-auth-choice">Назад</button>'
    )
    .replace('</form>', `${formSwitch}</form>`);

  return withFormNav
    .replace('auth-layout', 'auth-layout auth-layout-form')
    .replace('<div class="intro">', '<div class="intro auth-form-intro">');
};

const bindEventsBeforeAuthFormNav = bindEvents;
bindEvents = function bindEventsWithAuthFormNav() {
  bindEventsBeforeAuthFormNav();
  bindCityAreaPicker();

  document.querySelector("[data-action='back-auth-choice']")?.addEventListener("click", () => {
    authEntryMode = "choice";
    app();
  });

  document.querySelector("[data-action='switch-register']")?.addEventListener("click", () => {
    authEntryMode = "form";
    authMode = "register";
    app();
  });

  document.querySelector("[data-action='switch-login']")?.addEventListener("click", () => {
    authEntryMode = "form";
    authMode = "login";
    app();
  });
};

const handleAuthBeforeSearchArea = handleAuth;
handleAuth = function handleAuthWithSearchArea(event) {
  const form = new FormData(event.currentTarget);
  const searchArea = String(form.get("searchArea") || "").trim();
  handleAuthBeforeSearchArea(event);

  const user = currentUser();
  if (user && !user.isGuest && searchArea) {
    user.searchArea = searchArea;
    state.location = { city: user.city || "Хургада", area: searchArea };
    saveState();
  }
};

renderTopbar = function renderTopbarWithSearchArea(user) {
  const area = user && !user.isGuest ? user.searchArea : "";
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">Х</div>
        <div>
          <h1 class="brand-title">ХурМа</h1>
          <p class="brand-subtitle">сервисы для жизни в Хургаде</p>
        </div>
      </div>
      <div class="user-tools">
        ${
          area
            ? `<span class="location-pill location-pill-static"><span>Район поиска</span><strong>${escapeHtml(area)}</strong></span>`
            : ""
        }
        ${
          user
            ? `<span class="role-pill">${user.role === "executor" ? "Исполнитель" : user.isGuest ? "Гость" : "Клиент"} · ${escapeHtml(user.name)}</span>
               <button class="secondary" data-action="logout">Выйти</button>`
            : `<span class="role-pill">Демо: client@hurma.local / 123456</span>`
        }
      </div>
    </header>
  `;
};

app = function appWithoutLocationGate() {
  appBeforeLocationGate();
};

let profileSaveLocked = false;

function normalizeProfileCity(city) {
  return CITY_AREAS_FORM[city] ? city : "Хургада";
}

function normalizeAreaName(area) {
  return area === "Эль Ахья" ? "Эль-Ахья" : area;
}

function normalizeProfileArea(city, area) {
  const normalizedCity = normalizeProfileCity(city);
  const areas = CITY_AREAS_FORM[normalizedCity] || CITY_AREAS_FORM["Хургада"];
  const normalizedArea = normalizeAreaName(area);
  return areas.includes(normalizedArea) ? normalizedArea : areas[0];
}

function renderProfileLocationFields(user) {
  const city = normalizeProfileCity(user.city || "Хургада");
  const area = normalizeProfileArea(city, user.searchArea || "");
  return `${renderCitySelectField(city)}${renderSearchAreaField(area, city)}`;
}

const renderProfileBeforeLocationFields = renderProfile;
renderProfile = function renderProfileWithLocationFields(user) {
  if (!user || user.isGuest) {
    return renderProfileBeforeLocationFields(user);
  }

  const html = renderProfileBeforeLocationFields(user).replace(
    /<label class="field"><span>.*?<\/span><input name="city"[^>]*><\/label>/g,
    renderProfileLocationFields(user)
  );

  if (!profileSaveLocked) {
    return html;
  }

  return html.replace(
    /<button class="primary" type="submit">/g,
    '<button class="primary" type="submit" disabled>'
  );
};

function saveProfileLocationFromForm(user, form) {
  const city = normalizeProfileCity(String(form.get("city") || "").trim());
  const searchArea = normalizeProfileArea(city, String(form.get("searchArea") || "").trim());
  user.city = city;
  user.searchArea = searchArea;
  state.location = { city, area: searchArea };
}

const handleClientProfileBeforeLocationFields = handleClientProfile;
handleClientProfile = function handleClientProfileWithLocationFields(event) {
  const form = new FormData(event.currentTarget);
  handleClientProfileBeforeLocationFields(event);

  const user = currentUser();
  if (user && !user.isGuest) {
    saveProfileLocationFromForm(user, form);
    profileSaveLocked = true;
    saveState();
    app();
  }
};

const handleExecutorProfileBeforeLocationFields = handleExecutorProfile;
handleExecutorProfile = function handleExecutorProfileWithLocationFields(event) {
  const form = new FormData(event.currentTarget);
  handleExecutorProfileBeforeLocationFields(event);

  const user = currentUser();
  if (user && !user.isGuest) {
    saveProfileLocationFromForm(user, form);
    profileSaveLocked = true;
    saveState();
    app();
  }
};

const bindEventsBeforeProfileSaveLock = bindEvents;
bindEvents = function bindEventsWithProfileSaveLock() {
  bindEventsBeforeProfileSaveLock();

  document.querySelectorAll("[data-form='client-profile'], [data-form='executor-profile']").forEach((form) => {
    const unlockSave = () => {
      profileSaveLocked = false;
      form.querySelector("button[type='submit']")?.removeAttribute("disabled");
    };

    form.addEventListener("input", unlockSave);
    form.addEventListener("change", unlockSave);
  });
};

function renderBootError(error) {
  console.error("Hurma render error:", error);
  document.querySelector("#app").innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">Х</div>
          <div>
            <h1 class="brand-title">ХурМа</h1>
            <p class="brand-subtitle">приложение загрузилось с ошибкой</p>
          </div>
        </div>
      </header>
      <main class="main">
        <div class="panel empty-state">
          <div>
            <strong>Не удалось открыть интерфейс</strong>
            <span>Обновите приложение. Если не поможет, очистите данные приложения и откройте снова.</span>
          </div>
        </div>
      </main>
    </div>
  `;
}

setTimeout(() => {
  try {
    app();
  } catch (error) {
    renderBootError(error);
  }
}, 4200);
