package models

import "time"

type Contact struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(255);not null" json:"name" binding:"required,min=3,max=255"`
	Email     string    `gorm:"type:varchar(255);not null" json:"email" binding:"required,email"`
	Category  string    `gorm:"type:varchar(100);not null" json:"category" binding:"required"`
	Message   string    `gorm:"type:text;not null" json:"message" binding:"required,min=10,max=2000"`
	Status    string    `gorm:"type:varchar(50);default:'new'" json:"status"` // new, read, resolved, archived
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
