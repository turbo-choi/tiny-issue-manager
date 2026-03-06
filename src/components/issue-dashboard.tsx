"use client";

import { formatShortDate, isIssueDelayed } from "@/lib/issue-utils";
import type { Issue } from "@/types/issue";

function Section({
  title,
  subtitle,
  emptyText,
  issues,
  onOpenIssue,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  issues: Issue[];
  onOpenIssue: (issue: Issue) => void;
}) {
  return (
    <section className="rounded-[28px] border border-line bg-paper p-5 shadow-card">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">{subtitle}</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-3xl bg-sand px-4 py-8 text-center text-sm text-slate-500">{emptyText}</div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <article key={issue.id} className="rounded-3xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
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
                {isIssueDelayed(issue) ? (
                  <span className="rounded-full bg-alertSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-alert">
                    Delayed
                  </span>
                ) : (
                  <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {issue.status}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span>Owner: {issue.assigneeName}</span>
                  <span>Due: {formatShortDate(issue.dueDate)}</span>
                  <span>Creator: {issue.creatorName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenIssue(issue)}
                  className="rounded-full border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:border-accent hover:text-accent"
                >
                  Details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function IssueDashboard({
  issues,
  userId,
  onOpenIssue,
}: {
  issues: Issue[];
  userId: string;
  onOpenIssue: (issue: Issue) => void;
}) {
  const delayedIssues = issues.filter((issue) => isIssueDelayed(issue));
  const createdByMe = issues.filter((issue) => issue.creatorId === userId);
  const completedIssues = issues.filter((issue) => issue.status === "Done");

  const summaryCards = [
    {
      label: "Delayed issues",
      value: delayedIssues.length,
      tone: "bg-alertSoft text-alert",
    },
    {
      label: "Created by me",
      value: createdByMe.length,
      tone: "bg-accentSoft text-accent",
    },
    {
      label: "Done this cycle",
      value: completedIssues.length,
      tone: "bg-sand text-ink",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-[28px] border border-line bg-paper p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <strong className="text-4xl font-semibold text-ink">{card.value}</strong>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${card.tone}`}>
                live
              </span>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Section
          title="Delayed issue monitor"
          subtitle="Priority view"
          emptyText="No delayed issues. The team is on schedule."
          issues={delayedIssues}
          onOpenIssue={onOpenIssue}
        />
        <div className="space-y-5">
          <Section
            title="Issues created by me"
            subtitle="Personal view"
            emptyText="Create your first issue to track ownership here."
            issues={createdByMe}
            onOpenIssue={onOpenIssue}
          />
          <Section
            title="Completed results"
            subtitle="Review list"
            emptyText="Completed issues will show up here."
            issues={completedIssues}
            onOpenIssue={onOpenIssue}
          />
        </div>
      </div>
    </div>
  );
}
