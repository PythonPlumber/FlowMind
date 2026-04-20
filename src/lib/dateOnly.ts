import { z } from "zod";

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export function dateOnlyToUTCDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map((n) => Number(n));
  return new Date(Date.UTC(y, m - 1, d));
}

export function utcDateToISODate(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const APP_TIMEZONE = "Asia/Colombo";

export function todayISODate(timeZone: string = APP_TIMEZONE) {
  // en-CA uses YYYY-MM-DD formatting.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function currentYearInTimeZone(timeZone: string = APP_TIMEZONE) {
  return Number(todayISODate(timeZone).slice(0, 4));
}

export function diffDaysUTC(a: Date, b: Date) {
  // a - b, in days, based on UTC-midnight days.
  const dayMs = 24 * 60 * 60 * 1000;
  const aDay = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bDay = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((aDay - bDay) / dayMs);
}

export function addDaysUTC(date: Date, days: number) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
