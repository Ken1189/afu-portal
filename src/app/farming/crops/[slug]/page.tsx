import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Sprout,
  ArrowRight,
  ArrowLeft,
  Sun,
  Droplets,
  Mountain,
  Layers,
  MapPin,
  BarChart3,
  TrendingUp,
  Globe2,
  ShieldCheck,
  Banknote,
  GraduationCap,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { CROPS, getCropBySlug } from '../cropData';
import type { Metadata } from 'next';

/* ─── Static Params for SSG ─── */
export function generateStaticParams() {
  return CROPS.map((crop) => ({ slug: crop.slug }));
}

/* ─── Dynamic Metadata for SEO ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const crop = getCropBySlug(slug);
  if (!crop) {
    return { title: 'Crop Not Found - AFU' };
  }

  const title = `${crop.name} Farming in Africa - African Farming Union`;
  const description = `Learn about growing ${crop.name.toLowerCase()} in Africa. Growing conditions, key regions, market data, and how AFU supports ${crop.name.toLowerCase()} farmers across ${crop.regions.slice(0, 3).join(', ')}, and more.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://africanfarmingunion.org/farming/crops/${crop.slug}`,
      images: [
        {
          url: crop.image.replace('w=800', 'w=1200').replace('q=80', 'q=85'),
          width: 1200,
          height: 630,
          alt: `${crop.name} farming in Africa`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/* ─── Page Component ─── */
