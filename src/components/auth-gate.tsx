"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/hooks/use-session";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, user } = useSession();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, router, user]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Loading your workspace...
      </div>
    );
  }

  return <>{children}</>;
}
