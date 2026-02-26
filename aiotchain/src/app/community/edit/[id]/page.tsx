"use client";

import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { compressImage } from "@/lib/image-utils";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditThreadPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Diskusi");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    // Fetch existing thread data
    const fetchThread = async () => {
      try {
        const data = await fetchAPI<any>(`/threads/${id}`);
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
        setImageUrl(data.image_url || "");
      } catch (error) {
        console.error("Error fetching thread for edit:", error);
        alert("Gagal mengambil data diskusi.");
        router.push("/community");
      } finally {
        setFetching(false);
      }
    };

    fetchThread();
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar. Maksimal 5MB.");
      return;
    }

    setUploading(true);
    try {
      const compressedFile = await compressImage(file, { maxWidth: 1200, quality: 0.7 });
      const formData = new FormData();
      formData.append("image", compressedFile);

      const data = await fetchAPI<{url: string}>("/upload", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": undefined as any },
      });
      setImageUrl(data.url);
    } catch (err) {
      alert("Gagal upload gambar: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Judul dan konten tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    try {
      await fetchAPI(`/threads/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          content,
          category,
          image_url: imageUrl
        }),
      });
      router.push(`/community/${id}`);
    } catch (error: any) {
      console.error("Error updating thread:", error);
      alert(error.message || "Gagal memperbarui diskusi. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) return <div className="text-center py-20 text-muted-foreground">Memuat data diskusi...</div>;

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-foreground mb-8">Edit Diskusi</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Judul Diskusi</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Apa yang ingin Anda bahas?"
              className="w-full px-6 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-foreground font-bold"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Kategori</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-6 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-foreground font-medium"
            >
              <option value="Diskusi">Diskusi Umum</option>
              <option value="Tanya Jawab">Tanya Jawab</option>
              <option value="Project">Project AIoT</option>
              <option value="Showcase">Showcase</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Konten</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ceritakan lebih detail tentang topik Anda..."
              className="w-full px-6 py-4 bg-muted/30 border border-border rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-foreground min-h-[300px] resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Foto (Opsional)</label>
            <div className="relative group">
              {imageUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-border group">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${imageUrl}`} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label htmlFor="upload-thread-edit" className="cursor-pointer bg-background px-4 py-2 rounded-xl text-xs font-bold shadow-xl active:scale-95 transition-all text-foreground">Ganti Gambar</label>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label htmlFor="upload-thread-edit" className="flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/30 hover:border-blue-500/50 transition-all cursor-pointer group">
                  <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🖼️</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unggah Foto Diskusi</span>
                  {uploading && <span className="absolute inset-0 bg-background/80 flex items-center justify-center text-xs text-blue-600 font-bold animate-pulse">Mengunggah...</span>}
                </label>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="upload-thread-edit" disabled={uploading} />
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-accent transition-all"
            >
              Batal
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
