import { AppShell } from "@/components/app-shell";
import { UserManagementPanel } from "@/components/user-management-panel";
import { requireLeadUser } from "@/server/session";
import { listManagedUsers } from "@/server/users";

export default function UsersPage() {
  requireLeadUser();
  const users = listManagedUsers();

  return (
    <AppShell
      title="User management"
      description="Create teammates, assign roles, and control access from a single admin view."
    >
      <UserManagementPanel initialUsers={users} />
    </AppShell>
  );
}
