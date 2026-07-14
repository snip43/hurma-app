const { useEffect, useMemo, useRef, useState } = React;
const { withTimeout } = window.HurmaAsync;
const { normalizeContact, buildManualContact, normalizeChatMessage, upsertChatMessage } = window.HurmaChatUtils;
const { readAuthCallback, cleanAuthCallbackUrl, confirmationErrorMessage } = window.HurmaAuthUtils;

const STORAGE_KEY = "hurma-react-state-v1";
const supabaseConfig = window.HURMA_SUPABASE || {};
const supabaseClient = window.supabase && supabaseConfig.url && supabaseConfig.publishableKey
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.publishableKey)
  : null;

const CITIES = {
  "Хургада": ["Все", "Marina", "Sheraton", "Mamsha", "Sahl Hasheesh", "El Gouna", "Dahar", "Эль-Ахья"],
  "Шарм-эль-Шейх": ["Все", "Naama Bay", "Hadaba", "Sharks Bay", "Nabq Bay", "Old Market", "SOHO Square"],
};

const AREA_FILTERS = ["Все районы", ...CITIES["Хургада"].filter((area) => area !== "Все")];
const SERVICES = ["Трансфер", "Клининг", "Афиша"];
const SERVICE_ICONS = {
  "Трансфер": "🚕",
  "Клининг": "🧼",
  "Афиша": "🎟",
  "Чат": "💬",
  "Чаты": "💬",
};
const EVENT_TYPES = ["Все мероприятия", "Афиша", "Спорт", "Для детей"];
const SPORTS = ["Все виды спорта", "Футбол", "Йога", "Дайвинг", "Бег", "Падел", "Волейбол", "Баскетбол"];
const AGES = ["Любой возраст", "0+", "6+", "12+", "16+"];
const DEFAULT_EVENT_FILTERS = { area: "Все районы", type: "Все мероприятия", sport: "Все виды спорта", age: "Любой возраст", q: "" };
const CHAT_LOAD_TIMEOUT_MS = 8000;
const CHAT_REFRESH_MS = 15000;
const CHAT_DIALOG_CACHE_PREFIX = "hurma-chat-dialogs-v1:";
const PROFILE_AVATAR_BUCKET = "profile-avatars";
const SERVICE_IMAGE_BUCKET = "service-images";
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EXECUTORS = [
  {
    id: "transfer-1",
    name: "Ахмед Саид",
    city: "Хургада",
    area: "Marina",
    category: "Трансфер",
    title: "Трансфер из аэропорта и поездки по городу",
    price: "от 12 $",
    rating: 4.9,
    about: "Встречаю в аэропорту, помогаю с багажом, поездки по Хургаде, Эль-Гуне и Сахль-Хашиш.",
    skills: ["аэропорт", "детское кресло", "русский язык"],
    photoUrl: "assets/hurghada-hero.png",
    routes: [
      { from: "Аэропорт", to: "Эль-Ахья", price: 10 },
      { from: "Аэропорт", to: "Эль-Гуна", price: 20 },
    ],
  },
  {
    id: "transfer-2",
    name: "Карим Махмуд",
    city: "Хургада",
    area: "Эль-Ахья",
    category: "Трансфер",
    title: "Семейные поездки и междугородний трансфер",
    price: "от 18 $",
    rating: 4.8,
    about: "Комфортный минивэн, поездки в Каир, Луксор, Эль-Гуну и аэропорт.",
    skills: ["минивэн", "семьи", "межгород"],
    photoUrl: "assets/hurghada-hero.png",
    routes: [
      { from: "Аэропорт", to: "Marina", price: 12 },
      { from: "Хургада", to: "Эль-Гуна", price: 22 },
    ],
  },
  {
    id: "clean-1",
    name: "Sara Cleaning",
    city: "Хургада",
    area: "Mamsha",
    category: "Клининг",
    title: "Уборка квартир и апартаментов",
    price: "от 20 $",
    rating: 4.95,
    about: "Регулярная уборка, генеральная уборка после гостей, подготовка квартиры к заселению.",
    skills: ["апартаменты", "после гостей", "окна"],
  },
  {
    id: "clean-2",
    name: "Nour Home Care",
    city: "Хургада",
    area: "Sheraton",
    category: "Клининг",
    title: "Клининг вилл и больших квартир",
    price: "от 35 $",
    rating: 4.7,
    about: "Команда для больших объектов, уборка после ремонта, поддерживающая уборка.",
    skills: ["виллы", "после ремонта", "команда"],
  },
];

const EVENTS = [
  {
    id: "event-1",
    title: "Вечерняя прогулка по Marina Hurghada",
    date: "Сегодня, 19:30",
    area: "Marina",
    type: "Афиша",
    location: "Hurghada Marina",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Hurghada%20Marina",
    text: "Набережная, кафе, закат и спокойный маршрут для первого знакомства с городом.",
    request: false,
  },
  {
    id: "event-2",
    title: "Снорклинг на островах",
    date: "Завтра, 09:00",
    area: "Marina",
    type: "Афиша",
    location: "New Marina Hurghada",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=New%20Marina%20Hurghada",
    text: "Морская программа на день: трансфер, лодка, остановки у рифов и отдых на пляже.",
    request: true,
  },
  {
    id: "event-3",
    title: "Семейная афиша на выходные",
    date: "Суббота, 17:00",
    area: "Mamsha",
    type: "Для детей",
    age: "6+",
    location: "Hurghada Mamsha Promenade",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Hurghada%20Mamsha%20Promenade",
    text: "Подборка мест для детей и взрослых: шоу, прогулки, рестораны и спокойные локации.",
    request: false,
  },
  {
    id: "event-4",
    title: "Утренняя йога у моря",
    date: "Пятница, 07:30",
    area: "Sahl Hasheesh",
    type: "Спорт",
    sport: "Йога",
    location: "Sahl Hasheesh Old Town",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sahl%20Hasheesh%20Old%20Town",
    text: "Легкая тренировка на рассвете, дыхание, растяжка и спокойный темп.",
    request: true,
  },
  {
    id: "event-5",
    title: "Волейбол на пляже",
    date: "Среда, 18:30",
    area: "Эль-Ахья",
    type: "Спорт",
    sport: "Волейбол",
    location: "El Ahyaa Beach",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=El%20Ahyaa%20Beach%20Hurghada",
    text: "Открытая игра для жителей района, команды собираются на месте.",
    request: true,
  },
  {
    id: "event-6",
    title: "Баскетбол 3x3",
    date: "Четверг, 20:00",
    area: "Dahar",
    type: "Спорт",
    sport: "Баскетбол",
    location: "Dahar Sports Court",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Dahar%20Hurghada%20basketball",
    text: "Вечерняя игра 3x3, можно прийти одному или своей командой.",
    request: true,
  },
];

