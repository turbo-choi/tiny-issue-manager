import type { SessionUser, SignInInput } from "@/types/auth";

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    let message = "요청에 실패했습니다.";
    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) {
        message = data.message;
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function signIn({ email, password }: SignInInput) {
  if (!email.trim() || !password.trim()) {
    throw new Error("이메일과 비밀번호를 입력해주세요.");
  }

  const data = await apiFetch<{ user: SessionUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function signOut() {
  await apiFetch("/api/auth/logout", { method: "POST" });
}
