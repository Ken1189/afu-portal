'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  MessageSquare,
  Mail,
  Share2,
  BarChart3,
  Palette,
  HelpCircle,
  Mic,
  MessageCircle,
} from 'lucide-react';

/* ─── Copy Button Component ─── */

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
      style={{
        backgroundColor: copied ? 'rgba(93,179,71,0.15)' : 'rgba(27,42,74,0.08)',
        color: copied ? '#5DB347' : '#1B2A4A',
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

/* ─── Content Card Component ─── */

function ContentCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-sm" style={{ color: '#1B2A4A' }}>{title}</h4>
        <CopyButton text={content} />
      </div>
      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

/* ─── Section Wrapper ─── */

function Section({
  icon: Icon,
  title,
  id,
  children,
}: {
  icon: React.ElementType;
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="bg-white rounded-3xl p-8 md:p-10 shadow-lg shadow-[#5DB347]/5 border border-[#EBF7E5]">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(93,179,71,0.1)' }}
        >
          <Icon className="w-5 h-5" style={{ color: '#5DB347' }} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Main Page ─── */

export default function AmbassadorMarketingPage() {
  return (
    <>
      {/* --- HERO --- */}
      <section
        className="relative text-white py-20 overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, rgba(93,179,71,0.15) 100%)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: '#5DB347' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ambassador{' '}
            <span className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
              Marketing Kit
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Ready-to-use pitches, social media posts, email templates, and talking points. Copy, customise, and share to grow your network and earn commissions.
          </p>
        </div>
      </section>

      {/* --- CONTENT --- */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* 1. Elevator Pitch */}
          <Section icon={Mic} title="Elevator Pitches" id="pitches">
            <div className="space-y-4">
              <ContentCard
                title="30-Second Pitch"
                content="The African Farming Union is a one-stop platform that gives African farmers access to financing, insurance, inputs, guaranteed markets, and training. We serve over 19,000 farmers across 20 countries, helping them grow profitable, sustainable operations. Whether you're a farmer, supplier, or investor, AFU connects you to Africa's $50 billion agricultural opportunity."
              />
              <ContentCard
                title="60-Second Pitch"
                content={`African agriculture is a $50 billion market, but most smallholder farmers lack access to basic services like finance, insurance, and reliable markets. The African Farming Union solves this.

AFU is an integrated platform that provides everything a farmer needs: crop financing at affordable rates, free crop insurance, agricultural inputs at wholesale prices, guaranteed offtake agreements so they always have a buyer, access to processing hubs, and professional training programmes.

We already serve 19,000+ farmers managing over 1 million hectares across 20 African countries. For suppliers, it's access to a massive, aggregated customer base. For investors, it's a diversified, de-risked agricultural portfolio with real impact and strong returns. I'd love to tell you more about how you can get involved.`}
              />
              <ContentCard
                title="2-Minute Pitch"
                content={`Let me share something that's transforming African agriculture. There are over 30 million smallholder farmers across Africa who struggle with the same problems: they can't get loans, they can't afford insurance, inputs are too expensive, and they have no guaranteed market for their produce. The result? Low yields, high risk, and persistent poverty.

The African Farming Union was built to change that. AFU is an integrated agricultural platform that bundles everything a farmer needs into one membership. Financing to buy seeds and equipment. Crop and asset insurance so one bad season doesn't wipe them out. Inputs at wholesale prices through our bulk purchasing power. Guaranteed offtake agreements so they know exactly who's buying their harvest and at what price. Access to processing hubs to add value to their produce. And professional training to help them adopt modern farming techniques.

Today, AFU serves over 19,000 farmers managing more than 1 million hectares across 20 countries in Africa. The results speak for themselves: farmers who join AFU see significant increases in yield and income because they finally have the tools and support they need.

For suppliers and equipment companies, AFU offers access to a massive, aggregated customer base with predictable demand and payment security. For investors, this is a $50 billion market opportunity with a diversified, de-risked portfolio across multiple countries and crop types. And because AFU integrates insurance and guaranteed offtake into the model, the risk profile is fundamentally different from traditional agricultural investment in Africa.

I'm an AFU Ambassador, and I can connect you directly with the team. Whether you're a farmer looking for better opportunities, a supplier wanting to reach more customers, or an investor seeking impact with returns, I'd love to help you explore what AFU can offer. Can I send you more information?`}
              />
            </div>
          </Section>

          {/* 2. Key Statistics */}
          <Section icon={BarChart3} title="Key Statistics" id="stats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { value: '19,000+', label: 'Farmers Served' },
                { value: '20', label: 'Countries' },
                { value: '$50B', label: 'Market Size' },
                { value: '1M+', label: 'Hectares Managed' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-xl border border-[#EBF7E5] bg-white"
                >
                  <div className="text-2xl md:text-3xl font-bold" style={{ color: '#5DB347' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <CopyButton
                text="AFU Key Stats: 19,000+ farmers served | 20 countries | $50B market opportunity | 1M+ hectares managed | Integrated platform: financing, insurance, inputs, offtake, processing, training"
                label="Copy all stats"
              />
            </div>
          </Section>

          {/* 3. Social Media Templates */}
          <Section icon={Share2} title="Social Media Templates" id="social">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#1B2A4A' }}>LinkedIn</h3>
              <ContentCard
                title="LinkedIn Post 1"
                content={`African agriculture is a $50 billion opportunity, and most of the world is missing it.

The African Farming Union is changing the game for 19,000+ farmers across 20 countries by providing financing, insurance, inputs, guaranteed markets, and training in one integrated platform.

Whether you're in agriculture, impact investing, or agri-business supply chains, this is worth knowing about.

Learn more: [Your Referral Link]

#AfricanAgriculture #AgriTech #ImpactInvesting #FoodSecurity #AFU`}
              />
              <ContentCard
                title="LinkedIn Post 2"
                content={`Did you know that smallholder farmers produce 70% of Africa's food but have almost no access to formal finance or insurance?

The African Farming Union is fixing this by integrating everything a farmer needs into one platform. The result? Higher yields, lower risk, and better incomes for thousands of farming families.

I'm proud to be an AFU Ambassador. If you know anyone in agriculture, supply chains, or impact investing, I'd love to connect them with this opportunity.

[Your Referral Link]

#Agriculture #Africa #SmallholderFarmers #SustainableDevelopment`}
              />

              <h3 className="text-lg font-semibold mt-6" style={{ color: '#1B2A4A' }}>Twitter / X</h3>
              <ContentCard
                title="Tweet 1"
                content={`Africa's $50B agriculture market is largely untapped. @AFU_Official is changing that with 19,000+ farmers across 20 countries. Financing, insurance, inputs, markets, all in one platform. [Your Referral Link] #AfricanAgriculture #AgriTech`}
              />
              <ContentCard
                title="Tweet 2"
                content={`Smallholder farmers produce 70% of Africa's food but lack basic financial services. The African Farming Union provides financing, insurance, inputs & guaranteed markets in one platform. Learn more: [Your Referral Link] #FoodSecurity #ImpactInvesting`}
              />

              <h3 className="text-lg font-semibold mt-6" style={{ color: '#1B2A4A' }}>WhatsApp Status / Facebook</h3>
              <ContentCard
                title="WhatsApp Status"
                content={`I'm helping African farmers access financing, insurance, and guaranteed markets through the African Farming Union. Over 19,000 farmers across 20 countries are already benefiting. If you're a farmer, supplier, or investor interested in African agriculture, message me or visit: [Your Referral Link]`}
              />
              <ContentCard
                title="Facebook Post"
                content={`Excited to share something I'm passionate about! The African Farming Union (AFU) is an amazing platform that helps African farmers access everything they need to succeed: financing, insurance, inputs at wholesale prices, guaranteed markets for their produce, and professional training.

They already serve 19,000+ farmers across 20 countries, and the impact on farming communities is incredible.

I'm an AFU Ambassador, so if you or anyone you know is involved in farming, agricultural supplies, or investing in Africa, I'd love to chat about how AFU can help. Drop me a message or check it out here: [Your Referral Link]`}
              />
            </div>
          </Section>

          {/* 4. Email Templates */}
          <Section icon={Mail} title="Email Templates" id="emails">
            <div className="space-y-4">
              <ContentCard
                title="Email to a Farmer"
                content={`Subject: A platform that could transform your farming operation

Dear [Name],

I hope this message finds you well. I wanted to introduce you to the African Farming Union (AFU), an integrated agricultural platform that is helping over 19,000 farmers across 20 African countries access the tools they need to grow profitably.

As an AFU member, you would gain access to:
- Affordable crop financing
- Free crop and asset insurance
- Agricultural inputs at wholesale prices
- Guaranteed buyers for your produce through offtake agreements
- Access to processing hubs
- Professional farmer training programmes

AFU is designed specifically for African farmers, and membership gives you everything you need in one place. I've seen first-hand how it's changing lives for farming families.

If you'd like to learn more, you can visit the platform here: [Your Referral Link]

I'm happy to answer any questions you might have.

Best regards,
[Your Name]
AFU Ambassador`}
              />
              <ContentCard
                title="Email to a Supplier"
                content={`Subject: Reach 19,000+ African farmers through one platform

Dear [Name],

I'm reaching out because I believe your products could reach a significantly larger market through the African Farming Union (AFU).

AFU is an integrated agricultural platform serving 19,000+ farmers managing over 1 million hectares across 20 African countries. As a supplier partner, you would benefit from:
- Access to a large, aggregated customer base
- Predictable demand through structured procurement
- Payment security through AFU's integrated finance system
- Streamlined logistics via AFU's processing hub network

AFU is actively seeking suppliers of seeds, fertilisers, equipment, and other agricultural inputs. If this interests you, I would be happy to facilitate an introduction with the AFU partnerships team.

You can learn more here: [Your Referral Link]

Best regards,
[Your Name]
AFU Ambassador`}
              />
              <ContentCard
                title="Email to an Investor"
                content={`Subject: A $50B opportunity in African agriculture

Dear [Name],

I wanted to bring to your attention an investment opportunity in African agriculture that combines strong commercial returns with measurable social impact.

The African Farming Union (AFU) is an integrated agricultural platform operating across 20 African countries, serving 19,000+ farmers managing over 1 million hectares. The platform provides financing, crop insurance, input supply, guaranteed offtake, processing, and farmer training.

What makes AFU distinctive from an investment perspective:
- Diversified exposure across multiple countries and crop types
- Integrated insurance and guaranteed offtake reduce default risk
- $50 billion addressable market with significant growth potential
- Strong impact credentials aligned with SDGs 1, 2, and 8

I am an AFU Ambassador and can connect you directly with the investment team for a detailed discussion. Would you be open to a brief call?

You can also learn more at: [Your Referral Link]

Best regards,
[Your Name]
AFU Ambassador`}
              />
            </div>
          </Section>

          {/* 5. WhatsApp Messages */}
          <Section icon={MessageCircle} title="WhatsApp Messages" id="whatsapp">
            <div className="space-y-4">
              <ContentCard
                title="Message to a Farmer"
                content={`Hi [Name], hope you're well! I wanted to share something that could really help your farming. The African Farming Union (AFU) gives farmers access to financing, free crop insurance, inputs at wholesale prices, and guaranteed buyers for your produce. Over 19,000 farmers across Africa are already using it. Take a look here: [Your Referral Link]. Happy to answer any questions!`}
              />
              <ContentCard
                title="Message to a Supplier"
                content={`Hi [Name], I thought you might be interested in this. The African Farming Union (AFU) serves 19,000+ farmers across 20 countries and they're looking for suppliers of [seeds/fertiliser/equipment]. It's a great way to reach thousands of customers through one platform with guaranteed payment. Check it out: [Your Referral Link]. Want me to connect you with their team?`}
              />
              <ContentCard
                title="Message to an Investor"
                content={`Hi [Name], I've come across an interesting investment opportunity in African agriculture. The African Farming Union operates across 20 countries with 19,000+ farmers. They've built an integrated model with insurance and guaranteed offtake that significantly reduces risk. The African ag market is $50B and growing. Here's more info: [Your Referral Link]. Would you be open to hearing more?`}
              />
              <ContentCard
                title="Message to a Friend/Contact"
                content={`Hey [Name]! I've become an Ambassador for the African Farming Union, a platform helping African farmers access finance, insurance, and markets. It's making a real difference for farming families across 20 countries. If you know any farmers, agricultural businesses, or people interested in investing in African agriculture, I'd love an introduction. Here's my link: [Your Referral Link]. Thanks!`}
              />
            </div>
          </Section>

          {/* 6. Talking Points */}
          <Section icon={MessageSquare} title="Talking Points by Audience" id="talking-points">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#1B2A4A' }}>For Farmers</h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Access affordable financing to buy seeds, fertiliser, and equipment.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Get free crop and asset insurance to protect against bad seasons.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Buy inputs at wholesale prices through AFU&apos;s bulk purchasing power.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Guaranteed buyers for your produce through offtake agreements.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Access processing hubs to add value and earn more per kilogram.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Professional training to improve your farming techniques.</li>
                  </ul>
                  <div className="mt-3 flex justify-end">
                    <CopyButton text="For Farmers: Access affordable financing | Free crop insurance | Wholesale-price inputs | Guaranteed buyers through offtake | Processing hub access | Professional training programmes" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#1B2A4A' }}>For Suppliers</h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Reach 19,000+ farmers across 20 African countries through one platform.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Predictable, aggregated demand simplifies your planning and logistics.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Payment security through AFU&apos;s integrated finance system.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Streamlined distribution via AFU&apos;s processing hub network.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Long-term contracts with a growing customer base.</li>
                  </ul>
                  <div className="mt-3 flex justify-end">
                    <CopyButton text="For Suppliers: Reach 19,000+ farmers in 20 countries | Predictable aggregated demand | Payment security | Streamlined logistics via processing hubs | Long-term contracts" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#1B2A4A' }}>For Investors</h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> $50 billion addressable market with significant growth potential.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Diversified portfolio across 20 countries and multiple crop types.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Integrated insurance and guaranteed offtake reduce investment risk.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Strong impact credentials aligned with SDGs 1, 2, and 8.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Proven model with 19,000+ active farmers and 1M+ hectares.</li>
                  </ul>
                  <div className="mt-3 flex justify-end">
                    <CopyButton text="For Investors: $50B market | 20-country diversification | Insurance + offtake reduce risk | SDG-aligned impact | 19,000+ farmers, 1M+ hectares" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#1B2A4A' }}>For Partners (Government/NGOs)</h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> AFU provides scalable agricultural development infrastructure.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Aligns with food security, poverty reduction, and economic growth goals.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Existing network of 19,000+ farmers for programme delivery.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Integrated platform reduces duplication and increases efficiency.</li>
                    <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Data-driven approach with measurable impact metrics.</li>
                  </ul>
                  <div className="mt-3 flex justify-end">
                    <CopyButton text="For Partners: Scalable ag development infrastructure | Food security & SDG alignment | 19,000+ farmer network | Integrated platform | Measurable impact metrics" />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* 7. Brand Guidelines */}
          <Section icon={Palette} title="Brand Guidelines" id="brand">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#1B2A4A' }}>Brand Colours</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="w-14 h-14 rounded-xl shrink-0" style={{ backgroundColor: '#5DB347' }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1B2A4A' }}>AFU Green</p>
                      <p className="text-gray-500 text-sm font-mono">#5DB347</p>
                      <p className="text-gray-400 text-xs">Primary accent, CTAs, highlights</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="w-14 h-14 rounded-xl shrink-0" style={{ backgroundColor: '#1B2A4A' }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1B2A4A' }}>AFU Navy</p>
                      <p className="text-gray-500 text-sm font-mono">#1B2A4A</p>
                      <p className="text-gray-400 text-xs">Headings, dark backgrounds, text</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#1B2A4A' }}>Logo Usage</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Only use the official AFU logo provided in your Ambassador Dashboard.</li>
                  <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Do not modify, recolour, or distort the logo in any way.</li>
                  <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Maintain clear space around the logo equal to the height of the &ldquo;A&rdquo; in AFU.</li>
                  <li className="flex items-start gap-2"><span style={{ color: '#5DB347' }}>&bull;</span> Do not place the logo on busy or low-contrast backgrounds.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#1B2A4A' }}>Tone of Voice</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { tone: 'Professional', desc: 'Credible, trustworthy, knowledgeable' },
                    { tone: 'Empowering', desc: 'Positive, solution-focused, uplifting' },
                    { tone: 'Accessible', desc: 'Plain language, no jargon, inclusive' },
                    { tone: 'Authentic', desc: 'Honest, transparent, grounded in real impact' },
                  ].map((item) => (
                    <div key={item.tone} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="font-semibold text-sm" style={{ color: '#1B2A4A' }}>{item.tone}</p>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* 8. FAQ Responses */}
          <Section icon={HelpCircle} title="FAQ Responses" id="faq">
            <p className="text-gray-500 text-sm mb-4">
              Ready-to-use answers for common questions you will receive. Copy and customise as needed.
            </p>
            <div className="space-y-4">
              <ContentCard
                title="What is the African Farming Union?"
                content="The African Farming Union (AFU) is an integrated agricultural platform that provides financing, crop insurance, agricultural inputs, guaranteed market access through offtake agreements, processing hub access, and farmer training programmes. We serve over 19,000 farmers managing more than 1 million hectares across 20 African countries."
              />
              <ContentCard
                title="How much does membership cost?"
                content="Membership fees vary by country and the specific services you need. AFU offers flexible plans designed to be affordable for smallholder farmers. Visit our website for current pricing or message me and I can connect you with the team for a personalised quote."
              />
              <ContentCard
                title="Is this a legitimate organisation?"
                content="Yes. The African Farming Union is a registered organisation operating across 20 African countries with over 19,000 active farmer members. AFU is headquartered in Botswana and works with established financial institutions, insurance providers, and offtake partners. You can visit our website, read our terms of service, and contact our team directly."
              />
              <ContentCard
                title="How does the financing work?"
                content="AFU provides crop financing to members at affordable rates. The financing covers inputs like seeds, fertiliser, and equipment. Repayment is structured around your harvest cycle, and because AFU also provides guaranteed offtake, you have a clear path to repay from your sales proceeds. Crop insurance is included to protect both you and the lender."
              />
              <ContentCard
                title="What countries does AFU operate in?"
                content="AFU currently operates across 20 countries in Africa, including Botswana, Kenya, Zimbabwe, Tanzania, Uganda, Zambia, Malawi, Mozambique, Ghana, and Nigeria, among others. We are continuously expanding to new markets."
              />
              <ContentCard
                title="How do I invest in AFU?"
                content="AFU offers several investment opportunities for individuals and institutions looking for exposure to African agriculture. Investment structures vary in size, term, and risk profile. I can connect you directly with AFU's investment team for a detailed conversation. Please visit our website or reach out to me and I'll facilitate an introduction."
              />
              <ContentCard
                title="What is an AFU Ambassador?"
                content="An AFU Ambassador is someone who promotes the African Farming Union and connects farmers, suppliers, investors, and partners with the platform. Ambassadors earn commissions on successful referrals. The program is open to anyone aged 18+ from any country. No farming experience is required."
              />
            </div>
          </Section>

        </div>
      </section>
    </>
  );
}
