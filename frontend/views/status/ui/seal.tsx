// Coastal-skyline seal that crowns each status hero. Line-art, inherits the
// status accent via `currentColor`.
export function Seal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 40" fill="none" className={className} aria-hidden>
      <path d="M2 38h68" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
      <rect x="9" y="19" width="11" height="19" stroke="currentColor" strokeWidth="1.4" />
      <rect x="24" y="9" width="10" height="29" stroke="currentColor" strokeWidth="1.4" />
      <rect x="38" y="15" width="9" height="23" stroke="currentColor" strokeWidth="1.4" />
      <rect x="51" y="24" width="11" height="14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M29 4l4 5h-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M13 24h3M13 29h3M28 14h2M28 20h2M42 21h1.5M55 29h3" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
    </svg>
  );
}
