package models

import "time"

type Asset struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `json:"userId"`
	Title         string    `gorm:"not null" json:"title"`
	Description   string    `json:"description"`
	Category      string    `gorm:"default:'Lainnya'" json:"category"`
	FileURL       string    `gorm:"not null" json:"fileUrl"`
	Thumbnail     string    `json:"thumbnail"`
	Images        string    `json:"images"` // Comma-separated gallery images
	DownloadCount int       `gorm:"default:0" json:"downloadCount"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
