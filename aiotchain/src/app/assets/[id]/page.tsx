"use client";

import STLViewer from "@/components/3d/STLViewer";
import AIOManager from "@/components/AIOManager";
import AuthModal from "@/components/AuthModal";
import CommentSection from "@/components/CommentSection";
import Navbar from "@/components/Navbar";
import ShareButton from "@/components/ShareButton";
import { fetchAPI } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
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

export default function AssetDetailPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchAPI<Asset>(`/assets/${id}`)
        .then((data) => {
          setAsset(data);
          setActiveImage(data.thumbnail);
        })
        .catch((err) => console.error("Error fetching asset details:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDownload = async () => {
    if (!asset) return;
    
    if (!isLoggedIn()) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Increment download count in backend
      await fetchAPI(`/assets/${asset.id}/download`, { method: "POST" });
      
      // Update local state
      setAsset({ ...asset, downloadCount: asset.downloadCount + 1 });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">Memuat detail asset...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Asset tidak ditemukan</h1>
          <button onClick={() => router.push("/assets")} className="text-blue-600 font-medium hover:underline">
            Kembali ke Library
          </button>
        </div>
      </div>
    );
  }

  const galleryImages = [asset.thumbnail, ...(asset.images ? asset.images.split(",") : [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      {asset && (
        <AIOManager 
          title={asset.title}
          description={asset.description.substring(0, 160)}
          image={asset.thumbnail ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${asset.thumbnail}` : undefined}
          url={`https://aiotchain.id/assets/${asset.id}`}
          type="website"
          category={asset.category}
        />
      )}
      
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Left Side: Preview & Gallery */}
          <div className="space-y-6">
            <div className="bg-card rounded-[40px] p-4 shadow-sm border border-border overflow-hidden aspect-video relative group flex items-center justify-center">
              {asset.fileUrl.toLowerCase().endsWith('.stl') ? (
                <STLViewer url={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${asset.fileUrl}`} />
              ) : activeImage ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${activeImage}`} 
                  alt={asset.title}
                  className="w-full h-full object-contain rounded-3xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded-3xl text-muted-foreground">
                  <svg className="w-20 h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative shrink-0 w-24 h-24 rounded-2xl border-2 transition-all overflow-hidden ${
                      activeImage === img ? "border-blue-600 shadow-lg shadow-blue-500/20 scale-105" : "border-border hover:border-blue-400"
                    }`}
                  >
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${img}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Details */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-1.5 bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                {asset.category}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-6 tracking-tight leading-tight">{asset.title}</h1>
              
              <div className="flex items-center gap-6">
                <div className="text-center bg-muted px-6 py-2 rounded-2xl border border-border">
                  <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Downloads</p>
                  <p className="text-xl font-black text-foreground">{asset.downloadCount}</p>
                </div>
                <div className="text-center bg-muted px-6 py-2 rounded-2xl border border-border">
                  <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Format</p>
                  <p className="text-xl font-black text-foreground uppercase">{asset.fileUrl.split('.').pop()}</p>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-12">
              <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-4">Tentang Asset</h3>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                {asset.description}
              </p>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={handleDownload}
                  className="w-full sm:flex-grow py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 transition-all active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Asset
                </button>
                <ShareButton 
                  title={asset.title} 
                  text={`Lihat Asset 3D menarik: ${asset.title}`}
                  className="w-full sm:w-auto h-[68px] aspect-square"
                />
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 py-4 px-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                 <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <p className="text-[10px] sm:text-xs font-bold text-amber-600/80">Asset ini tersedia secara gratis untuk keperluan non-komersial di ekosistem AIoT Chain.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="border-t border-border pt-20">
          <div className="flex items-center gap-4 mb-12">
             <h2 className="text-3xl font-black text-foreground tracking-tight">Diskusi & Ulasan</h2>
             <span className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-bold border border-border">Community Support</span>
          </div>
          <CommentSection assetId={Number(id)} />
        </div>
      </main>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        message="Silakan login terlebih dahulu untuk mengunduh asset 3D ini."
      />
    </div>
  );
}
