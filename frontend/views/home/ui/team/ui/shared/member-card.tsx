import Image from "next/image";
import { Text } from "@/shared/ui/text";
import type { TeamMember } from "@/entities/team";
import { Card } from "./cards";

/**
 * One team member's portrait cell — extracted so both A/B variants and the
 * mobile carousel render from a single definition. The bio reveals on hover
 * (desktop only); on touch the carousel shows name + role, matching the design.
 */
export function MemberCard({ member }: { member: TeamMember }) {
  return (
    <Card
      heading={member.name}
      headingClassName="text-white"
      sub={
        <p className="mt-1 font-mono-tech text-xs text-main-accent-t1">
          {member.role}
        </p>
      }
    >
      <Image
        src={member.photo}
        alt={member.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-main-black/85 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Text className="text-xs">{member.bio}</Text>
      </div>
    </Card>
  );
}
