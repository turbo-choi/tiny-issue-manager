"use client";

import { useState } from "react";

import type { CreateIssueInput } from "@/types/issue";
import type { ManagedUser } from "@/types/user";

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
    <section className="rounded-[28px] border border-line bg-paper p-5 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Quick capture</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Register a new issue</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep it small. Title, assignee, and due date are enough for the MVP.
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
            setError(submitError instanceof Error ? submitError.message : "Issue could not be created.");
          }
        }}
      >
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Title</span>
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="What needs to happen?"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Assignee</span>
          <select
            value={form.assigneeId}
            onChange={(event) => setForm((current) => ({ ...current, assigneeId: event.target.value }))}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          >
            <option value="">Select assignee</option>
            {assigneeOptions.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name} ({assignee.role})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Due date</span>
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-medium text-ink">Description</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Add just enough context for the team."
            rows={4}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <div className="flex flex-col justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Create issue"}
          </button>
          <p className="rounded-2xl bg-accentSoft px-4 py-3 text-xs leading-5 text-slate-600">
            Assignees come from the active user list so issue ownership stays consistent.
          </p>
        </div>
      </form>

      {error ? (
        <p className="mt-3 rounded-2xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p>
      ) : null}
    </section>
  );
}
