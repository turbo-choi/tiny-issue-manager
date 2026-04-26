import type { CreateUserInput, ManagedUser, UpdateUserInput } from "@/types/user";

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

export async function listUsers() {
  const data = await apiFetch<{ users: ManagedUser[] }>("/api/users", {
    method: "GET",
    cache: "no-store",
  });
  return data.users;
}

export async function listAssignableUsers() {
  const data = await apiFetch<{ users: ManagedUser[] }>("/api/users?scope=assignable", {
    method: "GET",
    cache: "no-store",
  });
  return data.users;
}

export async function createUser(input: CreateUserInput) {
  const data = await apiFetch<{ user: ManagedUser }>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.user;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const data = await apiFetch<{ user: ManagedUser }>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.user;
}
