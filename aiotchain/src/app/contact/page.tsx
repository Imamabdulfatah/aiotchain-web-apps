"use client";

import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import { Mail, MapPin, MessageSquare, Send, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI("/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-600/10 rounded-full border border-blue-100 dark:border-blue-900/30">
            <Sparkles className="w-4 h-4" />
            Contact Us
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
            Ada Pertanyaan? <br />
            <span className="text-blue-600">Kami Siap Membantu.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Punya ide proyek, pertanyaan seputar paket Enterprise, atau butuh bantuan teknis? Hubungi tim kami sekarang.
          </p>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="pb-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* INFO SIDE */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-black tracking-tight">Informasi Kontak</h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  Kami biasanya merespons dalam waktu kurang dari 24 jam kerja. Jangan ragu untuk menyapa!
                </p>
              </div>

              <div className="space-y-8">
                {[
                  {
                    icon: <Mail className="w-6 h-6 text-blue-600" />,
                    title: "Email Support",
                    content: "hello@aiotchain.project",
                    desc: "Kirim pertanyaan kapan saja.",
                  },
                  {
                    icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
                    title: "Live Chat",
                    content: "Tersedia di Dashboard",
                    desc: "Respons instan untuk pelanggan Pro.",
                  },
                  {
                    icon: <MapPin className="w-6 h-6 text-rose-500" />,
                    title: "Lokasi Kantor",
                    content: "Jakarta, Indonesia",
                    desc: "Digital Hub Office, BSD City.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/20 group-hover:-translate-y-1">
                      <div className="group-hover:text-white transition-colors capitalize">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-lg mb-1">{item.title}</h4>
                      <p className="text-blue-600 font-bold mb-1">{item.content}</p>
                      <p className="text-muted-foreground text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* SOCIAL LINKS */}
              <div className="pt-8 border-t border-border">
                <h4 className="font-black text-sm uppercase tracking-widest mb-6">Ikuti Kami</h4>
                <div className="flex gap-4">
                  {["Instagram", "Twitter", "LinkedIn", "GitHub"].map((social) => (
                    <button
                      key={social}
                      className="px-6 py-3 bg-muted rounded-xl text-xs font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FORM SIDE */}
            <div className="bg-card rounded-[3rem] border border-border p-8 md:p-12 shadow-2xl shadow-blue-500/5 relative">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl shadow-xl shadow-green-500/20">
                    check
                  </div>
                  <h3 className="text-3xl font-black">Pesan Terkirim!</h3>
                  <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                    Terima kasih telah menghubungi kami. Tim kami akan segera merespons melalui email Anda.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-8 py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest ml-1">Nama Lengkap</label>
                      <input
                        required
                        type="text"
                        placeholder="Zeno Dev"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest ml-1">Alamat Email</label>
                      <input
                        required
                        type="email"
                        placeholder="zeno@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest ml-1">Subjek</label>
                    <input
                      required
                      type="text"
                      placeholder="Pertanyaan seputar Enterprise"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest ml-1">Pesan Anda</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Tuliskan detail pertanyaan atau ide Anda di sini..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all resize-none"
                    ></textarea>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kirim Pesan Sekarang
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 bg-muted border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground text-xs font-bold">
            <p>© 2026 AIOT Chain Project. All rights reserved.</p>
            <p>Made with ✨ in Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
