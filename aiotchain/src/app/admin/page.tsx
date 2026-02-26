"use client";

import withAuth from "@/components/withAuth";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  counts: {
    totalPosts: number;
    totalPaths: number;
    totalUsers: number;
    pendingSubmissionsCount: number;
  };
  recentPosts: {
    id: number;
    title: string;
    slug: string;
    createdAt: string;
  }[];
  recentPaths: {
    id: number;
    title: string;
    difficulty: string;
  }[];
  interestDistribution?: {
    label: string;
    value: number;
    color: string;
  }[];
  referralDistribution?: {
    label: string;
    value: number;
    color: string;
  }[];
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        const data = await fetchAPI<DashboardStats>("/admin/stats", {
          headers: { Authorization: token || "" },
        });
        setStats(data);
      } catch (err) {
        console.error("Gagal ambil stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: "Total Artikel", value: stats?.counts.totalPosts || 0, icon: "📝", color: "bg-blue-500 shadow-blue-500/20" },
    { name: "Alur Belajar", value: stats?.counts.totalPaths || 0, icon: "🎓", color: "bg-indigo-500 shadow-indigo-500/20" },
    { name: "Total Pengguna", value: stats?.counts.totalUsers || 0, icon: "👥", color: "bg-emerald-500 shadow-emerald-500/20" },
    { name: "Proyek Menunggu", value: stats?.counts.pendingSubmissionsCount || 0, icon: "📁", color: "bg-amber-500 shadow-amber-500/20", href: "/admin/submissions" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Ringkasan Panel</h1>
          <p className="text-muted-foreground font-medium mt-1">Status terkini ekosistem AIOT Chain Anda.</p>
        </div>
        <div className="hidden md:flex items-center space-x-3 bg-card p-2.5 rounded-2xl shadow-sm border border-border">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">🛡️</div>
          <div className="pr-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Status Sesi</p>
            <p className="text-sm font-bold text-foreground">Administrator</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-card p-8 rounded-[2rem] border border-border shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 group relative">
            {stat.href && <Link href={stat.href} className="absolute inset-0 z-10" />}
            <div className="flex items-center justify-between mb-8">
              <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-500 text-white relative z-20`}>
                {stat.icon}
              </div>
              <div className="flex flex-col items-end relative z-20">
                <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Data Akurat</span>
                <div className="h-1 w-8 bg-border rounded-full mt-1"></div>
              </div>
            </div>
            <div className="space-y-1 relative z-20">
              <h3 className="text-muted-foreground font-bold text-sm uppercase tracking-wider">{stat.name}</h3>
              <p className="text-5xl font-black text-foreground tabular-nums tracking-tighter">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded-lg"></span>
                ) : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Onboarding Distribution Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Interests Distribution */}
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm space-y-8">
          <div className="border-b border-border pb-6 flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <h3 className="text-xl font-bold text-foreground">Distribusi Minat</h3>
          </div>
          <div className="space-y-5">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl"></div>)
            ) : stats?.interestDistribution?.length === 0 ? (
              <p className="text-muted-foreground italic py-4">Belum ada data minat.</p>
            ) : (
              stats?.interestDistribution?.map((item) => {
                const percentage = stats.counts.totalUsers > 0 
                  ? (item.value / stats.counts.totalUsers) * 100 
                  : 0;
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-foreground">{item.label}</span>
                      <span className="text-blue-600">{item.value} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Referral Distribution */}
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm space-y-8">
          <div className="border-b border-border pb-6 flex items-center gap-3">
            <span className="text-xl">📢</span>
            <h3 className="text-xl font-bold text-foreground">Sumber Referral</h3>
          </div>
          <div className="space-y-5">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl"></div>)
            ) : stats?.referralDistribution?.length === 0 ? (
              <p className="text-muted-foreground italic py-4">Belum ada data referral.</p>
            ) : (
              stats?.referralDistribution?.map((item) => {
                const percentage = stats.counts.totalUsers > 0 
                  ? (item.value / stats.counts.totalUsers) * 100 
                  : 0;
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-foreground">{item.label}</span>
                      <span className="text-indigo-600">{item.value} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color.replace('blue', 'indigo')} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Recent Posts Activity */}
        <div className="xl:col-span-8 bg-card p-8 rounded-[2rem] border border-border shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <h3 className="text-xl font-bold text-foreground">Artikel Terbaru</h3>
            </div>
            <Link href="/admin/posts" className="text-xs font-bold text-blue-600 hover:text-blue-700 px-4 py-2 bg-blue-600/10 rounded-xl transition-colors">
              LIHAT SEMUA
            </Link>
          </div>
          
          <div className="divide-y divide-border">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="py-6 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : stats?.recentPosts?.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground font-medium italic">Belum ada konten yang diterbitkan.</div>
            ) : (
              stats?.recentPosts?.map((post) => (
                <div key={post.id} className="py-6 flex items-center justify-between group cursor-pointer hover:bg-muted/50 rounded-2xl px-4 -mx-4 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      {post.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">{post.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium">Diterbitkan pada {new Date(post.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/admin/posts/${post.id}/edit`}
                    className="flex h-10 px-4 items-center justify-center bg-muted text-muted-foreground font-bold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                  >
                    EDIT
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Actions & Promo */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-foreground p-8 rounded-[2rem] shadow-xl shadow-foreground/10 text-background space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[80px] pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 italic">Siap Menulis?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Publikasikan ide brilian Anda dan jangkau audiens AIOT Chain sekarang.</p>
            </div>
            <Link 
              href="/admin/posts/new" 
              className="relative z-10 block w-full py-4 bg-background text-foreground text-center font-black rounded-2xl hover:bg-accent transition-all shadow-lg active:scale-95"
            >
              MULAI MENULIS
            </Link>
          </div>

          <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border pb-4">Status Alur Belajar</h3>
            <div className="space-y-4">
              {stats?.recentPaths?.slice(0, 3).map((path) => (
                <div key={path.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 scale-100 animate-pulse"></div>
                  <span className="text-sm font-bold text-foreground line-clamp-1">{path.title}</span>
                </div>
              ))}
              {(!stats?.recentPaths || stats.recentPaths.length === 0) && (
                <p className="text-xs text-muted-foreground italic">Belum ada alur belajar aktif.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminDashboard);
