// models/user.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model                      // Ini otomatis menambahkan field ID (uint)
	Username             string     `gorm:"unique;not null" json:"username" binding:"required,min=3,max=20,alphanum"`
	Email                string     `gorm:"unique;not null" json:"email" binding:"required,email"`
	Password             string     `json:"password" binding:"required,min=8,max=100"`
	GoogleID             *string    `gorm:"uniqueIndex" json:"google_id"`
	Role                 string     `gorm:"type:varchar(50);not null;default:'user'" json:"role"`
	Phone                string     `json:"phone"`
	LinkedIn             string     `json:"linkedin"`
	SocialMedia          string     `json:"social_media"`
	ProfilePicture       string     `json:"profile_picture"`
	Interests            string     `json:"interests"`
	ReferralSource       string     `json:"referral_source"`
	ResetPasswordToken   string     `json:"reset_password_token"`
	ResetPasswordExpires *time.Time `json:"reset_password_expires"`
}

type LoginRequest struct {
	Username      string `json:"username" binding:"required"`
	Password      string `json:"password" binding:"required"`
	CaptchaToken  string `json:"captcha_token"`
	CaptchaAnswer string `json:"captcha_answer"`
}
