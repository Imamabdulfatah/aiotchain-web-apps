"use client";

import Navbar from "@/components/Navbar";
import NewsletterSection from "@/components/NewsletterSection";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category?: string;
  imageUrl?: string;
  views: number;
  createdAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const categories = ["Semua", "AI", "IoT", "Chain", "Tutorial", "Wawasan"];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      const categoryParam = selectedCategory !== "Semua" ? `&category=${selectedCategory}` : "";
      fetchAPI<Post[]>(`/posts?q=${searchQuery}${categoryParam}`) 
        .then(setPosts)
        .catch((err) => console.error("Error fetching posts:", err))
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <Navbar />
      {/* Header Blog */}
      <header className="py-20 bg-muted border-b border-border mb-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Wawasan <span className="text-blue-600">Teknologi</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Jelajahi artikel mendalam tentang AI, IoT, dan ekosistem Chain untuk memperluas cakrawala digital Anda.
          </p>
          
          <div className="mt-8 max-w-md">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari artikel..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-foreground font-medium"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-card text-muted-foreground border border-border hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {/* Newsletter Section */}
      <div className="max-w-4xl mx-auto px-6">
        <NewsletterSection />
      </div>

      {/* List Artikel */}
      <main className="max-w-4xl mx-auto px-6">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse flex flex-col space-y-3">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted/50 rounded w-full"></div>
                <div className="h-4 bg-muted/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-16">
            {posts.map((post) => (
              <article key={post.id} className="group flex flex-col space-y-3">
                {post.imageUrl && (
                  <div className="w-full aspect-video overflow-hidden rounded-2xl mb-4">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${post.imageUrl}`} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {post.category || "General"}
                  </span>
                  <time className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </time>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    {post.views || 0} Dibaca
                  </div>
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-blue-600 transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {post.excerpt}
                </p>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-sm font-bold text-foreground hover:text-blue-600 flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                >
                  Baca Selengkapnya <span>→</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}