"use client";

import { fetchAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Certificate {
  id: number;
  certificateId: string;
  userName: string;
  userEmail: string;
  pathTitle: string;
  issuedAt: string;
}

interface TemplateConfig {
  backgroundImage: string;
  primaryColor: string;
  certPdfUrl: string;
  certNameX: number;
  certNameY: number;
  certDateX: number;
  certDateY: number;
  certIdX: number;
  certIdY: number;
  certFontSize: number;
}

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [template, setTemplate] = useState<TemplateConfig>({ 
    backgroundImage: "", primaryColor: "#2563eb", certPdfUrl: "",
    certNameX: 0, certNameY: 0, certDateX: 0, certDateY: 0, certIdX: 0, certIdY: 0, certFontSize: 30
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCertificates();
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const res = await fetchAPI<TemplateConfig>("/certificates/template");
      if (res) setTemplate(res);
    } catch (error) {
      console.error("Gagal mengambil template:", error);
    }
  };

  const handleUpdateTemplate = async (newConfig: TemplateConfig) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetchAPI("/admin/certificates/template", {
        method: "PUT",
        body: JSON.stringify(newConfig)
      });
      setTemplate(newConfig);
      alert("Template berhasil diperbarui!");
    } catch (error) {
      alert("Gagal memperbarui template");
    }
  };

  const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const data = await fetchAPI<{imageUrl: string}>("/admin/upload", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": undefined as any },
      });
      if (data.imageUrl) {
        handleUpdateTemplate({ ...template, backgroundImage: data.imageUrl });
      }
    } catch (error) {
      alert("Gagal mengunggah gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetchAPI<Certificate[]>("/admin/certificates");
      setCertificates(res);
    } catch (error) {
      console.error("Gagal mengambil sertifikat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin mencabut sertifikat ini?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      await fetchAPI(`/admin/certificates/${id}`, {
        method: "DELETE",
      });
      fetchCertificates();
    } catch (error) {
      alert("Gagal mencabut sertifikat");
    }
  };

  const filteredCerts = (certificates || []).filter(c => 
    c.userName?.toLowerCase().includes(search.toLowerCase()) ||
    c.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    c.pathTitle?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Kelola Sertifikat</h1>
          <p className="text-slate-500 font-medium italic">Manajemen sertifikat yang telah diterbitkan untuk peserta.</p>
        </div>
      </div>

      {/* Template Settings */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-64 aspect-[1.4/1] bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 overflow-hidden relative group">
                {template.backgroundImage ? (
                    <img 
                        src={template.backgroundImage.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${template.backgroundImage}` : template.backgroundImage} 
                        className="w-full h-full object-cover"
                        alt="Background Template"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-2">
                        <span>🖼️ No Background</span>
                    </div>
                )}
                
                <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                        {isUploading ? "Mengunggah..." : "Ganti Background"}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadBackground} disabled={isUploading} />
                </label>
            </div>

            <div className="flex-1 space-y-6">
                <div>
                   <h3 className="text-xl font-black text-slate-900 mb-1">Tampilan Sertifikat</h3>
                   <p className="text-xs text-slate-500 font-bold italic">Upload gambar background (Disarankan: 1120x800px) untuk mengubah tampilan sertifikat secara global.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warna Utama</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="color" 
                                value={template.primaryColor}
                                onChange={(e) => setTemplate({ ...template, primaryColor: e.target.value })}
                                className="w-10 h-10 rounded-xl cursor-pointer border-none p-0 overflow-hidden"
                            />
                            <button 
                                onClick={() => handleUpdateTemplate(template)}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                            >
                                Simpan Warna
                            </button>
                        </div>
                    </div>
                    
                    {template.backgroundImage && (
                       <button 
                          onClick={() => handleUpdateTemplate({ ...template, backgroundImage: "" })}
                          className="self-end px-6 py-2.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                       >
                          Reset Background
                       </button>
                    )}
                </div>

                <div className="pt-8 border-t border-slate-50 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-black text-slate-900">PDF Global Template</h4>
                            <p className="text-[10px] text-slate-400 font-bold italic">Gunakan PDF sebagai template sertifikat bawaan.</p>
                        </div>
                        <label className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600 transition-all">
                            {isUploading ? "Uploading..." : (template.certPdfUrl ? "Ganti PDF" : "Gunakan PDF")}
                            <input 
                                type="file" 
                                className="hidden" 
                                accept=".pdf" 
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setIsUploading(true);
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    try {
                                        const data = await fetchAPI<{url: string}>("/admin/upload-file", {
                                            method: "POST",
                                            body: formData,
                                            headers: { "Content-Type": undefined as any },
                                        });
                                        if (data.url) {
                                            handleUpdateTemplate({ ...template, certPdfUrl: data.url });
                                        }
                                    } catch (error) {
                                        alert("Gagal unggah PDF");
                                    } finally {
                                        setIsUploading(false);
                                    }
                                }}
                            />
                        </label>
                    </div>

                    {template.certPdfUrl && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-3xl animate-in slide-in-from-top-2 duration-500">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">X Nama</label>
                                <input type="number" step="0.1" value={template.certNameX} onChange={(e) => setTemplate({...template, certNameX: Number(e.target.value)})} className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Y Nama</label>
                                <input type="number" step="0.1" value={template.certNameY} onChange={(e) => setTemplate({...template, certNameY: Number(e.target.value)})} className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Font Size</label>
                                <input type="number" value={template.certFontSize} onChange={(e) => setTemplate({...template, certFontSize: Number(e.target.value)})} className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold" />
                             </div>
                             <div className="flex items-end gap-2">
                                <button onClick={() => handleUpdateTemplate(template)} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Update</button>
                                <button onClick={() => handleUpdateTemplate({...template, certPdfUrl: ""})} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          🔍
        </div>
        <input 
          type="text"
          placeholder="Cari nama, email, atau alur belajar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Peserta</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Alur Belajar</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">ID Sertifikat</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Tgl Terbit</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-400 font-bold italic text-xs">Memuat data sertifikat...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic bg-slate-50/20">
                    Belum ada sertifikat yang diterbitkan atau ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{cert.userName}</span>
                        <span className="text-[10px] font-bold text-slate-400">{cert.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                        {cert.pathTitle}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-mono text-xs text-slate-600 font-bold tracking-tight">
                      {cert.certificateId}
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-bold text-xs">
                      {new Date(cert.issuedAt).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleRevoke(cert.id)}
                        className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-lg shadow-red-200"
                      >
                        Cabut
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
