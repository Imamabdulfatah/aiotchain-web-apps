"use client";

import RichTextEditor from "@/components/RichTextEditor";
import { fetchAPI } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QuestionInput {
  id?: number;
  questionText: string;
  options: string;
  correctAnswer: string;
}

interface LessonData {
  id: number;
  pathId: number;
  chapterId: number;
  title: string;
  type: string;
  content: string;
  videoUrl?: string;
  order: number;
  questions: QuestionInput[];
  projectFileUrl?: string;
  projectDriveLink?: string;
  allowZipSubmission?: boolean;
  allowDriveSubmission?: boolean;
  pdfUrl?: string; // Add PDF support
}

export default function EditLessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const data = await fetchAPI<LessonData>(`/admin/quizzes/${id}`);
        setLesson(data);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadLesson();
  }, [id]);

  const handleQuestionChange = (index: number, field: keyof QuestionInput, value: string) => {
    if (!lesson) return;
    const newQuestions = [...lesson.questions];
    (newQuestions[index] as any)[field] = value;
    setLesson({ ...lesson, questions: newQuestions });
  };

  const addQuestion = () => {
    if (!lesson) return;
    setLesson({ ...lesson, questions: [...lesson.questions, { questionText: "", options: "", correctAnswer: "" }] });
  };

  const removeQuestion = (index: number) => {
     if (!lesson) return;
     setLesson({ ...lesson, questions: lesson.questions.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await fetchAPI(`/admin/quizzes/${lesson.id}`, {
        method: "PUT",
        body: JSON.stringify(lesson),
      });
      router.push(`/admin/quiz/${lesson.pathId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 italic">Memuat data modul...</div>;
  if (!lesson) return <div className="p-20 text-center">Modul tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
       <div className="space-y-4">
          <button onClick={() => router.back()} className="text-slate-400 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
             Kembali ke Editor Alur
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Edit {lesson.type === 'material' ? 'Materi' : 'Kuis'}
          </h1>
       </div>

       {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-8 py-4 rounded-[20px] font-bold text-sm">
          ⚠️ {error}
        </div>
      )}

       <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Judul {lesson.type === 'material' ? 'Materi' : 'Kuis'}</label>
                <input 
                  required
                  type="text" 
                  value={lesson.title || ""}
                  onChange={(e) => setLesson({...lesson, title: e.target.value})}
                  minLength={3}
                  maxLength={255}
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                />
             </div>

             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Link Video YouTube (Opsional)</label>
                <input 
                  type="url" 
                  value={lesson.videoUrl || ""}
                  onChange={(e) => setLesson({...lesson, videoUrl: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                  placeholder="Contoh: https://www.youtube.com/watch?v=..."
                />
                <p className="text-[10px] text-slate-400 mt-2 ml-2">Video akan ditampilkan secara otomatis di bagian atas materi.</p>
             </div>


             {lesson.type === 'material' && (
                <>
                   <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Konten Materi</label>
                       <RichTextEditor
                         content={lesson.content}
                         onChange={(html) => setLesson({...lesson, content: html})}
                         placeholder="Tuliskan materi pelajaran di sini... Gunakan toolbar untuk formatting, embed YouTube, atau upload gambar."
                       />
                    </div>

                    <div className="pt-6 border-t border-slate-50">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lampiran PDF (Opsional)</label>
                       <div className="flex items-center gap-4">
                          <label className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600 transition-all flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             {lesson.pdfUrl ? "Ganti PDF" : "Unggah PDF"}
                             <input 
                                type="file" 
                                className="hidden" 
                                accept=".pdf" 
                                onChange={async (e) => {
                                   const file = e.target.files?.[0];
                                   if (!file) return;
                                   const formData = new FormData();
                                   formData.append("file", file);
                                   try {
                                      const res = await fetchAPI<{url: string}>("/admin/upload-file", {
                                         method: "POST",
                                         body: formData,
                                         headers: { "Content-Type": undefined as any }
                                      });
                                      if (res.url) setLesson({ ...lesson, pdfUrl: res.url });
                                   } catch (err: any) {
                                      alert("Gagal unggah PDF: " + err.message);
                                   }
                                }}
                             />
                          </label>
                          {lesson.pdfUrl && (
                             <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                                <a href={lesson.pdfUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${lesson.pdfUrl}` : lesson.pdfUrl} target="_blank" className="hover:underline">Preview PDF</a>
                                <button type="button" onClick={() => setLesson({...lesson, pdfUrl: ""})}>✕</button>
                             </div>
                          )}
                       </div>
                    </div>
                </>
              )}
             {lesson.type === 'quiz' && (
                <div className="space-y-6">
                   <h3 className="text-lg font-black text-foreground pt-4 border-t border-border">Daftar Pertanyaan</h3>
                   {lesson.questions.map((q, idx) => (
                      <div key={idx} className="p-6 bg-muted rounded-3xl space-y-4 relative group">
                         <button type="button" onClick={() => removeQuestion(idx)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 font-bold uppercase text-[8px] tracking-widest">Hapus</button>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-1">Pertanyaan #{idx+1}</label>
                            <input 
                               required
                               type="text"
                               value={q.questionText}
                               onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                               className="w-full px-4 py-3 bg-white rounded-xl border-none font-bold text-slate-700"
                            />
                         </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-[10px] font-black text-slate-400 mb-1">Pilihan (Pisah koma)</label>
                               <input 
                                  required
                                  type="text"
                                  value={q.options}
                                  onChange={(e) => handleQuestionChange(idx, 'options', e.target.value)}
                                  className="w-full px-4 py-3 bg-white rounded-xl border-none font-bold text-slate-700"
                               />
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-slate-400 mb-1">Jawaban Benar</label>
                               <input 
                                  required
                                  type="text"
                                  value={q.correctAnswer}
                                  onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                                  className="w-full px-4 py-3 bg-white rounded-xl border-none font-bold text-blue-600"
                               />
                            </div>
                         </div>
                      </div>
                   ))}
                   <button type="button" onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black text-xs uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all">+ Tambah Pertanyaan</button>
                </div>
             )}

             {lesson.type === 'project' && (
                <div className="space-y-6">
                   <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                      <h3 className="text-lg font-black text-emerald-900">Sumber Daya Proyek</h3>
                      <p className="text-xs font-bold text-emerald-700/60">Upload file ZIP atau sertakan link Google Drive untuk bahan pengerjaan proyek oleh siswa.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                         <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload File ZIP</label>
                            <input 
                               type="file" 
                               accept=".zip,.rar,.7z"
                               onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  try {
                                     const res = await fetchAPI<{url: string}>("/admin/upload-file", {
                                        method: "POST",
                                        body: formData,
                                        headers: { "Content-Type": undefined as any }
                                     });
                                     setLesson({ ...lesson, projectFileUrl: res.url });
                                  } catch (err: any) {
                                     alert("Gagal upload file: " + err.message);
                                  }
                               }}
                               className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                            />
                            {lesson.projectFileUrl && <p className="text-[10px] font-bold text-emerald-600 italic mt-1">✓ File aktif: {lesson.projectFileUrl.split('/').pop()}</p>}
                         </div>
                         <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Link Google Drive</label>
                            <input 
                               type="url" 
                               value={lesson.projectDriveLink || ""}
                               onChange={(e) => setLesson({ ...lesson, projectDriveLink: e.target.value })}
                               placeholder="https://drive.google.com/..."
                               className="w-full px-4 py-3 bg-white rounded-xl border-none font-bold text-slate-700 text-sm shadow-inner"
                            />
                         </div>
                    </div>

                    <div className="pt-4 border-t border-emerald-100/50 space-y-4">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                             <input 
                                type="checkbox" 
                                checked={lesson.allowZipSubmission || false}
                                onChange={(e) => setLesson({ ...lesson, allowZipSubmission: e.target.checked })}
                                className="sr-only"
                             />
                             <div className={`w-10 h-5 rounded-full transition-colors ${lesson.allowZipSubmission ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                             <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${lesson.allowZipSubmission ? 'translate-x-5' : ''}`}></div>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-black text-emerald-900 group-hover:text-emerald-700 transition-colors">Izinkan Pengumpulan ZIP</span>
                             <p className="text-[10px] font-bold text-emerald-700/60 leading-tight">Siswa dapat mengunggah file hasil kerja dalam format .zip</p>
                          </div>
                       </label>

                       <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                             <input 
                                type="checkbox" 
                                checked={lesson.allowDriveSubmission || false}
                                onChange={(e) => setLesson({ ...lesson, allowDriveSubmission: e.target.checked })}
                                className="sr-only"
                             />
                             <div className={`w-10 h-5 rounded-full transition-colors ${lesson.allowDriveSubmission ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                             <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${lesson.allowDriveSubmission ? 'translate-x-5' : ''}`}></div>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-black text-emerald-900 group-hover:text-emerald-700 transition-colors">Izinkan Link Google Drive</span>
                             <p className="text-[10px] font-bold text-emerald-700/60 leading-tight">Siswa dapat mengumpulkan link folder/file dari Google Drive.</p>
                          </div>
                       </label>
                    </div>
                 </div>

                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instruksi Proyek</label>
                      <RichTextEditor
                        content={lesson.content}
                        onChange={(html) => setLesson({ ...lesson, content: html })}
                        placeholder="Tuliskan instruksi langkah-demi-langkah, kriteria penilaian, dan hasil yang diharapkan dari proyek ini..."
                      />
                   </div>
                </div>
             )}

             <div className="pt-6 border-t border-slate-50 flex justify-end gap-6">
                <button type="submit" disabled={isSubmitting} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all">
                   {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
             </div>
          </div>
       </form>
    </div>
  );
}
