package models

import "time"

type Like struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null;uniqueIndex:idx_user_target" json:"userId"`
	TargetID   uint      `gorm:"not null;uniqueIndex:idx_user_target" json:"targetId"`
	TargetType string    `gorm:"not null;uniqueIndex:idx_user_target" json:"targetType"` // "post" or "asset"
	CreatedAt  time.Time `json:"createdAt"`
}
