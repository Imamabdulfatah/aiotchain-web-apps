package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

func UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
		return
	}

	// Retrieve file information
	extension := filepath.Ext(file.Filename)
	// Create a unique filename
	newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), extension)

	// Save the file to the uploads directory
	if err := c.SaveUploadedFile(file, "./uploads/"+newFileName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save the file"})
		return
	}

	// Return the relative path to the file
	fileUrl := "/uploads/" + newFileName
	c.JSON(http.StatusOK, gin.H{
		"url":     fileUrl,
		"message": "Image uploaded successfully",
	})
}

// UploadFile handles generic file uploads (ZIP, etc.)
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
		return
	}

	extension := filepath.Ext(file.Filename)
	newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), extension)

	if err := c.SaveUploadedFile(file, "./uploads/"+newFileName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save the file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":     "/uploads/" + newFileName,
		"message": "File uploaded successfully",
	})
}
