const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});
const DATE_TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const FULL_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function fmtDate(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? DATE_FMT.format(d) : "—";
}

export function fmtDateTime(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? DATE_TIME_FMT.format(d).replace(",", "") : "—";
}

export function fmtFull(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? FULL_FMT.format(d) : "—";
}

export function fmtRelative(iso: string | null | undefined, now = Date.now()): string {
  const d = parse(iso);
  if (!d) return "never";
  const diff = Math.round((now - d.getTime()) / 60000);
  if (Math.abs(diff) < 1) return "just now";
  const future = diff < 0;
  const m = Math.abs(diff);
  const text =
    m < 60 ? `${m} min` : m < 1440 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} d`;
  return future ? `in ${text}` : `${text} ago`;
}

/** ISO → value for <input type="datetime-local"> in the browser's zone */
export function toLocalInput(iso: string | null | undefined): string {
  const d = parse(iso);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
