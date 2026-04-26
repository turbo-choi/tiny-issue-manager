import type { Metadata } from "next";

import { SessionProvider } from "@/components/session-provider";
import { getRequestSessionUser } from "@/server/session";

import "./globals.css";

export const metadata: Metadata = {
  title: "간단 이슈 관리",
  description: "복잡한 도구 없이 팀 이슈를 관리하는 가벼운 보드와 대시보드입니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = getRequestSessionUser();

  return (
    <html lang="ko">
      <body>
        <SessionProvider initialUser={user}>{children}</SessionProvider>
      </body>
    </html>
  );
}
