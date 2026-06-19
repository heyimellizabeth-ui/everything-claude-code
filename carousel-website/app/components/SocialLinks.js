/**
 * Carousel social links — reusable across footer, About, and any CTA section.
 *
 * Usage:
 *   <SocialLinks />                        — default horizontal row
 *   <SocialLinks orientation="vertical" /> — stacked list
 *   <SocialLinks showLabels={false} />     — icons/symbols only
 */

const links = [
  {
    label: "Instagram",
    handle: "@carouseldeband",
    href: "https://www.instagram.com/carouseldeband",
    symbol: "◎",
  },
  {
    label: "Spotify",
    handle: "Carousel",
    href: "https://open.spotify.com/artist/carousel",
    symbol: "◉",
  },
  {
    label: "Bandcamp",
    handle: "carouseldeband",
    href: "https://carouseldeband.bandcamp.com",
    symbol: "◈",
  },
  {
    label: "YouTube",
    handle: "carouseldeband",
    href: "https://www.youtube.com/@carouseldeband",
    symbol: "▷",
  },
];

export default function SocialLinks({
  orientation = "horizontal",
  showLabels = true,
  className = "",
}) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${isVertical ? "flex-col gap-5" : "flex-row flex-wrap gap-7"} ${className}`}
      style={{ fontFamily: "var(--font-cormorant)" }}
    >
      {links.map(({ label, handle, href, symbol }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label}: ${handle}`}
          className="group flex items-center gap-2.5 text-[#7A7268] hover:text-[#9B8040] transition-colors"
        >
          <span className="text-[#9B8040]/60 group-hover:text-[#9B8040] transition-colors text-sm leading-none">
            {symbol}
          </span>
          {showLabels && (
            <span className="text-xs tracking-[0.3em] uppercase">{label}</span>
          )}
        </a>
      ))}
    </div>
  );
}
