"use client";

import { fetchAPI } from "@/lib/api";
import { getUserRole, login } from "@/lib/auth";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaData, setCaptchaData] = useState<{ question: string; token: string } | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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
      
      if (role === "admin" || role === "super_admin") {
        router.push("/");
      } else {
        setError("Akses ditolak: Hanya admin yang dapat masuk ke sini");
      }
    } catch (err: any) {
      setError(err.message);
      fetchCaptcha();
      setCaptchaAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4 font-sans">
      <div className="w-full max-w-[420px]">
        <div className="bg-card rounded-[3rem] shadow-2xl border border-border p-8 md:p-12 transition-all duration-500 hover:shadow-blue-500/5">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight leading-tight">Admin Login</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Resume Subdomain Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                Username
              </label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-foreground bg-muted font-medium"
                placeholder="Admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-foreground bg-muted pr-14 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {captchaData && (
              <div className="p-5 bg-muted/50 rounded-[2rem] border border-border">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 ml-1">
                  Security Check
                </label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={fetchCaptcha}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3.5 font-black text-xs text-center cursor-pointer select-none hover:bg-muted transition-colors tracking-widest shadow-sm"
                    title="Click to refresh captcha"
                  >
                    {captchaData.question}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="?"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-20 px-3 py-3.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-foreground bg-background text-center font-black shadow-sm"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 text-red-600 text-xs font-bold border border-red-500/20 flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-xl ${
                isSubmitting 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-blue-600/20"
              }`}
            >
              {isSubmitting ? "Authenticating..." : "Login to Admin"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-blue-600 transition-colors underline decoration-border underline-offset-8">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
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
        </div>
      </nav>

      <Suspense fallback={<div className="flex items-center justify-center py-20 font-black text-xs uppercase tracking-widest text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
