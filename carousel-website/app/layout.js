import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import { PlayerProvider } from "./components/PlayerContext";
import MusicPlayer from "./components/MusicPlayer";
import { KonamiListener } from "./components/EasterEggs";
import SocialLinks from "./components/SocialLinks";
import NewsletterSignup from "./components/NewsletterSignup";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata = {
  title: "Carousel — Theatrical Folk-Rock",
  description:
    "It spins round and round, showing us glimpses of the past, the future we want, the future we're told to want and the present. Official site of Carousel.",
  openGraph: {
    title: "Carousel",
    description: "Theatrical folk-rock. Official band website.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carousel",
    description: "Theatrical folk-rock. Official band website.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0D0B09] text-[#EDE8DC]">
        <PlayerProvider>
          <Nav />
          <main className="flex-1 pb-20">{children}</main>

          <footer
            className="border-t border-[#9B8040]/15 pb-24"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {/* Newsletter strip */}
            <div className="border-b border-[#9B8040]/10 py-12 px-6 text-center">
              <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-3">Stay Close</p>
              <p className="text-[#7A7268] italic text-lg mb-6">
                New shows, new music, no noise.
              </p>
              <NewsletterSignup />
            </div>

            {/* Links */}
            <div className="py-10 px-6 text-center">
              <p className="text-2xl font-light italic text-[#EDE8DC]/70 mb-7">Carousel</p>
              <SocialLinks className="justify-center mb-8" />
              <div className="flex items-center justify-center gap-6 mb-8">
                {[
                  { href: "/music",   label: "Music" },
                  { href: "/shows",   label: "Shows" },
                  { href: "/video",   label: "Video" },
                  { href: "/about",   label: "About" },
                  { href: "/contact", label: "Contact" },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    className="text-[#7A7268]/60 text-xs tracking-[0.3em] uppercase hover:text-[#9B8040] transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
              <p className="text-[#7A7268]/30 text-xs tracking-widest uppercase">
                © 2026 Carousel
              </p>
            </div>
          </footer>

          <MusicPlayer />
          <KonamiListener />
        </PlayerProvider>
      </body>
    </html>
  );
}
