import type {
  CreateIssueInput,
  Issue,
  IssueHistoryEntry,
  IssueHistoryFilter,
  IssueHistoryPagination,
  IssueHistoryPeriod,
  IssueHistoryQueryOptions,
  IssueStatus,
  UpdateIssueInput,
} from "@/types/issue";

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

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

export async function listIssues() {
  const data = await apiFetch<{ issues: Issue[] }>("/api/issues", {
    method: "GET",
    cache: "no-store",
  });
  return data.issues;
}

export async function createIssue(input: CreateIssueInput) {
  const data = await apiFetch<{ issue: Issue }>("/api/issues", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.issue;
}

export async function updateIssueStatus(id: string, status: IssueStatus) {
  const data = await apiFetch<{ issue: Issue }>(`/api/issues/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data.issue;
}

export async function updateIssue(id: string, input: UpdateIssueInput) {
  const data = await apiFetch<{ issue: Issue }>(`/api/issues/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.issue;
}

export async function deleteIssue(id: string) {
  await apiFetch<{ success: true }>(`/api/issues/${id}`, {
    method: "DELETE",
  });
}

export async function listIssueHistory(
  id: string,
  options: IssueHistoryQueryOptions = {},
) {
  const query = new URLSearchParams();
  if (options.filter && options.filter !== "all") {
    query.set("field", options.filter);
  }
  if (typeof options.page === "number") {
    query.set("page", String(options.page));
  }
  if (typeof options.pageSize === "number") {
    query.set("pageSize", String(options.pageSize));
  }
  if (options.period === "7d") {
    query.set("days", "7");
  }
  if (options.period === "30d") {
    query.set("days", "30");
  }
  if (options.from) {
    query.set("from", options.from);
  }
  if (options.to) {
    query.set("to", options.to);
  }

  const suffix = query.toString();
  const data = await apiFetch<{ history: IssueHistoryEntry[]; pagination: IssueHistoryPagination }>(
    `/api/issues/${id}/history${suffix ? `?${suffix}` : ""}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  return data;
}
