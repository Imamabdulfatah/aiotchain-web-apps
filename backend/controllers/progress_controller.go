package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

const QuizCooldownMinutes = 3

// CompleteLesson - Mark a lesson/module as completed
func CompleteLesson(c *gin.Context) {
	var input struct {
		UserID              uint   `json:"userId" binding:"required"`
		QuizID              uint   `json:"lessonId" binding:"required"`
		SubmissionFileURL   string `json:"submissionFileUrl"`
		SubmissionDriveLink string `json:"submissionDriveLink"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Determine initial approval status for project types
	var quizInfo models.Quiz
	config.DB.First(&quizInfo, input.QuizID)
	approvalStatus := ""
	if quizInfo.Type == "project" && (input.SubmissionFileURL != "" || input.SubmissionDriveLink != "") {
		approvalStatus = "pending"
	}

	// Build the progress struct for lookup
	progress := models.UserProgress{
		UserID: input.UserID,
		QuizID: input.QuizID,
	}

	// Find or create the record (without Assign so FirstOrCreate works reliably)
	if err := config.DB.Where("user_id = ? AND quiz_id = ?", input.UserID, input.QuizID).
		FirstOrCreate(&progress).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan progres"})
		return
	}

	// Always update submission fields so re-submissions work correctly
	updateFields := map[string]interface{}{
		"completed": true,
	}
	if input.SubmissionFileURL != "" {
		updateFields["submission_file_url"] = input.SubmissionFileURL
	}
	if input.SubmissionDriveLink != "" {
		updateFields["submission_drive_link"] = input.SubmissionDriveLink
	}
	if approvalStatus != "" && progress.ApprovalStatus != "approved" {
		// Don't override an already-approved status
		updateFields["approval_status"] = approvalStatus
	}

	if err := config.DB.Model(&progress).Updates(updateFields).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui progres"})
		return
	}

	// CHECK FOR CERTIFICATE ISSUANCE
	var quiz models.Quiz
	if err := config.DB.First(&quiz, input.QuizID).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Progres disimpan", "data": progress})
		return
	}

	var totalQuizzes int64
	config.DB.Model(&models.Quiz{}).Where("path_id = ?", quiz.PathID).Count(&totalQuizzes)

	var completedQuizzes int64
	config.DB.Model(&models.UserProgress{}).
		Joins("JOIN quizzes ON quizzes.id = user_progresses.quiz_id").
		Where("user_progresses.user_id = ? AND quizzes.path_id = ? AND user_progresses.completed = true", input.UserID, quiz.PathID).
		Count(&completedQuizzes)

	isComplete := totalQuizzes > 0 && completedQuizzes >= totalQuizzes

	if isComplete {
		var pendingProjects int64
		config.DB.Model(&models.UserProgress{}).
			Joins("JOIN quizzes ON quizzes.id = user_progress.quiz_id").
			Where("user_progress.user_id = ? AND quizzes.path_id = ? AND quizzes.type = 'project' AND user_progress.approval_status != 'approved'", input.UserID, quiz.PathID).
			Count(&pendingProjects)

		if pendingProjects == 0 {
			var certExists int64
			config.DB.Model(&models.Certificate{}).Where("user_id = ? AND learning_path_id = ?", input.UserID, quiz.PathID).Count(&certExists)
			if certExists == 0 {
				b := make([]byte, 4)
				rand.Read(b)
				certID := fmt.Sprintf("AIOT-%d-%X", quiz.PathID, hex.EncodeToString(b))
				config.DB.Create(&models.Certificate{
					UserID:         input.UserID,
					LearningPathID: quiz.PathID,
					CertificateID:  certID,
					IssuedAt:       time.Now(),
				})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Progres disimpan",
		"data":       progress,
		"isComplete": isComplete,
	})
}

// RecordQuizFailed - Records a quiz failure timestamp for cooldown enforcement
func RecordQuizFailed(c *gin.Context) {
	var input struct {
		UserID uint `json:"userId" binding:"required"`
		QuizID uint `json:"lessonId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	progress := models.UserProgress{
		UserID: input.UserID,
		QuizID: input.QuizID,
	}

	config.DB.Where("user_id = ? AND quiz_id = ?", input.UserID, input.QuizID).
		Assign(models.UserProgress{QuizFailedAt: &now, Completed: false}).
		FirstOrCreate(&progress)

	config.DB.Model(&progress).Update("quiz_failed_at", now)

	cooldownEnd := now.Add(QuizCooldownMinutes * time.Minute)
	c.JSON(http.StatusOK, gin.H{
		"message":     "Cooldown dimulai",
		"cooldownEnd": cooldownEnd.Unix(),
	})
}

