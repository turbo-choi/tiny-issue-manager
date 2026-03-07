import { redirect } from "next/navigation";

import { getRequestSessionUser } from "@/server/session";

export default function HomePage() {
  redirect(getRequestSessionUser() ? "/board" : "/login");
}
