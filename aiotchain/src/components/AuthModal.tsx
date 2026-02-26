"use client";

import { LogIn, ShieldAlert, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  title = "Akses Terbatas", 
  message = "Silakan login terlebih dahulu untuk mengakses fitur ini." 
}: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10 flex flex-col items-center text-center">
          {/* Icon Header */}
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
            <ShieldAlert className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
            {title}
          </h3>
          <p className="text-muted-foreground font-medium leading-relaxed mb-10">
            {message}
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => router.push("/login")}
              className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              <LogIn className="w-4 h-4" />
              Login Sekarang
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-muted text-muted-foreground font-bold rounded-2xl hover:bg-accent transition-all active:scale-[0.98] text-xs uppercase tracking-widest border border-border"
            >
              Batal
            </button>
          </div>

          <p className="mt-8 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
            AIOT Chain Security Panel
          </p>
        </div>
      </div>
    </div>
  );
}
