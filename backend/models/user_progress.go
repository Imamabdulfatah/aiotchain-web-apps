package models

import "time"

type UserProgress struct {
	ID                  uint   `gorm:"primaryKey" json:"id"`
	UserID              uint   `gorm:"not null;uniqueIndex:idx_user_lesson" json:"userId"`
	QuizID              uint   `gorm:"not null;uniqueIndex:idx_user_lesson" json:"lessonId"`
	Completed           bool   `gorm:"default:true" json:"completed"`
	SubmissionFileURL   string `gorm:"type:varchar(255)" json:"submissionFileUrl"`
	SubmissionDriveLink string `gorm:"type:varchar(255)" json:"submissionDriveLink"`
	// Project Approval
	ApprovalStatus string `gorm:"type:varchar(20);default:'pending'" json:"approvalStatus"`
	AdminNote      string `gorm:"type:text" json:"adminNote"`
	// Quiz Cooldown
	QuizFailedAt *time.Time `json:"quizFailedAt"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"-"`
	Quiz Quiz `gorm:"foreignKey:QuizID" json:"-"`
}
