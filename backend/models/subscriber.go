package models

import "time"

// Subscriber menyimpan email pelanggan newsletter artikel
type Subscriber struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	CreatedAt time.Time `json:"created_at"`
}
