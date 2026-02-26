"use client";

import { resetPassword } from "@/lib/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    if (!token) {
      setError("Token tidak valid atau hilang");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 mb-6">
          Token reset tidak ditemukan. Silakan minta link reset password baru.
        </div>
        <Link href="/auth/forgot-password" className="text-blue-600 font-semibold hover:underline">
          Lupa Password?
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-slate-500 text-sm">Masukkan password baru Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 ml-1">
            Password Baru
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 bg-slate-50"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 ml-1">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 bg-slate-50"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-green-50 text-green-600 text-sm font-medium border border-green-100">
            Password berhasil diperbarui! Mengalihkan ke halaman login...
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || success}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
            isSubmitting || success
            ? "bg-slate-400 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-600/20"
          }`}
        >
          {isSubmitting ? "Memproses..." : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              A
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              AIOT<span className="text-blue-600 font-light italic">Chain</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10">
            <Suspense fallback={<div>Loading...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
