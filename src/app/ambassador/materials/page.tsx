'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Download,
  Image,
  FileText,
  Share2,
  Mail,
  Copy,
  Check,
  Globe,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

// ── Demo Data ────────────────────────────────────────────────────────────────

const marketingAssets = [
  { id: '1', name: 'AFU Ambassador Banner (1200x628)', type: 'image', format: 'PNG', size: '245 KB', category: 'Social Media', icon: Image },
  { id: '2', name: 'AFU Referral Flyer - English', type: 'pdf', format: 'PDF', size: '1.2 MB', category: 'Print', icon: FileText },
  { id: '3', name: 'AFU Referral Flyer - French', type: 'pdf', format: 'PDF', size: '1.3 MB', category: 'Print', icon: FileText },
  { id: '4', name: 'Instagram Story Template', type: 'image', format: 'PNG', size: '180 KB', category: 'Social Media', icon: Smartphone },
  { id: '5', name: 'Facebook Post Template', type: 'image', format: 'PNG', size: '320 KB', category: 'Social Media', icon: Share2 },
  { id: '6', name: 'WhatsApp Share Card', type: 'image', format: 'JPG', size: '95 KB', category: 'Messaging', icon: MessageSquare },
  { id: '7', name: 'AFU Membership Benefits Guide', type: 'pdf', format: 'PDF', size: '2.1 MB', category: 'Educational', icon: FileText },
  { id: '8', name: 'Ambassador Program Overview', type: 'pdf', format: 'PDF', size: '890 KB', category: 'Educational', icon: FileText },
  { id: '9', name: 'Twitter/X Header Image', type: 'image', format: 'PNG', size: '150 KB', category: 'Social Media', icon: Globe },
  { id: '10', name: 'Email Signature Badge', type: 'image', format: 'PNG', size: '45 KB', category: 'Email', icon: Mail },
];

const emailTemplates = [
  {
    id: '1',
    name: 'Farmer Invitation Email',
    subject: 'Join the African Farming Union - Grow Together',
    body: `Hi [Name],

I wanted to share an incredible opportunity with you. The African Farming Union (AFU) is empowering farmers across Africa with resources, market access, and community support.

As a member, you will get access to:
- Direct market connections for your produce
- Training programs and agricultural best practices
- Input financing and equipment leasing
- A community of over 50,000 farmers

Join using my referral link: [REFERRAL_LINK]

Looking forward to growing together!

Best regards,
[YOUR_NAME]
AFU Ambassador`,
  },
  {
    id: '2',
    name: 'Cooperative Introduction',
    subject: 'Partnership Opportunity - African Farming Union',
    body: `Dear [Cooperative Name],

I am reaching out to introduce the African Farming Union, a growing network of farmers and agricultural businesses across the continent.

AFU offers cooperatives like yours:
- Bulk purchasing power for inputs
- Access to premium markets
- Digital tools for member management
- Financial services and insurance

I would love to schedule a brief call to discuss how AFU can benefit your members. Register here: [REFERRAL_LINK]

Warm regards,
[YOUR_NAME]
AFU Ambassador`,
  },
];

const socialTemplates = [
  {
    id: '1',
    platform: 'Facebook / LinkedIn',
    text: `Are you a farmer looking to grow your business? Join the African Farming Union and access markets, training, financing, and a community of 50,000+ farmers across Africa. Sign up here: [REFERRAL_LINK] #AFU #AfricanFarming #GrowTogether`,
  },
  {
    id: '2',
    platform: 'Twitter / X',
    text: `Join 50K+ farmers transforming African agriculture with @AFU_Official. Access markets, training & financing. Sign up: [REFERRAL_LINK] #AFU #Agriculture`,
  },
  {
    id: '3',
    platform: 'WhatsApp / SMS',
    text: `Hello! I am an Ambassador for the African Farming Union. AFU helps farmers access better markets, training and financing. Join using my link: [REFERRAL_LINK]`,
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function MaterialsPage() {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'DEMO1234';
  const referralLink = `https://africanfarmingunion.org/apply?ref=${referralCode}`;
  const utmLink = `${referralLink}&utm_source=ambassador&utm_medium=referral&utm_campaign=ambassador_program`;

  const handleCopy = async (text: string, id: string) => {
    const processed = text.replace(/\[REFERRAL_LINK\]/g, utmLink);
    await navigator.clipboard.writeText(processed);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (asset: typeof marketingAssets[0]) => {
    // In production, this would download from Supabase Storage
    alert(`Download started: ${asset.name}.${asset.format.toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Marketing Materials</h1>
        <p className="text-gray-500 text-sm mt-1">Download assets, grab templates, and share your referral link.</p>
      </div>

      {/* Referral Link with UTM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3f6e] rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-[#5DB347]" />
          <h2 className="font-semibold">Your Tracked Referral Link</h2>
        </div>
        <p className="text-sm text-gray-300 mb-4">This link includes UTM parameters for analytics tracking.</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-xs font-mono truncate">
            {utmLink}
          </div>
          <button
            onClick={() => handleCopy(utmLink, 'utm-link')}
            className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              copiedId === 'utm-link' ? 'bg-green-500' : 'bg-[#5DB347] hover:bg-[#4ea03c]'
            }`}
          >
            {copiedId === 'utm-link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedId === 'utm-link' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </motion.div>

      {/* Downloadable Assets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-2 mb-5">
          <Download className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Downloadable Assets</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketingAssets.map((asset) => {
            const Icon = asset.icon;
            return (
              <div
                key={asset.id}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1B2A4A]/5 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#1B2A4A]" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                    {asset.category}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-[#1B2A4A] mb-1">{asset.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{asset.format} &middot; {asset.size}</p>
                <button
                  onClick={() => handleDownload(asset)}
                  className="w-full py-2 rounded-lg bg-gray-50 text-sm font-medium text-[#1B2A4A] hover:bg-[#5DB347] hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Email Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-2 mb-5">
          <Mail className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Email Templates</h2>
        </div>
        <div className="space-y-4">
          {emailTemplates.map((tmpl) => (
            <div key={tmpl.id} className="border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#1B2A4A]">{tmpl.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Subject: {tmpl.subject}</p>
                </div>
                <button
                  onClick={() => handleCopy(tmpl.body, `email-${tmpl.id}`)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    copiedId === `email-${tmpl.id}`
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-[#5DB347]/10 hover:text-[#5DB347]'
                  }`}
                >
                  {copiedId === `email-${tmpl.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === `email-${tmpl.id}` ? 'Copied!' : 'Copy Template'}
                </button>
              </div>
              <pre className="text-xs text-gray-500 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
                {tmpl.body}
              </pre>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Social Media Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-2 mb-5">
          <Share2 className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-semibold text-[#1B2A4A]">Social Media Templates</h2>
        </div>
        <div className="space-y-4">
          {socialTemplates.map((tmpl) => (
            <div key={tmpl.id} className="border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#1B2A4A] bg-[#1B2A4A]/5 px-3 py-1 rounded-full">
                  {tmpl.platform}
                </span>
                <button
                  onClick={() => handleCopy(tmpl.text, `social-${tmpl.id}`)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    copiedId === `social-${tmpl.id}`
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-[#5DB347]/10 hover:text-[#5DB347]'
                  }`}
                >
                  {copiedId === `social-${tmpl.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === `social-${tmpl.id}` ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{tmpl.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
