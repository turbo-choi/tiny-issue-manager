import type { Issue, IssueFilter, IssueStatus } from "@/types/issue";

export const ISSUE_STATUSES = ["Todo", "In Progress", "Done", "Discarded"] as const satisfies readonly IssueStatus[];
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatDateParts(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDueDateParts(value: string) {
  const normalized = normalizeDueDate(value);
  if (!normalized) {
    return null;
  }

  const [year, month, day] = normalized.split("-").map((part) => Number.parseInt(part, 10));
  return { year, month, day };
}

export function normalizeDueDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (DATE_ONLY_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  if (trimmed.includes("T")) {
    return trimmed.slice(0, 10);
  }

  return formatDateParts(parsed);
}

export function isIssueDelayed(issue: Issue, now = new Date()) {
  if (!issue.dueDate || issue.status === "Done" || issue.status === "Discarded") {
    return false;
  }

  const dueDate = normalizeDueDate(issue.dueDate);
  if (!dueDate) {
    return false;
  }

  return dueDate < formatDateParts(now);
}

export function formatShortDate(value: string) {
  const parts = parseDueDateParts(value);
  if (!parts) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)));
}

export function getNextStatus(status: IssueStatus): IssueStatus {
  if (status === "Todo") {
    return "In Progress";
  }
  if (status === "In Progress") {
    return "Done";
  }
  if (status === "Done") {
    return "Todo";
  }
  return "Todo";
}

export function matchesFilter(issue: Issue, filter: IssueFilter, userId: string) {
  if (filter === "Delayed") {
    return isIssueDelayed(issue);
  }

  if (filter === "My Issues") {
    return issue.creatorId === userId || issue.assigneeId === userId;
  }

  return true;
}
