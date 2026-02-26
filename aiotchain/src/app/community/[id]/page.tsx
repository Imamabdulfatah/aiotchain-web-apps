"use client";

import CommentSection from "@/components/CommentSection";
import Navbar from "@/components/Navbar";
import { fetchAPI } from "@/lib/api";
import { getToken, getUserRole, isLoggedIn } from "@/lib/auth";
import { formatContent } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ThreadDetail {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url: string;
  user_id: number;
  created_at: string;
  user: {
    username: string;
  };
}

interface UserToken {
  user_id: number;
  username: string;
}

export default function ThreadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAPI<ThreadDetail>(`/threads/${id}`)
      .then(setThread)
      .catch((err) => console.error("Error fetching thread:", err))
      .finally(() => setLoading(false));

    if (isLoggedIn()) {
      const token = getToken();
      if (token) {
        try {
          const decoded = jwtDecode<UserToken>(token);
          setCurrentUserId(decoded.user_id);
        } catch (error) {
          console.error("Failed to decode token", error);
        }
      }
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this thread? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await fetchAPI(`/threads/${id}`, {
        method: "DELETE",
      });
      router.push("/community");
    } catch (error: any) {
      alert("Failed to delete thread: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground">Memuat diskusi...</div>;
  if (!thread) return <div className="text-center py-20 text-muted-foreground">Diskusi tidak ditemukan.</div>;

  const isOwner = currentUserId === thread.user_id;
  const isAdmin = getUserRole() === "admin";
  const canModify = isOwner || isAdmin;

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Navigasi Back & Actions */}
        <div className="mb-12 flex items-center justify-between">
          <Link href="/community" className="text-sm font-bold text-muted-foreground hover:text-blue-600 flex items-center gap-2 transition-colors">
            ← Kembali ke Komunitas
          </Link>

          {canModify && (
            <div className="flex items-center gap-3">
              {isOwner && (
                <Link 
                  href={`/community/edit/${id}`}
                  className="px-6 py-2 bg-muted text-foreground border border-border rounded-xl text-sm font-bold hover:bg-accent transition-all"
                >
                  Edit Diskusi
                </Link>
              )}
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          )}
        </div>

        <article className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-sm mb-12">
          <header className="mb-8">
            <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-widest rounded-full mb-6">
              {thread.category || "Diskusi"}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-6">
              {thread.title}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                {thread.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-bold">{thread.user.username}</span>
                <span className="text-muted-foreground text-sm font-medium">
                  Diposting pada {new Date(thread.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </span>
              </div>
            </div>
          </header>

          {thread.image_url && (
            <div className="mb-10 rounded-[1.5rem] overflow-hidden border border-border bg-muted shadow-inner">
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${thread.image_url}`} 
                alt={thread.title} 
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-p:leading-relaxed text-foreground/90">
            <div dangerouslySetInnerHTML={{ __html: formatContent(thread.content) }} />
          </div>
        </article>

        {/* Comment Section */}
        <div className="mt-12">
          <CommentSection threadId={thread.id} />
        </div>
      </main>
    </div>
  );
}
