import { getBadge } from "@/lib/utils";

interface BadgeProps {
  rank: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Badge({ rank, className = "", size = "md" }: BadgeProps) {
  const badge = getBadge(rank);
  if (!badge) return null;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[8px]",
    md: "px-2.5 py-1 text-[9px]",
    lg: "px-3 py-1.5 text-xs",
  };

  return (
    <span className={`inline-flex items-center gap-1 font-black uppercase tracking-wider rounded-full text-white shadow-sm ${badge.color} ${sizeClasses[size]} ${className}`}>
      <span>{badge.icon}</span>
      {badge.label}
    </span>
  );
}
