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
  title: "Carousel",
  description: "Official website of Carousel — theatrical folk-rock",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#EDE8DC] text-[#1E1B18]">
        <PlayerProvider>
          <Nav />
          <main className="flex-1 pb-16">{children}</main>
          <footer
            className="border-t border-[#9B8040]/30 py-10 text-center pb-20"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            <p className="text-[#7A7268] text-sm tracking-widest uppercase">
              © 2026 Carousel &mdash; All rights reserved
            </p>
          </footer>
          <MusicPlayer />
          <KonamiListener />
        </PlayerProvider>
      </body>
    </html>
  );
}
