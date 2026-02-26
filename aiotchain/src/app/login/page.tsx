"use client";

import GoogleLoginButton from "@/components/GoogleLoginButton";
import { fetchAPI } from "@/lib/api";
import { getUserRole, login } from "@/lib/auth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaData, setCaptchaData] = useState<{ question: string; token: string } | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const onboarding = searchParams.get("onboarding");

  const fetchCaptcha = async () => {
    try {
      const data = await fetchAPI<{ question: string; token: string }>("/auth/captcha");
      setCaptchaData(data);
    } catch (err) {
      console.error("Failed to fetch captcha", err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaData) return;

    setError("");
    setIsSubmitting(true);

    try {
      await login(username, password, captchaData.token, captchaAnswer);
      const role = getUserRole();
      
      if (onboarding === "true") {
        router.push("/onboarding");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err.message);
      fetchCaptcha(); // Refresh captcha on failure
      setCaptchaAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-[420px]">
        <div className="bg-card rounded-3xl shadow-sm border border-border p-8 md:p-10">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Selamat Datang Kembali</h1>
            <p className="text-muted-foreground text-sm">Masuk ke akun AIOT Chain Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">
                Username
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-foreground bg-muted"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-foreground bg-muted"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="mt-2 text-right">
                <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">
                  Lupa password?
                </Link>
              </div>
            </div>

            {captchaData && (
              <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 ml-1">
                  Verifikasi Keamanan
                </label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={fetchCaptcha}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 font-bold text-center cursor-pointer select-none hover:bg-muted transition-colors"
                    title="Klik untuk ganti pertanyaan"
                  >
                    {captchaData.question}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Jawab"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-24 px-3 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-foreground bg-background text-center font-bold"
                  />
                </div>
              </div>
            )}

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
                isSubmitting 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-600/20"
              }`}
            >
              {isSubmitting ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 flex items-center">
            <div className="flex-1 h-[1px] bg-border"></div>
            <span className="px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Atau masuk dengan</span>
            <div className="flex-1 h-[1px] bg-border"></div>
          </div>

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.includes("GANTI_DENGAN") ? (
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
              <GoogleLoginButton onError={setError} />
            </GoogleOAuthProvider>
          ) : (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs text-center">
              Google Login belum dikonfigurasi. Silakan tambahkan Client ID di .env.local
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>

          
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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

      {/* LOGIN FORM wrapped in Suspense for useSearchParams() */}
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Memuat...</div></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
