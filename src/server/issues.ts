import type { SessionUser } from "@/types/auth";
import { normalizeDueDate } from "@/lib/issue-utils";
import type { CreateIssueInput, IssueStatus, UpdateIssueInput } from "@/types/issue";
import { createIssue, createIssueEvents, findIssue, getUserById, listIssueEvents, listIssues, updateIssue } from "@/server/db";

export function listIssuesForUser() {
  return listIssues();
}

export function createIssueForUser(input: CreateIssueInput, user: SessionUser) {
  const title = input.title.trim();
  const assignee = getUserById(input.assigneeId);
  const dueDate = normalizeDueDate(input.dueDate);

  if (!title || !input.assigneeId || !input.dueDate) {
    throw new Error("Title, assignee, and due date are required.");
  }
  if (!assignee || !assignee.isActive) {
    throw new Error("Assignee must be an active user.");
  }
  if (!dueDate) {
    throw new Error("Due date is invalid.");
  }

  return createIssue({
    title,
    description: input.description.trim(),
    creatorId: user.id,
    creatorName: user.name,
    assigneeId: assignee.id,
    assigneeName: assignee.name,
    dueDate,
  });
}

export function canUpdateIssue(user: SessionUser, issueId: string) {
  if (user.role === "lead") {
    return true;
  }

  if (user.role === "planner") {
    return false;
  }

  const issue = findIssue(issueId);
  if (!issue) {
    return false;
  }

  return issue.creatorId === user.id || issue.assigneeId === user.id;
}

export function canDeleteIssue(user: SessionUser, issueId: string) {
  if (user.role === "lead") {
    return true;
  }

  const issue = findIssue(issueId);
  if (!issue) {
    return false;
  }

  if (user.role === "planner") {
    return false;
  }

  return issue.creatorId === user.id;
}

export function updateIssueStatusForUser(user: SessionUser, id: string, status: IssueStatus) {
  return updateIssueForUser(user, id, { status });
}

export function updateIssueForUser(user: SessionUser, id: string, input: UpdateIssueInput) {
  if (!canUpdateIssue(user, id)) {
    throw new Error("You do not have permission to update this issue.");
  }

  const updates: UpdateIssueInput = {};

  if (typeof input.title === "string") {
    const title = input.title.trim();
    if (!title) {
      throw new Error("Title cannot be empty.");
    }
    updates.title = title;
  }

  if (typeof input.description === "string") {
    updates.description = input.description.trim();
  }

  if (typeof input.status === "string") {
    updates.status = input.status;
  }

  if (typeof input.dueDate === "string") {
    const dueDate = normalizeDueDate(input.dueDate);
    if (!dueDate) {
      throw new Error("Due date is invalid.");
    }
    updates.dueDate = dueDate;
  }

  let assigneeName: string | undefined;
  if (typeof input.assigneeId === "string") {
    const assignee = getUserById(input.assigneeId);
    if (!assignee || !assignee.isActive) {
      throw new Error("Assignee must be an active user.");
    }
    updates.assigneeId = assignee.id;
    assigneeName = assignee.name;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("At least one editable field is required.");
  }

  const beforeIssue = findIssue(id);
  if (!beforeIssue) {
    throw new Error("Issue not found.");
  }

  const updatedIssue = updateIssue(id, {
    ...updates,
    assigneeName,
  });

  const historyEntries: Array<{
    issueId: string;
    actorId: string;
    actorName: string;
    actorRole: SessionUser["role"];
    field: "status" | "assignee";
    fromValue: string;
    toValue: string;
  }> = [];

  if (beforeIssue.status !== updatedIssue.status) {
    historyEntries.push({
      issueId: updatedIssue.id,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      field: "status",
      fromValue: beforeIssue.status,
      toValue: updatedIssue.status,
    });
  }

  if (beforeIssue.assigneeId !== updatedIssue.assigneeId) {
    historyEntries.push({
      issueId: updatedIssue.id,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      field: "assignee",
      fromValue: beforeIssue.assigneeName,
      toValue: updatedIssue.assigneeName,
    });
  }

  createIssueEvents(historyEntries);
  return updatedIssue;
}

export function deleteIssueForUser(user: SessionUser, id: string) {
  if (!canDeleteIssue(user, id)) {
    throw new Error("You do not have permission to delete this issue.");
  }

  return updateIssueForUser(user, id, { status: "Discarded" });
}

export function listIssueHistoryForUser(
  _: SessionUser,
  id: string,
  options: {
    field?: "status" | "assignee";
    lookbackDays?: 7 | 30;
    fromIso?: string;
    toIso?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const issue = findIssue(id);
  if (!issue) {
    throw new Error("Issue not found.");
  }
  return listIssueEvents(id, options);
}
