const STORAGE_KEY = "hurma-marketplace-state-v1";
const memoryStorage = {};

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
      title: "Разработчик сайтов и ботов",
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
      text: "Здравствуйте! Могу оценить задачу, если пришлете пару примеров сайтов.",
      createdAt: Date.now() - 1000 * 60 * 38,
    },
  ],
  sessionUserId: null,
};

let state = loadState();
let view = "catalog";
let authMode = "login";
let authRole = "client";
let selectedDialogUserId = null;
let filters = { q: "", category: "Все", city: "Все" };

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
    storageSet(STORAGE_KEY, JSON.stringify(withClient));
    return withClient;
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.messages)) {
      throw new Error("Bad saved state");
    }
    return parsed;
  } catch {
    storageRemove(STORAGE_KEY);
    return loadState();
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
  return ["Все", ...new Set(state.users.filter((u) => u.role === "executor").map((u) => u.category).filter(Boolean))];
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
      <input data-filter="q" value="${escapeHtml(filters.q)}" placeholder="Поиск: ремонт, сайт, репетитор..." />
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

try {
  app();
} catch (error) {
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
            <span>Обновите страницу. Если не поможет, очистите данные сайта для этого файла и откройте снова.</span>
          </div>
        </div>
      </main>
    </div>
  `;
}
