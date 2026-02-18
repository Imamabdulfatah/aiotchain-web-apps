package controllers

import (
	"net/http"

	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"

	"github.com/gin-gonic/gin"
)

// GetCommentsByPost - Get all comments for a specific post
func GetCommentsByPost(c *gin.Context) {
	postID := c.Param("id")

	var comments []models.Comment

	// Preload User untuk mendapatkan username
	if err := config.DB.Where("post_id = ?", postID).Preload("User").Order("created_at DESC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil komentar"})
		return
	}

	// Format response dengan username
	response := []models.CommentWithUser{}
	for _, comment := range comments {
		response = append(response, models.CommentWithUser{
			ID:             comment.ID,
			PostID:         comment.PostID,
			AssetID:        comment.AssetID,
			LearningPathID: comment.LearningPathID,
			UserID:         comment.UserID,
			Content:        comment.Content,
			Rating:         comment.Rating,
			ImageURL:       comment.ImageURL,
			CreatedAt:      comment.CreatedAt.Format("2006-01-02 15:04:05"),
			Username:       comment.User.Username,
		})
	}

	c.JSON(http.StatusOK, response)
}

// GetCommentsByAsset - Get all comments for a specific asset
func GetCommentsByAsset(c *gin.Context) {
	assetID := c.Param("id")

	var comments []models.Comment

	if err := config.DB.Where("asset_id = ?", assetID).Preload("User").Order("created_at DESC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil komentar"})
		return
	}

	var response []models.CommentWithUser
	for _, comment := range comments {
		response = append(response, models.CommentWithUser{
			ID:             comment.ID,
			PostID:         comment.PostID,
			AssetID:        comment.AssetID,
			LearningPathID: comment.LearningPathID,
			UserID:         comment.UserID,
			Content:        comment.Content,
			Rating:         comment.Rating,
			ImageURL:       comment.ImageURL,
			CreatedAt:      comment.CreatedAt.Format("2006-01-02 15:04:05"),
			Username:       comment.User.Username,
		})
	}

	c.JSON(http.StatusOK, response)
}

// GetCommentsByPath - Get all comments for a specific learning path
func GetCommentsByPath(c *gin.Context) {
	pathID := c.Param("id")

	var comments []models.Comment

	if err := config.DB.Where("learning_path_id = ?", pathID).Preload("User").Order("created_at DESC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil ulasan"})
		return
	}

	var response []models.CommentWithUser
	for _, comment := range comments {
		response = append(response, models.CommentWithUser{
			ID:             comment.ID,
			PostID:         comment.PostID,
			AssetID:        comment.AssetID,
			LearningPathID: comment.LearningPathID,
			UserID:         comment.UserID,
			Content:        comment.Content,
			Rating:         comment.Rating,
			ImageURL:       comment.ImageURL,
			CreatedAt:      comment.CreatedAt.Format("2006-01-02 15:04:05"),
			Username:       comment.User.Username,
		})
	}

	c.JSON(http.StatusOK, response)
}

// GetCommentsByThread - Get all comments for a specific thread
func GetCommentsByThread(c *gin.Context) {
	threadID := c.Param("id")

	var comments []models.Comment

	if err := config.DB.Where("thread_id = ?", threadID).Preload("User").Order("created_at ASC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil komentar"})
		return
	}

	var response []models.CommentWithUser
	for _, comment := range comments {
		response = append(response, models.CommentWithUser{
			ID:             comment.ID,
			PostID:         comment.PostID,
			AssetID:        comment.AssetID,
			LearningPathID: comment.LearningPathID,
			ThreadID:       comment.ThreadID,
			UserID:         comment.UserID,
			Content:        comment.Content,
			Rating:         comment.Rating,
			ImageURL:       comment.ImageURL,
			CreatedAt:      comment.CreatedAt.Format("2006-01-02 15:04:05"),
			Username:       comment.User.Username,
		})
	}

	c.JSON(http.StatusOK, response)
}

// CreateComment - Create a new comment (auth required)
func CreateComment(c *gin.Context) {
	// Get user_id from JWT (set by AuthMiddleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Content        string `json:"content" binding:"required"`
		PostID         *uint  `json:"post_id"`
		AssetID        *uint  `json:"asset_id"`
		LearningPathID *uint  `json:"learning_path_id"`
		ThreadID       *uint  `json:"thread_id"`
		Rating         int    `json:"rating"`
		ImageURL       string `json:"image_url"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Konten komentar diperlukan"})
		return
	}

	if input.PostID == nil && input.AssetID == nil && input.LearningPathID == nil && input.ThreadID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "TargetID (post, asset, learning_path, atau thread) diperlukan"})
		return
	}

	comment := models.Comment{
		PostID:         input.PostID,
		AssetID:        input.AssetID,
		LearningPathID: input.LearningPathID,
		ThreadID:       input.ThreadID,
		UserID:         uint(userID.(float64)),
		Content:        input.Content,
		Rating:         input.Rating,
		ImageURL:       input.ImageURL,
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat komentar"})
		return
	}

	// Load user info
	config.DB.Preload("User").First(&comment, comment.ID)

	response := models.CommentWithUser{
		ID:             comment.ID,
		PostID:         comment.PostID,
		AssetID:        comment.AssetID,
		LearningPathID: comment.LearningPathID,
		ThreadID:       comment.ThreadID,
		UserID:         comment.UserID,
		Content:        comment.Content,
		Rating:         comment.Rating,
		ImageURL:       comment.ImageURL,
		CreatedAt:      comment.CreatedAt.Format("2006-01-02 15:04:05"),
		Username:       comment.User.Username,
	}

	c.JSON(http.StatusCreated, response)
}

// DeleteComment - Delete a comment (only owner can delete)
func DeleteComment(c *gin.Context) {
	commentID := c.Param("id")

	// Get user_id from JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var comment models.Comment
	if err := config.DB.First(&comment, commentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Komentar tidak ditemukan"})
		return
	}

	// Check if user is the owner
	if comment.UserID != uint(userID.(float64)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin untuk menghapus komentar ini"})
		return
	}

	if err := config.DB.Delete(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus komentar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Komentar berhasil dihapus"})
}

// UpdateComment - Update a comment (only owner can update)
func UpdateComment(c *gin.Context) {
	commentID := c.Param("id")
	userIDRaw, _ := c.Get("user_id")

	var userID uint
	if v, ok := userIDRaw.(float64); ok {
		userID = uint(v)
	} else if v, ok := userIDRaw.(uint); ok {
		userID = v
	}

	var comment models.Comment
	if err := config.DB.First(&comment, commentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Komentar tidak ditemukan"})
		return
	}

	// Check if user is the owner
	if comment.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin untuk mengubah komentar ini"})
		return
	}

	var input struct {
		Content  string `json:"content" binding:"required"`
		ImageURL string `json:"image_url"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Konten komentar diperlukan"})
		return
	}

	updates := map[string]interface{}{
		"content":   input.Content,
		"image_url": input.ImageURL,
	}

	if err := config.DB.Model(&comment).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui komentar"})
		return
	}

	c.JSON(http.StatusOK, comment)
}
