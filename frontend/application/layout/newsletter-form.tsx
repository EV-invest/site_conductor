"use client";

import { notifyPlaceholder } from "@/shared/lib/utils";

// Client island — the only interactive piece of the footer, split out so the
// rest of the footer (and its sitemap links) stays a Server Component.
export function NewsletterForm() {
  return (
    <div className="flex border border-main-mist/20">
      <input
        type="email"
        placeholder="Institutional Email"
        className="bg-transparent text-xs p-3 w-full focus:outline-none text-white"
      />
      <button
        className="bg-main-accent-t1 text-main-black px-4 font-mono-tech text-xs uppercase font-bold hover:bg-main-mist transition-colors"
        onClick={() => notifyPlaceholder("Newsletter Subscription")}
      >
        Join
      </button>
    </div>
  );
}
