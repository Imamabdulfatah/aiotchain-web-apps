package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
	"github.com/imam/backend-blog-kuis/utils"
	"gorm.io/gorm"
)

// GetLearningPaths - Mengambil semua learning path dengan filter joined
func GetLearningPaths(c *gin.Context) {
	joined := c.Query("joined")
	userID := c.Query("userId") // Bisa dari query atau nanti dari token di middleware

	var paths []models.LearningPath
	if err := config.DB.Find(&paths).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil learning path"})
		return
	}

	type PathWithProgress struct {
		models.LearningPath
		Progress int `json:"progress"`
	}

	// Initialize as empty slice instead of nil to avoid null in JSON
	results := []PathWithProgress{}
	for _, p := range paths {
		var totalQuizzes int64
		config.DB.Model(&models.Quiz{}).Where("path_id = ?", p.ID).Count(&totalQuizzes)

		var completedQuizzes int64
		if userID != "" {
			config.DB.Model(&models.UserProgress{}).
				Joins("JOIN quizzes ON quizzes.id = user_progress.quiz_id").
				Where("user_progress.user_id = ? AND quizzes.path_id = ?", userID, p.ID).
				Count(&completedQuizzes)
		}

		progress := 0
		if totalQuizzes > 0 {
			progress = int((float64(completedQuizzes) / float64(totalQuizzes)) * 100)
		}

		// Jika joined=true, hanya masukkan yang progress > 0
		if joined == "true" {
			if progress > 0 {
				results = append(results, PathWithProgress{
					LearningPath: p,
					Progress:     progress,
				})
			}
		} else {
			results = append(results, PathWithProgress{
				LearningPath: p,
				Progress:     progress,
			})
		}
	}

	c.JSON(http.StatusOK, results)
}

// GetLearningPath - Mengambil satu learning path dengan module-modulenya
func GetLearningPath(c *gin.Context) {
	id := c.Param("id")
	var path models.LearningPath

	err := config.DB.Preload("Chapters", func(db *gorm.DB) *gorm.DB {
		return db.Order(`"order" ASC`)
	}).Preload("Chapters.Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Order(`"order" ASC`)
	}).First(&path, id).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Learning path tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, path)
}

// GetQuizzes - (Module list for a path)
func GetQuizzes(c *gin.Context) {
	pathID := c.Query("pathId")
	var quizzes []models.Quiz

	db := config.DB
	if pathID != "" {
		db = db.Where("path_id = ?", pathID)
	}

	if err := db.Order("\"order\" ASC").Find(&quizzes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil modul"})
		return
	}

	c.JSON(http.StatusOK, quizzes)
}

// GetQuizQuestions - Mengambil soal berdasarkan ID Kuis (Module)
func GetQuizQuestions(c *gin.Context) {
	id := c.Param("id")
	var questions []models.Question

	if err := config.DB.Where("quiz_id = ?", id).Find(&questions).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Soal tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, questions)
}

// checkAccess memeriksa apakah user boleh mengakses materi (premium check)
func checkAccess(c *gin.Context, quizID string) bool {
	var quiz models.Quiz
	if err := config.DB.Preload("LearningPath").First(&quiz, quizID).Error; err != nil {
		return false
	}

	// Jika Learning Path tidak premium atau tidak ada, akses diizinkan
	if quiz.LearningPath == nil || !quiz.LearningPath.IsPremium {
		return true
	}

	// Cek Role User
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		return false
	}

	var uid uint
	switch v := userIDRaw.(type) {
	case float64:
		uid = uint(v)
	case uint:
		uid = v
	default:
		return false
	}

	var user models.User
	if err := config.DB.First(&user, uid).Error; err != nil {
		return false
	}

	if user.Role == "admin" || user.Role == "pro" {
		return true
	}

	return false
}

// CreateQuiz - Admin membuat modul baru
func CreateQuiz(c *gin.Context) {
	var quiz models.Quiz
	if err := c.ShouldBindJSON(&quiz); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	// Sanitize content
	quiz.Content = utils.SanitizeHTML(quiz.Content)
	quiz.Description = utils.SanitizeHTML(quiz.Description)

	if err := config.DB.Create(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan modul"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Modul berhasil dibuat", "data": quiz})
}

// DeleteQuiz - Menghapus kuis berdasarkan ID
func DeleteQuiz(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Quiz{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kuis"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Kuis berhasil dihapus"})
}

// GetQuiz - Mengambil detail kuis beserta pertanyaannya (Admin/Public)
func GetQuiz(c *gin.Context) {
	id := c.Param("id")
	var quiz models.Quiz

	// Preload "Questions" agar data pertanyaan ikut terambil
	if err := config.DB.Preload("Questions").First(&quiz, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kuis tidak ditemukan"})
		return
	}

	// Cek Akses Premium
	if !checkAccess(c, id) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Konten Premium. Silakan upgrade ke PRO."})
		return
	}

	c.JSON(http.StatusOK, quiz)
}

// --- Learning Path Admin Controllers ---

func CreateLearningPath(c *gin.Context) {
	var path models.LearningPath
	if err := c.ShouldBindJSON(&path); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	// Sanitize
	path.Description = utils.SanitizeHTML(path.Description)

	if err := config.DB.Create(&path).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat learning path"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Learning path berhasil dibuat", "data": path})
}

func UpdateLearningPath(c *gin.Context) {
	id := c.Param("id")
	var path models.LearningPath
	if err := config.DB.First(&path, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Learning path tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&path); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	// Sanitize
	path.Description = utils.SanitizeHTML(path.Description)

	if err := config.DB.Save(&path).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui learning path"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Learning path diperbarui", "data": path})
}

func DeleteLearningPath(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.LearningPath{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus learning path"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Learning path berhasil dihapus"})
}

// --- Chapter Admin Controllers ---

func CreateChapter(c *gin.Context) {
	var chapter models.Chapter
	if err := c.ShouldBindJSON(&chapter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}
	if err := config.DB.Create(&chapter).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat bab"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bab berhasil dibuat", "data": chapter})
}

func UpdateChapter(c *gin.Context) {
	id := c.Param("id")
	var chapter models.Chapter
	if err := config.DB.First(&chapter, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bab tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&chapter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}
	if err := config.DB.Save(&chapter).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui bab"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bab diperbarui", "data": chapter})
}

func DeleteChapter(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Chapter{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus bab"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bab berhasil dihapus"})
}

func UpdateQuiz(c *gin.Context) {
	id := c.Param("id")
	var quiz models.Quiz
	if err := config.DB.First(&quiz, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kuis/Materi tidak ditemukan"})
		return
	}
	if err := c.ShouldBindJSON(&quiz); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi gagal: " + err.Error()})
		return
	}

	// Sanitize
	quiz.Content = utils.SanitizeHTML(quiz.Content)
	quiz.Description = utils.SanitizeHTML(quiz.Description)

	if err := config.DB.Save(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui modul"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Modul diperbarui", "data": quiz})
}
