"use client";

import { GateType } from "@/data/logicGateLevels";
import { Triangle, XCircle, Zap } from "lucide-react";
import React from "react";

interface LogicGateProps {
  type: GateType;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

const GATE_ICONS: Record<GateType, React.ReactElement> = {
  AND: <Zap />,
  OR: <Zap className="rotate-45" />,
  NOT: <Triangle className="rotate-90" />,
  XOR: <Zap className="border-b-2" />,
  NAND: <XCircle />,
  NOR: <XCircle className="rotate-45" />,
};

export default function LogicGate({ type, isActive = false, onClick, className = "", id }: LogicGateProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-2 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer group
        ${isActive 
          ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105" 
          : "bg-card border-border hover:border-blue-400 hover:shadow-lg"}
        ${className}
      `}
    >
      <div className={`
        mb-1 md:mb-2 p-1.5 md:p-3 rounded-lg md:rounded-xl transition-colors
        ${isActive ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground group-hover:text-blue-500"}
      `}>
        {React.cloneElement(GATE_ICONS[type] as any, { 
          className: `w-4 h-4 md:w-6 md:h-6 ${(GATE_ICONS[type] as any).props.className || ""}` 
        })}
      </div>
      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{type}</span>
      
      {/* Input pins */}
      <div className="absolute left-0 top-1/4 -translate-x-1/2 w-2 h-2 rounded-full bg-border group-hover:bg-blue-400 gate-pin-in-1"></div>
      {type !== "NOT" && (
        <div className="absolute left-0 top-3/4 -translate-x-1/2 w-2 h-2 rounded-full bg-border group-hover:bg-blue-400 gate-pin-in-2"></div>
      )}
      
      {/* Output pin */}
      <div className="absolute right-0 top-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-background shadow-[0_0_10px_rgba(59,130,246,0.5)] gate-pin-out"></div>
    </div>
  );
}
