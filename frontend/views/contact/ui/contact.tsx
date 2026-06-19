import { ContactForm } from "@/features/contact-message";

const OFFICES = [
  { city: "Quy Nhơn", line: "Coastal HQ · Bình Định, Vietnam" },
  { city: "Ho Chi Minh City", line: "Investor relations · District 1" },
];

function Channel({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/45">{label}</p>
      <a href={`mailto:${value}`} className="text-sm text-main-mist/85 transition-colors hover:text-main-accent-t1">
        {value}
      </a>
    </div>
  );
}

export function ContactView() {
  return (
    <div className="min-h-screen bg-main-black text-main-mist">
      <section className="container pt-36 pb-24">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <p className="mb-5 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">Contact</p>
            <h1 className="font-serif-display text-4xl font-light text-white sm:text-5xl">
              Let&apos;s <span className="font-serif italic text-main-accent-t1">talk</span>.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-main-mist/60 sm:text-base">
              Questions about a role, an investment, or one of our coastal developments? Send a note and a person — not a bot — will reply.
            </p>
            <div className="mt-9 flex flex-wrap gap-10">
              <Channel label="Careers" value="careers@evinvest.vn" />
              <Channel label="Investors" value="invest@evinvest.vn" />
            </div>
            <div className="mt-10 grid gap-6 border-t border-white/[0.06] pt-8 sm:grid-cols-2">
              {OFFICES.map((office) => (
                <div key={office.city}>
                  <p className="font-mono-tech text-[10px] uppercase tracking-[0.18em] text-main-mist/60">{office.city}</p>
                  <p className="mt-1 text-sm text-main-mist/45">{office.line}</p>
                </div>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
