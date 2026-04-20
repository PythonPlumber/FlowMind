"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

type MenuItem = {
  label: string;
  href?: string;
  onSelect?: () => void;
};

export function ActionMenu({
  label = "Open menu",
  items,
  className,
  align = "right",
}: {
  label?: string;
  items: MenuItem[];
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-[color:var(--foreground)] shadow-[0_12px_24px_rgba(61,28,35,0.06)] transition hover:bg-[color:var(--paper-muted)]"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute top-full z-40 mt-2 min-w-52 rounded-[22px] border border-[color:var(--line)] bg-white p-2 shadow-[0_18px_40px_rgba(61,28,35,0.14)]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex rounded-[16px] px-4 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--paper-muted)]"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
                className="flex w-full rounded-[16px] px-4 py-3 text-left text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--paper-muted)]"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
