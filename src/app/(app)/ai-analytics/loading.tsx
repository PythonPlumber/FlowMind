export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-[color:var(--ink-faint)] animate-pulse rounded" />
        <div className="mt-2 h-4 w-96 bg-[color:var(--ink-faint)] animate-pulse rounded" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-64 bg-[color:var(--ink-faint)] animate-pulse rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
