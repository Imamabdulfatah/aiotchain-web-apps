package models

import "time"

type Certificate struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	UserID         uint      `gorm:"not null;index" json:"userId"`
	LearningPathID uint      `gorm:"not null;index" json:"learningPathId"`
	CertificateID  string    `gorm:"type:varchar(100);unique;not null" json:"certificateId"`
	IssuedAt       time.Time `json:"issuedAt"`

	// Relationships
	User         User         `gorm:"foreignKey:UserID" json:"-"`
	LearningPath LearningPath `gorm:"foreignKey:LearningPathID" json:"-"`
}
