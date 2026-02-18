// models/payment.go
package models

import (
	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model
	UserID        uint   `json:"user_id"`
	User          User   `gorm:"foreignKey:UserID" json:"user"`
	OrderID       string `gorm:"uniqueIndex" json:"order_id"`
	Amount        int64  `json:"amount"`
	Status        string `gorm:"default:'pending'" json:"status"` // pending, settlement, cancel, deny, expire
	PaymentType   string `json:"payment_type"`
	SnapURL       string `json:"snap_url"`
	TransactionID string `json:"transaction_id"`
}
