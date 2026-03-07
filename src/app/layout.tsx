import type { Metadata } from "next";

import { SessionProvider } from "@/components/session-provider";
import { getRequestSessionUser } from "@/server/session";

import "./globals.css";

export const metadata: Metadata = {
  title: "Simple Issue Management",
  description: "A lightweight issue board and dashboard for teams who do not need Jira complexity.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = getRequestSessionUser();

  return (
    <html lang="en">
      <body>
        <SessionProvider initialUser={user}>{children}</SessionProvider>
      </body>
    </html>
  );
}
