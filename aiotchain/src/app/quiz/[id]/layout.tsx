"use client";

import LearningPathSidebar from "@/components/LearningPathSidebar";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function QuizLayoutContent({ children }: { children: React.ReactNode }) {
  const { moduleId } = useParams();
  const searchParams = useSearchParams();
  const isQuizActive = searchParams.get("quiz") === "active";
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isPlayerPage = !!moduleId;
  
  const showSidebar = isPlayerPage && !isQuizActive;
  const showHeader = isPlayerPage && !isQuizActive;
  const showNavbar = !isPlayerPage && !isQuizActive;

  return (
    <div className={`min-h-screen ${isQuizActive ? 'bg-background' : 'bg-background'} flex flex-col h-screen overflow-hidden`}>
      {showNavbar && <Navbar />}
      <div className="flex-grow flex overflow-hidden">
        {showSidebar && (
          <LearningPathSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        )}
        <main className={`flex-grow overflow-y-auto ${isPlayerPage ? (isQuizActive ? 'bg-background' : 'bg-background') : ''}`}>
          {showHeader && (
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-30 px-6 sm:px-12 h-20 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile Toggle Button */}
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <Link href="/quiz" className="w-10 h-10 rounded-xl hover:bg-slate-900 group flex items-center justify-center text-muted-foreground transition-colors">
                  <svg className="w-6 h-6 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <span className="text-[10px] sm:text-xs font-black text-muted-foreground/30 uppercase tracking-widest truncate max-w-[120px] sm:max-w-none">
                  Akademi AIoT Specialist
                </span>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progres Belajar</p>
                   <p className="text-xs font-bold text-foreground">75% Selesai</p>
                 </div>
                 <div className="w-40 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                   <div className="w-3/4 h-full bg-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
                 </div>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function LearningPathLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen bg-background"></div>}>
      <QuizLayoutContent>{children}</QuizLayoutContent>
    </Suspense>
  );
}
