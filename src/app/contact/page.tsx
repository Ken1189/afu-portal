"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    subject: "",
    message: "",
  });

  // Pre-fill subject from URL query param (e.g., /contact?subject=investor)
  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam) {
      setFormData((prev) => ({ ...prev, subject: subjectParam }));
    }
  }, [searchParams]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.subject) {
      setError("Please select a subject.");
      return;
    }
    if (!formData.message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      // Try inserting into contact_submissions table first.
      // If that table doesn't exist, fall back to applications table with type='contact'.
      const { error: insertError } = await supabase
        .from("contact_submissions")
        .insert({
          full_name: formData.name.trim(),
          email: formData.email.trim(),
          organization: formData.organization.trim() || null,
          subject: formData.subject,
          message: formData.message.trim(),
        });

      if (insertError) {
        // If contact_submissions table doesn't exist, try applications table
        if (
          insertError.message?.includes("does not exist") ||
          insertError.code === "42P01"
        ) {
          const { error: fallbackError } = await supabase
            .from("membership_applications")
            .insert({
              full_name: formData.name.trim(),
              email: formData.email.trim(),
              status: "pending",
              membership_tier: "contact",
              country: formData.subject,
              notes: `[Contact Form] Subject: ${formData.subject}\nOrganization: ${formData.organization || "N/A"}\n\n${formData.message.trim()}`,
            });

          if (fallbackError) {
            throw fallbackError;
          }
        } else {
          throw insertError;
        }
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Contact form submission error:", err);
      setError(
        "Something went wrong submitting your message. Please try again or email us directly at info@africanfarmunion.com."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Have questions about AFU? Want to explore partnership opportunities? Get in touch.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#EBF7E5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1B2A4A] mb-6">Get in Touch</h2>

              {/* HQ Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-[#5DB347]/5 border border-white/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5DB347] to-[#449933] rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A]">Headquarters</h3>
                    <p className="text-gray-500 text-sm">Gaborone, Botswana</p>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-[#5DB347]/5 border border-white/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5DB347] to-[#449933] rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A]">Email</h3>
                    <p className="text-gray-500 text-sm">info@africanfarmunion.com</p>
                  </div>
                </div>
              </div>

              {/* Operations Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-[#5DB347]/5 border border-white/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5DB347] to-[#449933] rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A]">Operations</h3>
                    <p className="text-gray-500 text-sm">Botswana, Zimbabwe, Tanzania</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 text-center shadow-lg shadow-[#5DB347]/5 border border-white/60">
                  <svg className="w-16 h-16 text-[#5DB347] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-[#1B2A4A] mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for reaching out. Our team will get back to you within 48 hours.</p>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-lg shadow-[#5DB347]/5 border border-white/60">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Organization</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Subject *</label>
                        <select
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        >
                          <option value="">Select a subject</option>
                          <option value="investor">Investor Inquiry / Request Investor Pack</option>
                          <option value="membership">Membership Inquiry</option>
                          <option value="financing">Financing</option>
                          <option value="partnership">Partnership</option>
                          <option value="sponsorship">Sponsor a Farmer</option>
                          <option value="training">Training</option>
                          <option value="media">Media / Press</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Message *</label>
                      <textarea
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] resize-none transition-shadow"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-[#5DB347] to-[#449933] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#5DB347]/20"
                    >
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
