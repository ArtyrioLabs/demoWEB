// Конфігурація закладу та реальне меню Same Ta (за фото меню закладу)
window.CAFE_CONFIG = {
  name: "Саме Та",
  city: "Бровари",
  address: "вул. Василя Симоненка, 105",
  scheduleWeekdays: "Пн–Пт 08:00–21:00",
  scheduleWeekends: "Сб–Нд 09:00–21:00",
  phoneDisplay: "+380 63 234 63 68",
  phoneHref: "tel:+380632346368",
  mapsUrl: "https://maps.app.goo.gl/YEadiReCXutTYwV27",
  instagramUrl: "https://instagram.com/sameta.brovary", // заглушка для демо
  wifi: {
    ssid: "SameTa_Guest",
    password: "sameta2026" // заглушка для демо
  },
  telegram: {
    // Режим відправки замовлення з сайту:
    // "deeplink" — відкриває Telegram-бота з готовим замовленням (працює без бекенду та без токена на фронті)
    // "bot_api"  — пряма відправка в чат бариста через Bot API (зручно для швидкого демо-тесту)
    mode: "deeplink",
    botUsername: "SameTaBrovaryBot", // заглушка: замініть на username вашого бота без @
    botToken: "",
    baristaChatId: ""
  }
};

window.MENU_CATEGORIES = [
  { id: "classic", label: "Класичні напої" },
  { id: "warm", label: "Теплі напої" },
  { id: "matcha", label: "Матча" },
  { id: "tea", label: "Чай" },
  { id: "cold", label: "Коли спекотно" },
  { id: "addons", label: "Додатки" }
];

