import type { UserRole } from "@/types/user";

export type IssueStatus = "Todo" | "In Progress" | "Done";
export type IssueHistoryField = "status" | "assignee";
export type IssueHistoryFilter = "all" | IssueHistoryField;
export type IssueHistoryPeriod = "all" | "7d" | "30d";

export interface Issue {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  status: IssueStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  status?: IssueStatus;
}

export interface IssueHistoryEntry {
  id: string;
  issueId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  field: IssueHistoryField;
  fromValue: string;
  toValue: string;
  createdAt: string;
}

export interface IssueHistoryPagination {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
}

export interface IssueHistoryQueryOptions {
  filter?: IssueHistoryFilter;
  period?: IssueHistoryPeriod;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export type IssueFilter = "All" | "My Issues" | "Delayed";