// CheckCooldown - Check remaining cooldown seconds for a user's quiz
func CheckCooldown(c *gin.Context) {
	userID := c.Query("userId")
	lessonID := c.Query("lessonId")

	var progress models.UserProgress
	if err := config.DB.Where("user_id = ? AND quiz_id = ?", userID, lessonID).First(&progress).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"remainingSeconds": 0, "onCooldown": false})
		return
	}

	if progress.QuizFailedAt == nil || progress.Completed {
		c.JSON(http.StatusOK, gin.H{"remainingSeconds": 0, "onCooldown": false})
		return
	}

	cooldownEnd := progress.QuizFailedAt.Add(QuizCooldownMinutes * time.Minute)
	remaining := time.Until(cooldownEnd).Seconds()

	if remaining <= 0 {
		c.JSON(http.StatusOK, gin.H{"remainingSeconds": 0, "onCooldown": false})
	} else {
		c.JSON(http.StatusOK, gin.H{"remainingSeconds": int(remaining), "onCooldown": true})
	}
}

// GetSubmissions - List all project submissions for admin review
func GetSubmissions(c *gin.Context) {
	type SubmissionResponse struct {
		ID                  uint   `json:"id"`
		UserID              uint   `json:"userId"`
		Username            string `json:"username"`
		Email               string `json:"email"`
		QuizID              uint   `json:"lessonId"`
		PathID              uint   `json:"pathId"`
		LessonTitle         string `json:"lessonTitle"`
		PathTitle           string `json:"pathTitle"`
		SubmissionFileURL   string `json:"submissionFileUrl"`
		SubmissionDriveLink string `json:"submissionDriveLink"`
		ApprovalStatus      string `json:"approvalStatus"`
		AdminNote           string `json:"adminNote"`
		CreatedAt           string `json:"createdAt"`
	}

	var progresses []models.UserProgress
	config.DB.Preload("User").Preload("Quiz").Preload("Quiz.LearningPath").
		Joins("JOIN quizzes ON quizzes.id = user_progresses.quiz_id").
		Where("quizzes.type = 'project'").
		Order("user_progresses.created_at DESC").
		Find(&progresses)

	results := []SubmissionResponse{}
	for _, p := range progresses {
		pathTitle := ""
		if p.Quiz.LearningPath != nil {
			pathTitle = p.Quiz.LearningPath.Title
		}
		results = append(results, SubmissionResponse{
			ID:                  p.ID,
			UserID:              p.UserID,
			Username:            p.User.Username,
			Email:               p.User.Email,
			QuizID:              p.QuizID,
			PathID:              p.Quiz.PathID,
			LessonTitle:         p.Quiz.Title,
			PathTitle:           pathTitle,
			SubmissionFileURL:   p.SubmissionFileURL,
			SubmissionDriveLink: p.SubmissionDriveLink,
			ApprovalStatus:      p.ApprovalStatus,
			AdminNote:           p.AdminNote,
			CreatedAt:           p.CreatedAt.Format("2006-01-02 15:04"),
		})
	}

	c.JSON(http.StatusOK, results)
}

