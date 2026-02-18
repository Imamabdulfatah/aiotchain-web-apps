package controllers

import (
	"fmt"
	"log"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
	"github.com/imam/backend-blog-kuis/utils"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// Subscribe — POST /api/subscribe
// Public endpoint: saves an email to the subscriber list.
func Subscribe(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email wajib diisi"})
		return
	}

	if !emailRegex.MatchString(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format email tidak valid"})
		return
	}

	subscriber := models.Subscriber{Email: req.Email}
	result := config.DB.Where("email = ?", req.Email).FirstOrCreate(&subscriber)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan email"})
		return
	}

	// RowsAffected == 0 means the record already existed (FirstOrCreate found it)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email sudah terdaftar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Berhasil berlangganan! Anda akan menerima update artikel terbaru."})
}

// NotifySubscribers sends a notification email to all subscribers when a new article is published.
// Should be called asynchronously (go NotifySubscribers(post)).
func NotifySubscribers(post models.Post) {
	var subscribers []models.Subscriber
	if err := config.DB.Find(&subscribers).Error; err != nil {
		log.Printf("[Newsletter] Gagal mengambil daftar pelanggan: %v", err)
		return
	}

	if len(subscribers) == 0 {
		return
	}

	subject := fmt.Sprintf("Artikel Baru: %s", post.Title)
	body := buildNewsletterEmail(post)

	successCount := 0
	for _, sub := range subscribers {
		if err := utils.SendEmail(sub.Email, subject, body); err != nil {
			log.Printf("[Newsletter] Gagal kirim email ke %s: %v", sub.Email, err)
		} else {
			successCount++
		}
	}

	log.Printf("[Newsletter] Notifikasi terkirim ke %d/%d pelanggan untuk artikel '%s'", successCount, len(subscribers), post.Title)
}

func buildNewsletterEmail(post models.Post) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);padding:40px 48px;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-1px;">
                AIOT<span style="font-weight:300;font-style:italic;">Chain</span>
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">
                Newsletter
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">
                Artikel Baru Tersedia
              </p>
              <h2 style="margin:0 0 16px;color:#111827;font-size:26px;font-weight:900;line-height:1.3;">
                %s
              </h2>
              <p style="margin:0 0 32px;color:#4b5563;font-size:15px;line-height:1.8;">
                %s
              </p>
              <a href="%s/blog/%s"
                 style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:800;font-size:14px;letter-spacing:0.5px;box-shadow:0 8px 24px rgba(37,99,235,0.3);">
                Baca Artikel →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9;padding:24px 48px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:600;">
                Anda menerima email ini karena berlangganan update artikel dari AIoTChain.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`, post.Title, post.Excerpt, frontendURL(), post.Slug)
}

func frontendURL() string {
	// Uses the same domain for the link in email — adjust if needed
	return "https://aiotchain.vercel.app"
}
