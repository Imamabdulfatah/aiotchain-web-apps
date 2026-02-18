package routes

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/controllers"
	"github.com/imam/backend-blog-kuis/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// 1. PASANG CORS PERTAMA KALI (Sebelum Route)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.209:3000", "https://aiotchain.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-CSRF-Token"},
		AllowCredentials: true,
	}))

	// 2. CSRF PROTECTION
	r.Use(middleware.CSRFMiddleware())

	// --- SERVE STATIC FILES ---
	r.Static("/uploads", "./uploads")

	// 2. DEFINISIKAN GROUP API
	// --- PUBLIC ROUTES ---
	public := r.Group("/api")
	{
		// Pastikan ada group "auth" di sini
		auth := public.Group("/auth")
		{
			auth.POST("/register", controllers.Register) // Ini akan jadi /api/auth/register
			auth.POST("/login", controllers.Login)       // Ini akan jadi /api/auth/login
			auth.POST("/google", controllers.GoogleLogin)
			auth.POST("/forgot-password", controllers.ForgotPassword)
			auth.POST("/reset-password", controllers.ResetPassword)
			auth.GET("/captcha", controllers.GetCaptcha)
		}

		// Endpoint untuk inisialisasi cookie CSRF
		public.GET("/csrf-cookie", func(c *gin.Context) {
			// Ambil token dari context (diset oleh middleware)
			token, _ := c.Get("csrf_token")
			c.JSON(http.StatusOK, gin.H{
				"message": "CSRF cookie set",
				"token":   token,
			})
		})

		public.GET("/posts", controllers.GetPosts)
		public.GET("/posts/slug/:slug", controllers.GetPostBySlug)

		// Comments (Public - Get comments)
		public.GET("/posts/:id/comments", controllers.GetCommentsByPost)

		// Learning Path & Modules (Quizzes)
		public.GET("/learning-paths", controllers.GetLearningPaths)
		public.GET("/learning-paths/:id", controllers.GetLearningPath)
		public.GET("/certificates/:id", controllers.GetCertificateByID)
		public.GET("/quizzes", controllers.GetQuizzes)
		public.GET("/quizzes/:id", controllers.GetQuiz)
		public.GET("/quizzes/:id/questions", controllers.GetQuizQuestions)

		// Assets Public
		public.GET("/assets", controllers.GetAssets)
		public.GET("/assets/:id", controllers.GetAssetByID)
		public.POST("/assets/:id/download", controllers.IncrementDownload)
		public.GET("/assets/:id/comments", controllers.GetCommentsByAsset)
		public.GET("/learning-paths/:id/comments", controllers.GetCommentsByPath)

		// Contact Form (Public)
		public.POST("/contact", controllers.CreateContact)

		// Newsletter Subscription (Public)
		public.POST("/subscribe", controllers.Subscribe)

		// Payment Notification (Webhook)
		public.POST("/payments/notification", controllers.HandleNotification)

		// Community Threads
		public.GET("/threads", controllers.GetThreads)
		public.GET("/threads/:id", controllers.GetThreadByID)
		public.POST("/threads", middleware.AuthMiddleware(), controllers.CreateThread)
		public.PUT("/threads/:id", middleware.AuthMiddleware(), controllers.UpdateThread)
		public.DELETE("/threads/:id", middleware.AuthMiddleware(), controllers.DeleteThread)
		public.GET("/threads/:id/comments", controllers.GetCommentsByThread)

		// Comments (Auth Required)
		public.POST("/comments", middleware.AuthMiddleware(), controllers.CreateComment)
		public.PUT("/comments/:id", middleware.AuthMiddleware(), controllers.UpdateComment)
		public.DELETE("/comments/:id", middleware.AuthMiddleware(), controllers.DeleteComment)

		// Certificates Public
		public.GET("/certificates/template", controllers.GetCertificateTemplate)

		// User Contributions (Auth Required)
		authGroup := public.Group("")
		authGroup.Use(middleware.AuthMiddleware())
		{
			authGroup.GET("/me", controllers.GetCurrentUser)
			authGroup.PUT("/me", controllers.UpdateProfile)
			authGroup.POST("/upload", controllers.UploadImage)
			authGroup.POST("/assets", controllers.UserCreateAsset)

			// Lesson Progress
			authGroup.POST("/progress/complete", controllers.CompleteLesson)
			authGroup.GET("/progress/user", controllers.GetUserProgress)
			authGroup.GET("/progress/detail", controllers.GetLessonProgress)
			authGroup.GET("/progress/path", controllers.GetPathProgress)
			authGroup.GET("/progress/summary", controllers.GetUserSummaryStats)
			authGroup.GET("/progress/cooldown", controllers.CheckCooldown)
			authGroup.POST("/progress/quiz-failed", controllers.RecordQuizFailed)
			authGroup.GET("/progress/materials", controllers.GetAccessibleMaterials)

			// File Upload for Students (project submission)
			authGroup.POST("/upload-file", controllers.UploadFile)

			// Likes
			authGroup.POST("/likes/toggle", controllers.ToggleLike)
			authGroup.GET("/likes/status", controllers.GetLikeStatus)

			// Certificates
			authGroup.GET("/certificates", controllers.GetUserCertificates)

			// Payments
			authGroup.POST("/payments/create", controllers.CreateTransaction)
		}
	}

	// --- ADMIN ROUTES (PROTECTED) ---
	adminGroup := r.Group("/api/admin")
	adminGroup.Use(middleware.AuthMiddleware())
	adminGroup.Use(middleware.AdminOnly()) // Izinkan admin & super_admin
	{
		// Post Management
		adminGroup.POST("/posts", controllers.CreatePost)
		adminGroup.GET("/posts", controllers.GetPosts)
		adminGroup.PUT("/posts/:id", controllers.UpdatePost)
		adminGroup.DELETE("/posts/:id", controllers.DeletePost)

		// Learning Path Management
		adminGroup.POST("/learning-paths", controllers.CreateLearningPath)
		adminGroup.PUT("/learning-paths/:id", controllers.UpdateLearningPath)
		adminGroup.DELETE("/learning-paths/:id", controllers.DeleteLearningPath)

		// Chapter Management
		adminGroup.POST("/chapters", controllers.CreateChapter)
		adminGroup.PUT("/chapters/:id", controllers.UpdateChapter)
		adminGroup.DELETE("/chapters/:id", controllers.DeleteChapter)

		// Quiz/Lesson Management
		adminGroup.POST("/quizzes", controllers.CreateQuiz)
		adminGroup.PUT("/quizzes/:id", controllers.UpdateQuiz)
		adminGroup.GET("/quizzes", controllers.GetQuizzes)
		adminGroup.GET("/quizzes/:id", controllers.GetQuiz)
		adminGroup.DELETE("/quizzes/:id", controllers.DeleteQuiz)

		// Image & File Upload
		adminGroup.POST("/upload", controllers.UploadImage)
		adminGroup.POST("/upload-file", controllers.UploadFile)

		// Dashboard Stats
		adminGroup.GET("/stats", controllers.GetDashboardStats)

		// Submission Management
		adminGroup.GET("/submissions", controllers.GetSubmissions)
		adminGroup.PUT("/submissions/:id/approve", controllers.ApproveSubmission)
		adminGroup.PUT("/submissions/:id/reject", controllers.RejectSubmission)

		// --- SUPER ADMIN ONLY ROUTES ---
		super := adminGroup.Group("/") // Use explicit slash for clarity
		super.Use(middleware.SuperAdminOnly())
		{
			// Asset Management
			super.POST("/assets", controllers.CreateAsset)
			super.DELETE("/assets/:id", controllers.DeleteAsset)

			// Certificate Management
			super.GET("/certificates", controllers.GetAllCertificates)
			super.DELETE("/certificates/:id", controllers.RevokeCertificate)
			super.PUT("/certificates/template", controllers.UpdateCertificateTemplate)

			// Contact Management
			super.GET("/contacts", controllers.GetContacts)
			super.GET("/contacts/:id", controllers.GetContactByID)
			super.PUT("/contacts/:id/status", controllers.UpdateContactStatus)
			super.DELETE("/contacts/:id", controllers.DeleteContact)

			// Payment Management
			super.GET("/payments", controllers.GetAllPayments)
			super.GET("/payments/stats", controllers.GetPaymentStats)

			// User Management
			super.GET("/users", controllers.GetAllUsers)
			super.PUT("/users/:id/role", controllers.UpdateUserRole)
			super.DELETE("/users/:id", controllers.DeleteUser)
		}
	}

	return r
}
