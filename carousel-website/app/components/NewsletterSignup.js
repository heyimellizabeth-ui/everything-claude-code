"use client";
import { useState } from "react";

/**
 * Email capture for the Carousel mailing list.
 * Currently submits to a mailto fallback — swap `handleSubmit` for a
 * Mailchimp / ConvertKit / Resend endpoint when ready.
 */
export default function NewsletterSignup({ className = "" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | error | done
  const [error, setError] = useState("");

  const validate = (val) => {
    if (!val.trim()) return "Enter your email address";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate(email);
    if (err) { setError(err); setState("error"); return; }
    setError("");
    // TODO: replace with real mailing list endpoint (Mailchimp, Resend, etc.)
    setState("done");
  };

  if (state === "done") {
    return (
      <div className={`text-center ${className}`} style={{ fontFamily: "var(--font-cormorant)" }}>
        <span className="text-[#9B8040]">✦</span>
        <p className="text-[#7A7268] italic text-lg mt-2">You&apos;re on the list.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`${className}`}
      style={{ fontFamily: "var(--font-cormorant)" }}
    >
      <div className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === "error") { setState("idle"); setError(""); } }}
          placeholder="your@email.com"
          aria-label="Email address"
          className="flex-1 bg-transparent border border-[#9B8040]/25 text-[#EDE8DC] px-5 py-3.5 text-lg italic placeholder:text-[#7A7268]/40 outline-none focus:border-[#9B8040]/60 transition-colors"
          style={{ fontFamily: "var(--font-cormorant)" }}
        />
        <button
          type="submit"
          className="bg-[#6B1A1A] text-[#EDE8DC] px-8 py-3.5 text-xs tracking-[0.35em] uppercase hover:bg-[#7D2020] transition-colors flex-shrink-0 border-t sm:border-t-0 border-[#9B8040]/10"
        >
          Join
        </button>
      </div>
      {error && (
        <p className="text-[#6B1A1A] text-sm italic text-center mt-2">{error}</p>
      )}
    </form>
  );
}
