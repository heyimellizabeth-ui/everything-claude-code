import Link from "next/link";
import { SparkleOrnament } from "./components/EasterEggs";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#1E1B18] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full border border-[#9B8040]/10" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-[#9B8040]/15" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-[#9B8040]/20" />
        </div>

        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B8040]/40 to-transparent" />

        <div
          className="relative z-10 text-center px-6 max-w-4xl"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-8">
            Est. 2019 &nbsp;·&nbsp; Theatrical Folk-Rock
          </p>

          <h1 className="text-[clamp(5rem,18vw,14rem)] font-light italic text-[#EDE8DC] leading-none tracking-tight mb-2">
            Carousel
          </h1>

          {/* Easter egg ✦ — click 7 times */}
          <SparkleOrnament />

          <p className="text-[#7A7268] text-xl italic font-light leading-relaxed max-w-md mx-auto mb-14">
            Songs that feel like something you almost remember
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/music"
              className="bg-[#6B1A1A] text-[#EDE8DC] px-10 py-3.5 text-sm tracking-[0.3em] uppercase hover:bg-[#7D2020] transition-colors"
            >
              Listen Now
            </Link>
            <Link
              href="/shows"
              className="border border-[#9B8040]/50 text-[#9B8040] px-10 py-3.5 text-sm tracking-[0.3em] uppercase hover:border-[#9B8040] hover:text-[#EDE8DC] transition-colors"
            >
              See Shows
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B8040]/40 to-transparent" />
      </section>

      {/* New album strip */}
      <section
        className="py-28 px-6"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">
              New Album
            </p>
            <h2 className="text-6xl font-semibold italic text-[#1E1B18]">
              Golden Hours
            </h2>
            <p className="text-[#7A7268] mt-4 italic text-lg">
              Out everywhere &mdash; May 2026
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#9B8040]/25">
            {[
              ["12", "Tracks"],
              ["42", "Minutes"],
              ["5", "Years in the Making"],
            ].map(([num, label]) => (
              <div
                key={label}
                className="py-14 px-8 text-center border-b md:border-b-0 md:border-r border-[#9B8040]/25 last:border-0"
              >
                <p className="text-5xl font-light italic text-[#6B1A1A] mb-2">
                  {num}
                </p>
                <p className="text-xs tracking-[0.3em] uppercase text-[#7A7268]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section
        className="bg-[#1E1B18] py-24 px-6 text-center"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        <div className="max-w-2xl mx-auto">
          <p className="text-4xl md:text-5xl font-light italic text-[#EDE8DC] leading-relaxed">
            &ldquo;Hauntingly beautiful&rdquo;
          </p>
          <p className="text-[#9B8040] text-xs tracking-[0.4em] uppercase mt-6">
            &mdash; Pitchfork
          </p>
        </div>
      </section>
    </div>
  );
}
