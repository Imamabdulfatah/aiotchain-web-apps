"use client";

import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Check, Globe, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Add global declaration for Snap
declare global {
  interface Window {
    snap: any;
  }
}

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Ideal untuk pemula yang ingin mulai mengeksplorasi AI & IoT.",
    features: [
      "Akses artikel blog standar",
      "Kuis dasar (Level 1-3)",
      "Akses komunitas forum",
      "Satu sertifikat dasar",
    ],
    cta: "Mulai Gratis",
    popular: false,
    color: "blue",
    planId: "free",
  },
  {
    name: "Pro",
    price: "99.000",
    period: "/ bulan",
    description: "Untuk profesional yang ingin mendalami teknologi lebih serius.",
    features: [
      "Semua fitur paket Free",
      "Artikel eksklusif & studi kasus",
      "Kuis advance dengan sertifikat",
      "Download Asset 3D premium",
      "Prioritas dukungan komunitas",
    ],
    cta: "Berlangganan Sekarang",
    popular: true,
    color: "indigo",
    planId: "pro_monthly",
    amount: 99000,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Solusi kustom untuk institusi, startup, dan perusahaan besar.",
    features: [
      "Semua fitur paket Pro",
      "Pelatihan tim khusus (LMS)",
      "Konsultasi proyek AI & IoT",
      "API access untuk data industri",
      "Sertifikat institusi berlisensi",
    ],
    cta: "Hubungi Kami",
    popular: false,
    color: "purple",
    planId: "enterprise",
  },
];

const faqs = [
  {
    q: "Metode pembayaran apa saja yang didukung?",
    a: "Kami mendukung berbagai metode pembayaran termasuk Transfer Bank, E-Wallet (Gopay, OVO, Dana), dan Kartu Kredit.",
  },
  {
    q: "Apakah saya bisa membatalkan langganan kapan saja?",
    a: "Ya, Anda dapat membatalkan paket Pro kapan saja melalui pengaturan profil Anda tanpa biaya tambahan.",
  },
  {
    q: "Apakah ada diskon untuk mahasiswa atau pendidik?",
    a: "Tentu! Kami memiliki program khusus untuk edukasi. Silakan hubungi tim dukungan kami dengan melampirkan kartu identitas akademik.",
  },
  {
    q: "Bagaimana cara mendapatkan sertifikat fisik?",
    a: "Sertifikat digital diberikan otomatis setelah lulus kuis. Untuk sertifikat fisik, Anda dapat memesannya melalui dashboard dengan biaya cetak & kirim.",
  },
];

