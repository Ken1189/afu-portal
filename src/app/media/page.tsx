'use client';

import { useState, useEffect, useCallback } from 'react';
import { Newspaper, ExternalLink, Star, Loader2, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface MediaArticle {
  id: string;
  title: string;
  publication: string;
  article_url: string | null;
  excerpt: string | null;
  image_url: string | null;
  published_date: string | null;
  article_type: string;
  country: string | null;
  tags: string[];
  is_featured: boolean;
}

const TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'press', label: 'Press' },
  { key: 'blog_feature', label: 'Blog Features' },
  { key: 'tv', label: 'TV' },
  { key: 'radio', label: 'Radio' },
  { key: 'podcast', label: 'Podcast' },
  { key: 'award', label: 'Awards' },
];

const TYPE_COLORS: Record<string, string> = {
  press: 'bg-blue-100 text-blue-700',
  blog_feature: 'bg-purple-100 text-purple-700',
  tv: 'bg-red-100 text-red-700',
  radio: 'bg-amber-100 text-amber-700',
  podcast: 'bg-green-100 text-green-700',
  award: 'bg-yellow-100 text-yellow-700',
};

const TYPE_LABELS: Record<string, string> = {
  press: 'Press',
  blog_feature: 'Blog Feature',
  tv: 'TV',
  radio: 'Radio',
  podcast: 'Podcast',
  award: 'Award',
};

function formatDate(date: string | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MediaPage() {
  const [articles, setArticles] = useState<MediaArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');

  const supabase = createClient();

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media_articles')
      .select('*')
      .eq('visible', true)
      .order('published_date', { ascending: false });

    if (!error && data) {
      setArticles(data as MediaArticle[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const featured = articles.filter((a) => a.is_featured);
  const filtered = activeType === 'all'
    ? articles
    : articles.filter((a) => a.article_type === activeType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#1B2A4A]/90 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#5DB347]/20 mb-4">
            <Newspaper className="w-7 h-7 text-[#5DB347]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Media & Press</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            AFU in the news
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No articles yet</h3>
            <p className="text-sm text-gray-500">Check back soon for AFU media coverage.</p>
          </div>
        ) : (
          <>
            {/* Featured Articles */}
            {featured.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-6">Featured</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featured.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {article.image_url && (
                        <div className="relative aspect-[16/9]">
                          <Image
                            src={article.image_url}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-[#5DB347] uppercase tracking-wider">
                            {article.publication}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[article.article_type] || 'bg-gray-100 text-gray-600'}`}>
                            {TYPE_LABELS[article.article_type] || article.article_type}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1B2A4A] mb-2 line-clamp-2">{article.title}</h3>
                        {article.excerpt && (
                          <p className="text-sm text-gray-500 mb-4 line-clamp-3">{article.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{formatDate(article.published_date)}</span>
                          {article.article_url && (
                            <a
                              href={article.article_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5DB347] hover:text-[#4a9a39]"
                            >
                              Read Article <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveType(f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeType === f.key
                      ? 'bg-[#5DB347] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* All articles grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No articles in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {article.image_url && (
                      <div className="relative aspect-[16/9]">
                        <Image
                          src={article.image_url}
                          alt={article.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-[#1B2A4A] uppercase tracking-wider">
                          {article.publication}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[article.article_type] || 'bg-gray-100 text-gray-600'}`}>
                          {TYPE_LABELS[article.article_type] || article.article_type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#1B2A4A] mb-1 line-clamp-2">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{formatDate(article.published_date)}</span>
                          {article.country && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {article.country}
                            </span>
                          )}
                        </div>
                        {article.article_url && (
                          <a
                            href={article.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#5DB347] hover:text-[#4a9a39]"
                          >
                            Read <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA: Press Enquiries */}
        <section className="mt-16 mb-8">
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#1B2A4A]/90 rounded-2xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Press Enquiries</h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Interested in covering AFU or need a comment for your story? Get in touch with our communications team.
            </p>
            <Link
              href="/contact?subject=press"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5DB347] text-white font-medium hover:bg-[#4a9a39] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
