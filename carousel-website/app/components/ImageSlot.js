"use client";
import Image from "next/image";
import { useState } from "react";

/**
 * Drop-in photo slot for the Carousel site.
 *
 * - src=null/""  → renders the spotlight-gradient placeholder (current state)
 * - src=string   → renders a Next.js Image with blur-up fade on load
 *
 * Usage:
 *   <ImageSlot src={null}    alt="Marta" ratio="3/4" />
 *   <ImageSlot src="/marta.jpg" alt="Marta" ratio="3/4" priority />
 */
export default function ImageSlot({
  src,
  alt = "",
  ratio = "1/1",
  priority = false,
  className = "",
  label = "",
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <>
          {/* Spotlight placeholder visible until image loads */}
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
            style={{
              background:
                "radial-gradient(ellipse 65% 70% at 50% 40%, #3D1515 0%, #1A0808 50%, #080606 100%)",
            }}
          />
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover transition-opacity duration-700 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            priority={priority}
            onLoad={() => setLoaded(true)}
          />
        </>
      ) : (
        /* No image yet — styled placeholder */
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 70% at 50% 40%, #3D1515 0%, #1A0808 50%, #080606 100%)",
          }}
        >
          {/* Subtle bottom gradient so text overlays read cleanly */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B09]/70 to-transparent" />
          {label && (
            <div className="absolute inset-0 flex items-end p-4">
              <span
                className="text-[#EDE8DC]/10 text-xs tracking-widest uppercase"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
