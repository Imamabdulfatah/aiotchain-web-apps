"use client";

import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { compressImage } from "@/lib/image-utils";
import { useRef, useState } from "react";

interface UserProfile {
    id: number;
    username: string;
    email: string;
    phone: string;
    linkedin: string;
    social_media: string;
    profile_picture: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    onUpdate: (updatedUser: UserProfile) => void;
}

export default function EditProfileModal({ isOpen, onClose, userProfile, onUpdate }: EditProfileModalProps) {
    const [formData, setFormData] = useState<UserProfile>(userProfile);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi Ukuran (Maks 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran foto profil terlalu besar. Maksimal 2MB.");
            return;
        }

        setUploading(true);
        try {
            // Kompres gambar sebelum upload
            const compressedFile = await compressImage(file, { maxWidth: 800, quality: 0.6 });
            
            const formDataUpload = new FormData();
            formDataUpload.append("image", compressedFile);

            const data = await fetchAPI<any>("/upload", {
                method: "POST",
                body: formDataUpload,
                // fetchAPI sets Content-Type to application/json by default, 
                // but for FormData we must let the browser set it with the boundary.
                headers: { "Content-Type": undefined as any }
            });

            setFormData(prev => ({ ...prev, profile_picture: data.url }));
        } catch (error: any) {
            console.error("Upload error:", error);
            alert("Gagal mengunggah foto: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = getToken();
            const res = await fetchAPI<any>("/me", {
                method: "PUT",
                body: JSON.stringify({
                    email: formData.email,
                    phone: formData.phone,
                    linkedin: formData.linkedin,
                    social_media: formData.social_media,
                    profile_picture: formData.profile_picture
                })
            });

            if (res.user) {
                onUpdate(res.user);
                onClose();
            }
        } catch (error) {
            console.error("Update profile error:", error);
            alert("Gagal memperbarui profil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-card rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-border">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">Edit Profil</h2>
                            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-1">Sesuaikan informasi Anda</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-muted rounded-2xl hover:bg-accent transition-colors">
                            <span className="text-xl">✕</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-[2rem] bg-muted overflow-hidden border-4 border-muted shadow-inner group-hover:opacity-80 transition-opacity">
                                    {formData.profile_picture && formData.profile_picture !== "" ? (
                                        <img src={formData.profile_picture.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${formData.profile_picture}` : formData.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">👤</div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                    {uploading ? "..." : "📷"}
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Klik untuk ganti foto</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-4">Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-foreground"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-4">Nomor WhatsApp / Telepon</label>
                                <input 
                                    type="text" 
                                    name="phone"
                                    placeholder="0812XXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-foreground"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-4">LinkedIn Profile URL</label>
                                <input 
                                    type="text" 
                                    name="linkedin"
                                    placeholder="https://linkedin.com/in/username"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-foreground"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-4">Media Sosial (X / IG)</label>
                                <input 
                                    type="text" 
                                    name="social_media"
                                    placeholder="@username"
                                    value={formData.social_media}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-foreground"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-8 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-foreground transition-all"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
                            >
                                {loading ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
