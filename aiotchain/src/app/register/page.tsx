"use client";

import GoogleLoginButton from "@/components/GoogleLoginButton";
import { login, register } from "@/lib/auth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi Dasar
    if (formData.password !== formData.confirmPassword) {
      return setError("Konfirmasi password tidak cocok.");
    }

    if (formData.password.length < 6) {
      return setError("Password minimal 6 karakter.");
    }

    setIsSubmitting(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      // Auto-login setelah registrasi sukses
      try {
        await login(formData.username, formData.password);
        router.push("/onboarding");
      } catch (loginErr) {
        console.error("Auto-login failed:", loginErr);
        // Jika auto-login gagal (jarang terjadi jika register sukses), 
        // arahkan ke login manual dengan pesan
        alert("Registrasi berhasil! Silakan login untuk melanjutkan.");
        router.push("/login");
      }
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
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              A
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              AIOT<span className="text-blue-600 font-light italic">Chain</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
            <Link href="/blog" className="hover:text-blue-600 transition">Artikel</Link>
            <Link href="/quiz" className="hover:text-blue-600 transition">Alur Belajar</Link>
          </div>
        </div>
      </nav>

      {/* REGISTER FORM */}
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-[480px]">
          <div className="bg-card rounded-3xl shadow-sm border border-border p-8 md:p-10">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">Buat Akun Baru</h1>
              <p className="text-muted-foreground text-sm">Bergabunglah dengan komunitas AIOT Chain</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-muted text-foreground"
                  placeholder="johndoe"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-muted text-foreground"
                  placeholder="nama@email.com"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-muted text-foreground pr-12"
                    placeholder="••••••••"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-muted text-foreground pr-12"
                    placeholder="••••••••"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                  isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-600/20"
                }`}
              >
                {isSubmitting ? "Mendaftarkan Akun..." : "Daftar Sekarang"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>

            <div className="mt-6 flex items-center">
              <div className="flex-1 h-[1px] bg-border"></div>
              <span className="px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Atau mendaftar dengan</span>
              <div className="flex-1 h-[1px] bg-border"></div>
            </div>

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.includes("GANTI_DENGAN") ? (
              <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
                <GoogleLoginButton onError={setError} />
              </GoogleOAuthProvider>
            ) : (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs text-center">
                Google Login belum dikonfigurasi. Silakan tambahkan Client ID di .env.local
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Dengan mendaftar, Anda menyetujui{" "}
                <a href="#" className="text-blue-600 hover:underline">Syarat & Ketentuan</a>
                {" "}dan{" "}
                <a href="#" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
