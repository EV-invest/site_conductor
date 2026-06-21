import Image from "next/image";
import { TEAM, MemberCard, type TeamMember } from "@/entities/team";
import { MobileCarousel } from "@/shared/ui/carousel";

// Compact horizontal card — a small portrait beside the bio — keeps the desktop
// leadership grid short and readable across the row, instead of tall portraits
// that eat a screenful each. (Mobile swaps to the shared portrait MemberCard so
// the carousel matches the homepage Team section.)
function CompactCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex gap-5 rounded-xl border border-main-mist/10 bg-main-card p-5">
      <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-lg border border-main-mist/10 sm:w-36">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          sizes="160px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <h3 className="font-serif-display text-lg font-bold text-white">
          {member.name}
        </h3>
        <p className="mt-1 font-mono-tech text-xs tracking-wide text-main-accent-t1">
          {member.role}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-main-mist/75">
          {member.bio}
        </p>
      </div>
    </article>
  );
}

export function TeamMembers() {
  return (
    <>
      {/* Desktop: compact two-up grid. */}
      <div className="hidden gap-6 sm:grid sm:grid-cols-2">
        {TEAM.map(member => (
          <CompactCard key={member.name} member={member} />
        ))}
      </div>
      {/* Mobile: one portrait per swipe — same card as the homepage carousel. */}
      <MobileCarousel className="sm:hidden">
        {TEAM.map(member => (
          <MemberCard key={member.name} member={member} />
        ))}
      </MobileCarousel>
    </>
  );
}
