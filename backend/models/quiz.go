package models

import "time"

// Quiz representasi tabel kuis
type Quiz struct {
	ID                   uint          `gorm:"primaryKey" json:"id"`
	PathID               uint          `json:"pathId" binding:"required"`
	LearningPath         *LearningPath `gorm:"foreignKey:PathID" json:"learningPath,omitempty"`
	ChapterID            uint          `json:"chapterId" binding:"required"`
	Title                string        `gorm:"type:varchar(255);not null" json:"title" binding:"required,min=3,max=255"`
	Description          string        `gorm:"type:text" json:"description"`
	Type                 string        `gorm:"type:varchar(50);default:'quiz'" json:"type" binding:"required,oneof=material quiz project"` // material, quiz, project
	Order                int           `gorm:"default:0" json:"order"`
	Content              string        `gorm:"type:text" json:"content" binding:"required_if=Type material,required_if=Type project"` // Deskripsi/Instruksi
	VideoURL             string        `gorm:"type:varchar(255)" json:"videoUrl"`                                                     // Link YouTube
	Difficulty           string        `gorm:"type:varchar(50);default:'Sedang'" json:"difficulty"`
	ProjectFileURL       string        `gorm:"type:varchar(255)" json:"projectFileUrl"`   // Link ke file ZIP
	ProjectDriveLink     string        `gorm:"type:varchar(255)" json:"projectDriveLink"` // Link Google Drive
	AllowZipSubmission   bool          `gorm:"default:false" json:"allowZipSubmission"`   // Izinkan pengumpulan file ZIP
	AllowDriveSubmission bool          `gorm:"default:false" json:"allowDriveSubmission"` // Izinkan pengumpulan link Google Drive
	PdfURL               string        `gorm:"type:text" json:"pdfUrl"`                   // Opsional upload PDF untuk materi

	Duration  int        `json:"duration"`
	Questions []Question `gorm:"foreignKey:QuizID;constraint:OnDelete:CASCADE;" json:"questions,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

// Question representasi tabel pertanyaan
type Question struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	QuizID       uint   `json:"quizId" binding:"required"`
	QuestionText string `gorm:"type:text;not null" json:"questionText" binding:"required"`
	// Kita simpan options sebagai JSON atau string dipisahkan koma
	Options       string    `gorm:"type:text" json:"options" binding:"required"`
	CorrectAnswer string    `gorm:"type:varchar(255);not null" json:"correctAnswer" binding:"required"`
	CreatedAt     time.Time `json:"createdAt"`
}
