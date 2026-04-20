import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Period Tracker | Auth",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
