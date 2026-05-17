"use client";
import { usePlayer, TRACKS } from "../components/PlayerContext";

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

function TrackRow({ track }) {
  const { currentTrack, isPlaying, play, togglePlay } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  return (
    <div
      className={`flex items-center gap-4 py-3 px-4 group cursor-pointer transition-colors ${
        isActive ? "bg-[#9B8040]/10" : "hover:bg-[#9B8040]/5"
      }`}
      onClick={() => (isActive ? togglePlay() : play(track))}
    >
      <div className="w-5 text-center flex-shrink-0">
        {isActive ? (
          <span className="text-[#9B8040] text-sm">{isPlaying ? "⏸" : "▶"}</span>
        ) : (
          <span className="text-[#7A7268] text-xs group-hover:text-[#9B8040] transition-colors">▶</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`italic truncate ${
            isActive ? "text-[#9B8040]" : "text-[#1E1B18]"
          }`}
        >
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
        {ALBUMS.map((album, i) => {
          const albumTracks = TRACKS.filter((t) => t.album === album.title);

          return (
            <article
              key={album.title}
              className={`flex flex-col md:flex-row gap-12 items-start ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Art + tracks */}
              <div className="md:w-72 flex-shrink-0 w-full">
                <div className="aspect-square bg-[#1E1B18] flex items-center justify-center relative overflow-hidden mb-0">
                  <div className="absolute inset-0 border border-[#9B8040]/20" />
                  <div className="text-center">
                    <p className="text-[#9B8040] text-xs tracking-[0.4em] uppercase mb-2">
                      {album.year}
                    </p>
                    <p className="text-[#EDE8DC]/20 text-5xl font-light italic">
                      {album.title
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </p>
                  </div>
                </div>

                {/* Track list */}
                <div className="border border-t-0 border-[#9B8040]/20 bg-[#F4F0E8]">
                  {albumTracks.map((track) => (
                    <TrackRow key={track.id} track={track} />
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-[#9B8040] text-xs tracking-[0.4em] uppercase mb-3">
                  {album.year} &nbsp;·&nbsp; {albumTracks.length} Tracks
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
          );
        })}
      </div>
    </div>
  );
}
