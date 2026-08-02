"use client";

import { useState } from "react";

import { PlateStage } from "./plate-stage";
import { PlayControl } from "./play-control";
import type { MediaPlateSize, YouTubeCover } from "./types";

/**
 * YouTube's own thumbnail, used when the article ships no poster of its own.
 * Kept module-private: a plain function exported from a `"use client"` module is
 * a client reference on the server, so it must not cross the slice's public API.
 */
const youtubeThumbnail = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

/**
 * Click-to-load facade. Until the control is pressed the DOM holds a poster and
 * a button and nothing else — no YouTube script, no iframe, no cookie. On press
 * we mount the `youtube-nocookie.com` player (privacy-preserving host).
 */
export function YouTubeStage({
  cover,
  size,
}: {
  cover: YouTubeCover;
  size: MediaPlateSize;
}) {
  const [playing, setPlaying] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const poster = cover.poster ?? youtubeThumbnail(cover.videoId);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${cover.videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={cover.alt}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full"
      />
    );
  }

  return (
    <>
      <PlateStage
        src={posterFailed ? undefined : poster}
        alt={cover.alt}
        size={size}
        onError={() => setPosterFailed(true)}
      />
      <PlayControl
        label={`Play the video: ${cover.alt}`}
        size={size}
        onClick={() => setPlaying(true)}
      />
    </>
  );
}
