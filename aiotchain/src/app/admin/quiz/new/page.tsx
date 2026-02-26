"use client";

import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface QuestionInput {
  questionText: string;
  options: string; // JSON string ["A", "B", "C", "D"] ideally, or comma separated
  correctAnswer: string;
}

export default function CreateLearningPathPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Path Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Menengah");
  const [duration, setDuration] = useState(120);
  const [thumbnail, setThumbnail] = useState("");
  const [certBg, setCertBg] = useState("");
  const [certColor, setCertColor] = useState("#2563eb");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = getToken();

    const payload = {
      title,
      description,
      difficulty,
      duration: Number(duration),
      thumbnail,
      certBg,
      certColor
    };

    try {
      const resp = await fetchAPI<{data: {id: number}}>("/admin/learning-paths", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { Authorization: token || "" },
      });
      router.push(`/admin/quiz/${resp.data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-32">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Buat Alur Belajar Baru</h1>
        <p className="text-slate-500 font-medium text-lg">Langkah pertama dalam mendesain kurikulum masa depan.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-8 py-4 rounded-3xl font-bold text-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
           <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Judul Alur Belajar</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  minLength={5}
                  maxLength={255}
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700 placeholder:text-slate-300"
                  placeholder="Contoh: Menjadi Spesialis AI Dasar"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tingkat Kesulitan</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="Pemula">Pemula</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Mahir">Mahir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimasi Durasi (Menit)</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi Kurikulum</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700 placeholder:text-slate-300 min-h-[150px]"
                  placeholder="Jelaskan apa yang akan dipelajari oleh siswa..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL Gambar Sampul (Opsional)</label>
                <input 
                  type="text" 
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700 placeholder:text-slate-300"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="pt-6 border-t border-slate-50 space-y-6">
                <h3 className="text-xl font-black text-slate-900">Custom Sertifikat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Background Sertifikat (URL)</label>
                    <input 
                      type="text" 
                      value={certBg}
                      onChange={(e) => setCertBg(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700 placeholder:text-slate-300"
                      placeholder="URL background sertifikat..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Warna Sertifikat</label>
                    <div className="flex gap-4">
                      <input 
                        type="color" 
                        value={certColor}
                        onChange={(e) => setCertColor(e.target.value)}
                        className="w-12 h-12 rounded-xl border-none p-0 overflow-hidden cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={certColor}
                        onChange={(e) => setCertColor(e.target.value)}
                        className="flex-grow px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
           </div>

           <div className="flex justify-end gap-6 pt-6 border-t border-slate-50">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-8 py-4 font-black text-slate-400 hover:text-slate-900 transition-colors uppercase text-xs tracking-widest"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-[0.2em]"
              >
                {isSubmitting ? "Memproses..." : "Buat & Lanjut ke Kurikulum"}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
