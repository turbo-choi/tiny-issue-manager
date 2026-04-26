import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName, getUserFromSessionCookie } from "@/server/auth";
import { createIssueForUser, listIssuesForUser } from "@/server/issues";

export const runtime = "nodejs";

async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(getSessionCookieName())?.value;
  return getUserFromSessionCookie(cookieValue);
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const issues = listIssuesForUser();
  return NextResponse.json({ issues });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const input = await request.json();
    const issue = createIssueForUser(input, user);
    return NextResponse.json({ issue }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "이슈를 등록하지 못했습니다.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
