package config

import (
	"log"

	"github.com/imam/backend-blog-kuis/models"
	"golang.org/x/crypto/bcrypt"
)

func SeedSuperAdmin() {
	var count int64
	DB.Model(&models.User{}).Where("username = ?", "superadmin").Count(&count)

	if count == 0 {
		log.Println("Seeding Super Admin...")

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal("Gagal hash password seeder:", err)
		}

		superAdmin := models.User{
			Username: "superadmin",
			Email:    "admin@aiotchain.project",
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
