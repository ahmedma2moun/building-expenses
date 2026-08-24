import Link from "next/link";
import { NavLinks } from "@/components/nav-links";
import { logout } from "@/app/login/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-base font-bold text-neutral-900">
            ميزانية فيلا 113
          </Link>
          <NavLinks variant="top" />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
            >
              خروج
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 pb-24 sm:pb-8">
        {children}
      </main>

      <NavLinks variant="bottom" />
    </div>
  );
}
