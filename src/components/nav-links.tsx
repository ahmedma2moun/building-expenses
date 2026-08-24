"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "الرئيسية", icon: "🏠" },
  { href: "/budgets", label: "الميزانيات", icon: "💰" },
  { href: "/residents", label: "السكان", icon: "👥" },
];

export function NavLinks({ variant }: { variant: "top" | "bottom" }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (variant === "bottom") {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
        <ul className="flex">
          {items.map((item) => (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                  isActive(item.href)
                    ? "text-neutral-900 font-semibold"
                    : "text-neutral-400"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <ul className="hidden items-center gap-1 sm:flex">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              isActive(item.href)
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
