"use client";

import { fetchAPI } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Brain, Check, ChevronRight, Cpu, Database, Globe, HelpCircle, Laptop, MessageSquare, Search, Share2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERESTS = [
  { id: "AI", label: "Artificial Intelligence", icon: Brain, color: "bg-purple-500" },
  { id: "IoT", label: "Internet of Things", icon: Cpu, color: "bg-blue-500" },
  { id: "WebDev", label: "Web Development", icon: Laptop, color: "bg-green-500" },
  { id: "Robotics", label: "Robotics", icon: Laptop, color: "bg-red-500" },
  { id: "DataScience", label: "Data Science", icon: Database, color: "bg-yellow-500" },
  { id: "Blockchain", label: "Blockchain", icon: Globe, color: "bg-indigo-500" },
];

const SOURCES = [
  { id: "SocialMedia", label: "Media Sosial", icon: Share2 },
  { id: "Friend", label: "Rekomendasi Teman", icon: Users },
  { id: "SearchEngine", label: "Mesin Pencari", icon: Search },
  { id: "News", label: "Artikel / Berita", icon: MessageSquare },
  { id: "Others", label: "Lainnya", icon: HelpCircle },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [referralSource, setReferralSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login?onboarding=true");
    }
  }, [router]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1 && selectedInterests.length === 0) {
      return setError("Mohon pilih setidaknya satu minat.");
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!referralSource) {
      return setError("Mohon pilih dari mana Anda mengetahui kami.");
    }

    setIsSubmitting(true);
    setError("");

    try {
      await fetchAPI("/me", {
        method: "PUT",
        body: JSON.stringify({
          interests: selectedInterests.join(","),
          referral_source: referralSource,
        }),
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan informasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[grid:rgba(0,0,0,0.02)_20px_20px]">
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-border p-8 md:p-12 relative overflow-hidden backdrop-blur-xl">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 flex">
            <div className={`h-full transition-all duration-700 bg-blue-600 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
            <div className={`h-full transition-all duration-700 bg-muted ${step === 1 ? 'w-1/2' : 'w-0'}`}></div>
          </div>

          <div className="mb-10 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">A</div>
              <span className="font-bold text-foreground">AIOT<span className="text-blue-600 font-light italic text-xs ml-0.5">Chain</span></span>
            </Link>
            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">Langkah {step} dari 2</span>
          </div>

          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">Apa minat utama Anda?</h1>
              <p className="text-muted-foreground mb-8">Pilih topik yang paling membuat Anda bersemangat untuk belajar bersama kami.</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {INTERESTS.map((item) => {
                  const isSelected = selectedInterests.includes(item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      className={`relative group p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-3 active:scale-95 ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/10" 
                          : "border-border hover:border-blue-300 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`p-4 rounded-2xl transition-all duration-500 ${isSelected ? item.color + " text-white scale-110 rotate-3" : "bg-muted text-muted-foreground"}`}>
                        <Icon strokeWidth={2.5} size={28} />
                      </div>
                      <span className={`text-sm font-bold tracking-tight ${isSelected ? "text-blue-700" : "text-foreground"}`}>{item.label}</span>
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1 shadow-sm">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-700">
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">Tahu kami dari mana?</h1>
              <p className="text-muted-foreground mb-8">Ini membantu kami memahami audiens kami dengan lebih baik.</p>

              <div className="space-y-3">
                {SOURCES.map((item) => {
                  const isSelected = referralSource === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setReferralSource(item.id)}
                      className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group active:scale-[0.99] ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/5" 
                          : "border-border hover:border-blue-300 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-all duration-500 ${isSelected ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}>
                          <Icon size={20} />
                        </div>
                        <span className={`font-bold ${isSelected ? "text-blue-700" : "text-foreground"}`}>{item.label}</span>
                      </div>
                      {isSelected && <Check className="text-blue-600" size={20} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-3 animate-shake">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <HelpCircle size={16} />
              </div>
              {error}
            </div>
          )}

          <div className="mt-10 flex gap-4">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-8 py-4 rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-all active:scale-95"
              >
                Kembali
              </button>
            )}
            <button
              onClick={step === 1 ? handleNext : handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all shadow-xl flex items-center justify-center gap-2 group active:scale-[0.98] ${
                isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25"
              }`}
            >
              {isSubmitting ? (
                "Menyiapkan Akun..."
              ) : (
                <>
                  {step === 1 ? "Lanjut" : "Selesai & Masuk"}
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Informasi ini hanya digunakan untuk mempersonalisasi pengalaman belajar Anda.
        </p>
      </div>
    </div>
  );
}
