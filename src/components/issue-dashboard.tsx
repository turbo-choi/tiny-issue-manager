"use client";

import { useMemo } from "react";

import { formatShortDate, isIssueDelayed } from "@/lib/issue-utils";
import { formatIssueStatus } from "@/lib/i18n";
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
    <section className="rounded-xl border border-line bg-paper p-5 shadow-card">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">{subtitle}</p>
        <h2 className="mt-2 text-xl font-semibold text-brand">{title}</h2>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-xl bg-sand px-4 py-8 text-center text-sm text-muted">{emptyText}</div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <article key={issue.id} className="rounded-xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
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
                {isIssueDelayed(issue) ? (
                  <span className="whitespace-nowrap rounded-full bg-alertSoft px-3 py-1 text-xs font-semibold text-alert">
                    지연
                  </span>
                ) : (
                  <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {formatIssueStatus(issue.status)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3 text-sm text-muted">
                  <span>담당자: {issue.assigneeName}</span>
                  <span>마감일: {formatShortDate(issue.dueDate)}</span>
                  <span>작성자: {issue.creatorName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenIssue(issue)}
                  className="rounded-full border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-body hover:border-accent hover:text-accent"
                >
                  자세히
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
  const { delayedIssues, createdByMe, completedIssues } = useMemo(() => {
    const nextDelayedIssues: Issue[] = [];
    const nextCreatedByMe: Issue[] = [];
    const nextCompletedIssues: Issue[] = [];

    for (const issue of issues) {
      if (isIssueDelayed(issue)) {
        nextDelayedIssues.push(issue);
      }
      if (issue.creatorId === userId) {
        nextCreatedByMe.push(issue);
      }
      if (issue.status === "Done") {
        nextCompletedIssues.push(issue);
      }
    }

    return {
      delayedIssues: nextDelayedIssues,
      createdByMe: nextCreatedByMe,
      completedIssues: nextCompletedIssues,
    };
  }, [issues, userId]);

  const summaryCards = [
    {
      label: "지연 이슈",
      value: delayedIssues.length,
      tone: "bg-alertSoft text-alert",
    },
    {
      label: "내가 만든 이슈",
      value: createdByMe.length,
      tone: "bg-accentSoft text-accent",
    },
    {
      label: "완료된 이슈",
      value: completedIssues.length,
      tone: "bg-sand text-body",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-xl border border-line bg-paper p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{card.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <strong className="text-4xl font-semibold text-brand">{card.value}</strong>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${card.tone}`}>
                현황
              </span>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Section
          title="지연 이슈 모니터"
          subtitle="우선 확인"
          emptyText="지연된 이슈가 없습니다. 일정대로 진행 중입니다."
          issues={delayedIssues}
          onOpenIssue={onOpenIssue}
        />
        <div className="space-y-5">
          <Section
            title="내가 만든 이슈"
            subtitle="개인 보기"
            emptyText="이슈를 등록하면 여기에서 소유권을 확인할 수 있습니다."
            issues={createdByMe}
            onOpenIssue={onOpenIssue}
          />
          <Section
            title="완료 결과"
            subtitle="검토 목록"
            emptyText="완료된 이슈가 여기에 표시됩니다."
            issues={completedIssues}
            onOpenIssue={onOpenIssue}
          />
        </div>
      </div>
    </div>
  );
}
