import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - AFU",
  description:
    "African Farming Union (AFU) Privacy Policy. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
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
            Privacy{" "}
            <span className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
              Policy
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
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg shadow-[#5DB347]/5 border border-[#EBF7E5]">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                1. Introduction
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                African Farming Union (AFU) is committed to protecting and
                respecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                visit our website, use our platform, or engage with our
                services across our operating countries.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                2. Information We Collect
              </h2>
              <p className="text-gray-600 mb-3 leading-relaxed">
                We may collect the following types of information:
              </p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">
                    &bull;
                  </span>
                  <span>
                    <strong>Personal Information:</strong> Name, email address,
                    phone number, postal address, date of birth, and national
                    identification details as required for membership.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">
                    &bull;
                  </span>
                  <span>
                    <strong>Farm Information:</strong> Farm location, size,
                    crop types, livestock details, and agricultural production
                    data.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">
                    &bull;
                  </span>
                  <span>
                    <strong>Financial Information:</strong> Banking details,
                    mobile money accounts, and transaction records related to
                    AFU services.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#5DB347" }} className="mt-1">
                    &bull;
                  </span>
                  <span>
                    <strong>Usage Data:</strong> IP address, browser type, pages
                    visited, and interaction data collected through cookies and
                    similar technologies.
                  </span>
                </li>
              </ul>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We use the information we collect to provide, maintain, and
                improve our agricultural financing, insurance, input supply,
                training, and offtake services. This includes processing
                membership applications, facilitating loan disbursements,
                managing crop insurance claims, coordinating with suppliers and
                buyers, and communicating important updates about your account
                and our services.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                4. Data Sharing & Disclosure
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We do not sell your personal information. We may share your
                data with trusted partners including financial institutions,
                insurance providers, input suppliers, and offtake buyers solely
                for the purpose of delivering AFU services. We may also
                disclose information when required by law or to protect the
                rights and safety of our members and operations.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                5. Data Security
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We implement industry-standard security measures including
                encryption, access controls, and secure data storage to protect
                your information. While no method of electronic storage is 100%
                secure, we continuously work to safeguard your data against
                unauthorised access, alteration, or destruction.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                6. Your Rights
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                You have the right to access, correct, or delete your personal
                information held by AFU. You may also withdraw consent for data
                processing, request data portability, or lodge a complaint with
                the relevant data protection authority in your jurisdiction. To
                exercise these rights, contact us at{" "}
                <span style={{ color: "#5DB347" }} className="font-medium">
                  privacy@africanfarmers.org
                </span>
                .
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                7. Cookies
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our website uses cookies and similar tracking technologies to
                enhance your experience, analyse usage patterns, and deliver
                relevant content. You can manage your cookie preferences
                through your browser settings.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                8. Changes to This Policy
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We may update this Privacy Policy from time to time. Any
                changes will be posted on this page with an updated revision
                date. We encourage you to review this page periodically.
              </p>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                9. Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about this Privacy Policy or our data
                practices, please contact us at{" "}
                <span style={{ color: "#5DB347" }} className="font-medium">
                  privacy@africanfarmers.org
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
          </div>
        </div>
      </section>
    </>
  );
}
