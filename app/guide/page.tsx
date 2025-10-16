"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  IconChecklist,
  IconBulb,
  IconFileSpreadsheet,
  IconAlertTriangle,
  IconPlayerPlay,
  IconTableExport,
  IconCalendarEvent,
  IconExternalLink,
  IconFilter,
  IconAdjustmentsHorizontal,
  IconDatabaseImport,
  IconInfoCircle,
  IconSquareCheck,
  IconZoomScan,
  IconCircleCheck,
  IconArrowsExchange2,
  IconDeviceFloppy,
} from "@tabler/icons-react";

type Lang = "ru" | "en";

const tr = {
  ru: {
    header: {
      title: "Руководство по Line-Up",
      subtitle:
        "Как создавать записи, настраивать поля, работать с таблицами, конфликтами и экспортом.",
      openLink: "Открыть Line-Up",
    },
    toc: [
      "Быстрый старт",
      "Кастомные поля",
      "Схема на каждый Line-Up",
      "Отображение в таблицах",
      "Фильтры, легенда, статусы",
      "Экспорт/импорт/календарь",
      "Конфликты швартов/времени",
      "Снимки и сохранённые виды",
      "FAQ / Частые вопросы",
    ],
    quickstart: {
      title: "Быстрый старт",
      items: [
        "Зайдите в «Companies → профиль компании» и нажмите «Add line-up» (откроется менеджер).",
        "Заполните базовые поля (например, Vessel, IMO, Port и т. д.).",
        "Нажмите «Customize fields», чтобы добавить свои поля (тип, обязательность, порядок).",
        "Нажмите «Add Line-Up Item», затем «Save changes» — запись появится в таблице компании.",
      ],
      tip: "Нужны только свои поля? Оставьте базовые пустыми и работайте через конструктор — таблица подстроится под ваши колонки.",
    },
    builder: {
      title: "Кастомные поля (конструктор)",
      p1: "Конструктор позволяет добавить поля следующих типов: Text, Number, Date, Date & time, Select, Yes/No. Для Select укажите опции через запятую. Поля можно делать Required и менять порядок стрелками.",
      bullets: [
        "Label → отображаемое имя; Key генерируется слагификацией и может быть отредактирован.",
        "Значения сохраняются в item.custom[key]. Схема хранится в item.schema.",
        "Порядок меняется кнопками ↑ / ↓.",
      ],
      warn: "Изменение Key у уже заполненного поля может «оторвать» существующие значения. Меняйте ключи до ввода данных или продублируйте поле с новым ключом и перенесите значения.",
    },
    perItem: {
      title: "Схема на каждый Line-Up (персональные формы)",
      p1: "У каждой записи свой набор полей: схема не глобальная. Агент A может иметь «Operation, Parcel, Laycan», агент B — «Fixture No., Charterer». Данные и заголовки не смешиваются.",
      info: "В таблицах записи группируются по «отпечатку» схемы (совпадают ключи и их порядок). С одинаковым набором — в одну таблицу, с разным — в разные.",
    },
    tables: {
      title: "Отображение в таблицах",
      bullets: [
        "В карточке компании таблица: базовые колонки (Port / Date Window / Notes) + ваши кастомные поля в указанном порядке. Пустые значения — «—».",
        "На странице Vessel Line-Up (общий экран): полная таблица (Vessel, IMO, Terminal, Berth, Cargo, ETA/ETB/ETD, Status) + ваши кастомные колонки. Клик по строке — редактор.",
      ],
      tip: "Порядок кастомных колонок = порядок в конструкторе. Удобно под Excel-подобные требования.",
    },
    filters: {
      title: "Фильтры, легенда, статусы",
      bullets: [
        "Быстрый поиск по Vessel, IMO, Terminal, Berth. Можно ограничивать по Status и Terminal.",
        "Легенда статусов (чипы-счётчики) позволяет быстро включать/выключать нужные статусы.",
      ],
    },
    export: {
      title: "Экспорт, импорт и календарь",
      csvTitle: "CSV",
      csvP: "Выгружает текущую выборку. Рекомендуемая «шапка» CSV указана ниже — нажмите «Скопировать».",
      copy: "Скопировать",
      icsTitle: "ICS (календарь)",
      icsP: "Генерирует события по ETB/ETD — удобно для шедулинга.",
      importTitle: "Импорт CSV",
      importP:
        "Загружает новые записи поверх текущих. Для кастомных полей используйте ключи вида custom.<key> (например, custom.operation).",
      warn: "Проверьте формат дат: ISO-8601 (YYYY-MM-DDTHH:mm) для eta/etb/etd. Неверный формат будет проигнорирован.",
    },
    conflicts: {
      title: "Конфликты швартов/времени",
      p: "Блок Conflicts подскажет наложения по Berth и времени. Можно исправлять точечно или нажать «Resolve all» — система предложит ближайший свободный слот и пересчитает ETB/ETD.",
    },
    views: {
      title: "Снимки (snapshots) и сохранённые виды",
      bullets: [
        "Snapshots — сохранение текущего состояния Line-Up с возможностью отката.",
        "Saved Views — сохранение фильтров/вкладки/терминала для разных сценариев.",
      ],
    },
    faq: {
      title: "FAQ / Частые вопросы",
      items: [
        {
          q: "Я меняю значение в текстовом поле, и оно дублируется в другие записи.",
          a: "Убедись, что редактируешь текущий черновик перед добавлением. Кастомные значения уходят в item.custom только при клике «Add Line-Up Item». Уже созданные записи независимы.",
        },
        {
          q: "Поля агента A появились у агента B.",
          a: "Схема хранится на уровне записи. Чтобы агенты имели разные наборы полей, создавай записи с нужной схемой — таблицы автоматически разделятся по «отпечатку» (набор ключей + порядок).",
        },
        {
          q: "Почему в карточке компании несколько таблиц?",
          a: "Потому что Line-Up группируются по совпадающим схемам. Разные ключи/порядок → разные таблицы. Так удобнее разделять форматы разных агентов.",
        },
        {
          q: "Как повторно использовать одни и те же поля?",
          a: "Создавай несколько записей подряд — конструктор сохранит конфигурацию на время сессии. Или продублируй существующую запись (если такая кнопка есть) и измени значения.",
        },
      ],
      tip: "Если нужны долговечные «шаблоны» полей (напр., «шаблон агента»), добавьте сохранение/загрузку схемы в UI конструктора — это легко расширить.",
    },
    footer:
      "Нужна встроенная инструкция прямо в модалке «Manage Line-Up»? Добавь кнопку “How it works”, открывающую этот экран в новой вкладке или как поповер.",
    langLabel: "Язык",
    langRU: "Рус",
    langEN: "Eng",
  },
  en: {
    header: {
      title: "Line-Up Guide",
      subtitle:
        "How to create items, customize fields, work with tables, conflicts and exports.",
      openLink: "Open Line-Up",
    },
    toc: [
      "Quick Start",
      "Custom Fields",
      "Per-Item Schema",
      "Tables Rendering",
      "Filters, Legend, Statuses",
      "Export/Import/Calendar",
      "Berth/Timing Conflicts",
      "Snapshots & Saved Views",
      "FAQ",
    ],
    quickstart: {
      title: "Quick Start",
      items: [
        "Go to “Companies → company profile” and click “Add line-up” (manager opens).",
        "Fill in basic fields (e.g. Vessel, IMO, Port, etc.).",
        "Click “Customize fields” to add your own fields (type, required, order).",
        "Click “Add Line-Up Item”, then “Save changes” — the record appears in the company table.",
      ],
      tip: "Want only your own fields? Leave base fields empty and use the builder — the table will adapt to your columns.",
    },
    builder: {
      title: "Custom Fields (Builder)",
      p1: "Builder supports: Text, Number, Date, Date & time, Select, Yes/No. For Select provide comma-separated options. You can mark fields as Required and reorder them.",
      bullets: [
        "Label → display name; Key is slugified and editable.",
        "Values go to item.custom[key]. Schema is stored in item.schema.",
        "Reorder using ↑ / ↓.",
      ],
      warn: "Changing a field Key after data was entered may detach existing values. Prefer changing keys before data entry or duplicate a field with a new key and migrate values.",
    },
    perItem: {
      title: "Per-Item Schema (Personal Forms)",
      p1: "Each record owns its field set: schema is not global. Agent A might use “Operation, Parcel, Laycan”, Agent B — “Fixture No., Charterer”. Data and headers don’t mix.",
      info: "Tables group records by a schema “fingerprint” (same keys & order). Matching sets go to one table, different sets — to separate tables.",
    },
    tables: {
      title: "Tables Rendering",
      bullets: [
        "In the company card: base columns (Port / Date Window / Notes) + your custom fields in the specified order. Empty values render as “—”.",
        "On Vessel Line-Up page (global): full table (Vessel, IMO, Terminal, Berth, Cargo, ETA/ETB/ETD, Status) + your custom columns. Row click opens the editor.",
      ],
      tip: "Custom column order follows the builder order — great for Excel-like layouts.",
    },
    filters: {
      title: "Filters, Legend, Statuses",
      bullets: [
        "Instant search over Vessel, IMO, Terminal, Berth. You can also limit by Status and Terminal.",
        "Status legend (chips with counters) toggles statuses on/off quickly.",
      ],
    },
    export: {
      title: "Export, Import & Calendar",
      csvTitle: "CSV",
      csvP: "Exports the current selection. Recommended CSV header is below — click “Copy”.",
      copy: "Copy",
      icsTitle: "ICS (calendar)",
      icsP: "Generates events from ETB/ETD — useful for scheduling.",
      importTitle: "CSV Import",
      importP:
        "Uploads new records on top. For custom fields use keys like custom.<key> (e.g., custom.operation).",
      warn: "Make sure dates are ISO-8601 (YYYY-MM-DDTHH:mm) for eta/etb/etd. Invalid format is ignored.",
    },
    conflicts: {
      title: "Berth/Timing Conflicts",
      p: "The Conflicts block highlights overlap by Berth and time. Fix individually or click “Resolve all” — the system suggests the nearest free slot and recalculates ETB/ETD.",
    },
    views: {
      title: "Snapshots & Saved Views",
      bullets: [
        "Snapshots — save the entire Line-Up state with rollback.",
        "Saved Views — persist filters/tab/terminal for different workflows.",
      ],
    },
    faq: {
      title: "FAQ",
      items: [
        {
          q: "Typing in a text field mirrors to other items.",
          a: "Make sure you edit the current draft before adding. Custom values are stored into item.custom only on “Add Line-Up Item”. Existing items are independent.",
        },
        {
          q: "Agent A fields showed up for Agent B.",
          a: "Schema is per record. To have different fields per agent, create records with appropriate schema — tables auto-split by the schema fingerprint (key set + order).",
        },
        {
          q: "Why do I see multiple tables in the company card?",
          a: "Line-Up groups by identical schemas. Different keys/order → different tables. It helps visually separate different agent formats.",
        },
        {
          q: "How to reuse the same fields?",
          a: "Add multiple records in one session — the builder keeps the config while the modal stays open. Or duplicate an item (if you have that UI) and adjust values.",
        },
      ],
      tip: "If you need long-lived field “templates” (e.g., per-agent), add save/load of schemas to the builder UI — it’s easy to extend.",
    },
    footer:
      "Want an in-modal help? Add a “How it works” button in “Manage Line-Up” that opens this screen or a popover.",
    langLabel: "Language",
    langRU: "Рус",
    langEN: "Eng",
  },
} as const;

