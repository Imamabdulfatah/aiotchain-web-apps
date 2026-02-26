"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // Pastikan key sama dengan di auth.ts
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-4">
          <Link href="/admin" className="block hover:text-blue-400">Dashboard</Link>
          <Link href="/admin/posts" className="block hover:text-blue-400">Kelola Posts</Link>
          <Link href="/admin/quiz" className="block hover:text-blue-400">Kelola Quiz</Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left text-red-400 hover:text-red-300 mt-8"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}