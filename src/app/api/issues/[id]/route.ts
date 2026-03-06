import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName, getUserFromSessionCookie } from "@/server/auth";
import { deleteIssueForUser, updateIssueForUser } from "@/server/issues";
import type { UpdateIssueInput } from "@/types/issue";

export const runtime = "nodejs";

function getErrorStatus(message: string) {
  if (message.includes("permission")) {
    return 403;
  }
  if (message.includes("not found")) {
    return 404;
  }
  return 400;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(getSessionCookieName())?.value;
  const user = getUserFromSessionCookie(cookieValue);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = (await request.json()) as UpdateIssueInput;
    const issue = updateIssueForUser(user, params.id, input);
    return NextResponse.json({ issue });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Issue could not be updated.";
    return NextResponse.json({ message }, { status: getErrorStatus(message) });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(getSessionCookieName())?.value;
  const user = getUserFromSessionCookie(cookieValue);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    deleteIssueForUser(user, params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Issue could not be deleted.";
    return NextResponse.json({ message }, { status: getErrorStatus(message) });
  }
}
