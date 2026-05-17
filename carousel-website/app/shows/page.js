const shows = [
  { date: "Jun 14", year: "2026", venue: "The Fillmore", city: "San Francisco, CA", status: "on-sale" },
  { date: "Jun 19", year: "2026", venue: "Bowery Ballroom", city: "New York, NY", status: "on-sale" },
  { date: "Jun 25", year: "2026", venue: "Empty Bottle", city: "Chicago, IL", status: "on-sale" },
  { date: "Jul 4",  year: "2026", venue: "Stubb's Waller Creek", city: "Austin, TX", status: "on-sale" },
  { date: "Jul 11", year: "2026", venue: "The Troubadour", city: "Los Angeles, CA", status: "sold-out" },
  { date: "Jul 18", year: "2026", venue: "Neumos", city: "Seattle, WA", status: "on-sale" },
  { date: "Aug 1",  year: "2026", venue: "Rough Trade NYC", city: "Brooklyn, NY", status: "coming-soon" },
];

const statusConfig = {
  "on-sale": { label: "On Sale", color: "text-[#1E1B18]" },
  "sold-out": { label: "Sold Out", color: "text-[#6B1A1A]" },
  "coming-soon": { label: "Coming Soon", color: "text-[#7A7268]" },
};

export const metadata = {
  title: "Shows — Carousel",
};

export default function Shows() {
  return (
    <div style={{ fontFamily: "var(--font-cormorant)" }}>
      {/* Page header */}
      <div className="bg-[#1E1B18] py-28 px-6 text-center relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B8040]/40 to-transparent" />
        <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">
          Live
        </p>
        <h1 className="text-7xl font-light italic text-[#EDE8DC]">Shows</h1>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B8040]/40 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="border-t border-[#9B8040]/25">
          {shows.map((show) => {
            const { label, color } = statusConfig[show.status];
            return (
              <div
                key={`${show.date}-${show.venue}`}
                className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-8 border-b border-[#9B8040]/25 group"
              >
                {/* Date */}
                <div className="sm:w-28 flex-shrink-0">
                  <p className="text-[#9B8040] font-semibold text-lg">{show.date}</p>
                  <p className="text-[#7A7268] text-sm">{show.year}</p>
                </div>

                {/* Venue */}
                <div className="flex-1">
                  <p className="text-2xl font-semibold italic text-[#1E1B18] leading-tight">
                    {show.venue}
                  </p>
                  <p className="text-[#7A7268] text-sm tracking-wide mt-0.5">
                    {show.city}
                  </p>
                </div>

                {/* Status + ticket */}
                <div className="flex items-center gap-6 sm:justify-end">
                  <span className={`text-xs tracking-[0.3em] uppercase ${color}`}>
                    {label}
                  </span>
                  {show.status === "on-sale" && (
                    <a
                      href="#"
                      className="border border-[#6B1A1A]/60 text-[#6B1A1A] px-5 py-2.5 text-xs tracking-[0.25em] uppercase hover:bg-[#6B1A1A] hover:text-[#EDE8DC] transition-colors"
                    >
                      Tickets
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[#7A7268] italic text-lg mt-14">
          More dates to be announced &mdash; check back soon
        </p>
      </div>
    </div>
  );
}
