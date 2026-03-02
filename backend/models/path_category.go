package models

type PathCategory struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"type:varchar(100);uniqueIndex;not null" json:"name" binding:"required"`
}