type TOCItem = { id: string; label: string };

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    <div className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
      {children}
    </div>
  </section>
);

const Callout = ({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning" | "tip";
  children: React.ReactNode;
}) => {
  const styles =
    tone === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/10 dark:border-amber-900/40 dark:text-amber-100"
      : tone === "tip"
      ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/10 dark:border-emerald-900/40 dark:text-emerald-100"
      : "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/10 dark:border-blue-900/40 dark:text-blue-100";
  const Icon =
    tone === "warning"
      ? IconAlertTriangle
      : tone === "tip"
      ? IconBulb
      : IconInfoCircle;
  return (
    <div
      className={`mt-3 flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm ${styles}`}
    >
      <Icon size={18} className="mt-[2px]" />
      <div className="[&>p:not(:first-child)]:mt-2">{children}</div>
    </div>
  );
};

const FAQItem = ({
  q,
  a,
  defaultOpen = false,
}: {
  q: string;
  a: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gray-200 bg-white/70 dark:bg-white/5 dark:border-white/10">
      <button
        className="w-full px-4 py-3 text-left flex items-center gap-2"
        onClick={() => setOpen((s) => !s)}
      >
        <IconBulb size={18} className="text-gray-500 dark:text-gray-400" />
        <span className="font-medium">{q}</span>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-700 dark:text-gray-300">
          {a}
        </div>
      )}
    </div>
  );
};

