"use client";

import AIOManager from "@/components/AIOManager";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import Navbar from "@/components/Navbar";
import ShareButton from "@/components/ShareButton";
import { fetchAPI } from "@/lib/api";
import { formatContent } from "@/lib/utils";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface PostDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  category?: string;
  imageUrl?: string;
  createdAt: string;
  likesCount?: number;
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [recommendations, setRecommendations] = useState<PostDetail[]>([]);
  const [latestPosts, setLatestPosts] = useState<PostDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAPI<PostDetail>(`/posts/slug/${slug}`)
      .then((data) => {
        setPost(data);
        
        // Fetch recommendations (related posts, excluding current)
        fetchAPI<PostDetail[]>("/posts?limit=4")
          .then((posts) => {
            setRecommendations(posts.filter(p => p.id !== data.id).slice(0, 3));
          })
          .catch(console.error);

        // Fetch 5 latest articles for sidebar
        fetchAPI<PostDetail[]>("/posts?limit=5")
          .then(setLatestPosts)
          .catch(console.error);
      })
      .catch(() => router.push("/404"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  useEffect(() => {
    // Highlight code blocks after content is rendered
    if (!loading && post) {
      const blocks = document.querySelectorAll('pre code');
      blocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [post, loading]);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Menyusun artikel...</div>;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      
      {post && (
        <AIOManager 
          title={post.title}
          description={post.content.replace(/<[^>]*>/g, '').substring(0, 160)}
          image={post.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${post.imageUrl}` : undefined}
          url={`https://aiotchain.id/blog/${post.slug}`}
          date={post.createdAt}
          category={post.category}
        />
      )}
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigasi Back */}
        <div className="mb-12">
          <Link href="/blog" className="text-sm font-bold text-muted-foreground hover:text-blue-600 flex items-center gap-2 transition-colors">
            ← Kembali ke Blog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content Column */}
          <article className="lg:col-span-2">
            <header className="pb-8 mb-8 border-b border-border">
              <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
                {post.category || "General"}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-foreground leading-[1.1] mb-8 tracking-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                    {post.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-foreground font-bold">Admin AIOT</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-2xl">
                  <LikeButton initialLikes={post.likesCount || 0} />
                  <ShareButton title={post.title} />
                </div>
              </div>

              {post.imageUrl && (
                <div className="mt-12 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-border">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${post.imageUrl}`} 
                    alt={post.title} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </header>

            <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-img:rounded-3xl">
              <div dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
            </div>

            {/* Recommended Articles Section */}
            {recommendations.length > 0 && (
              <section className="mt-20 pt-16 border-t border-border">
                <h3 className="text-2xl font-black text-foreground mb-8 tracking-tight">Mungkin Anda Suka</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <Link key={rec.id} href={`/blog/${rec.slug}`} className="group block">
                      <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-muted mb-4 border border-border">
                        {rec.imageUrl && (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${rec.imageUrl}`} 
                            alt={rec.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                      </div>
                      <h4 className="font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-snug">
                        {rec.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Comment Section */}
            <div className="mt-20 pt-16 border-t border-border">
              {post.id && <CommentSection postId={post.id} />}
            </div>
          </article>

          {/* Sidebar Column */}
          <aside className="lg:col-span-1 space-y-12">
            <div className="sticky top-32 space-y-10">
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Artikel Terbaru</h3>
                </div>
                <div className="space-y-6">
                  {latestPosts.map((latest) => (
                    <Link key={latest.id} href={`/blog/${latest.slug}`} className="group flex gap-5 items-start">
                      <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-muted border border-border">
                        {latest.imageUrl && (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${latest.imageUrl}`} 
                            alt={latest.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                      </div>
                      <div className="flex flex-col justify-center h-full">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 line-clamp-1">
                          {latest.category || "Tech"}
                        </span>
                        <h4 className="font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-tight mb-2">
                          {latest.title}
                        </h4>
                        <time className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                          {new Date(latest.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </time>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Newsletter or CTA Box */}
              <section className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/30 transition-colors duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-3">Dapatkan Update</h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                    Berlangganan newsletter kami untuk mendapatkan info teknologi terbaru.
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Email anda..." 
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    />
                    <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-500/20">
                      Berlangganan
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}