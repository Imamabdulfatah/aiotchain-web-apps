"use client";

import { register } from "@/lib/auth"; // Atau panggil fetch langsung
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi Dasar
    if (formData.password !== formData.confirmPassword) {
      return setError("Konfirmasi password tidak cocok.");
    }

    setIsSubmitting(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      // Jika sukses, arahkan ke login dengan pesan sukses
      alert("Registrasi berhasil! Silakan login.");
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="w-full max-w-[450px]">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Buat Akun Baru</h1>
            <p className="text-slate-500 text-sm mt-2">Daftarkan diri Anda untuk akses ke AIOT Chain</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 ml-1">Username</label>
                <input
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="^[a-zA-Z0-9]+$"
                  title="Username harus alfanumerik (3-20 karakter)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="johndoe"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 ml-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="name@company.com"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 ml-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5 ml-1">Konfirmasi Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100 italic">
                * {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all mt-4 ${
                isSubmitting ? "bg-slate-400" : "bg-slate-900 hover:bg-black active:scale-[0.98] shadow-lg shadow-slate-200"
              }`}
            >
              {isSubmitting ? "Mendaftarkan Akun..." : "Daftar Akun"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Sudah punya akun? </span>
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}