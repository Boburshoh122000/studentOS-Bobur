/**
 * Format salary values for display with multi-currency support.
 *
 * USD  → "$50,000 - $65,000/yr"
 * UZS  → "3,000,000 - 5,000,000 so'm/oy"
 * EUR  → "€3,000 - €5,000/mo"
 */

const PERIOD_LABELS: Record<string, Record<string, string>> = {
  USD: { MONTHLY: '/mo', YEARLY: '/yr', HOURLY: '/hr', WEEKLY: '/wk' },
  UZS: { MONTHLY: '/oy', YEARLY: '/yil', HOURLY: '/soat', WEEKLY: '/hafta' },
  EUR: { MONTHLY: '/mo', YEARLY: '/yr', HOURLY: '/hr', WEEKLY: '/wk' },
};

const CURRENCY_PREFIX: Record<string, string> = {
  USD: '$',
  UZS: '',
  EUR: '€',
};

const CURRENCY_SUFFIX: Record<string, string> = {
  USD: '',
  UZS: " so'm",
  EUR: '',
};

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatSalary(
  min?: number | null,
  max?: number | null,
  currency?: string | null,
  period?: string | null
): string {
  const cur = currency || 'USD';
  const per = (period || 'YEARLY').toUpperCase();

  if (!min && !max) return 'Competitive';

  const prefix = CURRENCY_PREFIX[cur] ?? '$';
  const suffix = CURRENCY_SUFFIX[cur] ?? '';
  const periodLabel =
    PERIOD_LABELS[cur]?.[per] ?? PERIOD_LABELS['USD']?.[per] ?? `/${per.toLowerCase()}`;

  if (min && max && min !== max) {
    return `${prefix}${fmt(min)} - ${prefix}${fmt(max)}${suffix}${periodLabel}`;
  }

  const val = min || max || 0;
  return `${prefix}${fmt(val)}${suffix}${periodLabel}`;
}

/** Short currency label for dropdowns */
export const CURRENCY_OPTIONS = [
  { value: 'UZS', label: "🇺🇿 UZS — O'zbek so'mi" },
  { value: 'USD', label: '🇺🇸 USD — US Dollar' },
  { value: 'EUR', label: '🇪🇺 EUR — Euro' },
] as const;
