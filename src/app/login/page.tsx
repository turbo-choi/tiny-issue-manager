import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getRequestSessionUser } from "@/server/session";

export default function LoginPage() {
  if (getRequestSessionUser()) {
    redirect("/board");
  }

  return <LoginForm />;
}
