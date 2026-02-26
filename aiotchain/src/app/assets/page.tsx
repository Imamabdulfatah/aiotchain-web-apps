"use client";

import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Asset {
  id: number;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  thumbnail: string;
  images: string; // Comma-separated gallery images
  downloadCount: number;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [newAsset, setNewAsset] = useState({ 
    title: "", 
    description: "", 
    category: "Lainnya", 
    fileUrl: "", 
    thumbnail: "",
    images: [] as string[] // Changed to array for local management
  });
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const categories = ["Semua", "Robotik", "Elektronik", "3D Printing", "AI Model", "Lainnya"];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setLoading(true);
    const categoryQuery = activeCategory !== "Semua" ? `category=${activeCategory}` : "";
    const searchQuery = debouncedSearch ? `search=${debouncedSearch}` : "";
    const queryString = [categoryQuery, searchQuery].filter(Boolean).join("&");
    
    fetchAPI<Asset[]>(`/assets${queryString ? `?${queryString}` : ""}`)
      .then(setAssets)
      .catch((err) => console.error("Error fetching assets:", err))
      .finally(() => setLoading(false));
  }, [activeCategory, debouncedSearch]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumb' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const data = await fetchAPI<{url: string}>("/upload", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": undefined as any }
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

  const removeGalleryImage = (index: number) => {
    const updatedImages = [...newAsset.images];
    updatedImages.splice(index, 1);
    setNewAsset({ ...newAsset, images: updatedImages });
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert images array back to comma-separated string for backend
      const payload = {
        ...newAsset,
        images: newAsset.images.join(",")
      };

      await fetchAPI("/assets", {
        method: "POST",
        headers: { Authorization: localStorage.getItem("token") || "" },
        body: JSON.stringify(payload),
      });
      setShowUploadModal(false);
      window.location.reload();
    } catch (err) {
      alert("Gagal tambah asset: " + (err as Error).message);
    }
  };

  const handleDownload = async (asset: Asset) => {
    if (!isLoggedIn()) {
      alert("Silakan login terlebih dahulu untuk mengunduh asset.");
      router.push("/login");
      return;
    }

    try {
      // Incremet download count in backend
      await fetchAPI(`/assets/${asset.id}/download`, { method: "POST" });
      
      // Update local state
      setAssets(assets.map(a => a.id === asset.id ? { ...a, downloadCount: a.downloadCount + 1 } : a));

      // Trigger actual download
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${asset.fileUrl}`;
      const link = document.createElement("a");
      link.href = fullUrl;
      link.download = asset.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-muted transition-colors duration-300">
      <Navbar />
      <header className="py-20 bg-slate-900 dark:bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-extrabold mb-4">Library Asset 3D</h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Download atau bagikan berbagai model 3D berkualitas tinggi untuk proyek AIOT Anda.
            </p>
          </div>
          {isLoggedIn() && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Bagikan Asset
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="relative max-w-2xl mb-12">
          <input
            type="text"
            placeholder="Cari asset 3D (judul atau deskripsi)..."
            className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                  : "bg-white text-slate-500 border border-slate-200 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Memuat asset...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assets.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-10">Belum ada asset tersedia.</p>
            ) : (
              assets.map((asset) => (
                <div key={asset.id} className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col group transition-colors">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {asset.thumbnail ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${asset.thumbnail}`} 
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-900 shadow-sm uppercase tracking-wider">
                      {asset.downloadCount} Downloads
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">{asset.category}</div>
                    <h2 className="text-xl font-bold text-foreground mb-2">{asset.title}</h2>
                    <p className="text-muted-foreground text-sm mb-6 flex-grow line-clamp-2">{asset.description}</p>
                    <Link 
                      href={`/assets/${asset.id}`}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-930/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-foreground">Bagikan Asset 3D</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-muted-foreground hover:text-foreground transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateAsset} className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Asset</label>
                  <input 
                    required
                    placeholder="Contoh: Drone Chassis V1"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground outline-none focus:border-blue-500 transition"
                    value={newAsset.title}
                    onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Deskripsi</label>
                  <textarea 
                    required
                    placeholder="Jelaskan detail asset Anda..."
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground outline-none focus:border-blue-500 transition h-24"
                    value={newAsset.description}
                    onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Kategori</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground outline-none focus:border-blue-500 transition"
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  >
                    {categories.filter(c => c !== "Semua").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Thumbnail Utama</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-blue-400 transition bg-muted/50 overflow-hidden">
                      {newAsset.thumbnail ? (
                        <div className="relative w-full h-full">
                          <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${newAsset.thumbnail}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">Ganti Gambar</div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 text-center px-4">
                          <svg className="w-6 h-6 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Klik untuk pilih thumbnail
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumb')} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">File 3D (.zip, .stl, .obj)</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-blue-400 transition bg-muted/50">
                      <div className="text-center px-4">
                        <svg className="w-6 h-6 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{newAsset.fileUrl ? "✓ File Terpilih" : "Pilih File"}</div>
                      </div>
                      <input type="file" accept=".zip,.stl,.obj,.glb" onChange={(e) => handleFileUpload(e, 'file')} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Gallery Gambar (Pratinjau Tambahan)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {newAsset.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl border border-border overflow-hidden group">
                        <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${img}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition bg-muted/20">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'gallery')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 shrink-0">
                <button 
                  type="submit"
                  disabled={isUploading || !newAsset.fileUrl || !newAsset.thumbnail}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                       <span>Sedang Mengunggah...</span>
                    </div>
                  ) : "Publikasikan Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
