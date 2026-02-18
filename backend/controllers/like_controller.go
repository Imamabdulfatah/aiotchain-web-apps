package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

// ToggleLike - Add or remove a like for a post or asset
func ToggleLike(c *gin.Context) {
	var input struct {
		TargetID   uint   `json:"targetId" binding:"required"`
		TargetType string `json:"targetType" binding:"required"` // "post" or "asset"
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user_id from middleware context
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Convert to uint (jwt-decode might give float64)
	userID := uint(userIDRaw.(float64))

	var existingLike models.Like
	result := config.DB.Where("user_id = ? AND target_id = ? AND target_type = ?", userID, input.TargetID, input.TargetType).First(&existingLike)

	if result.Error == nil {
		// Like exists, so remove it (toggle off)
		config.DB.Delete(&existingLike)
		c.JSON(http.StatusOK, gin.H{"liked": false, "message": "Like dihapus"})
	} else {
		// Like doesn't exist, so create it (toggle on)
		newLike := models.Like{
			UserID:     userID,
			TargetID:   input.TargetID,
			TargetType: input.TargetType,
		}
		if err := config.DB.Create(&newLike).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan like"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"liked": true, "message": "Like berhasil"})
	}
}

// GetLikeStatus - Check if user liked a specific target
func GetLikeStatus(c *gin.Context) {
	targetID := c.Query("targetId")
	targetType := c.Query("targetType")

	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusOK, gin.H{"liked": false})
		return
	}
	userID := uint(userIDRaw.(float64))

	var count int64
	config.DB.Model(&models.Like{}).Where("user_id = ? AND target_id = ? AND target_type = ?", userID, targetID, targetType).Count(&count)

	c.JSON(http.StatusOK, gin.H{"liked": count > 0})
}
