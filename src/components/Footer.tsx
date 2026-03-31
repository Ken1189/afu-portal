"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─── Footer config types (from site_config DB) ─── */

interface FooterLink {
  label: string;
  href: string;
  highlight?: boolean; // for green CTA-style links
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterSocialLink {
  platform: string;
  url: string;
  icon: string; // SVG path data
  viewBox?: string;
}

interface FooterConfig {
  columns?: FooterColumn[];
  social_links?: FooterSocialLink[];
}

/* ─── Hardcoded fallback data ─── */

const FALLBACK_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Services",
    links: [
      { label: "Financing", href: "/services/financing" },
      { label: "Inputs & Equipment", href: "/services/inputs" },
      { label: "Processing Hubs", href: "/services/processing" },
      { label: "Guaranteed Offtake", href: "/services/offtake" },
      { label: "Trade Finance", href: "/services/trade-finance" },
      { label: "Training", href: "/services/training" },
      { label: "Legal Assistance", href: "/services/legal-assistance" },
      { label: "Veterinary Services", href: "/services/veterinary" },
      { label: "Advertise with Us", href: "/services/advertising" },
      { label: "Carbon Credits", href: "/carbon" },
      { label: "Become a Supplier", href: "/supplier/apply", highlight: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About AFU", href: "/about" },
      { label: "Countries", href: "/countries" },
      { label: "Partners", href: "/partners" },
      { label: "Jobs", href: "/jobs" },
      { label: "Ambassadors", href: "/ambassadors" },
      { label: "Become an Ambassador", href: "/ambassadors#apply", highlight: true },
      { label: "Farms", href: "/farms" },
      { label: "Sponsor a Farmer", href: "/sponsor" },
      { label: "Donate", href: "/donate" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Become a Member", href: "/apply" },
    ],
  },
];

const FALLBACK_SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com/company/african-farming-union", icon: "M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zM.02 23h4.96V7.5H.02V23zM17.27 7.17c-2.68 0-3.88 1.47-4.55 2.5V7.5H7.76V23h4.96v-8.63c0-2.28 1.05-3.64 3.07-3.64s2.68 1.64 2.68 3.77V23H23.5v-9.5c0-4.64-2.63-6.33-6.23-6.33z", viewBox: "0 0 24 24" },
  { label: "Twitter", href: "https://x.com/africanfarming", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", viewBox: "0 0 24 24" },
  { label: "Facebook", href: "https://facebook.com/africanfarmingunion", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", viewBox: "0 0 24 24" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  /* ─── DB-driven footer config ─── */
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(FALLBACK_FOOTER_COLUMNS);
  const [socialLinks, setSocialLinks] = useState(FALLBACK_SOCIAL_LINKS);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "footer_config")
      .single()
      .then(({ data, error }) => {
        if (!error && data?.value) {
          const config = data.value as FooterConfig;
          if (config.columns && Array.isArray(config.columns) && config.columns.length > 0) {
            setFooterColumns(config.columns);
          }
          if (config.social_links && Array.isArray(config.social_links) && config.social_links.length > 0) {
            setSocialLinks(
              config.social_links.map((s) => ({
                label: s.platform,
                href: s.url,
                icon: s.icon,
                viewBox: s.viewBox || "0 0 24 24",
              }))
            );
          }
        }
        // On error or empty, keep fallback values
      });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // Send newsletter welcome email (fire and forget)
        fetch("/api/newsletter/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => {});

        setStatus("success");
        setMessage("Thanks for subscribing!");
        setEmail("");
        // Reset after 4 seconds
        setTimeout(() => { setStatus("idle"); setMessage(""); }, 4000);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <footer className="bg-[linear-gradient(180deg,var(--color-navy)_0%,var(--color-navy-dark)_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand + Logo */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              {/* Inline SVG logo — green square with leaf + AFU text */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-[#5DB347]/20 gradient-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.07-1.38C14.46 18.36 12 15.45 12 12c0-3.45 2.46-6.36 5.07-8.62A9.93 9.93 0 0012 2z" fill="white" opacity="0.9"/>
                  <path d="M17 6s-2 2.5-2 5c0 2.5 2 5 2 5s2-2.5 2-5c0-2.5-2-5-2-5z" fill="white" opacity="0.7"/>
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-xl tracking-tight">AFU</span>
                <span className="block text-xs text-gray-400 -mt-0.5">African Farming Union</span>
                <span className="block text-xs font-medium mt-1 text-green">Let&apos;s Grow Together</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Africa&apos;s Agriculture Development Bank + Operating Platform.
              Financing, Inputs, Processing, Offtake, Trade Finance &amp; Training.
            </p>
            {/* Social icons — DB-driven with fallback */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#5DB347] hover:border-[#5DB347] transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox={social.viewBox}>
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Footer link columns — DB-driven with fallback */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-white mb-5">
                {column.title}
              </h4>
              <div className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      link.highlight
                        ? "text-[#5DB347] hover:text-[#449933] text-sm font-medium transition-colors duration-300"
                        : "text-gray-400 hover:text-[#5DB347] text-sm transition-colors duration-300"
                    }
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter + Phase 1 */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white mb-5">
              Stay Updated
            </h4>
            <p className="text-gray-400 text-sm mb-3">Get the latest from AFU delivered to your inbox.</p>
            <form
              onSubmit={handleSubscribe}
              className="flex gap-2 mb-2"
            >
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === "error") { setStatus("idle"); setMessage(""); } }}
                className="flex-1 bg-white/5 border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#5DB347] transition-colors duration-300"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-[#5DB347]/20 disabled:opacity-50 disabled:cursor-not-allowed gradient-green"
              >
                {status === "loading" ? "..." : "\u2192"}
              </button>
            </form>
            {message && (
              <p className={`text-xs mb-4 ${status === "success" ? "text-[#5DB347]" : "text-red-400"}`}>
                {message}
              </p>
            )}

            <h4 className="font-semibold text-sm uppercase tracking-wider text-white mb-3 mt-4">
              Phase 1 Countries
            </h4>
            <div className="flex flex-col gap-1.5 text-gray-400 text-sm">
              <span>&#x1F1FF;&#x1F1FC; Zimbabwe (Export Lane)</span>
              <span>&#x1F1E7;&#x1F1FC; Botswana (Bank Base)</span>
              <span>&#x1F1F9;&#x1F1FF; Tanzania (Scale Lane)</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} African Farming Union (AFU). All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="text-gray-500 hover:text-[#5DB347] text-sm transition-colors duration-300">Privacy Policy</Link>
            <Link href="/legal/terms" className="text-gray-500 hover:text-[#5DB347] text-sm transition-colors duration-300">Terms of Service</Link>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#5DB347] hover:border-[#5DB347] transition-all duration-300"
              aria-label="Back to top"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
