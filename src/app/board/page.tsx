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
      title="Execution board"
      description="Register work quickly, move status with drag and drop, and keep the whole team in one lightweight board."
    >
      <BoardPageClient initialIssues={issues} assigneeOptions={assigneeOptions} user={user} />
    </AppShell>
  );
}
