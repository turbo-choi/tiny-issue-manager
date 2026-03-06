"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getSessionUser,
  signIn as signInRequest,
  signOut as signOutRequest,
  subscribeToSessionChange,
} from "@/lib/auth-client";
import type { SignInInput } from "@/types/auth";

export function useSession() {
  const [user, setUser] = useState<Awaited<ReturnType<typeof getSessionUser>>>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const nextUser = await getSessionUser();
      if (active) {
        setUser(nextUser);
        setReady(true);
      }
    }

    loadSession();

    const unsubscribe = subscribeToSessionChange(() => {
      void getSessionUser().then((nextUser) => {
        if (active) {
          setUser(nextUser);
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      ready,
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
    [ready, user],
  );
}
