import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Qubit Atlas — Quantum computing, taught properly",
  description: "A 30-lesson path from qubit fundamentals to quantum algorithms and experimental method, with a local circuit simulator. No account or backend.",
  applicationName: "Qubit Atlas",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteShell>{children}</SiteShell><Analytics /></body></html>;
}
