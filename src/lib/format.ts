export function money(amount: number) {
  return `${amount.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م`;
}

// Plain numeric-looking keys ("01".."12") get silently reordered by JS engines
// (integer-like keys sort numerically before other string keys), so month
// order must always be driven by this array, never by Object.keys/entries.
export const MONTH_ORDER = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
] as const;

export const MONTH_NAMES: Record<string, string> = {
  "01": "يناير",
  "02": "فبراير",
  "03": "مارس",
  "04": "ابريل",
  "05": "مايو",
  "06": "يونيو",
  "07": "يوليو",
  "08": "أغسطس",
  "09": "سبتمبر",
  "10": "أكتوبر",
  "11": "نوفمبر",
  "12": "ديسمبر",
};

export function periodLabel(period: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;
  return MONTH_NAMES[match[2]] ?? period;
}

export function monthOptions(year: number) {
  return MONTH_ORDER.map((num) => ({
    value: `${year}-${num}`,
    label: MONTH_NAMES[num],
  }));
}
