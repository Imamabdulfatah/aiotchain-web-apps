package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
	"github.com/imam/backend-blog-kuis/utils"
)

// CreateContact - Public endpoint untuk submit contact form
func CreateContact(c *gin.Context) {
	var contact models.Contact
	if err := c.ShouldBindJSON(&contact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	// Sanitize content for XSS protection
	contact.Name = utils.SanitizeHTML(contact.Name)
	contact.Message = utils.SanitizeHTML(contact.Message)

	// Set default status
	contact.Status = "new"

	if err := config.DB.Create(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pesan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Pesan Anda berhasil dikirim. Kami akan segera menghubungi Anda.",
		"data":    contact,
	})
}

// GetContacts - Admin: list all contacts with filtering
func GetContacts(c *gin.Context) {
	var contacts []models.Contact

	db := config.DB

	// Filter by status
	if status := c.Query("status"); status != "" {
		db = db.Where("status = ?", status)
	}

	// Filter by category
	if category := c.Query("category"); category != "" {
		db = db.Where("category = ?", category)
	}

	// Search by name or email
	if search := c.Query("search"); search != "" {
		db = db.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Order by newest first
	if err := db.Order("created_at DESC").Find(&contacts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data kontak"})
		return
	}

	c.JSON(http.StatusOK, contacts)
}

// GetContactByID - Admin: view detail
func GetContactByID(c *gin.Context) {
	id := c.Param("id")
	var contact models.Contact

	if err := config.DB.First(&contact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kontak tidak ditemukan"})
		return
	}

	// Auto-update status to 'read' if it's 'new'
	if contact.Status == "new" {
		contact.Status = "read"
		config.DB.Save(&contact)
	}

	c.JSON(http.StatusOK, contact)
}

// UpdateContactStatus - Admin: update status
func UpdateContactStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status wajib diisi"})
		return
	}

	// Validate status
	validStatuses := map[string]bool{
		"new":      true,
		"read":     true,
		"resolved": true,
		"archived": true,
	}

	if !validStatuses[input.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status tidak valid"})
		return
	}

	var contact models.Contact
	if err := config.DB.First(&contact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kontak tidak ditemukan"})
		return
	}

	contact.Status = input.Status
	if err := config.DB.Save(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Status berhasil diperbarui",
		"data":    contact,
	})
}

// DeleteContact - Admin: delete contact
func DeleteContact(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Contact{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kontak"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kontak berhasil dihapus"})
}
