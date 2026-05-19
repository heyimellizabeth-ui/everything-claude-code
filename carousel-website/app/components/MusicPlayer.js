"use client";
import { usePlayer } from "./PlayerContext";

export default function MusicPlayer() {
  const { currentTrack, isPlaying, progress, togglePlay, skip, seek } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0D0B09]/97 border-t border-[#9B8040]/20 backdrop-blur-sm"
      style={{ fontFamily: "var(--font-cormorant)" }}
    >
      {/* Progress bar */}
      <div
        className="h-px bg-[#9B8040]/15 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seek((e.clientX - rect.left) / rect.width);
        }}
      >
        <div
          className="h-full bg-[#9B8040] transition-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 sm:gap-6">
        {/* Album art placeholder */}
        <div
          key={`art-${currentTrack.id}`}
          className="w-9 h-9 flex-shrink-0 overflow-hidden track-enter"
          style={{
            background: "radial-gradient(ellipse at 40% 35%, #3D1515 0%, #1A0808 60%, #0D0809 100%)",
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#9B8040]/60 text-xs italic font-light">
              {currentTrack.album[0]}
            </span>
          </div>
        </div>

        {/* Track info */}
        <div key={`info-${currentTrack.id}`} className="flex-1 min-w-0 track-enter">
          <p className="text-[#EDE8DC] text-sm font-semibold italic truncate leading-tight">
            {currentTrack.title}
          </p>
          <p className="text-[#7A7268] text-xs truncate leading-tight">{currentTrack.album}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => skip(-1)}
            className="text-[#7A7268] hover:text-[#EDE8DC] transition-colors leading-none text-base"
            aria-label="Previous"
          >
            ◂◂
          </button>

          <button
            onClick={togglePlay}
            className="w-9 h-9 border border-[#9B8040]/40 flex items-center justify-center text-[#9B8040] hover:bg-[#9B8040]/10 hover:border-[#9B8040] transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <line x1="4.5" y1="2" x2="4.5" y2="12" />
                <line x1="9.5" y1="2" x2="9.5" y2="12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
                <polygon points="3.5,1.5 12.5,7 3.5,12.5" />
              </svg>
            )}
          </button>

          <button
            onClick={() => skip(1)}
            className="text-[#7A7268] hover:text-[#EDE8DC] transition-colors leading-none text-base"
            aria-label="Next"
          >
            ▸▸
          </button>
        </div>

        {/* Duration */}
        <span className="text-[#7A7268] text-xs flex-shrink-0 hidden sm:block tabular-nums">
          {currentTrack.duration}
        </span>
      </div>
    </div>
  );
}
