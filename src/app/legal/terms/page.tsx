import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Terms of Service',
  description: 'African Farming Union terms and conditions governing the use of our platform and agricultural services.',
  path: '/legal/terms',
});

export default async function TermsOfServicePage() {
  let dbContent: string | null = null;
  try {
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await svc
      .from('legal_pages')
      .select('content')
      .eq('slug', 'terms')
      .single();
    if (data?.content) dbContent = data.content;
  } catch {
    // use fallback
  }

  return (
    <>
      {/* ─── HERO ─── */}
      <section
        className="relative text-white py-20 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, rgba(93,179,71,0.15) 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: "#5DB347" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of{" "}
            <span className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="text-lg text-gray-300">
            Last updated: March 2026
          </p>
        </div>
      </section>

      {/* ─── CONTENT ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {dbContent ? (
              <div
                className="bg-white rounded-3xl p-8 md:p-12 shadow-lg shadow-[#5DB347]/5 border border-[#EBF7E5]"
                dangerouslySetInnerHTML={{ __html: dbContent }}
              />
            ) : (
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg shadow-[#5DB347]/5 border border-[#EBF7E5]">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                By accessing or using the African Farming Union (AFU) website,
                platform, and services, you agree to be bound by these Terms
                of Service. If you do not agree to these terms, please do not
                use our services. These terms apply to all members, visitors,
                suppliers, partners, and other users of the AFU platform.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                2. Description of Services
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AFU provides an integrated agricultural development platform
                including financing, crop and asset insurance, input supply
                and equipment, processing hub access, guaranteed offtake
                arrangements, trade finance, and farmer training programmes
                across our operating countries in Africa.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                3. Membership & Eligibility
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Membership in AFU is available to individuals and entities
                engaged in agricultural activities within our operating
                countries. Applicants must provide accurate and complete
                information during registration. AFU reserves the right to
                approve or reject membership applications at its discretion.
                Members must be at least 18 years old or the legal age of
                majority in their jurisdiction.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                4. User Responsibilities
              </h2>
              <p className="text-gray-600 mb-3 leading-relaxed">
                As a user of the AFU platform, you agree to:
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">
                    &bull;
                  </span>
                  Provide accurate, current, and complete information
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">
                    &bull;
                  </span>
                  Maintain the security of your account credentials
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">
                    &bull;
                  </span>
                  Comply with all applicable local, national, and
                  international laws
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">
                    &bull;
                  </span>
                  Use the platform only for lawful agricultural purposes
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">
                    &bull;
                  </span>
                  Not engage in fraudulent or misleading activities
                </li>
              </ul>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                5. Financial Services
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AFU financial services including loans, insurance, and trade
                finance are subject to separate agreements and terms specific
                to each product. Approval of financing is not guaranteed and
                is subject to credit assessment, collateral requirements, and
                other conditions as determined by AFU and its financial
                partners. Interest rates, repayment terms, and other
                financial conditions will be clearly communicated before any
                agreement is entered into.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                6. Intellectual Property
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                All content, trademarks, logos, and intellectual property on
                the AFU platform are owned by or licensed to African Farming
                Union. You may not reproduce, distribute, or create
                derivative works from our content without prior written
                consent.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                7. Limitation of Liability
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AFU shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages arising out of or relating
                to your use of or inability to use the platform or services.
                Agricultural activities carry inherent risks including crop
                failure, market fluctuations, and weather events that are
                beyond AFU&apos;s control.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                8. Termination
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AFU reserves the right to suspend or terminate your account
                and access to the platform at any time for breach of these
                terms or for any other reason. Upon termination, your right
                to use the platform ceases immediately. Outstanding financial
                obligations will survive termination.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                9. Governing Law
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                These Terms of Service shall be governed by and construed in
                accordance with the laws of the Republic of Botswana, without
                regard to its conflict of law provisions. Any disputes arising
                from these terms shall be resolved through the courts of
                Botswana or through alternative dispute resolution mechanisms
                as agreed by the parties.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                10. Changes to Terms
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AFU reserves the right to modify these Terms of Service at any
                time. Changes will be posted on this page with an updated
                revision date. Continued use of the platform after changes
                constitutes acceptance of the modified terms.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                11. Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed">
                For questions regarding these Terms of Service, please
                contact us at{" "}
                <span style={{ color: "#5DB347" }} className="font-medium">
                  legal@africanfarmingunion.org
                </span>{" "}
                or visit our{" "}
                <Link
                  href="/contact"
                  className="font-medium underline"
                  style={{ color: "#5DB347" }}
                >
                  Contact page
                </Link>
                .
              </p>
            </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
