import ScrollReveal from "../components/ScrollReveal";
import Link from "next/link";

export const metadata = {
  title: "Shows — Carousel",
};

const shows = [
  { date: "27 Apr", year: "2026", venue: "HAL 25", city: "Amsterdam, NL", note: "Koningsdag", status: "on-sale" },
  { date: "14 Jun", year: "2026", venue: "Paradiso Kleine Zaal", city: "Amsterdam, NL", note: "", status: "on-sale" },
  { date: "21 Jun", year: "2026", venue: "Ekko", city: "Utrecht, NL", note: "", status: "on-sale" },
  { date: "5 Jul",  year: "2026", venue: "Volt", city: "Maastricht, NL", note: "", status: "on-sale" },
  { date: "18 Jul", year: "2026", venue: "De Kreun", city: "Kortrijk, BE", note: "", status: "coming-soon" },
  { date: "2 Aug",  year: "2026", venue: "TBA", city: "Gent, BE", note: "", status: "coming-soon" },
];

const statusConfig = {
  "on-sale":     { label: "On Sale",    classes: "text-[#9B8040]" },
  "sold-out":    { label: "Sold Out",   classes: "text-[#6B1A1A]" },
  "coming-soon": { label: "Coming Soon", classes: "text-[#7A7268]" },
};

export default function Shows() {
  const nextShow = shows.find((s) => s.status === "on-sale");

  return (
    <div style={{ fontFamily: "var(--font-cormorant)" }}>

      {/* ── Header ── */}
      <div className="spotlight pt-32 pb-20 px-6 text-center">
        <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">Live</p>
        <h1 className="text-[clamp(4rem,12vw,9rem)] font-light italic text-[#EDE8DC] leading-none">
          Shows
        </h1>
      </div>

      {/* ── Next show callout ── */}
      {nextShow && (
        <div className="border-t border-b border-[#9B8040]/15 py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-[#9B8040] text-xs tracking-[0.4em] uppercase mb-1">Next Up</p>
              <p className="text-2xl font-semibold italic text-[#EDE8DC]">
                {nextShow.venue}
                {nextShow.note && (
                  <span className="text-[#9B8040] text-base font-light ml-3">— {nextShow.note}</span>
                )}
              </p>
              <p className="text-[#7A7268] text-sm mt-0.5">
                {nextShow.date} · {nextShow.city}
              </p>
            </div>
            <a
              href="#"
              className="bg-[#6B1A1A] text-[#EDE8DC] px-8 py-3 text-xs tracking-[0.4em] uppercase hover:bg-[#7D2020] transition-colors flex-shrink-0"
            >
              Get Tickets
            </a>
          </div>
        </div>
      )}

      {/* ── Show list ── */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="border-t border-[#9B8040]/15">
          {shows.map((show, i) => {
            const { label, classes } = statusConfig[show.status];
            return (
              <ScrollReveal key={`${show.date}-${show.venue}`} delay={(i % 3) + 1}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-9 border-b border-[#9B8040]/15 group">
                  {/* Date */}
                  <div className="sm:w-28 flex-shrink-0">
                    <p className="text-[#9B8040] font-semibold text-xl">{show.date}</p>
                    <p className="text-[#7A7268] text-sm">{show.year}</p>
                  </div>

                  {/* Venue */}
                  <div className="flex-1">
                    <p className="text-2xl font-semibold italic text-[#EDE8DC] leading-tight group-hover:text-[#9B8040] transition-colors">
                      {show.venue}
                    </p>
                    <p className="text-[#7A7268] text-sm tracking-wide mt-0.5">
                      {show.city}
                      {show.note && (
                        <span className="ml-2 text-[#9B8040]/70 italic">· {show.note}</span>
                      )}
                    </p>
                  </div>

                  {/* Status + ticket */}
                  <div className="flex items-center gap-6 sm:justify-end flex-shrink-0">
                    <span className={`text-xs tracking-[0.3em] uppercase ${classes}`}>
                      {label}
                    </span>
                    {show.status === "on-sale" && (
                      <a
                        href="#"
                        className="border border-[#6B1A1A]/50 text-[#6B1A1A] px-5 py-2.5 text-xs tracking-[0.25em] uppercase hover:bg-[#6B1A1A] hover:text-[#EDE8DC] transition-colors"
                      >
                        Tickets
                      </a>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal className="text-center mt-16">
          <p className="text-[#7A7268] italic text-lg mb-8">
            More dates to be announced — sign up or check back soon.
          </p>
          <Link
            href="/contact"
            className="text-xs tracking-[0.4em] uppercase text-[#9B8040] hover:text-[#EDE8DC] transition-colors border-b border-[#9B8040]/40 pb-0.5"
          >
            Book Carousel for Your Venue
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
