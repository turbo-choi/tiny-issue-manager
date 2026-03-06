"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { IssueBoard } from "@/components/issue-board";
import { IssueDetailDialog } from "@/components/issue-detail-dialog";
import { IssueForm } from "@/components/issue-form";
import { useSession } from "@/hooks/use-session";
import { createIssue, listIssues, updateIssueStatus } from "@/lib/issue-service";
import { listAssignableUsers } from "@/lib/user-service";
import type { Issue, IssueFilter, IssueStatus } from "@/types/issue";
import type { ManagedUser } from "@/types/user";

export default function BoardPage() {
  const { user } = useSession();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<ManagedUser[]>([]);
  const [filter, setFilter] = useState<IssueFilter>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadIssues() {
      try {
        setIsLoading(true);
        setError("");
        const [nextIssues, nextAssignees] = await Promise.all([listIssues(), listAssignableUsers()]);
        if (active) {
          setIssues(nextIssues);
          setAssigneeOptions(nextAssignees);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Issues could not be loaded.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadIssues();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthGate>
      <AppShell
        title="Execution board"
        description="Register work quickly, move status with drag and drop, and keep the whole team in one lightweight board."
      >
        <div className="space-y-5">
          <IssueForm
            isSaving={isSaving}
            assigneeOptions={assigneeOptions}
            onSubmit={async (input) => {
              try {
                setIsSaving(true);
                const nextIssue = await createIssue(input);
                setIssues((current) => [nextIssue, ...current]);
              } finally {
                setIsSaving(false);
              }
            }}
          />

          {error ? (
            <p className="rounded-2xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p>
          ) : null}

          {isLoading || !user ? (
            <div className="rounded-[28px] border border-line bg-paper px-6 py-16 text-center text-sm text-slate-500 shadow-card">
              Loading issue board...
            </div>
          ) : (
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
                  const updatedIssue = await updateIssueStatus(id, status);
                  setIssues((current) => current.map((issue) => (issue.id === id ? updatedIssue : issue)));
                } finally {
                  setIsUpdating(false);
                }
              }}
            />
          )}
        </div>
        <IssueDetailDialog
          issue={selectedIssue}
          user={user}
          assigneeOptions={assigneeOptions}
          onIssueUpdated={(updatedIssue) => {
            setIssues((current) => current.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)));
            setSelectedIssue(updatedIssue);
          }}
          onIssueDiscarded={(discardedIssue) => {
            setIssues((current) =>
              current.map((issue) => (issue.id === discardedIssue.id ? discardedIssue : issue)),
            );
            setSelectedIssue(discardedIssue);
          }}
          onClose={() => setSelectedIssue(null)}
        />
      </AppShell>
    </AuthGate>
  );
}
