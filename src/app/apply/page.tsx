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
            <h1 className="text-4xl md:text-5xl font-bold">Application Submitted</h1>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-teal-light rounded-2xl p-10">
              <svg className="w-20 h-20 text-teal mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl font-bold text-navy mb-4">Thank You!</h2>
              <p className="text-gray-600 mb-2">
                Your membership application for <strong>{selectedTier && tiers[selectedTier].name}</strong> has been received.
              </p>
              <p className="text-gray-500 mb-8">
                Our team will review your application and get back to you within 3-5 business days.
              </p>
              <Link href="/" className="inline-block bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Become a Member</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Join the AFU ecosystem. Select your membership tier and complete your application.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? "bg-teal text-white" : "bg-gray-200 text-gray-400"}`}>
                  {s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? "text-navy" : "text-gray-400"}`}>
                  {s === 1 ? "Select Tier" : "Your Details"}
                </span>
                {s < 2 && <div className={`w-16 h-0.5 ${step > 1 ? "bg-teal" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Select Tier */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-navy mb-8 text-center">Choose Your Membership Tier</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Object.entries(tiers) as [Tier, typeof tiers.smallholder][]).map(([key, tier]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    className={`text-left rounded-2xl p-6 border-2 transition-all ${
                      selectedTier === key
                        ? "border-teal bg-teal-light"
                        : "border-gray-200 hover:border-teal/40"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-navy text-lg">{tier.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{tier.desc}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-teal text-lg">{tier.price}</div>
                      </div>
                    </div>
                    {selectedTier === key && (
                      <div className="mt-3 flex items-center gap-1 text-teal text-sm font-medium">
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
                  className="bg-teal hover:bg-teal-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-10 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Application Form */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-navy">Your Details</h2>
                <button onClick={() => setStep(1)} className="text-teal hover:text-teal-dark text-sm font-medium">
                  ← Change Tier
                </button>
              </div>

              {selectedTier && (
                <div className="bg-teal-light rounded-xl p-4 mb-8 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-navy">{tiers[selectedTier].name}</span>
                    <span className="text-gray-500 text-sm ml-2">{tiers[selectedTier].desc}</span>
                  </div>
                  <span className="font-bold text-teal">{tiers[selectedTier].price}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">First Name *</label>
                    <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Last Name *</label>
                    <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Email *</label>
                    <input type="email" required className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Phone</label>
                    <input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Country *</label>
                    <select required className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}>
                      <option value="">Select country</option>
                      <option value="BW">Botswana</option>
                      <option value="ZW">Zimbabwe</option>
                      <option value="TZ">Tanzania</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Organization / Farm Name</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} />
                  </div>
                </div>

                {selectedTier !== "partner" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">Farm Size (hectares)</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal" placeholder="e.g., 5, 50, 500" value={formData.farmSize} onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">Main Crops</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal" placeholder="e.g., Blueberries, Cassava, Sesame" value={formData.crops} onChange={(e) => setFormData({ ...formData, crops: e.target.value })} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Tell us about your operation *</label>
                  <textarea required rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal resize-none" placeholder={selectedTier === "partner" ? "Describe your organization and how you'd like to partner with AFU..." : "Describe your farming operation, current challenges, and what you're looking for from AFU..."} value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="px-8 py-3 border border-gray-200 rounded-lg font-semibold text-navy hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button type="submit" className="bg-teal hover:bg-teal-dark text-white px-10 py-3 rounded-lg font-semibold transition-colors">
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