// ApproveSubmission - Approve a project submission and potentially issue a certificate
func ApproveSubmission(c *gin.Context) {
	id := c.Param("id")

	var progress models.UserProgress
	if err := config.DB.First(&progress, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission tidak ditemukan"})
		return
	}

	config.DB.Model(&progress).Updates(map[string]interface{}{
		"approval_status": "approved",
		"admin_note":      "",
	})

	// Try to issue certificate
	var quiz models.Quiz
	if err := config.DB.First(&quiz, progress.QuizID).Error; err == nil {
		var totalQuizzes, completedQuizzes, pendingProjects int64
		config.DB.Model(&models.Quiz{}).Where("path_id = ?", quiz.PathID).Count(&totalQuizzes)
		config.DB.Model(&models.UserProgress{}).
			Joins("JOIN quizzes ON quizzes.id = user_progresses.quiz_id").
			Where("user_progresses.user_id = ? AND quizzes.path_id = ? AND user_progresses.completed = true", progress.UserID, quiz.PathID).
			Count(&completedQuizzes)
		config.DB.Model(&models.UserProgress{}).
			Joins("JOIN quizzes ON quizzes.id = user_progresses.quiz_id").
			Where("user_progresses.user_id = ? AND quizzes.path_id = ? AND quizzes.type = 'project' AND user_progresses.approval_status != 'approved'", progress.UserID, quiz.PathID).
			Count(&pendingProjects)

		if totalQuizzes > 0 && completedQuizzes >= totalQuizzes && pendingProjects == 0 {
			var certExists int64
			config.DB.Model(&models.Certificate{}).Where("user_id = ? AND learning_path_id = ?", progress.UserID, quiz.PathID).Count(&certExists)
			if certExists == 0 {
				b := make([]byte, 4)
				rand.Read(b)
				certID := fmt.Sprintf("AIOT-%d-%X", quiz.PathID, hex.EncodeToString(b))
				config.DB.Create(&models.Certificate{
					UserID:         progress.UserID,
					LearningPathID: quiz.PathID,
					CertificateID:  certID,
					IssuedAt:       time.Now(),
				})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission disetujui"})
}

// RejectSubmission - Reject a project submission with optional admin note
func RejectSubmission(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		AdminNote string `json:"adminNote"`
	}
	c.ShouldBindJSON(&input)

	var progress models.UserProgress
	if err := config.DB.First(&progress, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission tidak ditemukan"})
		return
	}

	config.DB.Model(&progress).Updates(map[string]interface{}{
		"approval_status": "rejected",
		"admin_note":      input.AdminNote,
	})

	c.JSON(http.StatusOK, gin.H{"message": "Submission ditolak"})
}

// GetPathProgress - Get progress percentage for a specific path
func GetPathProgress(c *gin.Context) {
	userID := c.Query("userId")
	pathID := c.Query("pathId")

	if userID == "" || pathID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId and pathId are required"})
		return
	}

	var totalQuizzes int64
	config.DB.Model(&models.Quiz{}).Where("path_id = ?", pathID).Count(&totalQuizzes)

	var completedQuizzes int64
	config.DB.Model(&models.UserProgress{}).
		Joins("JOIN quizzes ON quizzes.id = user_progresses.quiz_id").
		Where("user_progresses.user_id = ? AND quizzes.path_id = ?", userID, pathID).
		Count(&completedQuizzes)

	var percentage int = 0
	if totalQuizzes > 0 {
		percentage = int((float64(completedQuizzes) / float64(totalQuizzes)) * 100)
	}

	c.JSON(http.StatusOK, gin.H{
		"pathId":    pathID,
		"completed": completedQuizzes,
		"total":     totalQuizzes,
		"progress":  percentage,
	})
}

// GetUserProgress - Get detailed progress status for a user in a path
func GetUserProgress(c *gin.Context) {
	userID := c.Query("userId")
	pathID := c.Query("pathId")

	if userID == "" || pathID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId and pathId are required"})
		return
	}

	type ProgressDetail struct {
		LessonID       uint   `json:"lessonId"`
		Completed      bool   `json:"completed"`
		ApprovalStatus string `json:"approvalStatus"`
	}

	var progresses []models.UserProgress
	config.DB.Where("user_id = ?", userID).
		Joins("JOIN quizzes ON quizzes.id = user_progresses.quiz_id").
		Where("quizzes.path_id = ?", pathID).
		Find(&progresses)

	results := []ProgressDetail{}
	for _, p := range progresses {
		results = append(results, ProgressDetail{
			LessonID:       p.QuizID,
			Completed:      p.Completed,
			ApprovalStatus: p.ApprovalStatus,
		})
	}

	c.JSON(http.StatusOK, results)
}

// GetLessonProgress - Get detailed progress record for a specific user and lesson
func GetLessonProgress(c *gin.Context) {
	userID := c.Query("userId")
	quizID := c.Query("lessonId")

	var progress models.UserProgress
	if err := config.DB.Where("user_id = ? AND quiz_id = ?", userID, quizID).First(&progress).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Progres tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, progress)
}

// GetUserSummaryStats - Get aggregate stats for a user's profile page
func GetUserSummaryStats(c *gin.Context) {
	userID := c.Query("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	var quizCount, assetCount int64
	config.DB.Model(&models.UserProgress{}).Where("user_id = ? AND completed = ?", userID, true).Count(&quizCount)
	config.DB.Model(&models.Asset{}).Where("user_id = ?", userID).Count(&assetCount)

	c.JSON(http.StatusOK, gin.H{
		"quizzesCompleted": uint64(quizCount),
		"articlesRead":     uint64(quizCount * 2),
		"assetsUploaded":   uint64(assetCount),
		"points":           uint64(quizCount * 50),
	})
}

// GetAccessibleMaterials - Get all lesson PDFs from paths the user has joined
func GetAccessibleMaterials(c *gin.Context) {
	userID := c.Query("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	type MaterialResponse struct {
		LessonTitle string `json:"lessonTitle"`
		PathTitle   string `json:"pathTitle"`
		PdfURL      string `json:"pdfUrl"`
	}

	var results []MaterialResponse
	// Find all paths user has progress in, then get all material PDFs from those paths
	err := config.DB.Table("quizzes").
		Select("quizzes.title as lesson_title, learning_paths.title as path_title, quizzes.pdf_url as pdf_url").
		Joins("JOIN learning_paths ON learning_paths.id = quizzes.path_id").
		Where("quizzes.pdf_url != '' AND quizzes.pdf_url IS NOT NULL").
		Where("quizzes.path_id IN (?)",
			config.DB.Table("user_progresses").
				Select("quizzes.path_id").
				Joins("JOIN quizzes ON quizzes.id = user_progresses.quiz_id").
				Where("user_progresses.user_id = ?", userID).
				Group("quizzes.path_id"),
		).
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data materi: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, results)
}
