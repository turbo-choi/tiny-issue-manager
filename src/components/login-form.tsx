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
        <div className="rounded-xl bg-ink px-8 py-10 text-white shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">간단한 업무 관리</p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            팀에 꼭 필요한 이슈 관리만 간단하게.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
            빠른 이슈 등록, 상태 이동, 지연 업무 확인, 개인 업무 보기를 한 화면 흐름으로 관리합니다.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white/10 p-5">
              <p className="text-3xl font-semibold">1분</p>
              <p className="mt-2 text-sm text-white/70">새 이슈 등록 목표 시간입니다.</p>
            </div>
            <div className="rounded-xl bg-white/10 p-5">
              <p className="text-3xl font-semibold">2개 화면</p>
              <p className="mt-2 text-sm text-white/70">보드는 실행, 대시보드는 확인에 집중합니다.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-paper p-8 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">로그인</p>
              <h2 className="mt-3 text-3xl font-semibold text-brand">워크스페이스 열기</h2>
            </div>
            <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              백엔드
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
                setError(submitError instanceof Error ? submitError.message : "로그인에 실패했습니다.");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-body">이메일</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-body">비밀번호</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {error ? (
            <p className="mt-4 rounded-xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p>
          ) : null}

          {showSeedHint ? (
            <div className="mt-6 rounded-xl bg-sand p-4 text-sm leading-6 text-muted">
              <p className="font-semibold text-body">로컬 테스트 계정 안내</p>
              <p className="mt-1">
                로컬 기본 데이터에는 `team.lead@example.com`, `team.member@example.com`,
                `team.planner@example.com` 계정이 포함됩니다. `SEED_USER_PASSWORD`를 바꾸지 않았다면
                비밀번호는 `changeme123!`입니다.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
