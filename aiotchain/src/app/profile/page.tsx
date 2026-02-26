"use client";

import CertificateModal from "@/components/CertificateModal";
import EditProfileModal from "@/components/EditProfileModal";
import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import { getToken, isLoggedIn, logout } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface UserToken {
  username: string;
  user_id: number;
  exp: number;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone: string;
  linkedin: string;
  social_media: string;
  profile_picture: string;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  progress: number;
  difficulty: string;
}

interface Asset {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
}

interface Thread {
  id: number;
  title: string;
  category: string;
  image_url: string;
  comment_count: number;
  created_at: string;
}

interface Certificate {
  id: number;
  certificateId: string;
  learningPathId: number;
  issuedAt: string;
  LearningPath?: {
    title: string;
    thumbnail: string;
  };
}

interface Material {
  lessonTitle: string;
  pathTitle: string;
  pdfUrl: string;
}

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserToken | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") as any;
  const [activeTab, setActiveTab] = useState<"learning" | "assets" | "certificates" | "community" | "materials">(initialTab || "learning");
  
  const [joinedPaths, setJoinedPaths] = useState<LearningPath[]>([]);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [userThreads, setUserThreads] = useState<Thread[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [statLoading, setStatLoading] = useState(true);

  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode<UserToken>(token);
        setUser(decoded);
        fetchProfile();
        loadUserData(decoded.user_id);
      } catch (error) {
        console.error("Token error:", error);
        logout();
        router.push("/login");
      }
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getToken();
      const res = await fetchAPI<UserProfile>("/me", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
      });
      setProfile(res);
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  };

  interface UserStats {
    quizzesCompleted: number;
    articlesRead: number;
    assetsUploaded: number;
    points: number;
  }

  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const loadUserData = async (userId: number) => {
    try {
      // Fetch joined learning paths
      const pathsRes = await fetchAPI<LearningPath[]>(`/learning-paths?joined=true&userId=${userId}`);
      setJoinedPaths(pathsRes || []);

      // Fetch user summary stats
      const statsRes = await fetchAPI<UserStats>(`/progress/summary?userId=${userId}`, {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      });
      setUserStats(statsRes);

      // Fetch user assets
      const assetsRes = await fetchAPI<Asset[]>(`/assets?userId=${userId}`); 
      setUserAssets(assetsRes || []); 

      // Fetch certificates
      const certsRes = await fetchAPI<Certificate[]>(`/certificates?userId=${userId}`, {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      });
      setCertificates(certsRes || []);

      // Fetch community threads
      const threadsRes = await fetchAPI<Thread[]>(`/threads?userId=${userId}`);
      setUserThreads(threadsRes || []);

      // Fetch materials PDFs
      const materialsRes = await fetchAPI<Material[]>(`/progress/materials?userId=${userId}`, {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      });
      setMaterials(materialsRes || []);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
      setStatLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header Profile - Premium Design */}
        <div className="relative mb-20">
            {/* Abstract Background Decoration */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-[80px] -z-10"></div>

            <div className="flex flex-col md:flex-row items-center gap-10">
                {/* Avatar Section */}
                <div className="relative group">
                    <div className="w-40 h-40 rounded-[3.5rem] bg-slate-100 overflow-hidden ring-8 ring-white shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:rotate-3">
                        {profile?.profile_picture && profile.profile_picture !== "" ? (
                            <img 
                                src={profile.profile_picture.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${profile.profile_picture}` : profile.profile_picture} 
                                alt="Avatar" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl">👤</div>
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white animate-bounce-slow">
                        ✨
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <span className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 italic">
                            Member AIoT Academy
                        </span>
                        <h1 className="text-5xl font-black text-foreground tracking-tight leading-none mb-2">
                            {profile?.username || user?.username}
                        </h1>
                        <p className="text-muted-foreground font-bold flex items-center justify-center md:justify-start gap-2 italic">
                            {profile?.email || "email@example.com"}
                        </p>
                    </div>

                    {/* Social & Contact Buttons (Enhanced) */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        {profile?.phone && (
                            <div className="px-5 py-2.5 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border border-green-100 dark:border-green-900/20">
                                📱 {profile.phone}
                            </div>
                        )}
                        {profile?.linkedin && (
                            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border border-blue-100 dark:border-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                                🔗 LinkedIn
                            </a>
                        )}
                         {profile?.social_media && (
                            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-100 dark:border-slate-700">
                                🌐 {profile.social_media}
                            </div>
                        )}
                        <button 
                            onClick={() => {
                                if (!profile && user) {
                                    // Fallback profile if fetch failed
                                    setProfile({
                                        id: user.user_id,
                                        username: user.username,
                                        email: "",
                                        phone: "",
                                        linkedin: "",
                                        social_media: "",
                                        profile_picture: ""
                                    });
                                }
                                setShowEditModal(true);
                            }}
                            className="px-8 py-3.5 bg-foreground text-background rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-foreground/10 hover:scale-105 active:scale-95 transition-all"
                        >
                            Edit Profil
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="px-8 py-3.5 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-500"
                        >
                            Keluar
                        </button>
                    </div>
                </div>

                {/* Stats Section - High Contrast */}
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    {[
                        { label: "Quiz Selesai", value: userStats?.quizzesCompleted || 0, color: "text-blue-600 dark:text-blue-400" },
                        { label: "Artikel Baca", value: userStats?.articlesRead || 0, color: "text-blue-600 dark:text-blue-400" },
                        { label: "Asset Kontribusi", value: userStats?.assetsUploaded || 0, color: "text-blue-600 dark:text-blue-400" },
                        { label: "Point AIoT", value: userStats?.points || 0, color: "text-blue-600 dark:text-blue-400" }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 min-w-[140px] text-center">
                            <h3 className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</h3>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Tabs - Modern Switcher */}
        <div className="flex justify-center mb-12">
            <div className="bg-muted p-2 rounded-3xl flex flex-wrap justify-center gap-2">
                {[
                    { id: "learning", label: "Alur Belajar Saya", icon: "🎓" },
                    { id: "assets", label: "Asset 3D Saya", icon: "📦" },
                    { id: "community", label: "Diskusi Saya", icon: "💬" },
                    { id: "materials", label: "Materi PDF", icon: "📚" },
                    { id: "certificates", label: "Sertifikat", icon: "🏆" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${
                            activeTab === tab.id 
                            ? "bg-card text-blue-600 dark:text-blue-400 shadow-md scale-105" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Section */}
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            {activeTab === "learning" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(joinedPaths || []).length > 0 ? joinedPaths.map(path => (
                        <div key={path.id} className="bg-card rounded-[3rem] border border-border p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-500 group">
                            <div className="w-full md:w-40 h-40 rounded-[2.5rem] overflow-hidden bg-muted flex-shrink-0 relative">
                                <img src={path.thumbnail} alt={path.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-xl text-[9px] font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400">
                                    {path.difficulty}
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-foreground mb-2 leading-tight">{path.title}</h3>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                                                style={{ width: `${path.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-black text-foreground italic">{path.progress}%</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={`/learning-paths/${path.id}`} className="flex-1 px-6 py-4 bg-muted text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-accent transition-colors">
                                        Lanjut Belajar
                                    </Link>
                                    {path.progress === 100 && (
                                        <button 
                                            onClick={() => {
                                                setSelectedPath(path);
                                                setShowCertificate(true);
                                            }}
                                            className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center shadow-lg shadow-blue-500/20 hover:-translate-y-1 transition-all"
                                        >
                                            🏆 Sertifikat
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <p className="text-muted-foreground font-bold italic">Anda belum mengikuti Alur Belajar manapun.</p>
                            <Link href="/quiz" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">Telusuri Alur Belajar</Link>
                        </div>
                    )}
                </div>
            ) : activeTab === "assets" ? (
                /* Assets Tab */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(userAssets || []).length > 0 ? userAssets.map(asset => (
                        <Link 
                            key={asset.id}
                            href={`/assets/${asset.id}`}
                            className="bg-card rounded-[2.5rem] border border-border p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
                        >
                            <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-6 relative border border-border">
                                <img 
                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${asset.thumbnail}`} 
                                    alt={asset.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-xl text-[9px] font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400">
                                    {asset.category}
                                </div>
                            </div>
                            <h4 className="text-lg font-black text-foreground mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{asset.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{asset.description}</p>
                        </Link>
                    )) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <p className="text-muted-foreground font-bold italic">Anda belum memiliki Asset 3D.</p>
                            <Link href="/assets" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">Telusuri Asset 3D</Link>
                        </div>
                    )}
                </div>
            ) : activeTab === "community" ? (
                /* Community Tab */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(userThreads || []).length > 0 ? userThreads.map(thread => (
                        <Link 
                            key={thread.id} 
                            href={`/community/${thread.id}`}
                            className="bg-card rounded-[2.5rem] border border-border p-6 flex items-start gap-6 hover:shadow-2xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-500 group"
                        >
                            {thread.image_url ? (
                                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-border">
                                    <img 
                                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${thread.image_url}`} 
                                        alt={thread.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center text-3xl flex-shrink-0 border border-border">
                                    💬
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">{thread.category}</span>
                                <h4 className="text-lg font-black text-foreground line-clamp-2 leading-tight mb-3 group-hover:text-blue-600 transition-colors">{thread.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold">
                                    <span className="flex items-center gap-1.5">💬 {thread.comment_count} Komentar</span>
                                    <span>•</span>
                                    <span>{new Date(thread.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <p className="text-muted-foreground font-bold italic">Belum ada diskusi yang Anda buat.</p>
                            <Link href="/community/new" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">Mulai Diskusi Pertama</Link>
                        </div>
                    )}
                </div>
            ) : activeTab === "materials" ? (
                /* Materials Tab */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(materials || []).length > 0 ? materials.map((material, idx) => (
                        <div key={idx} className="bg-card rounded-[2.5rem] border border-border p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                             <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-colors"></div>
                            
                             <div className="mb-6 w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl">
                                📚
                             </div>
                             
                             <div className="space-y-2 mb-6 text-center md:text-left">
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">{material.pathTitle}</span>
                                <h3 className="text-xl font-black text-foreground leading-tight">
                                    {material.lessonTitle}
                                </h3>
                             </div>

                             <a 
                                href={material.pdfUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${material.pdfUrl}` : material.pdfUrl}
                                target="_blank"
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                             >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download PDF
                             </a>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <p className="text-muted-foreground font-bold italic">Belum ada materi PDF yang tersedia.</p>
                            <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
                                Ikuti alur belajar yang memiliki modul dengan lampiran PDF untuk melihatnya di sini.
                            </p>
                            <Link href="/quiz" className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20">
                                Cari Alur Belajar
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                /* Certificates Tab */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(certificates || []).length > 0 ? certificates.map((cert) => (
                        <div 
                            key={cert.id} 
                            className="bg-card rounded-[2.5rem] border border-border p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
                            onClick={() => {
                                if (cert.LearningPath) {
                                    setSelectedPath({
                                        id: cert.learningPathId,
                                        title: cert.LearningPath.title,
                                        thumbnail: cert.LearningPath.thumbnail,
                                        description: "",
                                        progress: 100,
                                        difficulty: ""
                                    });
                                    setShowCertificate(true);
                                }
                            }}
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors"></div>
                            
                            <div className="mb-6 w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl">
                                📜
                            </div>
                            
                            <h3 className="text-xl font-black text-foreground mb-4 leading-tight">
                                {cert.LearningPath?.title || "Sertifikat AIoT"}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-muted-foreground">ID Sertifikat</span>
                                    <span className="text-blue-600 dark:text-blue-400">{cert.certificateId}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-muted-foreground">Tanggal Terbit</span>
                                    <span className="text-foreground">
                                        {new Date(cert.issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center group-hover:border-blue-100 dark:group-hover:border-blue-900/30 transition-colors">
                                <Link 
                                    href={`/certificates/${cert.certificateId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline"
                                >
                                    Lihat Detail
                                </Link>
                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-2">
                                    →
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <p className="text-muted-foreground font-bold italic">Anda belum memiliki sertifikat.</p>
                            <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
                                Selesaikan Alur Belajar dengan progress 100% untuk mendapatkan sertifikat resmi dari AIoT Academy.
                            </p>
                            <button 
                                onClick={() => setActiveTab("learning")}
                                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20"
                            >
                                Mulai Belajar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>

      {/* Certificate Modal */}
      {selectedPath && (
        <CertificateModal 
            isOpen={showCertificate}
            onClose={() => setShowCertificate(false)}
            userName={profile?.username || user?.username || "Pengguna"}
            courseName={selectedPath.title}
            date={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            certificateId={Math.random().toString(36).substring(2, 10).toUpperCase()}
            learningPathId={selectedPath.id}
        />
      )}

      {/* Edit Profile Modal */}
      {profile && (
          <EditProfileModal 
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            userProfile={profile}
            onUpdate={(updated) => setProfile(updated)}
          />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
