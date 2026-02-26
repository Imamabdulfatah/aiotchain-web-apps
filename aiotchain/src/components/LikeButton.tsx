"use client";

import AuthModal from "@/components/AuthModal";
import { isLoggedIn } from "@/lib/auth";
import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  initialLikes?: number;
  onLike?: (liked: boolean) => void;
  className?: string;
}

export default function LikeButton({ initialLikes = 0, onLike, className = "" }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLike = () => {
    if (!isLoggedIn()) {
      setShowAuthModal(true);
      return;
    }

    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);
    setLikes(prev => newLikedStatus ? prev + 1 : prev - 1);
    
    if (onLike) {
      onLike(newLikedStatus);
    }
  };

  return (
    <>
      <button
        onClick={handleLike}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
        isLiked 
        ? "bg-red-600/10 text-red-600 border border-red-600/20" 
        : "bg-muted text-muted-foreground hover:bg-red-600/10 hover:text-red-500 border border-border"
      } ${className}`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? "fill-red-600" : ""}`} />
        <span>{likes}</span>
      </button>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        message="Silakan login terlebih dahulu untuk menyukai artikel ini dan mendukung penulis."
      />
    </>
  );
}
