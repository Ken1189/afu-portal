import Link from "next/link";
export const metadata = { title: "Inputs - AFU Services" };
export default function InputsServicePage() {
  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-teal/20 text-teal px-4 py-1.5 rounded-full text-sm font-medium mb-4">Service</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Inputs</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Part of AFU&apos;s integrated agriculture development platform.
          </p>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-lg mb-8">
            This service page provides detailed information about our Inputs offerings.
            Contact us to learn more about how we can support your agricultural operation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apply" className="bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-smooth">
              Become a Member
            </Link>
            <Link href="/contact" className="border-2 border-navy/20 hover:border-navy/40 text-navy px-8 py-3 rounded-lg font-semibold transition-smooth">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
