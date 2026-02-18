package main

import (
	"fmt"
	"log"
	"os"

	// Pastikan path import ini sesuai dengan nama module di go.mod Anda
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/routes"
	"github.com/joho/godotenv"
)

func main() {

	// Pastikan Load() dipanggil pertama kali
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: Tidak bisa memuat file .env")
	}

	// DEBUG: Cek apakah DB_URL terbaca
	fmt.Println("DB_URL dari ENV:", os.Getenv("DB_URL"))
	// 1. Inisialisasi Koneksi Database
	config.ConnectDB()

	// Mengambil instance sql.DB dari GORM untuk bisa memanggil Close()
	sqlDB, err := config.DB.DB()
	if err != nil {
		log.Fatal("Gagal mendapatkan instance database:", err)
	}
	defer sqlDB.Close()

	fmt.Println("Server mencoba berjalan di port :8080...")

	// 2. Setup Router dari package routes
	r := routes.SetupRouter()

	// 4. Jalankan Server
	err = r.Run(os.Getenv("PORT"))
	if err != nil {
		log.Fatal("Gagal menjalankan server: ", err)
	}
}
