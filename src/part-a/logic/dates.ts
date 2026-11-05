import type { IFormatDayOptions } from "./dates.type";

const DAY_MS = 86_400_000;

export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY_MS).toISOString();
}

export function formatDay(iso: string, now: Date, options?: IFormatDayOptions): string {
  const { locale, timeZone } = options ?? {};
  const yearFormatter = new Intl.DateTimeFormat(locale, { year: "numeric", timeZone });
  const date = new Date(iso);
  const dateYear = yearFormatter.formatToParts(date).find((part) => part.type === "year")?.value;
  const nowYear = yearFormatter.formatToParts(now).find((part) => part.type === "year")?.value;
  const differentYear = dateYear !== nowYear;

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(differentYear && { year: "numeric" }),
    timeZone,
  }).format(date);
}
