"use client";

import { fetchAPI } from "@/lib/api";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetchAPI<{ message: string }>("/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setStatus("success");
      setMessage(res.message);
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Gagal berlangganan. Silakan coba lagi.");
    }
  };

  return (
    <section className="mb-20">
      <div className="relative overflow-hidden rounded-[3rem] bg-foreground p-8 md:p-16 text-background shadow-2xl">
        {/* Background Decorations */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-600/20 blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]"></div>

        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-black md:text-5xl leading-tight tracking-tight">
              Akses Update <span className="text-blue-500 italic">Eksklusif</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
              Dapatkan artikel terbaru, tutorial AIoT, dan wawasan teknologi langsung di inbox Anda. Jangan lewatkan update mendalam kami.
            </p>
          </div>

          <div className="relative">
            <form onSubmit={handleSubmit} className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                  className="w-full rounded-2xl border-none bg-background/10 py-5 pl-6 pr-14 text-lg font-medium text-background placeholder-muted-foreground outline-none ring-2 ring-white/10 transition-all focus:bg-background/20 focus:ring-blue-500/50"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20">
                  <Send className="h-6 w-6" />
                </div>
              </div>
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="group relative h-16 overflow-hidden rounded-2xl bg-blue-600 px-10 font-black text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 disabled:hover:bg-blue-600 sm:w-auto"
              >
                {status === "loading" ? (
                  <div className="h-6 w-6 animate-spin border-4 border-white border-t-transparent rounded-full mx-auto"></div>
                ) : (
                  "Berlangganan"
                )}
              </button>
            </form>

            <div className="mt-6 min-h-[1.5rem]">
              {status === "success" && (
                <div className="flex items-center gap-2 text-emerald-400 font-bold animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <p>{message}</p>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2 text-red-400 font-bold animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5" />
                  <p>{message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
