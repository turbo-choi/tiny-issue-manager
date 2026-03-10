"use client";

import { useEffect, useMemo, useState } from "react";

import { ISSUE_STATUSES, formatShortDate, isIssueDelayed, normalizeDueDate } from "@/lib/issue-utils";
import {
  deleteIssue as deleteIssueRequest,
  listIssueHistory as listIssueHistoryRequest,
  updateIssue as updateIssueRequest,
} from "@/lib/issue-service";
import type { SessionUser } from "@/types/auth";
import type {
  Issue,
  IssueHistoryEntry,
  IssueHistoryFilter,
  IssueHistoryPagination,
  IssueHistoryPeriod,
  IssueStatus,
} from "@/types/issue";
import type { ManagedUser } from "@/types/user";

const HISTORY_PAGE_SIZE = 5;
const HISTORY_FILTERS: Array<{ label: string; value: IssueHistoryFilter }> = [
  { label: "All", value: "all" },
  { label: "Status", value: "status" },
  { label: "Assignee", value: "assignee" },
];
const HISTORY_PERIODS: Array<{ label: string; value: IssueHistoryPeriod }> = [
  { label: "All time", value: "all" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateInputValue(value: string) {
  return normalizeDueDate(value);
}

function historyFieldLabel(field: IssueHistoryEntry["field"]) {
  if (field === "status") {
    return "Status";
  }
  return "Assignee";
}

function canEditIssue(user: SessionUser | null, issue: Issue) {
  if (!user) {
    return false;
  }
  if (user.role === "lead") {
    return true;
  }
  if (user.role === "planner") {
    return false;
  }
  return issue.creatorId === user.id || issue.assigneeId === user.id;
}

function canDeleteIssue(user: SessionUser | null, issue: Issue) {
  if (!user) {
    return false;
  }
  if (user.role === "lead") {
    return true;
  }
  if (user.role === "planner") {
    return false;
  }
  return issue.creatorId === user.id;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-sand px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function IssueDetailDialog({
  issue,
  user,
  assigneeOptions,
  onIssueUpdated,
  onIssueDiscarded,
  onClose,
}: {
  issue: Issue | null;
  user: SessionUser | null;
  assigneeOptions: ManagedUser[];
  onIssueUpdated: (issue: Issue) => void;
  onIssueDiscarded: (issue: Issue) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<{
    title: string;
    description: string;
    assigneeId: string;
    dueDate: string;
    status: IssueStatus;
  }>({
    title: "",
    description: "",
    assigneeId: "",
    dueDate: "",
    status: "Todo",
  });
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [history, setHistory] = useState<IssueHistoryEntry[]>([]);
  const [historyFilter, setHistoryFilter] = useState<IssueHistoryFilter>("all");
  const [historyPeriod, setHistoryPeriod] = useState<IssueHistoryPeriod>("all");
  const [historyFromInput, setHistoryFromInput] = useState("");
  const [historyToInput, setHistoryToInput] = useState("");
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState<IssueHistoryPagination>({
    page: 1,
    pageSize: HISTORY_PAGE_SIZE,
    total: 0,
    hasNext: false,
  });
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!issue) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [issue, onClose]);

  useEffect(() => {
    if (!issue) {
      return;
    }

    setForm({
      title: issue.title,
      description: issue.description,
      assigneeId: issue.assigneeId,
      dueDate: toDateInputValue(issue.dueDate),
      status: issue.status,
    });
    setError("");
  }, [issue]);

  useEffect(() => {
    if (!issue) {
      return;
    }
    setHistoryFilter("all");
    setHistoryPeriod("all");
    setHistoryFromInput("");
    setHistoryToInput("");
    setHistoryFrom("");
    setHistoryTo("");
    setHistoryPage(1);
  }, [issue?.id]);

  useEffect(() => {
    if (!issue) {
      setHistory([]);
      setHistoryError("");
      return;
    }

    const targetIssueId = issue.id;
    let active = true;
    async function loadHistory() {
      try {
        setIsHistoryLoading(true);
        setHistoryError("");
        const result = await listIssueHistoryRequest(targetIssueId, {
          filter: historyFilter,
          period: historyPeriod,
          from: historyFrom || undefined,
          to: historyTo || undefined,
          page: historyPage,
          pageSize: HISTORY_PAGE_SIZE,
        });
        if (active) {
          setHistory(result.history);
          setHistoryPagination(result.pagination);
        }
      } catch (loadError) {
        if (active) {
          setHistoryError(loadError instanceof Error ? loadError.message : "History could not be loaded.");
        }
      } finally {
        if (active) {
          setIsHistoryLoading(false);
        }
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [issue, historyFilter, historyPeriod, historyFrom, historyTo, historyPage]);

  if (!issue) {
    return null;
  }

  const delayed = isIssueDelayed(issue);
  const issueId = issue.id;
  const editable = canEditIssue(user, issue);
  const deletable = canDeleteIssue(user, issue) && issue.status !== "Discarded";
  const canSubmit = editable && !!form.title.trim() && !!form.assigneeId && !!form.dueDate;
  const selectedAssigneeName = useMemo(
    () => assigneeOptions.find((assignee) => assignee.id === form.assigneeId)?.name ?? issue.assigneeName,
    [assigneeOptions, form.assigneeId, issue.assigneeName],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-4 sm:items-center sm:justify-center"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-line bg-paper p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Issue detail</p>
            <h2 id="issue-detail-title" className="text-2xl font-semibold text-ink">
              {issue.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-accent hover:text-accent"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {issue.status}
          </span>
          {delayed ? (
            <span className="rounded-full bg-alertSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-alert">
              Delayed
            </span>
          ) : null}
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            {issue.id}
          </span>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!editable || !canSubmit) {
              return;
            }
            try {
              setIsSaving(true);
              setError("");
              const updated = await updateIssueRequest(issueId, {
                title: form.title,
                description: form.description,
                assigneeId: form.assigneeId,
                dueDate: form.dueDate,
                status: form.status,
              });
              onIssueUpdated(updated);
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Issue could not be updated.");
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</span>
              <select
                disabled={!editable}
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value as IssueStatus }))
                }
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-slate-500"
              >
                {ISSUE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Assignee</span>
              <select
                disabled={!editable}
                value={form.assigneeId}
                onChange={(event) => setForm((current) => ({ ...current, assigneeId: event.target.value }))}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-slate-500"
              >
                <option value="">Select assignee</option>
                {assigneeOptions.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name} ({assignee.role})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Title</span>
              <input
                disabled={!editable}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Due date</span>
              <input
                disabled={!editable}
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-slate-500"
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Description</span>
              <textarea
                disabled={!editable}
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-slate-500"
              />
            </label>
          </div>

          {!editable ? (
            <p className="rounded-2xl bg-sand px-4 py-3 text-sm text-slate-600">
              You can review this issue, but your role does not allow editing this ticket.
            </p>
          ) : null}

          {error ? <p className="rounded-2xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2">
            {editable ? (
              <button
                type="submit"
                disabled={isSaving || isDeleting || !canSubmit}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            ) : null}
            {deletable ? (
              <button
                type="button"
                disabled={isSaving || isDeleting}
                onClick={async () => {
                  if (!window.confirm("Discard this issue? It will stay in history and be marked as discarded.")) {
                    return;
                  }
                  try {
                    setIsDeleting(true);
                    setError("");
                    const discardedIssue = await deleteIssueRequest(issueId);
                    onIssueDiscarded(discardedIssue);
                    onClose();
                  } catch (deleteError) {
                    setError(deleteError instanceof Error ? deleteError.message : "Issue could not be discarded.");
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="rounded-full border border-alert px-4 py-2 text-sm font-medium text-alert transition hover:bg-alertSoft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Discarding..." : "Discard issue"}
              </button>
            ) : null}
          </div>
        </form>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <DetailField label="Status" value={form.status} />
          <DetailField label="Owner" value={selectedAssigneeName} />
          <DetailField label="Creator" value={issue.creatorName} />
          <DetailField label="Due date" value={formatShortDate(issue.dueDate)} />
          <DetailField label="Created" value={formatDateTime(issue.createdAt)} />
          <DetailField label="Updated" value={formatDateTime(issue.updatedAt)} />
        </dl>

        <section className="mt-5 rounded-[28px] border border-line bg-white p-5">
          <div className="mb-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Change history</p>
            <h3 className="mt-1 text-lg font-semibold text-ink">Status and assignee updates</h3>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {HISTORY_FILTERS.map((entry) => {
              const active = historyFilter === entry.value;
              return (
                <button
                  key={entry.value}
                  type="button"
                  onClick={() => {
                    setHistoryFilter(entry.value);
                    setHistoryPage(1);
                  }}
                  className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                    active
                      ? "bg-accent text-white"
                      : "border border-line bg-paper text-slate-600 hover:border-accent hover:text-accent"
                  }`}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {HISTORY_PERIODS.map((entry) => {
              const active = historyPeriod === entry.value;
              return (
                <button
                  key={entry.value}
                  type="button"
                  onClick={() => {
                    setHistoryPeriod(entry.value);
                    setHistoryFromInput("");
                    setHistoryToInput("");
                    setHistoryFrom("");
                    setHistoryTo("");
                    setHistoryPage(1);
                  }}
                  className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                    active
                      ? "bg-ink text-white"
                      : "border border-line bg-paper text-slate-600 hover:border-accent hover:text-accent"
                  }`}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>

          <div className="mb-3 rounded-2xl border border-line bg-paper p-3">
            <p className="mb-2 text-xs uppercase tracking-[0.15em] text-slate-500">Custom range</p>
            <div className="flex flex-wrap items-end gap-2">
              <label className="space-y-1">
                <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500">From</span>
                <input
                  type="date"
                  value={historyFromInput}
                  onChange={(event) => setHistoryFromInput(event.target.value)}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-accent"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500">To</span>
                <input
                  type="date"
                  value={historyToInput}
                  onChange={(event) => setHistoryToInput(event.target.value)}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-accent"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  if (
                    historyFromInput &&
                    historyToInput &&
                    new Date(historyFromInput).getTime() > new Date(historyToInput).getTime()
                  ) {
                    setHistoryError("`from` date must be before or equal to `to` date.");
                    return;
                  }
                  setHistoryError("");
                  setHistoryPeriod("all");
                  setHistoryFrom(historyFromInput);
                  setHistoryTo(historyToInput);
                  setHistoryPage(1);
                }}
                className="rounded-full bg-ink px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-accent"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setHistoryError("");
                  setHistoryFromInput("");
                  setHistoryToInput("");
                  setHistoryFrom("");
                  setHistoryTo("");
                  setHistoryPage(1);
                }}
                className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 transition hover:border-accent hover:text-accent"
              >
                Clear
              </button>
            </div>
          </div>

          {historyError ? <p className="rounded-2xl bg-alertSoft px-4 py-3 text-sm text-alert">{historyError}</p> : null}

          {isHistoryLoading ? (
            <p className="rounded-2xl bg-sand px-4 py-5 text-sm text-slate-600">Loading change history...</p>
          ) : history.length === 0 ? (
            <p className="rounded-2xl bg-sand px-4 py-5 text-sm text-slate-600">
              No status or assignee changes have been recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              <ul className="space-y-2">
                {history.map((entry) => (
                  <li key={entry.id} className="rounded-2xl border border-line bg-paper px-4 py-3">
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{entry.actorName}</span>
                      <span className="text-slate-500"> ({entry.actorRole}) changed </span>
                      <span className="font-semibold">{historyFieldLabel(entry.field)}</span>
                      <span className="text-slate-500"> from </span>
                      <span className="font-semibold">{entry.fromValue}</span>
                      <span className="text-slate-500"> to </span>
                      <span className="font-semibold">{entry.toValue}</span>
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-400">{formatDateTime(entry.createdAt)}</p>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand px-4 py-3">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Page {historyPagination.page} · Total {historyPagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={historyPagination.page <= 1 || isHistoryLoading}
                    onClick={() => setHistoryPage((current) => Math.max(1, current - 1))}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={!historyPagination.hasNext || isHistoryLoading}
                    onClick={() => setHistoryPage((current) => current + 1)}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
