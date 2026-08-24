import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Residents. Base names deduped across the three source sheets; "شريف" and
// "سهام العجلتي" only appear in the general fund sheet (they replaced
// "جورج" / "عبد الرحمن" there), so they're seeded as residents too.
const RESIDENTS = [
  { key: "mohamed_fawzy", name: "محمد فوزي", isResident: true },
  { key: "abdelrahman_yasser", name: "عبد الرحمن ياسر", isResident: true, note: "مستأجرة" },
  { key: "ahmed_mamoun", name: "أحمد مأمون", isResident: true },
  { key: "mahmoud", name: "محمود", isResident: true },
  { key: "essam", name: "عصام", isResident: true },
  { key: "mohamed_anwar", name: "محمد أنور", isResident: true },
  { key: "carter", name: "كارتر", isResident: false },
  { key: "george", name: "جورج", isResident: false },
  { key: "sherif", name: "شريف", isResident: false },
  { key: "tarek", name: "طارق", isResident: false },
  { key: "asmaa", name: "اسماء", isResident: false },
  { key: "marvat", name: "مرفت", isResident: false },
  { key: "abdelrahman", name: "عبد الرحمن", isResident: false },
  { key: "siham", name: "سهام العجلتي", isResident: false },
] as const;

type ResidentKey = (typeof RESIDENTS)[number]["key"];

const MONTHS_2026 = ["01", "02", "03", "04", "05", "06", "07", "08", "09"] as const;
const MONTHLY_PAYERS_2026: ResidentKey[] = [
  "mohamed_fawzy",
  "ahmed_mamoun",
  "mahmoud",
  "essam",
  "mohamed_anwar",
];

