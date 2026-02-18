package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
)

// GetDashboardStats - Mengambil data statistik dan aktivitas terbaru untuk dashboard
func GetDashboardStats(c *gin.Context) {
	var postCount, pathCount, userCount, pendingSubmissionsCount int64
	var recentPosts []models.Post
	var recentPaths []models.LearningPath

	// 1. Basic Counts
	if err := config.DB.Model(&models.Post{}).Count(&postCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung post"})
		return
	}
	if err := config.DB.Model(&models.LearningPath{}).Count(&pathCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung path"})
		return
	}
	if err := config.DB.Model(&models.User{}).Count(&userCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung user"})
		return
	}
	if err := config.DB.Model(&models.UserProgress{}).Where("approval_status = ?", "pending").Count(&pendingSubmissionsCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung pending submission"})
		return
	}

	// 2. Recent Items
	if err := config.DB.Order("id desc").Limit(5).Find(&recentPosts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil post terbaru"})
		return
	}

	if err := config.DB.Order("id desc").Limit(5).Find(&recentPaths).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil path terbaru"})
		return
	}

	// 3. Real Trend Data (7 Days)
	// Kita ambil tren dari gabungan post dan path (atau bisa pilih salah satu)
	// Agar sederhana namun real, kita hitung post yang dibuat per hari dalam 7 hari terakhir
	type TrendData struct {
		Date  string `json:"date"`
		Count int    `json:"count"`
	}
	var trend []TrendData
	config.DB.Raw(`
		SELECT TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') as date, count(*) as count 
		FROM posts 
		WHERE created_at > now() - interval '7 days' 
		GROUP BY 1 
		ORDER BY 1 ASC
	`).Scan(&trend)

	// 4. Category Distribution
	type Distributor struct {
		Label string `json:"label"`
		Value int    `json:"value"`
		Color string `json:"color"`
	}
	var distribution []Distributor
	config.DB.Raw(`
		SELECT category as label, count(*) as value 
		FROM posts 
		WHERE category IS NOT NULL AND category != ''
		GROUP BY category 
		ORDER BY value DESC 
		LIMIT 4
	`).Scan(&distribution)

	// Assign colors if distribution exists
	colors := []string{"bg-blue-600", "bg-indigo-600", "bg-emerald-600", "bg-amber-600"}
	for i := range distribution {
		if i < len(colors) {
			distribution[i].Color = colors[i]
		}
	}

	// 5. Onboarding Stats (Interests Distribution)
	var interestDistribution []Distributor
	config.DB.Raw(`
		SELECT trim(interest) as label, count(*) as value 
		FROM (
			SELECT unnest(string_to_array(interests, ',')) as interest 
			FROM users 
			WHERE interests IS NOT NULL AND interests != ''
		) sub
		GROUP BY 1 
		ORDER BY value DESC 
		LIMIT 5
	`).Scan(&interestDistribution)

	for i := range interestDistribution {
		if i < len(colors) {
			interestDistribution[i].Color = colors[i]
		}
	}

	// 6. Referral Source Distribution
	var referralDistribution []Distributor
	config.DB.Raw(`
		SELECT referral_source as label, count(*) as value 
		FROM users 
		WHERE referral_source IS NOT NULL AND referral_source != ''
		GROUP BY referral_source 
		ORDER BY value DESC
	`).Scan(&referralDistribution)

	for i := range referralDistribution {
		if i < len(colors) {
			referralDistribution[i].Color = colors[i]
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"counts": gin.H{
			"totalPosts":              postCount,
			"totalPaths":              pathCount,
			"totalUsers":              userCount,
			"pendingSubmissionsCount": pendingSubmissionsCount,
		},
		"recentPosts":          recentPosts,
		"recentPaths":          recentPaths,
		"activityTrend":        trend,
		"distribution":         distribution,
		"interestDistribution": interestDistribution,
		"referralDistribution": referralDistribution,
	})
}
