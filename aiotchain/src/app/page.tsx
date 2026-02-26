"use client";

import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const data = await fetchAPI<{message?: string; error?: string}>("/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSubmitStatus({
        type: "success",
        message: data.message || "Pesan berhasil dikirim!",
      });
      setFormData({ name: "", email: "", category: "General Inquiry", message: "" });
    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        message: err.message || "Gagal mengirim pesan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-600/10 rounded-full">
            Platform Belajar & Berbagi
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-8 tracking-tight">
            Eksplorasi Teknologi <br />
            <span className="text-blue-600">AI & IoT</span> Lebih Dalam.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Dapatkan artikel mendalam mengenai perkembangan teknologi terkini dan uji kemampuanmu melalui kuis interaktif AIOT Chain.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/blog" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-600/20"
            >
              Baca Artikel
            </Link>
            <Link 
              href="/quiz" 
              className="w-full sm:w-auto px-8 py-4 bg-card text-foreground font-bold rounded-2xl border border-border hover:bg-accent transition-all"
            >
              Mulai Kuis
            </Link>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-400 rounded-full blur-[120px]"></div>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-8 bg-card rounded-3xl shadow-sm border border-border">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Update Cepat</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Informasi teknologi terbaru yang dikurasi khusus untuk perkembangan industri AI dan IoT.</p>
            </div>
            <div className="p-8 bg-card rounded-3xl shadow-sm border border-border">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Kuis Adaptif</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Uji pengetahuanmu dengan berbagai level kuis yang menantang dan edukatif.</p>
            </div>
            <div className="p-8 bg-card rounded-3xl shadow-sm border border-border">
              <div className="text-3xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Resource Lengkap</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Akses berbagai tutorial dan dokumentasi proyek nyata dari komunitas AIOT.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS SECTION */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-4 italic">Collaborative Partners</h2>
            <p className="text-3xl font-black text-foreground">Dipercaya oleh Perusahaan & Institusi</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             {/* Simulating partner logos with stylized text and icons */}
             <div className="flex items-center gap-2 grayscale hover:grayscale-0 cursor-default transition-all">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black">T</div>
                <span className="text-xl font-bold text-foreground">TechCorp</span>
             </div>
             <div className="flex items-center gap-2 grayscale hover:grayscale-0 cursor-default transition-all">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">I</div>
                <span className="text-xl font-bold text-foreground">IOTLabs</span>
             </div>
             <div className="flex items-center gap-2 grayscale hover:grayscale-0 cursor-default transition-all">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black">A</div>
                <span className="text-xl font-bold text-foreground">AiVenture</span>
             </div>
             <div className="flex items-center gap-2 grayscale hover:grayscale-0 cursor-default transition-all">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black">N</div>
                <span className="text-xl font-bold text-foreground">NextGen</span>
             </div>
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 cursor-default transition-all">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black">S</div>
                <span className="text-xl font-bold text-foreground">SmartSystems</span>
              </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 bg-muted relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 dark:bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-4 italic">Success Stories</h2>
              <p className="text-4xl md:text-5xl font-black text-foreground leading-tight">Apa Kata Mereka Tentang AIoT Chain?</p>
            </div>
            <div className="hidden md:block">
               <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm cursor-pointer hover:bg-accent transition-all">←</div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 cursor-pointer hover:scale-105 transition-all">→</div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Rizky Ramadhan",
                role: "IoT Engineer",
                content: "Platform ini sangat membantu saya dalam memperdalam konsep Embedded Systems dan AI terapan. Kuisnya menantang dan up-to-date!",
                avatar: "👤"
              },
              {
                name: "Sarah Wijaya",
                role: "Fullstack Developer",
                content: "Artikel-artikel di AIoT Chain ditulis dengan sangat detail. Saya belajar banyak tentang integrasi Cloud dengan perangkat keras.",
                avatar: "👤"
              },
              {
                name: "Budi Santoso",
                role: "Mahasiswa IT",
                content: "Sangat direkomendasikan untuk pemula yang ingin terjun ke dunia AI dan IoT. Komunitasnya sangat suportif dan membantu.",
                avatar: "👤"
              }
            ].map((testi, idx) => (
              <div key={idx} className="bg-card p-10 rounded-[3rem] shadow-sm border border-border hover:shadow-2xl dark:hover:shadow-blue-900/10 transition-all duration-500 group">
                <div className="text-4xl text-blue-100 dark:text-blue-900/30 mb-8 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">"</div>
                <p className="text-muted-foreground font-medium mb-10 leading-relaxed italic">{testi.content}</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl border border-border">
                    {testi.avatar}
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">{testi.name}</h4>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-4 italic">FAQ</h2>
            <p className="text-4xl font-black text-foreground leading-tight">Pertanyaan yang Sering Diajukan</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "Apa itu AIoT Chain?", a: "AIoT Chain adalah platform edukasi dan berbagi pengetahuan yang berfokus pada integrasi Artificial Intelligence (AI) dan Internet of Things (IoT)." },
              { q: "Bagaimana cara mulai belajar?", a: "Anda bisa mulai dengan membaca artikel di bagian Blog atau langsung menguji kemampuan melalui Kuis interaktif yang tersedia." },
              { q: "Apakah platform ini gratis?", a: "Ya, sebagian besar konten utama AIoT Chain dapat diakses secara gratis oleh seluruh komunitas pengembang di Indonesia." },
              { q: "Bagaimana cara berkontribusi?", a: "Anda dapat berkontribusi dengan membagikan asset 3D atau menulis artikel teknis melalui dashboard pengguna setelah mendaftar." }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-muted rounded-[2rem] border border-border open:bg-card open:shadow-xl transition-all duration-500">
                <summary className="flex items-center justify-between p-8 list-none cursor-pointer">
                  <span className="font-black text-foreground tracking-tight">{faq.q}</span>
                  <span className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center text-xs group-open:rotate-180 transition-transform shadow-sm text-foreground">↓</span>
                </summary>
                <div className="px-8 pb-8 text-muted-foreground text-sm leading-relaxed font-medium">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT & COMPLAINT SECTION */}
      <section className="py-24 bg-card text-foreground relative overflow-hidden border-t border-border">
        {/* Animated Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div>
                <h2 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-4 italic">Get In Touch</h2>
                <p className="text-5xl font-black leading-tight tracking-tight">Punya Masalah atau <br /><span className="text-blue-600">Ingin Berdiskusi?</span></p>
                <p className="text-muted-foreground mt-6 leading-relaxed max-w-md">Kami siap mendengarkan pengaduan, saran, atau potensi kerjasama dari Anda. Kirimkan pesan sekarang!</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6 group">
                   <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-xl group-hover:bg-blue-600 transition-all duration-500">📍</div>
                   <div>
                      <h4 className="font-bold text-foreground">Office Location</h4>
                      <p className="text-sm text-muted-foreground">Jakarta Selatan, Indonesia</p>
                   </div>
                </div>
                <div className="flex items-center gap-6 group">
                   <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-xl group-hover:bg-blue-600 transition-all duration-500">📨</div>
                   <div>
                      <h4 className="font-bold text-foreground">Email Address</h4>
                      <p className="text-sm text-muted-foreground">support@aiotchain.id</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-muted p-10 md:p-14 rounded-[4rem] border border-border shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      minLength={3}
                      maxLength={255}
                      className="w-full px-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-foreground placeholder-muted-foreground" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-foreground placeholder-muted-foreground" 
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Subjek / Kategori</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-foreground appearance-none cursor-pointer"
                  >
                    <option>General Inquiry</option>
                    <option>Pengaduan Layanan</option>
                    <option>Kerjasama Bisnis</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Pesan Anda</label>
                  <textarea 
                    rows={4} 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    minLength={10}
                    maxLength={2000}
                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-foreground placeholder-muted-foreground" 
                    placeholder="Tuliskan pesan atau pengaduan Anda di sini..."
                  ></textarea>
                </div>

                {/* Success/Error Message */}
                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-2xl text-sm font-bold ${
                      submitStatus.type === "success"
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:-translate-y-1 active:scale-95 transition-all ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Pesan Sekarang →"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 bg-muted border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                <span className="text-xl font-black text-foreground tracking-tighter">AIoT Chain</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Platform edukasi teknologi terdepan di Indonesia, menghubungkan inovasi AI dengan kecanggihan IoT untuk masa depan yang lebih cerdas.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center grayscale hover:grayscale-0 cursor-pointer transition-all shadow-sm">🐦</div>
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center grayscale hover:grayscale-0 cursor-pointer transition-all shadow-sm">📸</div>
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center grayscale hover:grayscale-0 cursor-pointer transition-all shadow-sm">💼</div>
              </div>
            </div>
            <div>
              <h4 className="font-black text-foreground mb-6 uppercase text-[10px] tracking-widest">Resources</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Blog & Artikel</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Kuis Interaktif</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Asset Library</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Dokumentasi API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-foreground mb-6 uppercase text-[10px] tracking-widest">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Tentang Kami</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Karir</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Kebijakan Privasi</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Syarat & Ketentuan</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-xs font-bold">
            <p>© 2026 AIOT Chain Project. All rights reserved.</p>
            <p>Made with ✨ and Next.js in Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}