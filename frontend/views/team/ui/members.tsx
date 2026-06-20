import Image from "next/image";
import { TEAM } from "@/entities/team";

// Leadership portraits — single source of truth is the `team` entity, so the
// page and the homepage Team section never drift.
export function TeamMembers() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {TEAM.map(member => (
        <article key={member.name} className="space-y-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-main-mist/10 bg-main-card">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <h3 className="font-serif-display text-base font-bold text-white">
            {member.name}
          </h3>
          <p className="font-mono-tech text-xs tracking-wide text-main-accent-t1">
            {member.role}
          </p>
          <p className="text-sm leading-relaxed text-main-mist/75">
            {member.bio}
          </p>
        </article>
      ))}
    </div>
  );
}
