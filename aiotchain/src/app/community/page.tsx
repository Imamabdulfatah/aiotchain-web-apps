"use client";

import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Thread {
  id: number;
  title: string;
  category: string;
  image_url: string;
  username: string;
  comment_count: number;
  created_at: string;
}

export default function CommunityPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isLogged, setIsLogged] = useState(false);

  const categories = ["Semua", "Diskusi", "Tanya Jawab", "Project", "Showcase", "Hardware", "Software"];

  useEffect(() => {
    setIsLogged(isLoggedIn());
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      const categoryParam = selectedCategory !== "Semua" ? `&category=${selectedCategory}` : "";
      fetchAPI<Thread[]>(`/threads?q=${searchQuery}${categoryParam}`)
        .then((data) => setThreads(data || []))
        .catch((err) => console.error("Error fetching threads:", err))
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <Navbar />
      
      {/* Header Komunitas */}
      <header className="py-20 bg-muted border-b border-border mb-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Komunitas <span className="text-blue-600">AIoT Chain</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Tempat berkumpulnya para inovator. Bagikan ide, tanyakan solusi, dan berkolaborasi dalam ekosistem AI dan IoT.
              </p>
            </div>
            
            {isLogged ? (
              <Link
                href="/community/new"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Mulai Diskusi
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-foreground text-background rounded-2xl font-bold hover:bg-foreground/90 transition-all"
              >
                Login untuk Diskusi
              </Link>
            )}
          </div>
          
          <div className="mt-12 max-w-2xl">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari topik diskusi..." 
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
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
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

      {/* List Diskusi */}
      <main className="max-w-5xl mx-auto px-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="animate-pulse bg-card border border-border p-6 rounded-2xl h-24"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(threads && threads.length > 0) ? (
              threads.map((thread) => (
                <Link 
                  key={thread.id} 
                  href={`/community/${thread.id}`}
                  className="group bg-card border border-border p-6 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-6">
                    {thread.image_url && (
                      <div className="hidden sm:block w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-border group-hover:border-blue-500/50 transition-colors bg-muted">
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${thread.image_url}`} 
                          alt={thread.title} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 text-xs">
                        <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider rounded-md">
                          {thread.category || "Diskusi"}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          oleh <span className="text-foreground">{thread.username}</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <time className="text-muted-foreground">
                          {new Date(thread.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </time>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors mb-3">
                        {thread.title}
                      </h2>
                      {thread.image_url && (
                        <div className="sm:hidden w-full aspect-video rounded-xl overflow-hidden mb-4 border border-border">
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${thread.image_url}`} 
                            alt={thread.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl text-muted-foreground h-fit self-start group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm font-bold">{thread.comment_count}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">Belum ada diskusi</h3>
                <p className="text-muted-foreground mt-2">Jadilah yang pertama untuk memulai percakapan.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
