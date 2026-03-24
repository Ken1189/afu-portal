"use client";

import { useState } from "react";
import { TrendingUp, Sprout, Megaphone, Trophy, DollarSign, Microscope, Newspaper, type LucideIcon } from "lucide-react";

const interests = [
  { id: "market_prices", label: "Market Prices" },
  { id: "farming_tips", label: "Farming Tips" },
  { id: "investment", label: "Investment" },
  { id: "insurance", label: "Insurance" },
  { id: "technology", label: "Technology" },
];

const countries = [
  "Zimbabwe",
  "Botswana",
  "Tanzania",
  "Kenya",
  "Uganda",
  "Ghana",
  "Zambia",
  "Malawi",
  "Mozambique",
  "DRC",
  "Rwanda",
  "Other",
];

const benefits: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: TrendingUp, title: "Market Price Alerts", desc: "Weekly commodity prices across 9 African markets — know when to sell." },
  { icon: Sprout, title: "Seasonal Farming Tips", desc: "Expert advice on planting calendars, soil management, and pest control." },
  { icon: Megaphone, title: "New Program Announcements", desc: "Be the first to know about new financing programs, training, and partnerships." },
  { icon: Trophy, title: "Success Stories", desc: "Real stories from AFU farmers who are growing their businesses." },
  { icon: DollarSign, title: "Investment Opportunities", desc: "Updates on investment rounds, revenue participation notes, and DeFi developments." },
  { icon: Microscope, title: "Innovation & Technology", desc: "AI tools, satellite monitoring, blockchain updates, and platform features." },
];

export default function NewsletterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    interests: [] as string[],
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const toggleInterest = (id: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim()) {
      setStatus("error");
      setMessage("Please enter your name.");
      return;
    }
    if (!form.email || !emailRegex.test(form.email)) {
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
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          country: form.country,
          interests: form.interests,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're subscribed! Look out for the first edition in Q2 2026.");
        setForm({ name: "", email: "", country: "", interests: [] });
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
    <>
      {/* Hero */}
      <section
        className="relative py-24 md:py-32 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 50%, #1e3a3a 100%)" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl"
          style={{ background: "#5DB347" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#5DB347]/20 border border-[#5DB347]/30 text-[#5DB347] px-5 py-2 rounded-full text-sm font-bold mb-8">
            Free Weekly Newsletter
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            AFU Digest{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DB347] to-[#6ABF4B]">
              — Agricultural Intelligence
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Weekly insights on African agriculture, market prices, and farming innovation.
            Stay informed, stay ahead.
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              Every Week
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                What You&apos;ll Get
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-[#5DB347]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3">
                  <item.icon className="w-6 h-6 text-[#5DB347]" />
                </div>
                <h3 className="font-bold text-[#1B2A4A] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="py-20" style={{ background: "#EDF4EF" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1B2A4A] mb-3">Subscribe Now</h2>
            <p className="text-gray-500">Join thousands of African farmers and agribusiness professionals.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Moyo"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
              />
            </div>

            {/* Country */}
            <div>
              <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">Country</label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none bg-white"
              >
                <option value="">Select your country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Interests */}
            <div>
              <label className="text-sm font-medium text-[#1B2A4A] block mb-3">Interests</label>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => {
                  const selected = form.interests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selected
                          ? "bg-[#5DB347] text-white border-[#5DB347]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#5DB347]/50"
                      }`}
                    >
                      {interest.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status messages */}
            {message && (
              <div className={`rounded-xl p-3 text-sm ${
                status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}>
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5DB347]/20"
              style={{ background: "linear-gradient(135deg, #5DB347, #449933)" }}
            >
              {status === "loading" ? "Subscribing..." : "Subscribe to AFU Digest"}
            </button>

            <p className="text-center text-xs text-gray-400">
              Free forever. Unsubscribe anytime. No spam.
            </p>
          </form>
        </div>
      </section>

      {/* Past Editions */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Past Editions</h2>
          <div className="bg-[#EDF4EF] rounded-2xl p-8 border border-[#5DB347]/10">
            <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-4 mx-auto">
              <Newspaper className="w-6 h-6 text-[#5DB347]" />
            </div>
            <p className="text-gray-600 font-medium mb-2">First edition coming Q2 2026</p>
            <p className="text-gray-400 text-sm">
              Subscribe now to be among the first to receive the AFU Digest when it launches.
              You&apos;ll receive market prices, farming tips, and exclusive program announcements.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
