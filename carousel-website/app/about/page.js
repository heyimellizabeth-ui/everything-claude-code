import ScrollReveal from "../components/ScrollReveal";
import ImageSlot from "../components/ImageSlot";
import SocialLinks from "../components/SocialLinks";
import Link from "next/link";

export const metadata = {
  title: "About — Carousel",
};

const members = [
  {
    name: "Marta",
    role: "Lead Vocals · Guitar · Bass · Songwriting",
    tagline: "Amazing singer",
    bio: "Marta is the still centre of everything Carousel does. Her voice holds a room by doing the opposite of what you expect — quieter when it should be loud, more vulnerable when it could be grand. She writes the words that the others learn to live inside.",
  },
  {
    name: "Phineas",
    role: "Piano · Guitar · Backing Vocals",
    tagline: "The musical architect",
    bio: "Phineas hears the shape of a song before it exists. He builds the harmonic world that gives Marta's melodies somewhere to breathe. On stage he plays like he's translating something that has no words. Which, as far as Carousel is concerned, is exactly the point.",
  },
  {
    name: "Lars",
    role: "Drums · Backing Vocals",
    tagline: "Trommel tovenaar",
    bio: "Lars is the heartbeat. The band calls him the trommel tovenaar — the drum wizard — and the name fits. His timing isn't just good, it's generous. He gives the song room to breathe and then closes it exactly when it needs closing.",
  },
  {
    name: "Fiep",
    role: "Bass Guitar · Guitar · Vocals · Lyrics",
    tagline: "The low end that holds it all",
    bio: "Fiep writes songs the way other people keep journals — raw, specific, and never meant to stay private for long. Her bass lines are the foundation the rest of the band walks on, low and warm and completely steady.",
  },
];

export default function About() {
  return (
    <div style={{ fontFamily: "var(--font-cormorant)" }}>

      {/* ── Hero ── */}
      <div className="relative pt-16 min-h-[60vh] flex items-end pb-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 50% 40%, #2D1010 0%, #150808 45%, #0D0B09 100%)",
          }}
        />

        {/* Full-band photo placeholder */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: "radial-gradient(ellipse 65% 75% at 50% 40%, #3D1515 0%, #1A0808 50%, #080606 100%)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#EDE8DC]/8 text-xs tracking-[0.5em] uppercase">Band photo</p>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0D0B09] to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center w-full">
          <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">The Band</p>
          <h1 className="text-[clamp(4rem,12vw,9rem)] font-light italic text-[#EDE8DC] leading-none">
            Carousel
          </h1>
        </div>
      </div>

      {/* ── Bio ── */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="ornament-divider mb-14 text-xl">✦</div>

        <ScrollReveal>
          <p className="text-[clamp(1.4rem,2.5vw,2rem)] font-light italic text-[#EDE8DC] leading-relaxed mb-8">
            Carousel formed over a shared obsession with theatre, folk music,
            and the things that happen between the verses.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={2}>
          <p className="text-[#7A7268] text-lg italic leading-relaxed mb-6">
            The four-piece has spent years building something slow and necessary —
            songs that feel like they&apos;ve always existed, like you&apos;ve been
            humming them your whole life without knowing why.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={3}>
          <p className="text-[#7A7268] text-lg italic leading-relaxed">
            Their sound lives somewhere between folk, chamber pop, and something harder to name.
            Intimate. Theatrical. Built to last.
          </p>
        </ScrollReveal>

        <div className="ornament-divider mt-14 text-xl">✦</div>
      </section>

      {/* ── Members ── */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <ScrollReveal className="text-center mb-16">
          <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase">Members</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((member, i) => (
            <ScrollReveal key={member.name} delay={((i % 2) + 1)}>
              <div className="card-lift group border border-[#9B8040]/15 hover:border-[#9B8040]/35 overflow-hidden">
                <ImageSlot src={null} alt={member.name} ratio="4/3" label={member.name} />

                {/* Info */}
                <div className="p-8">
                  <p className="text-[#9B8040] text-xs tracking-[0.3em] uppercase mb-1 opacity-70 italic">
                    {member.tagline}
                  </p>
                  <h3 className="text-4xl font-semibold italic text-[#EDE8DC] leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-[#9B8040] text-xs tracking-[0.25em] uppercase mt-1.5 mb-5">
                    {member.role}
                  </p>
                  <div className="h-px w-8 bg-[#9B8040]/30 mb-5" />
                  <p className="text-[#7A7268] italic text-lg leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Social CTA ── */}
      <section className="spotlight py-20 px-6 text-center">
        <ScrollReveal>
          <p className="text-[#7A7268] text-sm italic mb-6">Follow the journey</p>
          <SocialLinks className="justify-center" />
        </ScrollReveal>
      </section>

      {/* ── Booking CTA ── */}
      <section className="border-t border-[#9B8040]/15 py-16 px-6 text-center">
        <ScrollReveal>
          <p className="text-[#7A7268] italic text-lg mb-6">
            For bookings and press enquiries
          </p>
          <Link
            href="/contact"
            className="border border-[#9B8040]/40 text-[#9B8040] px-10 py-3.5 text-xs tracking-[0.4em] uppercase hover:border-[#9B8040] hover:text-[#EDE8DC] transition-colors"
          >
            Get in Touch
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