export default function PricingPage() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  // Load User Data
  useEffect(() => {
    const fetchUser = async () => {
      if (isLoggedIn()) {
        try {
          const user = await fetchAPI<{ role: string }>("/auth/me");
          setUserRole(user.role);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    };
    fetchUser();
  }, []);

  // Load Midtrans Snap Script
  useEffect(() => {
    // Check if script is already loaded
    if (document.getElementById("midtrans-script")) return;

    const script = document.createElement("script");
    script.id = "midtrans-script";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
    
    script.src = isProduction 
      ? "https://app.midtrans.com/snap/snap.js" 
      : "https://app.sandbox.midtrans.com/snap/snap.js";
      
    script.setAttribute("data-client-key", clientKey);
    document.body.appendChild(script);

    return () => {
      // Cleanup cleanup script if component unmounts (optional, usually kept for SPA)
    };
  }, []);

  const handleSubscription = async (plan: any) => {
    if (userRole === "pro" && plan.planId === "pro_monthly") {
        return; // Already subscribed
    }

    if (plan.price === "0") {
      router.push("/quiz");
      return;
    }

    if (plan.price === "Custom") {
      router.push("/contact");
      return;
    }

    if (!isLoggedIn()) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoading(true);

    try {
      // 1. Request transaction token from backend
      const response = await fetchAPI<{ token: string; redirect_url: string; order_id: string }>("/auth/payments/create", {
        method: "POST",
        body: JSON.stringify({
          amount: plan.amount,
          plan: plan.planId,
        }),
      });

      if (!response || !response.token) {
        throw new Error("Gagal membuat transaksi");
      }

      // 2. Open Snap Popup
      if (window.snap) {
        window.snap.pay(response.token, {
          onSuccess: function (result: any) {
            console.log("Payment success:", result);
            alert("Pembayaran Berhasil!");
            window.location.reload(); // Reload to update role
          },
          onPending: function (result: any) {
            console.log("Payment pending:", result);
            alert("Menunggu pembayaran...");
            router.push("/profile");
          },
          onError: function (result: any) {
            console.error("Payment error:", result);
            alert("Pembayaran Gagal!");
          },
          onClose: function () {
            console.log("Customer closed the popup without finishing the payment");
          },
        });
      } else {
        console.error("Snap script not loaded yet");
        alert("Sistem pembayaran sedang memuat, silakan coba lagi sesaat lagi.");
      }

    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(error.message || "Terjadi kesalahan saat memproses pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = (plan: any) => {
      if (loading) return "Processing...";
      if (userRole === "pro" && plan.planId === "pro_monthly") return "Current Plan (Active)";
      if (userRole === "admin" && plan.planId === "pro_monthly") return "Admin Access (Active)";
      return plan.cta;
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-600/10 rounded-full border border-blue-100 dark:border-blue-900/30">
            <Sparkles className="w-4 h-4" />
            Pricing & Plans
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
            Investasi Untuk <br />
            <span className="text-blue-600">Masa Depan Digitalmu.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Pilih paket yang sesuai dengan perjalanan belajarmu. Dapatkan akses penuh ke resource terbaik AI & IoT.
          </p>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="pb-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`group relative p-10 rounded-[3rem] bg-card border transition-all duration-500 flex flex-col ${
                  plan.popular 
                    ? 'border-blue-600 shadow-2xl shadow-blue-600/20 scale-105 z-10 bg-gradient-to-b from-card to-blue-600/5' 
                    : 'border-border hover:border-blue-500/50 hover:shadow-xl'
                } ${hoveredIdx !== null && hoveredIdx !== idx ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                    Best Value
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-10 flex items-baseline gap-1">
                  <span className="text-sm font-bold text-muted-foreground">Rp</span>
                  <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground font-bold">{plan.period}</span>}
                </div>

                <div className="space-y-4 mb-12 flex-grow">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                        <Check className="w-3 h-3 text-blue-600 group-hover:text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscription(plan)}
                  disabled={loading || (userRole === "pro" && plan.planId === "pro_monthly") || (userRole === "admin" && plan.planId === "pro_monthly")}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 ${
                    plan.popular
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1'
                      : 'bg-muted text-foreground border border-border hover:bg-accent hover:-translate-y-1'
                  } ${loading || (userRole === "pro" && plan.planId === "pro_monthly") ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {getButtonText(plan)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US SECTION */}
      <section className="py-24 bg-muted border-y border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-blue-600 tracking-[0.3em] uppercase mb-4 italic">Kenapa AIOT Chain?</h2>
            <p className="text-4xl font-black">Lebih Dari Sekadar Platform Belajar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <Shield className="w-6 h-6 text-blue-600" />, title: "Transaksi Aman", desc: "Enkripsi end-to-end untuk setiap transaksi pembayaran Anda." },
              { icon: <Zap className="w-6 h-6 text-amber-500" />, title: "Akses Instan", desc: "Langganan langsung aktif dalam hitungan detik setelah pembayaran." },
              { icon: <Globe className="w-6 h-6 text-emerald-500" />, title: "Global Standard", desc: "Kurikulum yang disusun berdasarkan standar industri internasional." },
              { icon: <Sparkles className="w-6 h-6 text-purple-500" />, title: "Premium Assets", desc: "Akses ribuan model 3D dan dataset AI berkualitas tinggi." },
            ].map((item, i) => (
              <div key={i} className="p-8 bg-card rounded-[2.5rem] border border-border hover:shadow-lg transition-all group">
                <div className="mb-6 w-14 h-14 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-blue-600/5 transition-colors">
                  {item.icon}
                </div>
                <h4 className="font-black text-lg mb-3">{item.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-32 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-blue-600 tracking-[0.3em] uppercase mb-4 italic">FAQ</h2>
            <p className="text-4xl font-black">Pertanyaan Seputar Langganan</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group bg-muted rounded-[2rem] border border-border open:bg-card open:shadow-xl transition-all duration-500">
                <summary className="flex items-center justify-between p-8 list-none cursor-pointer">
                  <span className="font-black text-foreground tracking-tight">{faq.q}</span>
                  <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center group-open:rotate-180 transition-transform shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="px-8 pb-8 text-muted-foreground text-sm leading-relaxed font-medium">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
              Belum yakin? <br />
              Mulai dengan <span className="opacity-70 italic">Paket Free</span> dulu.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/register"
                className="w-full sm:w-auto px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 transition-all shadow-xl"
              >
                Daftar Akun Sekarang
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-10 py-5 bg-blue-700 text-white font-black rounded-2xl hover:bg-blue-800 transition-all border border-blue-500/30"
              >
                Tanya Dulu Ke Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SAME AS LANDING PAGE */}
      <footer className="py-20 bg-muted border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground text-xs font-bold">
            <p>© 2026 AIOT Chain Project. All rights reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Cookie Policy</span>
            </div>
            <p>Made with ✨ in Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
