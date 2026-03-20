import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white" style={{ background: 'linear-gradient(180deg, #1B2A4A 0%, #0F1A30 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img src="/afu-logo.jpeg" alt="African Farming Union" className="h-12 w-auto object-contain rounded-lg bg-white p-1" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Africa&apos;s Agriculture Development Bank + Operating Platform.
              Financing, Inputs, Processing, Offtake, Trade Finance & Training.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: '#6ABF4B' }}>
              Services
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/services/financing" className="text-gray-300 hover:text-white text-sm transition-colors">Financing</Link>
              <Link href="/services/inputs" className="text-gray-300 hover:text-white text-sm transition-colors">Inputs & Equipment</Link>
              <Link href="/services/processing" className="text-gray-300 hover:text-white text-sm transition-colors">Processing Hubs</Link>
              <Link href="/services/offtake" className="text-gray-300 hover:text-white text-sm transition-colors">Guaranteed Offtake</Link>
              <Link href="/services/trade-finance" className="text-gray-300 hover:text-white text-sm transition-colors">Trade Finance</Link>
              <Link href="/services/training" className="text-gray-300 hover:text-white text-sm transition-colors">Training</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: '#6ABF4B' }}>
              Company
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-gray-300 hover:text-white text-sm transition-colors">About AFU</Link>
              <Link href="/countries" className="text-gray-300 hover:text-white text-sm transition-colors">Countries</Link>
              <Link href="/partners" className="text-gray-300 hover:text-white text-sm transition-colors">Partners</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">Contact</Link>
              <Link href="/apply" className="text-gray-300 hover:text-white text-sm transition-colors">Become a Member</Link>
            </div>
          </div>

          {/* Phase 1 Countries */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: '#6ABF4B' }}>
              Phase 1 Countries
            </h4>
            <div className="flex flex-col gap-2 text-gray-300 text-sm">
              <span>Botswana (Bank Base)</span>
              <span>Zimbabwe (Export Lane)</span>
              <span>Tanzania (Scale Lane)</span>
            </div>
            <div className="mt-6">
              <Link
                href="/apply"
                className="inline-block text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth shadow-sm hover:shadow-md"
                style={{ background: '#5DB347' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#449933')}
                onMouseLeave={e => (e.currentTarget.style.background = '#5DB347')}
              >
                Join AFU Today
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} African Farming Union (AFU). All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
