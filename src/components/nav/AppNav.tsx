"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  CalendarDays,
  ChartSpline,
  FileText,
  LayoutDashboard,
  Menu,
  NotebookPen,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand/BrandMark";
import { UserMenu } from "@/components/nav/UserMenu";
import { OrbButton } from "@/components/ui/orb-button";
import { cn } from "@/lib/utils";

const links: Array<{
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/log", label: "Log", icon: NotebookPen },
  { href: "/insights", label: "Insights", icon: ChartSpline },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const mobileTabs = links.filter((link) =>
  ["/", "/calendar", "/log", "/insights"].includes(link.href)
);

function isActivePath(activePath: string, href: string) {
  return href === "/" ? activePath === href : activePath === href || activePath.startsWith(`${href}/`);
}

export function AppNav({ currentPath }: { currentPath?: string }) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeLink = useMemo(
    () => links.find((link) => isActivePath(activePath, link.href)) ?? links[0]!,
    [activePath]
  );

  return (
    <>
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-[15.5rem] lg:flex">
        <div className="flex w-full flex-col rounded-[40px] border border-white/60 bg-[rgba(246,249,255,0.82)] px-5 py-6 [box-shadow:var(--shadow-soft),var(--shadow-inset)] backdrop-blur-xl">
          <Link
            href="/"
            className="flex items-center gap-3 px-2 py-2"
          >
            <BrandMark className="h-11 w-11 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                Period tracker
              </p>
              <p className="truncate text-base font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                Quiet cycle OS
              </p>
            </div>
          </Link>

          <nav className="mt-8 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <RailLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={<Icon className="h-4 w-4" />}
                  active={isActivePath(activePath, link.href)}
                />
              );
            })}
          </nav>

          <div className="mt-auto rounded-[26px] bg-[color:var(--paper-muted)] px-4 py-4 [box-shadow:var(--shadow-inset)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--ink-soft)]">
              Open now
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                  {activeLink.label}
                </p>
                <p className="text-sm text-[color:var(--ink-soft)]">Calm, focused, and current.</p>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 px-4 pt-4 lg:pl-[18.5rem]">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/60 bg-[rgba(246,249,255,0.88)] px-4 py-3 [box-shadow:var(--shadow-soft),var(--shadow-inset)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <OrbButton
                aria-label="Open navigation menu"
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </OrbButton>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--ink-soft)]">
                  Open now
                </p>
                <p className="truncate text-xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">
                  {activeLink.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/log"
                className="hidden h-11 items-center rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)] sm:inline-flex"
              >
                Quick log
              </Link>
              <div className="hidden lg:block">
                <span className="text-sm text-[color:var(--ink-soft)]">Quiet cycle OS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 bg-[rgba(49,64,92,0.18)] lg:hidden">
          <div className="h-full w-[min(22rem,86vw)] rounded-r-[34px] border-r border-white/60 bg-[rgba(250,252,255,0.96)] px-5 py-6 [box-shadow:var(--shadow-soft),var(--shadow-inset)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3"
              >
                <BrandMark className="h-10 w-10 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--ink-soft)]">
                    Period tracker
                  </p>
                  <p className="text-base font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                    Quiet cycle OS
                  </p>
                </div>
              </Link>
              <OrbButton
                aria-label="Close navigation menu"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="h-5 w-5" />
              </OrbButton>
            </div>

            <nav className="mt-8 space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <DrawerLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    icon={<Icon className="h-4 w-4" />}
                    active={isActivePath(activePath, link.href)}
                    onNavigate={() => setDrawerOpen(false)}
                  />
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 lg:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-sm items-center justify-between rounded-[30px] border border-white/70 bg-[rgba(246,249,255,0.88)] px-2 py-2 [box-shadow:var(--shadow-soft),var(--shadow-inset)] backdrop-blur-xl">
          {mobileTabs.map((link) => {
            const Icon = link.icon;
            const active = isActivePath(activePath, link.href);
            const isPrimary = link.href === "/log";
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[22px] px-2 py-2 text-[11px] font-medium transition",
                  active && isPrimary
                    ? "bg-[color:var(--brand)] text-white shadow-[0_18px_34px_rgba(118,139,255,0.32)]"
                    : active
                      ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)]"
                      : "text-[color:var(--ink-soft)]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

function RailLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-[linear-gradient(180deg,#8ea0ff,#7387ff)] text-white shadow-[0_18px_34px_rgba(118,139,255,0.32)]"
          : "text-[color:var(--foreground)] hover:bg-[color:var(--paper-muted)]"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function DrawerLink({
  href,
  label,
  icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-[linear-gradient(180deg,#8ea0ff,#7387ff)] text-white shadow-[0_18px_34px_rgba(118,139,255,0.32)]"
          : "bg-[color:var(--paper-muted)] text-[color:var(--foreground)]"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
