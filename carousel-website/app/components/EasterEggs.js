"use client";
import { useEffect, useState, useCallback } from "react";

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

export function KonamiListener() {
  const [seq, setSeq] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      setSeq((prev) => {
        const next = [...prev, e.key].slice(-KONAMI.length);
        if (next.join(",") === KONAMI.join(",")) setShow(true);
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={() => setShow(false)}
      style={{ fontFamily: "var(--font-cormorant)" }}
    >
      {/* Backstage pass */}
      <div
        className="relative bg-[#1E1B18] border border-[#9B8040]/60 p-0 w-72 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header stripe */}
        <div className="bg-[#6B1A1A] px-6 py-4 text-center">
          <p className="text-[#EDE8DC]/60 text-[10px] tracking-[0.5em] uppercase mb-1">
            All Access
          </p>
          <p className="text-[#EDE8DC] text-3xl font-semibold italic">
            Carousel
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <div className="w-16 h-16 border border-[#9B8040]/40 mx-auto mb-5 flex items-center justify-center">
            <span className="text-[#9B8040] text-3xl italic font-light">C</span>
          </div>

          <p className="text-[#9B8040] text-[10px] tracking-[0.4em] uppercase mb-1">
            Backstage Pass
          </p>
          <p className="text-[#EDE8DC] text-xl italic mb-4">
            Golden Hours Tour
          </p>
          <p className="text-[#7A7268] text-sm italic mb-6">
            Summer 2026
          </p>

          {/* Fake barcode */}
          <div className="flex justify-center gap-px mb-6">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#9B8040]/70"
                style={{
                  width: i % 3 === 0 ? 3 : 1,
                  height: i % 5 === 0 ? 32 : 24,
                }}
              />
            ))}
          </div>

          <p className="text-[#7A7268] text-[10px] tracking-widest">
            CAR-2026-∞
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-3 text-[#7A7268] hover:text-[#EDE8DC] text-lg transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function SparkleOrnament() {
  const [clicks, setClicks] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const handleClick = useCallback(() => {
    setClicks((n) => {
      const next = n + 1;
      if (next >= 7) {
        setRevealed(true);
        return 0;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => setRevealed(false), 3500);
    return () => clearTimeout(t);
  }, [revealed]);

  return (
    <div className="relative flex items-center justify-center gap-4 my-8">
      <div className="h-px w-16 bg-[#9B8040]/50" />

      <button
        onClick={handleClick}
        className="text-[#9B8040] text-lg transition-transform hover:scale-125 focus:outline-none"
        style={{
          textShadow: clicks > 3 ? `0 0 ${clicks * 4}px #9B8040` : "none",
          transition: "text-shadow 0.3s, transform 0.2s",
        }}
        aria-label="Ornament"
      >
        ✦
      </button>

      <div className="h-px w-16 bg-[#9B8040]/50" />

      {revealed && (
        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[#9B8040] text-xs tracking-[0.4em] uppercase animate-pulse"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          The carousel never stops
        </div>
      )}
    </div>
  );
}
