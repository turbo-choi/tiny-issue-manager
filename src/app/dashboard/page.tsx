import { AppShell } from "@/components/app-shell";
import { DashboardPageClient } from "@/components/dashboard-page-client";
import { listIssuesForUser } from "@/server/issues";
import { requireSessionUser } from "@/server/session";
import { listManagedUsers } from "@/server/users";

export default function DashboardPage() {
  const user = requireSessionUser();
  const issues = listIssuesForUser();
  const assigneeOptions = listManagedUsers().filter((entry) => entry.isActive);

  return (
    <AppShell
      title="Monitoring dashboard"
      description="Use one screen to see delayed work, the issues you created, and what has already been completed."
    >
      <DashboardPageClient initialIssues={issues} assigneeOptions={assigneeOptions} user={user} />
    </AppShell>
  );
}
