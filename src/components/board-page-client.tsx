"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { IssueBoard } from "@/components/issue-board";
import { IssueForm } from "@/components/issue-form";
import { createIssue, updateIssueStatus } from "@/lib/issue-service";
import type { SessionUser } from "@/types/auth";
import type { Issue, IssueFilter, IssueStatus } from "@/types/issue";
import type { ManagedUser } from "@/types/user";

const IssueDetailDialog = dynamic(
  () => import("@/components/issue-detail-dialog").then((module) => module.IssueDetailDialog),
  { ssr: false },
);

export function BoardPageClient({
  initialIssues,
  assigneeOptions,
  user,
}: {
  initialIssues: Issue[];
  assigneeOptions: ManagedUser[];
  user: SessionUser;
}) {
  const router = useRouter();
  const [issues, setIssues] = useState(initialIssues);
  const [filter, setFilter] = useState<IssueFilter>("All");
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setIssues(initialIssues);
    setSelectedIssue((current) => {
      if (!current) {
        return null;
      }
      return initialIssues.find((issue) => issue.id === current.id) ?? null;
    });
  }, [initialIssues]);

  function refreshData() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      <div className="space-y-5">
        <IssueForm
          isSaving={isSaving}
          assigneeOptions={assigneeOptions}
          onSubmit={async (input) => {
            try {
              setIsSaving(true);
              setError("");
              const nextIssue = await createIssue(input);
              setIssues((current) => [nextIssue, ...current]);
              refreshData();
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "이슈를 등록하지 못했습니다.");
              throw submitError;
            } finally {
              setIsSaving(false);
            }
          }}
        />

        {error ? <p className="rounded-xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p> : null}

        <IssueBoard
          issues={issues}
          filter={filter}
          user={user}
          isUpdating={isUpdating}
          onOpenIssue={setSelectedIssue}
          onFilterChange={setFilter}
          onMoveIssue={async (id: string, status: IssueStatus) => {
            try {
              setIsUpdating(true);
              setError("");
              const updatedIssue = await updateIssueStatus(id, status);
              setIssues((current) => current.map((issue) => (issue.id === id ? updatedIssue : issue)));
              refreshData();
            } catch (updateError) {
              setError(updateError instanceof Error ? updateError.message : "이슈를 수정하지 못했습니다.");
              throw updateError;
            } finally {
              setIsUpdating(false);
            }
          }}
        />
      </div>

      {selectedIssue ? (
        <IssueDetailDialog
          issue={selectedIssue}
          user={user}
          assigneeOptions={assigneeOptions}
          onIssueUpdated={(updatedIssue) => {
            setIssues((current) => current.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)));
            setSelectedIssue(updatedIssue);
            refreshData();
          }}
          onIssueDiscarded={(discardedIssue) => {
            setIssues((current) =>
              current.map((issue) => (issue.id === discardedIssue.id ? discardedIssue : issue)),
            );
            setSelectedIssue(discardedIssue);
            refreshData();
          }}
          onClose={() => setSelectedIssue(null)}
        />
      ) : null}
    </>
  );
}
