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
      title="모니터링 대시보드"
      description="지연 업무, 내가 만든 이슈, 완료된 결과를 한 화면에서 확인합니다."
    >
      <DashboardPageClient initialIssues={issues} assigneeOptions={assigneeOptions} user={user} />
    </AppShell>
  );
}
