package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
	"github.com/imam/backend-blog-kuis/utils"
)

// Get All Posts (with optional search)
func GetPosts(c *gin.Context) {
	var posts []models.Post
	query := c.Query("q")
	category := c.Query("category")

	db := config.DB
	if query != "" {
		db = db.Where("title ILIKE ? OR content ILIKE ? OR excerpt ILIKE ?", "%"+query+"%", "%"+query+"%", "%"+query+"%")
	}
	if category != "" {
		db = db.Where("category = ?", category)
	}

	if err := db.Order("created_at DESC, views DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, posts)
}

// Create Post
func CreatePost(c *gin.Context) {
	var post models.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	// Sanitize content for XSS protection
	post.Content = utils.SanitizeHTML(post.Content)
	post.Excerpt = utils.SanitizeHTML(post.Excerpt)

	if err := config.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan artikel"})
		return
	}

	// Notify all email subscribers asynchronously
	go NotifySubscribers(post)

	c.JSON(http.StatusOK, post)
}

// Update Post
func UpdatePost(c *gin.Context) {
	id := c.Param("id")
	var post models.Post
	if err := config.DB.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	// Sanitize content for XSS protection
	post.Content = utils.SanitizeHTML(post.Content)
	post.Excerpt = utils.SanitizeHTML(post.Excerpt)

	if err := config.DB.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui artikel"})
		return
	}
	c.JSON(http.StatusOK, post)
}

// Delete Post
func DeletePost(c *gin.Context) {
	id := c.Param("id")
	// GORM: .Delete() menggantikan .Exec("DELETE...")
	if err := config.DB.Delete(&models.Post{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Post deleted"})
}

// GetPostBySlug - Mencari satu artikel berdasarkan slug
func GetPostBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var post models.Post
	if err := config.DB.Where("slug = ?", slug).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	// Inkrement view count
	config.DB.Model(&post).Update("views", post.Views+1)

	c.JSON(http.StatusOK, post)
}
