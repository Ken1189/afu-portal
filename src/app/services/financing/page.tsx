import Link from "next/link";

export const metadata = { title: "Financing - AFU Services" };

export default function FinancingServicePage() {
  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">Service</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #6ABF4B, #5DB347)' }}>
              Financing
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            From seasonal working capital to export invoice finance. Repayment controlled through offtake + escrow.
          </p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="rounded-3xl p-8 text-white shadow-lg shadow-[#5DB347]/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
              <h3 className="text-xl font-bold mb-4">Product 1: Pre-export Working Capital</h3>
              <ul className="space-y-3 text-white/90 text-sm">
                <li><strong>Funds:</strong> inputs, harvesting, packing, cold chain, transport</li>
                <li><strong>Tenor:</strong> 90-180 days</li>
                <li><strong>Target pricing:</strong> 12-18% APR + 1-2% origination fee</li>
              </ul>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-[#1B2A4A] mb-4">Product 2: Export Invoice Finance</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><strong>Funds:</strong> shipment-to-payment gap (buyer terms)</li>
                <li><strong>Tenor:</strong> 30-60 days</li>
                <li><strong>Target pricing:</strong> 8-10% APR + ~1% fee</li>
              </ul>
            </div>
          </div>
          <div className="bg-[#EBF7E5] rounded-3xl p-8 text-center shadow-lg shadow-[#5DB347]/5">
            <h3 className="text-2xl font-bold text-[#1B2A4A] mb-4">How Repayment Works</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Through our Tri-Party Escrow system, buyer payments flow into AFU-controlled escrow.
              The escrow waterfall pays AFU first, then suppliers, then the producer receives remaining proceeds.
            </p>
            <Link href="/apply" className="inline-block text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-md shadow-[#5DB347]/20" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
              Apply for Financing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
