'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Calendar, User, Tag, Clock, Share2, Loader2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  content: string | null;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string | null;
  category: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
}

function readingTime(text: string) {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const supabase = createClient();
    async function fetchPost() {
      // Try blog_posts table
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) {
        setPost(data as BlogPost);
        // Fetch related posts by same category
        if (data.category) {
          const { data: related } = await supabase
            .from('blog_posts')
            .select('id, title, slug, excerpt, cover_image, published_at, category')
            .eq('status', 'published')
            .eq('category', data.category)
            .neq('slug', slug)
            .limit(3);
          if (related) setRelatedPosts(related as BlogPost[]);
        }
      }
      setLoading(false);
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Post Not Found</h1>
          <p className="text-gray-500 mb-6">This article may have been removed or the link is incorrect.</p>
          <Link href="/blog" className="text-[#5DB347] font-semibold hover:underline">
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const articleContent = post.content || post.body || '';
  const minutes = readingTime(articleContent);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      {post.cover_image && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
              {post.category && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-[#5DB347] text-white mb-3">
                  <Tag className="w-3 h-3" /> {post.category}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{post.title}</h1>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#5DB347] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {!post.cover_image && (
          <>
            {post.category && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-[#5DB347]/10 text-[#5DB347] mb-4">
                <Tag className="w-3 h-3" /> {post.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2A4A] leading-tight mb-4">{post.title}</h1>
          </>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
          {post.author_name && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {post.author_name}
            </span>
          )}
          {(post.published_at || post.created_at) && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {formatDate(post.published_at || post.created_at)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {minutes} min read
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-1.5 hover:text-[#5DB347] transition-colors ml-auto"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Article body */}
        <article className="prose prose-lg max-w-none prose-headings:text-[#1B2A4A] prose-a:text-[#5DB347] prose-strong:text-[#1B2A4A]">
          {articleContent.split('\n').map((paragraph, i) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return <li key={i} className="text-gray-700 leading-relaxed">{trimmed.substring(2)}</li>;
            }
            if (/^\d+\.\s/.test(trimmed)) {
              return <li key={i} className="text-gray-700 leading-relaxed list-decimal">{trimmed.replace(/^\d+\.\s/, '')}</li>;
            }
            if (trimmed.startsWith('#')) {
              const level = trimmed.match(/^#+/)?.[0].length || 2;
              const text = trimmed.replace(/^#+\s*/, '');
              if (level <= 2) return <h2 key={i} className="text-2xl font-bold text-[#1B2A4A] mt-8 mb-4">{text}</h2>;
              return <h3 key={i} className="text-xl font-semibold text-[#1B2A4A] mt-6 mb-3">{text}</h3>;
            }
            return <p key={i} className="text-gray-700 leading-relaxed mb-4">{trimmed}</p>;
          })}
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(rp => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="block group">
                  {rp.cover_image && (
                    <div className="h-32 rounded-xl overflow-hidden mb-3">
                      <img src={rp.cover_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <h3 className="font-semibold text-[#1B2A4A] text-sm group-hover:text-[#5DB347] transition-colors line-clamp-2">{rp.title}</h3>
                  {rp.published_at && <p className="text-xs text-gray-400 mt-1">{formatDate(rp.published_at)}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#1B2A4A] to-[#2A3F6A] rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Join the African Farming Union</h3>
          <p className="text-white/60 text-sm mb-6">Access financing, insurance, marketplace, and training across 9 African countries.</p>
          <Link href="/apply?tier=free" className="inline-flex px-6 py-3 bg-[#5DB347] hover:bg-[#449933] text-white font-semibold rounded-xl transition-colors">
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
