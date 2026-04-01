import Link from "next/link";
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Ambassador Program Terms & Conditions',
  description: 'Terms and conditions governing participation in the African Farming Union Ambassador Program, including commission structure, eligibility, and code of conduct.',
  path: '/legal/ambassador-terms',
});

export default async function AmbassadorTermsPage() {
  return (
    <>
      {/* --- HERO --- */}
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
            Ambassador Program{" "}
            <span className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
              Terms &amp; Conditions
            </span>
          </h1>
          <p className="text-lg text-gray-300">
            Effective date: April 2026
          </p>
        </div>
      </section>

      {/* --- CONTENT --- */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg shadow-[#5DB347]/5 border border-[#EBF7E5]">

              {/* 1. Definitions */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                1. Definitions
              </h2>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1 font-bold">&bull;</span>
                  <span><strong>&ldquo;AFU&rdquo;</strong> means the African Farming Union, its subsidiaries, affiliates, and authorised representatives.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1 font-bold">&bull;</span>
                  <span><strong>&ldquo;Ambassador&rdquo;</strong> means any individual accepted into the AFU Ambassador Program who promotes AFU&apos;s services and refers new members, suppliers, investors, or partners.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1 font-bold">&bull;</span>
                  <span><strong>&ldquo;Referral&rdquo;</strong> means any individual, business, or entity introduced to AFU through an Ambassador&apos;s unique referral link or code who subsequently registers or transacts on the AFU platform.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1 font-bold">&bull;</span>
                  <span><strong>&ldquo;Commission&rdquo;</strong> means the monetary compensation paid to an Ambassador based on the activity and transactions of their Referrals, as detailed in Section 4.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1 font-bold">&bull;</span>
                  <span><strong>&ldquo;Program&rdquo;</strong> means the AFU Ambassador Program as described in these Terms and Conditions.</span>
                </li>
              </ul>

              {/* 2. Eligibility */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                2. Eligibility
              </h2>
              <p className="text-gray-600 mb-3 leading-relaxed">
                The AFU Ambassador Program is open to individuals worldwide who meet the following criteria:
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  Must be at least 18 years of age.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  Open to individuals from any country; no geographic restrictions apply.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  No prior farming or agricultural experience is required.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  Must have a valid email address and the ability to receive electronic communications.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  Must agree to abide by these Terms and Conditions and the AFU Code of Conduct.
                </li>
              </ul>

              {/* 3. Application & Approval */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                3. Application &amp; Approval
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                To join the Ambassador Program, applicants must complete the online application form available on the AFU platform. All applications are reviewed within 48 hours of submission. AFU reserves the sole right to approve or reject any application at its discretion without being required to provide a reason. Upon approval, the Ambassador will receive a unique referral link and access to the Ambassador Dashboard. AFU may request additional information or documentation to verify an applicant&apos;s identity before granting approval.
              </p>

              {/* 4. Commission Structure */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                4. Commission Structure
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Ambassadors earn commissions based on the activity generated by their Referrals. Commission rates are structured as follows:
              </p>

              <h3 className="text-xl font-semibold mb-3" style={{ color: "#1B2A4A" }}>
                4.1 Membership Fee Commissions
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Ambassadors earn a <strong>10% recurring monthly commission</strong> on all membership fees paid by their Referrals for as long as the referred member remains an active, paying member of AFU. This commission is calculated on the net membership fee (excluding taxes and processing fees).
              </p>

              <h3 className="text-xl font-semibold mb-3" style={{ color: "#1B2A4A" }}>
                4.2 Fundraising Commissions
              </h3>
              <p className="text-gray-600 mb-2 leading-relaxed">
                Ambassadors who introduce investors or facilitate fundraising receive commissions on successfully closed capital raises according to the following tiered structure:
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse text-sm mb-2">
                  <thead>
                    <tr style={{ backgroundColor: "#1B2A4A" }} className="text-white">
                      <th className="px-4 py-3 text-left rounded-tl-lg">Capital Raised</th>
                      <th className="px-4 py-3 text-left rounded-tr-lg">Commission Rate</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">$100,000 &ndash; $500,000</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#5DB347" }}>2%</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-3">$500,000 &ndash; $1,000,000</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#5DB347" }}>2.5%</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">$1,000,000 &ndash; $5,000,000</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#5DB347" }}>5%</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-3">$5,000,000 &ndash; $10,000,000</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#5DB347" }}>7.5%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">$100,000,000+</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#5DB347" }}>10%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Fundraising commissions are paid only after the capital has been received by AFU and any applicable lock-up or escrow conditions have been satisfied. Commission is calculated on the gross amount of capital raised.
              </p>

              {/* 5. Payment Terms */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                5. Payment Terms
              </h2>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  Commissions are calculated and paid on a monthly basis, within 15 business days of the end of each calendar month.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  A minimum payout threshold of <strong>$50 USD</strong> (or equivalent in local currency) must be reached before a payment is issued. Balances below this threshold will roll over to the following month.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  Payments are made via <strong>Bank Transfer</strong> or <strong>Mobile Money</strong> (M-Pesa, EcoCash, MTN Mobile Money, or equivalent), as selected by the Ambassador in their profile settings.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  Ambassadors are responsible for providing accurate payment details. AFU is not liable for delays or losses caused by incorrect payment information.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  Ambassadors are solely responsible for any taxes, duties, or levies applicable to their commission income in their jurisdiction.
                </li>
              </ul>

              {/* 6. Ambassador Tiers */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                6. Ambassador Tiers
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Ambassadors are classified into tiers based on performance. Tier status is reviewed quarterly and determines access to additional benefits and recognition:
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse text-sm mb-2">
                  <thead>
                    <tr style={{ backgroundColor: "#1B2A4A" }} className="text-white">
                      <th className="px-4 py-3 text-left rounded-tl-lg">Tier</th>
                      <th className="px-4 py-3 text-left">Active Referrals</th>
                      <th className="px-4 py-3 text-left rounded-tr-lg">Benefits</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3 font-semibold">Bronze</td>
                      <td className="px-4 py-3">1 &ndash; 10</td>
                      <td className="px-4 py-3">Standard commission rates, Ambassador badge</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-3 font-semibold">Silver</td>
                      <td className="px-4 py-3">11 &ndash; 50</td>
                      <td className="px-4 py-3">Priority support, featured on website</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3 font-semibold">Gold</td>
                      <td className="px-4 py-3">51 &ndash; 200</td>
                      <td className="px-4 py-3">Dedicated account manager, co-branded materials</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-3 font-semibold">Platinum</td>
                      <td className="px-4 py-3">201 &ndash; 500</td>
                      <td className="px-4 py-3">Quarterly strategy sessions, early access to new features</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">Diamond</td>
                      <td className="px-4 py-3">500+</td>
                      <td className="px-4 py-3">Custom commission negotiations, VIP events, advisory board invitation</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 7. Code of Conduct */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                7. Code of Conduct
              </h2>
              <p className="text-gray-600 mb-3 leading-relaxed">
                All Ambassadors must adhere to the following standards of conduct:
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  <strong>No spam:</strong> Ambassadors must not send unsolicited bulk messages, engage in aggressive marketing tactics, or use automated tools to distribute referral links.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  <strong>No misleading claims:</strong> Ambassadors must not make false, exaggerated, or unsubstantiated claims about AFU&apos;s services, returns, or benefits. All representations must be truthful and based on official AFU materials.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  <strong>Professional representation:</strong> Ambassadors represent the AFU brand and must conduct themselves professionally in all interactions with potential and existing members, investors, and partners.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  <strong>Transparency:</strong> Ambassadors must disclose their relationship with AFU and their financial interest when promoting the platform.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">&bull;</span>
                  <strong>Compliance:</strong> Ambassadors must comply with all applicable laws and regulations in their jurisdiction, including data protection and anti-spam legislation.
                </li>
              </ul>

              {/* 8. Intellectual Property */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                8. Intellectual Property
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                The AFU name, logo, trademarks, and all associated branding materials are the exclusive property of the African Farming Union. Ambassadors are granted a limited, non-exclusive, revocable licence to use AFU-approved marketing materials solely for the purpose of promoting the Ambassador Program. Ambassadors may not create their own materials bearing the AFU brand without prior written approval. Any unauthorised use of AFU intellectual property may result in immediate termination from the Program and legal action.
              </p>

              {/* 9. Termination */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                9. Termination
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Either party may terminate participation in the Ambassador Program with 30 days&apos; written notice, provided via email or through the AFU platform. AFU may terminate an Ambassador&apos;s participation immediately and without notice in cases of fraud, violation of the Code of Conduct, or breach of these Terms and Conditions. Upon termination, the Ambassador&apos;s referral link will be deactivated and no further commissions will accrue. Any outstanding commissions that have been earned but not yet paid will be settled within 60 days of termination, subject to the minimum payout threshold.
              </p>

              {/* 10. Limitation of Liability */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                10. Limitation of Liability
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AFU shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to an Ambassador&apos;s participation in the Program. AFU&apos;s total liability to any Ambassador under these Terms shall not exceed the total commissions paid to that Ambassador in the twelve (12) months preceding the claim. AFU makes no guarantees regarding the level of commissions an Ambassador may earn, as earnings depend on individual effort, market conditions, and other factors beyond AFU&apos;s control. Ambassadors participate in the Program as independent contractors and not as employees, agents, or partners of AFU.
              </p>

              {/* 11. Governing Law */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                11. Governing Law
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of Botswana. Any disputes arising from or in connection with these Terms shall be resolved through the courts of Botswana or through alternative dispute resolution mechanisms as agreed by both parties. The invalidity or unenforceability of any provision of these Terms shall not affect the validity or enforceability of any other provision.
              </p>

              {/* 12. Contact */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1B2A4A" }}>
                12. Contact
              </h2>
              <p className="text-gray-600 leading-relaxed">
                For questions or concerns regarding these Terms and Conditions or the Ambassador Program, please contact us at{" "}
                <a
                  href="mailto:peterw@africanfarmingunion.org"
                  className="font-medium underline"
                  style={{ color: "#5DB347" }}
                >
                  peterw@africanfarmingunion.org
                </a>{" "}
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
          </div>
        </div>
      </section>
    </>
  );
}
