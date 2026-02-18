package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

// GetAllUsers - Mengambil semua data pengguna untuk admin
func GetAllUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Order("id desc").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengguna"})
		return
	}

	c.JSON(http.StatusOK, users)
}

// UpdateUserRole - Mengubah role pengguna (Super Admin Only)
func UpdateUserRole(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Role string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role harus diisi"})
		return
	}

	// Validasi role
	if input.Role != "user" && input.Role != "admin" && input.Role != "super_admin" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role tidak valid"})
		return
	}

	if err := config.DB.Model(&models.User{}).Where("id = ?", id).Update("role", input.Role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui role pengguna"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Role pengguna berhasil diperbarui"})
}

// DeleteUser - Menghapus pengguna (Admin Only)
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus pengguna"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pengguna berhasil dihapus"})
}
