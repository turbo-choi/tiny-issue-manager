"use client";

import { useMemo } from "react";

import { ISSUE_STATUSES, formatShortDate, getNextStatus, isIssueDelayed, matchesFilter } from "@/lib/issue-utils";
import { ISSUE_FILTER_LABELS, formatIssueStatus } from "@/lib/i18n";
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
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                active
                  ? "bg-accent text-white"
                  : "border border-line bg-paper text-body hover:border-accent hover:text-accent"
              }`}
            >
              {ISSUE_FILTER_LABELS[entry]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
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
            className="min-h-[380px] rounded-xl border border-line bg-paper p-4 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">상태</p>
                <h2 className="mt-1 text-xl font-semibold text-brand">{formatIssueStatus(column.status)}</h2>
              </div>
              <span className="rounded-full bg-sand px-3 py-1 text-sm font-medium text-muted">
                {column.issues.length}
              </span>
            </div>

            <div className="space-y-3">
              {column.issues.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line bg-sand px-4 py-8 text-center text-sm text-muted">
                  아직 이 단계의 이슈가 없습니다.
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
                    className={`rounded-xl border border-line bg-white p-4 transition ${
                      canMoveIssue ? "cursor-grab hover:-translate-y-0.5 hover:border-accent hover:shadow-card" : "cursor-not-allowed opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          type="button"
                          onClick={() => onOpenIssue(issue)}
                          className="text-left text-base font-semibold text-body hover:text-accent"
                        >
                          {issue.title}
                        </button>
                        <p className="mt-2 text-sm leading-6 text-muted">{issue.description}</p>
                      </div>
                      {delayed ? (
                        <span className="whitespace-nowrap rounded-full bg-alertSoft px-3 py-1 text-xs font-semibold text-alert">
                          지연
                        </span>
                      ) : null}
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-sand px-3 py-2">
                        <dt className="text-xs uppercase tracking-[0.18em] text-muted">담당자</dt>
                        <dd className="mt-1 font-medium text-body">{issue.assigneeName}</dd>
                      </div>
                      <div className="rounded-xl bg-sand px-3 py-2">
                        <dt className="text-xs uppercase tracking-[0.18em] text-muted">마감일</dt>
                        <dd className="mt-1 font-medium text-body">{formatShortDate(issue.dueDate)}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        작성자 {issue.creatorName}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenIssue(issue)}
                          className="rounded-full border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-body hover:border-accent hover:text-accent"
                        >
                          자세히
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating || !canMoveIssue}
                          onClick={() => onMoveIssue(issue.id, getNextStatus(issue.status))}
                          className="rounded-full border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-body hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {canMoveIssue ? "다음 상태" : "읽기 전용"}
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
