"use client";

// import withAuth from "@/hoc/withAuth";
import withAuth from "@/components/withAuth"; // Impor proteksi yang kita buat
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  createdAt: string;
}

function AdminPostsPage() {
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
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus postingan ini?")) return;

    try {
      const token = getToken();
      await fetchAPI(`/admin/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: token || "" },
      });
      
      // Update state lokal (lebih cepat daripada reload page)
      setPosts(posts.filter((p) => p.id !== id));
      alert("Post berhasil dihapus");
    } catch (err) {
      alert("Gagal hapus: " + (err as Error).message);
    }
  };

  if (loading) return <div className="p-4">Memuat data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Postingan</h1>
        <Link 
          href="/admin/posts/new" 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Tambah Post Baru
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b p-3 font-semibold text-gray-600">Judul</th>
              <th className="border-b p-3 font-semibold text-gray-600">Slug</th>
              <th className="border-b p-3 font-semibold text-gray-600 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">Belum ada postingan.</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition">
                  <td className="border-b p-3 text-gray-800">{post.title}</td>
                  <td className="border-b p-3 text-gray-500 text-sm">{post.slug}</td>
                  <td className="border-b p-3 text-center">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Bungkus dengan withAuth agar hanya admin yang bisa akses
export default withAuth(AdminPostsPage);