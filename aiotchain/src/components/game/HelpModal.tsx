"use client";

import { GateType } from "@/data/logicGateLevels";
import { CircuitBoard, Cpu, Lightbulb, ShieldCheck, X, Zap } from "lucide-react";

interface HelpModalProps {
  onClose: () => void;
}

const GATE_DESCRIPTIONS: Record<GateType, { desc: string; truth: string }> = {
  AND: {
    desc: "Output berkebalikan (1) HANYA jika KEDUA input bernilai 1.",
    truth: "1 & 1 = 1, sisanya 0"
  },
  OR: {
    desc: "Output bernilai 1 jika SETIDAKNYA SATU input bernilai 1.",
    truth: "1 | 0 = 1, 1 | 1 = 1, sisanya 0"
  },
  NOT: {
    desc: "Membalikkan input. Mengubah 0 jadi 1, atau 1 jadi 0.",
    truth: "!1 = 0, !0 = 1"
  },
  XOR: {
    desc: "Output bernilai 1 jika input BERBEDA.",
    truth: "1 ^ 0 = 1, 0 ^ 1 = 1, sisanya 0"
  },
  NAND: {
    desc: "NOT AND. Output bernilai 0 HANYA jika keduanya 1.",
    truth: "!(1 & 1) = 0"
  },
  NOR: {
    desc: "NOT OR. Output bernilai 1 HANYA jika keduanya 0.",
    truth: "!(0 | 0) = 1"
  }
};

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="p-8 border-b border-border flex items-center justify-between font-sans">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
              <CircuitBoard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">Manual Lab Logika</h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Protokol & Komponen</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-muted rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide space-y-12 font-sans">
          
          {/* How to Play */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-black uppercase tracking-tight">Aturan Utama</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-muted/50 rounded-3xl border border-border shadow-sm">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black mb-4 italic">1</div>
                 <h4 className="font-black text-xs uppercase tracking-widest mb-2">Analisis Input</h4>
                 <p className="text-muted-foreground text-xs leading-relaxed font-medium">Perhatikan sinyal aktif (1) atau nonaktif (0) pada panel sebelah kiri.</p>
              </div>
              <div className="p-6 bg-muted/50 rounded-3xl border border-border shadow-sm">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black mb-4 italic">2</div>
                 <h4 className="font-black text-xs uppercase tracking-widest mb-2">Susun Logika</h4>
                 <p className="text-muted-foreground text-xs leading-relaxed font-medium">Tarik atau klik gerbang ke slot yang tersedia. Gabungkan untuk mencapai target.</p>
              </div>
              <div className="p-6 bg-muted/50 rounded-3xl border border-border shadow-sm">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black mb-4 italic">3</div>
                 <h4 className="font-black text-xs uppercase tracking-widest mb-2">Bonus Efisiensi</h4>
                 <p className="text-muted-foreground text-xs leading-relaxed font-medium">Gunakan jumlah gerbang paling sedikit untuk meminimalkan delay sirkuit.</p>
              </div>
            </div>
          </section>

          {/* Component Encyclopedia */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-black uppercase tracking-tight">Komponen Inti</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {Object.entries(GATE_DESCRIPTIONS).map(([type, info]) => (
                 <div key={type} className="p-6 bg-card border border-border rounded-[2.5rem] hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Zap className="w-5 h-5" />
                       </div>
                       <h4 className="font-black text-foreground">Gerbang {type}</h4>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium mb-4 leading-relaxed italic line-clamp-2">
                       {info.desc}
                    </p>
                    <div className="bg-muted px-4 py-2 rounded-xl border border-border">
                       <code className="text-[10px] font-black text-blue-600 tracking-widest">{info.truth}</code>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Visual Indicators */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
               <Lightbulb className="w-5 h-5 text-blue-600" />
               <h3 className="text-lg font-black uppercase tracking-tight">Sinyal Visual</h3>
             </div>
             <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-4">
                   <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                   <span className="text-xs font-black text-muted-foreground uppercase tracking-widest italic">Logic High (1) / Aktif</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-4 h-4 rounded-full bg-slate-800"></div>
                   <span className="text-xs font-black text-muted-foreground uppercase tracking-widest italic">Logic Low (0) / Nonaktif</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                   <span className="text-xs font-black text-muted-foreground uppercase tracking-widest italic">Output Cocok</span>
                </div>
             </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border flex justify-end font-sans">
          <button
            onClick={onClose}
            className="px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
          >
            Mengerti & Sinkronisasi
          </button>
        </div>
      </div>
    </div>
  );
}
