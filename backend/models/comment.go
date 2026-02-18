package models

import "gorm.io/gorm"

type Comment struct {
	gorm.Model
	PostID         *uint  `json:"post_id"`
	AssetID        *uint  `json:"asset_id"`
	LearningPathID *uint  `json:"learning_path_id"`
	ThreadID       *uint  `json:"thread_id"`
	UserID         uint   `gorm:"not null" json:"user_id"`
	Content        string `gorm:"type:text;not null" json:"content"`
	Rating         int    `gorm:"default:0" json:"rating"`
	ImageURL       string `gorm:"size:255" json:"image_url"`

	// Relations
	User User `gorm:"foreignKey:UserID" json:"user"`
}

// CommentWithUser is used for API responses with user info
type CommentWithUser struct {
	ID             uint   `json:"id"`
	PostID         *uint  `json:"post_id,omitempty"`
	AssetID        *uint  `json:"asset_id,omitempty"`
	LearningPathID *uint  `json:"learning_path_id,omitempty"`
	ThreadID       *uint  `json:"thread_id,omitempty"`
	UserID         uint   `json:"user_id"`
	Content        string `json:"content"`
	Rating         int    `json:"rating"`
	ImageURL       string `json:"image_url"`
	CreatedAt      string `json:"created_at"`
	Username       string `json:"username"`
}
