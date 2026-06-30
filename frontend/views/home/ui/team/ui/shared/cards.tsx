import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Button } from "@evinvest/uikit";
import { Text } from "@/shared/ui/text";
import { FrameCard } from "@/shared/ui/frame-card";
import { cn } from "@/shared/lib/utils";

/**
 * Non-person card — centred icon-disc, title, blurb, outline CTA button.
 * Used for open-role and LP-network slots. Only the icon, accent color, and
 * copy differ between instances.
 */
export function PlaceholderCard({
  icon: Icon,
  iconClassName,
  title,
  body,
  cta,
  href,
  heading,
  sub,
}: {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  heading: string;
  sub: string;
}) {
  return (
    <FrameCard
      heading={heading}
      headingClassName="text-main-mist/40"
      sub={
        <Text variant="secondary" className="text-base sm:text-xs font-mono-tech mt-1">
          {sub}
        </Text>
      }
    >
      <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div
            className={cn(
              "w-12 h-12 rounded-full bg-main-mist/5 border border-main-mist/10 flex items-center justify-center mx-auto",
              iconClassName
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-serif-display font-bold text-white text-lg sm:text-sm">{title}</h5>
            <Text variant="secondary" className="text-sm sm:text-xs mt-2 font-light">
              {body}
            </Text>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-main-mist/15 text-main-mist/80 hover:border-main-accent-t1 hover:text-main-accent-t1 text-xs py-1 h-auto bg-transparent"
          >
            <Link href={href}>{cta}</Link>
          </Button>
        </div>
      </div>
    </FrameCard>
  );
}
