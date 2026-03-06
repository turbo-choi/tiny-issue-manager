"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/hooks/use-session";

export default function HomePage() {
  const router = useRouter();
  const { ready, user } = useSession();

  useEffect(() => {
    if (!ready) {
      return;
    }

    router.replace(user ? "/board" : "/login");
  }, [ready, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="rounded-[32px] border border-line bg-paper/90 px-8 py-10 shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Simple Issue Management</p>
        <h1 className="mt-4 text-3xl font-semibold text-ink">Preparing your workspace</h1>
        <p className="mt-3 text-sm text-slate-500">Checking session and redirecting to the right screen.</p>
      </div>
    </main>
  );
}
