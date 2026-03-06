import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple Issue Management",
  description: "A lightweight issue board and dashboard for teams who do not need Jira complexity.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
