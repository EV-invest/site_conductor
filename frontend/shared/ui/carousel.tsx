"use client";

import { Children, useState, type ReactNode } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselEdgeFade,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@evinvest/uikit";
import { cn } from "@/shared/lib/utils";

/**
 * Mobile swipe pattern — one card in view, inset prev/next arrows, and a dot
 * rail. Wraps the index-controlled uikit <Carousel> and supplies the
 * indicators it doesn't ship. The caller decides when it shows (e.g.
 * `className="sm:hidden"`); every child becomes one slide, so the same card
 * nodes can feed both a desktop grid and this carousel without duplication.
 */
export function MobileCarousel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const slides = Children.toArray(children);

  return (
    <Carousel index={index} onIndexChange={setIndex} className={className}>
      <div className="relative">
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i}>{slide}</CarouselItem>
          ))}
        </CarouselContent>

        <CarouselEdgeFade />

        <CarouselPrevious className="left-3 size-9 border-main-mist/20 bg-main-black/40 text-white hover:bg-main-black/60 hover:text-white" />
        <CarouselNext className="right-3 size-9 border-main-mist/20 bg-main-black/40 text-white hover:bg-main-black/60 hover:text-white" />
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-main-accent-t1" : "w-1.5 bg-main-mist/25"
            )}
          />
        ))}
      </div>
    </Carousel>
  );
}