const MONTHS_2025 = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
] as const;
// month -> resident keys who paid 250 that month
const MONTHLY_PAYMENTS_2025: Record<string, ResidentKey[]> = {
  "01": ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar", "asmaa"],
  "02": ["mohamed_fawzy", "abdelrahman_yasser", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar", "asmaa"],
  "03": ["mohamed_fawzy", "abdelrahman_yasser", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar", "asmaa"],
  "04": ["mohamed_fawzy", "abdelrahman_yasser", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar"],
  "05": ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar"],
  "06": ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar"],
  "07": ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar"],
  "08": ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar"],
  "09": ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar"],
  "10": ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar"],
  "11": ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar"],
  "12": ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar"],
};

const EXPENSES_2026 = [
  { item: "شهرية محمد", date: "2026-01-01", amount: 1000 },
  { item: "تغيير اضاءة", date: "2026-01-01", amount: 100 },
  { item: "نت الكاميرات", date: "2026-01-18", amount: 250 },
  { item: "شهرية محمد", date: "2026-02-01", amount: 1000 },
  { item: "شهرية محمد", date: "2026-03-01", amount: 1000 },
  { item: "شهرية محمد", date: "2026-04-01", amount: 1000 },
  { item: "نت", date: "2026-01-01", amount: 250 },
  { item: "شهرية محمد", date: "2026-05-01", amount: 1000 },
  { item: "صيانة اضاءة", date: "2026-05-01", amount: 300 },
  { item: "شهرية محمد", date: "2026-06-01", amount: 1000 },
  { item: "ادوات تنظيف", date: "2026-06-01", amount: 100 },
  { item: "كهرباء", date: "2026-06-02", amount: 620 },
  { item: "شهرية محمد", date: "2026-07-01", amount: 1000 },
  { item: "انترنت", date: "2026-07-01", amount: 250 },
  { item: "شهرية محمد", date: "2026-08-01", amount: 1000 },
  { item: "حديقة", date: "2026-08-01", amount: 500 },
];

const EXPENSES_2025 = [
  { item: "شهرية محمد", date: "2025-01-01", amount: 1000 },
  { item: "ادوات تنظيف", date: "2025-01-08", amount: 35 },
  { item: "شهرية محمد", date: "2025-01-01", amount: 1000 },
  { item: "زينة رمضان", date: "2025-02-27", amount: 700 },
  { item: "شهرية محمد", date: "2025-03-01", amount: 1000 },
  { item: "منظفات", date: "2025-03-20", amount: 50 },
  { item: "شهرية محمد", date: "2025-04-01", amount: 1000 },
  { item: "نت العمارة", date: "2025-05-01", amount: 100 },
  { item: "شهرية محمد", date: "2025-05-01", amount: 1000 },
  { item: "منظفات", date: "2025-05-13", amount: 115 },
  { item: "شهرية محمد", date: "2025-06-01", amount: 1000 },
  { item: "جنينة", date: "2025-06-01", amount: 300 },
  { item: "منظفات", date: "2025-06-01", amount: 80 },
  { item: "جرار نظافة", date: "2025-06-01", amount: 150 },
  { item: "نت ثلاث شهور", date: "2025-07-01", amount: 250 },
  { item: "شهرية محمد", date: "2025-07-01", amount: 1000 },
  { item: "شهرية محمد", date: "2025-08-01", amount: 1000 },
  { item: "شهرية محمد", date: "2025-09-01", amount: 1000 },
  { item: "جنينة", date: "2025-09-18", amount: 350 },
  { item: "انارة", date: "2025-09-18", amount: 150 },
  { item: "شهرية محمد", date: "2025-10-01", amount: 1000 },
  { item: "نت ثلاث شهور", date: "2025-10-01", amount: 250 },
  { item: "شهرية محمد", date: "2025-11-01", amount: 1000 },
  { item: "شهرية محمد", date: "2025-12-01", amount: 1000 },
];

// The fund ("الصندوق") pays for one-off projects (cameras, entrance, gates)
// funded by lump-sum installments rather than a monthly fee.
const FUND_INSTALLMENTS: { label: string; amount: number; payers: ResidentKey[] }[] = [
  {
    label: "الدفعة الأولى",
    amount: 1500,
    payers: ["mohamed_fawzy", "abdelrahman_yasser", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar", "carter", "sherif", "tarek", "asmaa", "siham"],
  },
  {
    label: "الدفعة الثانية",
    amount: 300,
    payers: ["mohamed_fawzy", "abdelrahman_yasser", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar", "carter", "sherif", "tarek", "asmaa", "siham"],
  },
  {
    label: "الدفعة الثالثة",
    amount: 3000,
    payers: ["mohamed_fawzy", "abdelrahman_yasser", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar", "carter", "sherif", "tarek", "asmaa", "siham"],
  },
  {
    label: "الدفعة الرابعة",
    amount: 400,
    payers: ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar", "sherif", "tarek", "asmaa", "siham"],
  },
  {
    label: "الدفعة الخامسة",
    amount: 400,
    payers: ["mohamed_fawzy", "ahmed_mamoun", "mahmoud", "essam", "mohamed_anwar", "sherif", "tarek", "asmaa", "siham"],
  },
];

const FUND_EXPENSES = [
  { item: "خامات كاميرات", date: "2025-04-11", amount: 10000 },
  { item: "خامات و تركيب ٢", date: "2025-04-12", amount: 6930 },
  { item: "تصليح عتبة", date: "2025-05-15", amount: 1000 },
  { item: "خامات حجر المدخل + نقل", date: "2025-07-23", amount: 18480 },
  { item: "تخت حساب مصنعية محمد", date: "2025-07-24", amount: 1000 },
  { item: "خامات مدخل", date: "2025-07-31", amount: 680 },
  { item: "مصنعية محمد و بقية الخامات والايجارات", date: "2025-08-03", amount: 7000 },
  { item: "اضاءة", date: "2025-08-03", amount: 580 },
  { item: "مصاريف العداد تحت الحساب", date: "2025-12-01", amount: 1000 },
  { item: "باقي مصاريف العداد", date: "2025-12-08", amount: 1350 },
  { item: "صيانة الكاميرات", date: "2025-02-13", amount: 850 },
  { item: "توضيب مدخل", date: "2026-04-09", amount: 285 },
  { item: "كالون", date: "2026-08-05", amount: 450 },
  { item: "صيانة بوابات", date: "2026-08-05", amount: 700 },
];

async function main() {
  const residentIds = new Map<ResidentKey, string>();

  for (const r of RESIDENTS) {
    const created = await prisma.resident.upsert({
      where: { id: r.key },
      update: {},
      create: {
        id: r.key,
        name: r.name,
        isResident: r.isResident,
        note: "note" in r ? r.note : null,
      },
    });
    residentIds.set(r.key, created.id);
  }

  // --- 2026 monthly budget ---
  const budget2026 = await prisma.budget.upsert({
    where: { id: "monthly-2026" },
    update: {},
    create: {
      id: "monthly-2026",
      name: "الميزانية الشهرية 2026",
      type: "MONTHLY",
      year: 2026,
      targetAmount: 12770,
    },
  });

  for (const month of MONTHS_2026) {
    for (const key of MONTHLY_PAYERS_2026) {
      await prisma.contribution.create({
        data: {
          budgetId: budget2026.id,
          residentId: residentIds.get(key)!,
          amount: 250,
          period: `2026-${month}`,
          paidDate: new Date(`2026-${month}-01`),
        },
      });
    }
  }

  for (const e of EXPENSES_2026) {
    await prisma.expense.create({
      data: { budgetId: budget2026.id, item: e.item, amount: e.amount, date: new Date(e.date) },
    });
  }

  // --- 2025 monthly budget ---
  const budget2025 = await prisma.budget.upsert({
    where: { id: "monthly-2025" },
    update: {},
    create: {
      id: "monthly-2025",
      name: "الميزانية الشهرية 2025",
      type: "MONTHLY",
      year: 2025,
      targetAmount: 16050,
    },
  });

  for (const month of MONTHS_2025) {
    const payers = MONTHLY_PAYMENTS_2025[month] ?? [];
    for (const key of payers) {
      const amount = key === "asmaa" ? 100 : 250;
      await prisma.contribution.create({
        data: {
          budgetId: budget2025.id,
          residentId: residentIds.get(key)!,
          amount,
          period: `2025-${month}`,
          paidDate: new Date(`2025-${month}-01`),
        },
      });
    }
  }

  for (const e of EXPENSES_2025) {
    await prisma.expense.create({
      data: { budgetId: budget2025.id, item: e.item, amount: e.amount, date: new Date(e.date) },
    });
  }

  // --- General fund (الصندوق) ---
  const fund = await prisma.budget.upsert({
    where: { id: "fund-cameras-entrance" },
    update: {},
    create: {
      id: "fund-cameras-entrance",
      name: "الصندوق - كاميرات ومدخل وبوابات",
      type: "GENERAL",
      targetAmount: 60000,
    },
  });

  for (const installment of FUND_INSTALLMENTS) {
    for (const key of installment.payers) {
      await prisma.contribution.create({
        data: {
          budgetId: fund.id,
          residentId: residentIds.get(key)!,
          amount: installment.amount,
          period: installment.label,
        },
      });
    }
  }

  for (const e of FUND_EXPENSES) {
    await prisma.expense.create({
      data: { budgetId: fund.id, item: e.item, amount: e.amount, date: new Date(e.date) },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
