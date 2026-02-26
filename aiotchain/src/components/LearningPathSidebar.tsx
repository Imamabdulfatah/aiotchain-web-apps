"use client";

import { fetchAPI } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getUserId } from "@/lib/auth";

interface Lesson {
  id: number;
  title: string;
  type: string;
}

interface Progress {
  lessonId: number;
  completed: boolean;
  approvalStatus: string;
}

interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface LearningPath {
  id: number;
  title: string;
  chapters: Chapter[];
}

interface LearningPathSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function LearningPathSidebar({ isOpen, onClose }: LearningPathSidebarProps) {
  const { id: pathId, moduleId } = useParams();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathId) {
      const fetchData = async () => {
        try {
          const pathData = await fetchAPI<LearningPath>(`/learning-paths/${pathId}`);
          setPath(pathData);

          const userId = getUserId();
          if (userId) {
            const progressData = await fetchAPI<Progress[]>(`/progress/user?userId=${userId}&pathId=${pathId}`);
            setProgress(progressData);
          }
        } catch (err) {
          console.error("Error fetching sidebar data:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [pathId, moduleId]);

  if (loading) return <div className="p-6 text-muted-foreground text-sm">Memuat path...</div>;
  if (!path) return <div className="p-6 text-muted-foreground text-sm">Path tidak ditemukan.</div>;

  const allLessons = path.chapters?.flatMap(c => c.lessons) || [];
  const completedLessonsCount = progress.filter(p => p.completed).length;
  const totalLessons = allLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`fixed lg:static top-0 left-0 w-80 h-full bg-card border-r border-border flex flex-col shadow-sm transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-8 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Langkah Belajar</h2>
            <p className="text-xs text-muted-foreground mt-1">{path.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-grow overflow-y-auto py-6 px-4 space-y-8">
          {path.chapters?.map((chapter) => (
            <div key={chapter.id} className="space-y-3">
              <h3 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {chapter.title}
              </h3>
              <div className="space-y-1">
                {chapter.lessons?.map((lesson) => {
                  const isActive = Number(moduleId) === lesson.id;
                  const userProgress = progress.find(p => p.lessonId === lesson.id);
                  const isCompleted = userProgress?.completed || false;
                  const isApproved = userProgress?.approvalStatus === 'approved';
                  const isPending = lesson.type === 'project' && userProgress?.approvalStatus === 'pending';
                  
                  // Sequential Logic
                  const lessonIndex = allLessons.findIndex(l => l.id === lesson.id);
                  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
                  let isLocked = false;
                  if (prevLesson) {
                    const prevProgress = progress.find(p => p.lessonId === prevLesson.id);
                    if (prevLesson.type === 'project') {
                      isLocked = prevProgress?.approvalStatus !== 'approved';
                    } else {
                      isLocked = !prevProgress?.completed;
                    }
                  }

                  const lessonLink = isLocked ? "#" : `/quiz/${pathId}/${lesson.id}`;

                  return (
                    <Link
                      key={lesson.id}
                      href={lessonLink}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault();
                          return;
                        }
                        onClose?.();
                      }}
                      className={`flex items-start gap-4 p-4 rounded-2xl transition-all group ${
                        isActive 
                          ? "bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-600/20" 
                          : isLocked
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                        isActive 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110" 
                          : isLocked
                            ? "bg-muted text-muted-foreground/30"
                            : isCompleted || isApproved
                              ? "bg-emerald-600/10 text-emerald-600"
                              : isPending
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-muted text-muted-foreground group-hover:bg-accent"
                      }`}>
                        {isLocked ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (isCompleted || isApproved) && !isActive ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isPending ? (
                          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : isActive ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                          </svg>
                        ) : (lessonIndex + 1)}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold leading-tight ${isActive ? "text-blue-600" : "text-foreground"} ${(isCompleted || isApproved) && !isActive ? "text-muted-foreground" : ""}`}>
                          {lesson.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">
                            {lesson.type === 'material' ? 'Materi' : lesson.type === 'project' ? 'Proyek' : 'Kuis'}
                          </span>
                          {isPending && (
                            <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Menunggu Admin</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Certificate Item */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h3 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Pencapaian Akhir
            </h3>
            <div className="space-y-1">
              {(() => {
                const lastLesson = allLessons[allLessons.length - 1];
                const lastProgress = lastLesson ? progress.find(p => p.lessonId === lastLesson.id) : null;
                const isAllFinished = lastLesson?.type === 'project' 
                  ? lastProgress?.approvalStatus === 'approved'
                  : lastProgress?.completed;
                
                const isLocked = !isAllFinished;

                return (
                  <Link
                    href={isLocked ? "#" : "/profile?tab=certificates"}
                    className={`flex items-start gap-4 p-4 rounded-2xl transition-all group ${
                      isLocked
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-600/5 text-blue-600 border border-blue-600/20"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                      isLocked
                        ? "bg-muted text-muted-foreground/30"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-600/30 rotate-12 group-hover:rotate-0"
                    }`}>
                      {isLocked ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        <span className="text-sm">🎓</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-black leading-tight ${isLocked ? "text-foreground" : "text-blue-600 uppercase tracking-tight"}`}>
                        Sertifikat Kursus
                      </span>
                      <span className="text-[10px] font-bold mt-1 opacity-60">
                        {isLocked ? 'Selesaikan semua modul' : 'Ambil sertifikatmu!'}
                      </span>
                    </div>
                  </Link>
                );
              })()}
            </div>
          </div>
        </nav>

        <div className="p-8 bg-muted/50 border-t border-border">
          <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Progres Belajar</div>
            <div className="flex items-center justify-between mb-1">
               <span className="text-xs font-bold text-foreground">{progressPercentage}% Selesai</span>
               <span className="text-[10px] font-bold text-muted-foreground">{completedLessonsCount}/{totalLessons}</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


