import { cache } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { SessionUser } from "@/types/auth";
import { getSessionCookieName, getUserFromSessionCookie } from "@/server/auth";

export const getRequestSessionUser = cache((): SessionUser | null => {
  const cookieValue = cookies().get(getSessionCookieName())?.value;
  return getUserFromSessionCookie(cookieValue);
});

export function requireSessionUser() {
  const user = getRequestSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export function requireLeadUser() {
  const user = requireSessionUser();
  if (user.role !== "lead") {
    redirect("/dashboard");
  }
  return user;
}
