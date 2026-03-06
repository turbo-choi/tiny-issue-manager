import type { SessionUser, SignInInput } from "@/types/auth";

const SESSION_EVENT = "simple-issue-management:session-change";

function dispatchSessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

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
    let message = "Request failed.";
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
    throw new Error("Email and password are required.");
  }

  const data = await apiFetch<{ user: SessionUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  dispatchSessionChange();
  return data.user;
}

export async function signOut() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  dispatchSessionChange();
}

export async function getSessionUser() {
  try {
    const data = await apiFetch<{ user: SessionUser }>("/api/auth/me", {
      method: "GET",
      cache: "no-store",
    });
    return data.user;
  } catch {
    return null;
  }
}

export function subscribeToSessionChange(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(SESSION_EVENT, callback);
  return () => window.removeEventListener(SESSION_EVENT, callback);
}
