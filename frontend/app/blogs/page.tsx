import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLES } from "@/entities/article";

export const metadata: Metadata = {
  title: "Research",
  description:
    "EV Investment research articles — institutional analysis of Vietnam real estate.",
  alternates: { canonical: "/blogs" },
};

export default function Page() {
  return (
    <main
      className="min-h-screen text-main-mist py-24"
      style={{ marginTop: "6rem" }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl sm:text-5xl font-serif-display text-white font-light mb-12">
          Research <span className="italic text-main-accent-t1">Articles</span>
        </h1>
        <ul className="space-y-6">
          {ARTICLES.map(a => (
            <li
              key={a.slug}
              className="border border-main-mist/10 p-6 hover:border-main-accent-t1/30 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-mono-tech text-main-mist/40">
                    {a.date}
                  </span>
                  <h2 className="text-xl font-serif-display text-white font-bold mt-1 mb-3">
                    {a.title}
                  </h2>
                </div>
                <div className="flex gap-3 shrink-0">
                  <a
                    href={`/blogs/${a.slug}.pdf`}
                    download
                    className="text-xs font-mono-tech text-main-accent-t1 hover:text-main-mist transition-colors uppercase tracking-wider border border-main-accent-t1/30 px-3 py-2"
                  >
                    PDF
                  </a>
                  <Link
                    href={`/blogs/${a.slug}`}
                    className="text-xs font-mono-tech text-main-mist/60 hover:text-main-mist transition-colors uppercase tracking-wider border border-main-mist/10 px-3 py-2"
                  >
                    Read
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
