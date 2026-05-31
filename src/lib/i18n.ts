// Lightweight i18n (Layer 22) — no dependencies. A flat key dictionary per
// locale + a `t(key, vars)` helper with {var} interpolation and PL fallback.
// Locale is persisted in localStorage so it survives reloads and is picked up
// before first paint (see setHtmlLang).
export type Locale = 'pl' | 'en' | 'uk';

export const LOCALES: { id: Locale; label: string; flag: string }[] = [
  { id: 'pl', label: 'Polski', flag: '🇵🇱' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'uk', label: 'Українська', flag: '🇺🇦' },
];

type Dict = Record<string, string>;

const pl: Dict = {
  'nav.home': 'Dom',
  'nav.feed': 'Feed',
  'nav.practice': 'Ćwicz',
  'nav.map': 'Mapa',
  'nav.ai': 'AI',

  'common.back': 'Wróć',
  'common.home': 'Dom',
  'common.next': 'Dalej',
  'common.done': 'Gotowe',
  'common.finish': 'Koniec',
  'common.level': 'Poziom',
  'common.xp': 'XP',
  'common.coins': 'kryształy',
  'common.streak': 'seria',
  'common.subject': 'Przedmiot',
  'common.loading': 'Ładowanie…',

  'subjects.matematyka': 'Matematyka',
  'subjects.polski': 'Język polski',
  'subjects.angielski': 'Język angielski',

  'onb.hi': 'Cześć! 👋',
  'onb.intro': 'Zbuduję Twój cyfrowy profil ucznia i poprowadzę Cię do egzaminu.',
  'onb.name': 'Jak masz na imię?',
  'onb.namePlaceholder': 'Twoje imię',
  'onb.pickClass': 'Wybierz klasę postaci',
  'onb.start': 'Zaczynamy 🚀',

  'home.examTitle': 'Egzamin ósmoklasisty',
  'home.greeting': 'Cześć, {name} 👋',
  'home.twin': '🧬 Twój cyfrowy bliźniak',
  'home.analyses': '{n} analiz',
  'home.scoreForecast': 'prognoza wyniku',
  'home.dominantError': 'Dominujący typ błędu:',
  'home.planToday': '🎯 Plan na dziś',
  'home.planDesc': 'System znalazł „korzenie" Twoich braków — tematy, które odblokują najwięcej.',
  'home.mastery': 'opanowanie',
  'home.unlocks': 'odblokuje {n} tematów',
  'home.reviewsDue': '{n} do powtórki dziś',
  'home.reviewsDesc': 'Utrwal, zanim zapomnisz — to klucz do trwałej wiedzy.',
  'home.review': 'Powtórz ›',
  'home.bossTitle': 'Egzamin próbny — Boss',
  'home.bossDesc': 'Test na czas. Pokonaj bossa, zgarnij wielką nagrodę.',
  'home.boostActive': '⚡ Boost 2× XP aktywny! Wykorzystaj go w ćwiczeniach.',

  'tiles.feed': 'Feed wiedzy',
  'tiles.feedSub': 'Nauka jak TikTok',
  'tiles.simulator': 'Symulator',
  'tiles.simulatorSub': 'Twój przyszły wynik',
  'tiles.map': 'Mapa wiedzy',
  'tiles.mapSub': 'Graf zależności',
  'tiles.ai': 'Nauczyciel AI',
  'tiles.aiSub': 'Mów lub pisz',
  'tiles.generator': 'Generator testów',
  'tiles.generatorSub': 'Sprawdzian w PDF',
  'tiles.parent': 'Tryb rodzica',
  'tiles.parentSub': 'Raport postępów',
  'tiles.trends': 'Trendy',
  'tiles.trendsSub': 'Gdzie są punkty',
  'tiles.teacher': 'Nauczyciel',
  'tiles.teacherSub': 'Raport klasy',
  'tiles.career': 'Kariera',
  'tiles.careerSub': 'Twoje ścieżki',

  'burnout.high': '⚠️ Wysokie ryzyko wypalenia',
  'burnout.warn': '🟡 Zadbaj o tempo',
  'burnout.advice': 'Zrób krótką, lekką sesję 5 minut.',

  'goal.dayGoal': 'Cel dnia: {n} XP',
  'goal.reached': '✅ Cel osiągnięty! Tak trzymaj 🔥',
  'goal.toGo': 'Jeszcze {n} XP do celu',
  'goal.setExam': '🎯 Ustaw datę egzaminu →',
  'goal.daysLeft': '⏳ {n} dni do egzaminu',
  'goal.examToday': 'Dziś egzamin! Powodzenia 🍀',

  'quests.title': '📜 Wyzwania dnia',
  'quests.claimed': '{a}/{b} odebrane',
  'quests.claim': 'Odbierz',

  'settings.language': 'Język',
};

