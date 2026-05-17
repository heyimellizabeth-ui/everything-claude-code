"use client";
import { usePlayer } from "./PlayerContext";

export default function MusicPlayer() {
  const { currentTrack, isPlaying, progress, togglePlay, skip, seek } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 bg-[#1E1B18] border-t border-[#9B8040]/30"
      style={{ fontFamily: "var(--font-cormorant)" }}
    >
      {/* Progress bar */}
      <div
        className="h-0.5 bg-[#9B8040]/20 cursor-pointer"
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

      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        {/* Album initial */}
        <div className="w-9 h-9 bg-[#6B1A1A] flex items-center justify-center flex-shrink-0">
          <span className="text-[#EDE8DC] text-sm italic font-light">
            {currentTrack.album[0]}
          </span>
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-[#EDE8DC] text-sm font-semibold italic truncate leading-tight">
            {currentTrack.title}
          </p>
          <p className="text-[#7A7268] text-xs truncate">{currentTrack.album}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <button
            onClick={() => skip(-1)}
            className="text-[#7A7268] hover:text-[#EDE8DC] transition-colors text-lg leading-none"
            aria-label="Previous"
          >
            ◂◂
          </button>

          <button
            onClick={togglePlay}
            className="w-9 h-9 border border-[#9B8040]/60 flex items-center justify-center text-[#9B8040] hover:bg-[#9B8040]/10 transition-colors text-sm"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={() => skip(1)}
            className="text-[#7A7268] hover:text-[#EDE8DC] transition-colors text-lg leading-none"
            aria-label="Next"
          >
            ▸▸
          </button>
        </div>

        {/* Duration */}
        <span className="text-[#7A7268] text-xs flex-shrink-0 hidden sm:block">
          {currentTrack.duration}
        </span>
      </div>
    </div>
  );
}
