/** Teal-dash bullet list — the role page's list motif. */
export function DashList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed text-main-mist/65">
          <span className="mt-2.5 h-px w-3 shrink-0 bg-main-accent-t1" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
