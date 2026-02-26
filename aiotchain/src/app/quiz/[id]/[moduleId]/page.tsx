"use client";

import { fetchAPI } from "@/lib/api";
import { getUserId, isLoggedIn } from "@/lib/auth";
import { formatContent } from "@/lib/utils";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";



interface Question {
  id: number;
  questionText: string;
  options: string;
  correctAnswer: string;
}

interface Module {
  id: number;
  title: string;
  description: string;
  type: 'material' | 'quiz' | 'project';
  content?: string;
  videoUrl?: string;
  projectFileUrl?: string;
  projectDriveLink?: string;
  allowZipSubmission?: boolean;
  allowDriveSubmission?: boolean;
  questions?: Question[];
  pdfUrl?: string;
}


export default function ModulePlayPage() {
  const { id: pathId, moduleId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isQuizActive = searchParams.get("quiz") === "active";
  
  const [module, setModule] = useState<Module | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isQuizIntro, setIsQuizIntro] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Submission state
  const [submissionFileUrl, setSubmissionFileUrl] = useState("");
  const [submissionDriveLink, setSubmissionDriveLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // Quiz cooldown state
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [onCooldown, setOnCooldown] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      alert("Silakan login terlebih dahulu untuk mengakses materi ini.");
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    const checkAccessAndLoad = async () => {
      try {
        const pathData = await fetchAPI<any>(`/learning-paths/${pathId}`);
        const allLessons = pathData.chapters.flatMap((c: any) => c.lessons);
        const lessonIndex = allLessons.findIndex((m: any) => m.id === Number(moduleId));
        
        if (lessonIndex > 0) {
           const userId = getUserId();
           const progressData = await fetchAPI<any[]>(`/progress/user?userId=${userId}&pathId=${pathId}`);
           const prevLesson = allLessons[lessonIndex - 1];
           const prevProgress = progressData.find(p => p.lessonId === prevLesson.id);
           
           let locked = false;
           if (prevLesson.type === 'project') {
             locked = prevProgress?.approvalStatus !== 'approved';
           } else {
             locked = !prevProgress?.completed;
           }
           
           if (locked) {
             setIsLocked(true);
             setLoading(false);
             return;
           }
        }

        const moduleData = await fetchAPI<Module>(`/quizzes/${moduleId}`);
        setModule(moduleData);
        if (moduleData.type === 'quiz' && moduleData.questions) {
          setQuestions(moduleData.questions);
          setUserAnswers(new Array(moduleData.questions.length).fill(""));
        }
      } catch (err) {
        console.error("Error loading module:", err);
        router.push("/quiz");
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndLoad();
  }, [moduleId, pathId, router]);

  // Fetch existing progress/submission
  useEffect(() => {
    const userId = getUserId();
    if (userId && module?.type === 'project') {
      fetchAPI<any>(`/progress/detail?userId=${userId}&lessonId=${moduleId}`)
        .then((data) => {
           if (data.submissionFileUrl) setSubmissionFileUrl(data.submissionFileUrl);
           if (data.submissionDriveLink) setSubmissionDriveLink(data.submissionDriveLink);
           if (data.approvalStatus) setApprovalStatus(data.approvalStatus);
           if (data.adminNote) setAdminNote(data.adminNote);
        })
        .catch(() => {});
    }

    // Check quiz cooldown on load
    if (userId && module?.type === 'quiz') {
      fetchAPI<{ remainingSeconds: number; onCooldown: boolean }>(
        `/progress/cooldown?userId=${userId}&lessonId=${moduleId}`
      ).then(data => {
        if (data.onCooldown) {
          setOnCooldown(true);
          setCooldownSeconds(data.remainingSeconds);
        }
      }).catch(() => {});
    }
  }, [module, moduleId]);

  // Countdown timer effect
  useEffect(() => {
    if (!onCooldown || cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setOnCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onCooldown, cooldownSeconds]);

  const formatCooldown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };


  const startQuiz = () => {
    setIsQuizIntro(false);
    router.push("?quiz=active");
  };

  const handleAnswer = (selected: string) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIdx] = selected;
    setUserAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleFinish = async () => {
    // Calculate final score
    let finalScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setShowResult(true);
    router.push("?");

    // Record failure if score < 80%
    const percentage = Math.round((finalScore / questions.length) * 100);
    if (percentage < 80) {
      const userId = getUserId();
      if (userId) {
        try {
          await fetchAPI("/progress/quiz-failed", {
            method: "POST",
            body: JSON.stringify({ userId: Number(userId), lessonId: Number(moduleId) }),
          });
          setCooldownSeconds(180);
          setOnCooldown(true);
        } catch {}
      }
    }
  };

  // Submit project to DB for admin review (separate from navigation)
  const handleSubmitProject = async () => {
    const userId = getUserId();
    console.log("[Kirim Proyek] userId:", userId);
    console.log("[Kirim Proyek] submissionFileUrl:", submissionFileUrl);
    console.log("[Kirim Proyek] submissionDriveLink:", submissionDriveLink);
    console.log("[Kirim Proyek] moduleId:", moduleId);

    if (!userId) {
      const token = localStorage.getItem("adminToken");
      console.error("[Kirim Proyek] userId is null. Token exists:", !!token);
      if (token) {
        try {
          const { jwtDecode } = require("jwt-decode");
          console.log("[Kirim Proyek] Decoded token snippet:", jwtDecode(token));
        } catch (e) {
          console.error("[Kirim Proyek] Failed to decode token manually:", e);
        }
      }
      alert("Sesi login tidak ditemukan. Silakan login ulang.");
      return;
    }
    if (!submissionFileUrl && !submissionDriveLink) {
      alert("Silakan upload file atau masukkan link Google Drive terlebih dahulu.");
      return;
    }

    const payload = {
      userId: Number(userId),
      lessonId: Number(moduleId),
      submissionFileUrl: submissionFileUrl || "",
      submissionDriveLink: submissionDriveLink || "",
    };
    console.log("[Kirim Proyek] Sending payload:", payload);

    setIsSubmitting(true);
    try {
      const result = await fetchAPI("/progress/complete", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("[Kirim Proyek] Success:", result);
      setApprovalStatus("pending");
      alert("Proyek berhasil dikirim! Menunggu persetujuan admin.");
    } catch (err: any) {
      console.error("[Kirim Proyek] Error:", err);
      alert("Gagal mengirim proyek: " + (err.message || "Unknown error. Cek konsol browser (F12)."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = async () => {
    try {
      const isQuiz = module?.type === 'quiz';
      const totalQuestions = questions.length;
      const percentage = Math.round((score / totalQuestions) * 100);
      const isPass = isQuiz ? percentage >= 80 : true;

      // Only save progress if it's a material/project OR a passing quiz
      if (!isQuiz || isPass) {
        const userId = getUserId();
        if (userId) {
          await fetchAPI("/progress/complete", {
            method: "POST",
            body: JSON.stringify({ 
              userId, 
              lessonId: Number(moduleId),
              submissionFileUrl: module?.type === 'project' ? submissionFileUrl : "",
              submissionDriveLink: module?.type === 'project' ? submissionDriveLink : ""
            }),
          });
        }
      } else {
        // If fail, don't allow next step
        alert("Anda harus mencapai skor minimal 80% untuk melanjutkan.");
        return;
      }

      const pathData = await fetchAPI<any>(`/learning-paths/${pathId}`);
      const allLessons = pathData.chapters.flatMap((c: any) => c.lessons);
      const currentIndex = allLessons.findIndex((m: any) => m.id === Number(moduleId));
      
      if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
        router.push(`/quiz/${pathId}/${allLessons[currentIndex + 1].id}`);
      } else {
        router.push(`/quiz/${pathId}`);
      }
    } catch (err) {
      router.push("/quiz");
    }
  };


  const goToPreviousStep = async () => {
    try {
      const pathData = await fetchAPI<any>(`/learning-paths/${pathId}`);
      const allLessons = pathData.chapters.flatMap((c: any) => c.lessons);
      const currentIndex = allLessons.findIndex((m: any) => m.id === Number(moduleId));
      
      if (currentIndex > 0) {
        router.push(`/quiz/${pathId}/${allLessons[currentIndex - 1].id}`);
      } else {
         router.push(`/quiz/${pathId}`);
      }
    } catch (err) {
      router.push("/quiz");
    }
  };


  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
      <div className="w-12 h-12 bg-slate-100 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Menyiapkan Modul...</p>
    </div>
  );

  if (!module) return <div className="p-20 text-center font-bold text-muted-foreground">Modul tidak ditemukan.</div>;
  
  if (isLocked) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-background">
        <div className="max-w-lg w-full bg-card rounded-[40px] border border-border shadow-2xl p-8 sm:p-12 text-center space-y-8">
          <div className="w-20 h-20 bg-muted rounded-[24px] flex items-center justify-center mx-auto text-foreground">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-foreground">Modul Terkunci</h1>
            <p className="text-muted-foreground font-medium">Selesaikan materi sebelumnya terlebih dahulu untuk membuka modul ini.</p>
          </div>
          <button onClick={() => router.push(`/quiz/${pathId}`)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30">
            Kembali ke Beranda Kursus
          </button>
        </div>
      </div>
    );
  }

  // Show cooldown screen instead of quiz intro
  if (module.type === 'quiz' && onCooldown) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-background">
        <div className="max-w-lg w-full bg-card rounded-[40px] border border-border shadow-2xl p-8 sm:p-12 text-center space-y-8">
          <div className="w-20 h-20 bg-rose-500/10 rounded-[24px] flex items-center justify-center mx-auto text-rose-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-foreground">Waktu Tunggu Aktif</h1>
            <p className="text-muted-foreground font-medium">Anda belum lulus kuis ini. Silakan tunggu sebelum mencoba lagi.</p>
          </div>
          <div className="text-7xl font-black tabular-nums text-rose-500">
            {formatCooldown(cooldownSeconds)}
          </div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Gunakan waktu ini untuk mempelajari kembali materi</p>
          <button onClick={goToPreviousStep} className="w-full py-4 bg-muted text-muted-foreground rounded-2xl font-black hover:bg-accent transition-all">
            Kembali ke Materi
          </button>
        </div>
      </div>
    );
  }

  if (module.type === 'quiz' && isQuizIntro) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-background">
        <div className="max-w-2xl w-full bg-card rounded-[40px] border border-border shadow-2xl p-8 sm:p-12 text-center space-y-8">
          <div className="w-20 h-20 bg-amber-500/10 rounded-[24px] flex items-center justify-center mx-auto text-amber-500 shadow-xl shadow-amber-500/10">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">Ketentuan Kuis</h1>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">Anda harus mencapai skor minimal <span className="text-blue-600 font-black">80%</span> untuk menyelesaikan modul ini dan melanjutkan ke materi berikutnya.</p>
          </div>
          
          <div className="bg-muted rounded-3xl p-6 grid grid-cols-2 gap-4">
            <div className="text-center p-4">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Soal</div>
              <div className="text-2xl font-black text-foreground">{questions.length} Soal</div>
            </div>
            <div className="text-center p-4 border-l border-border">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Syarat Lulus</div>
              <div className="text-2xl font-black text-blue-600">80% Benar</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={goToPreviousStep}
              className="px-8 py-5 bg-muted text-muted-foreground rounded-2xl font-black text-lg hover:bg-accent transition-all"
            >
              Kembali
            </button>
            <button 
              onClick={startQuiz}
              className="flex-grow px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30"
            >
              Mulai Kuis Sekarang
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPass = percentage >= 80;

    return (
      <div className="h-full flex items-center justify-center p-12 bg-background">
        <div className="max-w-xl w-full text-center space-y-12">
          <div className="relative inline-block">
             <div className={`w-48 h-48 rounded-[64px] bg-card border-8 border-background shadow-2xl flex flex-col items-center justify-center mx-auto transition-transform hover:scale-105 duration-500 ${isPass ? 'shadow-emerald-500/10' : 'shadow-rose-500/10'}`}>
               <span className={`text-6xl font-black ${isPass ? 'text-emerald-500' : 'text-rose-500'}`}>{percentage}%</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Skor Anda</span>
             </div>
             <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-3xl ${isPass ? 'bg-emerald-500' : 'bg-rose-500'} text-white flex items-center justify-center shadow-xl`}>
                {isPass ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
             </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              {isPass ? 'Selamat, Anda Lulus!' : 'Hasil Belum Cukup'}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-sm mx-auto font-medium">
              {isPass 
                ? `Luar biasa! Skor Anda ${percentage}% sudah melewati batas minimal 80%. Silakan lanjut ke modul berikutnya.` 
                : `Sayang sekali, skor Anda ${percentage}% belum mencapai minimal 80%. Anda harus menunggu 3 menit sebelum mencoba lagi.`}
            </p>
            {!isPass && onCooldown && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <p className="text-rose-600 font-black text-2xl tabular-nums">{formatCooldown(cooldownSeconds)}</p>
                <p className="text-rose-400 text-xs font-bold mt-1">Waktu tunggu tersisa</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {isPass ? (
              <button 
                onClick={goToNextStep}
                className="w-full py-4 sm:py-6 bg-blue-600 text-white rounded-2xl sm:rounded-[28px] font-black text-sm sm:text-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-95"
              >
                Lanjutkan
              </button>
            ) : (
              <button 
                onClick={() => window.location.reload()}
                disabled={onCooldown}
                className="w-full py-4 sm:py-6 bg-rose-600 text-white rounded-2xl sm:rounded-[28px] font-black text-sm sm:text-xl hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {onCooldown ? `Tunggu ${formatCooldown(cooldownSeconds)}` : "Coba Lagi"}
              </button>
            )}
            <button 
              onClick={() => window.location.reload()}
              className={`w-full py-3 sm:py-6 bg-transparent text-muted-foreground rounded-2xl sm:rounded-[28px] font-black text-xs sm:text-lg hover:text-foreground transition-colors ${isPass ? '' : 'hidden'}`}
            >
              Ulangi Kuis
            </button>
            {!isPass && (
              <button 
                onClick={goToPreviousStep}
                className="w-full py-3 sm:py-6 bg-transparent text-muted-foreground rounded-2xl sm:rounded-[28px] font-black text-xs sm:text-lg hover:text-foreground transition-colors"
              >
                Kembali ke Materi
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }


  if (module.type === 'material') {
    const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = module.videoUrl ? getYouTubeId(module.videoUrl) : null;

    return (
      <div className="max-w-4xl mx-auto py-32 px-16 bg-background">
        <header className="mb-16 space-y-4">
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Materi Belajar</span>
            <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{module.title.length * 2} Detik Baca</span>
          </div>
          <h1 className="text-5xl font-black text-foreground leading-[1.1] tracking-tight">{module.title}</h1>
        </header>

        {videoId && (
          <div className="mb-16">
            <div className="youtube-wrapper">
              <iframe 
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <article className="prose dark:prose-invert prose-slate prose-xl max-w-none">
          <div 
            className="text-muted-foreground leading-[1.8] space-y-8 font-medium rich-text-content"
            dangerouslySetInnerHTML={{ __html: formatContent(module.content || "Konten materi masih kosong.") }}
          />
        </article>

        {module.pdfUrl && (
          <div className="mt-16 p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[40px] border border-blue-100 dark:border-blue-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="space-y-1">
                <h3 className="text-xl font-black text-blue-900 dark:text-blue-400 leading-tight">Materi PDF</h3>
                <p className="text-xs font-bold text-blue-700/60 dark:text-blue-500/60 max-w-sm">Tersedia dokumen tambahan dalam format PDF untuk membantu Anda belajar.</p>
             </div>
             <a 
               href={module.pdfUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${module.pdfUrl}` : module.pdfUrl}
               target="_blank"
               className="w-full md:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all text-center flex items-center justify-center gap-3"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Buka Materi PDF
             </a>
          </div>
        )}


        <footer className="mt-24 pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          <div className="flex items-center gap-4 text-muted-foreground">
             <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground shrink-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <p className="text-xs sm:text-sm font-bold">Tekan tombol lanjut untuk menyelesaikan</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={goToPreviousStep} 
              className="flex-1 sm:flex-none px-6 sm:px-10 py-4 sm:py-6 bg-muted text-muted-foreground rounded-2xl sm:rounded-[28px] font-black text-sm sm:text-xl hover:bg-accent transition-all active:scale-95"
            >
              Kembali
            </button>
            <button 
              onClick={goToNextStep} 
              className="flex-[2] sm:flex-none px-8 sm:px-14 py-4 sm:py-6 bg-blue-600 text-white rounded-2xl sm:rounded-[28px] font-black text-sm sm:text-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-95"
            >
              Lanjutkan
            </button>
          </div>
        </footer>

      </div>
    );
  }

  if (module.type === 'project') {
    return (
      <div className="max-w-4xl mx-auto py-32 px-16 bg-background">
        <header className="mb-16 space-y-4">
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 bg-emerald-600/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Proyek Akhir</span>
            <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Wajib Diselesaikan</span>
          </div>
          <h1 className="text-5xl font-black text-foreground leading-[1.1] tracking-tight">{module.title}</h1>
        </header>

        {(module.projectFileUrl || module.projectDriveLink) && (
          <div className="mb-16 p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[40px] border border-emerald-100 dark:border-emerald-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="space-y-1">
                <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400 leading-tight">Sumber Daya Proyek</h3>
                <p className="text-xs font-bold text-emerald-700/60 dark:text-emerald-500/60 max-w-sm">Unduh bahan proyek atau akses template melalui tautan di samping.</p>
             </div>
             <div className="flex gap-4 w-full md:w-auto">
                {module.projectFileUrl && (
                  <a 
                    href={module.projectFileUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${module.projectFileUrl}` : module.projectFileUrl}
                    download
                    className="flex-grow md:flex-none px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all text-center"
                  >
                    Download ZIP
                  </a>
                )}
                {module.projectDriveLink && (
                  <a 
                    href={module.projectDriveLink}
                    target="_blank"
                    className="flex-grow md:flex-none px-8 py-4 bg-background dark:bg-card border-2 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all text-center"
                  >
                    Google Drive
                  </a>
                )}
             </div>
          </div>
        )}

        <article className="prose prose-slate prose-xl max-w-none">
          <div 
            className="text-muted-foreground leading-[1.8] space-y-8 font-medium rich-text-content"
            dangerouslySetInnerHTML={{ __html: formatContent(module.content || "Instruksi proyek belum tersedia.") }}
          />
        </article>

        {/* Submission Form */}
        {(module.allowZipSubmission || module.allowDriveSubmission) && (
          <div className="mt-20 p-8 sm:p-12 bg-card rounded-[40px] border-2 border-border shadow-xl space-y-8">
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground tracking-tight">Kumpulkan Tugas Anda</h3>
                <p className="text-sm font-bold text-muted-foreground">
                   {module.allowZipSubmission && module.allowDriveSubmission 
                      ? "Pilih salah satu metode pengumpulan: Upload ZIP atau berikan Link Google Drive."
                      : module.allowZipSubmission 
                         ? "Silakan unggah file ZIP hasil pengerjaan proyek Anda."
                         : "Silakan sertakan link Google Drive untuk hasil proyek Anda."}
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {module.allowZipSubmission && (
                   <div className="space-y-4">
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Metode 1: Upload File ZIP</label>
                      <div className={`relative p-6 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-3 ${submissionFileUrl ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20' : 'border-border hover:border-blue-400 bg-muted/30'}`}>
                         {isUploading ? (
                            <div className="py-4 flex flex-col items-center space-y-3 text-blue-600 animate-pulse">
                               <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                               <span className="text-[10px] font-black uppercase tracking-widest">Mengunggah...</span>
                            </div>
                         ) : submissionFileUrl ? (
                            <>
                               <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-xs font-black text-emerald-800">Berhasil Diunggah!</p>
                                  <p className="text-[10px] font-bold text-emerald-600/60 truncate max-w-[200px]">{submissionFileUrl.split('/').pop()}</p>
                               </div>
                               <button onClick={() => setSubmissionFileUrl("")} className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:underline">Ganti File</button>
                            </>
                         ) : (
                            <>
                               <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 px-4">Pilih file .zip atau .rar (Max 50MB)</p>
                               <input 
                                  type="file" 
                                  accept=".zip,.rar,.7z"
                                  onChange={async (e) => {
                                     const file = e.target.files?.[0];
                                     if (!file) return;
                                     setIsUploading(true);
                                     const formData = new FormData();
                                     formData.append("file", file);
                                     try {
                                        const res = await fetchAPI<{url: string}>("/upload-file", {
                                           method: "POST",
                                           body: formData,
                                           headers: { "Content-Type": undefined as any }
                                        });
                                        setSubmissionFileUrl(res.url);
                                     } catch (err: any) {
                                        alert("Gagal upload: " + err.message);
                                     } finally {
                                        setIsUploading(false);
                                     }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                               />
                            </>
                         )}
                      </div>
                   </div>
                )}

                {module.allowDriveSubmission && (
                   <div className={`space-y-4 ${!module.allowZipSubmission ? 'md:col-span-2' : ''}`}>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Metode {module.allowZipSubmission ? '2' : '1'}: Link Google Drive</label>
                      <div className="h-full flex flex-col justify-start">
                         <div className="relative group">
                            <input 
                               type="url"
                               value={submissionDriveLink}
                               onChange={(e) => setSubmissionDriveLink(e.target.value)}
                               placeholder="https://drive.google.com/..."
                               className="w-full px-6 py-5 bg-muted/30 border-2 border-border rounded-[24px] font-bold text-foreground focus:border-blue-500 focus:bg-background transition-all ring-0 outline-none"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.74 3.535l11.129 19.327-4.225 7.318L3.515 10.853zm7.042 0L25.91 22.862l-4.225 7.318L10.557 10.853zM0 24.161l4.225-7.327 11.13 19.336-4.225 7.318z"/></svg>
                            </div>
                         </div>
                         <p className="mt-4 text-[10px] font-bold text-muted-foreground leading-relaxed italic">Pastikan link dapat diakses secara publik (Anyone with the link).</p>
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}


        {/* Project Submission Footer */}
        <footer className="mt-24 pt-12 border-t border-border space-y-6">

          {/* Status Banner */}
          {approvalStatus === 'approved' && (
            <div className="flex items-center gap-3 p-5 bg-emerald-50 border border-emerald-200 rounded-3xl">
              <span className="text-2xl">✅</span>
              <p className="text-sm font-bold text-emerald-800">Proyek Anda telah disetujui! Silakan klik <strong>Lanjutkan</strong> untuk melanjutkan ke modul berikutnya.</p>
            </div>
          )}
          {approvalStatus === 'pending' && (
            <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-200 rounded-3xl">
              <span className="text-2xl">⏳</span>
              <p className="text-sm font-bold text-amber-800">Proyek Anda sedang ditinjau oleh admin. Anda akan bisa melanjutkan setelah disetujui.</p>
            </div>
          )}
          {approvalStatus === 'rejected' && (
            <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-3xl">
              <span className="text-2xl">❌</span>
              <div>
                <p className="text-sm font-bold text-red-800">Proyek ditolak. Silakan perbaiki dan upload ulang.</p>
                {adminNote && <p className="text-xs text-red-600 italic mt-1">"{adminNote}"</p>}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={goToPreviousStep}
              className="w-full md:w-auto px-10 py-5 bg-muted text-muted-foreground rounded-[28px] font-black text-lg hover:bg-accent transition-all active:scale-95"
            >
              Kembali
            </button>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Phase 1: submit to DB for admin review */}
              {(!approvalStatus || approvalStatus === 'rejected') && (module.allowZipSubmission || module.allowDriveSubmission) && (
                <button
                  onClick={handleSubmitProject}
                  disabled={isSubmitting || isUploading || (!submissionFileUrl && !submissionDriveLink)}
                  className="flex-1 sm:flex-none px-10 py-5 bg-blue-600 text-white rounded-[28px] font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Mengirim...
                    </span>
                  ) : (approvalStatus === 'rejected' ? 'Kirim Ulang Proyek' : 'Kirim Proyek')}
                </button>
              )}

              {/* Phase 2: navigate after approval */}
              {approvalStatus === 'approved' && (
                <button
                  onClick={goToNextStep}
                  className="flex-1 sm:flex-none px-10 py-5 bg-emerald-600 text-white rounded-[28px] font-black text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 active:scale-95"
                >
                  Lanjutkan →
                </button>
              )}

              {/* If no submission required, show normal continue */}
              {!(module.allowZipSubmission || module.allowDriveSubmission) && (
                <button
                  onClick={goToNextStep}
                  className="flex-1 sm:flex-none px-10 py-5 bg-emerald-600 text-white rounded-[28px] font-black text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 active:scale-95"
                >
                  Selesaikan
                </button>
              )}
            </div>
          </div>
        </footer>

      </div>
    );
  }


  if (questions.length === 0) return (
    <div className="p-20 text-center space-y-6">
      <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto text-muted-foreground/30">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <p className="font-bold text-muted-foreground">Belum ada soal kuis untuk modul ini.</p>
      <button onClick={goToNextStep} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold">Lanjut</button>
    </div>
  );

  const q = questions[currentIdx];
  const optionsArray = q.options.split(",");

  return (
    <div className="h-full py-12 sm:py-24 px-6 sm:px-16 flex flex-col items-center bg-background">
      <div className="max-w-3xl w-full space-y-8 sm:space-y-16">
        <header className="space-y-6">
          <div className="flex items-center justify-between">
             <span className="px-4 py-1.5 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">Kuis Penilaian</span>
             <span className="text-xs font-black text-muted-foreground/30 uppercase tracking-widest">Pertanyaan {currentIdx + 1} / {questions.length}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
             <div 
               className="h-full bg-amber-500 transition-all duration-700 ease-out" 
               style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
             ></div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight tracking-tight">{q.questionText}</h2>
        </header>

        <div className="grid gap-4">
          {optionsArray.map((opt, i) => {
            const isSelected = userAnswers[currentIdx] === opt.trim();
            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt.trim())}
                className={`w-full text-left p-6 sm:p-8 rounded-[32px] border-2 transition-all hover:-translate-y-1 group flex items-center ${
                  isSelected 
                    ? "border-blue-600 bg-blue-600/5" 
                    : "border-border hover:border-blue-600 hover:bg-blue-600/5"
                }`}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center mr-6 sm:mr-8 font-black text-xl transition-all shadow-sm ${
                  isSelected 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-muted border-border group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={`text-lg sm:text-xl font-bold transition-colors ${
                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}>
                  {opt.trim()}
                </span>
              </button>
            );
          })}
        </div>

        <footer className="flex flex-col sm:flex-row items-center gap-4 pt-8">
           <button 
             onClick={handlePrevious}
             disabled={currentIdx === 0}
             className={`w-full sm:w-auto px-10 py-5 bg-muted text-muted-foreground rounded-[24px] font-black text-lg hover:bg-accent transition-all ${currentIdx === 0 ? 'opacity-0 pointer-events-none' : ''}`}
           >
             Kembali
           </button>
           <div className="flex-grow"></div>
           {currentIdx === questions.length - 1 ? (
             <button 
               onClick={handleFinish}
               disabled={!userAnswers[currentIdx]}
               className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none"
             >
               Selesai
             </button>
           ) : (
             <button 
               onClick={handleNext}
               disabled={!userAnswers[currentIdx]}
               className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none"
             >
               Selanjutnya
             </button>
           )}
        </footer>
      </div>
    </div>
  );
}
