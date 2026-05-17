"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const links = [
  { href: "/music",   label: "Music" },
  { href: "/shows",   label: "Shows" },
  { href: "/video",   label: "Video" },
  { href: "/about",   label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) { setHidden(false); lastY.current = y; return; }
      setHidden(y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 border-b border-[#9B8040]/10 bg-[#0D0B09]/90 backdrop-blur-md transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ fontFamily: "var(--font-cormorant)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-semibold italic tracking-wide text-[#EDE8DC] hover:text-[#9B8040] transition-colors"
        >
          Carousel
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex gap-9 items-center">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link text-xs tracking-[0.3em] uppercase transition-colors duration-200 ${
                  pathname === href
                    ? "text-[#9B8040] is-active"
                    : "text-[#7A7268] hover:text-[#EDE8DC]"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#7A7268] hover:text-[#EDE8DC] transition-colors text-xl w-8 h-8 flex items-center justify-center"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile slide-in */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-[#9B8040]/10 bg-[#0D0B09] px-6 py-8 flex flex-col gap-7">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm tracking-[0.3em] uppercase transition-colors ${
                pathname === href ? "text-[#9B8040]" : "text-[#7A7268] hover:text-[#EDE8DC]"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#9B8040]/10">
            <a
              href="https://www.instagram.com/carouseldeband"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.3em] uppercase text-[#7A7268] hover:text-[#9B8040] transition-colors"
            >
              @carouseldeband
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
