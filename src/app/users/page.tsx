import { AppShell } from "@/components/app-shell";
import { UserManagementPanel } from "@/components/user-management-panel";
import { requireLeadUser } from "@/server/session";
import { listManagedUsers } from "@/server/users";

export default function UsersPage() {
  requireLeadUser();
  const users = listManagedUsers();

  return (
    <AppShell
      title="사용자 관리"
      description="팀원을 생성하고 역할과 접근 권한을 한 곳에서 관리합니다."
    >
      <UserManagementPanel initialUsers={users} />
    </AppShell>
  );
}
