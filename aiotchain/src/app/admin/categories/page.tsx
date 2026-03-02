"use client";

import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await fetchAPI<Category[]>("/admin/categories");
      setCategories(data);
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setShowModal(true);
  };

  const handleAdd = () => {
    setCurrentCategory(null);
    setCategoryName("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentCategory) {
        // Update
        await fetchAPI(`/admin/categories/${currentCategory.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: categoryName }),
        });
      } else {
        // Create
        await fetchAPI("/admin/categories", {
          method: "POST",
          body: JSON.stringify({ name: categoryName }),
        });
      }
      setShowModal(false);
      loadCategories();
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kategori ini? Pastikan tidak ada artikel yang terikat.")) return;
    try {
      await fetchAPI(`/admin/categories/${id}`, {
        method: "DELETE",
      });
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Kategori Artikel</h1>
          <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Total {categories.length} Kategori</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nama Kategori</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={2} className="px-6 py-10 text-center text-slate-400 italic">Memuat kategori...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-10 text-center text-slate-400 italic">Belum ada kategori.</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800">{category.name}</div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">{currentCategory ? "Edit Kategori" : "Tambah Kategori"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Kategori</label>
                <input 
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Contoh: Tutorial, Review, Opini"
                />
              </div>
              <button 
                type="submit"
                disabled={isSaving || !categoryName.trim()}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-slate-300 shadow-xl shadow-blue-500/10"
              >
                {isSaving ? "Menyimpan..." : "Simpan Kategori"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
