package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

// GetCertificateTemplate - Get the active certificate template
func GetCertificateTemplate(c *gin.Context) {
	var template models.CertificateTemplate
	if err := config.DB.Where("active = ?", true).First(&template).Error; err != nil {
		// If not found, create a default one
		template = models.CertificateTemplate{
			BackgroundImage: "",
			PrimaryColor:    "#2563eb",
			Active:          true,
		}
		config.DB.Create(&template)
	}
	c.JSON(http.StatusOK, template)
}

// UpdateCertificateTemplate - Update the certificate template
func UpdateCertificateTemplate(c *gin.Context) {
	var input struct {
		BackgroundImage string  `json:"backgroundImage"`
		PrimaryColor    string  `json:"primaryColor"`
		CertPdfURL      string  `json:"certPdfUrl"`
		CertNameX       float64 `json:"certNameX"`
		CertNameY       float64 `json:"certNameY"`
		CertDateX       float64 `json:"certDateX"`
		CertDateY       float64 `json:"certDateY"`
		CertIdX         float64 `json:"certIdX"`
		CertIdY         float64 `json:"certIdY"`
		CertFontSize    int     `json:"certFontSize"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var template models.CertificateTemplate
	if err := config.DB.Where("active = ?", true).First(&template).Error; err != nil {
		template = models.CertificateTemplate{Active: true}
		config.DB.Create(&template)
	}

	template.BackgroundImage = input.BackgroundImage
	template.PrimaryColor = input.PrimaryColor
	template.CertPdfURL = input.CertPdfURL
	template.CertNameX = input.CertNameX
	template.CertNameY = input.CertNameY
	template.CertDateX = input.CertDateX
	template.CertDateY = input.CertDateY
	template.CertIdX = input.CertIdX
	template.CertIdY = input.CertIdY
	template.CertFontSize = input.CertFontSize
	config.DB.Save(&template)

	c.JSON(http.StatusOK, gin.H{"message": "Template sertifikat diperbarui", "data": template})
}
