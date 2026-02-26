"use client";

import { forgotPassword } from "@/lib/auth";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Lupa Password</h1>
              <p className="text-slate-500 text-sm">Masukkan email Anda untuk menerima link reset password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 bg-slate-50"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-4 rounded-xl bg-green-50 text-green-600 text-sm font-medium border border-green-100">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                  isSubmitting 
                  ? "bg-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-600/20"
                }`}
              >
                {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/login" className="text-sm text-blue-600 font-semibold hover:underline">
                Kembali ke Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
