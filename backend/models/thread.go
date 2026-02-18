package models

import (
	"time"
)

type Thread struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"size:255;not null" json:"title" binding:"required,min=5,max=255"`
	Content   string    `gorm:"type:text;not null" json:"content" binding:"required"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	Category  string    `gorm:"size:100" json:"category"`
	ImageURL  string    `gorm:"size:255" json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	User     User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Comments []Comment `gorm:"foreignKey:ThreadID" json:"comments,omitempty"`
}

type ThreadResponse struct {
	ID           uint      `json:"id"`
	Title        string    `json:"title"`
	Content      string    `json:"content"`
	UserID       uint      `json:"user_id"`
	Username     string    `json:"username"`
	Category     string    `json:"category"`
	ImageURL     string    `json:"image_url"`
	CommentCount int64     `json:"comment_count"`
	CreatedAt    time.Time `json:"created_at"`
}
