package models

import "time"

type CertificateTemplate struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	BackgroundImage string    `gorm:"type:text" json:"backgroundImage"`
	PrimaryColor    string    `gorm:"type:varchar(50);default:'#2563eb'" json:"primaryColor"` // default blue-600
	CertPdfURL      string    `gorm:"type:text" json:"certPdfUrl"`
	CertNameX       float64   `gorm:"default:0" json:"certNameX"`
	CertNameY       float64   `gorm:"default:0" json:"certNameY"`
	CertDateX       float64   `gorm:"default:0" json:"certDateX"`
	CertDateY       float64   `gorm:"default:0" json:"certDateY"`
	CertIdX         float64   `gorm:"default:0" json:"certIdX"`
	CertIdY         float64   `gorm:"default:0" json:"certIdY"`
	CertFontSize    int       `gorm:"default:30" json:"certFontSize"`
	Active          bool      `gorm:"default:true" json:"active"`
	UpdatedAt       time.Time `json:"updatedAt"`
}
