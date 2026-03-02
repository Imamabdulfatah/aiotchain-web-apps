package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

// GetAssetCategories - Mengambil semua kategori asset
func GetAssetCategories(c *gin.Context) {
	var categories []models.AssetCategory
	if err := config.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil kategori"})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// CreateAssetCategory - Admin menambah kategori baru
func CreateAssetCategory(c *gin.Context) {
	var category models.AssetCategory
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan kategori"})
		return
	}
	c.JSON(http.StatusOK, category)
}

// UpdateAssetCategory - Admin mengedit kategori
func UpdateAssetCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.AssetCategory
	if err := config.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kategori"})
		return
	}
	c.JSON(http.StatusOK, category)
}

// DeleteAssetCategory - Admin menghapus kategori
func DeleteAssetCategory(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.AssetCategory{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kategori"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}
