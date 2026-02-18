package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

// GetAssets - Mengambil semua asset 3D
func GetAssets(c *gin.Context) {
	userID := c.Query("userId")
	category := c.Query("category")
	search := c.Query("search")
	var assets []models.Asset

	query := config.DB
	if category != "" && category != "Semua" {
		query = query.Where("category = ?", category)
	}

	if search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	// Initialize as empty slice instead of nil to avoid null in JSON
	assets = []models.Asset{}
	if err := query.Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil asset"})
		return
	}
	c.JSON(http.StatusOK, assets)
}

// CreateAsset - Admin menambah asset baru
func CreateAsset(c *gin.Context) {
	var asset models.Asset
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan asset"})
		return
	}
	c.JSON(http.StatusOK, asset)
}

// DeleteAsset - Admin menghapus asset
func DeleteAsset(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Asset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus asset"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Asset berhasil dihapus"})
}

// IncrementDownload - Menambah hitungan download
func IncrementDownload(c *gin.Context) {
	id := c.Param("id")
	var asset models.Asset
	if err := config.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset tidak ditemukan"})
		return
	}

	asset.DownloadCount++
	config.DB.Save(&asset)

	c.JSON(http.StatusOK, gin.H{"downloadCount": asset.DownloadCount})
}

// UserCreateAsset - User menambah asset baru
func UserCreateAsset(c *gin.Context) {
	var asset models.Asset
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ambil userID dari context (set oleh middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak terautentikasi"})
		return
	}

	// Konversi userID ke uint (JWT menyimpan angka sebagai float64)
	switch v := userID.(type) {
	case float64:
		asset.UserID = uint(v)
	case uint:
		asset.UserID = v
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ID user tidak valid"})
		return
	}

	if err := config.DB.Create(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan asset"})
		return
	}
	c.JSON(http.StatusOK, asset)
}

// GetAssetByID - Mengambil satu asset berdasarkan ID
func GetAssetByID(c *gin.Context) {
	id := c.Param("id")
	var asset models.Asset
	if err := config.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, asset)
}
