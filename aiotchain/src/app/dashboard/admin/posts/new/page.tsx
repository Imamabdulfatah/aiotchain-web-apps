"use client";

import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  // --- SLUG HELPER ---
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "") // Hapus karakter simbol/spesial
      .replace(/ +/g, "-");    // Ganti spasi dengan tanda hubung (-)
  };

  // Handler khusus untuk Title agar otomatis mengisi Slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setSlug(generateSlug(value)); // Update slug secara otomatis
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    try {
      await fetchAPI("/admin/posts", {
        method: "POST",
        body: JSON.stringify({ title, slug, excerpt, content }),
        headers: { Authorization: token || "" },
      });
      router.push("/dashboard");
    } catch (err) {
      alert("Gagal buat post: " + (err as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Buat Post Baru</h1>
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium mb-1">Judul</label>
        <input
          type="text"
          placeholder="Masukkan Judul Postingan"
          value={title}
          onChange={handleTitleChange} // Menggunakan handler otomatis
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block text-sm font-medium mb-1">Slug (URL)</label>
        <input
          type="text"
          placeholder="url-otomatis-terisi"
          value={slug}
          onChange={(e) => setSlug(e.target.value)} // Tetap bisa diedit manual
          className="w-full p-2 mb-4 border rounded bg-gray-50 font-mono text-sm"
        />

        <label className="block text-sm font-medium mb-1">Ringkasan</label>
        <textarea
          placeholder="Ringkasan singkat untuk list blog"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block text-sm font-medium mb-1">Konten</label>
        <textarea
          placeholder="Tulis artikel lengkap di sini..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 mb-4 border rounded h-40"
        />

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Simpan Postingan
        </button>
      </form>
    </div>
  );
}