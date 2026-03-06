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
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "lead") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const input = (await request.json()) as UpdateUserInput;
    const updatedUser = updateManagedUser(params.id, input);
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "User could not be updated.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
