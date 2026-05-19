"use client";
import { useEffect, useRef } from "react";

export default function ParallaxBg({ className = "", style }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const y = Math.min(window.scrollY * 0.28, 80);
      el.style.transform = `translateY(${y}px)`;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div ref={ref} className={className} style={{ ...style, willChange: "transform" }} />
  );
}
