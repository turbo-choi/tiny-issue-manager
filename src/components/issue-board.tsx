"use client";

import { useMemo } from "react";

import { ISSUE_STATUSES, formatShortDate, getNextStatus, isIssueDelayed, matchesFilter } from "@/lib/issue-utils";
import type { SessionUser } from "@/types/auth";
import type { Issue, IssueFilter, IssueStatus } from "@/types/issue";

const FILTERS: IssueFilter[] = ["All", "My Issues", "Delayed"];

export function IssueBoard({
  issues,
  filter,
  user,
  isUpdating,
  onOpenIssue,
  onFilterChange,
  onMoveIssue,
}: {
  issues: Issue[];
  filter: IssueFilter;
  user: SessionUser;
  isUpdating: boolean;
  onOpenIssue: (issue: Issue) => void;
  onFilterChange: (filter: IssueFilter) => void;
  onMoveIssue: (id: string, status: IssueStatus) => Promise<void>;
}) {
  const visibleIssues = useMemo(
    () => issues.filter((issue) => matchesFilter(issue, filter, user.id)),
    [filter, issues, user.id],
  );

  const groupedIssues = useMemo(
    () =>
      ISSUE_STATUSES.map((status) => ({
        status,
        issues: visibleIssues.filter((issue) => issue.status === status),
      })),
    [visibleIssues],
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((entry) => {
          const active = entry === filter;
          return (
            <button
              key={entry}
              type="button"
              onClick={() => onFilterChange(entry)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-accent text-white"
                  : "border border-line bg-paper text-slate-600 hover:border-accent hover:text-accent"
              }`}
            >
              {entry}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {groupedIssues.map((column) => (
          <div
            key={column.status}
            onDragOver={(event) => event.preventDefault()}
            onDrop={async (event) => {
              event.preventDefault();
              const issueId = event.dataTransfer.getData("text/plain");
              if (issueId) {
                await onMoveIssue(issueId, column.status);
              }
            }}
            className="min-h-[380px] rounded-[28px] border border-line bg-paper p-4 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Status</p>
                <h2 className="mt-1 text-xl font-semibold text-ink">{column.status}</h2>
              </div>
              <span className="rounded-full bg-sand px-3 py-1 text-sm font-medium text-slate-500">
                {column.issues.length}
              </span>
            </div>

            <div className="space-y-3">
              {column.issues.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-line bg-sand px-4 py-8 text-center text-sm text-slate-500">
                  No issues in this lane yet.
                </div>
              ) : null}

              {column.issues.map((issue) => {
                const delayed = isIssueDelayed(issue);
                const canMoveIssue =
                  user.role === "lead" ||
                  (user.role === "member" &&
                    (issue.creatorId === user.id || issue.assigneeId === user.id));

                return (
                  <article
                    key={issue.id}
                    draggable={canMoveIssue}
                    onDragStart={(event) => {
                      if (!canMoveIssue) {
                        event.preventDefault();
                        return;
                      }
                      event.dataTransfer.setData("text/plain", issue.id);
                    }}
                    className={`rounded-3xl border border-line bg-white p-4 transition ${
                      canMoveIssue ? "cursor-grab hover:-translate-y-0.5 hover:border-accent" : "cursor-not-allowed opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          type="button"
                          onClick={() => onOpenIssue(issue)}
                          className="text-left text-base font-semibold text-ink transition hover:text-accent"
                        >
                          {issue.title}
                        </button>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{issue.description}</p>
                      </div>
                      {delayed ? (
                        <span className="rounded-full bg-alertSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-alert">
                          Delayed
                        </span>
                      ) : null}
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-sand px-3 py-2">
                        <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Owner</dt>
                        <dd className="mt-1 font-medium text-ink">{issue.assigneeName}</dd>
                      </div>
                      <div className="rounded-2xl bg-sand px-3 py-2">
                        <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Due</dt>
                        <dd className="mt-1 font-medium text-ink">{formatShortDate(issue.dueDate)}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Created by {issue.creatorName}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenIssue(issue)}
                          className="rounded-full border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:border-accent hover:text-accent"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating || !canMoveIssue}
                          onClick={() => onMoveIssue(issue.id, getNextStatus(issue.status))}
                          className="rounded-full border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {canMoveIssue ? "Next status" : "Read only"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
