package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

// GetResume - Mengambil data CV tunggal
func GetResume(c *gin.Context) {
	var resume models.Resume
	// Kita hanya punya satu data resume, ambil yang pertama
	if err := config.DB.First(&resume).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Resume belum diatur"})
		return
	}
	c.JSON(http.StatusOK, resume)
}

// UpdateResume - Update atau buat data CV (Super Admin)
func UpdateResume(c *gin.Context) {
	var input struct {
		Data string `json:"data" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	var resume models.Resume
	// Cek apakah sudah ada data
	if err := config.DB.First(&resume).Error; err != nil {
		// Buat baru jika belum ada
		resume = models.Resume{Data: input.Data}
		if err := config.DB.Create(&resume).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat resume"})
			return
		}
	} else {
		// Update yang sudah ada
		resume.Data = input.Data
		if err := config.DB.Save(&resume).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update resume"})
			return
		}
	}

	c.JSON(http.StatusOK, resume)
}