export default function LineUpGuidePage() {
  const [lang, setLang] = useState<Lang>("ru");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ui:langLineUpGuide") as Lang | null;
      if (saved === "ru" || saved === "en") setLang(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("ui:langLineUpGuide", lang);
    } catch {}
  }, [lang]);

  const t = tr[lang];

  const toc: TOCItem[] = useMemo(
    () => [
      { id: "quickstart", label: t.toc[0] },
      { id: "builder", label: t.toc[1] },
      { id: "per-item-schema", label: t.toc[2] },
      { id: "tables", label: t.toc[3] },
      { id: "filters", label: t.toc[4] },
      { id: "export", label: t.toc[5] },
      { id: "conflicts", label: t.toc[6] },
      { id: "views", label: t.toc[7] },
      { id: "faq", label: t.toc[8] },
    ],
    [t]
  );

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(
        lang === "ru" ? "Скопировано в буфер обмена" : "Copied to clipboard"
      );
    } catch {
      alert(lang === "ru" ? "Не удалось скопировать" : "Copy failed");
    }
  };

  const sampleCsvHeader =
    "name,imo,port,terminal,berth,cargo.type,cargo.qty,cargo.unit,eta,etb,etd,status";

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t.header.title}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t.header.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 inline-flex p-1">
              <button
                onClick={() => setLang("ru")}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  lang === "ru"
                    ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
                aria-label={t.langRU}
              >
                {t.langRU}
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  lang === "en"
                    ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
                aria-label={t.langEN}
              >
                {t.langEN}
              </button>
            </div>

            <Link
              href="/lineup"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300"
            >
              <IconExternalLink size={16} />
              {t.header.openLink}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-6">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <nav className="rounded-2xl border border-gray-200 bg-white/80 p-3 text-sm shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <div className="mb-2 font-medium text-gray-500 dark:text-gray-400">
                {lang === "ru" ? "Навигация" : "Contents"}
              </div>
              <ul className="space-y-1">
                {toc.map((tItem) => (
                  <li key={tItem.id}>
                    <a
                      href={`#${tItem.id}`}
                      className="block rounded-lg px-2 py-1 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/10"
                    >
                      {tItem.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="space-y-10">
            <Section id="quickstart" title={t.quickstart.title}>
              <ul className="mt-2 space-y-2">
                {t.quickstart.items.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {(i === 0 && (
                      <IconPlayerPlay
                        size={18}
                        className="mt-[2px] text-gray-500"
                      />
                    )) ||
                      (i === 1 && (
                        <IconChecklist
                          size={18}
                          className="mt-[2px] text-gray-500"
                        />
                      )) ||
                      (i === 2 && (
                        <IconAdjustmentsHorizontal
                          size={18}
                          className="mt-[2px] text-gray-500"
                        />
                      )) || (
                        <IconDeviceFloppy
                          size={18}
                          className="mt-[2px] text-gray-500"
                        />
                      )}
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <Callout tone="tip">
                <p>{t.quickstart.tip}</p>
              </Callout>
            </Section>

            <Section id="builder" title={t.builder.title}>
              <p>{t.builder.p1}</p>
              <div className="mt-3 grid gap-2 rounded-xl border border-gray-200 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <IconSquareCheck size={16} className="text-gray-500" />
                  <span>{t.builder.bullets[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconFileSpreadsheet size={16} className="text-gray-500" />
                  <span>{t.builder.bullets[1]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconArrowsExchange2 size={16} className="text-gray-500" />
                  <span>{t.builder.bullets[2]}</span>
                </div>
              </div>
              <Callout tone="warning">
                <p>{t.builder.warn}</p>
              </Callout>
            </Section>

            <Section id="per-item-schema" title={t.perItem.title}>
              <p>{t.perItem.p1}</p>
              <Callout tone="info">
                <p>{t.perItem.info}</p>
              </Callout>
            </Section>

            <Section id="tables" title={t.tables.title}>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2">
                  <IconFileSpreadsheet
                    size={18}
                    className="mt-[2px] text-gray-500"
                  />
                  <span>{t.tables.bullets[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconZoomScan size={18} className="mt-[2px] text-gray-500" />
                  <span>{t.tables.bullets[1]}</span>
                </li>
              </ul>
              <Callout tone="tip">
                <p>{t.tables.tip}</p>
              </Callout>
            </Section>

            <Section id="filters" title={t.filters.title}>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2">
                  <IconFilter size={18} className="mt-[2px] text-gray-500" />
                  <span>{t.filters.bullets[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCircleCheck
                    size={18}
                    className="mt-[2px] text-gray-500"
                  />
                  <span>{t.filters.bullets[1]}</span>
                </li>
              </ul>
            </Section>

            <Section id="export" title={t.export.title}>
              <div className="grid gap-3">
                <div className="flex items-start gap-2">
                  <IconTableExport
                    size={18}
                    className="mt-[2px] text-gray-500"
                  />
                  <div>
                    <div className="font-medium">{t.export.csvTitle}</div>
                    <p>
                      {t.export.csvP}{" "}
                      <code className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[12px] dark:bg-white/10">
                        {sampleCsvHeader}
                      </code>
                      <button
                        onClick={() => copy(sampleCsvHeader)}
                        className="ml-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50 dark:border-white/10 dark:bg-white/5"
                      >
                        {t.export.copy}
                      </button>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <IconCalendarEvent
                    size={18}
                    className="mt-[2px] text-gray-500"
                  />
                  <div>
                    <div className="font-medium">{t.export.icsTitle}</div>
                    <p>{t.export.icsP}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <IconDatabaseImport
                    size={18}
                    className="mt-[2px] text-gray-500"
                  />
                  <div>
                    <div className="font-medium">{t.export.importTitle}</div>
                    <p>{t.export.importP}</p>
                  </div>
                </div>
              </div>
              <Callout tone="warning">
                <p>{t.export.warn}</p>
              </Callout>
            </Section>

            {/* Conflicts */}
            <Section id="conflicts" title={t.conflicts.title}>
              <p>{t.conflicts.p}</p>
            </Section>

            {/* Views/Snapshots */}
            <Section id="views" title={t.views.title}>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2">
                  <IconDeviceFloppy
                    size={18}
                    className="mt-[2px] text-gray-500"
                  />
                  <span>{t.views.bullets[0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconAdjustmentsHorizontal
                    size={18}
                    className="mt-[2px] text-gray-500"
                  />
                  <span>{t.views.bullets[1]}</span>
                </li>
              </ul>
            </Section>

            <Section id="faq" title={t.faq.title}>
              <div className="space-y-2">
                {t.faq.items.map((f, idx) => (
                  <FAQItem key={idx} q={f.q} a={f.a} />
                ))}
              </div>
              <Callout tone="tip">
                <p>{t.faq.tip}</p>
              </Callout>
            </Section>

            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 text-sm text-gray-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              {t.footer}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
