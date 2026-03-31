"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const FALLBACK_CONTACT = {
  primary_email: "peterw@africanfarmingunion.org",
  support_email: "devonk@africanfarmingunion.org",
  phone: "",
  hq_address: "",
  hq_city: "Gaborone",
  hq_country: "Botswana",
  operations: "Botswana, Zimbabwe, Tanzania",
};

export default function ContactPage() {
  const searchParams = useSearchParams();
  const [contactInfo, setContactInfo] = useState(FALLBACK_CONTACT);

  // Fetch contact info from site_config
  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'contact_info')
          .single();
        if (data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (parsed && typeof parsed === 'object') {
            setContactInfo({ ...FALLBACK_CONTACT, ...parsed });
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchContactInfo();
  }, []);

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
              requested_tier: "new_enterprise",
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

      // Send email notification to Peter
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'peterw@africanfarmingunion.org',
          subject: `[AFU Contact] ${formData.subject} — from ${formData.name.trim()}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Contact Form Submission</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Name:</strong> ${formData.name.trim()}</p><p><strong>Email:</strong> ${formData.email.trim()}</p><p><strong>Organization:</strong> ${formData.organization.trim() || 'N/A'}</p><p><strong>Subject:</strong> ${formData.subject}</p><hr style="border:1px solid #eee"><p><strong>Message:</strong></p><p>${formData.message.trim().replace(/\n/g, '<br>')}</p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
        }),
      }).catch(() => {});

      // Send auto-reply to the person who submitted
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.email.trim(),
          subject: 'Thank you for contacting the African Farming Union',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:30px;text-align:center"><h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1><p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p></div><div style="padding:30px;background:#f8faf6"><h2 style="color:#1B2A4A;margin-top:0">Thank you, ${formData.name.trim().split(' ')[0]}!</h2><p style="color:#333;line-height:1.6">We've received your message and a member of our team will get back to you within <strong>24-48 hours</strong>.</p><div style="background:white;border-left:4px solid #5DB347;padding:15px;margin:20px 0;border-radius:4px"><p style="margin:0;color:#555;font-size:14px"><strong>Your message:</strong></p><p style="margin:8px 0 0;color:#777;font-size:14px">${formData.message.trim().substring(0, 200)}${formData.message.trim().length > 200 ? '...' : ''}</p></div><p style="color:#333;line-height:1.6">In the meantime, you can explore our platform:</p><ul style="color:#555;line-height:2"><li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li><li><a href="https://africanfarmingunion.org/memberships" style="color:#5DB347">Membership Tiers</a></li><li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Operate In</a></li></ul><p style="color:#333">Best regards,<br><strong>The AFU Team</strong></p></div><div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org | 20 African Countries</div></div>`,
        }),
      }).catch(() => {}); // Fire and forget

      setSubmitted(true);
    } catch (err) {
      console.error("Contact form submission error:", err);
      setError(
        `Something went wrong submitting your message. Please try again or email us directly at ${contactInfo.primary_email}.`
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
                    <p className="text-gray-500 text-sm">{contactInfo.hq_city}, {contactInfo.hq_country}</p>
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
                    <p className="text-gray-500 text-sm">{contactInfo.primary_email}</p>
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
                    <p className="text-gray-500 text-sm">{contactInfo.operations}</p>
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
                          <option value="afu_fresh">AFU Fresh — Farm to Fork Marketplace</option>
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
