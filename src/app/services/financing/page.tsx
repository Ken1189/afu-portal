import Link from "next/link";

export const metadata = { title: "Financing - AFU Services" };

export default function FinancingServicePage() {
  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">Service</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Financing</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            From seasonal working capital to export invoice finance. Repayment controlled through offtake + escrow.
          </p>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="card-elevated bg-[#5DB347] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Product 1: Pre-export Working Capital</h3>
              <ul className="space-y-3 text-white/90 text-sm">
                <li><strong>Funds:</strong> inputs, harvesting, packing, cold chain, transport</li>
                <li><strong>Tenor:</strong> 90-180 days</li>
                <li><strong>Target pricing:</strong> 12-18% APR + 1-2% origination fee</li>
              </ul>
            </div>
            <div className="card-polished bg-cream rounded-2xl p-8">
              <h3 className="text-xl font-bold text-navy mb-4">Product 2: Export Invoice Finance</h3>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><strong>Funds:</strong> shipment-to-payment gap (buyer terms)</li>
                <li><strong>Tenor:</strong> 30-60 days</li>
                <li><strong>Target pricing:</strong> 8-10% APR + ~1% fee</li>
              </ul>
            </div>
          </div>
          <div className="card-elevated bg-[#EBF7E5] rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-navy mb-4">How Repayment Works</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Through our Tri-Party Escrow system, buyer payments flow into AFU-controlled escrow.
              The escrow waterfall pays AFU first, then suppliers, then the producer receives remaining proceeds.
            </p>
            <Link href="/apply" className="inline-block bg-[#5DB347] hover:bg-[#449933] text-white px-8 py-3 rounded-lg font-semibold transition-smooth">
              Apply for Financing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
