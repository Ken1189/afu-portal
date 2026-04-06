'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, User, Tag, ArrowRight, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  author_name: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
  featured_image_url: string | null;
}

const FALLBACK_POSTS: BlogPost[] = [];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(FALLBACK_POSTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const supabase = createClient();
        // Try blog_posts table first (proper table)
        const { data: blogData } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (blogData && blogData.length > 0) {
          setPosts(blogData.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            title: (p.title as string) || '',
            slug: (p.slug as string) || (p.id as string),
            excerpt: (p.excerpt as string) || ((p.body || p.content) as string)?.substring(0, 160) || null,
            content: (p.content as string) || (p.body as string) || null,
            author_name: (p.author_name as string) || 'AFU Editorial',
            category: (p.category as string) || null,
            published_at: (p.published_at as string) || (p.created_at as string) || null,
            created_at: (p.created_at as string) || '',
            featured_image_url: (p.cover_image as string) || null,
          })));
        } else {
          // Fallback to site_content
          const { data } = await supabase.from('site_content').select('*').eq('content_type', 'blog_post').order('updated_at', { ascending: false });
          if (data && data.length > 0) {
            setPosts(data.map((p: Record<string, unknown>) => ({
              id: p.id as string, title: (p.title as string) || '', slug: (p.slug as string) || (p.id as string),
              excerpt: (p.excerpt as string) || null, content: (p.content as string) || null,
              author_name: (p.author_name as string) || null, category: (p.category as string) || null,
              published_at: (p.published_at as string) || (p.created_at as string) || null,
              created_at: (p.created_at as string) || '', featured_image_url: (p.featured_image_url as string) || null,
            })));
          }
        }
      } catch {
        // keep fallback (empty)
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        className="relative py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            AFU Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            News &amp; Insights
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Stories from the field, updates on our mission, and insights into African agriculture.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#5DB347] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-[#1B2A4A] mb-2">Coming Soon</h2>
            <p className="text-gray-500">
              We are preparing our first posts. Check back soon for stories from the field.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block">
              <article
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
              >
                {post.featured_image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  {post.category && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5DB347] mb-2">
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2 leading-snug">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      {post.author_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author_name}
                        </span>
                      )}
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.published_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
