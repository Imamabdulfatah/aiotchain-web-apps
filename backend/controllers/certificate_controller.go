package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

// GetUserCertificates - Fetch all certificates for the logged-in user
func GetUserCertificates(c *gin.Context) {
	userID := c.Query("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	var certificates []models.Certificate
	if err := config.DB.Preload("LearningPath").Where("user_id = ?", userID).Find(&certificates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil sertifikat"})
		return
	}

	c.JSON(http.StatusOK, certificates)
}

// GetCertificateByID - Verify or fetch a specific certificate by its unique ID
func GetCertificateByID(c *gin.Context) {
	certID := c.Param("id")

	var certificate models.Certificate
	if err := config.DB.Preload("User").Preload("LearningPath").Where("certificate_id = ?", certID).First(&certificate).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sertifikat tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           certificate.CertificateID,
		"userName":     certificate.User.Username,
		"pathTitle":    certificate.LearningPath.Title,
		"issuedAt":     certificate.IssuedAt,
		"certPdfUrl":   certificate.LearningPath.CertPdfURL,
		"certNameX":    certificate.LearningPath.CertNameX,
		"certNameY":    certificate.LearningPath.CertNameY,
		"certFontSize": certificate.LearningPath.CertFontSize,
	})
}

// GetAllCertificates - Fetch all certificates (Admin Only)
func GetAllCertificates(c *gin.Context) {
	var certificates []models.Certificate
	if err := config.DB.Preload("User").Preload("LearningPath").Find(&certificates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil semua sertifikat"})
		return
	}

	// Format response to be flat and easy for the table
	type FormattedCert struct {
		ID            uint      `json:"id"`
		CertificateID string    `json:"certificateId"`
		UserName      string    `json:"userName"`
		UserEmail     string    `json:"userEmail"`
		PathTitle     string    `json:"pathTitle"`
		IssuedAt      time.Time `json:"issuedAt"`
	}

	results := []FormattedCert{}
	for _, cert := range certificates {
		results = append(results, FormattedCert{
			ID:            cert.ID,
			CertificateID: cert.CertificateID,
			UserName:      cert.User.Username,
			UserEmail:     cert.User.Email,
			PathTitle:     cert.LearningPath.Title,
			IssuedAt:      cert.IssuedAt,
		})
	}

	c.JSON(http.StatusOK, results)
}

// RevokeCertificate - Delete a certificate by its internal ID (Admin Only)
func RevokeCertificate(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Certificate{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencabut sertifikat"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sertifikat berhasil dicabut"})
}
