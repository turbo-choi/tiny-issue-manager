"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/hooks/use-session";

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const showSeedHint = process.env.NODE_ENV !== "production";

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6">
      <section className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[36px] border border-line bg-ink px-8 py-10 text-paper shadow-card">
          <p className="text-xs uppercase tracking-[0.32em] text-emerald-200">Quiet control</p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            Project tracking for teams that just need the essentials.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/80">
            Fast issue capture, drag-based status movement, delayed issue monitoring, and a clear personal view.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white/8 p-5">
              <p className="text-3xl font-semibold">1 min</p>
              <p className="mt-2 text-sm text-emerald-50/75">Target time to create a new issue.</p>
            </div>
            <div className="rounded-3xl bg-white/8 p-5">
              <p className="text-3xl font-semibold">2 screens</p>
              <p className="mt-2 text-sm text-emerald-50/75">Board for action, dashboard for monitoring.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[36px] border border-line bg-paper p-8 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-accent">Login</p>
              <h2 className="mt-3 text-3xl font-semibold text-ink">Open your workspace</h2>
            </div>
            <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              backend
            </span>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                setIsLoading(true);
                setError("");
                await signIn({ email, password });
                router.replace("/board");
              } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : "Login failed.");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {error ? (
            <p className="mt-4 rounded-2xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p>
          ) : null}

          {showSeedHint ? (
            <div className="mt-6 rounded-3xl bg-sand p-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-ink">Local seeded account note</p>
              <p className="mt-1">
                Local first-run data includes `team.lead@example.com`, `team.member@example.com`, and
                `team.planner@example.com`. The password defaults to `changeme123!` unless you changed
                `SEED_USER_PASSWORD`.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