const COMMUNITY_CHATS = [
  {
    id: "tiba",
    title: "Чат дома Tiba Royal / Paradise",
    subtitle: "Общий чат жильцов",
    readonly: false,
    messages: [
      { from: "Сосед", text: "Кто сегодня едет в Senzo Mall?", time: "10:12", me: false },
      { from: "Вы", text: "Я ближе к вечеру, могу захватить пару пакетов.", time: "10:18", me: true },
    ],
  },
  {
    id: "news",
    title: "Новости NEW HOUSE",
    subtitle: "Объявления и новости дома",
    readonly: true,
    messages: [
      { from: "Администрация", text: "Завтра плановая проверка бассейна с 9:00 до 12:00.", time: "09:00", me: false },
    ],
  },
];

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSaved(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadChatDialogCache(userId) {
  if (!userId) return [];
  try {
    const cached = JSON.parse(localStorage.getItem(`${CHAT_DIALOG_CACHE_PREFIX}${userId}`)) || [];
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

function saveChatDialogCache(userId, dialogs) {
  if (!userId) return;
  localStorage.setItem(`${CHAT_DIALOG_CACHE_PREFIX}${userId}`, JSON.stringify(dialogs || []));
}

function areaOptions(city) {
  return CITIES[city] || CITIES["Хургада"];
}

function imageFileError(file, maxMegabytes) {
  if (!file) return "Выберите фотографию.";
  if (!IMAGE_TYPES.includes(file.type)) return "Поддерживаются фотографии JPG, PNG и WebP.";
  if (file.size > maxMegabytes * 1024 * 1024) return `Размер фотографии не должен превышать ${maxMegabytes} МБ.`;
  return "";
}

function publicStoragePath(url, bucket) {
  if (!url) return "";
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index === -1 ? "" : decodeURIComponent(url.slice(index + marker.length));
}

async function uploadPublicImage(bucket, userId, file, prefix) {
  const extension = String(file.name || "image.jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${userId}/${prefix}-${Date.now()}.${extension}`;
  const { error } = await supabaseClient.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

async function removePublicImage(bucket, url) {
  const path = publicStoragePath(url, bucket);
  if (!path) return;
  await supabaseClient.storage.from(bucket).remove([path]);
}

function isSubscribed(user) {
  return Boolean(user && !user.isGuest && user.subscriptionActive);
}

function subscriptionIsActive(subscription) {
  if (!subscription || !["trial", "active"].includes(subscription.status)) return false;
  return !subscription.ends_at || new Date(subscription.ends_at).getTime() > Date.now();
}

function formatEventDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function mapDatabaseEvent(event) {
  const typeNames = { general: "Афиша", sport: "Спорт", kids: "Для детей" };
  return {
    id: event.id,
    title: event.title,
    type: typeNames[event.event_type] || "Афиша",
    sport: event.sport,
    age: event.age_limit == null ? null : `${event.age_limit}+`,
    area: event.area,
    location: event.location_name,
    mapUrl: event.map_url,
    date: formatEventDate(event.starts_at),
    text: event.description,
    request: event.request_enabled,
  };
}

function mapDatabaseExecutor(executor) {
  return {
    id: `db:${executor.user_id}`,
    databaseUserId: executor.user_id,
    name: executor.display_name,
    city: executor.city,
    area: executor.service_area || "",
    category: executor.category === "cleaning" ? "Клининг" : "Трансфер",
    title: executor.headline,
    price: executor.price_from == null ? "Цена по договоренности" : `от ${Number(executor.price_from)} $`,
    rating: Number(executor.rating || 0).toFixed(1),
    about: executor.bio,
    skills: [...(executor.tags || []), ...(executor.languages || [])],
    photoUrl: executor.photo_url || "",
    routes: Array.isArray(executor.routes) ? executor.routes : [],
  };
}

async function loadSupabaseUser(authUser) {
  const [{ data: profile, error: profileError }, { data: subscription, error: subscriptionError }] = await Promise.all([
    supabaseClient.from("profiles").select("id, display_name, role, city, search_area, avatar_url").eq("id", authUser.id).single(),
    supabaseClient
      .from("subscriptions")
      .select("status, starts_at, ends_at, auto_renew, plan_code")
      .eq("user_id", authUser.id)
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (profileError) throw profileError;
  if (subscriptionError) throw subscriptionError;
  return {
    id: profile.id,
    email: authUser.email,
    role: profile.role,
    name: profile.display_name,
    city: profile.city,
    searchArea: profile.search_area || "Marina",
    avatarUrl: profile.avatar_url || "",
    category: authUser.user_metadata?.category || "Трансфер",
    subscription,
    subscriptionActive: subscriptionIsActive(subscription),
  };
}

async function confirmEmailCallback(callback) {
  if (callback.error) {
    throw Object.assign(new Error(confirmationErrorMessage(callback)), {
      code: callback.errorCode,
    });
  }

  let authResult = null;
  if (callback.tokenHash) {
    const { data, error } = await supabaseClient.auth.verifyOtp({
      token_hash: callback.tokenHash,
      type: callback.type || "email",
    });
    if (error) throw error;
    authResult = data;
  } else if (callback.code) {
    const { data, error } = await supabaseClient.auth.exchangeCodeForSession(callback.code);
    if (error) throw error;
    authResult = data;
  } else if (callback.accessToken && callback.refreshToken) {
    const { data, error } = await supabaseClient.auth.setSession({
      access_token: callback.accessToken,
      refresh_token: callback.refreshToken,
    });
    if (error) throw error;
    authResult = data;
  }

  let authUser = authResult?.user || authResult?.session?.user;
  if (!authUser) {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    authUser = data.user;
  }
  if (!authUser || !(authUser.email_confirmed_at || authUser.confirmed_at)) {
    throw new Error("Email пока не подтвержден.");
  }

  await supabaseClient.auth.signOut({ scope: "local" });
  return authUser;
}

function toUserError(error) {
  const message = String(error?.message || error || "");
  if (/invalid login credentials/i.test(message)) {
    return "Неверный email или пароль. Проверьте данные и попробуйте ещё раз.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Email ещё не подтверждён. Откройте письмо от ХурМа и перейдите по ссылке подтверждения.";
  }
  if (/cannot coerce.*single json object|single json object/i.test(message)) {
    return "Не удалось загрузить данные аккаунта. Попробуйте войти ещё раз. Если ошибка повторится, напишите администратору.";
  }
  if (/row-level security|violates row-level security/i.test(message)) {
    return "Сообщение не отправилось из-за прав доступа. Обновите страницу и попробуйте ещё раз.";
  }
  if (/active subscription required/i.test(message)) {
    return "Для отправки личных сообщений нужна активная подписка.";
  }
  if (/cannot send message/i.test(message)) {
    return "Вы не можете отправить сообщение в этот чат. Попробуйте открыть переписку заново.";
  }
  if (/failed to fetch|network|timeout|timed out/i.test(message)) {
    return "Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.";
  }
  return "Что-то пошло не так. Попробуйте ещё раз.";
}

function Header({ user, onHome, onProfile, onLogout }) {
  return (
    <header className="topbar">
      <button className="brand brand-home" type="button" onClick={onHome} aria-label="На главную">
        <div className="brand-mark">Х</div>
        <div>
          <h1 className="brand-title">ХурМа</h1>
          <p className="brand-subtitle">сервисы для жизни в Хургаде</p>
        </div>
      </button>
      <div className="user-tools">
        {user && !user.isGuest && user.searchArea ? (
          <span className="location-pill location-pill-static">
            <span>Район поиска</span>
            <strong>{user.searchArea}</strong>
          </span>
        ) : null}
        {user ? (
          <>
            <button className="role-pill role-pill-button" type="button" onClick={onProfile} disabled={user.isGuest}>
              {user.role === "executor" ? "Исполнитель" : user.isGuest ? "Гость" : "Клиент"} · {user.name}
            </button>
            <button className="secondary" type="button" onClick={onLogout}>
              Выйти
            </button>
          </>
        ) : (
          <span className="role-pill">Supabase подключен</span>
        )}
      </div>
    </header>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-backdrop" />
      <div className="loading-card" aria-label="ХурМа загружается">
        <div className="loading-sky" aria-hidden="true">
          <div className="celestial sun" />
          <div className="celestial moon" />
        </div>
        <div className="loading-logo">ХурМа</div>
        <div className="loading-line" />
        <div className="loading-caption">Солнце Хургады и море задач</div>
      </div>
    </div>
  );
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (image.decode) {
        image.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    };
    image.onerror = resolve;
    image.src = src;
  });
}

async function preloadStartupAssets() {
  const timeout = new Promise((resolve) => setTimeout(resolve, 3500));
  const tasks = [preloadImage("assets/hurghada-hero.png")];
  if (document.fonts?.ready) tasks.push(document.fonts.ready.catch(() => {}));
  await Promise.race([Promise.all(tasks), timeout]);
}

function AuthChoice({ onLogin, onRegister, onGuest }) {
  return (
    <section className="auth-layout">
      <div className="intro">
        <div>
          <h1>
            <span className="hero-brand-word">ХурМа</span> для солнечной Хургады
          </h1>
          <p>Выберите сервис, найдите исполнителя, посмотрите афишу и начните общение после регистрации.</p>
        </div>
        <div className="intro-stats">
          <div className="stat">
            <strong>3 сервиса</strong>
            <span>трансфер, клининг и афиша рядом</span>
          </div>
          <div className="stat">
            <strong>чат</strong>
            <span>диалог с исполнителем после подписки</span>
          </div>
          <div className="stat">
            <strong>Хургада</strong>
            <span>локальные услуги для жителей и гостей</span>
          </div>
        </div>
      </div>
      <div className="panel auth-panel auth-choice-panel">
        <div className="auth-choice-actions">
          <button className="primary" type="button" data-hint="Откроется форма входа для зарегистрированных пользователей." onClick={onLogin}>
            Вход
          </button>
          <button className="primary" type="button" data-hint="Создайте аккаунт, выберите роль и район поиска." onClick={onRegister}>
            Регистрация
          </button>
          <button className="secondary" type="button" data-hint="Можно посмотреть сервисы и афишу без аккаунта. Для заявок понадобится подписка." onClick={onGuest}>
            Продолжить без регистрации
          </button>
        </div>
      </div>
    </section>
  );
}

function AuthForm({ mode, setMode, onBack, onSubmit, onResetPassword }) {
  const [role, setRole] = useState("client");
  const [city, setCity] = useState("Хургада");
  const [searchArea, setSearchArea] = useState("Marina");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  useEffect(() => {
    setSearchArea(areaOptions(city)[0]);
  }, [city]);

  useEffect(() => {
    const defaultCity = Object.keys(CITIES)[0];
    setError("");
    setInfo("");
    setPending(false);
    setRecoveryMode(false);
    setEmailValue("");
    setPasswordValue("");
    setRole("client");
    setCity(defaultCity);
    setSearchArea(areaOptions(defaultCity)[0]);
  }, [mode]);

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setInfo("");
    const form = new FormData(formElement);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "").trim();
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов.");
      return;
    }
    setPending(true);
    try {
      const result = await onSubmit({
        mode,
        role,
        name: String(form.get("name") || "Пользователь").trim(),
        email,
        password,
        city,
        searchArea: role === "executor" ? "Все" : searchArea,
        category: String(form.get("category") || "Трансфер"),
      });
      if (result && result.error) setError(result.error);
      if (result && result.info) {
        setInfo(result.info);
        if (mode === "register") {
          const defaultCity = Object.keys(CITIES)[0];
          formElement.reset();
          setEmailValue("");
          setRole("client");
          setCity(defaultCity);
          setSearchArea(areaOptions(defaultCity)[0]);
        }
      }
    } catch (submitError) {
      setError(submitError?.message || "Не удалось завершить регистрацию. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  }

  async function submitRecovery(event) {
    event.preventDefault();
    setError("");
    setInfo("");
    const email = emailValue.trim().toLowerCase();
    if (!email) {
      setError("Введите email, указанный при регистрации.");
      return;
    }
    setPending(true);
    try {
      const result = await onResetPassword(email);
      if (result.error) setError(result.error);
      if (result.info) setInfo(result.info);
    } finally {
      setPending(false);
    }
  }

  if (mode === "login" && recoveryMode) {
    return (
      <section className="auth-layout auth-layout-form">
        <div className="panel auth-panel">
          <button className="ghost auth-back-button" type="button" onClick={() => { setRecoveryMode(false); setError(""); setInfo(""); }}>
            Назад ко входу
          </button>
          <h2 className="section-title">Восстановить пароль</h2>
          <p className="section-note">Укажите email аккаунта. Мы отправим ссылку для создания нового пароля.</p>
          <form className="form" onSubmit={submitRecovery}>
            <label className="field">
              <span>Email</span>
              <input type="email" value={emailValue} onChange={(event) => setEmailValue(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
            </label>
            <div className="error">{error}</div>
            {info ? <div className="form-info">{info}</div> : null}
            <button className="primary" type="submit" disabled={pending}>
              {pending ? "Отправляем..." : "Отправить ссылку"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-layout auth-layout-form">
      <div className="panel auth-panel">
        <h2 className="section-title">{mode === "login" ? "Войти в ХурМа" : "Создать аккаунт"}</h2>
        <p className="section-note">{mode === "login" ? "Выберите роль и войдите в свой кабинет." : "Зарегистрируйтесь или посмотрите сервисы без аккаунта."}</p>
        <form className="form" onSubmit={submit} key={mode}>
          <div className="role-toggle">
            <button type="button" className={`toggle-option ${role === "client" ? "active" : ""}`} onClick={() => setRole("client")}>
              Клиент
            </button>
            <button type="button" className={`toggle-option ${role === "executor" ? "active" : ""}`} onClick={() => setRole("executor")}>
              Исполнитель
            </button>
          </div>
          {mode === "register" ? (
            <>
              <label className="field">
                <span>Имя</span>
                <input name="name" placeholder="Например, Ольга Иванова" required />
              </label>
              <label className="field">
                <span>Город</span>
                <select name="city" value={city} onChange={(event) => setCity(event.target.value)} required>
                  {Object.keys(CITIES).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              {role === "client" ? (
                <label className="field">
                  <span>Район поиска</span>
                  <select name="searchArea" value={searchArea} onChange={(event) => setSearchArea(event.target.value)} required>
                    {areaOptions(city).map((area) => (
                      <option key={area}>{area}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              {role === "executor" ? (
                <label className="field">
                  <span>Сервис</span>
                  <select name="category">
                    <option>Трансфер</option>
                    <option>Клининг</option>
                  </select>
                </label>
              ) : null}
            </>
          ) : null}
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" value={emailValue} onChange={(event) => setEmailValue(event.target.value)} placeholder="you@example.com" autoComplete={mode === "login" ? "username" : "off"} required />
          </label>
          <label className="field">
            <span>Пароль</span>
            <input name="password" type="password" value={passwordValue} onChange={(event) => setPasswordValue(event.target.value)} placeholder="Минимум 6 символов" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
          </label>
          {mode === "login" ? (
            <button className="password-recovery-link" type="button" onClick={() => { setRecoveryMode(true); setError(""); setInfo(""); }}>
              Забыли пароль?
            </button>
          ) : null}
          <div className="error">{error}</div>
          {info ? <div className="form-info">{info}</div> : null}
          {mode === "login" ? (
            <>
              <button className="primary" type="submit" disabled={pending}>
                {pending ? "Подождите..." : "Войти"}
              </button>
              <div className="auth-secondary-row">
                <button className="ghost auth-back-button" type="button" onClick={onBack}>Назад</button>
                <button className="secondary" type="button" onClick={() => onSubmit({ mode: "guest" })}>Продолжить без регистрации</button>
              </div>
            </>
          ) : (
            <>
              <div className="auth-submit-row">
                <button className="ghost auth-back-button" type="button" onClick={onBack}>Назад</button>
                <button className="primary" type="submit" disabled={pending}>
                  {pending ? "Подождите..." : "Зарегистрироваться"}
                </button>
              </div>
              <button className="secondary" type="button" onClick={() => onSubmit({ mode: "guest" })}>Продолжить без регистрации</button>
            </>
          )}
          <div className="auth-form-switch">
            <span>{mode === "login" ? "Еще нет аккаунта?" : "Уже есть аккаунт?"}</span>
            <button className="ghost auth-link-button" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function EmailConfirmationScreen({ result, onLogin, onResend }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function resend(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setPending(true);
    const response = await onResend(email);
    setPending(false);
    if (response.error) setError(response.error);
    else setMessage(response.info);
  }

  return (
    <section className="auth-layout auth-layout-form">
      <div className="panel auth-panel email-confirmation-panel">
        {result.status === "processing" ? (
          <>
            <h2 className="section-title">Подтверждаем email</h2>
            <p className="section-note">Пожалуйста, подождите несколько секунд.</p>
          </>
        ) : null}
        {result.status === "success" ? (
          <>
            <div className="confirmation-mark" aria-hidden="true">✓</div>
            <h2 className="section-title">Ваш email подтвержден</h2>
            <p className="section-note">Теперь вы можете войти в ХурМа с указанным email и паролем.</p>
            <button className="primary" type="button" onClick={onLogin}>Войти</button>
          </>
        ) : null}
        {result.status === "error" ? (
          <>
            <h2 className="section-title">Email не подтвержден</h2>
            <p className="section-note">{result.message}</p>
            <form className="form" onSubmit={resend}>
              <label className="field">
                <span>Email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
              </label>
              {error ? <div className="error">{error}</div> : null}
              {message ? <div className="form-info">{message}</div> : null}
              <button className="primary" type="submit" disabled={pending}>{pending ? "Отправляем..." : "Отправить новое письмо"}</button>
              <button className="ghost" type="button" onClick={onLogin}>Перейти ко входу</button>
            </form>
          </>
        ) : null}
      </div>
    </section>
  );
}

function PasswordRecoveryForm({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов.");
      return;
    }
    if (password !== confirmation) {
      setError("Пароли не совпадают.");
      return;
    }
    setPending(true);
    try {
      const { error: updateError } = await supabaseClient.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      await supabaseClient.auth.signOut();
      onComplete();
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="auth-layout auth-layout-form">
      <div className="panel auth-panel">
        <h2 className="section-title">Создать новый пароль</h2>
        <p className="section-note">Введите новый пароль дважды. После сохранения войдите в аккаунт с новым паролем.</p>
        <form className="form" onSubmit={submit}>
          <label className="field">
            <span>Новый пароль</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Минимум 6 символов" required />
          </label>
          <label className="field">
            <span>Повторите пароль</span>
            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Повторите новый пароль" required />
          </label>
          <div className="error">{error}</div>
          <button className="primary" type="submit" disabled={pending}>
            {pending ? "Сохраняем..." : "Сохранить новый пароль"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Nav({ view, setView }) {
  return (
    <aside className="panel sidebar">
      <nav className="nav">
        <button className={view === "services" ? "active" : ""} onClick={() => setView("services")}>
          Сервисы
        </button>
        <button className={view === "messages" ? "active" : ""} onClick={() => setView("messages")}>
          Чат
        </button>
      </nav>
    </aside>
  );
}

function ChatMenu({ onServices, onChat }) {
  return (
    <div className="section-switch chat-tabs-compact">
      <button className="section-switch-icon active" type="button" onClick={onChat} aria-label="Чаты">
        <span className="section-switch-symbol" aria-hidden="true">{SERVICE_ICONS["Чаты"]}</span>
      </button>
      <button className="section-switch-all" type="button" onClick={onServices} aria-label="Все разделы">
        Все разделы
      </button>
    </div>
  );
}

function Workspace({ user, setUser, onRequireSubscription, events, eventsLoading, eventsError, databaseExecutors, reloadExecutors }) {
  const [view, setView] = useState("services");
  const [service, setService] = useState("");
  const savedWorkspace = loadSaved();
  const savedChatByUser = savedWorkspace.chatByUser || {};
  const [chatId, setChatId] = useState("");
  const [chatFallbacks, setChatFallbacks] = useState({});
  const [profileReturnView, setProfileReturnView] = useState("services");
  const [workspaceError, setWorkspaceError] = useState("");

  function goHome() {
    setView("services");
    setService("");
    setChatId("");
  }

  function openServices() {
    setView("services");
    setService("");
    setChatId("");
  }

  function openChat() {
    setView("messages");
    setChatId("");
  }

  function openProfile() {
    if (user.isGuest) return;
    setProfileReturnView(view === "profile" ? "services" : view);
    setView("profile");
  }

  function closeProfile() {
    setView(profileReturnView);
  }

  useEffect(() => {
    const current = loadSaved();
    const nextChatByUser = { ...(current.chatByUser || {}) };
    if (chatId) nextChatByUser[user.id] = chatId;
    else delete nextChatByUser[user.id];
    saveSaved({ ...current, chatByUser: nextChatByUser });
  }, [chatId, user.id]);

  useEffect(() => {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }, [view, service]);

  async function startExecutorChat(executor) {
    setWorkspaceError("");
    if (!isSubscribed(user)) {
      onRequireSubscription();
      return;
    }
    if (executor.databaseUserId && supabaseClient) {
      const { data, error } = await supabaseClient.rpc("create_direct_conversation", {
        other_user_id: executor.databaseUserId,
      });
      if (error) {
        setWorkspaceError(error.message);
        return;
      }
      setChatFallbacks((items) => ({
        ...items,
        [data]: {
          id: data,
          title: executor.name,
          subtitle: executor.title || "Личная переписка",
          avatarUrl: executor.photoUrl || "",
          readonly: false,
          messages: [],
        },
      }));
      setChatId(`conversation:${data}`);
      setView("messages");
      return;
    }
    setChatId(`executor:${executor.id}`);
    setView("messages");
  }

  window.hurmaGoHome = goHome;
  window.hurmaOpenProfile = openProfile;

  return (
    <section className={`workspace ${view === "messages" ? "workspace-chat-focus" : ""}`}>
      <section className="content">
        {workspaceError ? <div className="panel error-state">{workspaceError}</div> : null}
        {view === "messages" ? <ChatMenu onServices={openServices} onChat={openChat} /> : null}
        {view === "services" ? <Services user={user} service={service} setService={setService} onOpenChat={openChat} onRequireSubscription={onRequireSubscription} onStartChat={startExecutorChat} events={events} eventsLoading={eventsLoading} eventsError={eventsError} databaseExecutors={databaseExecutors} /> : null}
        {view === "messages" ? <Messages chatId={chatId} setChatId={setChatId} user={user} onServices={openServices} onChat={openChat} onProfile={openProfile} externalConversationFallbacks={chatFallbacks} /> : null}
        {view === "profile" && !user.isGuest ? <Profile user={user} setUser={setUser} reloadExecutors={reloadExecutors} onBack={closeProfile} /> : null}
      </section>
    </section>
  );
}

function Services({ user, service, setService, onOpenChat, onRequireSubscription, onStartChat, events, eventsLoading, eventsError, databaseExecutors }) {
  function showAllSections(event) {
    event.currentTarget.blur();
    setService("");
  }

  if (!service) {
    return (
      <div className="service-tabs">
        {SERVICES.map((item) => (
          <button key={item} className="service-tab-card" type="button" onClick={() => setService(item)}>
            <span className="service-tab-icon" aria-hidden="true">{SERVICE_ICONS[item]}</span>
            <strong>{item}</strong>
          </button>
        ))}
        <button className="service-tab-card" type="button" onClick={onOpenChat}>
          <span className="service-tab-icon" aria-hidden="true">{SERVICE_ICONS["Чат"]}</span>
          <strong>Чат</strong>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="section-switch">
        <button className="section-switch-icon active" type="button" aria-label={service}>
          <span className="section-switch-symbol" aria-hidden="true">{SERVICE_ICONS[service]}</span>
        </button>
        <button className="section-switch-all" type="button" onClick={showAllSections} aria-label="Все разделы">
          Все разделы
        </button>
      </div>
      {service === "Афиша" ? <Afisha user={user} onRequireSubscription={onRequireSubscription} sourceEvents={events} eventsLoading={eventsLoading} eventsError={eventsError} /> : <ExecutorList service={service} user={user} onStartChat={onStartChat} databaseExecutors={databaseExecutors} />}
    </>
  );
}

function ExecutorList({ service, user, onStartChat, databaseExecutors }) {
  const [q, setQ] = useState("");
  const [filterDraft, setFilterDraft] = useState({ q: "" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const items = [...databaseExecutors, ...EXECUTORS].filter((executor) => executor.category === service && `${executor.name} ${executor.title} ${executor.area}`.toLowerCase().includes(q.toLowerCase()));
  const openFilters = () => {
    setFilterDraft({ q });
    setFiltersOpen(true);
  };
  const saveFilters = (event) => {
    event.preventDefault();
    setQ(filterDraft.q);
    setFiltersOpen(false);
  };
  return (
    <>
      <div className="panel filter-summary">
        <button className="primary filter-open-button" type="button" onClick={openFilters}>
          Фильтры{q.trim() ? " · 1" : ""}
        </button>
        <span>{items.length} исполнителей</span>
      </div>
      {filtersOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Фильтры исполнителей">
          <form className="filter-modal" onSubmit={saveFilters}>
            <div className="filter-modal-head">
              <h2>Фильтры исполнителей</h2>
              <button className="ghost" type="button" onClick={() => setFiltersOpen(false)}>×</button>
            </div>
            <div className="event-filters event-filters-dynamic">
              <input value={filterDraft.q} onChange={(event) => setFilterDraft({ q: event.target.value })} placeholder="Поиск исполнителя" />
            </div>
            <div className="filter-modal-actions">
              <button className="secondary" type="button" onClick={() => setFilterDraft({ q: "" })}>Сброс</button>
              <button className="primary" type="submit">Сохранить</button>
            </div>
          </form>
        </div>
      ) : null}
      <div className="cards-grid">
        {items.map((executor) => (
          <article className="executor-card" key={executor.id}>
            <div className="executor-photo-wrap">
              {executor.photoUrl ? <img className="executor-photo" src={executor.photoUrl} alt={`Объявление ${executor.name}`} /> : <div className="executor-photo-placeholder">{executor.name.slice(0, 1)}</div>}
              <span className="executor-rating">★ {executor.rating}</span>
            </div>
            <div className="executor-card-body">
              <div className="executor-top">
                <div>
                  <h3>{executor.name}</h3>
                  <span>{[executor.city, executor.area].filter(Boolean).join(" · ")}</span>
                </div>
              </div>
              <p className="executor-title"><strong>{executor.title}</strong></p>
              <p>{executor.about}</p>
              {executor.category === "Трансфер" && executor.routes?.length ? (
                <div className="route-list" aria-label="Популярные маршруты">
                  {executor.routes.slice(0, 4).map((route, index) => (
                    <div className="route-row" key={`${route.from}-${route.to}-${index}`}>
                      <span>{route.from} <b aria-hidden="true">→</b> {route.to}</span>
                      <strong>{Number(route.price)} $</strong>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="meta">{executor.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
              <div className="executor-footer">
                <span className="price">{executor.price}</span>
                <button className="primary" type="button" onClick={() => onStartChat(executor)}>
                  Написать
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Afisha({ user, onRequireSubscription, sourceEvents, eventsLoading, eventsError }) {
  const [filters, setFilters] = useState(DEFAULT_EVENT_FILTERS);
  const [filterDraft, setFilterDraft] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [requestedIds, setRequestedIds] = useState([]);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    if (!supabaseClient || !user || user.isGuest) return;
    let active = true;
    supabaseClient
      .from("requests")
      .select("event_id")
      .eq("client_id", user.id)
      .not("event_id", "is", null)
      .then(({ data, error }) => {
        if (!active || error) return;
        setRequestedIds(data.map((item) => item.event_id));
      });
    return () => {
      active = false;
    };
  }, [user && user.id]);

  const events = useMemo(() => {
    return sourceEvents.filter((event) => {
      const areaOk = filters.area === "Все районы" || event.area === filters.area;
      const typeOk = filters.type === "Все мероприятия" || event.type === filters.type;
      const sportOk = filters.type !== "Спорт" || filters.sport === "Все виды спорта" || event.sport === filters.sport;
      const ageOk = filters.type !== "Для детей" || filters.age === "Любой возраст" || event.age === filters.age;
      const query = `${event.title} ${event.text} ${event.location} ${event.area} ${event.sport || ""}`.toLowerCase();
      return areaOk && typeOk && sportOk && ageOk && query.includes(filters.q.toLowerCase());
    });
  }, [filters, sourceEvents]);
  const updateDraft = (key, value) => setFilterDraft((current) => ({ ...current, [key]: value }));
  const activeFilterCount = [
    filters.q.trim(),
    filters.area !== "Все районы",
    filters.type !== "Все мероприятия",
    filters.type === "Спорт" && filters.sport !== "Все виды спорта",
    filters.type === "Для детей" && filters.age !== "Любой возраст",
  ].filter(Boolean).length;
  const openFilters = () => {
    setFilterDraft(filters);
    setFiltersOpen(true);
  };
  const saveFilters = (event) => {
    event.preventDefault();
    setFilters(filterDraft);
    setFiltersOpen(false);
  };
  const requestEvent = async (eventId) => {
    setRequestError("");
    if (!isSubscribed(user)) {
      onRequireSubscription();
      return;
    }
    const { error } = await supabaseClient.from("requests").insert({
      client_id: user.id,
      event_id: eventId,
      comment: "",
      status: "new",
    });
    if (error) {
      setRequestError(error.message);
      return;
    }
    setRequestedIds((current) => current.includes(eventId) ? current : [...current, eventId]);
  };
  return (
    <>
      <div className="panel filter-summary">
        <button className="primary filter-open-button" type="button" onClick={openFilters}>
          Фильтры{activeFilterCount ? ` · ${activeFilterCount}` : ""}
        </button>
        <span>{events.length} мероприятий</span>
      </div>
      {filtersOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Фильтры афиши">
          <form className="filter-modal" onSubmit={saveFilters}>
            <div className="filter-modal-head">
              <h2>Фильтры афиши</h2>
              <button className="ghost" type="button" onClick={() => setFiltersOpen(false)}>×</button>
            </div>
            <div className="event-filters event-filters-dynamic">
              <input value={filterDraft.q} onChange={(event) => updateDraft("q", event.target.value)} placeholder="Поиск по афише" />
              <select value={filterDraft.area} onChange={(event) => updateDraft("area", event.target.value)}>
                {AREA_FILTERS.map((area) => <option key={area}>{area}</option>)}
              </select>
              <select value={filterDraft.type} onChange={(event) => updateDraft("type", event.target.value)}>
                {EVENT_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
              {filterDraft.type === "Спорт" ? (
                <select value={filterDraft.sport} onChange={(event) => updateDraft("sport", event.target.value)}>
                  {SPORTS.map((sport) => <option key={sport}>{sport}</option>)}
                </select>
              ) : null}
              {filterDraft.type === "Для детей" ? (
                <select value={filterDraft.age} onChange={(event) => updateDraft("age", event.target.value)}>
                  {AGES.map((age) => <option key={age}>{age}</option>)}
                </select>
              ) : null}
            </div>
            <div className="filter-modal-actions">
              <button className="secondary" type="button" onClick={() => setFilterDraft(DEFAULT_EVENT_FILTERS)}>Сброс</button>
              <button className="primary" type="submit">Сохранить</button>
            </div>
          </form>
        </div>
      ) : null}
      {eventsLoading ? <div className="panel empty-state">Загружаем афишу...</div> : null}
      {eventsError ? <div className="panel error-state">{eventsError}</div> : null}
      {requestError ? <div className="panel error-state">{requestError}</div> : null}
      <div className="event-grid">
        {events.map((event) => (
          <article className="event-card" key={event.id}>
            <span className="tag">{event.type}{event.sport ? ` · ${event.sport}` : ""}</span>
            <h3>{event.title}</h3>
            <p>{event.date}</p>
            <p>{event.text}</p>
            <div className="meta"><span>{event.area}</span><span>{event.location}</span></div>
            <div className="quick-actions event-actions">
              <a className="secondary" href={event.mapUrl} target="_blank" rel="noreferrer">Место проведения</a>
              {event.request ? (
                <button className="primary" type="button" disabled={requestedIds.includes(event.id)} onClick={() => requestEvent(event.id)}>
                  {requestedIds.includes(event.id) ? "Заявка отправлена" : "Оставить заявку"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Messages({ chatId, setChatId, user, onServices, onChat, onProfile, externalConversationFallbacks = {} }) {
  const [conversations, setConversations] = useState(() => (
    user && !user.isGuest ? loadChatDialogCache(user.id) : []
  ));
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [contactPicker, setContactPicker] = useState(false);
  const [manualForm, setManualForm] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualContacts, setManualContacts] = useState(() => loadSaved().manualContacts || []);
  const [conversationFallbacks, setConversationFallbacks] = useState({});
  const [chatError, setChatError] = useState("");
  const [chatInfo, setChatInfo] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const messageLoadRef = useRef(0);
  const conversationsLoadedRef = useRef(conversations.length > 0);
  const messagesListRef = useRef(null);
  const messagesEndRef = useRef(null);
  const instantScrollRef = useRef(false);
  const messagesConversationRef = useRef("");
  const selectedAttachmentRef = useRef(null);
  const activeConversationId = chatId.startsWith("conversation:") ? chatId.replace("conversation:", "") : "";
  const executorId = chatId.startsWith("executor:") ? chatId.replace("executor:", "") : "";
  const executor = EXECUTORS.find((item) => item.id === executorId);
  const executorChat = executor ? {
    id: chatId,
    title: executor.name,
    subtitle: executor.title,
    readonly: false,
    messages: [
      { from: executor.name, text: "Здравствуйте! Напишите, что нужно сделать и на какое время.", time: "сейчас", me: false },
    ],
  } : null;
  const activeDatabaseChat = conversations.find((item) => item.id === activeConversationId);
  const activeManualChat = manualContacts.find((item) => item.id === chatId);
  const chat = activeDatabaseChat || activeManualChat || executorChat || COMMUNITY_CHATS.find((item) => item.id === chatId);
  const canUseDatabaseChat = Boolean(supabaseClient && user && !user.isGuest);
  const attachmentBucket = "chat-attachments";

  function safeFileName(fileName) {
    const name = String(fileName || "file").trim().replace(/[^\w.\-а-яА-ЯёЁ]+/g, "-");
    return name.replace(/-+/g, "-").replace(/^-|-$/g, "") || "file";
  }

  function formatFileSize(size) {
    const bytes = Number(size || 0);
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} МБ`;
  }

  function setPickedAttachment(nextAttachment) {
    const previousAttachment = selectedAttachmentRef.current;
    if (previousAttachment?.previewUrl) URL.revokeObjectURL(previousAttachment.previewUrl);
    selectedAttachmentRef.current = nextAttachment;
    setSelectedAttachment(nextAttachment);
  }

  function clearSelectedAttachment() {
    setPickedAttachment(null);
    setChatInfo("");
  }

  async function getAttachmentPreviewUrl(message) {
    if (!message?.attachment_path) return "";
    const { data, error } = await supabaseClient.storage
      .from(attachmentBucket)
      .createSignedUrl(message.attachment_path, 60 * 60);
    if (!error && data?.signedUrl) return data.signedUrl;

    const type = String(message.attachment_type || "");
    if (!type.startsWith("image/") && !type.startsWith("video/")) return "";

    const { data: blob, error: downloadError } = await supabaseClient.storage
      .from(attachmentBucket)
      .download(message.attachment_path);
    if (downloadError || !blob) return "";

    return URL.createObjectURL(blob);
  }

  async function withSignedAttachmentUrls(rows) {
    const messagesWithFiles = (rows || []).filter((message) => message.attachment_path);
    if (!messagesWithFiles.length) return rows || [];
    const signedUrls = await Promise.all(messagesWithFiles.map(async (message) => {
      return [message.attachment_path, await getAttachmentPreviewUrl(message)];
    }));
    const signedByPath = Object.fromEntries(signedUrls);
    return (rows || []).map((message) => (
      message.attachment_path
        ? { ...message, signed_url: signedByPath[message.attachment_path] || "" }
        : message
    ));
  }

  async function loadMessagesFromTables(conversationId) {
    const { data, error } = await supabaseClient
      .from("messages")
      .select("id, sender_id, body, attachment_path, attachment_name, attachment_type, attachment_size, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function normalizeMessageRows(rows) {
    const signedMessages = await withSignedAttachmentUrls(rows || []);
    return signedMessages.map((message) => normalizeChatMessage(message, user.id));
  }

  function scrollMessagesToLatest(instant = false) {
    const list = messagesListRef.current;
    if (!list) return;
    const previousBehavior = list.style.scrollBehavior;
    if (instant) list.style.scrollBehavior = "auto";
    list.scrollTop = list.scrollHeight;
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: instant ? "auto" : "smooth" });
    if (instant) {
      window.requestAnimationFrame(() => {
        list.scrollTop = list.scrollHeight;
        messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
        list.style.scrollBehavior = previousBehavior;
      });
    }
  }

  function settleMessagesAtBottom() {
    scrollMessagesToLatest(true);
    [50, 140, 320, 700].forEach((delay) => {
      window.setTimeout(() => scrollMessagesToLatest(true), delay);
    });
  }

  async function loadConversationsFromTables() {
    const { data, error } = await withTimeout(
      supabaseClient
        .from("conversation_members")
        .select("conversation_id, last_read_at, conversations(id, conversation_type, title, subtitle, is_readonly, updated_at)")
        .eq("user_id", user.id),
      CHAT_LOAD_TIMEOUT_MS,
      "Чаты загружаются слишком долго. Показываем доступные чаты, попробуйте обновить позже."
    );
    if (error) throw error;
    const conversationIds = (data || []).map((item) => item.conversation_id).filter(Boolean);
    if (!conversationIds.length) return [];

    const [membersResult, messagesResult] = await withTimeout(
      Promise.all([
        supabaseClient
          .from("conversation_members")
          .select("conversation_id, user_id, profiles(id, display_name, role, city, search_area, avatar_url)")
          .in("conversation_id", conversationIds),
        supabaseClient
          .from("messages")
          .select("id, conversation_id, sender_id, body, attachment_name, created_at")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false }),
      ]),
      CHAT_LOAD_TIMEOUT_MS,
      "Чаты загружаются слишком долго. Показываем доступные чаты, попробуйте обновить позже."
    );
    if (membersResult.error) throw membersResult.error;
    if (messagesResult.error) throw messagesResult.error;

    const memberRows = membersResult.data || [];
    const messageRows = messagesResult.data || [];
    return data.map((item) => {
      const conversation = item.conversations;
      const members = memberRows.filter((member) => member.conversation_id === item.conversation_id);
      const otherMember = members.find((member) => member.user_id !== user.id);
      const profile = otherMember?.profiles;
      const conversationMessages = messageRows.filter((message) => message.conversation_id === item.conversation_id);
      const lastMessage = conversationMessages[0];
      const lastReadTime = item.last_read_at ? new Date(item.last_read_at).getTime() : 0;
      const previewText = lastMessage?.body || (lastMessage?.attachment_name ? `Файл: ${lastMessage.attachment_name}` : "Сообщений пока нет");
      const unreadCount = conversationMessages.filter((message) => {
        const createdAt = new Date(message.created_at).getTime();
        return message.sender_id !== user.id && (!lastReadTime || createdAt > lastReadTime);
      }).length;
      const isDirect = conversation.conversation_type === "direct";
      return {
        id: conversation.id,
        title: isDirect ? (profile?.display_name || conversation.title || "Собеседник") : (conversation.title || "Чат ХурМа"),
        subtitle: isDirect ? [profile?.role === "executor" ? "Исполнитель" : "Клиент", profile?.city, profile?.search_area].filter(Boolean).join(" · ") : (conversation.subtitle || "Групповой чат"),
        avatarUrl: isDirect ? (profile?.avatar_url || "") : "",
        readonly: conversation.is_readonly,
        preview: previewText,
        time: lastMessage ? formatEventDate(lastMessage.created_at) : "",
        unreadCount,
        hasMessages: Boolean(lastMessage),
        lastMessageAt: lastMessage?.created_at || conversation.updated_at,
      };
    }).sort((first, second) => new Date(second.lastMessageAt || 0) - new Date(first.lastMessageAt || 0));
  }

  async function loadConversations() {
    if (!canUseDatabaseChat) {
      setConversations([]);
      return;
    }
    const showLoading = !conversationsLoadedRef.current;
    if (showLoading) setLoadingChats(true);
    try {
      const { data: rpcDialogs, error: rpcError } = await withTimeout(
        supabaseClient.rpc("list_my_conversations"),
        CHAT_LOAD_TIMEOUT_MS,
        "Чаты загружаются слишком долго. Показываем доступные чаты, попробуйте обновить позже."
      );
      if (!rpcError && Array.isArray(rpcDialogs) && rpcDialogs.length) {
        const mappedDialogs = rpcDialogs.map((item) => ({
          id: item.conversation_id,
          title: item.title || "Чат",
          subtitle: item.subtitle || "Личная переписка",
          avatarUrl: item.avatar_url || "",
          readonly: item.is_readonly,
          preview: item.last_message_body || "Сообщений пока нет",
          time: item.last_message_at ? formatEventDate(item.last_message_at) : "",
          unreadCount: Number(item.unread_count || 0),
          hasMessages: Boolean(item.last_message_body),
          lastMessageAt: item.last_message_at || item.updated_at,
        }));
        setConversations(mappedDialogs);
        conversationsLoadedRef.current = true;
        saveChatDialogCache(user.id, mappedDialogs);
        return;
      }

      const mapped = await loadConversationsFromTables();
      setConversations(mapped);
      conversationsLoadedRef.current = true;
      saveChatDialogCache(user.id, mapped);
    } catch (error) {
      if (!conversationsLoadedRef.current) setConversations([]);
      setChatError(toUserError(error));
    } finally {
      if (showLoading) setLoadingChats(false);
    }
  }

  async function loadContacts() {
    if (!canUseDatabaseChat) return;
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id, display_name, role, city, search_area, avatar_url")
      .neq("id", user.id)
      .order("display_name");
    if (error) {
      setChatError(error.message);
      return;
    }
    setContacts(data.map(normalizeContact));
  }

  async function markConversationRead(conversationId) {
    if (!conversationId || !canUseDatabaseChat) return;
    const { error } = await supabaseClient.rpc("mark_conversation_read", {
      target_conversation_id: conversationId,
    });
    if (error) return;
    setConversations((items) => items.map((item) => (
      item.id === conversationId ? { ...item, unreadCount: 0 } : item
    )));
  }

  async function loadMessages(conversationId) {
    if (!conversationId || !canUseDatabaseChat) return;
    const loadId = messageLoadRef.current + 1;
    messageLoadRef.current = loadId;
    const { data, error } = await supabaseClient.rpc("get_chat_messages", {
      target_conversation_id: conversationId,
    });
    if (loadId !== messageLoadRef.current) return;
    if (error) {
      setChatError(error.message);
      return;
    }
    let rows = data || [];
    const hasPossibleStaleAttachmentRow = rows.some((message) => (
      !String(message.body || "").trim()
      && !message.attachment_path
    ));
    if (hasPossibleStaleAttachmentRow) {
      rows = await loadMessagesFromTables(conversationId);
    }
    const normalizedRows = await normalizeMessageRows(rows);
    if (loadId !== messageLoadRef.current) return;
    messagesConversationRef.current = conversationId;
    setMessages(normalizedRows);
    if (rows.length) markConversationRead(conversationId);
  }

  useEffect(() => {
    loadConversations();
    loadContacts();
    if (!canUseDatabaseChat) return undefined;
    const refreshId = window.setInterval(loadConversations, CHAT_REFRESH_MS);
    return () => window.clearInterval(refreshId);
  }, [user && user.id]);

  useEffect(() => {
    setChatError("");
    setChatInfo("");
    setDraft("");
    clearSelectedAttachment();
    instantScrollRef.current = Boolean(activeConversationId);
    if (activeConversationId) loadMessages(activeConversationId);
    else {
      messagesConversationRef.current = "";
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    const instant = Boolean(
      instantScrollRef.current
      && activeConversationId
      && messagesConversationRef.current === activeConversationId
      && messages.length
    );
    if (instant) instantScrollRef.current = false;
    const scrollToLatest = () => scrollMessagesToLatest(instant);
    window.requestAnimationFrame(scrollToLatest);
    window.setTimeout(scrollToLatest, instant ? 80 : 120);
    if (instant) settleMessagesAtBottom();
  }, [chatId, messages.length]);

  useEffect(() => {
    if (!activeConversationId || !canUseDatabaseChat) return undefined;
    const refreshId = window.setInterval(() => loadMessages(activeConversationId), 3000);
    return () => window.clearInterval(refreshId);
  }, [activeConversationId, canUseDatabaseChat]);

  useEffect(() => {
    if (!activeConversationId || loadingChats) return;
    const hasDialog = conversations.some((item) => item.id === activeConversationId);
    const hasFallback = conversationFallbacks[activeConversationId] || externalConversationFallbacks[activeConversationId];
    if (!hasDialog && !hasFallback) {
      setChatId("");
    }
  }, [activeConversationId, loadingChats, conversations, conversationFallbacks, externalConversationFallbacks]);

  async function startContactChat(contact) {
    setChatError("");
    setChatInfo("");
    if (!contact.canMessage) {
      setChatId(contact.id);
      setContactPicker(false);
      setChatInfo("Этот контакт пока не зарегистрирован в ХурМа. Можно сохранить его и пригласить позже.");
      return;
    }
    if (!isSubscribed(user)) {
      setChatError("Для личных сообщений нужна активная подписка.");
      return;
    }
    const { data, error } = await supabaseClient.rpc("create_direct_conversation", {
      other_user_id: contact.id,
    });
    if (error) {
      setChatError(toUserError(error));
      return;
    }
    setConversationFallbacks((items) => ({
      ...items,
      [data]: {
        id: data,
        title: contact.title,
        subtitle: contact.subtitle || "Личная переписка",
        avatarUrl: contact.avatarUrl || "",
        readonly: false,
        messages: [],
      },
    }));
    await loadConversations();
    setContactPicker(false);
    setChatId(`conversation:${data}`);
  }

  function saveManualContact(event) {
    event.preventDefault();
    const contact = buildManualContact(manualName, manualPhone);
    const nextContacts = [contact, ...manualContacts];
    setManualContacts(nextContacts);
    saveSaved({ ...loadSaved(), manualContacts: nextContacts });
    setManualName("");
    setManualPhone("");
    setManualForm(false);
    startContactChat(contact);
  }

  async function importPhoneContact() {
    setChatError("");
    if (navigator.contacts && navigator.contacts.select) {
      try {
        const selected = await navigator.contacts.select(["name", "tel"], { multiple: false });
        const first = selected && selected[0];
        if (first) {
          const contact = buildManualContact(first.name?.[0] || "Контакт", first.tel?.[0] || "");
          const nextContacts = [contact, ...manualContacts];
          setManualContacts(nextContacts);
          saveSaved({ ...loadSaved(), manualContacts: nextContacts });
          startContactChat(contact);
          return;
        }
      } catch (error) {
        setChatError("Не удалось открыть контакты телефона. Можно добавить контакт вручную.");
      }
    }
    setManualForm(true);
    setChatInfo("Браузер не дал доступ к телефонной книге. Добавьте контакт вручную.");
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    const pendingAttachment = selectedAttachmentRef.current;
    if ((!text && !pendingAttachment) || sendingMessage || uploadingAttachment) return;
    if (!activeConversationId) {
      setChatError("Этот чат пока не подключён к базе. Выберите зарегистрированного пользователя через плюс.");
      return;
    }
    if (!isSubscribed(user)) {
      setChatError("Для отправки личных сообщений нужна активная подписка.");
      return;
    }
    setSendingMessage(true);
    setUploadingAttachment(Boolean(pendingAttachment));
    setChatError("");
    try {
      if (pendingAttachment) {
        setChatInfo("Отправляем файл...");
        const file = pendingAttachment.file;
        const storagePath = `${user.id}/${activeConversationId}/${Date.now()}-${safeFileName(file.name)}`;
        const { error: uploadError } = await supabaseClient.storage
          .from(attachmentBucket)
          .upload(storagePath, file, {
            cacheControl: "3600",
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });
        if (uploadError) {
          setChatError(toUserError(uploadError));
          return;
        }

        const { data, error } = await supabaseClient.rpc("send_chat_message_with_attachment", {
          target_conversation_id: activeConversationId,
          message_body: text,
          p_attachment_path: storagePath,
          p_attachment_name: file.name,
          p_attachment_type: file.type || "application/octet-stream",
          p_attachment_size: file.size,
        });
        if (error) {
          setChatError(toUserError(error));
          await supabaseClient.storage.from(attachmentBucket).remove([storagePath]);
          return;
        }

        const signedMessages = await withSignedAttachmentUrls([data]);
        messageLoadRef.current += 1;
        setDraft("");
        clearSelectedAttachment();
        setMessages((items) => upsertChatMessage(items, normalizeChatMessage(signedMessages[0], user.id, text)));
        setChatInfo("");
        await loadConversations();
        return;
      }

      const { data, error } = await supabaseClient.rpc("send_chat_message", {
        target_conversation_id: activeConversationId,
        message_body: text,
      });
      if (error) {
        setChatError(toUserError(error));
        return;
      }
      const sentMessage = data && typeof data === "object"
        ? data
        : {
            id: data || `local:${Date.now()}`,
            sender_id: user.id,
            body: text,
            created_at: new Date().toISOString(),
          };
      messageLoadRef.current += 1;
      setDraft("");
      setMessages((items) => upsertChatMessage(items, normalizeChatMessage(sentMessage, user.id, text)));
      if (!data || typeof data !== "object") {
        const messageId = sentMessage.id && String(sentMessage.id).startsWith("local:") ? null : sentMessage.id;
        if (messageId) {
          const { data: savedMessage, error: verifyError } = await supabaseClient
            .from("messages")
            .select("id, sender_id, body, attachment_path, attachment_name, attachment_type, attachment_size, created_at")
            .eq("id", messageId)
            .maybeSingle();
          if (savedMessage) {
            setMessages((items) => upsertChatMessage(items, normalizeChatMessage(savedMessage, user.id, text)));
          } else if (verifyError) {
            setChatError(toUserError(verifyError));
          } else {
            setChatInfo("Сообщение отправлено, но база пока не вернула его при проверке. Обновите SQL-функцию чата в Supabase.");
          }
        }
      }
      await loadConversations();
    } catch (error) {
      setChatError(toUserError(error));
    } finally {
      setSendingMessage(false);
      setUploadingAttachment(false);
    }
  }

  function submitDraftFromKeyboard(event) {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  async function chooseAttachment(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!activeConversationId) {
      setChatError("Файл можно отправить только в активном чате с зарегистрированным пользователем.");
      return;
    }
    if (!isSubscribed(user)) {
      setChatError("Для отправки файлов нужна активная подписка.");
      return;
    }
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setChatError("Файл слишком большой. Сейчас можно отправлять файлы до 25 МБ.");
      return;
    }
    setChatError("");
    setChatInfo("Файл прикреплён. Можно добавить подпись и нажать отправить.");
    const type = file.type || "application/octet-stream";
    const previewUrl = type.startsWith("image/") || type.startsWith("video/")
      ? URL.createObjectURL(file)
      : "";
    setPickedAttachment({
      file,
      name: file.name,
      type,
      size: file.size,
      previewUrl,
    });
  }

  const databaseDialogs = conversations.map((item) => ({ ...item, chatId: `conversation:${item.id}` }));
  const manualDialogs = manualContacts.map((item) => ({ ...item, chatId: item.id, preview: item.subtitle, readonly: true }));
  const staticDialogs = COMMUNITY_CHATS.map((item) => ({ ...item, chatId: item.id, preview: item.subtitle }));
  const dialogs = [...databaseDialogs, ...manualDialogs, ...staticDialogs];
  const visibleContacts = contacts.filter((contact) => {
    const query = `${contact.title} ${contact.subtitle}`.toLowerCase();
    return query.includes(contactSearch.toLowerCase());
  });
  const visibleMessages = activeConversationId ? messages : (chat?.messages || []);
  const renderedChat = chat || (activeConversationId
    ? (conversationFallbacks[activeConversationId] || externalConversationFallbacks[activeConversationId] || { title: "Чат", subtitle: "Личная переписка", readonly: false, messages: [] })
    : { title: "Чат ХурМа", subtitle: "Загружаем переписку", readonly: true, messages: [] });
  const canSendInCurrentChat = Boolean(activeConversationId && !renderedChat.readonly && !activeManualChat && canUseDatabaseChat);
  const readonlyText = activeManualChat
    ? "Этот контакт сохранён локально. Когда он зарегистрируется в ХурМа, можно будет начать переписку."
    : renderedChat.readonly
      ? "Это новостной канал. Сообщения публикуются как объявления."
      : "Это демо-чат. Для настоящей переписки выберите зарегистрированного пользователя через плюс.";
  const emptyText = canSendInCurrentChat
    ? "Напишите первым."
    : activeManualChat
      ? "Это сохранённый телефонный контакт. Выберите зарегистрированного пользователя через плюс, чтобы начать переписку."
      : "Для переписки выберите зарегистрированного пользователя через плюс.";

  if (!chatId) {
    return (
      <div className="wa-shell wa-list-only">
        <div className="wa-sidebar wa-sidebar-full">
          <div className="wa-sidebar-head">
            <div className="wa-head-spacer" />
            {!user.isGuest ? <button className="wa-icon-button" type="button" onClick={() => setContactPicker(true)} aria-label="Добавить собеседника">+</button> : null}
          </div>
          <div className="wa-search">Поиск или новый чат</div>
          {chatError ? <div className="wa-notice error">{chatError}</div> : null}
          {loadingChats ? <div className="wa-notice">Загружаем чаты...</div> : null}
          <div className="wa-dialogs">
            {dialogs.map((item) => (
              <button className="wa-dialog" key={item.chatId} type="button" onClick={() => {
                if (item.chatId.startsWith("conversation:")) {
                  setConversationFallbacks((items) => ({ ...items, [item.id]: item }));
                }
                setChatId(item.chatId);
              }}>
                <div className={`wa-avatar ${item.avatarUrl ? "has-image" : ""}`} style={item.avatarUrl ? { "--avatar-image": `url("${item.avatarUrl}")` } : undefined}>{item.avatarUrl ? "" : item.title.slice(0, 1)}</div>
                <div className="wa-dialog-main">
                  <div className="wa-dialog-row">
                    <strong>{item.title}</strong>
                    <span className="wa-dialog-meta">
                      {item.time ? <small>{item.time}</small> : null}
                      {item.unreadCount ? <span className="wa-unread">{item.unreadCount > 99 ? "99+" : item.unreadCount}</span> : null}
                    </span>
                  </div>
                  <span className="wa-dialog-preview">{item.preview || item.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
          {contactPicker ? (
            <div className="modal-backdrop contact-modal-backdrop" role="dialog" aria-modal="true" aria-label="Добавить собеседника">
              <div className="contact-panel">
              <div className="contact-panel-head">
                <strong>Добавить собеседника</strong>
                <button type="button" onClick={() => setContactPicker(false)}>×</button>
              </div>
              <input value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} placeholder="Поиск контакта" />
              <div className="wa-notice">Для переписки выберите зарегистрированного пользователя из списка ниже. Телефонный контакт можно только сохранить как приглашение.</div>
              <div className="quick-actions contact-actions">
                <button className="secondary" type="button" onClick={() => setManualForm(true)}>Сохранить телефонный контакт</button>
                <button className="secondary" type="button" onClick={importPhoneContact}>Из контактов телефона</button>
              </div>
              {manualForm ? (
                <form className="manual-contact-form" onSubmit={saveManualContact}>
                  <input value={manualName} onChange={(event) => setManualName(event.target.value)} placeholder="Имя незарегистрированного контакта" />
                  <input value={manualPhone} onChange={(event) => setManualPhone(event.target.value)} placeholder="Телефон или WhatsApp" />
                  <button className="primary" type="submit">Сохранить контакт</button>
                </form>
              ) : null}
              <div className="contact-list">
                {visibleContacts.map((contact) => (
                  <button className="wa-dialog compact" key={contact.id} type="button" onClick={() => startContactChat(contact)}>
                    <div className={`wa-avatar ${contact.avatarUrl ? "has-image" : ""}`} style={contact.avatarUrl ? { "--avatar-image": `url("${contact.avatarUrl}")` } : undefined}>{contact.avatarUrl ? "" : contact.title.slice(0, 1)}</div>
                    <div className="wa-dialog-main">
                      <strong>{contact.title}</strong>
                      <span className="wa-dialog-preview">{contact.subtitle}</span>
                    </div>
                  </button>
                ))}
              </div>
              </div>
            </div>
          ) : null}
          {!user.isGuest && !contactPicker ? <button className="wa-floating-add" type="button" onClick={() => setContactPicker(true)} aria-label="Добавить собеседника"></button> : null}
        </div>
      </div>
    );
  }
  return (
    <div className="wa-shell wa-chat-only">
      <section className="wa-chat">
        <div className="wa-chat-head">
          <button className="wa-mobile-back" type="button" onClick={() => setChatId("")}>←</button>
          <div className={`wa-avatar ${renderedChat.avatarUrl ? "has-image" : ""}`} style={renderedChat.avatarUrl ? { "--avatar-image": `url("${renderedChat.avatarUrl}")` } : undefined}>{renderedChat.avatarUrl ? "" : renderedChat.title.slice(0, 1)}</div>
          <div className="wa-chat-title">
            <strong>{renderedChat.title}</strong>
            <span>{renderedChat.subtitle}</span>
          </div>
        </div>
        <div className="wa-messages" ref={messagesListRef}>
          {chatInfo ? <div className="wa-notice">{chatInfo}</div> : null}
          {chatError ? <div className="wa-notice error">{chatError}</div> : null}
          {visibleMessages.length ? visibleMessages.map((message, index) => (
            <div className={`wa-bubble ${message.me ? "mine" : ""}`} key={message.id || index}>
              {message.text ? <span>{message.text}</span> : null}
              {message.attachment ? (
                <div className="wa-attachment">
                  {message.attachment.type.startsWith("image/") && message.attachment.url ? (
                    <a className="wa-attachment-preview" href={message.attachment.url} target="_blank" rel="noreferrer">
                      <img className="wa-attachment-image" src={message.attachment.url} alt={message.attachment.name} onLoad={settleMessagesAtBottom} />
                    </a>
                  ) : message.attachment.type.startsWith("video/") && message.attachment.url ? (
                    <video className="wa-attachment-video" src={message.attachment.url} controls onLoadedMetadata={settleMessagesAtBottom} />
                  ) : (
                    <span className="wa-attachment-file">
                      <span className="wa-attachment-mark">📎</span>
                      <span>
                        <span className="wa-attachment-name">{message.attachment.name}</span>
                        <span className="wa-attachment-size">{formatFileSize(message.attachment.size)}</span>
                      </span>
                    </span>
                  )}
                  {message.attachment.url ? (
                    <a className="wa-attachment-download" href={message.attachment.url} target="_blank" rel="noreferrer" download={message.attachment.name}>Скачать</a>
                  ) : null}
                </div>
              ) : null}
              {!message.text && !message.attachment ? <span className="wa-missing-message">Вложение обновляется...</span> : null}
              <small>{message.time}</small>
            </div>
          )) : <div className="wa-empty"><strong>Сообщений пока нет</strong><span>{emptyText}</span></div>}
          <div className="wa-message-end" ref={messagesEndRef} aria-hidden="true" />
        </div>
        {canSendInCurrentChat ? <form className={`wa-input ${selectedAttachment ? "has-attachment" : ""}`} onSubmit={sendMessage}>
          {selectedAttachment ? (
            <div className="wa-selected-attachment">
              {selectedAttachment.type.startsWith("image/") && selectedAttachment.previewUrl ? (
                <img src={selectedAttachment.previewUrl} alt={selectedAttachment.name} />
              ) : selectedAttachment.type.startsWith("video/") && selectedAttachment.previewUrl ? (
                <video src={selectedAttachment.previewUrl} muted />
              ) : (
                <span className="wa-selected-file-icon">📎</span>
              )}
              <span>
                <strong>{selectedAttachment.name}</strong>
                <small>{formatFileSize(selectedAttachment.size)}</small>
              </span>
              <button type="button" onClick={clearSelectedAttachment} aria-label="Убрать файл">×</button>
            </div>
          ) : null}
          <button className="wa-attach-button" type="button" disabled={uploadingAttachment || sendingMessage} onClick={() => document.getElementById("chat-file-input")?.click()} aria-label="Добавить файл" title="Добавить файл">
            <span className="wa-attach-glyph" aria-hidden="true">📎</span>
            <svg className="wa-attach-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21.4 11.1 12 20.5a6 6 0 0 1-8.5-8.5l9.4-9.4a4 4 0 0 1 5.7 5.7l-9.4 9.4a2 2 0 0 1-2.8-2.8l8.8-8.8" />
            </svg>
          </button>
          <input id="chat-file-input" className="wa-file-input" type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={chooseAttachment} />
          <textarea value={draft} disabled={uploadingAttachment || sendingMessage} onChange={(event) => setDraft(event.target.value)} onKeyDown={submitDraftFromKeyboard} placeholder={selectedAttachment ? "Добавьте подпись..." : uploadingAttachment ? "Загружаем файл..." : "Напишите сообщение..."} />
          <button className="wa-send-button" type="submit" disabled={uploadingAttachment || sendingMessage || (!draft.trim() && !selectedAttachment)} aria-label="Отправить сообщение">↑</button>
        </form> : <div className="wa-readonly">{readonlyText}</div>}
      </section>
    </div>
  );
}

function Profile({ user, setUser, reloadExecutors, onBack }) {
  const [draft, setDraft] = useState(user);
  const [locked, setLocked] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [executorDraft, setExecutorDraft] = useState({
    category: user.category || "Трансфер",
    headline: "",
    bio: "",
    serviceArea: user.searchArea || "Marina",
    priceFrom: "",
    languages: "Русский",
    tags: "",
    photoUrl: "",
    routes: [{ from: "", to: "", price: "" }],
    isPublished: false,
  });
  const [executorLoading, setExecutorLoading] = useState(user.role === "executor");
  const [executorMessage, setExecutorMessage] = useState("");
  const [executorError, setExecutorError] = useState("");
  const [publishingExecutor, setPublishingExecutor] = useState(false);
  const [servicePhotoFile, setServicePhotoFile] = useState(null);
  const areas = areaOptions(draft.city);
  const avatarPreview = useMemo(() => avatarFile ? URL.createObjectURL(avatarFile) : (draft.avatarUrl || ""), [avatarFile, draft.avatarUrl]);
  const servicePhotoPreview = useMemo(() => servicePhotoFile ? URL.createObjectURL(servicePhotoFile) : executorDraft.photoUrl, [servicePhotoFile, executorDraft.photoUrl]);

  useEffect(() => () => {
    if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  useEffect(() => () => {
    if (servicePhotoPreview.startsWith("blob:")) URL.revokeObjectURL(servicePhotoPreview);
  }, [servicePhotoPreview]);

  useEffect(() => {
    if (user.role !== "executor") return;
    let active = true;
    supabaseClient
      .from("executor_profiles")
      .select("category, headline, bio, service_area, price_from, languages, tags, photo_url, routes, is_published")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setExecutorError(error.message);
        } else if (data) {
          setExecutorDraft({
            category: data.category === "cleaning" ? "Клининг" : "Трансфер",
            headline: data.headline,
            bio: data.bio,
            serviceArea: data.service_area || user.searchArea || "Marina",
            priceFrom: data.price_from == null ? "" : String(data.price_from),
            languages: (data.languages || []).join(", "),
            tags: (data.tags || []).join(", "),
            photoUrl: data.photo_url || "",
            routes: Array.isArray(data.routes) && data.routes.length
              ? data.routes.map((route) => ({ from: route.from || "", to: route.to || "", price: String(route.price ?? "") }))
              : [{ from: "", to: "", price: "" }],
            isPublished: data.is_published,
          });
        }
        setExecutorLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.id, user.role]);

  function change(key, value) {
    setLocked(false);
    setProfileError("");
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === "city") next.searchArea = areaOptions(value)[0];
      return next;
    });
  }

  function chooseAvatar(event) {
    const file = event.target.files?.[0];
    const error = imageFileError(file, 5);
    setProfileError(error);
    if (error) {
      event.target.value = "";
      return;
    }
    setAvatarFile(file);
    setLocked(false);
  }

  async function save(event) {
    event.preventDefault();
    setProfileError("");
    setSavingProfile(true);
    let uploaded = null;
    try {
      if (avatarFile) uploaded = await uploadPublicImage(PROFILE_AVATAR_BUCKET, user.id, avatarFile, "avatar");
      const nextAvatarUrl = uploaded?.url || draft.avatarUrl || "";
      const { error } = await supabaseClient.from("profiles").update({
        display_name: draft.name,
        city: draft.city,
        search_area: draft.searchArea,
        avatar_url: nextAvatarUrl || null,
      }).eq("id", user.id);
      if (error) throw error;
      if (uploaded && draft.avatarUrl && draft.avatarUrl !== nextAvatarUrl) {
        await removePublicImage(PROFILE_AVATAR_BUCKET, draft.avatarUrl);
      }
      const nextUser = { ...draft, avatarUrl: nextAvatarUrl };
      setDraft(nextUser);
      setUser(nextUser);
      setAvatarFile(null);
      setLocked(true);
    } catch (error) {
      if (uploaded?.url) await removePublicImage(PROFILE_AVATAR_BUCKET, uploaded.url);
      setProfileError(toUserError(error));
    } finally {
      setSavingProfile(false);
    }
  }

  function changeExecutor(key, value) {
    setExecutorMessage("");
    setExecutorError("");
    setExecutorDraft((current) => ({ ...current, [key]: value }));
  }

  function chooseServicePhoto(event) {
    const file = event.target.files?.[0];
    const error = imageFileError(file, 8);
    setExecutorError(error);
    if (error) {
      event.target.value = "";
      return;
    }
    setServicePhotoFile(file);
  }

  function changeRoute(index, key, value) {
    setExecutorError("");
    setExecutorDraft((current) => ({
      ...current,
      routes: current.routes.map((route, routeIndex) => routeIndex === index ? { ...route, [key]: value } : route),
    }));
  }

  function addRoute() {
    setExecutorDraft((current) => ({ ...current, routes: [...current.routes, { from: "", to: "", price: "" }] }));
  }

  function removeRoute(index) {
    setExecutorDraft((current) => ({
      ...current,
      routes: current.routes.length === 1 ? [{ from: "", to: "", price: "" }] : current.routes.filter((_, routeIndex) => routeIndex !== index),
    }));
  }

  async function publishExecutor(event) {
    event.preventDefault();
    setExecutorMessage("");
    setExecutorError("");
    if (!executorDraft.headline.trim() || !executorDraft.bio.trim()) {
      setExecutorError("Заполните заголовок и описание объявления.");
      return;
    }
    if (!executorDraft.photoUrl && !servicePhotoFile) {
      setExecutorError("Добавьте фотографию объявления. Без неё публикация недоступна.");
      return;
    }
    const isTransfer = executorDraft.category === "Трансфер";
    const activeRoutes = executorDraft.routes.filter((route) => route.from.trim() || route.to.trim() || String(route.price).trim());
    if (isTransfer && (!activeRoutes.length || activeRoutes.some((route) => !route.from.trim() || !route.to.trim() || Number(route.price) <= 0))) {
      setExecutorError("Добавьте хотя бы один маршрут: откуда, куда и цена больше нуля.");
      return;
    }
    const splitList = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);
    const routes = isTransfer
      ? activeRoutes.map((route) => ({ from: route.from.trim(), to: route.to.trim(), price: Number(route.price) }))
      : [];
    let uploaded = null;
    setPublishingExecutor(true);
    try {
      if (servicePhotoFile) uploaded = await uploadPublicImage(SERVICE_IMAGE_BUCKET, user.id, servicePhotoFile, "service");
      const nextPhotoUrl = uploaded?.url || executorDraft.photoUrl;
      const routePrices = routes.map((route) => route.price);
      const payload = {
        user_id: user.id,
        display_name: draft.name.trim(),
        category: executorDraft.category === "Клининг" ? "cleaning" : "transfer",
        headline: executorDraft.headline.trim(),
        bio: executorDraft.bio.trim(),
        city: draft.city,
        service_area: isTransfer ? null : executorDraft.serviceArea,
        price_from: isTransfer
          ? (routePrices.length ? Math.min(...routePrices) : null)
          : (executorDraft.priceFrom === "" ? null : Number(executorDraft.priceFrom)),
        currency: "USD",
        languages: splitList(executorDraft.languages),
        tags: splitList(executorDraft.tags),
        photo_url: nextPhotoUrl,
        routes,
        is_published: true,
      };
      const { error } = await supabaseClient.from("executor_profiles").upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      if (uploaded && executorDraft.photoUrl && executorDraft.photoUrl !== nextPhotoUrl) {
        await removePublicImage(SERVICE_IMAGE_BUCKET, executorDraft.photoUrl);
      }
      setExecutorDraft((current) => ({ ...current, photoUrl: nextPhotoUrl, routes: isTransfer ? routes.map((route) => ({ ...route, price: String(route.price) })) : current.routes, isPublished: true }));
      setServicePhotoFile(null);
      setExecutorMessage("Объявление опубликовано и появилось в списке исполнителей.");
      await reloadExecutors();
    } catch (error) {
      if (uploaded?.url) await removePublicImage(SERVICE_IMAGE_BUCKET, uploaded.url);
      setExecutorError(toUserError(error));
    } finally {
      setPublishingExecutor(false);
    }
  }

  return (
    <div className="profile-stack">
      <div className="panel profile-panel">
        <h2 className="section-title">{user.role === "executor" ? "Профиль исполнителя" : "Профиль клиента"}</h2>
        <p className="section-note">Эти данные можно изменить при необходимости.</p>
        <form className="form" onSubmit={save}>
          <div className="profile-avatar-editor">
            <div className="profile-avatar-preview">
              {avatarPreview ? <img src={avatarPreview} alt="Аватар профиля" /> : <span>{draft.name?.slice(0, 1) || "Х"}</span>}
            </div>
            <label className="secondary media-picker">
              <span>{avatarPreview ? "Изменить фотографию" : "Добавить фотографию"}</span>
              <input type="file" accept={IMAGE_TYPES.join(",")} onChange={chooseAvatar} />
            </label>
            <p>Фотография будет видна собеседникам в чатах.</p>
          </div>
          <div className="two-col">
            <label className="field"><span>Имя и фамилия</span><input value={draft.name} onChange={(event) => change("name", event.target.value)} /></label>
            <label className="field"><span>Город</span><select value={draft.city} onChange={(event) => change("city", event.target.value)}>{Object.keys(CITIES).map((city) => <option key={city}>{city}</option>)}</select></label>
          </div>
          <label className="field profile-email-field"><span>Email аккаунта</span><input value={draft.email || "Email не указан"} readOnly /></label>
          <label className="field"><span>Район поиска</span><select value={draft.searchArea} onChange={(event) => change("searchArea", event.target.value)}>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
          {profileError ? <div className="error">{profileError}</div> : null}
          <button className="primary" type="submit" disabled={locked || savingProfile}>{savingProfile ? "Сохраняем..." : "Сохранить профиль"}</button>
          <button className="ghost profile-back-button" type="button" onClick={onBack}>Назад</button>
        </form>
      </div>

      {user.role === "executor" ? (
        <div className="panel profile-panel executor-publish-panel">
          <div className="publish-heading">
            <div>
              <h2 className="section-title">Объявление исполнителя</h2>
              <p className="section-note">После публикации клиенты увидят объявление в выбранном сервисе.</p>
            </div>
            <span className={`publication-status ${executorDraft.isPublished ? "active" : ""}`}>
              {executorDraft.isPublished ? "Опубликовано" : "Не опубликовано"}
            </span>
          </div>
          {executorLoading ? <div className="form-info">Загружаем объявление...</div> : (
            <form className="form" onSubmit={publishExecutor}>
              <div className="service-photo-editor">
                <div className="service-photo-preview">
                  {servicePhotoPreview ? <img src={servicePhotoPreview} alt="Фотография объявления" /> : <span>Добавьте фотографию автомобиля или своей услуги</span>}
                </div>
                <label className="secondary media-picker">
                  <span>{servicePhotoPreview ? "Заменить фотографию" : "Выбрать фотографию"}</span>
                  <input type="file" accept={IMAGE_TYPES.join(",")} onChange={chooseServicePhoto} />
                </label>
                <small>Обязательное поле · JPG, PNG или WebP · до 8 МБ</small>
              </div>
              <label className="field"><span>Сервис</span><select value={executorDraft.category} onChange={(event) => changeExecutor("category", event.target.value)}><option>Трансфер</option><option>Клининг</option></select></label>
              {executorDraft.category === "Клининг" ? <label className="field"><span>Район работы</span><select value={executorDraft.serviceArea} onChange={(event) => changeExecutor("serviceArea", event.target.value)}>{areas.map((area) => <option key={area}>{area}</option>)}</select></label> : null}
              <label className="field"><span>Заголовок объявления</span><input value={executorDraft.headline} onChange={(event) => changeExecutor("headline", event.target.value)} placeholder="Например, трансфер из аэропорта и поездки по городу" /></label>
              <label className="field"><span>Описание услуг</span><textarea value={executorDraft.bio} onChange={(event) => changeExecutor("bio", event.target.value)} placeholder="Расскажите об автомобиле, маршрутах и условиях работы" /></label>
              {executorDraft.category === "Трансфер" ? (
                <fieldset className="route-editor">
                  <legend>Популярные маршруты и цены</legend>
                  <p>Клиент увидит эти варианты прямо в карточке объявления.</p>
                  {executorDraft.routes.map((route, index) => (
                    <div className="route-edit-row" key={index}>
                      <label><span>Откуда</span><input value={route.from} onChange={(event) => changeRoute(index, "from", event.target.value)} placeholder="Аэропорт" /></label>
                      <label><span>Куда</span><input value={route.to} onChange={(event) => changeRoute(index, "to", event.target.value)} placeholder="Эль-Ахья" /></label>
                      <label><span>Цена, $</span><input type="number" min="1" step="1" value={route.price} onChange={(event) => changeRoute(index, "price", event.target.value)} placeholder="10" /></label>
                      <button className="ghost route-remove" type="button" onClick={() => removeRoute(index)} aria-label="Удалить маршрут">×</button>
                    </div>
                  ))}
                  <button className="secondary route-add" type="button" onClick={addRoute}>Добавить маршрут</button>
                </fieldset>
              ) : null}
              <div className="two-col">
                {executorDraft.category === "Клининг" ? <label className="field"><span>Цена от, $</span><input type="number" min="0" step="1" value={executorDraft.priceFrom} onChange={(event) => changeExecutor("priceFrom", event.target.value)} placeholder="20" /></label> : null}
                <label className="field"><span>Языки через запятую</span><input value={executorDraft.languages} onChange={(event) => changeExecutor("languages", event.target.value)} placeholder="Русский, Английский, Арабский" /></label>
              </div>
              <label className="field"><span>Особенности через запятую</span><input value={executorDraft.tags} onChange={(event) => changeExecutor("tags", event.target.value)} placeholder="Аэропорт, детское кресло, минивэн" /></label>
              {executorError ? <div className="error">{executorError}</div> : null}
              {executorMessage ? <div className="form-info">{executorMessage}</div> : null}
              <button className="primary publish-button" type="submit" disabled={publishingExecutor}>
                {publishingExecutor ? "Публикуем..." : executorDraft.isPublished ? "Обновить объявление" : "Разместить объявление"}
              </button>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SubscriptionModal({ onClose, onRegister }) {
  return (
    <div className="modal-backdrop">
      <section className="subscription-modal" role="dialog" aria-modal="true">
        <span className="tag">Подписка ХурМа</span>
        <h2>Оформите подписку</h2>
        <p>Переписка и заявки доступны после регистрации и активной подписки. Новому пользователю предоставляется тестовый период на 14 дней.</p>
        <div className="quick-actions">
          <button className="primary" type="button" onClick={onRegister}>Зарегистрироваться</button>
          <button className="secondary" type="button" onClick={onClose}>Позже</button>
        </div>
      </section>
    </div>
  );
}

function App() {
  const saved = loadSaved();
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState("choice");
  const [formMode, setFormMode] = useState("register");
  const [user, setUserState] = useState(saved.user && saved.user.isGuest ? saved.user : null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [databaseExecutors, setDatabaseExecutors] = useState([]);
  const [modal, setModal] = useState(false);
  const [appKey, setAppKey] = useState(0);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const passwordRecoveryRef = useRef(false);
  const authCallbackRef = useRef(readAuthCallback(window.location.href));
  const confirmationFlowRef = useRef(authCallbackRef.current.isEmailConfirmation);
  const [emailConfirmation, setEmailConfirmation] = useState(
    confirmationFlowRef.current ? { status: "processing", message: "" } : null
  );

  useEffect(() => {
    let active = true;
    async function initialize() {
      const delay = new Promise((resolve) => setTimeout(resolve, 1800));
      const assetsReady = preloadStartupAssets();
      try {
        if (confirmationFlowRef.current) {
          if (!supabaseClient) throw new Error("Supabase не подключен.");
          await confirmEmailCallback(authCallbackRef.current);
          if (active) {
            setUserState(null);
            setAuthMode("form");
            setFormMode("login");
            setEmailConfirmation({ status: "success", message: "" });
          }
        } else if (supabaseClient) {
          const { data: { session } } = await supabaseClient.auth.getSession();
          if (session && active) {
            setUserState(await loadSupabaseUser(session.user));
          }
        }
      } catch (error) {
        if (confirmationFlowRef.current && active) {
          const callback = authCallbackRef.current;
          setEmailConfirmation({
            status: "error",
            message: confirmationErrorMessage({
              ...callback,
              errorCode: error?.code || callback.errorCode,
              errorDescription: error?.message || callback.errorDescription,
            }),
          });
        } else {
          console.error("Supabase session error", error);
        }
      } finally {
        if (confirmationFlowRef.current) {
          window.history.replaceState({}, document.title, cleanAuthCallbackUrl(window.location.href));
        }
      }
      await Promise.all([delay, assetsReady]);
      if (active) setLoading(false);
    }
    initialize();

    const authListener = supabaseClient
      ? supabaseClient.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_OUT" && active) setUserState(null);
          if (event === "PASSWORD_RECOVERY" && active) {
            passwordRecoveryRef.current = true;
            setPasswordRecovery(true);
            setUserState(null);
            setAuthMode("form");
            setFormMode("login");
          }
          if (event === "SIGNED_IN" && session && active && !passwordRecoveryRef.current && !confirmationFlowRef.current) {
            setTimeout(async () => {
              try {
                if (active && !passwordRecoveryRef.current && !confirmationFlowRef.current) {
                  setUserState(await loadSupabaseUser(session.user));
                }
              } catch (error) {
                console.error("Supabase profile error", error);
              }
            }, 0);
          }
        })
      : null;

    return () => {
      active = false;
      authListener?.data?.subscription?.unsubscribe();
    };
  }, []);

  async function loadExecutors() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("executor_profiles")
      .select("user_id, display_name, category, headline, bio, city, service_area, price_from, languages, tags, rating, photo_url, routes")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (!error) setDatabaseExecutors(data.map(mapDatabaseExecutor));
  }

  useEffect(() => {
    loadExecutors();
  }, []);

  useEffect(() => {
    let active = true;
    async function loadEvents() {
      if (!supabaseClient) {
        setEvents(EVENTS);
        setEventsError("Подключение к Supabase не настроено.");
        setEventsLoading(false);
        return;
      }
      const { data, error } = await supabaseClient
        .from("events")
        .select("id, title, description, event_type, sport, age_limit, area, location_name, map_url, starts_at, request_enabled")
        .eq("is_published", true)
        .order("starts_at");
      if (!active) return;
      if (error) {
        setEvents(EVENTS);
        setEventsError("Не удалось загрузить афишу из базы. Показаны тестовые данные.");
      } else {
        setEvents(data.map(mapDatabaseEvent));
      }
      setEventsLoading(false);
    }
    loadEvents();
    return () => {
      active = false;
    };
  }, []);

  function setUser(nextUser) {
    setUserState(nextUser);
    saveSaved({ user: nextUser && nextUser.isGuest ? nextUser : null });
  }

  function home() {
    if (window.hurmaGoHome) window.hurmaGoHome();
    if (!user) {
      setAuthMode("choice");
      setFormMode("register");
    }
    setAppKey((key) => key + 1);
  }

  function openProfileFromHeader() {
    if (window.hurmaOpenProfile) window.hurmaOpenProfile();
  }

  async function logout() {
    if (supabaseClient && user && !user.isGuest) await supabaseClient.auth.signOut();
    setUserState(null);
    saveSaved({ user: null });
    setAuthMode("choice");
    setAppKey((key) => key + 1);
  }

  async function authSubmit(data) {
    if (data.mode === "guest") {
      setUser({ id: "guest", role: "client", name: "Гость ХурМа", city: "Хургада", searchArea: "Marina", isGuest: true });
      return { ok: true };
    }
    if (!supabaseClient) return { error: "Supabase не подключен." };
    const authRedirectTo = `${window.location.origin}${window.location.pathname}?auth_callback=signup`;
    if (data.mode === "login") {
      const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) return { error: toUserError(error) };
      try {
        const nextUser = await loadSupabaseUser(authData.user);
        if (nextUser.role !== data.role) {
          await supabaseClient.auth.signOut();
          return { error: "Для этого аккаунта выбрана другая роль." };
        }
        setUserState(nextUser);
        saveSaved({ user: null });
      } catch (profileError) {
        return { error: toUserError(profileError) };
      }
      return { ok: true };
    }
    const normalizedEmail = String(data.email || "").trim().toLowerCase();
    const duplicateEmailMessage = "Пользователь с таким email уже существует в базе, выполните вход.";
    const { data: emailExists, error: emailCheckError } = await withTimeout(
      supabaseClient.rpc("user_email_exists", {
        check_email: normalizedEmail,
      }),
      10000,
      "Не удалось проверить email. Проверьте интернет и попробуйте ещё раз."
    );
    if (emailCheckError) console.warn("Email duplicate check failed", emailCheckError);
    if (emailExists) return { error: duplicateEmailMessage };

    const { data: authData, error } = await withTimeout(
      supabaseClient.auth.signUp({
        email: normalizedEmail,
        password: data.password,
        options: {
          emailRedirectTo: authRedirectTo,
          data: {
            display_name: data.name,
            role: data.role,
            city: data.city,
            search_area: data.searchArea,
            category: data.category,
          },
        },
      }),
      30000,
      "Сервер регистрации отвечает слишком долго. Проверьте интернет и попробуйте ещё раз."
    );
    if (error) {
      const message = String(error.message || "");
      if (/already|registered|exists|duplicate/i.test(message)) return { error: duplicateEmailMessage };
      return { error: toUserError(error) };
    }
    const duplicateIdentity =
      authData?.user &&
      Array.isArray(authData.user.identities) &&
      authData.user.identities.length === 0;
    if (duplicateIdentity) return { error: duplicateEmailMessage };
    if (!authData.session) {
      return { info: "Регистрация завершена. Подтвердите email по ссылке в письме, затем выполните вход." };
    }
    try {
      setUserState(await loadSupabaseUser(authData.user));
      saveSaved({ user: null });
    } catch (profileError) {
      return { error: toUserError(profileError) };
    }
    return { ok: true };
  }

  async function resendConfirmation(email) {
    if (!supabaseClient) return { error: "Supabase не подключен." };
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const redirectTo = `${window.location.origin}${window.location.pathname}?auth_callback=signup`;
    const { error } = await supabaseClient.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) return { error: toUserError(error) };
    return { info: "Новое письмо отправлено. Проверьте также папку «Спам»." };
  }

  async function resetPassword(email) {
    const redirectTo = `${window.location.origin}${window.location.pathname}?auth_callback=recovery`;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { error: toUserError(error) };
    return { info: "Если аккаунт с таким email существует, письмо со ссылкой уже отправлено. Проверьте также папку «Спам»." };
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className={`app-shell ${!user || passwordRecovery || emailConfirmation ? "auth-screen" : ""}`} key={appKey}>
      <Header user={passwordRecovery || emailConfirmation ? null : user} onHome={home} onProfile={openProfileFromHeader} onLogout={logout} />
      <main className="main">
        {emailConfirmation ? (
          <EmailConfirmationScreen
            result={emailConfirmation}
            onResend={resendConfirmation}
            onLogin={() => {
              confirmationFlowRef.current = false;
              setEmailConfirmation(null);
              setUserState(null);
              setAuthMode("form");
              setFormMode("login");
            }}
          />
        ) : null}
        {!emailConfirmation && passwordRecovery ? (
          <PasswordRecoveryForm onComplete={() => {
            passwordRecoveryRef.current = false;
            setPasswordRecovery(false);
            setUserState(null);
            setAuthMode("form");
            setFormMode("login");
          }} />
        ) : null}
        {!emailConfirmation && !passwordRecovery && !user && authMode === "choice" ? (
          <AuthChoice onLogin={() => { setFormMode("login"); setAuthMode("form"); }} onRegister={() => { setFormMode("register"); setAuthMode("form"); }} onGuest={() => authSubmit({ mode: "guest" })} />
        ) : null}
        {!emailConfirmation && !passwordRecovery && !user && authMode === "form" ? <AuthForm mode={formMode} setMode={setFormMode} onBack={() => setAuthMode("choice")} onSubmit={authSubmit} onResetPassword={resetPassword} /> : null}
        {!emailConfirmation && !passwordRecovery && user ? <Workspace user={user} setUser={setUser} onRequireSubscription={() => setModal(true)} events={events} eventsLoading={eventsLoading} eventsError={eventsError} databaseExecutors={databaseExecutors} reloadExecutors={loadExecutors} /> : null}
      </main>
      {modal ? <SubscriptionModal onClose={() => setModal(false)} onRegister={() => { setModal(false); setUser(null); setAuthMode("form"); setFormMode("register"); }} /> : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
