import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName, getUserFromSessionCookie } from "@/server/auth";
import { listIssueHistoryForUser } from "@/server/issues";

export const runtime = "nodejs";

function parseDateToIso(value: string, boundary: "start" | "end") {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (isDateOnly) {
    if (boundary === "start") {
      parsed.setUTCHours(0, 0, 0, 0);
    } else {
      parsed.setUTCHours(23, 59, 59, 999);
    }
  }
  return parsed.toISOString();
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(getSessionCookieName())?.value;
  const user = getUserFromSessionCookie(cookieValue);

  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const fieldParam = searchParams.get("field");
    const daysParam = searchParams.get("days");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");

    const field =
      fieldParam === "status" || fieldParam === "assignee"
        ? fieldParam
        : undefined;

    if (fieldParam && !field) {
      return NextResponse.json({ message: "변경 이력 필터가 올바르지 않습니다." }, { status: 400 });
    }

    const lookbackDays =
      daysParam === "7" ? 7 : daysParam === "30" ? 30 : undefined;
    if (daysParam && !lookbackDays) {
      return NextResponse.json({ message: "변경 이력 기간 필터가 올바르지 않습니다." }, { status: 400 });
    }

    const fromIsoRaw = fromParam ? parseDateToIso(fromParam, "start") : undefined;
    const toIsoRaw = toParam ? parseDateToIso(toParam, "end") : undefined;
    if ((fromParam && !fromIsoRaw) || (toParam && !toIsoRaw)) {
      return NextResponse.json({ message: "직접 선택한 날짜 범위가 올바르지 않습니다." }, { status: 400 });
    }
    const fromIso = fromIsoRaw ?? undefined;
    const toIso = toIsoRaw ?? undefined;
    if (fromIso && toIso && new Date(fromIso).getTime() > new Date(toIso).getTime()) {
      return NextResponse.json({ message: "시작일은 종료일보다 늦을 수 없습니다." }, { status: 400 });
    }

    const page = pageParam ? Number.parseInt(pageParam, 10) : undefined;
    const pageSize = pageSizeParam ? Number.parseInt(pageSizeParam, 10) : undefined;

    const { history, pagination } = listIssueHistoryForUser(user, params.id, {
      field,
      lookbackDays,
      fromIso,
      toIso,
      page: Number.isNaN(page ?? Number.NaN) ? undefined : page,
      pageSize: Number.isNaN(pageSize ?? Number.NaN) ? undefined : pageSize,
    });

    return NextResponse.json({ history, pagination });
  } catch (error) {
    const message = error instanceof Error ? error.message : "변경 이력을 불러오지 못했습니다.";
    return NextResponse.json({ message }, { status: message.includes("not found") || message.includes("찾을 수") ? 404 : 400 });
  }
}
