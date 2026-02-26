"use client";

import withAuth from "@/components/withAuth";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LearningPath {
  id: number;
  title: string;
  difficulty: string;
  userCount: number;
}

function ManageQuizPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPaths = async () => {
    try {
      const token = getToken();
      const data = await fetchAPI<LearningPath[]>("/learning-paths", {
        headers: { Authorization: token || "" },
      });
      setPaths(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaths();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus alur belajar ini secara permanen? Semua bab dan materi di dalamnya akan ikut terhapus.")) return;

    try {
      const token = getToken();
      await fetchAPI(`/admin/learning-paths/${id}`, {
        method: "DELETE",
        headers: { Authorization: token || "" },
      });
      setPaths(paths.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Alur Belajar</h1>
          <p className="text-sm text-slate-500">Buat dan atur kurikulum pembelajaran bertingkat.</p>
        </div>
        <Link
          href="/admin/quiz/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center"
        >
          <span className="mr-2 text-xl">+</span> Tambah Alur Belajar
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                <th className="px-8 py-5 border-b">Informasi Alur</th>
                <th className="px-6 py-5 border-b">Kesulitan</th>
                <th className="px-6 py-5 border-b">Siswa</th>
                <th className="px-6 py-5 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic">Memuat alur belajar...</td>
                </tr>
              ) : paths.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic">Belum ada alur belajar yang tersedia.</td>
                </tr>
              ) : (
                paths.map((path) => (
                  <tr key={path.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-900 text-lg">{path.title}</p>
                      <p className="text-xs text-slate-400">ID: {path.id}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        path.difficulty === 'Mudah' ? 'bg-emerald-50 text-emerald-600' :
                        path.difficulty === 'Sedang' || path.difficulty === 'Menengah' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {path.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-600 font-bold">{path.userCount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <Link
                          href={`/admin/quiz/${path.id}`}
                          className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-xs hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Kelola Kurikulum
                        </Link>
                        <button
                          onClick={() => handleDelete(path.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
      
      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-medium text-sm">{error}</div>}
    </div>
  );
}

export default withAuth(ManageQuizPage);
