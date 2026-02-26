/**
 * Utilitas untuk kompresi gambar di sisi klien sebelum diunggah ke server.
 * Menggunakan Canvas API untuk mengubah ukuran dan kualitas gambar.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  mimeType?: string;
}

export const compressImage = async (
  file: File,
  options: CompressOptions = { maxWidth: 1200, maxHeight: 1200, quality: 0.7 }
): Promise<File> => {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.7, mimeType = "image/jpeg" } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Hitung dimensi baru dengan tetap menjaga rasio aspek
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Gagal mendapatkan context canvas"));
          return;
        }

        // Gambar ulang dengan dimensi baru
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke Blob lalu konversi ke File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Gagal melakukan kompresi gambar"));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
