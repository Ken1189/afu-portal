import Link from 'next/link';
import Image from 'next/image';
import { Sprout, ArrowRight, Wheat, Cherry, Carrot, Factory, Leaf } from 'lucide-react';
import { CROPS, CROP_CATEGORIES } from './cropData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crops & Agriculture - African Farming Union',
  description:
    'Explore 25+ crops grown across Africa with AFU support. From maize and coffee to blueberries and sesame — learn about growing conditions, market data, and how AFU helps farmers succeed.',
  openGraph: {
    title: 'Crops & Agriculture - African Farming Union',
    description:
      'Explore 25+ crops grown across Africa with AFU support. Grains, cash crops, fruits, vegetables, and industrial crops with real market data.',
    url: 'https://africanfarmingunion.org/farming/crops',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'African agriculture — crops and farming',
      },
    ],
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  Grains: <Wheat className="w-5 h-5" />,
  'Cash Crops': <Leaf className="w-5 h-5" />,
  'Fruits & Nuts': <Cherry className="w-5 h-5" />,
  Vegetables: <Carrot className="w-5 h-5" />,
  'Industrial Crops': <Factory className="w-5 h-5" />,
};

const categoryDescriptions: Record<string, string> = {
  Grains: 'Staple cereals that form the backbone of African food security and agricultural trade.',
  'Cash Crops': 'High-value export commodities connecting African farmers to global markets.',
  'Fruits & Nuts': 'Premium horticultural products with surging demand in Europe, Asia, and the Middle East.',
  Vegetables: 'Essential food crops serving domestic markets with growing processing and export potential.',
  'Industrial Crops': 'Oilseeds and legumes powering Africa\'s animal feed, cooking oil, and manufacturing sectors.',
};

export default function CropsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80"
            alt="African farmland stretching to the horizon"
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="flex items-center gap-2 text-green-light mb-4">
            <Sprout className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">AFU Crop Library</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
            Crops &amp; Agriculture
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
            From staple grains to premium export fruit, explore the crops that AFU supports across
            Africa. Each crop page covers growing conditions, market data, key regions, and how
            AFU helps farmers succeed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {CROP_CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`#${cat.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                {categoryIcons[cat]}
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Banner ─── */}
      <section className="bg-green-light border-b border-green/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: `${CROPS.length}+`, label: 'Crops Supported' },
              { value: '20', label: 'Countries' },
              { value: '5', label: 'Crop Categories' },
              { value: '$50B+', label: 'Annual African Market Value' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl md:text-3xl font-bold text-navy">{value}</p>
                <p className="text-sm text-navy/60 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Crop Categories & Cards ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {CROP_CATEGORIES.map((category) => {
          const crops = CROPS.filter((c) => c.category === category);
          const anchor = category.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');
          return (
            <div key={category} id={anchor} className="mb-20 last:mb-0 scroll-mt-24">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-light text-green">
                  {categoryIcons[category]}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-navy">{category}</h2>
              </div>
              <p className="text-gray-500 mb-8 ml-13 max-w-2xl">
                {categoryDescriptions[category]}
              </p>

              {/* Crop Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.map((crop) => (
                  <Link
                    key={crop.slug}
                    href={`/farming/crops/${crop.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={crop.image}
                        alt={`${crop.name} farming in Africa`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-medium text-navy">
                        {categoryIcons[crop.category]}
                        {crop.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-semibold text-navy group-hover:text-green transition-colors">
                        {crop.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {crop.description}
                      </p>

                      {/* Top Countries */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {crop.topCountries.slice(0, 3).map((country) => (
                          <span
                            key={country}
                            className="rounded-full bg-cream px-2.5 py-0.5 text-xs text-navy/70"
                          >
                            {country}
                          </span>
                        ))}
                        {crop.topCountries.length > 3 && (
                          <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs text-navy/70">
                            +{crop.topCountries.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Link */}
                      <div className="mt-auto pt-4 flex items-center gap-1.5 text-sm font-medium text-green group-hover:text-green-dark transition-colors">
                        Learn more
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to grow with AFU?</h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Whether you grow maize on 2 hectares or manage a 500-hectare commercial operation,
            AFU provides the financing, insurance, inputs, and market access you need to succeed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 rounded-lg bg-green px-6 py-3 text-base font-semibold text-white hover:bg-green-dark transition-colors"
            >
              Join AFU Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
