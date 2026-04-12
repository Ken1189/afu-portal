import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Star, ArrowLeft, Package, Truck, Shield, Award, MapPin } from 'lucide-react';
import ProductDetailClient from './ProductDetailClient';

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  member_price: number | null;
  currency: string | null;
  unit: string | null;
  image_url: string | null;
  image: string | null;
  images: string[] | null;
  in_stock: boolean | null;
  stock_quantity: number | null;
  rating: number | null;
  review_count: number | null;
  tags: string[] | null;
  supplier_id: string | null;
  supplier_name: string | null;
  brand: string | null;
}

interface SupplierRow {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  rating: number | null;
  country: string | null;
}

async function getProduct(id: string): Promise<{ product: ProductRow | null; supplier: SupplierRow | null }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: product } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (!product) return { product: null, supplier: null };

    let supplier: SupplierRow | null = null;
    if (product.supplier_id) {
      const { data } = await supabase
        .from('suppliers')
        .select('id, company_name, logo_url, rating, country')
        .eq('id', product.supplier_id)
        .maybeSingle();
      supplier = data || null;
    }
    return { product: product as ProductRow, supplier };
  } catch {
    return { product: null, supplier: null };
  }
}

async function getRelatedProducts(category: string | null, excludeId: string): Promise<ProductRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const query = supabase.from('products').select('*').neq('id', excludeId).limit(4);
    if (category) query.eq('category', category);
    const { data } = await query;
    return (data || []) as ProductRow[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { product } = await getProduct(id);
  if (!product) return { title: 'Product not found · AFU Marketplace' };
  const image = product.image_url || product.image || undefined;
  return {
    title: `${product.name} · AFU Marketplace`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} on AFU Marketplace`,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: image ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { product, supplier } = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Product not found</h1>
          <p className="text-sm text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-semibold hover:bg-[#449933] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const related = await getRelatedProducts(product.category, product.id);

  const heroImage = product.image_url || product.image || 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800';
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [heroImage];
  const memberPrice = product.member_price || product.price * 0.9;
  const inStock = product.in_stock !== false;
  const stockLabel = !inStock
    ? { text: 'Out of Stock', cls: 'bg-red-100 text-red-700' }
    : (product.stock_quantity != null && product.stock_quantity < 10)
      ? { text: `Limited (${product.stock_quantity} left)`, cls: 'bg-amber-100 text-amber-700' }
      : { text: 'In Stock', cls: 'bg-green-100 text-green-700' };

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: heroImage,
    sku: product.id,
    brand: { '@type': 'Brand', name: supplier?.company_name || product.supplier_name || product.brand || 'AFU' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.review_count || 1,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#5DB347] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3">
            <Image src={heroImage} alt={product.name} className="w-full h-[400px] object-cover" width={800} height={400} unoptimized />
          </div>
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.slice(0, 4).map((img, i) => (
                <div key={i} className="relative bg-white rounded-xl border border-gray-100 overflow-hidden h-20">
                  <Image src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" fill unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="text-[11px] uppercase tracking-wider text-[#5DB347] font-bold mb-2">
              {product.category}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B2A4A] mb-3">{product.name}</h1>

          {product.rating != null && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${n <= Math.round(Number(product.rating))
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#1B2A4A]">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.review_count || 0} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex items-end gap-3 mb-2">
              <p className="text-3xl font-extrabold text-[#1B2A4A]">
                ${Number(product.price).toFixed(2)}
              </p>
              {product.unit && <p className="text-sm text-gray-400 mb-1">{product.unit}</p>}
            </div>
            <p className="text-sm text-[#5DB347] font-semibold mb-3">
              Member price: ${Number(memberPrice).toFixed(2)}
            </p>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${stockLabel.cls}`}>
              {stockLabel.text}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A] mb-2">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Supplier card */}
          {(supplier || product.supplier_name) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <h2 className="text-sm font-bold text-[#1B2A4A] mb-3">Sold by</h2>
              <div className="flex items-center gap-3">
                {supplier?.logo_url ? (
                  <Image src={supplier.logo_url} alt={supplier.company_name || ''} className="w-12 h-12 rounded-xl object-cover" width={48} height={48} unoptimized />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#5DB347]" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-[#1B2A4A]">
                    {supplier?.company_name || product.supplier_name || product.brand || 'AFU Supplier'}
                  </p>
                  {supplier?.country && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {supplier.country}
                    </p>
                  )}
                </div>
                {supplier?.id && (
                  <Link
                    href={`/suppliers/${supplier.id}`}
                    className="text-xs text-[#5DB347] font-semibold hover:underline"
                  >
                    View Profile
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Buy Now (client component) */}
          <ProductDetailClient
            productId={product.id}
            productName={product.name}
            price={Number(product.price)}
            inStock={inStock}
          />

          {/* Delivery info */}
          <div className="bg-[#FAF8F3] rounded-2xl border border-gray-100 p-5 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-[#5DB347]" />
              <h3 className="font-bold text-[#1B2A4A] text-sm">Delivery Information</h3>
            </div>
            <p className="text-xs text-gray-600">
              Pan-African delivery available. Estimated 5-14 days depending on destination.
              Tracking provided after dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-6">Related Products</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/marketplace/${p.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  <Image
                    src={p.image_url || p.image || 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    fill
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-[#1B2A4A] line-clamp-2 mb-2">{p.name}</h3>
                  <p className="text-lg font-extrabold text-[#1B2A4A]">${Number(p.price).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust footer */}
      <section className="bg-white border-t border-gray-100 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#5DB347]" /> Verified Suppliers
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#5DB347]" /> Pan-African Delivery
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#5DB347]" /> Member Discounts
          </div>
        </div>
      </section>
    </div>
  );
}
