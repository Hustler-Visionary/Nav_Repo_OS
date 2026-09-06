import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REPO_OS // Node Manager",
  description: "Operational graph view of the TST Autonomous domain layer"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
