import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts predictably. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with locale separators and no fake precision. */
export function formatNumber(value: number, locale = "es-ES") {
  return new Intl.NumberFormat(locale).format(value);
}

/** Currency for prize pools and fees. */
export function formatMoney(
  amount: number,
  currency = "EUR",
  locale = "es-ES",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Human date, e.g. "sáb 12 abr". */
export function formatDate(iso: string, locale = "es-ES") {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

/** Long date with time, e.g. "sábado, 12 de abril, 19:30". */
export function formatDateTime(iso: string, locale = "es-ES") {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Just the clock portion, e.g. "19:30". */
export function formatTime(iso: string, locale = "es-ES") {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * Relative time in Spanish, used for "publicado hace 2 h".
 * Returns a plain string; callers render it inside a <time> element.
 */
export function timeAgo(iso: string, now = Date.now()) {
  const diff = now - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `hace ${days} d`;
  const weeks = Math.round(days / 7);
  return `hace ${weeks} sem`;
}

/** Slugify for readable route params. */
export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
