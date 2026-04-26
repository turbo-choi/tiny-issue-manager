import type { IssueFilter, IssueHistoryField, IssueStatus } from "@/types/issue";
import type { UserRole } from "@/types/user";

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  Todo: "할 일",
  "In Progress": "진행 중",
  Done: "완료",
  Discarded: "폐기됨",
};

export const ISSUE_FILTER_LABELS: Record<IssueFilter, string> = {
  All: "전체",
  "My Issues": "내 이슈",
  Delayed: "지연",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  lead: "리드",
  member: "멤버",
  planner: "플래너",
};

export const HISTORY_FIELD_LABELS: Record<IssueHistoryField, string> = {
  status: "상태",
  assignee: "담당자",
};

export function formatIssueStatus(value: string) {
  return ISSUE_STATUS_LABELS[value as IssueStatus] ?? value;
}

export function formatUserRole(value: string) {
  return USER_ROLE_LABELS[value as UserRole] ?? value;
}
