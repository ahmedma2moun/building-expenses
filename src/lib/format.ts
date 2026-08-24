export function money(amount: number) {
  return `${amount.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م`;
}

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
  return Object.entries(MONTH_NAMES).map(([num, name]) => ({
    value: `${year}-${num}`,
    label: name,
  }));
}
