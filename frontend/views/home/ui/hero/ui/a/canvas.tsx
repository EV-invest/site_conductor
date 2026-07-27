"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { Container } from "@evinvest/uikit";
import { ASSETS } from "@/shared/config/assets";

/**
 * Client island — owns the scroll-zoom state and applies it to the background
 * and content wrapper. Static copy (heading, body) is passed as `children` from
 * the server; the CTA is passed as `cta` so it renders inside the layout without
 * pulling extra logic into this component.
 *
 * The zoom is driven by writing to the two nodes directly rather than through
 * state: a scroll handler that calls `setZoom` re-renders and reconciles this
 * subtree on every scroll event, and the events fire far faster than frames.
 * Refs + one rAF-coalesced write per frame keep the main thread free for the
 * hero's first paint, which is where the cost actually hurts.
 */
export function HeroACanvas({
  children,
  cta,
}: {
  children: ReactNode;
  cta: ReactNode;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const apply = () => {
      frame = 0;
      const threshold = window.innerHeight;
      // Past a full viewport the hero is off-screen; leaving the last transform
      // in place avoids animating something nobody can see.
      if (window.scrollY >= threshold) return;

      const zoom = 1 + (window.scrollY / threshold) * 3;
      if (backdropRef.current) {
        backdropRef.current.style.transform = `scale(${zoom})`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `scale(${Math.max(0.8, 1 - (zoom - 1) * 0.15)})`;
        contentRef.current.style.opacity = `${Math.max(0.1, 1 - (zoom - 1) * 0.5)}`;
      }
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(apply);
    };

    // Restores the transform when the hero is re-entered on a soft navigation
    // that preserved scroll position.
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div
        ref={backdropRef}
        className="absolute inset-0 z-0 transition-transform duration-100 ease-out"
        style={{
          transform: "scale(1)",
          backgroundImage: `linear-gradient(to bottom, rgba(7, 13, 24, 0.78), rgba(7, 13, 24, 0.96)), url(${ASSETS.quynhon_future})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <Container className="relative z-10 text-center flex flex-col items-center justify-center h-full max-w-4xl px-4">
        <div
          ref={contentRef}
          className="transition-[transform,opacity] duration-700 ease-out"
          style={{ transform: "scale(1)", opacity: 1 }}
        >
          {children}
        </div>

        <div className="flex flex-col items-center gap-4">{cta}</div>
      </Container>
    </>
  );
}
