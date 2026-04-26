import { NextResponse } from "next/server";

import { getSessionCookieName, loginWithPassword, sessionCookieOptions } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ message: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
    }

    const { user, signedSession } = loginWithPassword(email, password);
    const response = NextResponse.json({ user });
    response.cookies.set(getSessionCookieName(), signedSession, sessionCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "로그인에 실패했습니다.";
    return NextResponse.json({ message }, { status: 401 });
  }
}
