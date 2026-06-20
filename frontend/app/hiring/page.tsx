import type { Metadata } from "next";
import { listVacancies, type VacancySummary } from "@/entities/vacancy";
import { HiringView } from "@/views/hiring";

// SSG + ISR: the board statically prerenders (the force-cache fetch below makes
// the vacancy list cacheable) and revalidates hourly, so it loads instantly and
// new listings surface without a redeploy. An unreachable backend at build
// degrades to an empty board (see try/catch); ISR fills it on the next request.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join EV Investment — senior roles across investment, development, and client advisory for premium coastal developments in Quy Nhơn, Vietnam.",
  alternates: { canonical: "/hiring" },
};

export default async function Page() {
  let vacancies: VacancySummary[] = [];
  try {
    // force-cache + the segment revalidate above = ISR (static board, hourly
    // refresh). The generated client passes a Request object, which segment
    // revalidate alone won't make cacheable, so opt in explicitly here.
    const { data } = await listVacancies({ cache: "force-cache" });
    vacancies = data ?? [];
  } catch {
    // Backend unreachable — render the page shell with an empty board.
    vacancies = [];
  }
  return <HiringView vacancies={vacancies} />;
}
