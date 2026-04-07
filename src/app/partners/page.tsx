"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wheat,
  Briefcase,
  Landmark,
  GraduationCap,
  ArrowRight,
  MapPin,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PartnerTab = "unions" | "business" | "governments" | "universities";

interface Partner {
  name: string;
  initials: string;
  color: string;
  logo_url?: string;
  website_url?: string;
  type: string;
  country: string;
  description: string;
  focus: string;
}

const tabs: { key: PartnerTab; label: string; icon: typeof Wheat }[] = [
  { key: "unions", label: "Farming Unions", icon: Wheat },
  { key: "business", label: "Business Networks", icon: Briefcase },
  { key: "governments", label: "Governments", icon: Landmark },
  { key: "universities", label: "Universities", icon: GraduationCap },
];

// ALL fake partners (AfDB, IFAD, WFP, Stanbic, FNB, John Deere, Syngenta, Corteva, Safaricom, Econet) REMOVED.
// These were NOT real partners and listing them was legal exposure.
// Partners are now only loaded from the managed_partners table.
const FALLBACK_PARTNERS: Record<PartnerTab, Partner[]> = {
  unions: [],
  business: [],
  governments: [],
  universities: [],
};

/* Map managed_partners categories to tab keys */
const CATEGORY_TO_TAB: Record<string, PartnerTab> = {
  unions: "unions",
  farming_unions: "unions",
  business: "business",
  business_networks: "business",
  governments: "governments",
  government: "governments",
  universities: "universities",
  university: "universities",
  technology: "business",
  finance: "business",
  trade: "business",
  consulting: "business",
  investment: "business",
  processing: "business",
  logistics: "business",
  insurance: "business",
  banking: "business",
  dfi: "governments",
  ngo: "governments",
  research: "universities",
};

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState<PartnerTab>("business");
  const [partners, setPartners] = useState<Record<PartnerTab, Partner[]>>(FALLBACK_PARTNERS);
  const [chrome, setChrome] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function fetchChrome() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'page_chrome_partners')
          .maybeSingle();
        if (data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (parsed && typeof parsed === 'object') setChrome(parsed);
        }
      } catch { /* keep fallback */ }
    }
    fetchChrome();
  }, []);

  const heroBadge = (chrome?.hero_badge as string) ?? 'Our Network';
  const heroTitle = (chrome?.hero_title as string) ?? 'Our Partners & Network';
  const heroSubtitle = (chrome?.hero_subtitle as string) ?? 'AFU is building a network of partners across Africa — from business networks and technology providers to farming unions, governments, and research institutions. Together, we are creating an ecosystem that de-risks agriculture and unlocks growth.';
  const tabLabels = (chrome?.tab_labels as string[]) ?? ['Farming Unions', 'Business Networks', 'Governments', 'Universities'];
  const emptyTitles = (chrome?.empty_state_titles as string[]) ?? ['Seeking Farming Union Partners', 'Building Business Partnerships', 'Seeking Government Partnerships', 'Seeking University & Research Partners'];
  const emptyBodies = (chrome?.empty_state_bodies as string[]) ?? [
    'We are actively seeking partnerships with national and regional farming unions across Africa. If your organisation represents farmers and would like to explore collaboration with AFU, we would love to hear from you.',
    "We're building partnerships with leading institutions across Africa — banks, agri-businesses, technology providers, and logistics networks. Get in touch to explore working with AFU.",
    'AFU is engaging with ministries of agriculture and development agencies across our operating countries. If you represent a government body interested in digital agriculture transformation, let us connect.',
    'We are building research partnerships with agricultural universities and institutes across Africa. If your institution is interested in collaborative research, student placements, or technology transfer, get in touch.',
  ];
  const ctaTitle = (chrome?.cta_title as string) ?? 'Become an AFU Partner';
  const ctaBody = (chrome?.cta_body as string) ?? 'Join our growing network of farming unions, businesses, government agencies, and research institutions. Together we are building a more prosperous agricultural future for Africa.';
  const ctaPriceText = (chrome?.cta_price_text as string) ?? 'Partner membership is $250/year and gives you access to the AFU deal flow, member network, and co-branded programmes.';

  useEffect(() => {
    async function fetchPartners() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("managed_partners")
          .select("*")
          .eq("is_published", true)
          .order("display_order", { ascending: true });
        if (data && data.length > 0) {
          const grouped: Record<PartnerTab, Partner[]> = {
            unions: [],
            business: [],
            governments: [],
            universities: [],
          };
          data.forEach((p: Record<string, unknown>) => {
            const rawCategory = ((p.category as string) || "business").toLowerCase().replace(/\s+/g, "_");
            const tab = CATEGORY_TO_TAB[rawCategory] || "business";
            grouped[tab].push({
              name: (p.name as string) || (p.company_name as string) || "",
              initials: (p.initials as string) || ((p.name as string) || "").slice(0, 2).toUpperCase(),
              color: (p.brand_color as string) || (p.color as string) || "bg-green-600",
              logo_url: (p.logo_url as string) || undefined,
              website_url: (p.website_url as string) || undefined,
              type: (p.type as string) || (p.partner_type as string) || "",
              country: (p.country as string) || "Pan-African",
              description: (p.description as string) || "",
              focus: (p.focus as string) || (p.specialty as string) || "",
            });
          });
          // Only use DB data if at least one tab has entries
          const hasData = Object.values(grouped).some((arr) => arr.length > 0);
          if (hasData) {
            // For tabs with no DB entries, keep fallback
            const merged = { ...FALLBACK_PARTNERS };
            for (const key of Object.keys(grouped) as PartnerTab[]) {
              if (grouped[key].length > 0) {
                merged[key] = grouped[key];
              }
            }
            setPartners(merged);
          }
        }
      } catch {
        // keep fallback
      }
    }
    fetchPartners();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block bg-[#EBF7E5] text-[#5DB347] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              {heroBadge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-[#6ABF4B] via-[#5DB347] to-[#8CB89C] bg-clip-text text-transparent">
              {heroTitle}
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs + Partner Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-12">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-[#5DB347] to-[#449933] text-white shadow-lg shadow-[#5DB347]/25"
                      : "bg-white/80 backdrop-blur-sm text-[#1B2A4A] hover:bg-[#EBF7E5] border border-gray-200 hover:border-[#5DB347]/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tabLabels[idx] ?? tab.label}
                </button>
              );
            })}
          </div>

          {/* Partner Cards or Coming Soon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {partners[activeTab].length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="w-20 h-20 rounded-3xl bg-[#EBF7E5] flex items-center justify-center mx-auto mb-6">
                    {activeTab === 'unions' && <Wheat className="w-10 h-10 text-[#5DB347]" />}
                    {activeTab === 'business' && <Briefcase className="w-10 h-10 text-[#5DB347]" />}
                    {activeTab === 'governments' && <Landmark className="w-10 h-10 text-[#5DB347]" />}
                    {activeTab === 'universities' && <GraduationCap className="w-10 h-10 text-[#5DB347]" />}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1B2A4A] mb-3">
                    {activeTab === 'unions' && (emptyTitles[0] ?? 'Seeking Farming Union Partners')}
                    {activeTab === 'business' && (emptyTitles[1] ?? 'Building Business Partnerships')}
                    {activeTab === 'governments' && (emptyTitles[2] ?? 'Seeking Government Partnerships')}
                    {activeTab === 'universities' && (emptyTitles[3] ?? 'Seeking University & Research Partners')}
                  </h3>
                  <p className="text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">
                    {activeTab === 'unions' && (emptyBodies[0] ?? '')}
                    {activeTab === 'business' && (emptyBodies[1] ?? '')}
                    {activeTab === 'governments' && (emptyBodies[2] ?? '')}
                    {activeTab === 'universities' && (emptyBodies[3] ?? '')}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-[#5DB347]/20"
                    >
                      Get in Touch <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/apply?tier=partner"
                      className="inline-flex items-center gap-2 border-2 border-[#5DB347] text-[#5DB347] px-8 py-3 rounded-full font-semibold hover:bg-[#EBF7E5] transition-all duration-300"
                    >
                      Apply as Partner
                    </Link>
                  </div>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners[activeTab].map((partner, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-[#5DB347]/5 border-l-4 border-[#5DB347] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  {/* Header with Logo + Name */}
                  <div className="flex items-start gap-4 mb-4">
                    {partner.logo_url ? (
                      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-lg overflow-hidden p-1.5">
                        <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div
                        className={`w-14 h-14 ${partner.color} rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}
                      >
                        {partner.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#1B2A4A] leading-snug">
                        {partner.website_url ? (
                          <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#5DB347] transition-colors">
                            {partner.name}
                          </a>
                        ) : partner.name}
                      </h3>
                      <span className="inline-block text-xs text-gray-400 mt-0.5">
                        {partner.type}
                      </span>
                    </div>
                  </div>

                  {/* Country */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#5DB347]" />
                    <span className="text-xs text-gray-500 font-medium">
                      {partner.country}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {partner.description}
                  </p>

                  {/* Focus */}
                  <div className="flex items-center gap-1.5 bg-[#EBF7E5] rounded-full px-3 py-1.5 w-fit">
                    <Target className="w-3.5 h-3.5 text-[#5DB347]" />
                    <span className="text-xs font-medium text-[#449933]">
                      {partner.focus}
                    </span>
                  </div>
                </div>
              ))}
              </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#1B2A4A] to-[#1B2A4A]/90 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
            {/* Decorative gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5DB347] via-[#6ABF4B] to-[#8CB89C]" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {ctaTitle}
            </h2>
            <p className="text-gray-300 text-lg mb-4 max-w-2xl mx-auto">
              {ctaBody}
            </p>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm">
              {ctaPriceText}
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] hover:shadow-lg hover:shadow-[#5DB347]/25 hover:-translate-y-1 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
            >
              Apply as Partner
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
