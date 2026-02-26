"use client";

import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(username, password);
      router.push("/profile"); // Redirect ke profile page
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-[400px] p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Selamat Datang</h1>
            <p className="text-slate-500 text-sm mt-2">Masuk ke panel manajemen AIOT</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                Username
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9]+$"
                title="Username harus alfanumerik (3-20 karakter)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700"
                placeholder="admin_aiot"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md ${
                isSubmitting 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <a href="/" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
              &larr; Kembali ke Website Utama
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}