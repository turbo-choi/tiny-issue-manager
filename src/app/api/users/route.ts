import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName, getUserFromSessionCookie } from "@/server/auth";
import { createManagedUser, listManagedUsers } from "@/server/users";
import type { CreateUserInput } from "@/types/user";

export const runtime = "nodejs";

function getCurrentUser() {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(getSessionCookieName())?.value;
  return getUserFromSessionCookie(cookieValue);
}

export async function GET(request: Request) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const requestUrl = new URL(request.url);
  const scope = requestUrl.searchParams.get("scope");

  if (scope === "assignable") {
    return NextResponse.json({
      users: listManagedUsers().filter((entry) => entry.isActive),
    });
  }

  if (user.role !== "lead") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ users: listManagedUsers() });
}

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "lead") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const input = (await request.json()) as CreateUserInput;
    const createdUser = createManagedUser(input);
    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "User could not be created.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
