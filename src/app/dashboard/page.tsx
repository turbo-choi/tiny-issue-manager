"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { IssueDashboard } from "@/components/issue-dashboard";
import { IssueDetailDialog } from "@/components/issue-detail-dialog";
import { useSession } from "@/hooks/use-session";
import { listIssues } from "@/lib/issue-service";
import { listAssignableUsers } from "@/lib/user-service";
import type { Issue } from "@/types/issue";
import type { ManagedUser } from "@/types/user";

export default function DashboardPage() {
  const { user } = useSession();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          setError(loadError instanceof Error ? loadError.message : "Dashboard data could not be loaded.");
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
        title="Monitoring dashboard"
        description="Use one screen to see delayed work, the issues you created, and what has already been completed."
      >
        {error ? (
          <p className="mb-5 rounded-2xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p>
        ) : null}

        {isLoading || !user ? (
          <div className="rounded-[28px] border border-line bg-paper px-6 py-16 text-center text-sm text-slate-500 shadow-card">
            Loading dashboard...
          </div>
        ) : (
          <IssueDashboard issues={issues} userId={user.id} onOpenIssue={setSelectedIssue} />
        )}
        <IssueDetailDialog
          issue={selectedIssue}
          user={user}
          assigneeOptions={assigneeOptions}
          onIssueUpdated={(updatedIssue) => {
            setIssues((current) => current.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)));
            setSelectedIssue(updatedIssue);
          }}
          onIssueDeleted={(issueId) => {
            setIssues((current) => current.filter((issue) => issue.id !== issueId));
            setSelectedIssue(null);
          }}
          onClose={() => setSelectedIssue(null)}
        />
      </AppShell>
    </AuthGate>
  );
}
