import Link from "next/link";
export const metadata = { title: "Offtake - AFU Services" };
export default function OfftakeServicePage() {
  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">Service</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Offtake</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Part of AFU&apos;s integrated agriculture development platform.
          </p>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-lg mb-8">
            This service page provides detailed information about our Offtake offerings.
            Contact us to learn more about how we can support your agricultural operation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apply" className="bg-[#5DB347] hover:bg-[#449933] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Become a Member
            </Link>
            <Link href="/contact" className="border-2 border-navy/20 hover:border-navy/40 text-navy px-8 py-3 rounded-lg font-semibold transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
