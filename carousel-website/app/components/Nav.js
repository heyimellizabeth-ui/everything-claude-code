"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/music", label: "Music" },
  { href: "/shows", label: "Shows" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[#9B8040]/20 bg-[#EDE8DC]/90 backdrop-blur-sm"
      style={{ fontFamily: "var(--font-cormorant)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-semibold italic tracking-wide text-[#1E1B18] hover:text-[#6B1A1A] transition-colors"
        >
          Carousel
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex gap-10 items-center">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm tracking-[0.25em] uppercase transition-colors pb-0.5 ${
                  pathname === href
                    ? "text-[#6B1A1A] border-b border-[#6B1A1A]"
                    : "text-[#7A7268] hover:text-[#1E1B18]"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#7A7268] text-xl"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#9B8040]/20 bg-[#EDE8DC] px-6 py-6 flex flex-col gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-base tracking-[0.25em] uppercase transition-colors ${
                pathname === href ? "text-[#6B1A1A]" : "text-[#7A7268]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
