import { AppShell } from "@/components/app-shell";
import { BoardPageClient } from "@/components/board-page-client";
import { listIssuesForUser } from "@/server/issues";
import { requireSessionUser } from "@/server/session";
import { listManagedUsers } from "@/server/users";

export default function BoardPage() {
  const user = requireSessionUser();
  const issues = listIssuesForUser();
  const assigneeOptions = listManagedUsers().filter((entry) => entry.isActive);

  return (
    <AppShell
      title="실행 보드"
      description="업무를 빠르게 등록하고, 상태를 이동하며, 팀 전체 흐름을 한 보드에서 관리합니다."
    >
      <BoardPageClient initialIssues={issues} assigneeOptions={assigneeOptions} user={user} />
    </AppShell>
  );
}
