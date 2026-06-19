import ScrollReveal from "../components/ScrollReveal";

export const metadata = {
  title: "Video — Carousel",
};

const categories = ["All", "Live", "Music Videos", "Acoustic"];

const videos = [
  {
    id: "dQw4w9WgXcQ",
    title: "Golden Hours — Live at The Old Mill",
    category: "Live",
    date: "2026",
    description: "Full live session from our record release show.",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "The Weight of Silver — Official Video",
    category: "Music Videos",
    date: "2026",
    description: "Directed by Studio Noir. Shot in one take.",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Kindling — Acoustic Session",
    category: "Acoustic",
    date: "2024",
    description: "Stripped back in the rehearsal room.",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Last Train South — Live at Paradiso",
    category: "Live",
    date: "2025",
    description: "From the sold-out Paradiso show.",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Dust & Wire — Official Video",
    category: "Music Videos",
    date: "2023",
    description: "The album that taught us what we sound like.",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "First Light — Acoustic",
    category: "Acoustic",
    date: "2021",
    description: "Where it all started. Just Marta and a guitar.",
  },
];

function VideoCard({ video, index }) {
  return (
    <ScrollReveal delay={(index % 3) + 1}>
      <article className="group border border-[#9B8040]/15 hover:border-[#9B8040]/35 transition-all duration-500 overflow-hidden">
        {/* Embed */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9B8040] text-xs tracking-[0.3em] uppercase">{video.category}</span>
            <span className="text-[#7A7268] text-xs">{video.date}</span>
          </div>
          <h3 className="text-xl font-semibold italic text-[#EDE8DC] leading-tight mb-2 group-hover:text-[#9B8040] transition-colors">
            {video.title}
          </h3>
          <p className="text-[#7A7268] italic text-sm leading-relaxed">{video.description}</p>
        </div>
      </article>
    </ScrollReveal>
  );
}

export default function Video() {
  return (
    <div style={{ fontFamily: "var(--font-cormorant)" }}>

      {/* ── Header ── */}
      <div className="spotlight pt-32 pb-20 px-6 text-center">
        <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">Watch</p>
        <h1 className="text-[clamp(4rem,12vw,9rem)] font-light italic text-[#EDE8DC] leading-none">
          Video
        </h1>
      </div>

      {/* ── Category filter note ── */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-4">
        <div className="flex gap-6 border-b border-[#9B8040]/15 pb-6 overflow-x-auto">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`text-xs tracking-[0.3em] uppercase pb-1 flex-shrink-0 transition-colors ${
                i === 0
                  ? "text-[#9B8040] border-b border-[#9B8040]"
                  : "text-[#7A7268] hover:text-[#EDE8DC]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-12 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, i) => (
            <VideoCard key={video.title} video={video} index={i} />
          ))}
        </div>

        <ScrollReveal className="text-center mt-16">
          <a
            href="https://www.youtube.com/@carouseldeband"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-[0.4em] uppercase text-[#9B8040] hover:text-[#EDE8DC] transition-colors border-b border-[#9B8040]/40 pb-0.5"
          >
            More on YouTube
          </a>
        </ScrollReveal>
      </div>
    </div>
  );
}