const en: Dict = {
  'nav.home': 'Home',
  'nav.feed': 'Feed',
  'nav.practice': 'Practice',
  'nav.map': 'Map',
  'nav.ai': 'AI',

  'common.back': 'Back',
  'common.home': 'Home',
  'common.next': 'Next',
  'common.done': 'Done',
  'common.finish': 'Finish',
  'common.level': 'Level',
  'common.xp': 'XP',
  'common.coins': 'crystals',
  'common.streak': 'streak',
  'common.subject': 'Subject',
  'common.loading': 'Loading…',

  'subjects.matematyka': 'Mathematics',
  'subjects.polski': 'Polish',
  'subjects.angielski': 'English',

  'onb.hi': 'Hi! 👋',
  'onb.intro': "I'll build your digital learner profile and guide you to the exam.",
  'onb.name': "What's your name?",
  'onb.namePlaceholder': 'Your name',
  'onb.pickClass': 'Pick your character class',
  'onb.start': "Let's go 🚀",

  'home.examTitle': '8th-grade exam',
  'home.greeting': 'Hi, {name} 👋',
  'home.twin': '🧬 Your digital twin',
  'home.analyses': '{n} analyses',
  'home.scoreForecast': 'score forecast',
  'home.dominantError': 'Dominant error type:',
  'home.planToday': '🎯 Plan for today',
  'home.planDesc': 'The system found the "roots" of your gaps — topics that unlock the most.',
  'home.mastery': 'mastery',
  'home.unlocks': 'unlocks {n} topics',
  'home.reviewsDue': '{n} to review today',
  'home.reviewsDesc': 'Reinforce before you forget — the key to lasting knowledge.',
  'home.review': 'Review ›',
  'home.bossTitle': 'Mock exam — Boss',
  'home.bossDesc': 'Timed test. Beat the boss, grab a big reward.',
  'home.boostActive': '⚡ 2× XP boost active! Use it in practice.',

  'tiles.feed': 'Knowledge feed',
  'tiles.feedSub': 'Learn like TikTok',
  'tiles.simulator': 'Simulator',
  'tiles.simulatorSub': 'Your future score',
  'tiles.map': 'Knowledge map',
  'tiles.mapSub': 'Dependency graph',
  'tiles.ai': 'AI Teacher',
  'tiles.aiSub': 'Speak or type',
  'tiles.generator': 'Test generator',
  'tiles.generatorSub': 'Worksheet to PDF',
  'tiles.parent': 'Parent mode',
  'tiles.parentSub': 'Progress report',
  'tiles.trends': 'Trends',
  'tiles.trendsSub': 'Where the points are',
  'tiles.teacher': 'Teacher',
  'tiles.teacherSub': 'Class report',
  'tiles.career': 'Career',
  'tiles.careerSub': 'Your paths',

  'burnout.high': '⚠️ High burnout risk',
  'burnout.warn': '🟡 Mind your pace',
  'burnout.advice': 'Do a short, light 5-minute session.',

  'goal.dayGoal': "Today's goal: {n} XP",
  'goal.reached': '✅ Goal reached! Keep it up 🔥',
  'goal.toGo': '{n} XP left to your goal',
  'goal.setExam': '🎯 Set your exam date →',
  'goal.daysLeft': '⏳ {n} days to the exam',
  'goal.examToday': 'Exam today! Good luck 🍀',

  'quests.title': '📜 Daily quests',
  'quests.claimed': '{a}/{b} claimed',
  'quests.claim': 'Claim',

  'settings.language': 'Language',
};

