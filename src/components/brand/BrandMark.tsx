import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  label = "Period Tracker",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      aria-label={label}
      role="img"
      viewBox="0 0 64 64"
      className={cn("h-10 w-10", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brand-ring" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d64272" />
          <stop offset="1" stopColor="#8e2748" />
        </linearGradient>
        <linearGradient id="brand-fill" x1="20" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#fde7ef" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="24" fill="url(#brand-fill)" stroke="url(#brand-ring)" strokeWidth="4" />
      <path
        d="M39 17c-8.5 2.7-14.3 10.7-14.3 19.8 0 4 1.1 7.5 3 10.5-7-1.7-12.2-8-12.2-15.6C15.5 22 23.3 14 33 14c2.2 0 4.3.4 6 1.2Z"
        fill="#8e2748"
        opacity="0.95"
      />
      <path
        d="M37.7 23.4c0-2.3-1.9-4.1-4.2-4.1-2.4 0-4.3 1.8-4.3 4.1 0 4 5.3 7.9 7.7 12.2 2.2-4.2 0.8-8.2 0.8-12.2Z"
        fill="#d64272"
      />
      <circle cx="47.5" cy="19.5" r="2.5" fill="#f6b73c" />
      <path d="M47.5 13v4.2M47.5 21.8V26M42.9 19.5h4.2M50.8 19.5H55" stroke="#f6b73c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
