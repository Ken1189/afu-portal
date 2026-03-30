'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
}

const FALLBACK_FAQ: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What is the African Farming Union?',
    answer: 'The African Farming Union (AFU) is an integrated agricultural development platform providing financing, inputs, insurance, processing, guaranteed offtake, and training to smallholder and commercial farmers across Africa.',
    category: 'General',
    display_order: 1,
  },
  {
    id: 'faq-2',
    question: 'Which countries does AFU operate in?',
    answer: 'AFU currently operates across 9 African countries including Zimbabwe, Botswana, Tanzania, Kenya, Nigeria, Ghana, Uganda, Zambia, and Mozambique, with expansion planned to 20 countries.',
    category: 'General',
    display_order: 2,
  },
  {
    id: 'faq-3',
    question: 'How do I join AFU?',
    answer: 'You can apply for membership through our website by clicking "Join Our Farming Family" on the homepage. You will need to provide details about your farm, crops, and location. Our team will review your application and contact you.',
    category: 'Membership',
    display_order: 3,
  },
  {
    id: 'faq-4',
    question: 'What financing options are available?',
    answer: 'AFU offers working capital loans, crop financing, equipment leasing, invoice finance, and trade finance. Financing is tailored to your crop cycle and repayment comes from the sale of your harvest through our guaranteed offtake programme.',
    category: 'Finance',
    display_order: 4,
  },
  {
    id: 'faq-5',
    question: 'How does guaranteed offtake work?',
    answer: 'AFU arranges buyers for your crops before you plant. You receive a guaranteed price and market for your harvest, which removes the uncertainty of selling and allows you to focus on growing.',
    category: 'Services',
    display_order: 5,
  },
  {
    id: 'faq-6',
    question: 'Is crop insurance included?',
    answer: 'Yes, AFU provides crop and asset insurance through our Lloyd\'s of London coverholder arrangement. Insurance premiums can be built into your financing package so there is no upfront cost.',
    category: 'Insurance',
    display_order: 6,
  },
  {
    id: 'faq-7',
    question: 'What payment methods does AFU support?',
    answer: 'AFU supports M-Pesa, EcoCash, MTN MoMo, Airtel Money, Orange Money, bank transfers, and card payments depending on your country. We meet farmers where they are.',
    category: 'Payments',
    display_order: 7,
  },
  {
    id: 'faq-8',
    question: 'How do I become an AFU ambassador?',
    answer: 'Experienced farmers with a track record of success can apply to become AFU ambassadors. Visit our Ambassadors page and click "Become an Ambassador" to start the application process.',
    category: 'General',
    display_order: 8,
  },
];

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(FALLBACK_FAQ);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('faq_items')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true });
        if (data && data.length > 0) {
          setFaqs(
            data.map((f: Record<string, unknown>) => ({
              id: f.id as string,
              question: (f.question as string) || '',
              answer: (f.answer as string) || '',
              category: (f.category as string) || null,
              display_order: (f.display_order as number) || 0,
            }))
          );
        }
      } catch {
        // keep fallback
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        className="relative py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Help Centre
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Everything you need to know about joining and using the African Farming Union platform.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#5DB347] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading questions...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 pr-4">
                    {faq.category && (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#5DB347]/10 text-[#5DB347] mt-0.5">
                        {faq.category}
                      </span>
                    )}
                    <span className="text-[#1B2A4A] font-semibold text-sm leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  {expandedId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-[#5DB347] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {expandedId === faq.id && (
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-gray-600 text-sm leading-relaxed pl-0">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <MessageCircle className="w-10 h-10 text-[#5DB347] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Our team is here to help. Reach out and we will get back to you within 24 hours.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-[#5DB347]/30 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
