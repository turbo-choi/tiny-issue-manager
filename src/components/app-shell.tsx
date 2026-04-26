"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/hooks/use-session";
import { formatUserRole } from "@/lib/i18n";

const NAV_ITEMS = [
  { href: "/board", label: "업무 보드" },
  { href: "/dashboard", label: "대시보드" },
  { href: "/users", label: "사용자", role: "lead" as const },
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
      <header className="mb-6 rounded-xl border border-line bg-paper p-4 shadow-nav sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              간단 이슈 관리
            </p>
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-brand">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
            </div>
          </div>
          <div className="space-y-4 lg:text-right">
            <div className="rounded-xl border border-line bg-ceramic px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">로그인 계정</p>
              <p className="mt-1 text-sm font-semibold text-body">{user?.name ?? "게스트"}</p>
              <p className="text-sm text-muted">{user?.email ?? "세션 없음"}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-accent">
                {user ? formatUserRole(user.role) : "게스트"}
              </p>
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
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      isActive
                        ? "bg-accent text-white"
                        : "border border-line bg-white text-body hover:border-accent hover:text-accent"
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
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-body hover:border-alert hover:text-alert"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
