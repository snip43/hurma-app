(function exposeRouteData(globalObject) {
  const ROUTE_LOCATIONS = {
    "Хургада": [
      {
        group: "Транспорт",
        places: ["Аэропорт Хургады (HRG)", "Автовокзал Go Bus", "Hurghada Marina"],
      },
      {
        group: "Районы",
        places: [
          "Эль-Дахар",
          "Эль-Саккала",
          "Sheraton Road",
          "Marina",
          "Mamsha",
          "Эль-Каусер",
          "Интерконтиненталь",
          "Магавиш",
          "Village Road",
          "Эль-Ахья",
          "Эль-Хелаль",
          "Арабия",
          "Хадаба",
          "Эль-Наср",
          "Мубарак 2",
          "Мубарак 5",
          "Мубарак 6",
          "Мубарак 7",
          "Мубарак 11",
        ],
      },
      {
        group: "Торговые центры и популярные места",
        places: [
          "Senzo Mall",
          "Hurghada City Center",
          "Esplanada Mall",
          "Cleopatra Bazar",
          "Grand Aquarium",
          "Sand City",
          "Новая Марина",
        ],
      },
      {
        group: "Курортные зоны рядом",
        places: ["Сахль-Хашиш", "Макади-Бей", "Сома-Бей", "Эль-Гуна", "Сафага"],
      },
    ],
    "Шарм-эль-Шейх": [
      {
        group: "Транспорт",
        places: ["Аэропорт Шарм-эль-Шейха (SSH)", "Автовокзал Шарм-эль-Шейха"],
      },
      {
        group: "Районы",
        places: [
          "Naama Bay",
          "Nabq Bay",
          "Hadaba",
          "Ras Um Sid",
          "Old Market",
          "Hay El Nour",
          "Montazah",
          "Sharks Bay",
          "Ras Nasrani",
          "Peace Road",
        ],
      },
      {
        group: "Торговые центры и популярные места",
        places: [
          "SOHO Square",
          "Genena City",
          "Il Mercato",
          "Hollywood Sharm",
          "La Strada Mall",
          "Porto Sharm",
          "Ras Mohammed",
        ],
      },
    ],
    "Каир": [
      {
        group: "Транспорт",
        places: ["Аэропорт Каира (CAI)", "Аэропорт Сфинкс (SPX)", "Вокзал Рамзес"],
      },
      {
        group: "Районы",
        places: ["Центр Каира", "Замалек", "Маади", "Наср-Сити", "Гелиополис", "Новый Каир", "Пятый район"],
      },
      {
        group: "Торговые центры и популярные места",
        places: ["Citystars", "City Centre Almaza", "Cairo Festival City", "Mall of Egypt", "Хан эль-Халили", "Египетский музей"],
      },
    ],
    "Гиза": [
      {
        group: "Районы и популярные места",
        places: ["Пирамиды Гизы", "Большой Египетский музей", "Докки", "Мохандесин", "6 Октября", "Шейх-Зайед"],
      },
      {
        group: "Торговые центры",
        places: ["Mall of Arabia", "Mall of Egypt", "Arkan Plaza"],
      },
    ],
    "Александрия": [
      {
        group: "Транспорт",
        places: ["Аэропорт Борг-эль-Араб (HBE)", "Вокзал Сиди-Габер", "Вокзал Миср"],
      },
      {
        group: "Районы",
        places: ["Центр Александрии", "Корниш", "Смуха", "Сиди-Габер", "Рушди", "Стэнли", "Монтаза", "Агами"],
      },
      {
        group: "Торговые центры и популярные места",
        places: ["City Centre Alexandria", "San Stefano Grand Plaza", "Green Plaza", "Библиотека Александрина", "Крепость Кайт-Бей"],
      },
    ],
    "Луксор": [
      {
        group: "Транспорт и районы",
        places: ["Аэропорт Луксора (LXR)", "Восточный берег", "Западный берег", "Вокзал Луксора"],
      },
      {
        group: "Популярные места",
        places: ["Луксорский храм", "Карнакский храм", "Долина Царей", "Храм Хатшепсут"],
      },
    ],
    "Асуан": [
      {
        group: "Транспорт и районы",
        places: ["Аэропорт Асуана (ASW)", "Центр Асуана", "Вокзал Асуана", "Нубийская деревня"],
      },
      {
        group: "Популярные места",
        places: ["Асуанская плотина", "Храм Филе", "Абу-Симбел"],
      },
    ],
    "Марса-Алам": [
      {
        group: "Транспорт и курортные зоны",
        places: ["Аэропорт Марса-Алам (RMF)", "Порт-Галиб", "Центр Марса-Алама", "Абу-Даббаб", "Корайя-Бей"],
      },
    ],
    "Сафага": [
      {
        group: "Районы и транспорт",
        places: ["Центр Сафаги", "Порт Сафага", "Сома-Бей", "Макади-Бей"],
      },
    ],
    "Эль-Кусейр": [
      {
        group: "Районы",
        places: ["Центр Эль-Кусейра", "Порт Эль-Кусейр", "Курортная зона Эль-Кусейра"],
      },
    ],
    "Эль-Гуна": [
      {
        group: "Районы и популярные места",
        places: ["Downtown El Gouna", "Abu Tig Marina", "New Marina", "Mangroovy Beach", "Gouna Bus Station"],
      },
    ],
    "Дахаб": [
      {
        group: "Районы и популярные места",
        places: ["Центр Дахаба", "Лайтхаус", "Масбат", "Лагуна", "Blue Hole", "Автовокзал Дахаба"],
      },
    ],
    "Нувейба": [
      {
        group: "Районы и транспорт",
        places: ["Центр Нувейбы", "Порт Нувейба", "Автовокзал Нувейбы"],
      },
    ],
    "Таба": [
      {
        group: "Районы и транспорт",
        places: ["Аэропорт Табы (TCP)", "Taba Heights", "Пограничный переход Таба"],
      },
    ],
    "Суэц": [
      {
        group: "Районы и транспорт",
        places: ["Центр Суэца", "Порт Суэц", "Айн-Сохна"],
      },
    ],
    "Исмаилия": [
      {
        group: "Районы",
        places: ["Центр Исмаилии", "Вокзал Исмаилии", "Набережная Суэцкого канала"],
      },
    ],
    "Порт-Саид": [
      {
        group: "Районы и транспорт",
        places: ["Центр Порт-Саида", "Порт Порт-Саид", "Вокзал Порт-Саида"],
      },
    ],
    "Кена": [
      {
        group: "Районы и популярные места",
        places: ["Центр Кены", "Вокзал Кены", "Храм Дендеры"],
      },
    ],
    "Сохаг": [
      {
        group: "Транспорт и районы",
        places: ["Аэропорт Сохага (HMB)", "Центр Сохага", "Вокзал Сохага"],
      },
    ],
    "Асьют": [
      {
        group: "Транспорт и районы",
        places: ["Аэропорт Асьюта (ATZ)", "Центр Асьюта", "Вокзал Асьюта"],
      },
    ],
    "Эль-Минья": [
      {
        group: "Районы",
        places: ["Центр Эль-Миньи", "Вокзал Эль-Миньи", "Набережная Нила"],
      },
    ],
  };

  const ROUTE_CITIES = Object.keys(ROUTE_LOCATIONS);
  const CUSTOM_PLACE = "Другое место";

  function routePlaceGroups(city) {
    return ROUTE_LOCATIONS[city] || [{ group: "Места", places: ["Центр города"] }];
  }

  function routePlaces(city) {
    return routePlaceGroups(city).flatMap((group) => group.places);
  }

  function pointLabel(route, side) {
    const custom = String(route[`${side}Custom`] || route[`${side}_custom`] || "").trim();
    const place = String(route[`${side}Place`] || route[`${side}_place`] || "").trim();
    const city = String(route[`${side}City`] || route[`${side}_city`] || "").trim();
    const selectedPlace = place === CUSTOM_PLACE ? custom : place;
    return [city, selectedPlace].filter(Boolean).join(" · ");
  }

  function inferPoint(value, defaultCity) {
    const cleanValue = String(value || "").trim();
    if (!cleanValue) return { city: defaultCity, place: "", custom: "" };
    if (ROUTE_CITIES.includes(cleanValue)) {
      return { city: cleanValue, place: "Центр города", custom: "" };
    }
    const matchingCity = ROUTE_CITIES.find((city) => routePlaces(city).includes(cleanValue));
    if (matchingCity) return { city: matchingCity, place: cleanValue, custom: "" };
    return { city: defaultCity, place: CUSTOM_PLACE, custom: cleanValue };
  }

  function normalizeRouteDraft(route, defaultCity) {
    const source = route || {};
    const inferredFrom = inferPoint(source.from, defaultCity);
    const inferredTo = inferPoint(source.to, defaultCity);
    return {
      fromCity: source.fromCity || source.from_city || inferredFrom.city,
      fromPlace: source.fromPlace || source.from_place || inferredFrom.place,
      fromCustom: source.fromCustom || source.from_custom || inferredFrom.custom,
      toCity: source.toCity || source.to_city || inferredTo.city,
      toPlace: source.toPlace || source.to_place || inferredTo.place,
      toCustom: source.toCustom || source.to_custom || inferredTo.custom,
      price: source.price == null ? "" : String(source.price),
      currency: ["USD", "EGP", "RUB"].includes(source.currency) ? source.currency : "USD",
    };
  }

  function blankRoute(city) {
    const safeCity = ROUTE_CITIES.includes(city) ? city : "Хургада";
    return {
      fromCity: safeCity,
      fromPlace: "",
      fromCustom: "",
      toCity: safeCity,
      toPlace: "",
      toCustom: "",
      price: "",
      currency: "USD",
    };
  }

  const api = {
    ROUTE_LOCATIONS,
    ROUTE_CITIES,
    CUSTOM_PLACE,
    routePlaceGroups,
    routePlaces,
    pointLabel,
    normalizeRouteDraft,
    blankRoute,
  };

  globalObject.HurmaRouteData = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
