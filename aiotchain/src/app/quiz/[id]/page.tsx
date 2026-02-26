"use client";

import { fetchAPI } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Crown, Lock, Play, Star } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Lesson {
  id: number;
  title: string;
  type: string;
}

interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  thumbnail: string;
  userCount: number;
  isPremium: boolean;
  chapters: Chapter[];
}

interface Review {
  id: number;
  user_id: number;
  username: string;
  content: string;
  rating: number;
  created_at: string;
}

export default function CourseIntroPage() {
  const { id } = useParams();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Fetch Path Detail
    fetchAPI<LearningPath>(`/learning-paths/${id}`)
      .then(setPath)
      .catch((err) => console.error("Error fetching course:", err))
      .finally(() => setLoading(false));

    // 2. Fetch User Role
    if (isLoggedIn()) {
        fetchAPI<{ role: string }>("/auth/me")
            .then(user => setUserRole(user.role))
            .catch(err => console.error("Error fetching user:", err));
    }

    // 3. Fetch Reviews
    fetchAPI<Review[]>(`/learning-paths/${id}/comments`)
      .then(res => setReviews(res || []))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSubmitting(true);
    try {
      await fetchAPI("/comments", {
        method: "POST",
        body: JSON.stringify({
          content: newContent,
          learning_path_id: Number(id),
          rating: newRating,
        }),
      });
      // Refresh reviews
      const updatedReviews = await fetchAPI<Review[]>(`/learning-paths/${id}/comments`);
      setReviews(updatedReviews || []);
      setShowReviewModal(false);
      setNewContent("");
      setNewRating(5);
    } catch (err) {
      alert("Gagal mengirim ulasan: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnroll = () => {
    if (!isLoggedIn()) {
      router.push(`/login?redirect=/quiz/${id}`);
      return;
    }

    // Access Control Logic
    if (path?.isPremium && userRole !== "pro" && userRole !== "admin") {
        router.push("/pricing");
        return;
    }

    if (path?.chapters && path.chapters.length > 0 && path.chapters[0].lessons.length > 0) {
      router.push(`/quiz/${id}/${path.chapters[0].lessons[0].id}`);
    } else {
      alert("Kelas ini belum memiliki materi.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-bold">Memuat kelas...</div>;
  if (!path) return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-bold">Kelas tidak ditemukan.</div>;

  const isLocked = path.isPremium && userRole !== "pro" && userRole !== "admin";

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-foreground text-background py-20 relative overflow-hidden mt-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white">{path.difficulty}</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300">{path.duration} Menit</span>
              {path.isPremium && (
                 <span className="px-3 py-1 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                     <Crown className="w-3 h-3" /> Premium
                 </span>
              )}
            </div>
            <h1 className="text-5xl font-black mb-6 leading-tight text-background">{path.title}</h1>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-xl">
              {path.description}
            </p>
            <button 
              onClick={handleEnroll}
              className={`px-12 py-5 rounded-2xl font-black text-lg transition shadow-2xl active:scale-95 flex items-center gap-3 ${
                  isLocked 
                  ? "bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30"
              }`}
            >
              {isLocked ? (
                  <>
                    <Lock className="w-5 h-5" />
                    Unlock with PRO
                  </>
              ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Mulai Belajar
                  </>
              )}
            </button>
          </div>
          <div className="aspect-video bg-muted rounded-[40px] overflow-hidden shadow-2xl border-8 border-muted/50 relative group">
            {path.thumbnail && (
               <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${path.thumbnail}`} className="w-full h-full object-cover" />
            )}
             {path.isPremium && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                        <Lock className="w-8 h-8 text-black" />
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Syllabus / Chapters */}
        <div className="lg:col-span-2 space-y-12">
          <h2 className="text-3xl font-black text-foreground">Kurikulum Kelas</h2>
          <div className="space-y-4">
            {path.chapters?.map((chapter, idx) => (
              <div key={chapter.id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-card shadow-sm flex items-center justify-center font-black text-muted-foreground border border-border">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-black text-foreground text-xl">{chapter.title}</h3>
                      <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">{chapter.lessons?.length || 0} Modul</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  {chapter.lessons?.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition group">
                      <div className={`w-2 h-2 rounded-full transition-colors ${isLocked ? "bg-amber-500" : "bg-blue-600"}`}></div>
                      <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">{lesson.title}</span>
                      <div className="ml-auto flex items-center gap-3">
                         <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{lesson.type === 'material' ? 'Materi' : 'Kuis'}</span>
                         {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Reviews Section */}
          <div className="space-y-8 pt-12 border-t border-border">
             <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-foreground">Ulasan Siswa</h2>
                <div className="flex items-center gap-2">
                   <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                   <span className="text-2xl font-black text-foreground">
                      {reviews?.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                   </span>
                   <span className="text-muted-foreground font-medium">({reviews?.length || 0} Ulasan)</span>
                </div>
             </div>
             
             <div className="space-y-6">
                {(reviews?.length || 0) === 0 ? (
                  <div className="bg-muted/30 rounded-3xl p-12 text-center">
                    <p className="text-muted-foreground font-medium">Belum ada ulasan untuk kelas ini. Jadilah yang pertama memberikan ulasan!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-card p-8 rounded-3xl border border-border space-y-4">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {review.username.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <p className="font-bold text-foreground">{review.username}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black">
                                   {new Date(review.created_at).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric"
                                   })}
                                </p>
                             </div>
                          </div>
                          <div className="flex gap-0.5">
                             {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                             ))}
                          </div>
                       </div>
                       <p className="text-foreground leading-relaxed font-medium">"{review.content}"</p>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card p-8 rounded-[40px] border border-border shadow-sm space-y-8">
            <h3 className="font-black text-foreground">Tentang Kelas</h3>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                 </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Siswa Terdaftar</p>
                    <p className="font-bold text-foreground">{path.userCount} Orang</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Akses</p>
                    <p className="font-bold text-foreground">Selamanya</p>
                  </div>
               </div>
                {path.isPremium && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                         <Crown className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                         <div>
                             <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-1">Konten Premium</p>
                             <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                 Kelas ini eksklusif untuk member PRO. Dapatkan akses ke materi mendalam dan sertifikat profesional.
                             </p>
                         </div>
                    </div>
                )}
            </div>
            {!isLocked && (
                <button 
                  onClick={() => {
                    if (!isLoggedIn()) {
                      router.push(`/login?redirect=/quiz/${id}`);
                      return;
                    }
                    setShowReviewModal(true);
                  }}
                  className="w-full py-4 bg-foreground text-background rounded-2xl font-bold hover:bg-foreground/90 transition shadow-lg active:scale-95"
                >
                  Beri Ulasan
                </button>
            )}
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-[40px] border border-border shadow-2xl p-8 sm:p-12 space-y-8 animate-in zoom-in-95 duration-200">
             <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-foreground tracking-tight">Beri Ulasan</h2>
                <p className="text-muted-foreground font-medium">Bagikan pengalaman belajar Anda di kelas ini.</p>
             </div>
             
             <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="flex justify-center gap-2">
                   {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        type="button"
                        onClick={() => setNewRating(s)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                         <Star className={`w-8 h-8 ${s <= newRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                      </button>
                   ))}
                </div>
                
                <textarea 
                  required
                  placeholder="Ceritakan apa yang Anda sukai dari kelas ini..."
                  className="w-full p-6 rounded-3xl bg-muted border border-border text-foreground focus:ring-2 focus:ring-blue-600 transition-all h-32 outline-none font-medium"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                
                <div className="flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setShowReviewModal(false)}
                     className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                   >
                      Batal
                   </button>
                   <button 
                     type="submit"
                     disabled={submitting}
                     className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                   >
                      {submitting ? "Mengirim..." : "Kirim Ulasan"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}