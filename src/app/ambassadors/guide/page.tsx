'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  BookOpen,
  Rocket,
  LinkIcon,
  DollarSign,
  Megaphone,
  Users,
  ShieldCheck,
  HelpCircle,
  HeadphonesIcon,
} from 'lucide-react';

/* ─── Accordion Component ─── */

function AccordionItem({
  icon: Icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#EBF7E5] rounded-2xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(93,179,71,0.1)' }}
        >
          <Icon className="w-5 h-5" style={{ color: '#5DB347' }} />
        </div>
        <span className="text-lg font-semibold flex-1" style={{ color: '#1B2A4A' }}>
          {title}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */

export default function AmbassadorGuidePage() {
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
              Handbook
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Everything you need to know to succeed as an AFU Ambassador. Your complete guide to earning commissions, growing your network, and making a real impact on African agriculture.
          </p>
        </div>
      </section>

      {/* --- CONTENT --- */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">

          {/* 1. Welcome */}
          <AccordionItem icon={BookOpen} title="Welcome to the Ambassador Program" defaultOpen>
            <div className="space-y-4">
              <p>
                The AFU Ambassador Program empowers individuals around the world to help transform African agriculture while earning meaningful income. As an Ambassador, you connect farmers, suppliers, investors, and partners with the African Farming Union&apos;s integrated platform of services.
              </p>
              <p>
                <strong>Who can join?</strong> Anyone aged 18 or older, from any country. You do not need farming experience, agricultural knowledge, or a business background. If you believe in the mission of empowering African farmers and have a network of people who could benefit from AFU&apos;s services, this program is for you.
              </p>
              <p>
                <strong>Why it matters:</strong> Africa&apos;s agricultural sector represents a $50 billion opportunity. By connecting the right people to AFU, you help smallholder farmers access financing, insurance, inputs, markets, and training they desperately need, while earning recurring commissions for every successful referral.
              </p>
            </div>
          </AccordionItem>

          {/* 2. Getting Started */}
          <AccordionItem icon={Rocket} title="Getting Started">
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: '#1B2A4A' }}>How to Apply</h4>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Visit the <Link href="/ambassadors" className="underline font-medium" style={{ color: '#5DB347' }}>Ambassador Program page</Link> and click &ldquo;Apply Now.&rdquo;</li>
                <li>Fill in the application form with your name, email, country, and a short description of how you plan to promote AFU.</li>
                <li>Submit your application. You will receive a confirmation email immediately.</li>
              </ol>

              <h4 className="font-semibold mt-6" style={{ color: '#1B2A4A' }}>What Happens After You Apply</h4>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Your application is reviewed by the AFU team within <strong>48 hours</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  If approved, you receive a welcome email with your unique referral link and login credentials for the Ambassador Dashboard.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  If additional information is needed, the team will reach out via email.
                </li>
              </ul>

              <h4 className="font-semibold mt-6" style={{ color: '#1B2A4A' }}>Setting Up Your Profile</h4>
              <p>
                Once approved, log in to your Ambassador Dashboard and complete your profile. Add a professional photo, your bio, and your preferred payment method (Bank Transfer or Mobile Money). A complete profile builds trust with your referrals and helps AFU showcase top ambassadors.
              </p>
            </div>
          </AccordionItem>

          {/* 3. Your Referral Link */}
          <AccordionItem icon={LinkIcon} title="Your Referral Link">
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: '#1B2A4A' }}>How to Find It</h4>
              <p>
                Your unique referral link is available in your Ambassador Dashboard under the &ldquo;My Link&rdquo; tab. It looks like: <code className="bg-gray-100 px-2 py-1 rounded text-sm">africanfarmingunion.org/join?ref=YOUR_CODE</code>
              </p>

              <h4 className="font-semibold mt-6" style={{ color: '#1B2A4A' }}>How It Works</h4>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  When someone clicks your link, a tracking cookie is stored in their browser for 90 days.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  If they register for AFU within that 90-day window, they are permanently attributed to you as a referral.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  You earn commissions on all qualifying activity from that referral going forward.
                </li>
              </ul>

              <h4 className="font-semibold mt-6" style={{ color: '#1B2A4A' }}>Tracking Your Referrals</h4>
              <p>
                Your Ambassador Dashboard provides real-time tracking of link clicks, registrations, active members, and commission earnings. You can filter by date, country, and referral type.
              </p>
            </div>
          </AccordionItem>

          {/* 4. Commission Structure */}
          <AccordionItem icon={DollarSign} title="Commission Structure">
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: '#1B2A4A' }}>Membership Fee Commissions</h4>
              <p>
                Earn <strong>10% recurring monthly commission</strong> on all membership fees paid by your referrals. This commission continues for as long as the referred member remains active and paying.
              </p>

              <h4 className="font-semibold mt-6" style={{ color: '#1B2A4A' }}>Fundraising Commissions</h4>
              <p className="mb-3">For introducing investors or facilitating capital raises:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr style={{ backgroundColor: '#1B2A4A' }} className="text-white">
                      <th className="px-4 py-3 text-left rounded-tl-lg">Capital Raised</th>
                      <th className="px-4 py-3 text-left rounded-tr-lg">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">$100K &ndash; $500K</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#5DB347' }}>2%</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-3">$500K &ndash; $1M</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#5DB347' }}>2.5%</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">$1M &ndash; $5M</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#5DB347' }}>5%</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-3">$5M &ndash; $10M</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#5DB347' }}>7.5%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">$100M+</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#5DB347' }}>10%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold mt-6" style={{ color: '#1B2A4A' }}>Payment Details</h4>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Paid monthly, within 15 business days of month-end.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Minimum payout threshold: <strong>$50 USD</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Payment methods: Bank Transfer or Mobile Money (M-Pesa, EcoCash, MTN, etc.).
                </li>
              </ul>
            </div>
          </AccordionItem>

          {/* 5. How to Promote AFU */}
          <AccordionItem icon={Megaphone} title="How to Promote AFU">
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: '#1B2A4A' }}>Your Elevator Pitch</h4>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 italic">
                &ldquo;The African Farming Union is a one-stop platform for African farmers. We provide financing, insurance, inputs, guaranteed markets, and training to help farmers grow their operations profitably. With over 19,000 farmers across 20 countries, AFU is transforming how agriculture works in Africa.&rdquo;
              </div>

              <h4 className="font-semibold mt-6" style={{ color: '#1B2A4A' }}>Talking Points</h4>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  AFU serves 19,000+ farmers across 20 African countries.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Integrated services: financing, insurance, inputs, offtake, processing, and training.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  The African agriculture market is worth $50 billion with massive growth potential.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Farmers who join AFU gain access to everything they need to scale their operations.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  AFU reduces risk through crop insurance and guaranteed offtake agreements.
                </li>
              </ul>

              <h4 className="font-semibold mt-6" style={{ color: '#1B2A4A' }}>Who to Target</h4>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  <strong>Farmers</strong> looking for better access to finance, inputs, and markets.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  <strong>Agricultural suppliers</strong> wanting a large, reliable customer base.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  <strong>Investors</strong> seeking high-impact, high-growth opportunities in African agriculture.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  <strong>NGOs and government agencies</strong> focused on food security and rural development.
                </li>
              </ul>
            </div>
          </AccordionItem>

          {/* 6. Target Audiences */}
          <AccordionItem icon={Users} title="Target Audiences">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B2A4A' }}>Farmers</h4>
                <p>
                  African farmers face enormous challenges: limited access to finance, expensive inputs, no insurance safety net, and unreliable markets. AFU solves all of these in one platform. When speaking to farmers, emphasise that membership gives them access to affordable crop financing, free crop insurance, inputs at wholesale prices, guaranteed buyers for their produce, and expert training programmes. AFU already works with over 19,000 farmers managing more than 1 million hectares across 20 countries.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B2A4A' }}>Suppliers</h4>
                <p>
                  Input companies, equipment dealers, seed producers, and fertiliser manufacturers gain access to a massive, aggregated customer base through AFU. Instead of selling to individual smallholders, suppliers can work with AFU to distribute their products at scale. The value proposition: predictable demand, streamlined logistics through AFU&apos;s processing hubs, and payment security through AFU&apos;s integrated finance system.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B2A4A' }}>Investors</h4>
                <p>
                  African agriculture is a $50 billion market with significant growth potential. AFU offers investors exposure to a diversified, de-risked agricultural portfolio across 20 countries. The platform&apos;s integrated model, combining insurance, guaranteed offtake, and structured finance, materially reduces the risk typically associated with agricultural investment in Africa. Present AFU as both an impact investment and a commercial opportunity with strong returns.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B2A4A' }}>Government &amp; NGOs</h4>
                <p>
                  Governments and NGOs focused on food security, rural development, and poverty alleviation find in AFU a scalable partner. AFU&apos;s platform aligns directly with Sustainable Development Goals (SDGs) related to zero hunger, poverty reduction, and economic growth. The partnership value: AFU provides the infrastructure and farmer network; government and NGO partners provide policy support, funding, and programme alignment.
                </p>
              </div>
            </div>
          </AccordionItem>

          {/* 7. Dos and Don'ts */}
          <AccordionItem icon={ShieldCheck} title="Dos and Don'ts">
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: '#5DB347' }}>Do:</h4>
              <ul className="space-y-2 ml-2 mb-4">
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Share your personal experience and genuine enthusiasm for AFU.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Use only official AFU marketing materials and approved messaging.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Disclose that you are an AFU Ambassador and earn commissions on referrals.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Direct prospects to the AFU website or official channels for detailed information.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Report any questions or issues you cannot answer to the AFU support team.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  Respond to prospects promptly and professionally.
                </li>
              </ul>

              <h4 className="font-semibold" style={{ color: '#dc2626' }}>Don&apos;t:</h4>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: '#dc2626' }}>&bull;</span>
                  Make guarantees about investment returns or income levels.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: '#dc2626' }}>&bull;</span>
                  Send unsolicited bulk messages or spam.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: '#dc2626' }}>&bull;</span>
                  Create your own marketing materials without AFU approval.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: '#dc2626' }}>&bull;</span>
                  Misrepresent your role, claiming to be an AFU employee or executive.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: '#dc2626' }}>&bull;</span>
                  Collect personal data from prospects beyond what is needed for a referral.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: '#dc2626' }}>&bull;</span>
                  Make promises about loan approvals, insurance payouts, or specific pricing.
                </li>
              </ul>
            </div>
          </AccordionItem>

          {/* 8. FAQ */}
          <AccordionItem icon={HelpCircle} title="Frequently Asked Questions">
            <div className="space-y-5">
              <div>
                <p className="font-semibold" style={{ color: '#1B2A4A' }}>How long does it take to get approved?</p>
                <p>Applications are reviewed within 48 hours. Most approvals happen within 24 hours.</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1B2A4A' }}>Do I need to be a farmer to become an Ambassador?</p>
                <p>No. The program is open to anyone aged 18+ from any country and any background.</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1B2A4A' }}>How do I get paid?</p>
                <p>Commissions are paid monthly via Bank Transfer or Mobile Money once you reach the $50 minimum threshold.</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1B2A4A' }}>How long does the referral cookie last?</p>
                <p>Your referral link tracks visitors for 90 days. If they register within that window, they are permanently attributed to you.</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1B2A4A' }}>Is there a limit on how many people I can refer?</p>
                <p>No. There is no cap on referrals or commissions. The more people you bring, the more you earn.</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1B2A4A' }}>Can I be an Ambassador if I live outside Africa?</p>
                <p>Absolutely. The program is open worldwide. Many of our top ambassadors connect diaspora investors and international suppliers with AFU.</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1B2A4A' }}>What happens if my referral cancels their membership?</p>
                <p>You earn commission only while the referral maintains an active, paying membership. If they cancel, commission on their fees stops, but you keep everything earned up to that point.</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1B2A4A' }}>Where can I find the Terms and Conditions?</p>
                <p>Read the full <Link href="/legal/ambassador-terms" className="underline font-medium" style={{ color: '#5DB347' }}>Ambassador Terms &amp; Conditions</Link> on our legal page.</p>
              </div>
            </div>
          </AccordionItem>

          {/* 9. Support & Contact */}
          <AccordionItem icon={HeadphonesIcon} title="Support & Contact">
            <div className="space-y-4">
              <p>
                The AFU team is here to help you succeed. If you have questions, need marketing materials, or encounter any issues, reach out through any of the following channels:
              </p>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:peterw@africanfarmingunion.org" className="underline font-medium" style={{ color: '#5DB347' }}>
                    peterw@africanfarmingunion.org
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  <strong>Ambassador Dashboard:</strong> Use the built-in support chat for quick questions.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#5DB347' }} className="mt-1">&bull;</span>
                  <strong>Contact Page:</strong>{' '}
                  <Link href="/contact" className="underline font-medium" style={{ color: '#5DB347' }}>
                    africanfarmingunion.org/contact
                  </Link>
                </li>
              </ul>
              <p>
                Response time is typically within 24 hours during business days. Gold-tier and above ambassadors receive priority support with dedicated account managers.
              </p>
            </div>
          </AccordionItem>

        </div>
      </section>
    </>
  );
}
