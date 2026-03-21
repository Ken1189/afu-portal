import Link from "next/link";
export const metadata = { title: "Inputs - AFU Services" };
export default function InputsServicePage() {
  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">Service</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #6ABF4B, #5DB347)' }}>
              Inputs
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Part of AFU&apos;s integrated agriculture development platform.
          </p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-lg mb-8">
            This service page provides detailed information about our Inputs offerings.
            Contact us to learn more about how we can support your agricultural operation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apply" className="text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-md shadow-[#5DB347]/20" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
              Become a Member
            </Link>
            <Link href="/contact" className="border-2 border-[#1B2A4A]/20 hover:border-[#1B2A4A]/40 text-[#1B2A4A] px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
