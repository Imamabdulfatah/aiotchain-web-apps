package config

import (
	"log"
	"os"

	"github.com/imam/backend-blog-kuis/models" // Import folder models Anda
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := os.Getenv("DB_URL")

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal terhubung ke database PostgreSQL: ", err)
	}

	log.Println("Berhasil terhubung ke PostgreSQL!")

	// --- TAMBAHKAN MIGRATE DI SINI ---
	log.Println("Menjalankan AutoMigrate...")

	err = database.AutoMigrate(
		&models.User{},
		&models.LearningPath{},
		&models.Chapter{}, // New grouping level
		&models.Quiz{},
		&models.Question{},
		&models.Post{},
		&models.Asset{},
		&models.Thread{},
		&models.Comment{},
		&models.Enrollment{},
		&models.UserProgress{},
		&models.Like{},
		&models.Certificate{},
		&models.Contact{},
		&models.CertificateTemplate{},
		&models.Payment{},
		&models.Subscriber{},
	)

	if err != nil {
		log.Fatal("Gagal melakukan migrasi database: ", err)
	}

	log.Println("Migrasi berhasil selesai!")
	DB = database

	// Run Seeder
	SeedSuperAdmin()
}
