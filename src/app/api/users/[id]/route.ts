import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName, getUserFromSessionCookie } from "@/server/auth";
import { updateManagedUser } from "@/server/users";
import type { UpdateUserInput } from "@/types/user";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(getSessionCookieName())?.value;
  const user = getUserFromSessionCookie(cookieValue);

  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }
  if (user.role !== "lead") {
    return NextResponse.json({ message: "접근 권한이 없습니다." }, { status: 403 });
  }

  try {
    const input = (await request.json()) as UpdateUserInput;
    const updatedUser = updateManagedUser(params.id, input);
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "사용자를 수정하지 못했습니다.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
