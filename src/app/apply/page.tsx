"use client";

import { useState } from "react";
import Link from "next/link";
import { useApplications } from "@/lib/supabase/use-applications";

type Tier = "smallholder" | "commercial" | "enterprise" | "partner";

const tiers = {
  smallholder: { name: "Tier A: Smallholder", price: "$50/year", desc: "For farms under 10 hectares" },
  commercial: { name: "Tier B: Commercial", price: "$500/year", desc: "For farms 10-500+ hectares" },
  enterprise: { name: "Tier C: Enterprise", price: "Custom pricing", desc: "For large-scale projects" },
  partner: { name: "Partner", price: "$250/year", desc: "Tech, suppliers, offtakers, colleges" },
};

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [submitted, setSubmitted] = useState(false);
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
      requested_tier: (selectedTier === 'smallholder' ? 'smallholder' :
                       selectedTier === 'commercial' ? 'farmer_grower' :
                       selectedTier === 'enterprise' ? 'commercial' : 'new_enterprise') as any,
    });

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <>
        <section className="bg-navy text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">Application Submitted</h1>
          </div>
        </section>
        <section className="py-16 bg-[#EBF7E5]/30">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg shadow-[#5DB347]/5 border border-white/60">
              <svg className="w-20 h-20 text-[#5DB347] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl font-bold text-[#1B2A4A] mb-4">Thank You!</h2>
              <p className="text-gray-600 mb-2">
                Your membership application for <strong>{selectedTier && tiers[selectedTier].name}</strong> has been received.
              </p>
              <p className="text-gray-500 mb-8">
                Our team will review your application and get back to you within 3-5 business days.
              </p>
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
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">Become a Member</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Join the AFU ecosystem. Select your membership tier and complete your application.
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
                  {s === 1 ? "Select Tier" : "Your Details"}
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
                <h2 className="text-2xl font-bold text-[#1B2A4A]">Your Details</h2>
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
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">First Name *</label>
                    <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Last Name *</label>
                    <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Email *</label>
                    <input type="email" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Phone</label>
                    <input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Country *</label>
                    <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}>
                      <option value="">Select country</option>
                      <option value="BW">Botswana</option>
                      <option value="KE">Kenya</option>
                      <option value="MZ">Mozambique</option>
                      <option value="NG">Nigeria</option>
                      <option value="SL">Sierra Leone</option>
                      <option value="ZA">South Africa</option>
                      <option value="TZ">Tanzania</option>
                      <option value="UG">Uganda</option>
                      <option value="ZM">Zambia</option>
                      <option value="ZW">Zimbabwe</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Organization / Farm Name</label>
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
                      <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Main Crops</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-shadow" placeholder="e.g., Blueberries, Cassava, Sesame" value={formData.crops} onChange={(e) => setFormData({ ...formData, crops: e.target.value })} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Tell us about your operation *</label>
                  <textarea required rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] resize-none transition-shadow" placeholder={selectedTier === "partner" ? "Describe your organization and how you'd like to partner with AFU..." : "Describe your farming operation, current challenges, and what you're looking for from AFU..."} value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="px-8 py-3 border border-gray-200 rounded-xl font-semibold text-[#1B2A4A] hover:bg-gray-50 transition-all duration-300">
                    Back
                  </button>
                  <button type="submit" className="bg-gradient-to-r from-[#5DB347] to-[#449933] hover:scale-105 text-white px-10 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#5DB347]/20">
                    Submit Application
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