const uk: Dict = {
  'nav.home': 'Дім',
  'nav.feed': 'Стрічка',
  'nav.practice': 'Вправи',
  'nav.map': 'Карта',
  'nav.ai': 'AI',

  'common.back': 'Назад',
  'common.home': 'Дім',
  'common.next': 'Далі',
  'common.done': 'Готово',
  'common.finish': 'Кінець',
  'common.level': 'Рівень',
  'common.xp': 'XP',
  'common.coins': 'кристали',
  'common.streak': 'серія',
  'common.subject': 'Предмет',
  'common.loading': 'Завантаження…',

  'subjects.matematyka': 'Математика',
  'subjects.polski': 'Польська мова',
  'subjects.angielski': 'Англійська мова',

  'onb.hi': 'Привіт! 👋',
  'onb.intro': 'Я побудую твій цифровий профіль учня та проведу тебе до іспиту.',
  'onb.name': 'Як тебе звати?',
  'onb.namePlaceholder': 'Твоє ім’я',
  'onb.pickClass': 'Обери клас персонажа',
  'onb.start': 'Починаємо 🚀',

  'home.examTitle': 'Іспит восьмикласника',
  'home.greeting': 'Привіт, {name} 👋',
  'home.twin': '🧬 Твій цифровий двійник',
  'home.analyses': '{n} аналізів',
  'home.scoreForecast': 'прогноз результату',
  'home.dominantError': 'Домінуючий тип помилки:',
  'home.planToday': '🎯 План на сьогодні',
  'home.planDesc': 'Система знайшла «коріння» твоїх прогалин — теми, що відкривають найбільше.',
  'home.mastery': 'опанування',
  'home.unlocks': 'відкриє {n} тем',
  'home.reviewsDue': '{n} на повторення сьогодні',
  'home.reviewsDesc': 'Закріпи, поки не забув — ключ до тривалих знань.',
  'home.review': 'Повторити ›',
  'home.bossTitle': 'Пробний іспит — Бос',
  'home.bossDesc': 'Тест на час. Перемож боса, отримай велику нагороду.',
  'home.boostActive': '⚡ Буст 2× XP активний! Використай його у вправах.',

  'tiles.feed': 'Стрічка знань',
  'tiles.feedSub': 'Навчання як TikTok',
  'tiles.simulator': 'Симулятор',
  'tiles.simulatorSub': 'Твій майбутній результат',
  'tiles.map': 'Карта знань',
  'tiles.mapSub': 'Граф залежностей',
  'tiles.ai': 'AI Вчитель',
  'tiles.aiSub': 'Говори або пиши',
  'tiles.generator': 'Генератор тестів',
  'tiles.generatorSub': 'Тест у PDF',
  'tiles.parent': 'Режим батьків',
  'tiles.parentSub': 'Звіт про прогрес',
  'tiles.trends': 'Тренди',
  'tiles.trendsSub': 'Де бали',
  'tiles.teacher': 'Вчитель',
  'tiles.teacherSub': 'Звіт класу',
  'tiles.career': 'Кар’єра',
  'tiles.careerSub': 'Твої шляхи',

  'burnout.high': '⚠️ Високий ризик вигорання',
  'burnout.warn': '🟡 Слідкуй за темпом',
  'burnout.advice': 'Зроби коротку, легку 5-хвилинну сесію.',

  'goal.dayGoal': 'Ціль дня: {n} XP',
  'goal.reached': '✅ Ціль досягнута! Так тримати 🔥',
  'goal.toGo': 'Ще {n} XP до цілі',
  'goal.setExam': '🎯 Встанови дату іспиту →',
  'goal.daysLeft': '⏳ {n} днів до іспиту',
  'goal.examToday': 'Сьогодні іспит! Успіху 🍀',

  'quests.title': '📜 Щоденні завдання',
  'quests.claimed': '{a}/{b} отримано',
  'quests.claim': 'Отримати',

  'settings.language': 'Мова',
};

const DICTS: Record<Locale, Dict> = { pl, en, uk };

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const raw = DICTS[locale]?.[key] ?? DICTS.pl[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

const STORAGE_KEY = 'ai-nauczyciel-locale';

export function loadLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'pl';
  const v = localStorage.getItem(STORAGE_KEY) as Locale | null;
  return v && DICTS[v] ? v : 'pl';
}

export function saveLocale(locale: Locale) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, locale);
  setHtmlLang(locale);
}

export function setHtmlLang(locale: Locale) {
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}
