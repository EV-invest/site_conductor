import { MapPin } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { OFFICES } from "@/shared/config/site";
import { SectionHead } from "./section-head";

export function TeamOffices() {
  return (
    <section className="border-t border-main-mist/10 py-20">
      <Container className="space-y-12">
        <SectionHead eyebrow="Presence">Where we work</SectionHead>
        <div className="grid gap-6 md:grid-cols-2">
          {OFFICES.map(office => (
            <div
              key={office.id}
              className="space-y-3.5 rounded-xl border border-main-mist/10 bg-main-card p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-main-mist/5 text-main-accent-t1">
                  <MapPin className="size-5" />
                </div>
                <h3 className="font-mono-tech text-[11px] uppercase tracking-widest text-white">
                  {office.name}
                </h3>
              </div>
              <p className="leading-relaxed text-main-mist/80">
                {office.streetAddress}, {office.addressLocality},{" "}
                {office.addressRegion}, {office.addressCountry}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
