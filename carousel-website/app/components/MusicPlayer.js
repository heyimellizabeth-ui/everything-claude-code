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
          className="w-9 h-9 flex-shrink-0 overflow-hidden"
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
        <div className="flex-1 min-w-0">
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
            className="w-9 h-9 border border-[#9B8040]/40 flex items-center justify-center text-[#9B8040] hover:bg-[#9B8040]/10 hover:border-[#9B8040] transition-colors text-sm"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
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
