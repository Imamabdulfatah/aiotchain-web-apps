"use client";

import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  thumbnail: string;
  userCount: number;
  isPremium: boolean;
}

export default function QuizListPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Semua");
  const router = useRouter();

  useEffect(() => {
    fetchAPI<LearningPath[]>("/learning-paths")
      .then(setPaths)
      .catch((err) => console.error("Error fetching learning paths:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleStartPath = async (pathId: number) => {
    router.push(`/quiz/${pathId}`);
  };

  const filteredPaths = paths.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "Semua" || p.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-muted pb-32 transition-colors duration-300">
      <Navbar />
      
      {/* Premium Hero Header */}
      <header className="pt-32 pb-40 bg-slate-950 text-white relative overflow-hidden">
        {/* Abstract Background Decorations */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-indigo-600/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Akademi AIoT Specialist
            </div>
            <h1 className="text-7xl font-black mb-8 leading-[1.05] tracking-tight">
              Investasi Terbaik Adalah <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Investasi Leher ke Atas.</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl font-medium leading-relaxed">
              Kuasai kurikulum teknologi masa depan yang disusun oleh para praktisi industri top Indonesia. Mulai dari nol hingga siap kerja.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-24 relative z-20 space-y-12">
        {/* Search & Filter Bar */}
        <div className="bg-card p-4 rounded-[32px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-border flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari alur belajar (misal: IoT, AI, ESP32...)" 
              className="w-full pl-16 pr-8 py-5 bg-background rounded-2xl border border-border focus:ring-2 focus:ring-blue-600 transition-all font-bold text-foreground placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 px-2">
            {["Semua", "Pemula", "Menengah", "Mahir"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedDifficulty === diff 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30" 
                    : "bg-background text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-[48px] h-[500px] animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : filteredPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPaths.map((path) => (
              <div 
                key={path.id} 
                className="bg-card rounded-[48px] shadow-sm border border-border overflow-hidden flex flex-col hover:shadow-2xl dark:hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-700 group cursor-pointer"
                onClick={() => handleStartPath(path.id)}
              >
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                  {path.thumbnail ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${path.thumbnail}`} 
                      alt={path.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  {path.isPremium && (
                      <div className="absolute top-8 right-8">
                         <span className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg text-white">
                             <Lock className="w-5 h-5" />
                         </span>
                      </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                     <span className="text-white font-black text-sm uppercase tracking-widest">Detail Kurikulum &rarr;</span>
                  </div>
                  <div className="absolute top-8 left-8">
                    <span className="px-5 py-2 bg-card/90 backdrop-blur-xl rounded-full text-[10px] font-black text-foreground uppercase tracking-widest shadow-xl border border-border">
                      {path.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-12 flex flex-col flex-grow">
                  <h2 className="text-3xl font-black text-foreground mb-6 leading-tight group-hover:text-blue-600 transition-colors">
                    {path.title}
                  </h2>
                  <p className="text-muted-foreground text-base mb-10 leading-relaxed line-clamp-2">
                    {path.description}
                  </p>

                  <div className="mt-auto space-y-8">
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Durasi</p>
                          <p className="font-bold text-foreground">{path.duration}m</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Siswa</p>
                          <p className="font-bold text-foreground">{path.userCount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-6 bg-slate-900 dark:bg-blue-600 text-white rounded-[28px] font-black hover:bg-blue-600 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-4 text-lg">
                      Mulai Belajar
                      <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 space-y-6">
             <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto text-slate-300">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
               <h3 className="text-2xl font-black text-slate-900">Alur tidak ditemukan</h3>
               <p className="text-slate-400 font-medium">Coba gunakan kata kunci pencarian yang lain.</p>
             </div>
          </div>
        )}
      </main>

      {/* Motivational Section */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
         <div className="bg-gradient-to-[32deg] from-blue-700 to-indigo-900 rounded-[56px] p-20 text-white flex flex-col items-center text-center space-y-12">
            <h2 className="text-5xl font-black tracking-tight leading-tight max-w-4xl">
              Siap Menjadi Specialist Teknologi <span className="underline decoration-blue-400 decoration-8 underline-offset-8 italic">Masa Depan?</span>
            </h2>
            <p className="text-blue-100 text-xl font-medium max-w-2xl opacity-80">
              Ribuan siswa telah memulai karir mereka di sini. Kurikulum kami diakui oleh berbagai perusahaan teknologi ternama.
            </p>
            <div className="flex flex-wrap gap-12 justify-center opacity-60">
               <span className="font-black text-2xl tracking-widest italic">INTEL</span>
               <span className="font-black text-2xl tracking-widest italic">CISCO</span>
               <span className="font-black text-2xl tracking-widest italic">NVIDIA</span>
               <span className="font-black text-2xl tracking-widest italic">MICROSOFT</span>
            </div>
         </div>
      </section>
    </div>
  );
}