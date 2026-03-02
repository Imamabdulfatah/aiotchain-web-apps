"use client";

import Navbar from "@/components/Navbar";
import HelpModal from "@/components/game/HelpModal";
import LogicGate from "@/components/game/LogicGate";
import { GateType, LOGIC_GATE_LEVELS } from "@/data/logicGateLevels";
import {
    Activity,
    BookOpen,
    CircuitBoard,
    Cpu,
    Lightbulb,
    RotateCcw,
    ShieldCheck,
    Trophy,
    Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LogicGateGame() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [slots, setSlots] = useState<(GateType | null)[]>([]);
  const [output, setOutput] = useState<number>(0);
  const [slotOutputs, setSlotOutputs] = useState<Record<number, number>>({});
  const [isSolved, setIsSolved] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [wires, setWires] = useState<{ d: string; isActive: boolean }[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  const level = LOGIC_GATE_LEVELS[currentLevelIndex];

  useEffect(() => {
    setSlots(new Array(level.gateLimit).fill(null));
    setIsSolved(false);
    setSlotOutputs({});
  }, [currentLevelIndex, level.gateLimit]);

  useEffect(() => {
    simulateLogic();
  }, [slots]);

  useEffect(() => {
    if (isFirstVisit) {
      setShowHelp(true);
      setIsFirstVisit(false);
    }
  }, []);

  // Update wires based on layout
  useEffect(() => {
    const handleResize = () => updateWires();
    updateWires();
    window.addEventListener("resize", handleResize);
    const timeout = setTimeout(updateWires, 100); // Wait for render
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [slots, currentLevelIndex, slotOutputs]);

  const simulateLogic = () => {
    const currentSlotOutputs: Record<number, number> = {};
    const inputs = level.inputs.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.value }), {} as Record<string, number>);

    // Handle dependencies with multiple passes
    for (let pass = 0; pass < 3; pass++) {
        slots.forEach((gate, i) => {
            if (!gate) {
                currentSlotOutputs[i] = 0;
                return;
            }

            const slotConns = level.connections?.filter(c => c.to === i) || [];
            const pin1Value = slotConns.find(c => c.pin === 1)?.from;
            const pin2Value = slotConns.find(c => c.pin === 2)?.from;

            const val1 = typeof pin1Value === "string" ? inputs[pin1Value] : (typeof pin1Value === "number" ? currentSlotOutputs[pin1Value] : 0);
            const val2 = typeof pin2Value === "string" ? inputs[pin2Value] : (typeof pin2Value === "number" ? currentSlotOutputs[pin2Value] : 0);

            let res = 0;
            if (gate === "AND") res = (val1 === 1 && val2 === 1) ? 1 : 0;
            else if (gate === "OR") res = (val1 === 1 || val2 === 1) ? 1 : 0;
            else if (gate === "NOT") res = val1 === 1 ? 0 : 1;
            else if (gate === "XOR") res = val1 ^ val2;
            else if (gate === "NAND") res = !(val1 === 1 && val2 === 1) ? 1 : 0;
            else if (gate === "NOR") res = !(val1 === 1 || val2 === 1) ? 1 : 0;

            currentSlotOutputs[i] = res;
        });
    }

    setSlotOutputs(currentSlotOutputs);
    
    const finalConn = level.connections?.find(c => c.to === "output");
    let finalRes = 0;
    if (finalConn) {
        finalRes = typeof finalConn.from === "string" ? inputs[finalConn.from] : (currentSlotOutputs[finalConn.from as number] || 0);
    }

    setOutput(finalRes);
    if (finalRes === level.targetOutput && slots.some(s => s !== null)) {
      setIsSolved(true);
    }
  };

  const updateWires = () => {
    if (!level.connections || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const newWires: { d: string; isActive: boolean }[] = [];

    const inputsMap = level.inputs.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.value }), {} as Record<string, number>);

    level.connections.forEach(conn => {
      const fromId = typeof conn.from === "string" ? `input-${conn.from}` : `slot-${conn.from}`;
      const toId = conn.to === "output" ? `output-master` : `slot-${conn.to}`;
      
      const fromEl = document.getElementById(fromId);
      const toEl = document.getElementById(toId);

      if (fromEl && toEl) {
        const startPin = fromEl.querySelector(".gate-pin-out")?.getBoundingClientRect() || fromEl.getBoundingClientRect();
        let endPin;
        if (conn.to === "output") {
          endPin = toEl.getBoundingClientRect();
        } else {
          const pinClass = conn.pin === 1 ? ".gate-pin-in-1" : ".gate-pin-in-2";
          endPin = toEl.querySelector(pinClass)?.getBoundingClientRect() || toEl.getBoundingClientRect();
        }

        const x1 = startPin.left + startPin.width / 2 - boardRect.left;
        const y1 = startPin.top + startPin.height / 2 - boardRect.top;
        const x2 = endPin.left + endPin.width / 2 - boardRect.left;
        const y2 = endPin.top + endPin.height / 2 - boardRect.top;

        // Curved wire path
        const d = `M${x1},${y1} C${x1 + 40},${y1} ${x2 - 40},${y2} ${x2},${y2}`;
        
        let isActive = false;
        if (typeof conn.from === "string") {
          isActive = inputsMap[conn.from] === 1;
        } else {
          isActive = slotOutputs[conn.from] === 1;
        }

        newWires.push({ d, isActive });
      }
    });
    setWires(newWires);
  };

  const handleGateDrop = (index: number, gate: GateType) => {
    const newSlots = [...slots];
    newSlots[index] = gate;
    setSlots(newSlots);
  };

  const clearBoard = () => {
    setSlots(new Array(level.gateLimit).fill(null));
    setIsSolved(false);
  };

  const nextLevel = () => {
    if (currentLevelIndex < LOGIC_GATE_LEVELS.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-blue-500/30 font-sans">
      <Navbar />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-16">
        
        <header className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 border-b border-border pb-12">
           <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-600/5 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic">
                 <ShieldCheck className="w-3.5 h-3.5" /> Pelatihan Logika Tegangan Tinggi
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-foreground tracking-tight leading-none italic uppercase">
                 Puzzle <span className="text-blue-600">Gerbang</span> Logika
              </h1>
              <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed italic">
                 Kuasai logika biner dengan membangun sirkuit yang rumit. Manipulasi sinyal digital dengan komponen elektronik standar untuk mencapai urutan target.
              </p>
           </div>
           <button 
             onClick={() => setShowHelp(true)}
             className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-card border border-border rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all shadow-sm group"
           >
             <BookOpen className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform" /> Cara Bermain
           </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* SIDEBAR: Levels & Mission */}
          <aside className="lg:col-span-1 space-y-8 order-2 lg:order-1">
            <div className="bg-card border border-border p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-blue-600">
                    <Activity className="w-5 h-5 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Sinkronisasi Simulasi</span>
                  </div>
                  <span className={`px-3 py-1 bg-muted rounded-xl text-[10px] font-black uppercase tracking-widest ${level.difficulty === 'Hard' ? 'text-red-500' : 'text-green-500'}`}>
                    {level.difficulty}
                  </span>
               </div>
               <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Level {level.id}</h3>
               <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-medium italic opacity-80">
                 "{level.description}"
               </p>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 md:p-5 bg-muted/50 rounded-2xl md:rounded-3xl border border-border">
                     <div className="flex items-center gap-4">
                       <Zap className="w-4 h-4 text-amber-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Target Output</span>
                     </div>
                     <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black text-lg md:text-xl italic shadow-inner ${level.targetOutput === 1 ? "bg-green-500/20 text-green-500" : "bg-slate-800 text-slate-500"}`}>
                       {level.targetOutput}
                     </div>
                  </div>
                  <div className="flex justify-between items-center p-4 md:p-5 bg-muted/50 rounded-2xl md:rounded-3xl border border-border">
                     <div className="flex items-center gap-4">
                       <Cpu className="w-4 h-4 text-blue-600" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Efisiensi</span>
                     </div>
                     <div className="text-base md:text-lg font-black italic">
                       {slots.filter(s => s !== null).length} / <span className="text-blue-600">{level.gateLimit}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-card border border-border p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8">Indeks Protokol</h3>
               <div className="grid grid-cols-5 gap-3 md:gap-4">
                  {LOGIC_GATE_LEVELS.map((l, i) => (
                    <button
                      key={l.id}
                      onClick={() => setCurrentLevelIndex(i)}
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl font-black italic flex items-center justify-center transition-all ${
                        currentLevelIndex === i 
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-110" 
                        : "bg-muted text-muted-foreground hover:bg-border border border-transparent"
                      }`}
                    >
                      {l.id}
                    </button>
                  ))}
               </div>
            </div>
          </aside>

          {/* MAIN GAME AREA */}
          <section className="lg:col-span-3 space-y-8 md:space-y-12 order-1 lg:order-2">
            
            {/* THE CIRCUIT BOARD */}
            <div className="relative bg-muted overflow-hidden rounded-[2.5rem] md:rounded-[5rem] border-4 md:border-[8px] border-border shadow-2xl">
              <div 
                id="circuit-board"
                ref={boardRef}
                className="relative bg-[#0a0c10] p-6 py-12 md:p-24 overflow-x-auto lg:overflow-visible"
              >
                  {/* SVG Wires Layer */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                     {wires.map((wire, i) => (
                       <path
                         key={i}
                         d={wire.d}
                         fill="none"
                         stroke={wire.isActive ? "#3b82f6" : "#1e293b"}
                         strokeWidth="4"
                         strokeLinecap="round"
                         className={`transition-all duration-300 ${wire.isActive ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : ""}`}
                       />
                     ))}
                  </svg>

                  <div className="min-w-[700px] lg:min-w-0 flex items-center justify-between gap-12 md:gap-24 relative z-10">
                     
                     {/* INPUTS PANEL */}
                     <div className="flex flex-col gap-10 md:gap-12">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 text-center italic uppercase">Sumber Tegangan</h4>
                        {level.inputs.map(input => (
                          <div key={input.id} id={`input-${input.id}`} className="group relative">
                             <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center font-black text-xl md:text-2xl transition-all duration-700 italic z-10 relative ${
                               input.value === 1 ? "bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.5)] scale-110" : "bg-slate-800 text-white/20 border border-white/5"
                             }`}>
                               {input.value}
                             </div>
                             <div className="absolute right-0 top-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#0a0c10] z-20 gate-pin-out"></div>
                          </div>
                        ))}
                     </div>

                    {/* GATE SLOTS */}
                    <div className="flex flex-wrap items-center justify-center gap-16 py-10">
                      {slots.map((gate, i) => (
                        <div key={i} id={`slot-${i}`} className="flex flex-col items-center gap-6 relative">
                          <div className={`
                            w-36 h-36 rounded-[2.5rem] border-4 border-dashed flex items-center justify-center transition-all duration-500 group relative
                            ${gate ? "border-blue-500 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]" : "border-white/5 bg-white/[0.02] hover:border-white/20"}
                          `}>
                            {gate ? (
                              <div className="relative animate-in zoom-in-50 duration-500">
                                 <LogicGate 
                                   type={gate} 
                                   isActive={true} 
                                   onClick={() => {
                                      const next = [...slots];
                                      next[i] = null;
                                      setSlots(next);
                                   }}
                                   className="scale-110"
                                 />
                                 <button className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform font-black z-30">×</button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 opacity-10">
                                 <CircuitBoard className="w-8 h-8" />
                                 <span className="text-[8px] font-black uppercase tracking-widest italic">Slot {i+1}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* OUTPUT PANEL */}
                    <div className="flex flex-col items-center gap-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 italic">Hasil Sirkuit</h4>
                        <div className="flex items-center gap-8">
                          <div 
                            id="output-master"
                            className={`w-24 h-24 rounded-[3rem] flex items-center justify-center font-black text-4xl transition-all duration-700 italic relative ${
                            output === level.targetOutput && slots.some(s => s !== null)
                            ? "bg-blue-600 text-white shadow-[0_0_60px_rgba(59,130,246,0.7)] scale-125" 
                            : "bg-slate-900 text-white/5 border border-white/5"
                          }`}>
                            <div className="absolute left-0 top-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#0a0c10] z-20"></div>
                            {output}
                          </div>
                        </div>
                    </div>
                </div>
              </div>

                {/* VICTORY OVERLAY */}
                {isSolved && (
                  <div className="absolute inset-0 bg-blue-600/95 flex flex-col items-center justify-center text-white p-12 animate-in slide-in-from-bottom duration-700 z-50 rounded-[5rem]">
                      <div className="w-28 h-28 bg-white/20 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl animate-bounce">
                        <Trophy className="w-14 h-14 text-white" />
                      </div>
                      <h2 className="text-6xl font-black mb-4 tracking-tighter italic uppercase text-center drop-shadow-2xl">Sirkuit Tersinkronisasi</h2>
                      <p className="text-blue-100 text-xl font-medium mb-16 text-center max-w-sm italic opacity-80">
                         Logika presisi tinggi terdeteksi. Protokol simulasi selesai dengan {slots.filter(s => s !== null).length} gerbang.
                      </p>
                      <div className="flex gap-6">
                        <button 
                          onClick={clearBoard}
                          className="px-12 py-6 bg-white/10 hover:bg-white/20 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                          Kalibrasi Ulang
                        </button>
                        <button 
                          onClick={nextLevel}
                          className="px-12 py-6 bg-white text-blue-600 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 shadow-2xl transition-all"
                        >
                          Mulai Level Berikutnya
                        </button>
                      </div>
                  </div>
                )}
            </div>

            {/* PALETTE: Available Logic Gates */}
            <div className="bg-card border border-border p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-8">
                  <div className="flex items-center gap-5 md:gap-6">
                     <div className="w-10 h-10 md:w-14 md:h-14 bg-muted rounded-xl md:rounded-[1.5rem] flex items-center justify-center border border-border">
                       <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                     </div>
                     <div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight italic uppercase">Palet Komponen</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic text-center md:text-left">Pilih prosesor logika Anda</p>
                     </div>
                  </div>
                  <div className="w-full md:w-auto font-sans font-bold">
                    <button onClick={clearBoard} className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-muted text-foreground border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all">
                      <RotateCcw className="w-4 h-4" /> Reset Tata Letak
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 md:gap-10 justify-center">
                    {level.allowedGates.map(gate => (
                      <div key={gate} className="relative group">
                         <LogicGate 
                           type={gate} 
                           onClick={() => {
                             const firstEmpty = slots.findIndex(s => s === null);
                             if (firstEmpty !== -1) {
                               handleGateDrop(firstEmpty, gate);
                             }
                           }}
                           className="w-24 h-24 md:w-32 md:h-32 hover:scale-110 active:scale-95 transition-all shadow-md group-hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)]"
                         />
                         <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 whitespace-nowrap bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest z-10 shadow-2xl">
                           Pasang {gate}
                         </div>
                      </div>
                    ))}
                </div>
            </div>

          </section>
        </div>

      </main>

      <footer className="py-20 border-t border-border mt-32 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white italic">A</div>
                 <span className="text-sm font-black uppercase tracking-widest">AIOT CHAIN <span className="text-blue-600">LOGIC</span></span>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">
                 Electronic simulation protocol v1.0.4
              </p>
           </div>
           <div className="flex gap-12">
             <a href="#" className="text-[10px] font-black text-muted-foreground hover:text-blue-600 uppercase tracking-widest transition-colors">Dokumentasi</a>
             <a href="#" className="text-[10px] font-black text-muted-foreground hover:text-blue-600 uppercase tracking-widest transition-colors">Hasil Lab</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
