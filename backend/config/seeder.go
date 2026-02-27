package config

import (
	"log"

	"github.com/imam/backend-blog-kuis/models"
	"golang.org/x/crypto/bcrypt"
)

func SeedSuperAdmin() {
	var count int64
	DB.Model(&models.User{}).Where("username = ?", "mr_aiotchain").Count(&count)

	if count == 0 {
		log.Println("Seeding Super Admin...")

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("Anonym074407@"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal("Gagal hash password seeder:", err)
		}

		superAdmin := models.User{
			Username: "mr_aiotchain",
			Email:    "aiotchain.id@gmail.com",
			Password: string(hashedPassword),
			Role:     "super_admin",
		}

		if err := DB.Create(&superAdmin).Error; err != nil {
			log.Println("Gagal seeding super admin:", err)
		} else {
			log.Println("Super Admin berhasil dibuat! (Username: superadmin, Password: admin123)")
		}
	}
}
