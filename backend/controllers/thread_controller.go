package controllers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
	"github.com/imam/backend-blog-kuis/utils"
)

// Get All Threads
func GetThreads(c *gin.Context) {
	threads := []models.ThreadResponse{}
	query := c.Query("q")
	userID := c.Query("userId")
	category := c.Query("category")

	db := config.DB.Table("threads").
		Select("threads.*, users.username, (SELECT COUNT(*) FROM comments WHERE comments.thread_id = threads.id) as comment_count").
		Joins("left join users on users.id = threads.user_id")

	if query != "" {
		db = db.Where("threads.title ILIKE ? OR threads.content ILIKE ?", "%"+query+"%", "%"+query+"%")
	}
	if category != "" {
		db = db.Where("threads.category = ?", category)
	}
	if userID != "" {
		db = db.Where("threads.user_id = ?", userID)
	}

	if err := db.Order("threads.created_at DESC").Scan(&threads).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, threads)
}

// Get Thread by ID
func GetThreadByID(c *gin.Context) {
	id := c.Param("id")
	var thread models.Thread
	if err := config.DB.Preload("User").Preload("Comments.User").First(&thread, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Diskusi tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, thread)
}

// Create Thread
func CreateThread(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint
	switch v := userIDRaw.(type) {
	case float64:
		userID = uint(v)
	case uint:
		userID = v
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
		return
	}

	var input struct {
		Title    string `json:"title" binding:"required,min=5,max=255"`
		Content  string `json:"content" binding:"required"`
		Category string `json:"category"`
		ImageURL string `json:"image_url"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Println("JSON Binding error in CreateThread:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	thread := models.Thread{
		Title:    input.Title,
		Content:  input.Content,
		Category: input.Category,
		ImageURL: input.ImageURL,
		UserID:   userID,
	}
	thread.Content = utils.SanitizeHTML(thread.Content)

	if err := config.DB.Create(&thread).Error; err != nil {
		log.Println("GORM Create error in CreateThread:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan diskusi: " + err.Error()})
		return
	}

	// Load user info for response
	config.DB.Preload("User").First(&thread, thread.ID)

	c.JSON(http.StatusOK, thread)
}

// Delete Thread
func DeleteThread(c *gin.Context) {
	id := c.Param("id")
	userIDRaw, _ := c.Get("user_id")
	userRole, _ := c.Get("role")

	var userID uint
	if v, ok := userIDRaw.(float64); ok {
		userID = uint(v)
	} else if v, ok := userIDRaw.(uint); ok {
		userID = v
	}

	var thread models.Thread
	if err := config.DB.First(&thread, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Diskusi tidak ditemukan"})
		return
	}

	// Only owner or admin can delete
	if userRole != "admin" && thread.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin untuk menghapus diskusi ini"})
		return
	}

	// Delete associated comments first (hard delete) to avoid foreign key constraint error
	if err := config.DB.Unscoped().Where("thread_id = ?", id).Delete(&models.Comment{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus komentar terkait: " + err.Error()})
		return
	}

	if err := config.DB.Delete(&thread).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus diskusi: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Thread deleted"})
}

// Update Thread
func UpdateThread(c *gin.Context) {
	id := c.Param("id")
	userIDRaw, _ := c.Get("user_id")
	userRole, _ := c.Get("role")

	var userID uint
	if v, ok := userIDRaw.(float64); ok {
		userID = uint(v)
	} else if v, ok := userIDRaw.(uint); ok {
		userID = v
	}

	var thread models.Thread
	if err := config.DB.First(&thread, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Diskusi tidak ditemukan"})
		return
	}

	// Only owner or admin can update
	if userRole != "admin" && thread.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin untuk mengubah diskusi ini"})
		return
	}

	var input struct {
		Title    string `json:"title" binding:"required,min=5,max=255"`
		Content  string `json:"content" binding:"required"`
		Category string `json:"category"`
		ImageURL string `json:"image_url"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	updates := map[string]interface{}{
		"title":     input.Title,
		"content":   utils.SanitizeHTML(input.Content),
		"category":  input.Category,
		"image_url": input.ImageURL,
	}

	if err := config.DB.Model(&thread).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui diskusi"})
		return
	}

	c.JSON(http.StatusOK, thread)
}
