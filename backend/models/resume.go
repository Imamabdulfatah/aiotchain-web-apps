package models

import "time"

type Resume struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Data      string    `gorm:"type:text;not null" json:"data"` // JSON string of CV content
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
