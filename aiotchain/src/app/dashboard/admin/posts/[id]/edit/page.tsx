"use client";

import withAuth from "@/components/withAuth";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
}

function EditPostPage() {
  const router = useRouter();
  const params = useParams(); // Mengambil ID dari URL: /admin/posts/[id]/edit
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<PostForm>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
  });

  // 1. Ambil data asli dari Backend Go
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const token = getToken();
        // Step 1: Ambil daftar post untuk mencari slug
        const posts = await fetchAPI<any[]>("/admin/posts", {
          headers: { Authorization: token || "" },
        });

        const targetPost = posts.find((p: any) => p.id === Number(params.id));

        if (!targetPost) {
          throw new Error("Postingan tidak ditemukan.");
        }

        // Step 2: Ambil detail berdasarkan slug
        const data = await fetchAPI<PostForm>(`/posts/slug/${targetPost.slug}`, {
          headers: { Authorization: token || "" },
        });
        
        setForm(data);
      } catch (err: any) {
        alert("Gagal mengambil data: " + err.message);
        router.push("/dashboard/posts");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchPostData();
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = getToken();
      await fetchAPI(`/admin/posts/${params.id}`, {
        method: "PUT",
        headers: { Authorization: token || "" },
        body: JSON.stringify(form),
      });
      
      alert("Postingan berhasil diperbarui!");
      router.push("/dashboard/posts");
      router.refresh();
    } catch (err: any) {
      alert("Gagal update: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Menyiapkan data postingan...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-slate-500 mb-2">
            <Link href="/dashboard/posts" className="hover:text-blue-600 transition">Postingan</Link> / Edit
          </nav>
          <h1 className="text-2xl font-bold text-slate-900">Edit Artikel</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Artikel</label>
            <input
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-800"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug</label>
            <input
              name="slug"
              type="text"
              required
              value={form.slug}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-blue-600 font-mono text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Ringkasan (Excerpt)</label>
            <textarea
              name="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Konten Lengkap</label>
            <textarea
              name="content"
              required
              rows={12}
              value={form.content}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-serif leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/dashboard/posts"
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
              isSubmitting 
              ? "bg-slate-400 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
            }`}
          >
            {isSubmitting ? "Menyimpan..." : "Update Postingan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(EditPostPage);