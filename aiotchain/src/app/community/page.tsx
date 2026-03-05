"use client";

import Badge from "@/components/Badge";
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

interface LeaderboardUser {
  user_id: number;
  username: string;
  post_count: number;
  comment_count: number;
  total_score: number;
}

export default function CommunityPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showcaseThreads, setShowcaseThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showcaseLoading, setShowcaseLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isLogged, setIsLogged] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const categories = ["Semua", "Diskusi", "Tanya Jawab", "Project", "Showcase", "Hardware", "Software"];

  useEffect(() => {
    setIsLogged(isLoggedIn());
    // Fetch leaderboard
    setLeaderboardLoading(true);
    fetchAPI<LeaderboardUser[]>("/threads/leaderboard")
      .then(data => setLeaderboard(data || []))
      .catch(err => console.error("Error fetching leaderboard:", err))
      .finally(() => setLeaderboardLoading(false));

    // Fetch showcase projects
    setShowcaseLoading(true);
    fetchAPI<Thread[]>("/threads?category=Showcase")
      .then(data => setShowcaseThreads(data || []))
      .catch(err => console.error("Error fetching showcase:", err))
      .finally(() => setShowcaseLoading(false));
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

  const getRank = (username: string) => {
    return leaderboard.findIndex(u => u.username === username);
  };

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

      {/* Showcase Section - Only shown when "Showcase" category is selected */}
      {selectedCategory === "Showcase" && (
        <section className="max-w-7xl mx-auto px-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-foreground italic uppercase italic">Project Showcase</h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">Karya inovatif dari para expert di komunitas AIoT Chain.</p>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 snap-x">
            {showcaseLoading ? (
              [1, 2, 3].map(n => (
                <div key={n} className="min-w-[300px] md:min-w-[400px] aspect-[16/10] bg-muted animate-pulse rounded-[2.5rem]"></div>
              ))
            ) : showcaseThreads.length > 0 ? (
              showcaseThreads.map((project) => (
                <Link
                  key={project.id}
                  href={`/community/${project.id}`}
                  className="group min-w-[300px] md:min-w-[400px] bg-card border border-border rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 snap-start"
                >
                  <div className="aspect-[16/9] relative overflow-hidden bg-muted border-b border-border">
                    {project.image_url ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${project.image_url}`} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🚀</div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge rank={getRank(project.username)} size="sm" className="shadow-lg backdrop-blur-md bg-opacity-90" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-black text-foreground line-clamp-1 group-hover:text-blue-600 transition-colors mb-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                        Oleh <span className="text-foreground">{project.username}</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span className="text-xs font-bold">{project.comment_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="w-full py-16 text-center bg-muted/30 rounded-[2.5rem] border border-dashed border-border">
                <p className="text-muted-foreground font-bold italic">Belum ada proyek showcase. Jadilah yang pertama!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* List Diskusi */}
        <div className="lg:col-span-8">
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
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 text-xs">
                          <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider rounded-md">
                            {thread.category || "Diskusi"}
                          </span>
                          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            oleh <span className="text-foreground font-bold">{thread.username}</span>
                            <Badge rank={getRank(thread.username)} size="sm" />
                          </span>
                          <span className="text-slate-400">•</span>
                          <time className="text-muted-foreground">
                            {new Date(thread.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                          </time>
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors mb-3">
                          {thread.title}
                        </h2>
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
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Leaderboard */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-card border border-border rounded-3xl p-8 sticky top-32">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-foreground italic uppercase italic">Top Contributors</h3>
              <div className="p-2 bg-blue-600/10 text-blue-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
            </div>

            {leaderboardLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-16 bg-muted animate-pulse rounded-2xl"></div>)}
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((user, idx) => (
                  <div key={user.user_id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{user.username}</span>
                        <Badge rank={idx} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        <span>{user.post_count} Post</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{user.comment_count} Komentar</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-blue-600">{user.total_score}</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Pts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 p-5 bg-blue-600 rounded-2xl text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Kontribusi & Rank</p>
              <p className="text-xs font-medium leading-relaxed">Dapatkan poin dengan memulai diskusi (+10) dan berkomentar (+2) untuk meraih lencana eksklusif.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
