"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/nav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-paper-raised lg:flex lg:flex-col">
        <div className="border-b border-line px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Galon &amp; Gas LPG
          </p>
          <p className="text-sm font-medium text-ink-soft">Panel Dispatcher</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-soft hover:bg-paper hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <button onClick={handleLogout} className="btn-secondary w-full text-sm">
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-line bg-paper-raised px-4 py-3 lg:hidden">
          <p className="text-sm font-semibold text-ink">Panel Dispatcher</p>
          <button
            className="btn-secondary px-3 py-1.5 text-sm"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? "Tutup" : "Menu"}
          </button>
        </header>
        {menuOpen && (
          <nav id="mobile-nav" className="border-b border-line bg-paper-raised px-4 py-2 lg:hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-2 py-2 text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="mt-1 block w-full rounded-md px-2 py-2 text-left text-sm font-medium text-danger hover:bg-danger/5"
            >
              Keluar
            </button>
          </nav>
        )}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
