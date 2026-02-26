"use client";

import withAuth from "@/components/withAuth";
import { fetchAPI } from "@/lib/api";
import { CheckCircle, ExternalLink, FileArchive, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Submission {
  id: number;
  userId: number;
  username: string;
  email: string;
  lessonId: number;
  pathId: number;
  lessonTitle: string;
  pathTitle: string;
  submissionFileUrl: string;
  submissionDriveLink: string;
  approvalStatus: "pending" | "approved" | "rejected";
  adminNote: string;
  createdAt: string;
}

function SubmissionManagementPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAPI<Submission[]>("/admin/submissions")
      .then(setSubmissions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await fetchAPI(`/admin/submissions/${id}/approve`, { method: "PUT" });
      setSubmissions(prev =>
        prev.map(s => s.id === id ? { ...s, approvalStatus: "approved" } : s)
      );
    } catch (err: any) {
      alert(err.message || "Gagal menyetujui submission.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      await fetchAPI(`/admin/submissions/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ adminNote: rejectNote }),
      });
      setSubmissions(prev =>
        prev.map(s => s.id === id ? { ...s, approvalStatus: "rejected", adminNote: rejectNote } : s)
      );
      setRejectingId(null);
      setRejectNote("");
    } catch (err: any) {
      alert(err.message || "Gagal menolak submission.");
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "approved")
      return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-widest">Disetujui</span>;
    if (status === "rejected")
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full uppercase tracking-widest">Ditolak</span>;
    return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded-full uppercase tracking-widest">Menunggu</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Kelola Pengumpulan Proyek</h1>
        <p className="text-muted-foreground font-medium mt-1">Tinjau dan setujui proyek akhir siswa.</p>
      </div>

      <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Siswa</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Proyek</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">File / Link</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6">
                      <div className="h-12 bg-muted rounded-2xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic font-medium">
                    Belum ada proyek yang dikumpulkan.
                  </td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <>
                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 shrink-0">
                            {sub.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-none">{sub.username}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{sub.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Link 
                          href={`/quiz/${sub.pathId}/${sub.lessonId}`}
                          target="_blank"
                          className="font-bold text-foreground text-sm hover:text-blue-600 transition-colors group/link flex items-center gap-1"
                        >
                          {sub.lessonTitle}
                          <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{sub.pathTitle}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{sub.createdAt}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2">
                          {sub.submissionFileUrl && (
                            <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${sub.submissionFileUrl}`}
                              target="_blank"
                              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                            >
                              <FileArchive size={14} /> Download ZIP
                            </a>
                          )}
                          {sub.submissionDriveLink && (
                            <a href={sub.submissionDriveLink} target="_blank"
                              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
                            >
                              <ExternalLink size={14} /> Google Drive
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1.5">
                          {statusBadge(sub.approvalStatus)}
                          {sub.approvalStatus === "rejected" && sub.adminNote && (
                            <p className="text-[10px] text-red-500 font-medium max-w-[180px]">{sub.adminNote}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {sub.approvalStatus === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(sub.id)}
                              disabled={processingId === sub.id}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle size={14} /> Setujui
                            </button>
                            <button
                              onClick={() => setRejectingId(sub.id)}
                              disabled={processingId === sub.id}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
                            >
                              <XCircle size={14} /> Tolak
                            </button>
                          </div>
                        )}
                        {sub.approvalStatus === "approved" && (
                          <span className="text-xs font-black text-emerald-600">✓ Selesai</span>
                        )}
                        {sub.approvalStatus === "rejected" && (
                          <button
                            onClick={() => handleApprove(sub.id)}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Setujui sekarang
                          </button>
                        )}
                      </td>
                    </tr>
                    {/* Reject note form */}
                    {rejectingId === sub.id && (
                      <tr key={`reject-${sub.id}`}>
                        <td colSpan={5} className="px-8 pb-6 bg-red-50 border-b border-red-100">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <input
                              type="text"
                              placeholder="Catatan untuk siswa (opsional)..."
                              value={rejectNote}
                              onChange={e => setRejectNote(e.target.value)}
                              className="flex-1 px-4 py-3 rounded-xl border border-red-200 text-sm font-medium bg-white focus:ring-2 focus:ring-red-300 outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReject(sub.id)}
                                disabled={processingId === sub.id}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all disabled:opacity-50"
                              >
                                {processingId === sub.id ? "Memproses..." : "Tolak"}
                              </button>
                              <button onClick={() => setRejectingId(null)}
                                className="px-6 py-3 bg-muted text-muted-foreground rounded-xl text-sm font-black hover:bg-accent transition-all"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(SubmissionManagementPage);
