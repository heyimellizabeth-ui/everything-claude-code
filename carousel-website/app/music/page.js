const albums = [
  {
    title: "Golden Hours",
    year: "2026",
    tracks: 12,
    description:
      "Our most expansive record yet. Recorded live at The Old Mill Studio over three weeks in autumn. Every song a slow burn, every arrangement a small miracle of restraint.",
  },
  {
    title: "Dust & Wire",
    year: "2023",
    tracks: 10,
    description:
      "A collection of road songs and late-night confessions. Written on tour, refined in silence. The record that taught us what we actually sound like.",
  },
  {
    title: "First Light",
    year: "2021",
    tracks: 8,
    description:
      "Where it all began. Raw, honest, and a little rough around the edges. We wouldn't change a single imperfection.",
  },
];

export const metadata = {
  title: "Music — Carousel",
};

export default function Music() {
  return (
    <div style={{ fontFamily: "var(--font-cormorant)" }}>
      {/* Page header */}
      <div className="bg-[#1E1B18] py-28 px-6 text-center relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B8040]/40 to-transparent" />
        <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">
          Discography
        </p>
        <h1 className="text-7xl font-light italic text-[#EDE8DC]">Music</h1>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B8040]/40 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-24 space-y-28">
        {albums.map((album, i) => (
          <article
            key={album.title}
            className={`flex flex-col md:flex-row gap-12 items-start ${
              i % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Art placeholder */}
            <div className="md:w-64 flex-shrink-0 w-full">
              <div className="aspect-square bg-[#1E1B18] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 border border-[#9B8040]/20" />
                <div className="text-center">
                  <p className="text-[#9B8040] text-xs tracking-[0.4em] uppercase mb-2">
                    {album.year}
                  </p>
                  <p className="text-[#EDE8DC]/30 text-4xl font-light italic">
                    {album.title.split(" ").map((w) => w[0]).join("")}
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-[#9B8040] text-xs tracking-[0.4em] uppercase mb-3">
                {album.year} &nbsp;·&nbsp; {album.tracks} Tracks
              </p>
              <h2 className="text-5xl font-semibold italic text-[#1E1B18] mb-4 leading-tight">
                {album.title}
              </h2>
              <div className="h-px w-10 bg-[#9B8040] mb-6" />
              <p className="text-[#7A7268] italic text-lg leading-relaxed mb-8">
                {album.description}
              </p>
              <div className="flex flex-wrap gap-3">
                {["Spotify", "Apple Music", "Bandcamp"].map((service) => (
                  <a
                    key={service}
                    href="#"
                    className="border border-[#1E1B18]/40 text-[#1E1B18] px-6 py-2.5 text-xs tracking-[0.25em] uppercase hover:bg-[#1E1B18] hover:text-[#EDE8DC] transition-colors"
                  >
                    {service}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
