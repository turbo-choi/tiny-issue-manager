import type { Issue, IssueFilter, IssueStatus } from "@/types/issue";

export const ISSUE_STATUSES = ["Todo", "In Progress", "Done", "Discarded"] as const satisfies readonly IssueStatus[];

export function isIssueDelayed(issue: Issue, now = Date.now()) {
  if (!issue.dueDate || issue.status === "Done" || issue.status === "Discarded") {
    return false;
  }

  return new Date(issue.dueDate).getTime() < now;
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
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
