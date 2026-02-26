"use client";

import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { compressImage } from "@/lib/image-utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Asset {
  id: number;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  thumbnail: string;
  images: string[];
  downloadCount: number;
}

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ 
    title: "", 
    description: "", 
    category: "Component", 
    fileUrl: "", 
    thumbnail: "",
    images: [] as string[]
  });
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    fetchAPI<Asset[]>("/assets")
      .then(setAssets)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumb' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Ukuran File
    const MAX_ZIP_SIZE = 20 * 1024 * 1024; // 20MB
    const MAX_IMG_SIZE = 5 * 1024 * 1024;  // 5MB

    if (type === 'file' && file.size > MAX_ZIP_SIZE) {
      alert("Ukuran file ZIP terlalu besar. Maksimal 20MB.");
      return;
    }

    if ((type === 'thumb' || type === 'gallery') && file.size > MAX_IMG_SIZE) {
      alert("Ukuran gambar too besar. Maksimal 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      let fileToUpload = file;
      
      // Kompres jika ini adalah gambar
      if ((type === 'thumb' || type === 'gallery') && file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file, { maxWidth: 800, quality: 0.7 });
      }

      const formData = new FormData();
      formData.append("image", fileToUpload); // Backend expects "image" field even for files

      const data = await fetchAPI<{url: string}>("/admin/upload", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": undefined as any },
      });
      
      if (type === 'file') setNewAsset({ ...newAsset, fileUrl: data.url });
      else if (type === 'thumb') setNewAsset({ ...newAsset, thumbnail: data.url });
      else if (type === 'gallery') {
        setNewAsset({ ...newAsset, images: [...newAsset.images, data.url] });
      }
    } catch (err) {
      alert("Gagal upload: " + (err as Error).message);
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/admin/assets", {
        method: "POST",
        body: JSON.stringify(newAsset),
      });
      setShowAddModal(false);
      window.location.reload();
    } catch (err) {
      alert("Gagal tambah asset: " + (err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus asset ini?")) return;
    try {
      await fetchAPI(`/admin/assets/${id}`, {
        method: "DELETE",
      });
      setAssets(assets.filter(a => a.id !== id));
    } catch (err) {
      alert("Gagal hapus: " + (err as Error).message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Asset 3D</h1>
          <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Total {assets.length} Assets</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Asset
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Asset</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Downloads</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 mr-4 overflow-hidden border border-slate-100">
                      {asset.thumbnail && (
                        <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${asset.thumbnail}`} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {asset.title}
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-md border border-blue-100">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 max-w-[200px] truncate flex items-center gap-2">
                        {asset.images?.length > 0 && (
                          <span title={`${asset.images.length} images in gallery`} className="flex items-center gap-0.5 text-blue-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {asset.images.length}
                          </span>
                        )}
                        {asset.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-slate-600">{asset.downloadCount}</td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Tambah Asset 3D</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddAsset} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Asset</label>
                <input 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  value={newAsset.title}
                  onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Kategori</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  >
                    <option value="Component">Component</option>
                    <option value="Module">Module</option>
                    <option value="Full Build">Full Build</option>
                    <option value="Electronic">Electronic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">File 3D (.glb/zip/stl)</label>
                  <input type="file" accept=".zip,.stl,.obj,.glb" onChange={(e) => handleFileUpload(e, 'file')} className="text-xs w-full" />
                  {newAsset.fileUrl && <div className="text-[10px] text-green-600 mt-1 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Terisi
                  </div>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Deskripsi</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 h-24"
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Thumbnail Utama</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumb')} className="text-xs" />
                  {newAsset.thumbnail && (
                    <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-slate-200">
                      <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${newAsset.thumbnail}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Gallery Preview ({newAsset.images.length})</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newAsset.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${img}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setNewAsset({ ...newAsset, images: newAsset.images.filter((_, i) => i !== idx) })}
                          className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'gallery')} />
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUploading || !newAsset.fileUrl || !newAsset.thumbnail}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-slate-300 shadow-xl shadow-blue-500/10"
              >
                {isUploading ? "Mengunggah..." : "Simpan Asset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
