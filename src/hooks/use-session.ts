"use client";

import { useSessionContext } from "@/components/session-provider";

export function useSession() {
  return useSessionContext();
}