window.MENU_ITEMS = [
  // Класичні напої
  {
    id: "espresso",
    category: "classic",
    name: "Еспресо",
    description: "Насичена класика зі 100% арабіки.",
    badge: null,
    variants: [{ label: "Стандарт", price: 35 }]
  },
  {
    id: "doppio",
    category: "classic",
    name: "Допіо",
    description: "Подвійний еспресо для яскравого старту дня.",
    badge: null,
    variants: [{ label: "Стандарт", price: 45 }]
  },
  {
    id: "americano",
    category: "classic",
    name: "Американо",
    description: "М'який чорний кавовий напій.",
    badge: null,
    variants: [{ label: "Стандарт", price: 35 }]
  },
  {
    id: "cappuccino",
    category: "classic",
    name: "Капучино",
    description: "Збалансований еспресо з ніжною молочною піною.",
    badge: "Хіт",
    variants: [
      { label: "Стандарт", price: 65 },
      { label: "Великий", price: 80 }
    ]
  },
  {
    id: "latte",
    category: "classic",
    name: "Лате",
    description: "Ніжний молочно-кавовий напій.",
    badge: null,
    variants: [{ label: "Стандарт", price: 70 }]
  },
  {
    id: "flat_white",
    category: "classic",
    name: "Флет Вайт",
    description: "Подвійний еспресо з тонким шаром шовковистої мікропіни.",
    badge: "Вибір бариста",
    variants: [{ label: "Стандарт", price: 70 }]
  },
  {
    id: "filter_coffee",
    category: "classic",
    name: "Фільтр кава",
    description: "Чистий та ароматний альтернативний метод заварювання.",
    badge: null,
    variants: [
      { label: "Стандарт", price: 60 },
      { label: "Великий", price: 70 }
    ]
  },

  // Теплі напої
  {
    id: "raf_vanilla",
    category: "warm",
    name: "Раф ванільний",
    description: "Вершковий десертний кавовий напій з ароматом ванілі.",
    badge: null,
    variants: [{ label: "Стандарт", price: 75 }]
  },
  {
    id: "raf_honey",
    category: "warm",
    name: "Раф медовий",
    description: "Теплий вершковий раф із натуральним медом.",
    badge: null,
    variants: [{ label: "Стандарт", price: 80 }]
  },
  {
    id: "capuorange",
    category: "warm",
    name: "Капуоранж",
    description: "Еспресо зі свіжим апельсиновим соком.",
    badge: "Хіт",
    variants: [{ label: "Стандарт", price: 80 }]
  },
  {
    id: "babyccino",
    category: "warm",
    name: "Бейбічіно",
    description: "Ніжна тепла молочна пінка без кави для наймолодших гостей.",
    badge: null,
    variants: [{ label: "Стандарт", price: 40 }]
  },
  {
    id: "cocoa",
    category: "warm",
    name: "Какао",
    description: "Ароматне гаряче какао на молоці.",
    badge: null,
    variants: [
      { label: "Стандарт", price: 65 },
      { label: "Великий", price: 75 }
    ]
  },
  {
    id: "hot_chocolate",
    category: "warm",
    name: "Гарячий шоколад",
    description: "Густий насичений шоколадний напій.",
    badge: null,
    variants: [
      { label: "Стандарт", price: 65 },
      { label: "Великий", price: 75 }
    ]
  },

  // Матча (гаряча + айс)
  {
    id: "matcha_classic",
    category: "matcha",
    name: "Матча класік",
    description: "Класичний японський зелений чай матча.",
    badge: null,
    variants: [{ label: "Гарячий", price: 65 }]
  },
  {
    id: "matcha_latte",
    category: "matcha",
    name: "Матча лате",
    description: "Японський зелений чай матча зі збитим молоком.",
    badge: "Хіт",
    variants: [{ label: "Гарячий", price: 80 }]
  },
  {
    id: "matcha_orange",
    category: "matcha",
    name: "Матча оранж",
    description: "Поєднання матча та свіжого апельсинового соку.",
    badge: null,
    variants: [{ label: "Гарячий", price: 90 }]
  },
  {
    id: "ice_matcha",
    category: "matcha",
    name: "Айс матча",
    description: "Освіжаючий холодний напій на основі матча.",
    badge: null,
    variants: [{ label: "Холодний", price: 70 }]
  },
  {
    id: "ice_matcha_latte",
    category: "matcha",
    name: "Айс матча лате",
    description: "Холодний матча лате з льодом та ніжним молоком.",
    badge: null,
    variants: [{ label: "Холодний", price: 95 }]
  },
  {
    id: "ice_matcha_tonic",
    category: "matcha",
    name: "Айс матча тонік",
    description: "Тонізуючий мікс матча та тоніка з льодом.",
    badge: null,
    variants: [{ label: "Холодний", price: 90 }]
  },
  {
    id: "ice_matcha_orange",
    category: "matcha",
    name: "Айс матча оранж",
    description: "Холодний мікс матча та апельсинового соку.",
    badge: null,
    variants: [{ label: "Холодний", price: 100 }]
  },
  {
    id: "ice_orange_strawberry_matcha",
    category: "matcha",
    name: "Айс апельсин полуниця матча",
    description: "Яскравий авторський ягідно-цитрусовий мікс із матча.",
    badge: "Авторський",
    variants: [{ label: "Холодний", price: 140 }]
  },
  {
    id: "ice_coconut_raspberry_matcha",
    category: "matcha",
    name: "Айс кокос малина матча",
    description: "Тропічний кокос, соковита малина та матча.",
    badge: "Авторський",
    variants: [{ label: "Холодний", price: 150 }]
  },

  // Чай
  {
    id: "tea_brewed",
    category: "tea",
    name: "Заварний",
    description: "Класичний листовий чай на вибір.",
    badge: null,
    variants: [{ label: "Стандарт", price: 35 }]
  },
  {
    id: "tea_buckwheat",
    category: "tea",
    name: "Гречаний",
    description: "Ароматний гречаний чай із нотками печива.",
    badge: null,
    variants: [{ label: "Стандарт", price: 60 }]
  },
  {
    id: "tea_author",
    category: "tea",
    name: "Авторський",
    description: "Фірмовий зігріваючий чай за рецептом кав'ярні.",
    badge: "Хіт",
    variants: [{ label: "Стандарт", price: 130 }]
  },
  {
    id: "tea_natural",
    category: "tea",
    name: "Чай натуральний",
    description: "Ягідний або цитрусовий натуральний чай.",
    badge: null,
    variants: [{ label: "Стандарт", price: 60 }]
  },

  // Коли спекотно
  {
    id: "espresso_tonic",
    category: "cold",
    name: "Еспресо тонік",
    description: "Освіжаючий мікс еспресо та тоніка з льодом.",
    badge: "Хіт",
    variants: [
      { label: "Стандарт", price: 85 },
      { label: "Великий", price: 100 }
    ]
  },
  {
    id: "ice_latte",
    category: "cold",
    name: "Айс лате",
    description: "Класичний холодний лате з льодом.",
    badge: null,
    variants: [{ label: "Стандарт", price: 90 }]
  },
  {
    id: "ice_capuorange",
    category: "cold",
    name: "Айс капуоранж",
    description: "Холодний еспресо з апельсиновим соком і льодом.",
    badge: null,
    variants: [
      { label: "Стандарт", price: 95 },
      { label: "Великий", price: 110 }
    ]
  },
  {
    id: "ice_cocoa",
    category: "cold",
    name: "Айс какао",
    description: "Прохолодне шоколадне какао з льодом.",
    badge: null,
    variants: [{ label: "Стандарт", price: 80 }]
  },
  {
    id: "lemonade",
    category: "cold",
    name: "Лимонад",
    description: "Освіжаючий домашній лимонад.",
    badge: null,
    variants: [{ label: "Стандарт", price: 90 }]
  },
  {
    id: "mojito_classic",
    category: "cold",
    name: "Мохіто класичний",
    description: "М'ята, лайм та ігриста свіжість.",
    badge: null,
    variants: [{ label: "Стандарт", price: 90 }]
  },
  {
    id: "mojito_strawberry",
    category: "cold",
    name: "Мохіто полуниця",
    description: "Класичний мохіто з полуничним акцентом.",
    badge: null,
    variants: [{ label: "Стандарт", price: 90 }]
  },
  {
    id: "ice_cocoa_cheese_foam",
    category: "cold",
    name: "Айс какао чізі фом",
    description: "Холодне какао під ніжною вершково-сирною пінкою.",
    badge: "Чізі фом",
    variants: [{ label: "Стандарт", price: 150 }]
  },
  {
    id: "ice_latte_cheese_foam",
    category: "cold",
    name: "Айс лате чізі фом",
    description: "Айс лате з фірмовою солоно-вершковою пінкою.",
    badge: "Чізі фом",
    variants: [{ label: "Стандарт", price: 150 }]
  },
  {
    id: "ice_matcha_cheese_foam",
    category: "cold",
    name: "Айс матча чізі фом",
    description: "Холодний матча лате з ніжною сирною пінкою.",
    badge: "Чізі фом",
    variants: [{ label: "Стандарт", price: 150 }]
  },
  {
    id: "milkshake",
    category: "cold",
    name: "Мілк шейк",
    description: "Густий молочний коктейль із морозивом.",
    badge: "З морозивом",
    variants: [{ label: "Стандарт", price: 120 }]
  },
  {
    id: "frappe",
    category: "cold",
    name: "Фрапе",
    description: "Збитий холодний кавовий напій із морозивом.",
    badge: "З морозивом",
    variants: [{ label: "Стандарт", price: 100 }]
  },
  {
    id: "glace",
    category: "cold",
    name: "Глясе",
    description: "Кава з кулькою ніжного пломбіру.",
    badge: "З морозивом",
    variants: [{ label: "Стандарт", price: 100 }]
  },

  // Додатки
  {
    id: "addon_milk_cream",
    category: "addons",
    name: "Молоко / вершки",
    description: "Порція молока або вершків до напою.",
    badge: null,
    variants: [{ label: "Додаток", price: 5 }]
  },
  {
    id: "addon_lactose_free",
    category: "addons",
    name: "Безлактозне молоко",
    description: "Заміна на безлактозне молоко.",
    badge: "Без лактози",
    variants: [{ label: "Заміна", price: 10 }]
  },
  {
    id: "addon_plant_milk",
    category: "addons",
    name: "Рослинне молоко",
    description: "Вівсяне, мигдалеве або кокосове (вкажіть у коментарі).",
    badge: null,
    variants: [{ label: "Заміна", price: 30 }]
  },
  {
    id: "addon_banana_milk",
    category: "addons",
    name: "Бананове молоко",
    description: "Ніжне бананове рослинне молоко.",
    badge: null,
    variants: [{ label: "Заміна", price: 40 }]
  },
  {
    id: "addon_honey",
    category: "addons",
    name: "Мед",
    description: "Порція натурального меду.",
    badge: null,
    variants: [{ label: "Додаток", price: 10 }]
  },
  {
    id: "addon_decaf",
    category: "addons",
    name: "Декаф",
    description: "Приготування напою без кофеїну.",
    badge: "Free",
    variants: [{ label: "Безкоштовно", price: 0 }]
  },
  {
    id: "addon_syrup",
    category: "addons",
    name: "Сироп",
    description: "Улюблений смак на вибір (вкажіть у коментарі).",
    badge: null,
    variants: [{ label: "Додаток", price: 5 }]
  }
];
