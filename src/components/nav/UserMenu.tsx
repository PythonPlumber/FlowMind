"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { OrbButton } from "@/components/ui/orb-button";

export function UserMenu() {
  const { data } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <OrbButton
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="h-12 w-12"
      >
        <UserRound className="h-4 w-4" />
      </OrbButton>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-3 min-w-64 rounded-[26px] border border-white/60 bg-[rgba(250,252,255,0.96)] p-2 [box-shadow:var(--shadow-soft),var(--shadow-inset)] backdrop-blur-xl">
          <div className="rounded-[18px] bg-[color:var(--paper-muted)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
              Signed in
            </p>
            <p className="mt-1 text-sm font-medium text-[color:var(--foreground)]">
              {data?.user?.email ?? "Friend account"}
            </p>
          </div>
          <div className="mt-2 space-y-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--paper-muted)]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
              className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--paper-muted)]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
