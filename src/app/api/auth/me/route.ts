import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName, getUserFromSessionCookie } from "@/server/auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(getSessionCookieName())?.value;
  const user = getUserFromSessionCookie(cookieValue);

  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  return NextResponse.json({ user });
}
