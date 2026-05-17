import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import { PlayerProvider } from "./components/PlayerContext";
import MusicPlayer from "./components/MusicPlayer";
import { KonamiListener } from "./components/EasterEggs";

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
            className="border-t border-[#9B8040]/15 py-14 text-center pb-24"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            <p className="text-3xl font-light italic text-[#EDE8DC]/80 mb-6">Carousel</p>
            <div className="flex items-center justify-center gap-8 mb-8">
              <a
                href="https://www.instagram.com/carouseldeband"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7A7268] text-xs tracking-[0.35em] uppercase hover:text-[#9B8040] transition-colors"
              >
                Instagram
              </a>
              <span className="text-[#9B8040]/30">✦</span>
              <a
                href="/contact"
                className="text-[#7A7268] text-xs tracking-[0.35em] uppercase hover:text-[#9B8040] transition-colors"
              >
                Bookings
              </a>
              <span className="text-[#9B8040]/30">✦</span>
              <a
                href="/music"
                className="text-[#7A7268] text-xs tracking-[0.35em] uppercase hover:text-[#9B8040] transition-colors"
              >
                Music
              </a>
            </div>
            <p className="text-[#7A7268]/50 text-xs tracking-widest uppercase">
              © 2026 Carousel
            </p>
          </footer>

          <MusicPlayer />
          <KonamiListener />
        </PlayerProvider>
      </body>
    </html>
  );
}
