"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { UserManagementPanel } from "@/components/user-management-panel";
import { useSession } from "@/hooks/use-session";
import { listUsers } from "@/lib/user-service";
import type { ManagedUser } from "@/types/user";

export default function UsersPage() {
  const router = useRouter();
  const { user } = useSession();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== "lead") {
      router.replace("/dashboard");
      return;
    }

    if (!user || user.role !== "lead") {
      return;
    }

    let active = true;
    void listUsers()
      .then((nextUsers) => {
        if (active) {
          setUsers(nextUsers);
          setReady(true);
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Users could not be loaded.");
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [router, user]);

  return (
    <AuthGate>
      <AppShell
        title="User management"
        description="Create teammates, assign roles, and control access from a single admin view."
      >
        {!user || user.role !== "lead" || !ready ? (
          <div className="rounded-[28px] border border-line bg-paper px-6 py-16 text-center text-sm text-slate-500 shadow-card">
            Loading admin workspace...
          </div>
        ) : error ? (
          <p className="rounded-2xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p>
        ) : (
          <UserManagementPanel initialUsers={users} />
        )}
      </AppShell>
    </AuthGate>
  );
}
