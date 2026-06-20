import { CONTROL } from "./field";

interface RoleBlockProps {
  title: string;
  requirements: string[];
  screeningQuestion: string;
  checked: Set<string>;
  onToggle: (requirement: string) => void;
  screeningValue: string;
  onScreeningChange: (value: string) => void;
}

/**
 * The injectable role section — rendered only when the form is opened from a
 * specific vacancy. Mirrors the email's "what you confirmed" block: the role's
 * requirements as checkboxes plus a role-specific screening prompt.
 */
export function RoleBlock({ title, requirements, screeningQuestion, checked, onToggle, screeningValue, onScreeningChange }: RoleBlockProps) {
  return (
    <div className="rounded-lg border-l-2 border-main-accent-t1/60 bg-main-accent-t1/[0.04] py-4 pl-4 pr-3">
      <p className="mb-3 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-accent-t1">For this role · {title}</p>
      {requirements.length > 0 && (
        <>
          <p className="mb-2.5 text-xs text-main-mist/70">Which of these describe you?</p>
          <div className="mb-4 space-y-2.5">
            {requirements.map((requirement) => (
              <label key={requirement} className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-main-mist/80">
                <input type="checkbox" checked={checked.has(requirement)} onChange={() => onToggle(requirement)} className="mt-0.5 h-4 w-4 shrink-0 accent-main-accent-t1" />
                <span>{requirement}</span>
              </label>
            ))}
          </div>
        </>
      )}
      <label className="block">
        <span className="mb-1.5 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/50">{screeningQuestion}</span>
        <textarea value={screeningValue} onChange={(event) => onScreeningChange(event.target.value)} rows={3} className={CONTROL} placeholder="A few lines…" />
      </label>
    </div>
  );
}
