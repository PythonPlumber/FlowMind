import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: {
    default: "FlowMind — Advanced Cycle Tracker",
    template: "%s | FlowMind",
  },
  description: "AI-powered period and cycle tracker with adaptive predictions, multi-signal ovulation detection, and comprehensive health insights.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
