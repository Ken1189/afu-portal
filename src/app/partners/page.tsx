import Link from "next/link";

export const metadata = {
  title: "Partners - AFU",
  description: "AFU partners with commercial farmers, tech providers, input suppliers, offtakers, vocational colleges, and trade finance providers.",
};

export default function PartnersPage() {
  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Partnerships</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            We partner instead of trying to build everything. Our partnerships are key to de-risking the platform.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Commercial Farmers",
                desc: "Execution + credibility backbone. Experienced operators who manage production at scale.",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
              },
              {
                title: "Tech Partners",
                desc: "Drones, satellite imagery, farm software, and ERP systems that power precision agriculture.",
                icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              },
              {
                title: "Input Suppliers",
                desc: "Bulk procurement partnerships for seeds, fertilizers, and pesticides at improved pricing.",
                icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
              },
              {
                title: "Offtakers / Commodities Partners",
                desc: "Guaranteed demand through pre-arranged buyer relationships and distribution networks.",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Vocational Colleges",
                desc: "Training pipeline + certification ecosystem to build scalable farmer capacity across the continent.",
                icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
              },
              {
                title: "Trade Finance Providers",
                desc: "Letters of credit, invoice finance, and structured trade solutions bridging payment gaps.",
                icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
              },
            ].map((p, i) => (
              <div key={i} className="bg-cream rounded-2xl p-8">
                <div className="w-12 h-12 bg-teal rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-navy rounded-2xl p-10 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Become an AFU Partner</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Partner membership is $250/year and gives you access to the AFU deal flow, member network, and co-branded programs.
            </p>
            <Link href="/apply" className="inline-block bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Apply as Partner
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
