"use client";
import { usePlayer, TRACKS } from "../components/PlayerContext";
import ScrollReveal from "../components/ScrollReveal";
import ImageSlot from "../components/ImageSlot";

const ALBUMS = [
  {
    title: "Golden Hours",
    year: "2026",
    description:
      "Our most expansive record yet. Recorded live at The Old Mill Studio over three weeks in autumn. Every song a slow burn, every arrangement a small miracle of restraint.",
  },
  {
    title: "Dust & Wire",
    year: "2023",
    description:
      "A collection of road songs and late-night confessions. Written on tour, refined in silence. The record that taught us what we actually sound like.",
  },
  {
    title: "First Light",
    year: "2021",
    description:
      "Where it all began. Raw, honest, and a little rough around the edges. We wouldn't change a single imperfection.",
  },
];

function TrackRow({ track, index }) {
  const { currentTrack, isPlaying, play, togglePlay } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  return (
    <div
      className={`flex items-center gap-4 py-3.5 px-5 group cursor-pointer transition-colors border-b border-[#9B8040]/10 last:border-0 ${
        isActive ? "bg-[#9B8040]/10" : "hover:bg-[#EDE8DC]/3"
      }`}
      onClick={() => (isActive ? togglePlay() : play(track))}
    >
      <div className="w-6 text-center flex-shrink-0 text-xs">
        {isActive ? (
          <span className="text-[#9B8040]">{isPlaying ? "⏸" : "▶"}</span>
        ) : (
          <span className="text-[#7A7268] group-hover:text-[#9B8040] transition-colors">{index + 1}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`italic truncate text-lg ${isActive ? "text-[#9B8040]" : "text-[#EDE8DC]"}`}>
          {track.title}
        </p>
      </div>
      <span className="text-[#7A7268] text-xs flex-shrink-0">{track.duration}</span>
    </div>
  );
}

export default function Music() {
  return (
    <div style={{ fontFamily: "var(--font-cormorant)" }}>

      {/* ── Header ── */}
      <div className="spotlight pt-32 pb-20 px-6 text-center">
        <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">Discography</p>
        <h1 className="text-[clamp(4rem,12vw,9rem)] font-light italic text-[#EDE8DC] leading-none">
          Music
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-24 space-y-28">
        {ALBUMS.map((album, i) => {
          const albumTracks = TRACKS.filter((t) => t.album === album.title);

          return (
            <ScrollReveal key={album.title}>
              <article
                className={`flex flex-col md:flex-row gap-10 items-start ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Album art + tracks */}
                <div className="md:w-72 flex-shrink-0 w-full">
                  <ImageSlot
                    src={null}
                    alt={`${album.title} album art`}
                    ratio="1/1"
                    label={album.title.split(" ").map((w) => w[0]).join("")}
                  />

                  {/* Track list */}
                  <div className="border border-t-0 border-[#9B8040]/15 bg-[#0D0B09]">
                    {albumTracks.map((track, ti) => (
                      <TrackRow key={track.id} track={track} index={ti} />
                    ))}
                  </div>
                </div>

                {/* Album info */}
                <div className="flex-1">
                  <p className="text-[#9B8040] text-xs tracking-[0.4em] uppercase mb-3">
                    {album.year} &nbsp;·&nbsp; {albumTracks.length} Tracks
                  </p>
                  <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-semibold italic text-[#EDE8DC] mb-4 leading-tight">
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
                        className="border border-[#9B8040]/30 text-[#9B8040] px-6 py-2.5 text-xs tracking-[0.25em] uppercase hover:bg-[#9B8040]/10 hover:border-[#9B8040]/60 transition-colors"
                      >
                        {service}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
