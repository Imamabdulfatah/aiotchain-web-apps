"use client";

import withAuth from "@/components/withAuth";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function CreatePostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
  });

  // Helper untuk membuat slug otomatis dari judul
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "") // Hapus karakter spesial
      .replace(/ +/g, "-");    // Ganti spasi dengan tanda hubung
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "title") {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = getToken();
      await fetchAPI("/dashboard/posts", {
        method: "POST",
        headers: { Authorization: token || "" },
        body: JSON.stringify(form),
      });
      
      router.push("/dashboard/posts");
      router.refresh();
    } catch (err: any) {
      alert("Gagal membuat post: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-slate-500 mb-2">
            <Link href="/dashboard/posts" className="hover:text-blue-600">Postingan</Link> / Baru
          </nav>
          <h1 className="text-2xl font-bold text-slate-900">Buat Postingan Baru</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Artikel</label>
            <input
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Masukkan judul yang menarik..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Slug Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug</label>
            <div className="flex items-center group">
              <span className="bg-slate-50 border border-r-0 border-slate-200 px-4 py-3 rounded-l-xl text-slate-400 text-sm">
                aiotchain.com/blog/
              </span>
              <input
                name="slug"
                type="text"
                required
                value={form.slug}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-r-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-sm text-blue-600"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 ml-1 italic">Generated secara otomatis dari judul, namun tetap dapat diedit.</p>
          </div>

          {/* Excerpt Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Ringkasan (Excerpt)</label>
            <textarea
              name="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={handleChange}
              placeholder="Gambarkan isi artikel dalam 2-3 kalimat..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Content Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Konten Lengkap</label>
            <textarea
              name="content"
              required
              rows={12}
              value={form.content}
              onChange={handleChange}
              placeholder="Tuliskan pengetahuan Anda di sini..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-serif"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/dashboard/posts"
            className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
              isSubmitting 
              ? "bg-slate-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
            }`}
          >
            {isSubmitting ? "Menyimpan..." : "Publikasikan Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(CreatePostPage);