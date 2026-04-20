import { AppNav } from "@/components/nav/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell min-h-screen pb-10">
      <AppNav />
      <main className="px-4 pb-28 pt-5 lg:pl-[18.5rem] lg:pr-6 lg:pt-5">
        <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
      </main>
      <footer className="px-4 pb-6 lg:pl-[18.5rem] lg:pr-6">
        <div className="mx-auto w-full max-w-6xl rounded-[24px] border border-white/55 bg-[rgba(246,249,255,0.76)] px-5 py-3 text-xs leading-6 text-[color:var(--ink-soft)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]">
          Fertility and cycle predictions are estimates only. Not medical advice and not birth control.
        </div>
      </footer>
    </div>
  );
}
