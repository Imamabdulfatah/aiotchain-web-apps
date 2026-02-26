"use client";

import RichTextEditor from "@/components/RichTextEditor";
import { fetchAPI } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface QuestionInput {
  questionText: string;
  options: string;
  correctAnswer: string;
}

export default function NewLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathId = searchParams.get("pathId");
  const chapterId = searchParams.get("chapterId");
  const type = searchParams.get("type") || "material";
  const order = searchParams.get("order") || "1";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { questionText: "", options: "", correctAnswer: "" }
  ]);
  const [projectFileUrl, setProjectFileUrl] = useState("");
  const [projectDriveLink, setProjectDriveLink] = useState("");
  const [allowZipSubmission, setAllowZipSubmission] = useState(false);
  const [allowDriveSubmission, setAllowDriveSubmission] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuestionChange = (index: number, field: keyof QuestionInput, value: string) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => setQuestions([...questions, { questionText: "", options: "", correctAnswer: "" }]);
  const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        pathId: Number(pathId),
        chapterId: Number(chapterId),
        title,
        type,
        content,
        videoUrl,
        order: Number(order),
        questions: type === "quiz" ? questions : [],
        projectFileUrl: type === "project" ? projectFileUrl : "",
        projectDriveLink: type === "project" ? projectDriveLink : "",
        allowZipSubmission: type === "project" ? allowZipSubmission : false,
        allowDriveSubmission: type === "project" ? allowDriveSubmission : false,
        pdfUrl: type === "material" ? pdfUrl : ""
      };

      await fetchAPI("/admin/quizzes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push(`/admin/quiz/${pathId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
       <div className="space-y-4">
          <button onClick={() => router.back()} className="text-slate-400 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
             Kembali ke Alur
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Tambah {type === 'material' ? 'Materi Teks' : type === 'quiz' ? 'Kuis Baru' : 'Proyek Akhir'}
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Judul {type === 'material' ? 'Materi' : 'Kuis'}</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  minLength={3}
                  maxLength={255}
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                  placeholder="Contoh: Pengenalan Sensor Analog"
                />
             </div>

             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Link Video YouTube (Opsional)</label>
                <input 
                  type="url" 
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                  placeholder="Contoh: https://www.youtube.com/watch?v=..."
                />
                <p className="text-[10px] text-slate-400 mt-2 ml-2">Video akan ditampilkan secara otomatis di bagian atas materi.</p>
             </div>


             {type === 'material' && (
                <>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Konten Materi</label>
                   <RichTextEditor
                     content={content}
                     onChange={setContent}
                     placeholder="Tuliskan materi pelajaran di sini... Gunakan toolbar untuk formatting, embed YouTube, atau upload gambar."
                   />
                </div>

                 <div className="pt-6 border-t border-slate-50">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lampiran PDF (Opsional)</label>
                    <div className="flex items-center gap-4">
                       <label className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600 transition-all flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          {uploading ? "Mengunggah..." : (pdfUrl ? "Ganti PDF" : "Unggah PDF")}
                          <input 
                             type="file" 
                             className="hidden" 
                             accept=".pdf" 
                             onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploading(true);
                                const formData = new FormData();
                                formData.append("file", file);
                                try {
                                   const res = await fetchAPI<{url: string}>("/admin/upload-file", {
                                      method: "POST",
                                      body: formData,
                                      headers: { "Content-Type": undefined as any }
                                   });
                                   if (res.url) setPdfUrl(res.url);
                                } catch (err: any) {
                                   alert("Gagal unggah PDF: " + err.message);
                                } finally {
                                   setUploading(false);
                                }
                             }}
                          />
                       </label>
                       {pdfUrl && (
                          <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                             <a href={pdfUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${pdfUrl}` : pdfUrl} target="_blank" className="hover:underline">Preview PDF</a>
                             <button type="button" onClick={() => setPdfUrl("")}>✕</button>
                          </div>
                       )}
                    </div>
                 </div>
                </>
             )}
             {type === 'quiz' && (
                <div className="space-y-6">
                   <h3 className="text-lg font-black text-slate-800 pt-4 border-t border-slate-50">Daftar Pertanyaan</h3>
                   {questions.map((q, idx) => (
                      <div key={idx} className="p-6 bg-muted rounded-3xl space-y-4 relative group">
                         <button type="button" onClick={() => removeQuestion(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 font-bold uppercase text-[8px] tracking-widest">Hapus</button>
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
                                  placeholder="A, B, C, D"
                               />
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-slate-400 mb-1">Jawaban Benar</label>
                               <input 
                                  required
                                  type="text"
                                  value={q.correctAnswer}
                                  onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                                  className="w-full px-4 py-3 bg-white rounded-xl border-none font-bold text-slate-700 text-blue-600"
                               />
                            </div>
                         </div>
                      </div>
                   ))}
                   <button type="button" onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black text-xs uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all">+ Tambah Pertanyaan</button>
                </div>
             )}

             {type === 'project' && (
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
                                  setUploading(true);
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  try {
                                     const res = await fetchAPI<{url: string}>("/admin/upload-file", {
                                        method: "POST",
                                        body: formData,
                                        headers: { "Content-Type": undefined as any }
                                     });
                                     setProjectFileUrl(res.url);
                                  } catch (err: any) {
                                     alert("Gagal upload file: " + err.message);
                                  } finally {
                                     setUploading(false);
                                  }
                               }}
                               className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                            />
                            {projectFileUrl && <p className="text-[10px] font-bold text-emerald-600 italic mt-1">✓ File terpilih: {projectFileUrl.split('/').pop()}</p>}
                         </div>
                         <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Link Google Drive</label>
                            <input 
                               type="url" 
                               value={projectDriveLink}
                               onChange={(e) => setProjectDriveLink(e.target.value)}
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
                                checked={allowZipSubmission}
                                onChange={(e) => setAllowZipSubmission(e.target.checked)}
                                className="sr-only"
                             />
                             <div className={`w-10 h-5 rounded-full transition-colors ${allowZipSubmission ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                             <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${allowZipSubmission ? 'translate-x-5' : ''}`}></div>
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
                                checked={allowDriveSubmission}
                                onChange={(e) => setAllowDriveSubmission(e.target.checked)}
                                className="sr-only"
                             />
                             <div className={`w-10 h-5 rounded-full transition-colors ${allowDriveSubmission ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                             <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${allowDriveSubmission ? 'translate-x-5' : ''}`}></div>
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
                        content={content}
                        onChange={setContent}
                        placeholder="Tuliskan instruksi langkah-demi-langkah, kriteria penilaian, dan hasil yang diharapkan dari proyek ini..."
                      />
                   </div>
                </div>
             )}

             <div className="pt-6 border-t border-slate-50 flex justify-end gap-6">
                <button type="submit" disabled={isSubmitting} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all">
                   {isSubmitting ? "Menyimpan..." : "Simpan Modul"}
                </button>
             </div>
          </div>
       </form>
    </div>
  );
}
