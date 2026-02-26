"use client";

import withAuth from "@/components/withAuth";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    Activity,
    ArrowLeft,
    Award,
    BarChart3,
    BookOpen,
    FileText,
    TrendingUp,
    Users
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  counts: {
    totalPosts: number;
    totalPaths: number;
    totalUsers: number;
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
  activityTrend: {
    date: string;
    count: number;
  }[];
  distribution: {
    label: string;
    value: number;
    color: string;
  }[];
}

function StatsPage() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Menghitung data...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      name: "Total Konten", 
      value: stats?.counts.totalPosts || 0, 
      icon: <FileText className="w-6 h-6" />, 
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Artikel & Berita"
    },
    { 
      name: "Alur Belajar", 
      value: stats?.counts.totalPaths || 0, 
      icon: <BookOpen className="w-6 h-6" />, 
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      description: "Kurikulum Aktif"
    },
    { 
      name: "Pengguna", 
      value: stats?.counts.totalUsers || 0, 
      icon: <Users className="w-6 h-6" />, 
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "Komunitas Terdaftar"
    },
  ];

  // Helper to map trend data to chart
  const getTrendHeight = (count: number) => {
    if (!stats?.activityTrend || stats.activityTrend.length === 0) return 20;
    const max = Math.max(...stats.activityTrend.map(t => t.count), 1);
    return (count / max) * 100;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2 group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            KEMBALI KE DASHBOARD
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Statistik Sistem <BarChart3 className="w-10 h-10 text-blue-600" />
          </h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Analisis mendalam performa platform</p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500`}></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                {stat.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.name}</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                  <span className="text-emerald-500 text-xs font-bold flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +100%
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium italic">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Engagement Chart */}
        <div className="lg:col-span-12 xl:col-span-8 bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Activity className="text-blue-500" /> Tren Aktivitas
              </h2>
              <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-medium">Postingan 7 Hari Terakhir</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-black rounded-full border border-slate-700">WEEKLY</span>
              <span className="px-4 py-1.5 bg-blue-600/20 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20">LIVE DATA</span>
            </div>
          </div>

          <div className="relative z-10 flex items-end justify-between h-48 gap-3 md:gap-6 mt-10">
            {stats?.activityTrend && stats.activityTrend.length > 0 ? (
              stats.activityTrend.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                  <div className="relative w-full overflow-hidden flex flex-col justify-end">
                    <div 
                      className="w-full bg-blue-600 rounded-2xl transition-all duration-1000 ease-out group-hover:bg-blue-400"
                      style={{ height: `${getTrendHeight(item.count)}%`, minHeight: item.count > 0 ? '4px' : '0px' }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                        {item.count} Post
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase()}</span>
                </div>
              ))
            ) : (
              <div className="w-full flex items-center justify-center h-full text-slate-500 text-sm italic">
                Belum ada data aktivitas minggu ini
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="lg:col-span-12 xl:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group">
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Capaian Platform</h3>
                <p className="text-xs text-slate-400 font-medium">Distribusi berdasarkan kategori</p>
              </div>
            </div>

            <div className="space-y-6">
              {stats?.distribution && stats.distribution.length > 0 ? (
                stats.distribution.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-black text-slate-600 uppercase tracking-tighter">
                      <span>{item.label}</span>
                      <span>{item.value} Konten</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${(item.value / stats.counts.totalPosts) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-sm italic">Belum ada data distribusi konten</div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50">
            <button className="w-full py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 uppercase tracking-widest">
              Unduh Laporan PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(StatsPage);
