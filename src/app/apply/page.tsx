"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApplications } from "@/lib/supabase/use-applications";
import { createClient } from "@/lib/supabase/client";

type Tier = "free" | "smallholder" | "commercial" | "enterprise" | "partner";

const FALLBACK_TIERS: Record<Tier, { name: string; price: string; priceNote: string; desc: string }> = {
  free: { name: "Free", price: "Free", priceNote: "forever", desc: "Explore the platform — no payment required" },
  smallholder: { name: "Smallholder", price: "$48/year", priceNote: "or $5/mo", desc: "For farms under 10 hectares" },
  commercial: { name: "Commercial", price: "$240/year", priceNote: "or $25/mo", desc: "For farms 10-500 hectares" },
  enterprise: { name: "Enterprise", price: "$950/year", priceNote: "or $99/mo", desc: "For large-scale operations + cooperatives" },
  partner: { name: "Partner", price: "$2,400/year", priceNote: "or $250/mo", desc: "Suppliers, offtakers, investors" },
};

export default function ApplyPage() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    organization: "",
    farmSize: "",
    crops: "",
    experience: "",
    about: "",
  });

  const { submitApplication } = useApplications();
  const [submitting, setSubmitting] = useState(false);
  const [tiers, setTiers] = useState<Record<Tier, { name: string; price: string; priceNote: string; desc: string }>>(FALLBACK_TIERS);

  // Fetch tier pricing from site_config
  useEffect(() => {
    async function fetchTiers() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'membership_tiers')
          .single();
        if (data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Map the array format to the record format used on this page
            const mapped: Record<string, { name: string; price: string; priceNote: string; desc: string }> = {};
            for (const t of parsed) {
              const slug = (t.slug || t.name?.toLowerCase().replace(/\s+/g, '-')) as string;
              const tierKey = slug === 'smallholder' ? 'smallholder'
                : slug === 'commercial' || slug === 'bronze' ? 'commercial'
                : slug === 'enterprise' || slug === 'gold' || slug === 'platinum' ? 'enterprise'
                : 'partner';
              if (!mapped[tierKey]) {
                mapped[tierKey] = {
                  name: t.name || FALLBACK_TIERS[tierKey as Tier].name,
                  price: t.priceAnnual ? `${t.priceAnnual}/year` : FALLBACK_TIERS[tierKey as Tier].price,
                  priceNote: t.priceMonthly ? `or ${t.priceMonthly}/mo` : FALLBACK_TIERS[tierKey as Tier].priceNote,
                  desc: t.audience || FALLBACK_TIERS[tierKey as Tier].desc,
                };
              }
            }
            // Only apply if we got all four keys
            if (mapped.smallholder && mapped.commercial && mapped.enterprise && mapped.partner) {
              setTiers(mapped as Record<Tier, { name: string; price: string; priceNote: string; desc: string }>);
            }
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchTiers();
  }, []);

  // Auto-select tier from URL param
  const tierParam = searchParams.get("tier");
  useEffect(() => {
    if (tierParam && tierParam in FALLBACK_TIERS) {
      setSelectedTier(tierParam as Tier);
      // Skip step 1 if free tier — go straight to form
      if (tierParam === 'free') setStep(2);
    }
  }, [tierParam]);

  // Capture referral code from URL
  useEffect(() => {
    if (refCode) {
      setReferredBy(refCode);
      // Store in sessionStorage so it persists through the form
      sessionStorage.setItem("afu_referral_code", refCode);
    } else {
      const stored = sessionStorage.getItem("afu_referral_code");
      if (stored) setReferredBy(stored);
    }
  }, [refCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Submit to Supabase
    const { error } = await submitApplication({
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone || undefined,
      country: formData.country,
      farm_name: formData.organization || undefined,
      farm_size_ha: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
      primary_crops: formData.crops ? formData.crops.split(',').map((c: string) => c.trim()) : undefined,
      requested_tier: (selectedTier || 'free') as any,
    });

    setSubmitting(false);
    if (!error) {
      // Register referral if there's a referral code
      const storedRef = referredBy || sessionStorage.getItem("afu_referral_code");
      if (storedRef) {
        fetch("/api/ambassadors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register-referral",
            referral_code: storedRef,
          }),
        }).catch(() => {}); // Fire and forget
        sessionStorage.removeItem("afu_referral_code");
      }

      // Send email notifications (fire and forget)
      fetch("/api/apply/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          tier: selectedTier ? tiers[selectedTier].name : selectedTier,
          country: formData.country,
          phone: formData.phone,
          organization: formData.organization,
          farmSize: formData.farmSize,
          crops: formData.crops,
          about: formData.about,
        }),
      }).catch(() => {});

      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <>
        <section className="bg-navy text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">You&apos;re In!</h1>
          </div>
        </section>
        <section className="py-16 bg-[#EBF7E5]/30">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg shadow-[#5DB347]/5 border border-white/60">
              <svg className="w-20 h-20 text-[#5DB347] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl font-bold text-[#1B2A4A] mb-4">Welcome to the Family!</h2>
              {selectedTier === 'free' ? (
                <>
                  <p className="text-gray-600 mb-2">
                    Your <strong>Free</strong> membership is being set up. You can start exploring the platform right away.
                  </p>
                  <p className="text-gray-500 mb-8">
                    Upgrade anytime to unlock full access to financing, insurance, marketplace discounts, and more.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">
                    Your <strong>{selectedTier && tiers[selectedTier].name}</strong> application has been received — we&apos;re excited to learn more about you and your farm.
                  </p>
                  <p className="text-gray-500 mb-8">
                    A real person from our team will be in touch within 3-5 business days. We can&apos;t wait to start this journey with you.
                  </p>
                </>
              )}
              <Link href="/" className="inline-block bg-gradient-to-r from-[#5DB347] to-[#449933] hover:scale-105 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#5DB347]/20">
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {referredBy && (
        <div className="bg-[#5DB347] text-white text-center py-2.5 text-sm">
          🎉 You were referred by a member! You&apos;ll both earn rewards when you join.
        </div>
      )}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">Join Our Farming Family</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            We&apos;re farmers too. We understand the challenges, the risks, the rewards. Tell us about you and your vision — we&apos;re here to help you grow.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#EBF7E5]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s ? "bg-gradient-to-br from-[#5DB347] to-[#449933] text-white shadow-md shadow-[#5DB347]/30" : "bg-gray-200 text-gray-400"}`}>
                  {s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? "text-[#1B2A4A]" : "text-gray-400"}`}>
                  {s === 1 ? "Select Tier" : "Tell Us Your Story"}
                </span>
                {s < 2 && <div className={`w-16 h-0.5 transition-colors ${step > 1 ? "bg-[#5DB347]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Select Tier */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1B2A4A] mb-8 text-center">Choose Your Membership Tier</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Object.entries(tiers) as [Tier, typeof tiers.smallholder][]).map(([key, tier]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    className={`text-left rounded-3xl p-6 border-2 bg-white/80 backdrop-blur-sm shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${
                      selectedTier === key
                        ? "border-[#5DB347] bg-[#EBF7E5]/80 scale-[1.02] shadow-[#5DB347]/20"
                        : "border-gray-200/60 hover:border-[#5DB347]/40"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-[#1B2A4A] text-lg">{tier.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{tier.desc}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#5DB347] text-lg">{tier.price}</div>
                        <div className="text-xs text-gray-400">{tier.priceNote}</div>
                      </div>
                    </div>
                    {selectedTier === key && (
                      <div className="mt-3 flex items-center gap-1 text-[#5DB347] text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => selectedTier && setStep(2)}
                  disabled={!selectedTier}
                  className="bg-gradient-to-r from-[#5DB347] to-[#449933] hover:scale-105 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 text-white px-10 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#5DB347]/20"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Application Form */}
          {step === 2 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-lg shadow-[#5DB347]/5 border border-white/60">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#1B2A4A]">Tell Us About You</h2>
                <button onClick={() => setStep(1)} className="text-[#5DB347] hover:text-[#449933] text-sm font-medium transition-colors">
                  ← Change Tier
                </button>
              </div>

              {selectedTier && (
                <div className="bg-[#EBF7E5] rounded-xl p-4 mb-8 flex justify-between items-center border-l-4 border-[#5DB347]">
                  <div>
                    <span className="font-semibold text-[#1B2A4A]">{tiers[selectedTier].name}</span>
                    <span className="text-gray-500 text-sm ml-2">{tiers[selectedTier].desc}</span>
                  </div>
                  <span className="font-bold text-[#5DB347]">{tiers[selectedTier].price}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Your First Name *</label>
                    <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Your Last Name *</label>
                    <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Email *</label>
                    <input type="email" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Phone Number *</label>
                    <input type="tel" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" placeholder="+263 77 123 4567" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Country *</label>
                    <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}>
                      <option value="">Select country</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Your Farm or Organization Name</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} />
                  </div>
                </div>

                {selectedTier !== "partner" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Farm Size (hectares)</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" placeholder="e.g., 5, 50, 500" value={formData.farmSize} onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1B2A4A] mb-2">What Do You Grow?</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" placeholder="e.g., Blueberries, Cassava, Sesame" value={formData.crops} onChange={(e) => setFormData({ ...formData, crops: e.target.value })} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-2">What&apos;s your vision? Tell us about your farm and your dreams. *</label>
                  <textarea required rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] resize-none transition-shadow" placeholder={selectedTier === "partner" ? "Tell us about your organization and how we can work together..." : "Share your farming story — what you grow, the challenges you face, and where you want to take your farm..."} value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} />
                </div>

                {/* Consent checkboxes */}
                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" required className="mt-1 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                    <span className="text-sm text-gray-600">
                      I agree to the <a href="/legal/terms" target="_blank" className="text-[#5DB347] underline">Terms &amp; Conditions</a> and <a href="/legal/privacy" target="_blank" className="text-[#5DB347] underline">Privacy Policy</a> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" required className="mt-1 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                    <span className="text-sm text-gray-600">
                      I consent to receive emails, SMS, and notifications from AFU about my account and services <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                    <span className="text-sm text-gray-600">
                      I&apos;d like to receive marketing updates, farming tips, and special offers from AFU
                    </span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="px-8 py-3 border border-gray-200 rounded-xl font-semibold text-[#1B2A4A] hover:bg-gray-50 transition-all duration-300">
                    Back
                  </button>
                  <button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#5DB347] to-[#449933] hover:scale-105 text-white px-10 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#5DB347]/20 disabled:opacity-50">
                    {submitting ? 'Sending...' : "Let\u2019s Grow Together"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
