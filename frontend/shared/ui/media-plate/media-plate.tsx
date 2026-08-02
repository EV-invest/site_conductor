import { PlateFrame } from "./plate-frame";
import { PlateStage } from "./plate-stage";
import { VideoStage } from "./video-plate";
import { YouTubeStage } from "./youtube-plate";
import type { MediaPlateCover, MediaPlateProps } from "./types";

/** The badge states what the plate IS — never what it is missing. */
function derivedBadge(cover: MediaPlateCover): string {
  switch (cover.type) {
    case "image":
      return cover.frames ? `PHOTO · ${cover.frames} FRAMES` : "PHOTO";
    case "video":
      return cover.duration ? `VIDEO · ${cover.duration}` : "VIDEO";
    case "youtube":
      return cover.duration ? `YOUTUBE · ${cover.duration}` : "YOUTUBE";
  }
}

/**
 * An institutional document plate, not a marketing hero: a bordered frame, a
 * 16:9 stage under a fixed tint/scrim treatment, and a caption rail that records
 * plate number, caption and provenance. Every variant shares that anatomy, so a
 * photo essay and a site video sit in the same column without re-reading as two
 * different components.
 *
 * Server dispatch: `image` ships zero JS; `video` and `youtube` server-render the
 * poster and hand only the stage to a client island.
 */
export function MediaPlate({
  cover,
  caption,
  provenance = "SHOT ON SITE",
  plateLabel,
  badge,
  size = "inline",
  className,
}: MediaPlateProps) {
  const chrome = {
    badge: badge ?? derivedBadge(cover),
    caption,
    provenance,
    plateLabel,
    size,
    className,
  };

  return (
    <PlateFrame {...chrome}>
      {cover.type === "video" ? (
        <VideoStage cover={cover} size={size} />
      ) : cover.type === "youtube" ? (
        <YouTubeStage cover={cover} size={size} />
      ) : (
        <PlateStage src={cover.src} alt={cover.alt} size={size} />
      )}
    </PlateFrame>
  );
}
