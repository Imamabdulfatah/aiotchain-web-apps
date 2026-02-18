package models

import "time"

type Chapter struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	LearningPathID uint      `json:"learningPathId" binding:"required"`
	Title          string    `gorm:"type:varchar(255);not null" json:"title" binding:"required,min=3,max=255"`
	Order          int       `gorm:"default:0" json:"order"`
	Lessons        []Quiz    `gorm:"foreignKey:ChapterID;constraint:OnDelete:CASCADE;" json:"lessons,omitempty"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
