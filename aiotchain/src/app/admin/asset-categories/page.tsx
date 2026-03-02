"use client";

import withAuth from "@/components/withAuth";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useEffect, useState } from "react";

interface AssetCategory {
  id: number;
  name: string;
}

function ManageAssetCategoriesPage() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const loadCategories = async () => {
    try {
      const data = await fetchAPI<AssetCategory[]>("/admin/asset-categories");
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const token = getToken();
      await fetchAPI("/admin/asset-categories", {
        method: "POST",
        body: JSON.stringify({ name: newName }),
        headers: { Authorization: token || "" },
      });
      setNewName("");
      loadCategories();
    } catch (err: any) {
      alert("Gagal menambah: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const token = getToken();
      await fetchAPI(`/admin/asset-categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName }),
        headers: { Authorization: token || "" },
      });
      setEditingId(null);
      loadCategories();
    } catch (err: any) {
      alert("Gagal update: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kategori ini? Pastikan tidak ada asset 3D yang menggunakannya.")) return;
    try {
      const token = getToken();
      await fetchAPI(`/admin/asset-categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: token || "" },
      });
      loadCategories();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Kategori Asset 3D</h1>
        <p className="text-slate-500 font-medium">Kelola kategori untuk asset 3D (Component, Module, Full Build, dll).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Tambah */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Tambah Kategori Baru</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Kategori</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Component"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Tambah Kategori"}
              </button>
            </form>
          </div>
        </div>

        {/* List Kategori */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="px-6 py-4">Nama Kategori</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={2} className="px-6 py-10 text-center text-slate-400 italic">Memuat data...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-10 text-center text-slate-400 italic">Belum ada kategori.</td></tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-1.5 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 font-bold text-slate-700"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-slate-700">{cat.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {editingId === cat.id ? (
                            <>
                              <button onClick={() => handleUpdate(cat.id)} className="text-emerald-500 font-bold text-xs hover:underline">Simpan</button>
                              <button onClick={() => setEditingId(null)} className="text-slate-400 font-bold text-xs hover:underline">Batal</button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => {
                                  setEditingId(cat.id);
                                  setEditName(cat.name);
                                }} 
                                className="text-blue-500 font-bold text-xs hover:underline"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(cat.id)} 
                                className="text-rose-400 font-bold text-xs hover:underline"
                              >
                                Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-bold text-sm italic">⚠️ {error}</div>}
    </div>
  );
}

export default withAuth(ManageAssetCategoriesPage);
