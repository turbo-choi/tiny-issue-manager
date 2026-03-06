"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/hooks/use-session";

const NAV_ITEMS = [
  { href: "/board", label: "Board" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Users", role: "lead" as const },
];

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSession();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-[28px] border border-line bg-paper/90 p-4 shadow-card backdrop-blur sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Simple Issue Management
            </p>
            <div>
              <h1 className="text-3xl font-semibold text-ink">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
            </div>
          </div>
          <div className="space-y-4 lg:text-right">
            <div className="rounded-2xl border border-line bg-sand px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-ink">{user?.name ?? "Guest"}</p>
              <p className="text-sm text-slate-500">{user?.email ?? "No session"}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-accent">{user?.role ?? "guest"}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {NAV_ITEMS.map((item) => {
                if (item.role && user?.role !== item.role) {
                  return null;
                }
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-ink text-paper"
                        : "border border-line bg-white text-slate-600 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.replace("/login");
                }}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-alert hover:text-alert"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
