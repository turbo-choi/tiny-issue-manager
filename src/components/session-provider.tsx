"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { signIn as signInRequest, signOut as signOutRequest } from "@/lib/auth-client";
import type { SessionUser, SignInInput } from "@/types/auth";

type SessionContextValue = {
  user: SessionUser | null;
  signIn: (input: SignInInput) => Promise<SessionUser>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      async signIn(input: SignInInput) {
        const nextUser = await signInRequest(input);
        setUser(nextUser);
        return nextUser;
      },
      async signOut() {
        await signOutRequest();
        setUser(null);
      },
    }),
    [user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside SessionProvider.");
  }
  return value;
}
