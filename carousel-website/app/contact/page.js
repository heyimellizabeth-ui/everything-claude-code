"use client";
import { useState } from "react";
import ScrollReveal from "../components/ScrollReveal";

const roles = [
  "Venue / Promoter",
  "Press / Media",
  "Festival Booking",
  "Sync / Licensing",
  "Management",
  "Other",
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "", email: "", role: "", date: "", message: "",
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.role)           e.role    = "Please select your role";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    // mailto: fallback — swap for Formspree/Resend when backend is available
    const subject = encodeURIComponent(`Carousel Enquiry — ${form.role}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nRole: ${form.role}\nPreferred Date: ${form.date || "—"}\n\n${form.message}`
    );
    window.location.href = `mailto:carouseldeband@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const field = (name) => ({
    value: form[name],
    onChange: (e) => { setForm((f) => ({ ...f, [name]: e.target.value })); setErrors((er) => { const n = { ...er }; delete n[name]; return n; }); },
  });

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-16" style={{ fontFamily: "var(--font-cormorant)" }}>
        <div className="text-center max-w-lg">
          <p className="text-[#9B8040] text-5xl mb-6">✦</p>
          <h2 className="text-4xl font-light italic text-[#EDE8DC] mb-4">Thank you</h2>
          <p className="text-[#7A7268] italic text-lg leading-relaxed">
            Your enquiry has been passed along. We&apos;ll be in touch shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "var(--font-cormorant)" }}>

      {/* ── Header ── */}
      <div className="spotlight pt-32 pb-20 px-6 text-center">
        <p className="text-[#9B8040] text-xs tracking-[0.5em] uppercase mb-4">Reach Out</p>
        <h1 className="text-[clamp(4rem,12vw,9rem)] font-light italic text-[#EDE8DC] leading-none">
          Contact
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* ── Left: context ── */}
          <ScrollReveal>
            <div>
              <h2 className="text-3xl font-light italic text-[#EDE8DC] mb-6 leading-snug">
                Bookings, press, and everything in between.
              </h2>
              <div className="h-px w-10 bg-[#9B8040] mb-8" />

              <div className="space-y-8 text-[#7A7268] italic text-lg leading-relaxed">
                <p>
                  Carousel is available for venues, festivals, and special events.
                  We bring the theatre with us.
                </p>
                <p>
                  For press and media enquiries — interviews, photography, features —
                  we&apos;re happy to talk.
                </p>
                <p>
                  For everything else, drop us a line. We read everything.
                </p>
              </div>

              <div className="mt-12 space-y-4">
                <a
                  href="https://www.instagram.com/carouseldeband"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm tracking-[0.25em] uppercase text-[#7A7268] hover:text-[#9B8040] transition-colors"
                >
                  <span className="text-[#9B8040]">✦</span>
                  @carouseldeband
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Right: form ── */}
          <ScrollReveal delay={2}>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs tracking-[0.3em] uppercase text-[#7A7268] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="form-input"
                  {...field("name")}
                />
                {errors.name && <p className="text-[#6B1A1A] text-sm italic mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs tracking-[0.3em] uppercase text-[#7A7268] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="form-input"
                  {...field("email")}
                />
                {errors.email && <p className="text-[#6B1A1A] text-sm italic mt-1">{errors.email}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs tracking-[0.3em] uppercase text-[#7A7268] mb-2">
                  I am a
                </label>
                <select className="form-input" {...field("role")}>
                  <option value="">Select your role…</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.role && <p className="text-[#6B1A1A] text-sm italic mt-1">{errors.role}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs tracking-[0.3em] uppercase text-[#7A7268] mb-2">
                  Preferred Date <span className="normal-case tracking-normal opacity-50">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. August 2026, flexible"
                  className="form-input"
                  {...field("date")}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs tracking-[0.3em] uppercase text-[#7A7268] mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us about the show, feature, or opportunity…"
                  className="form-input resize-none"
                  {...field("message")}
                />
                {errors.message && <p className="text-[#6B1A1A] text-sm italic mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-[#6B1A1A] text-[#EDE8DC] py-4 text-xs tracking-[0.4em] uppercase hover:bg-[#7D2020] transition-colors mt-2"
              >
                Send Enquiry
              </button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
