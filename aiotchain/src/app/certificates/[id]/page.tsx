"use client";

import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import { Award, CheckCircle2, Download, Share2, ShieldCheck, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CertificateData {
  id: string;
  userName: string;
  pathTitle: string;
  issuedAt: string;
  certPdfUrl?: string; // Add PDF support
  certNameX?: number;
  certNameY?: number;
  certFontSize?: number;
}

export default function CertificateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAPI<CertificateData>(`/certificates/${id}`)
        .then(async (data) => {
          setCert(data);
          if (data.certPdfUrl) {
            await generatePdfPreview(data);
          }
        })
        .catch((err) => {
          console.error("Gagal memuat sertifikat:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const generatePdfPreview = async (data: CertificateData) => {
    setIsGeneratingPdf(true);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      
      // 1. Fetch the PDF template
      const pdfUrl = data.certPdfUrl?.startsWith('/') 
        ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${data.certPdfUrl}`
        : data.certPdfUrl;
      
      const existingPdfBytes = await fetch(pdfUrl!).then(res => res.arrayBuffer());
      
      // 2. Load and modify the PDF
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      // 3. Draw the name
      // Coordinates in pdf-lib start from bottom-left
      // Backend should provide coordinates accordingly or we convert
      // For now we assume they are provided in standard PDF units
      const nameX = data.certNameX || 100;
      const nameY = data.certNameY || 400;
      const fontSize = data.certFontSize || 30;

      firstPage.drawText(data.userName, {
        x: nameX,
        y: nameY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // 4. Save and create blob
      const pdfBytes = await pdfDoc.save();
      // pdf-lib returns Uint8Array<ArrayBufferLike>; we need a concrete ArrayBuffer for Blob
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      setPdfBlobUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Gagal generate PDF preview:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownload = () => {
    if (pdfBlobUrl) {
        const link = document.createElement("a");
        link.href = pdfBlobUrl;
        link.download = `Sertifikat-${cert?.userName}.pdf`;
        link.click();
    } else {
        window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 font-bold text-4xl">!</div>
        <h1 className="text-3xl font-black text-foreground mb-4">Sertifikat Tidak Ditemukan</h1>
        <p className="text-muted-foreground max-w-md mb-8">Maaf, sertifikat dengan ID ini tidak terdaftar atau telah dicabut.</p>
        <button 
          onClick={() => router.push("/")}
          className="px-8 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-xs"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left: Certificate Card Preview */}
          <div className="lg:col-span-2 space-y-8">
            {cert.certPdfUrl && pdfBlobUrl ? (
                <div className="bg-card rounded-[3rem] border border-border overflow-hidden shadow-2xl aspect-[1.414/1] relative group animate-in zoom-in duration-500">
                    <iframe 
                        src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                        className="w-full h-full border-none"
                        title="Certificate Preview"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                         <p className="text-[10px] text-white font-black uppercase tracking-widest text-center drop-shadow-md">Verified Digital Certificate</p>
                    </div>
                </div>
            ) : isGeneratingPdf ? (
                <div className="bg-card rounded-[3rem] border border-border aspect-[1.414/1] flex flex-col items-center justify-center gap-4 shadow-xl">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-muted-foreground animate-pulse">Menyiapkan sertifikat...</p>
                </div>
            ) : (
                <div className="bg-card rounded-[3rem] border border-border p-1 lg:p-8 shadow-2xl relative overflow-hidden group">
                    {/* Decorative Glow */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                    
                    <div className="relative border-[12px] border-slate-900 dark:border-blue-900/40 p-10 lg:p-16 flex flex-col items-center text-center space-y-12">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
                        <Zap className="w-10 h-10 text-white fill-white" />
                        </div>

                        <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Certificate of Completion</p>
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none italic">
                            AIOT<span className="text-blue-600">CHAIN</span>
                        </h2>
                        </div>

                        <div className="space-y-6 w-full max-w-lg">
                        <p className="text-muted-foreground font-bold italic uppercase tracking-widest text-sm">Diberikan Kepada :</p>
                        <h3 className="text-3xl lg:text-5xl font-black border-b-4 border-slate-100 dark:border-blue-900/20 pb-4 inline-block w-full">
                            {cert.userName}
                        </h3>
                        <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                            Atas keberhasilannya menyelesaikan kurikulum <br/>
                            <span className="text-foreground font-black italic">"{cert.pathTitle}"</span>
                        </p>
                        </div>

                        <div className="grid grid-cols-2 w-full pt-10 border-t border-slate-100 dark:border-blue-900/20">
                        <div className="text-left space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID Sertifikat</p>
                            <p className="font-bold text-sm">AIOT-{cert.id}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tanggal Terbit</p>
                            <p className="font-bold text-sm">{new Date(cert.issuedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                        </div>
                        </div>
                    </div>
                </div>
            )}
            
            <p className="text-center text-xs text-muted-foreground font-medium italic">
              * Sertifikat ini adalah bukti digital yang sah atas penguasaan kompetensi di bidang AIOT.
            </p>
          </div>

          {/* Right: Info & Verification */}
          <div className="space-y-6 sticky top-32">
            <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-foreground">Terverifikasi</h4>
                  <p className="text-xs text-muted-foreground font-bold">Resmi diterbitkan oleh AIoT Academy</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-bold">Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-500 font-black text-xs uppercase tracking-tight">
                    <CheckCircle2 className="w-3 h-3" /> Aktif
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-bold">Pemilik</span>
                  <span className="text-foreground font-black">{cert.userName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-bold">Alur Belajar</span>
                  <span className="text-foreground font-black text-right line-clamp-1">{cert.pathTitle}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <button 
                    onClick={handleDownload}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30"
                >
                  <Download className="w-5 h-5" /> Download PDF
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link disalin!");
                  }}
                  className="w-full py-4 bg-muted text-foreground rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-accent transition-all"
                >
                  <Share2 className="w-5 h-5" /> Bagikan Link
                </button>
              </div>
            </div>

            <div className="bg-blue-600/5 rounded-[2rem] border border-blue-600/10 p-8 text-center space-y-4">
              <Award className="w-12 h-12 text-blue-600 mx-auto opacity-40" />
              <h5 className="font-black text-blue-900 group-hover:text-blue-600 transition-colors">Ingin seperti {cert.userName}?</h5>
              <p className="text-xs text-blue-800/60 font-medium">Mulai petualangan belajarmu sekarang dan raih sertifikat keahlianmu sendiri.</p>
              <button 
                onClick={() => router.push("/quiz")}
                className="w-full py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/5"
              >
                Jelajahi Kursus
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
