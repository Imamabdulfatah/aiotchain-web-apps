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
  const [searchQuery, setSearchQuery] = useState("");

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
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Postingan</h1>
          <p className="text-slate-500 font-medium">Buat, edit, dan kelola semua artikel blog Anda.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/25 active:scale-95 whitespace-nowrap"
        >
          <span className="mr-2 text-xl">+</span> Buat Postingan Baru
        </Link>
      </div>

      {/* Control Bar */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-lg">🔍</span>
          <input 
            type="text" 
            placeholder="Cari postingan..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Posts Grid/List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium italic">Sedang menyinkronkan data...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center space-y-6">
            <div className="text-6xl text-slate-200">📭</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">Tidak ada postingan ditemukan</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Mulai menulis ide Anda dan publikasikan ke dunia sekarang juga.</p>
            </div>
            <Link href="/admin/posts/new" className="inline-block text-blue-600 font-bold hover:underline">Buat postingan pertama Anda</Link>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">Draft</span>
                  <span className="text-[10px] font-medium text-slate-400">{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                  {post.title}
                </h2>
                <div className="flex items-center text-sm text-slate-400 font-medium">
                  <span className="mr-2">🔗</span>
                  <span className="truncate">{post.slug}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end md:self-center">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="px-6 py-2.5 rounded-xl border border-slate-100 font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-[0.98]"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-3 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-[0.98]"
                  title="Hapus permanen"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium animate-shake flex items-center space-x-3">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default withAuth(ManagePostsPage);
