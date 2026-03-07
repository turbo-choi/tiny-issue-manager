"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { IssueDashboard } from "@/components/issue-dashboard";
import type { SessionUser } from "@/types/auth";
import type { Issue } from "@/types/issue";
import type { ManagedUser } from "@/types/user";

const IssueDetailDialog = dynamic(
  () => import("@/components/issue-detail-dialog").then((module) => module.IssueDetailDialog),
  { ssr: false },
);

export function DashboardPageClient({
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
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

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
      <IssueDashboard issues={issues} userId={user.id} onOpenIssue={setSelectedIssue} />
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
