import Link from "next/link";
import { SparkleOrnament } from "./components/EasterEggs";
import ScrollReveal from "./components/ScrollReveal";
import ImageSlot from "./components/ImageSlot";

export const metadata = {
  title: "Carousel — Theatrical Folk-Rock",
};

export default function Home() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Spotlight background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 75% at 50% 45%, #2D1010 0%, #150808 40%, #0D0B09 75%, #000 100%)",
          }}
        />

        {/* Concentric rings — decorative like the carousel figurine */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[800, 600, 420, 260].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-[#9B8040]/8"
              style={{ width: size, height: size }}
            />
          ))}
        </div>

        {/* Photo slot — full bleed hero image placeholder */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(ellipse 55% 65% at 50% 42%, rgba(107,26,26,0.4) 0%, transparent 70%)",
          }}
        />

        <div
          className="relative z-10 text-center px-6 max-w-4xl"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          <p className="anim-fade-up text-[#9B8040] text-xs tracking-[0.6em] uppercase mb-8">
            Theatrical Folk-Rock
          </p>

          <h1 className="anim-fade-up anim-delay-200 text-[clamp(5.5rem,20vw,15rem)] font-light italic text-[#EDE8DC] leading-none tracking-tight mb-2">
            Carousel
          </h1>

          <SparkleOrnament />

          <p className="anim-fade-up anim-delay-400 text-[#7A7268] text-xl italic font-light leading-relaxed max-w-lg mx-auto mb-14">
            It spins round and round, showing us glimpses of the past,
            the future we want, the future we&apos;re told to want and the present.
          </p>

          <div className="anim-fade-up anim-delay-600 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/music"
              className="bg-[#6B1A1A] text-[#EDE8DC] px-10 py-4 text-xs tracking-[0.4em] uppercase hover:bg-[#7D2020] transition-colors"
            >
              Listen
            </Link>
            <Link
              href="/shows"
              className="border border-[#9B8040]/40 text-[#9B8040] px-10 py-4 text-xs tracking-[0.4em] uppercase hover:border-[#9B8040] hover:text-[#EDE8DC] transition-colors"
            >
              See Shows
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 anim-fade-in anim-delay-1000">
          <div className="w-px h-12 bg-gradient-to-b from-[#9B8040]/60 to-transparent" />
          <p className="text-[#7A7268]/50 text-xs tracking-[0.3em] uppercase">Scroll</p>
        </div>
      </section>

      {/* ── Band photo strip — full bleed ── */}
      <section className="relative overflow-hidden">
        <ImageSlot src={null} alt="Carousel — band photo" ratio="21/9" label="Band photo" className="min-h-[280px]" />
      </section>

      {/* ── New release ── */}
      <section
        className="py-28 px-6 bg-[#0D0B09]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">
              Latest Release
            </p>
            <h2 className="text-[clamp(3rem,8vw,6rem)] font-semibold italic text-[#EDE8DC]">
              Golden Hours
            </h2>
            <p className="text-[#7A7268] mt-4 italic text-lg">
              Out now
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-[#9B8040]/15">
            {[
              ["12", "Tracks"],
              ["42", "Minutes"],
              ["4", "Years in the Making"],
            ].map(([num, label], i) => (
              <ScrollReveal
                key={label}
                delay={i + 1}
                className="py-14 px-8 text-center border-b md:border-b-0 md:border-r border-[#9B8040]/15 last:border-0"
              >
                <p className="text-5xl font-light italic text-[#6B1A1A] mb-2">{num}</p>
                <p className="text-xs tracking-[0.35em] uppercase text-[#7A7268]">{label}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pull quote ── */}
      <section
        className="py-28 px-6 text-center spotlight"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        <ScrollReveal className="max-w-3xl mx-auto">
          <p className="text-[#9B8040]/60 text-5xl font-light italic leading-none mb-6">&ldquo;</p>
          <p className="text-[clamp(1.8rem,4vw,3.2rem)] font-light italic text-[#EDE8DC] leading-relaxed">
            Hauntingly intimate — music that feels like something you almost remember.
          </p>
          <p className="text-[#9B8040] text-xs tracking-[0.4em] uppercase mt-8">
            @carouseldeband
          </p>
        </ScrollReveal>
      </section>

      {/* ── Members preview ── */}
      <section
        className="py-28 px-6"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">The Band</p>
            <h2 className="text-5xl font-light italic text-[#EDE8DC]">Meet Carousel</h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Marta",   role: "Vocals · Guitar" },
              { name: "Phineas", role: "Piano · Guitar" },
              { name: "Lars",    role: "Drums" },
              { name: "Fiep",    role: "Bass · Guitar" },
            ].map((m, i) => (
              <ScrollReveal key={m.name} delay={i + 1}>
                <div className="group cursor-pointer">
                  <ImageSlot src={null} alt={m.name} ratio="3/4" label={m.name[0]} className="mb-4 group-hover:opacity-90 transition-opacity" />
                  <p className="text-lg font-semibold italic text-[#EDE8DC]">{m.name}</p>
                  <p className="text-xs tracking-[0.25em] uppercase text-[#7A7268] mt-0.5">{m.role}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="text-center mt-14">
            <Link
              href="/about"
              className="text-xs tracking-[0.4em] uppercase text-[#9B8040] hover:text-[#EDE8DC] transition-colors border-b border-[#9B8040]/40 pb-0.5"
            >
              Read Their Stories
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Next show callout ── */}
      <section
        className="border-t border-b border-[#9B8040]/15 py-16 px-6"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <ScrollReveal>
            <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-2">Next Show</p>
            <p className="text-3xl font-semibold italic text-[#EDE8DC]">HAL 25 — Koningsdag</p>
            <p className="text-[#7A7268] mt-1">27 April · Amsterdam</p>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <Link
              href="/shows"
              className="bg-[#6B1A1A] text-[#EDE8DC] px-10 py-3.5 text-xs tracking-[0.4em] uppercase hover:bg-[#7D2020] transition-colors"
            >
              All Shows
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
