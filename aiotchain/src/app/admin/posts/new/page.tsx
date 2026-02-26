"use client";

import RichTextEditor from "@/components/admin/Editor";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { compressImage } from "@/lib/image-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("AI");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const categories = ["AI", "IoT", "Chain", "Tutorial", "Wawasan"];

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setSlug(generateSlug(value));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Ukuran Gambar (Maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar. Maksimal 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      // Kompres gambar sebelum upload
      const compressedFile = await compressImage(file, { maxWidth: 1200, quality: 0.7 });
      
      const formData = new FormData();
      formData.append("image", compressedFile);

      const data = await fetchAPI<{url: string}>("/admin/upload", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": undefined as any },
      });
      setImageUrl(data.url);
    } catch (err) {
      alert("Gagal upload gambar: " + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Judul dan konten wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const token = getToken();
    try {
      await fetchAPI("/admin/posts", {
        method: "POST",
        body: JSON.stringify({ title, slug, excerpt, content, imageUrl, category }),
      });
      router.push("/admin/posts");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Top Header/Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <Link href="/admin/posts" className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
            <span className="text-xl">←</span>
          </Link>
          <div className="h-6 w-[1px] bg-slate-100"></div>
          <h2 className="text-lg font-bold text-slate-700">Draft Postingan Baru</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            type="button" 
            onClick={() => router.push("/admin/posts")}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
              isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
            }`}
          >
            {isSubmitting ? "Mempublikasikan..." : "Publikasikan"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl font-bold text-sm animate-in fade-in slide-in-from-top-2">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8 md:p-12 space-y-8">
            <input
              type="text"
              placeholder="Judul Postingan"
              value={title}
              onChange={handleTitleChange}
              required
              minLength={5}
              maxLength={255}
              className="w-full text-4xl md:text-5xl font-black text-slate-900 placeholder:text-slate-200 outline-none border-none focus:ring-0"
            />
            <div className="h-[2px] w-12 bg-blue-600 rounded-full"></div>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Tulis cerita Anda di sini..."
            />
          </div>
        </div>

        {/* Sidebar Settings Area */}
        <aside className="xl:col-span-4 space-y-6">
          {/* Settings Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Pengaturan Post</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        category === cat 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-slate-50"></div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">URL Slug</label>
                <input
                  type="text"
                  placeholder="slug-url"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs text-blue-600 focus:bg-white focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ringkasan</label>
                <textarea
                  placeholder="Berikan ringkasan singkat..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 focus:bg-white focus:border-blue-500 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Featured Image Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Gambar Utama</h3>
            
            <div className="relative group">
              {imageUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${imageUrl}`} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label htmlFor="upload-main" className="cursor-pointer bg-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl active:scale-95 transition-all">Ganti Gambar</label>
                  </div>
                </div>
              ) : (
                <label htmlFor="upload-main" className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer group">
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</span>
                  <span className="text-xs font-bold text-slate-400">Pilih Gambar Utama</span>
                  {isUploading && <span className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs text-blue-600 font-bold animate-pulse">Mengunggah...</span>}
                </label>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="upload-main" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
