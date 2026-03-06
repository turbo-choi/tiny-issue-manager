import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  clearSessionCookieOptions,
  getSessionCookieName,
  logoutFromSessionCookie,
} from "@/server/auth";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(getSessionCookieName())?.value;

  logoutFromSessionCookie(cookieValue);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getSessionCookieName(), "", clearSessionCookieOptions());
  return response;
}
