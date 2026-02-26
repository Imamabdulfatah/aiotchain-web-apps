"use client";

import withAuth from "@/components/withAuth";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
}

function ManagePostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = async () => {
    try {
      const token = getToken();
      const data = await fetchAPI<Post[]>("/admin/posts", {
        headers: { Authorization: token || "" },
      });
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus postingan ini secara permanen?")) return;

    try {
      const token = getToken();
      await fetchAPI(`/admin/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: token || "" },
      });
      // Optimistic UI Update: Langsung hapus dari state
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Artikel</h1>
          <p className="text-sm text-slate-500">Kelola semua konten blog AIOT Chain Anda.</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          <span className="mr-2 text-lg">+</span> Post Baru
        </Link>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b">Judul Post</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b">Slug</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">Memuat data artikel...</td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">Belum ada artikel yang dipublikasikan.</td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono bg-slate-100 text-slate-600">
                        {post.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-4">
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-sm font-bold text-red-400 hover:text-red-600 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default withAuth(ManagePostsPage);