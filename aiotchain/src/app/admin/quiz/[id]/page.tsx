"use client";

import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Question {
  id?: number;
  questionText: string;
  options: string;
  correctAnswer: string;
}

interface Lesson {
  id?: number;
  title: string;
  type: string;
  content: string;
  order: number;
  difficulty?: string;
  duration?: number;
  questions?: Question[];
}

interface Chapter {
  id?: number;
  learningPathId: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  thumbnail: string;
  duration: number;
  certBg: string;
  certColor: string;
  certPdfUrl: string;
  certNameX: number;
  certNameY: number;
  certDateX: number;
  certDateY: number;
  certIdX: number;
  certIdY: number;
  certFontSize: number;
  chapters: Chapter[];
}

export default function PathEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // New Chapter/Lesson states
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");

  const loadPath = async () => {
    try {
      const data = await fetchAPI<LearningPath>(`/learning-paths/${id}`);
      setPath(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadPath();
  }, [id]);

  const handleUpdateBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!path) return;
    setIsSaving(true);
    try {
      const token = getToken();
      await fetchAPI(`/admin/learning-paths/${path.id}`, {
        method: "PUT",
        body: JSON.stringify(path),
      });
      alert("Informasi dasar berhasil diperbarui!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle || !path) return;
    try {
      const token = getToken();
      await fetchAPI("/admin/chapters", {
        method: "POST",
        body: JSON.stringify({
          learningPathId: Number(id),
          title: newChapterTitle,
          order: (path.chapters?.length || 0) + 1
        }),
      });
      setNewChapterTitle("");
      setIsAddingChapter(false);
      loadPath();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!confirm("Hapus bab ini beserta isinya?")) return;
    try {
      const token = getToken();
      await fetchAPI(`/admin/chapters/${chapterId}`, {
        method: "DELETE",
      });
      loadPath();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Hapus materi/kuis ini?")) return;
    try {
      const token = getToken();
      await fetchAPI(`/admin/quizzes/${lessonId}`, {
        method: "DELETE",
      });
      loadPath();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Memuat kurikulum...</div>;
  if (!path) return <div className="p-20 text-center">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
           </button>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Editor Alur Belajar</h1>
        </div>
        <div className="flex gap-4">
           <Link href={`/quiz/${id}`} target="_blank" className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Preview Publik</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Col: Basic Info */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-4">Informasi Utama</h2>
              <form onSubmit={handleUpdateBasicInfo} className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Judul Alur</label>
                   <input 
                      type="text" 
                      value={path.title}
                      onChange={(e) => setPath({...path, title: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi</label>
                   <textarea 
                      rows={5}
                      value={path.description}
                      onChange={(e) => setPath({...path, description: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                   />
                 </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tingkat</label>
                      <select 
                        value={path.difficulty}
                        onChange={(e) => setPath({...path, difficulty: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                      >
                         <option>Pemula</option>
                         <option>Menengah</option>
                         <option>Mahir</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Durasi (Menit)</label>
                      <input 
                        type="number"
                        value={path.duration}
                        onChange={(e) => setPath({...path, duration: Number(e.target.value)})}
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                      />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-50 space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Kustomisasi Sertifikat</label>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden relative group">
                            {path.certBg ? (
                                <img src={path.certBg.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${path.certBg}` : path.certBg} className="w-full h-full object-cover" alt="Cert BG" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 font-black italic">No BG</div>
                            )}
                            <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <span className="text-[8px] font-black text-white uppercase text-center px-2">Ganti</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setIsUploadingCert(true);
                                        const formData = new FormData();
                                        formData.append("image", file);
                                        try {
                                            const data = await fetchAPI<{imageUrl: string}>("/admin/upload", {
                                                method: "POST",
                                                body: formData,
                                                headers: { "Content-Type": undefined as any },
                                            });
                                            if (data.imageUrl) {
                                                setPath({ ...path, certBg: data.imageUrl });
                                            }
                                        } catch (error) {
                                            alert("Gagal unggah background");
                                        } finally {
                                            setIsUploadingCert(false);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <input 
                                    type="color" 
                                    value={path.certColor || "#2563eb"}
                                    onChange={(e) => setPath({ ...path, certColor: e.target.value })}
                                    className="w-10 h-10 rounded-xl border-none p-0 overflow-hidden cursor-pointer"
                                />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{path.certColor || "#2563eb"}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic">Warna tema sertifikat & garis tepi.</p>
                        </div>
                    </div>

                     <div className="pt-6 border-t border-slate-50 space-y-6">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Templat PDF Sertifikat (Opsional)</label>
                        
                        <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-900">PDF Template</p>
                                    <p className="text-[10px] text-slate-400 font-bold italic">Gunakan PDF permanen sebagai sertifikat.</p>
                                </div>
                                <label className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all">
                                    {isUploadingPdf ? "..." : (path.certPdfUrl ? "Ganti PDF" : "Unggah PDF")}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".pdf" 
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setIsUploadingPdf(true);
                                            const formData = new FormData();
                                            formData.append("file", file);
                                            try {
                                                const data = await fetchAPI<{url: string}>("/admin/upload-file", {
                                                    method: "POST",
                                                    body: formData,
                                                    headers: { "Content-Type": undefined as any },
                                                });
                                                if (data.url) {
                                                    setPath({ ...path, certPdfUrl: data.url });
                                                }
                                            } catch (error) {
                                                alert("Gagal unggah PDF");
                                            } finally {
                                                setIsUploadingPdf(false);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            
                            {path.certPdfUrl && (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">X Nama</label>
                                            <input type="number" step="0.1" value={path.certNameX} onChange={(e) => setPath({...path, certNameX: Number(e.target.value)})} className="w-full px-4 py-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-600 text-xs font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Y Nama</label>
                                            <input type="number" step="0.1" value={path.certNameY} onChange={(e) => setPath({...path, certNameY: Number(e.target.value)})} className="w-full px-4 py-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-600 text-xs font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ukuran Font</label>
                                            <input type="number" value={path.certFontSize} onChange={(e) => setPath({...path, certFontSize: Number(e.target.value)})} className="w-full px-4 py-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-600 text-xs font-bold" />
                                        </div>
                                        <div className="flex items-end">
                                            <button type="button" onClick={() => setPath({...path, certPdfUrl: ""})} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline ml-auto">Hapus Templat PDF</button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10 text-center">
                                        <p className="text-[10px] text-blue-600 font-bold italic leading-relaxed">
                                            * Koordinat (X, Y) menggunakan nilai unit PDF. Biasanya 50, 400 adalah titik tengah bawah.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                     </div>
                 </div>
                 <button 
                   disabled={isSaving}
                   className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black hover:bg-blue-600 transition-all active:scale-95"
                 >
                   {isSaving ? "Menyimpan..." : "Perbarui Info"}
                 </button>
              </form>
           </div>
        </div>

        {/* Right Col: Chapter Manager */}
        <div className="lg:col-span-7 space-y-8">
           <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Bab & Materi</h2>
             <button 
               onClick={() => setIsAddingChapter(true)}
               className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 shadow-lg shadow-blue-600/20"
             >
               + Tambah Bab Baru
             </button>
           </div>

           {isAddingChapter && (
             <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-blue-200 flex gap-4 items-center">
                <input 
                  autoFocus
                  placeholder="Masukkan judul bab baru..."
                  className="flex-grow px-4 py-2 outline-none font-bold"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddChapter()}
                />
                <button onClick={handleAddChapter} className="text-blue-600 font-black text-xs uppercase tracking-widest">Simpan</button>
                <button onClick={() => setIsAddingChapter(false)} className="text-slate-400 font-black text-xs uppercase tracking-widest">Batal</button>
             </div>
           )}

           <div className="space-y-6">
              {path.chapters?.map((chapter, cIdx) => (
                <div key={chapter.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group">
                   <div className="p-8 bg-slate-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-slate-300 border border-slate-100">
                           {cIdx + 1}
                         </div>
                         <h3 className="text-xl font-black text-slate-800">{chapter.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleDeleteChapter(chapter.id!)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                   </div>

                   <div className="p-6 space-y-3">
                      {chapter.lessons?.map((lesson, lIdx) => (
                        <div key={lesson.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 hover:bg-slate-50/30 transition-colors">
                           <div className="flex items-center gap-5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                {lIdx + 1}
                              </div>
                              <span className="font-bold text-slate-700">{lesson.title}</span>
                              <span className="px-3 py-0.5 bg-white border border-slate-100 rounded-full text-[8px] font-black uppercase text-slate-300 tracking-widest">
                                {lesson.type === 'material' ? 'Materi' : 'Kuis'}
                              </span>
                           </div>
                           <div className="flex gap-4">
                              <Link 
                                href={`/admin/quiz/edit-lesson/${lesson.id}`}
                                className="text-xs font-black text-blue-600"
                              >
                                Edit Konten
                              </Link>
                              <button onClick={() => handleDeleteLesson(lesson.id!)} className="text-slate-300 hover:text-red-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                           </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-4 pt-4">
                        <Link 
                          href={`/admin/quiz/new-lesson?pathId=${id}&chapterId=${chapter.id}&type=material&order=${(chapter.lessons?.length || 0) + 1}`}
                          className="flex-grow py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                        >
                          + Tambah Materi
                        </Link>
                        <Link 
                          href={`/admin/quiz/new-lesson?pathId=${id}&chapterId=${chapter.id}&type=quiz&order=${(chapter.lessons?.length || 0) + 1}`}
                          className="flex-grow py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 transition-all text-center"
                        >
                          + Tambah Kuis
                        </Link>
                        <Link 
                          href={`/admin/quiz/new-lesson?pathId=${id}&chapterId=${chapter.id}&type=project&order=${(chapter.lessons?.length || 0) + 1}`}
                          className="flex-grow py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all text-center"
                        >
                          + Proyek Akhir
                        </Link>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
