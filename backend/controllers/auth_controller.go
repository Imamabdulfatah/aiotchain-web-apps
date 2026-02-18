package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
	"github.com/imam/backend-blog-kuis/utils"
	"golang.org/x/crypto/bcrypt"
)

// Register handles user registration
func Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input tidak valid: " + err.Error()})
		return
	}

	// Set default role to 'user' if not specified
	if user.Role == "" {
		user.Role = "user"
	}

	// Validate role (only 'user' or 'admin' allowed)
	if user.Role != "user" && user.Role != "admin" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role tidak valid. Gunakan 'user' atau 'admin'"})
		return
	}

	// WAJIB: Hash password sebelum disimpan ke Postgres
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses password"})
		return
	}
	user.Password = string(hashedPassword)

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Username/Email sudah digunakan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Registrasi berhasil"})
}

func GetCaptcha(c *gin.Context) {
	captcha := utils.GenerateCaptcha()
	c.JSON(http.StatusOK, captcha)
}

func Login(c *gin.Context) {
	var input models.LoginRequest
	var user models.User

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	// Verify CAPTCHA
	if !utils.VerifyCaptcha(input.CaptchaToken, input.CaptchaAnswer) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "CAPTCHA tidak valid atau kadaluarsa"})
		return
	}

	// Cari user di database
	if err := config.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Username atau Password salah"})
		return
	}

	// Bandingkan Password yang di-input dengan yang di-hash di DB
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Username atau Password salah"})
		return
	}

	// GENERATE JWT TOKEN YANG ASLI
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // Token berlaku 24 jam
	})

	tokenString, err := token.SignedString(utils.GetJWTSecret())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":   tokenString, // Sekarang ini adalah JWT valid (header.payload.sig)
		"message": "Login berhasil",
	})
}

func ForgotPassword(c *gin.Context) {
	var input struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email wajib diisi"})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email tidak terdaftar"})
		return
	}

	// Generate random token
	b := make([]byte, 32)
	rand.Read(b)
	token := hex.EncodeToString(b)

	// Set token and expiry (1 hour)
	expires := time.Now().Add(time.Hour)
	user.ResetPasswordToken = token
	user.ResetPasswordExpires = &expires

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan token reset"})
		return
	}

	// Send Email
	resetLink := fmt.Sprintf("http://localhost:3000/auth/reset-password?token=%s", token)
	mailBody := fmt.Sprintf("Klik link berikut untuk reset password Anda: <a href=\"%s\">%s</a>", resetLink, resetLink)

	err := utils.SendEmail(user.Email, "Reset Password - AIOT", mailBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengirim email reset"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Link reset password telah dikirim ke email Anda"})
}

func ResetPassword(c *gin.Context) {
	var input struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token dan password baru wajib diisi"})
		return
	}

	var user models.User
	if err := config.DB.Where("reset_password_token = ? AND reset_password_expires > ?", input.Token, time.Now()).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token tidak valid atau sudah kadaluarsa"})
		return
	}

	// Hash password baru
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)

	// Clear reset token fields
	user.ResetPasswordToken = ""
	user.ResetPasswordExpires = nil

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password berhasil diperbarui"})
}

// GetCurrentUser returns the current logged in user profile
func GetCurrentUser(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint
	switch v := userIDRaw.(type) {
	case float64:
		userID = uint(v)
	case uint:
		userID = v
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateProfile updates the current user's profile information
func UpdateProfile(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint
	switch v := userIDRaw.(type) {
	case float64:
		userID = uint(v)
	case uint:
		userID = v
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
		return
	}

	var input struct {
		Email          string `json:"email"`
		Phone          string `json:"phone"`
		LinkedIn       string `json:"linkedin"`
		SocialMedia    string `json:"social_media"`
		ProfilePicture string `json:"profile_picture"`
		Interests      string `json:"interests"`
		ReferralSource string `json:"referral_source"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Update fields
	if input.Email != "" {
		user.Email = input.Email
	}
	user.Phone = input.Phone
	user.LinkedIn = input.LinkedIn
	user.SocialMedia = input.SocialMedia
	user.ProfilePicture = input.ProfilePicture
	user.Interests = input.Interests
	user.ReferralSource = input.ReferralSource

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate profil"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profil berhasil diperbarui", "user": user})
}
