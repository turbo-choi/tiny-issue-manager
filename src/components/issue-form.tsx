"use client";

import { useState } from "react";

import type { CreateIssueInput } from "@/types/issue";
import type { ManagedUser } from "@/types/user";
import { formatUserRole } from "@/lib/i18n";

const EMPTY_FORM: CreateIssueInput = {
  title: "",
  description: "",
  assigneeId: "",
  dueDate: "",
};

export function IssueForm({
  onSubmit,
  isSaving,
  assigneeOptions,
}: {
  onSubmit: (input: CreateIssueInput) => Promise<void>;
  isSaving: boolean;
  assigneeOptions: ManagedUser[];
}) {
  const [form, setForm] = useState<CreateIssueInput>(EMPTY_FORM);
  const [error, setError] = useState("");

  return (
    <section className="rounded-xl border border-line bg-paper p-5 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">빠른 등록</p>
          <h2 className="mt-2 text-xl font-semibold text-brand">새 이슈 등록</h2>
          <p className="mt-1 text-sm text-muted">
            제목, 담당자, 마감일만 입력해도 바로 업무를 시작할 수 있습니다.
          </p>
        </div>
      </div>

      <form
        className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            setError("");
            await onSubmit(form);
            setForm(EMPTY_FORM);
          } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "이슈를 등록하지 못했습니다.");
          }
        }}
      >
        <label className="space-y-2">
          <span className="text-sm font-medium text-body">제목</span>
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="무엇을 해야 하나요?"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-body">담당자</span>
          <select
            value={form.assigneeId}
            onChange={(event) => setForm((current) => ({ ...current, assigneeId: event.target.value }))}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
          >
            <option value="">담당자 선택</option>
            {assigneeOptions.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name} ({formatUserRole(assignee.role)})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-body">마감일</span>
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-medium text-body">설명</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="팀원이 이해할 수 있을 만큼만 설명을 적어주세요."
            rows={4}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </label>

        <div className="flex flex-col justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "저장 중..." : "이슈 등록"}
          </button>
          <p className="rounded-xl bg-accentSoft px-4 py-3 text-xs leading-5 text-body">
            활성 사용자 목록에서 담당자를 선택해 업무 소유자를 명확히 유지합니다.
          </p>
        </div>
      </form>

      {error ? (
        <p className="mt-3 rounded-xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p>
      ) : null}
    </section>
  );
}