export default async function CropDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const crop = getCropBySlug(slug);

  if (!crop) {
    notFound();
  }

  // Find related crops in the same category
  const relatedCrops = CROPS.filter(
    (c) => c.category === crop.category && c.slug !== crop.slug
  ).slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0">
          <Image
            src={crop.image.replace('w=800', 'w=1600')}
            alt={`${crop.name} farming in Africa`}
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-navy/40 to-navy" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/farming/crops" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              All Crops
            </Link>
            <span>/</span>
            <span className="text-green-light">{crop.category}</span>
            <span>/</span>
            <span className="text-white">{crop.name}</span>
          </nav>

          <div className="flex items-center gap-2 text-green-light mb-4">
            <Sprout className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">{crop.category}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {crop.name}
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-300 max-w-3xl">
            {crop.tagline}
          </p>

          {/* Quick Stats */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <MapPin className="w-5 h-5" />, label: 'Regions', value: `${crop.regions.length} countries` },
              { icon: <BarChart3 className="w-5 h-5" />, label: 'Avg Yield', value: crop.marketData.avgYield.split('(')[0].trim() },
              { icon: <TrendingUp className="w-5 h-5" />, label: 'Price Range', value: crop.marketData.priceRange.split('(')[0].trim() },
              { icon: <Globe2 className="w-5 h-5" />, label: 'Export Markets', value: `${crop.marketData.exportMarkets.length}+ destinations` },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="rounded-lg bg-white/10 backdrop-blur border border-white/10 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-green-light mb-1">
                  {icon}
                  <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Overview ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
            Overview
          </h2>
          <p className="text-sm text-green font-medium uppercase tracking-wider mb-6">
            {crop.name} in the African context
          </p>
          <div className="space-y-5">
            {crop.overview.map((paragraph, i) => (
              <p key={i} className="text-gray-600 leading-relaxed text-base md:text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Growing Conditions ─── */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
            Growing Conditions
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            What {crop.name.toLowerCase()} needs to thrive in African farming systems.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Sun className="w-6 h-6" />,
                label: 'Climate',
                value: crop.growingConditions.climate,
                color: 'bg-orange-50 text-orange-600',
              },
              {
                icon: <Layers className="w-6 h-6" />,
                label: 'Soil',
                value: crop.growingConditions.soil,
                color: 'bg-amber-50 text-amber-700',
              },
              {
                icon: <Mountain className="w-6 h-6" />,
                label: 'Altitude',
                value: crop.growingConditions.altitude,
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: <Droplets className="w-6 h-6" />,
                label: 'Rainfall',
                value: crop.growingConditions.rainfall,
                color: 'bg-cyan-50 text-cyan-600',
              },
            ].map(({ icon, label, value, color }) => (
              <div
                key={label}
                className="rounded-xl bg-white border border-gray-100 p-6 shadow-card"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} mb-4`}>
                  {icon}
                </div>
                <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-2">
                  {label}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Key Growing Regions ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
          Key Growing Regions
        </h2>
        <p className="text-gray-500 mb-10 max-w-2xl">
          AFU countries where {crop.name.toLowerCase()} is commercially grown and supported.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crop.regions.map((region, i) => (
            <Link
              key={region}
              href={`/countries/${region.toLowerCase().replace(/\s+/g, '-')}`}
              className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-light text-green font-bold text-lg">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy group-hover:text-green transition-colors">
                  {region}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">View country profile</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green transition-all group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Market Data ─── */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Market Data</h2>
          <p className="text-gray-400 mb-10 max-w-2xl">
            Key market figures for {crop.name.toLowerCase()} production and trade in Africa.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Yield */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green/20 text-green">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                  Average Yield
                </h3>
              </div>
              <p className="text-xl font-bold text-white">{crop.marketData.avgYield}</p>
            </div>

            {/* Price */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold/20 text-gold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                  Price Range
                </h3>
              </div>
              <p className="text-xl font-bold text-white">{crop.marketData.priceRange}</p>
            </div>

            {/* Export Markets */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal/20 text-teal">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                  Export Markets
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {crop.marketData.exportMarkets.map((market) => (
                  <span
                    key={market}
                    className="rounded-full bg-white/10 px-3 py-1 text-sm text-gray-200"
                  >
                    {market}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AFU Support ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
          How AFU Supports {crop.name} Farmers
        </h2>
        <p className="text-gray-500 mb-10 max-w-2xl">
          Our integrated approach helps farmers at every stage of the {crop.name.toLowerCase()} value chain.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Banknote className="w-6 h-6" />,
              title: 'Financing',
              desc: `Input financing and seasonal credit for ${crop.name.toLowerCase()} production, with repayment structured against harvest proceeds.`,
            },
            {
              icon: <ShieldCheck className="w-6 h-6" />,
              title: 'Insurance',
              desc: `Crop insurance protecting ${crop.name.toLowerCase()} farmers against drought, flooding, pest damage, and price volatility.`,
            },
            {
              icon: <GraduationCap className="w-6 h-6" />,
              title: 'Training',
              desc: `Agronomic training, post-harvest handling, and quality management to maximise yields and market value.`,
            },
            {
              icon: <Truck className="w-6 h-6" />,
              title: 'Market Access',
              desc: `Structured offtake contracts, export market connections, and warehouse receipt financing for optimal sales timing.`,
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-card"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-light text-green mb-4">
                {icon}
              </div>
              <h3 className="text-base font-semibold text-navy mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-green-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-navy">
                Start Growing {crop.name} with AFU
              </h2>
              <p className="mt-3 text-gray-600 max-w-lg">
                Join thousands of farmers across Africa who grow {crop.name.toLowerCase()} with AFU
                financing, insurance, training, and guaranteed market access.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/join"
                className="inline-flex items-center gap-2 rounded-lg bg-green px-6 py-3 text-base font-semibold text-white hover:bg-green-dark transition-colors shadow-md"
              >
                Join AFU Today
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-navy/20 bg-white px-6 py-3 text-base font-semibold text-navy hover:bg-gray-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Related Crops ─── */}
      {relatedCrops.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
            More {crop.category}
          </h2>
          <p className="text-gray-500 mb-8">
            Explore other crops in the {crop.category.toLowerCase()} category.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCrops.map((related) => (
              <Link
                key={related.slug}
                href={`/farming/crops/${related.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={related.image}
                    alt={`${related.name} farming`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-navy group-hover:text-green transition-colors">
                    {related.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {related.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-green">
                    Learn more
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/farming/crops"
              className="inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-green transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all crops
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
