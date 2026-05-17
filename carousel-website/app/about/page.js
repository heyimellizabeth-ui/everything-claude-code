const members = [
  {
    name: "Elara Voss",
    role: "Vocals, Guitar",
    bio: "Elara writes songs the way other people keep journals — raw, specific, and never meant to stay private for long. Her voice is the thing that holds the room still.",
  },
  {
    name: "Jonas Reed",
    role: "Bass, Harmonies",
    bio: "Jonas came up playing gospel in his grandmother's church. You can still hear it in everything he plays — the patience, the weight, the sense of something arriving.",
  },
  {
    name: "Mira Tanaka",
    role: "Drums, Percussion",
    bio: "Mira's timing is the band's heartbeat. Off stage she collects vintage drum machines and broken clocks, which feels right somehow.",
  },
  {
    name: "Cal Whitmore",
    role: "Pedal Steel, Keys",
    bio: "Cal plays pedal steel like he's translating something that has no words. Which, as far as Carousel is concerned, is exactly the point.",
  },
];

export const metadata = {
  title: "About — Carousel",
};

export default function About() {
  return (
    <div style={{ fontFamily: "var(--font-cormorant)" }}>
      {/* Page header */}
      <div className="bg-[#1E1B18] py-28 px-6 text-center relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B8040]/40 to-transparent" />
        <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">
          The Band
        </p>
        <h1 className="text-7xl font-light italic text-[#EDE8DC]">About</h1>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B8040]/40 to-transparent" />
      </div>

      {/* Bio */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px w-12 bg-[#9B8040]/50" />
          <span className="text-[#9B8040] text-lg">✦</span>
          <div className="h-px w-12 bg-[#9B8040]/50" />
        </div>

        <p className="text-3xl font-light italic text-[#1E1B18] leading-relaxed mb-8">
          Carousel formed in Portland in 2019, over a shared love of long drives,
          late-night diners, and music that doesn&apos;t rush to get anywhere.
        </p>

        <p className="text-[#7A7268] text-lg italic leading-relaxed mb-6">
          The four-piece has spent the years since crisscrossing the country,
          releasing three records, and building a quietly devoted following.
        </p>

        <p className="text-[#7A7268] text-lg italic leading-relaxed">
          Their sound lives somewhere between folk, Americana, and something harder
          to name — songs that feel like they&apos;ve always existed, like you&apos;ve
          been humming them your whole life without knowing why.
        </p>

        <div className="flex items-center justify-center gap-4 mt-12">
          <div className="h-px w-12 bg-[#9B8040]/50" />
          <span className="text-[#9B8040] text-lg">✦</span>
          <div className="h-px w-12 bg-[#9B8040]/50" />
        </div>
      </section>

      {/* Members */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase text-center mb-14">
          Members
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {members.map((member) => (
            <div
              key={member.name}
              className="border border-[#9B8040]/25 p-10 hover:border-[#9B8040]/50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-16 h-16 bg-[#1E1B18] flex items-center justify-center mb-7">
                <span className="text-[#9B8040] text-2xl font-light italic">
                  {member.name[0]}
                </span>
              </div>

              <h3 className="text-3xl font-semibold italic text-[#1E1B18] leading-tight">
                {member.name}
              </h3>
              <p className="text-[#9B8040] text-xs tracking-[0.3em] uppercase mt-1.5 mb-5">
                {member.role}
              </p>
              <div className="h-px w-8 bg-[#9B8040]/40 mb-5" />
              <p className="text-[#7A7268] italic text-lg leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
