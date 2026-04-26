"use client";

import { useEffect, useMemo, useState } from "react";

import { ISSUE_STATUSES, formatShortDate, isIssueDelayed, normalizeDueDate } from "@/lib/issue-utils";
import { HISTORY_FIELD_LABELS, formatIssueStatus, formatUserRole } from "@/lib/i18n";
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
  { label: "전체", value: "all" },
  { label: "상태", value: "status" },
  { label: "담당자", value: "assignee" },
];
const HISTORY_PERIODS: Array<{ label: string; value: IssueHistoryPeriod }> = [
  { label: "전체 기간", value: "all" },
  { label: "최근 7일", value: "7d" },
  { label: "최근 30일", value: "30d" },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateInputValue(value: string) {
  return normalizeDueDate(value);
}

function historyFieldLabel(field: IssueHistoryEntry["field"]) {
  return HISTORY_FIELD_LABELS[field];
}

function historyValueLabel(field: IssueHistoryEntry["field"], value: string) {
  if (field === "status") {
    return formatIssueStatus(value);
  }
  return value;
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
    <div className="rounded-xl bg-sand px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.18em] text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-body">{value}</dd>
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
          setHistoryError(loadError instanceof Error ? loadError.message : "변경 이력을 불러오지 못했습니다.");
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
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-line bg-paper p-5 shadow-nav sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">이슈 상세</p>
            <h2 id="issue-detail-title" className="text-2xl font-semibold text-brand">
              {issue.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-body transition hover:border-accent hover:text-accent"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {formatIssueStatus(issue.status)}
          </span>
          {delayed ? (
            <span className="whitespace-nowrap rounded-full bg-alertSoft px-3 py-1 text-xs font-semibold text-alert">
              지연
            </span>
          ) : null}
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-body">
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
              setError(submitError instanceof Error ? submitError.message : "이슈를 수정하지 못했습니다.");
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">상태</span>
              <select
                disabled={!editable}
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value as IssueStatus }))
                }
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-muted"
              >
                {ISSUE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatIssueStatus(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">담당자</span>
              <select
                disabled={!editable}
                value={form.assigneeId}
                onChange={(event) => setForm((current) => ({ ...current, assigneeId: event.target.value }))}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-muted"
              >
                <option value="">담당자 선택</option>
                {assigneeOptions.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name} ({formatUserRole(assignee.role)})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">제목</span>
              <input
                disabled={!editable}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-muted"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">마감일</span>
              <input
                disabled={!editable}
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-muted"
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">설명</span>
              <textarea
                disabled={!editable}
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent disabled:bg-sand disabled:text-muted"
              />
            </label>
          </div>

          {!editable ? (
            <p className="rounded-xl bg-sand px-4 py-3 text-sm text-body">
              이 이슈는 확인만 가능합니다. 현재 역할에는 수정 권한이 없습니다.
            </p>
          ) : null}

          {error ? <p className="rounded-xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2">
            {editable ? (
              <button
                type="submit"
                disabled={isSaving || isDeleting || !canSubmit}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "저장 중..." : "변경사항 저장"}
              </button>
            ) : null}
            {deletable ? (
              <button
                type="button"
                disabled={isSaving || isDeleting}
                onClick={async () => {
                  if (!window.confirm("이 이슈를 폐기할까요? 이력은 유지되고 상태만 폐기됨으로 표시됩니다.")) {
                    return;
                  }
                  try {
                    setIsDeleting(true);
                    setError("");
                    const discardedIssue = await deleteIssueRequest(issueId);
                    onIssueDiscarded(discardedIssue);
                    onClose();
                  } catch (deleteError) {
                    setError(deleteError instanceof Error ? deleteError.message : "이슈를 폐기하지 못했습니다.");
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="rounded-full border border-alert px-4 py-2 text-sm font-medium text-alert transition hover:bg-alertSoft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "폐기 중..." : "이슈 폐기"}
              </button>
            ) : null}
          </div>
        </form>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <DetailField label="상태" value={formatIssueStatus(form.status)} />
          <DetailField label="담당자" value={selectedAssigneeName} />
          <DetailField label="작성자" value={issue.creatorName} />
          <DetailField label="마감일" value={formatShortDate(issue.dueDate)} />
          <DetailField label="등록일" value={formatDateTime(issue.createdAt)} />
          <DetailField label="수정일" value={formatDateTime(issue.updatedAt)} />
        </dl>

        <section className="mt-5 rounded-xl border border-line bg-white p-5">
          <div className="mb-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">변경 이력</p>
            <h3 className="mt-1 text-lg font-semibold text-brand">상태와 담당자 변경</h3>
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
                      : "border border-line bg-paper text-body hover:border-accent hover:text-accent"
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
                      ? "bg-accent text-white"
                      : "border border-line bg-paper text-body hover:border-accent hover:text-accent"
                  }`}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>

          <div className="mb-3 rounded-xl border border-line bg-paper p-3">
            <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">기간 직접 선택</p>
            <div className="flex flex-wrap items-end gap-2">
              <label className="space-y-1">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted">시작일</span>
                <input
                  type="date"
                  value={historyFromInput}
                  onChange={(event) => setHistoryFromInput(event.target.value)}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-xs text-body outline-none transition focus:border-accent"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted">종료일</span>
                <input
                  type="date"
                  value={historyToInput}
                  onChange={(event) => setHistoryToInput(event.target.value)}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-xs text-body outline-none transition focus:border-accent"
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
                    setHistoryError("시작일은 종료일보다 늦을 수 없습니다.");
                    return;
                  }
                  setHistoryError("");
                  setHistoryPeriod("all");
                  setHistoryFrom(historyFromInput);
                  setHistoryTo(historyToInput);
                  setHistoryPage(1);
                }}
                className="rounded-full bg-accent px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-brand"
              >
                적용
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
                className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-body transition hover:border-accent hover:text-accent"
              >
                초기화
              </button>
            </div>
          </div>

          {historyError ? <p className="rounded-xl bg-alertSoft px-4 py-3 text-sm text-alert">{historyError}</p> : null}

          {isHistoryLoading ? (
            <p className="rounded-xl bg-sand px-4 py-5 text-sm text-body">변경 이력을 불러오는 중...</p>
          ) : history.length === 0 ? (
            <p className="rounded-xl bg-sand px-4 py-5 text-sm text-body">
              아직 상태나 담당자 변경 이력이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              <ul className="space-y-2">
                {history.map((entry) => (
                  <li key={entry.id} className="rounded-xl border border-line bg-paper px-4 py-3">
                    <p className="text-sm text-body">
                      <span className="font-semibold">{entry.actorName}</span>
                      <span className="text-muted"> ({formatUserRole(entry.actorRole)})님이 </span>
                      <span className="font-semibold">{historyFieldLabel(entry.field)}</span>
                      <span className="text-muted">를 </span>
                      <span className="font-semibold">{historyValueLabel(entry.field, entry.fromValue)}</span>
                      <span className="text-muted">에서 </span>
                      <span className="font-semibold">{historyValueLabel(entry.field, entry.toValue)}</span>
                      <span className="text-muted">로 변경했습니다.</span>
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">{formatDateTime(entry.createdAt)}</p>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sand px-4 py-3">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">
                  {historyPagination.page}페이지 · 총 {historyPagination.total}건
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={historyPagination.page <= 1 || isHistoryLoading}
                    onClick={() => setHistoryPage((current) => Math.max(1, current - 1))}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-body transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    disabled={!historyPagination.hasNext || isHistoryLoading}
                    onClick={() => setHistoryPage((current) => current + 1)}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-body transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    다음
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
