"use client";

import { Award, Calendar, Printer, ShieldCheck, User, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  courseName: string;
  date: string;
  certificateId: string;
  learningPathId?: number;
  certPdfUrl?: string; // Add PDF support
  certNameX?: number;
  certNameY?: number;
  certFontSize?: number;
}

export default function CertificateModal({
  isOpen,
  onClose,
  userName,
  courseName,
  date,
  certificateId,
  learningPathId
}: CertificateModalProps) {
  const [mounted, setMounted] = useState(false);
  const [template, setTemplate] = useState<{ 
    backgroundImage: string; 
    primaryColor: string;
    certPdfUrl?: string;
    certNameX?: number;
    certNameY?: number;
    certFontSize?: number;
  } | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) fetchTemplate();
  }, [isOpen, learningPathId]);

  const fetchTemplate = async () => {
    try {
      const { fetchAPI } = await import("@/lib/api");
      
      // 1. Fetch Global Template as base fallback
      const globalRes = await fetchAPI<any>("/certificates/template");
      let activeConfig = globalRes || { backgroundImage: "", primaryColor: "#2563eb" };

      // 2. If path-specific ID exists, try to override with path settings
      if (learningPathId) {
        const pathRes = await fetchAPI<any>(`/learning-paths/${learningPathId}`);
        if (pathRes) {
          if (pathRes.certColor) activeConfig.primaryColor = pathRes.certColor;
          if (pathRes.certBg) activeConfig.backgroundImage = pathRes.certBg;
        }
      }

      setTemplate(activeConfig);
      if (activeConfig.certPdfUrl) {
          generatePdfPreview(activeConfig);
      }
    } catch (error) {
      console.error("Gagal mengambil template:", error);
    }
  };

  const generatePdfPreview = async (config: any) => {
    setIsGeneratingPdf(true);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      
      const pdfUrl = config.certPdfUrl?.startsWith('/') 
        ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${config.certPdfUrl}`
        : config.certPdfUrl;
      
      const existingPdfBytes = await fetch(pdfUrl!).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      const nameX = config.certNameX || 100;
      const nameY = config.certNameY || 400;
      const fontSize = config.certFontSize || 30;

      firstPage.drawText(userName, {
        x: nameX,
        y: nameY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // Save and create blob
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' }); 
      setPdfBlobUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Gagal generate PDF preview:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!mounted || !isOpen) return null;

  const primaryColor = template?.primaryColor || "#2563eb";
  const bgImg = template?.backgroundImage;
  const fullBgUrl = bgImg ? (bgImg.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${bgImg}` : bgImg) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0" id="certificate-modal-container">
      {/* Backdrop - Hidden during print */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 print:hidden"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 print:shadow-none print:rounded-none print:max-w-none print:m-0 print:static border border-border">
        
        {/* Close & Actions - Hidden during print */}
        <div className="absolute top-6 right-6 flex items-center gap-2 print:hidden z-10">
          <button 
            onClick={handlePrint}
            style={{ color: primaryColor }}
            className="p-3 bg-card text-foreground rounded-2xl hover:bg-muted transition-all flex items-center gap-2 font-bold text-xs shadow-sm border border-border"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-muted text-muted-foreground rounded-2xl hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Container */}
        <div className="p-1 lg:p-12 bg-muted print:p-0 print:bg-white min-h-[400px]">
          {template?.certPdfUrl && pdfBlobUrl ? (
             <div className="bg-white shadow-2xl aspect-[1.414/1] relative group animate-in zoom-in duration-500 overflow-hidden">
                <iframe 
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                    className="w-full h-[600px] border-none"
                    title="Certificate Preview"
                />
             </div>
          ) : isGeneratingPdf ? (
             <div className="bg-white aspect-[1.414/1] flex flex-col items-center justify-center gap-4 shadow-xl h-[500px]">
                 <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-xs font-bold text-muted-foreground animate-pulse">Menyiapkan sertifikat...</p>
             </div>
          ) : (
            <div 
                className="relative bg-white border-[16px] border-slate-900 p-12 lg:p-20 overflow-hidden print:border-8"
                style={{ borderColor: primaryColor }}
            >
                
                {/* Custom Background Template Layer */}
                {fullBgUrl && (
                    <div 
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ 
                            backgroundImage: `url('${fullBgUrl}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                )}

                {/* Decorative Corner Borders */}
                <div className="absolute top-0 left-0 w-40 h-40 border-t-[32px] border-l-[32px]" style={{ borderColor: `${primaryColor}1a` }}></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 border-b-[32px] border-r-[32px]" style={{ borderColor: `${primaryColor}1a` }}></div>

                {/* Content Body */}
                <div className="relative z-10 flex flex-col items-center text-center">
                
                {/* Logo / Badge Header */}
                <div className="mb-12 flex flex-col items-center">
                    <div 
                        className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl mb-6 border-4 border-white"
                        style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}33` }}
                    >
                        <Zap className="w-12 h-12 text-white fill-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                    AIOT<span style={{ color: primaryColor }}>Chain</span> Academy
                    </h2>
                    <div className="h-1 w-20 mt-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                </div>

                <div className="space-y-4 mb-16">
                    <p className="text-sm font-black uppercase tracking-[0.4em]" style={{ color: primaryColor }}>Sertifikat Kelulusan</p>
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                        Sertifikat <br/>Prestasi
                    </h1>
                </div>

                <div className="space-y-8 mb-16 w-full max-w-2xl">
                    <p className="text-slate-400 font-bold italic text-lg uppercase tracking-widest">Diberikan Dengan Bangga Kepada</p>
                    <div className="relative">
                        <h3 className="text-4xl lg:text-6xl font-black text-slate-900 capitalize border-b-4 border-slate-100 pb-6 inline-block w-full">
                            {userName}
                        </h3>
                    </div>
                    <p className="text-slate-500 font-medium text-xl leading-relaxed">
                        Telah sukses menyelesaikan alur belajar kurikulum spesialis teknologi <br/>
                        <span className="text-slate-900 font-black italic">"{courseName}"</span>
                    </p>
                </div>

                {/* Bottom Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full pt-12 border-t border-slate-100">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Calendar className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Tanggal Lulus</span>
                        </div>
                        <p className="font-bold text-slate-900 text-lg">{date}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center relative">
                        {/* Seal / Stamp */}
                        <div className="w-32 h-32 rounded-full border-4 border-dashed p-1 flex items-center justify-center relative shadow-lg" style={{ borderColor: primaryColor }}>
                            <div className="w-full h-full rounded-full flex flex-col items-center justify-center" style={{ backgroundColor: `${primaryColor}0D` }}>
                                <ShieldCheck className="w-10 h-10" style={{ color: primaryColor }} />
                                <span className="text-[8px] font-black uppercase mt-1" style={{ color: primaryColor }}>Verified</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase mt-4 tracking-widest">Authentic Seal</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end text-center md:text-right gap-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <span className="text-[10px] font-black uppercase tracking-widest">ID Sertifikat</span>
                            <User className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-900 text-lg">AIOT-{certificateId}</p>
                    </div>
                </div>

                {/* Authentication Note */}
                <p className="mt-20 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] max-w-sm mx-auto leading-loose">
                    Sertifikat ini sah secara digital dan dapat diverifikasi melalui platform AIOT Chain Academy. 
                    Diterbitkan oleh tim instruktur AIOT Chain Specialist.
                </p>
                </div>

                {/* Watermark Background Style */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
                    <Award className="w-[600px] h-[600px] text-slate-900" />
                </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for print specifically */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-modal-container, #certificate-modal-container * {
            visibility: visible;
          }
          #certificate-modal-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
