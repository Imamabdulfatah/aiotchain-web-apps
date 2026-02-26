"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({ title, text, url, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text || `Lihat kontent menarik ini: ${title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
        copied 
        ? "bg-emerald-600/10 text-emerald-600 border border-emerald-600/20" 
        : "bg-muted text-muted-foreground hover:bg-blue-600/10 hover:text-blue-600 border border-border hover:border-blue-600/20"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Tersalin!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Bagikan
        </>
      )}
    </button>
  );
}
