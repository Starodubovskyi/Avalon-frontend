/**
 * Help-centre bot topics. Answers and button labels live in messages/<locale>/support.json
 * under bot.answers.<topic> / bot.buttons.<topic>; keywords cover EN, RU and RO so a question
 * in any interface language finds its topic.
 */
/** Matching order: specific questions (price, payment, "where is my ship") before broad words (call, vessel) */
export const BOT_TOPICS = [
  "about",
  "offer",
  "pricing",
  "payment",
  "map",
  "agency",
  "fleet",
  "notifications",
  "reports",
  "search",
  "security",
  "team",
  "history",
  "automation",
  "support",
  "greeting",
  "bye",
] as const;

export type BotTopic = (typeof BOT_TOPICS)[number];

interface TopicDef {
  /** lower-case words or phrases; matched at a word start, short ones (≤ 3 letters) as whole words */
  keywords: string[];
  /** follow-up topics offered as buttons under the answer */
  buttons?: BotTopic[];
}

const TOPICS: Record<BotTopic, TopicDef> = {
  about: {
    keywords: [
      "about us", "about you", "who are you", "what do you do", "what is your system", "your project",
      "о вас", "о нас", "кто вы", "чем вы занимаетесь", "что вы делаете", "о компании", "о проекте",
      "despre voi", "despre noi", "cine sunteți", "cine sunteti", "ce faceți", "ce faceti", "despre companie",
    ],
  },
  offer: {
    keywords: [
      "what we offer", "what do we offer", "what does we offer", "what does it offer", "what can i do", "features",
      "possibilities", "capabilities", "main functions", "crm features",
      "что вы предлагаете", "что мы предлагаем", "возможност", "функци", "что умеет",
      "ce oferim", "ce oferiți", "ce oferiti", "funcții", "functii", "funcționalit", "functionalit", "posibilități",
    ],
    buttons: ["fleet", "map", "agency"],
  },
  agency: {
    keywords: ["agency", "nominate", "port call", "shipping", "агентир", "заявк", "заход", "agentur", "cerere", "escal"],
  },
  fleet: {
    keywords: [
      "fleet", "my ships", "all ships", "vessels", "ships list", "manage ships",
      "флот", "суда", "судно", "судов", "корабл",
      "flot", "nave", "navele", "vase",
    ],
  },
  map: {
    keywords: [
      "map", "live map", "real time", "where is my ship", "current position", "tracking", "location",
      "карт", "где моё судно", "где мое судно", "позици", "отслежив", "местоположен",
      "hartă", "harta", "unde este nava", "poziți", "pozitie", "urmărire", "urmarire", "locați", "locati",
    ],
  },
  notifications: {
    keywords: ["notification", "alert", "alarm", "warning", "уведомлен", "оповещен", "предупрежд", "notificar", "notificăr", "alertă", "alerte", "avertiz"],
  },
  reports: {
    keywords: ["report", "statistics", "analytics", "export", "pdf", "csv", "отчёт", "отчет", "статистик", "аналитик", "экспорт", "raport", "statistic", "analiz"],
  },
  search: {
    keywords: [
      "search", "filter", "find ship", "find company", "advanced search",
      "поиск", "фильтр", "найти",
      "căuta", "cauta", "caut", "filtr", "găsi", "gasi",
    ],
  },
  security: {
    keywords: [
      "security", "privacy", "is it safe", "secure", "data protection",
      "безопасн", "конфиденциальн", "защита данных",
      "securitate", "siguranț", "siguranta", "confidențialit", "confidentialit", "protecția datelor",
    ],
  },
  team: {
    keywords: [
      "users", "profiles", "team", "add user", "user management", "permissions", "roles",
      "пользовател", "команд", "роли", "права доступа", "сотрудник",
      "utilizator", "echip", "roluri", "permisiun",
    ],
  },
  history: {
    keywords: [
      "events", "history", "event log", "logs", "activity", "timeline",
      "истори", "журнал", "событи", "активност",
      "istoric", "jurnal", "evenimente", "activitat",
    ],
  },
  automation: {
    keywords: ["automation", "automated", "rules", "auto actions", "автоматиз", "правил", "automatiz", "reguli"],
  },
  pricing: {
    keywords: ["price", "pricing", "cost", "tariff", "цена", "цены", "стоимост", "сколько стоит", "тариф", "preț", "pret", "costă", "costa", "tarif"],
  },
  payment: {
    keywords: ["payment", "pay", "invoice", "method", "оплат", "платёж", "платеж", "счёт", "счет", "plată", "plata", "plăți", "plati", "factur"],
  },
  support: {
    keywords: [
      "support", "help", "contact", "email", "assist",
      "поддержк", "помощ", "помоги", "контакт", "связаться",
      "suport", "ajutor", "asisten",
    ],
    buttons: ["agency", "payment"],
  },
  greeting: {
    keywords: [
      "hi", "hello", "hey", "good morning", "good afternoon",
      "привет", "здравствуй", "добрый день", "доброе утро",
      "salut", "bună", "buna",
    ],
    buttons: ["pricing", "support", "about"],
  },
  bye: {
    keywords: ["bye", "goodbye", "see you", "пока", "до свидания", "la revedere", "pa"],
  },
};

/** Letter or digit in any cased script (Latin, Cyrillic) — enough to find word boundaries */
function isWordChar(ch: string): boolean {
  return ch.toLowerCase() !== ch.toUpperCase() || (ch >= "0" && ch <= "9");
}

function hasKeyword(text: string, keyword: string): boolean {
  for (let at = text.indexOf(keyword); at !== -1; at = text.indexOf(keyword, at + 1)) {
    const before = at === 0 ? "" : text[at - 1];
    const after = text[at + keyword.length] ?? "";
    const startsWord = !before || !isWordChar(before);
    const endsWord = !after || !isWordChar(after);
    // stems ("уведомлен", "funcți") match longer words; short words ("hi", "pa") only on their own
    if (startsWord && (keyword.length > 3 || endsWord)) return true;
  }
  return false;
}

/** First topic whose keyword appears in the question, or null for the fallback answer */
export function matchTopic(question: string): BotTopic | null {
  const text = question.toLowerCase().normalize("NFC");
  return BOT_TOPICS.find((topic) => TOPICS[topic].keywords.some((kw) => hasKeyword(text, kw))) ?? null;
}

export function topicButtons(topic: BotTopic): BotTopic[] | undefined {
  return TOPICS[topic].buttons;
}
