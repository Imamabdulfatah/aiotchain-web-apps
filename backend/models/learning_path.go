package models

import "time"

type LearningPath struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Title        string    `gorm:"type:varchar(255);not null" json:"title" binding:"required,min=5,max=255"`
	Description  string    `gorm:"type:text" json:"description" binding:"required"`
	Difficulty   string    `gorm:"type:varchar(50);default:'Sedang'" json:"difficulty" binding:"required,oneof=Pemula Menengah Mahir"`
	Duration     int       `json:"duration" binding:"required,min=1"` // Total duration in minutes
	Thumbnail    string    `json:"thumbnail" binding:"omitempty"`
	IsPremium    bool      `gorm:"default:false" json:"isPremium"`
	Chapters     []Chapter `gorm:"foreignKey:LearningPathID;constraint:OnDelete:CASCADE;" json:"chapters,omitempty"`
	UserCount    int       `gorm:"default:0" json:"userCount"`
	CertBg       string    `gorm:"type:text" json:"certBg"`
	CertColor    string    `gorm:"type:varchar(50);default:'#2563eb'" json:"certColor" binding:"omitempty,hexcolor"`
	CertPdfURL   string    `gorm:"type:text" json:"certPdfUrl"`
	CertNameX    float64   `gorm:"default:0" json:"certNameX"`
	CertNameY    float64   `gorm:"default:0" json:"certNameY"`
	CertDateX    float64   `gorm:"default:0" json:"certDateX"`
	CertDateY    float64   `gorm:"default:0" json:"certDateY"`
	CertIdX      float64   `gorm:"default:0" json:"certIdX"`
	CertIdY      float64   `gorm:"default:0" json:"certIdY"`
	CertFontSize int       `gorm:"default:30" json:"certFontSize"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Enrollment struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	UserID         uint      `gorm:"not null" json:"userId"`
	LearningPathID uint      `gorm:"not null" json:"learningPathId"`
	EnrolledAt     time.Time `json:"enrolledAt"`
}
