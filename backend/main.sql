-- SQL untuk menambahkan Artikel (Post) Baru
INSERT INTO posts (title, slug, excerpt, content, created_at)
VALUES (
    'Judul Artikel Yang Menarik',
    'judul-artikel-yang-menarik',
    'Ini adalah ringkasan singkat dari artikel yang akan ditampilkan di halaman depan.',
    'Di sini adalah konten lengkap dari artikel. Anda bisa menulis panjang lebar...',
    '2024-02-10 10:00:00'
);

-- Penjelasan Kolom:
-- title: Judul artikel
-- slug: URL friendly version dari judul (harus unik)
-- excerpt: Ringkasan singkat
-- content: Isi artikel
-- created_at: Waktu pembuatan (format string/timestamp tergantung database)
