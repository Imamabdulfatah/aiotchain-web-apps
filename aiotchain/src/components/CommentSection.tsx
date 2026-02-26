"use client";

import { fetchAPI } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";
import { compressImage } from "@/lib/image-utils";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  image_url: string;
  created_at: string;
  username: string;
}

interface UserToken {
  user_id: number;
  username: string;
}

interface CommentSectionProps {
  postId?: number;
  assetId?: number;
  threadId?: number;
}

export default function CommentSection({ postId, assetId, threadId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  useEffect(() => {
    loadComments();
    
    // Get current user ID from token
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
  }, [postId, assetId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar. Maksimal 5MB.");
      return;
    }

    setUploading(true);
    try {
      const compressedFile = await compressImage(file, { maxWidth: 1200, quality: 0.7 });
      const formData = new FormData();
      formData.append("image", compressedFile);

      const data = await fetchAPI<{url: string}>("/upload", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": undefined as any },
      });
      setImageUrl(data.url);
    } catch (err) {
      alert("Gagal upload gambar: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const loadComments = async () => {
    try {
      let endpoint = "";
      if (postId) endpoint = `/posts/${postId}/comments`;
      else if (assetId) endpoint = `/assets/${assetId}/comments`;
      else if (threadId) endpoint = `/threads/${threadId}/comments`;
      
      const data = await fetchAPI<Comment[]>(endpoint);
      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn()) {
      alert("Silakan login terlebih dahulu untuk berkomentar.");
      return;
    }

    if (!newComment.trim()) {
      alert("Komentar tidak boleh kosong.");
      return;
    }

    setSubmitting(true);

    try {
      const newCommentData = await fetchAPI<Comment>("/comments", {
        method: "POST",
        body: JSON.stringify({ 
          content: newComment,
          image_url: imageUrl,
          post_id: postId,
          asset_id: assetId,
          thread_id: threadId
        }),
      });
      setComments([newCommentData, ...comments]);
      setNewComment("");
      setImageUrl("");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Gagal mengirim komentar. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (commentId: number) => {
    if (!editContent.trim()) {
      alert("Komentar tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    try {
      const updatedComment = await fetchAPI<Comment>(`/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({
          content: editContent,
          image_url: editImageUrl
        }),
      });

      setComments(comments.map(c => c.id === commentId ? { ...c, content: updatedComment.content, image_url: updatedComment.image_url } : c));
      setEditingCommentId(null);
      setEditContent("");
      setEditImageUrl("");
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Gagal memperbarui komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      return;
    }

    try {
      await fetchAPI(`/comments/${commentId}`, {
        method: "DELETE",
      });

      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Gagal menghapus komentar.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Komentar ({comments.length})
      </h2>

      {/* Comment Form */}
      {isLoggedIn() ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar Anda..."
            className="w-full p-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-foreground placeholder:text-muted-foreground"
            rows={3}
          />
          
          {imageUrl && (
            <div className="relative w-24 h-24 mt-3 rounded-xl overflow-hidden border border-border group">
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${imageUrl}`} 
                alt="Comment attachment" 
                className="w-full h-full object-cover"
              />
              <button 
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Mengirim..." : "Kirim Komentar"}
            </button>
            
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all border border-border hover:bg-muted ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}>
              <span className="text-xl">📷</span>
              <span className="text-sm font-bold text-muted-foreground">{uploading ? "Uploading..." : "Foto"}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-muted rounded-2xl border border-border text-center">
          <p className="text-muted-foreground">
            Silakan <a href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">login</a> untuk berkomentar.
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Memuat komentar...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Belum ada komentar. Jadilah yang pertama!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-6 bg-card border border-border rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{comment.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('id-ID', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                {currentUserId === comment.user_id && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditContent(comment.content);
                        setEditImageUrl(comment.image_url || "");
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="mt-2 space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-foreground"
                    rows={3}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdate(comment.id)}
                      disabled={submitting}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditContent("");
                      }}
                      className="px-4 py-1.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-accent transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground leading-relaxed transition-colors">{comment.content}</p>
                  
                  {comment.image_url && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-border max-w-sm">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${comment.image_url}`} 
                        alt="Comment attachment" 
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
