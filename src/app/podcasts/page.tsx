'use client';

import Link from 'next/link';
import { Headphones, Bell, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PodcastsPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!email) return;
    const supabase = createClient();
    await supabase.from('site_content').upsert({
      page: 'global', section: 'podcast_subscribers', key: email.toLowerCase().trim(),
      value: JSON.stringify({ subscribed: new Date().toISOString() }),
      content_type: 'text',
    }, { onConflict: 'page,section,key' });
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative py-24 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-[#5DB347]/20 flex items-center justify-center mx-auto mb-6">
            <Headphones className="w-10 h-10 text-[#5DB347]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            AFU Podcast
          </h1>
          <p className="text-lg text-white/70 mb-8 leading-relaxed">
            Stories from the field, market insights, and expert conversations
            about transforming African agriculture. Coming soon.
          </p>

          {subscribed ? (
            <div className="bg-[#5DB347]/20 border border-[#5DB347]/30 rounded-xl px-6 py-4 inline-flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#5DB347]" />
              <span className="text-white font-medium">You will be notified when we launch!</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
              />
              <button
                onClick={handleSubscribe}
                className="px-6 py-3 bg-[#5DB347] hover:bg-[#449933] text-white font-semibold rounded-xl transition-colors"
              >
                Notify Me
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-8 text-center">What to Expect</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Market Updates', desc: 'Daily commodity prices, trade opportunities, and market analysis across Africa.' },
            { title: 'Farmer Stories', desc: 'Real stories from farmers using AFU to grow their operations and income.' },
            { title: 'Expert Interviews', desc: 'Conversations with agronomists, traders, and agricultural innovators.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <h3 className="font-bold text-[#1B2A4A] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#5DB347] font-semibold hover:underline">
            Read our blog in the meantime <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
