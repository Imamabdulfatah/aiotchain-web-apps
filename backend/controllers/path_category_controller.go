package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

// Get All Path Categories
func GetPathCategories(c *gin.Context) {
	var categories []models.PathCategory
	if err := config.DB.Order("name ASC").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// Create Path Category
func CreatePathCategory(c *gin.Context) {
	var category models.PathCategory
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	if err := config.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan kategori. Mungkin nama sudah ada?"})
		return
	}

	c.JSON(http.StatusOK, category)
}

// Update Path Category
func UpdatePathCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.PathCategory
	if err := config.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}

	var input models.PathCategory
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	category.Name = input.Name

	if err := config.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kategori"})
		return
	}
	c.JSON(http.StatusOK, category)
}

// Delete Path Category
func DeletePathCategory(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.PathCategory{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Path Category deleted"})
}
