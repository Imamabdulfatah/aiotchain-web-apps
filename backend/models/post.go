package models

import "time"

// Post mewakili struktur data untuk artikel blog
type Post struct {
	ID        int       `json:"id"`
	Title     string    `json:"title" binding:"required,min=5,max=255"`
	Excerpt   string    `json:"excerpt" binding:"max=500"`
	Slug      string    `gorm:"uniqueIndex" json:"slug" binding:"required"`
	Content   string    `json:"content" binding:"required"`
	ImageURL  string    `json:"imageUrl"`
	Category  string    `json:"category" binding:"required"`
	Views     int       `json:"views" gorm:"default:0"`
	CreatedAt time.Time `json:"createdAt"` // Gunakan camelCase agar cocok dengan JavaScript/Next.js
}

// Catatan: Jika Anda berencana menambahkan fitur Quiz nanti,
// Anda bisa menambahkannya di file terpisah atau di bawah ini.
