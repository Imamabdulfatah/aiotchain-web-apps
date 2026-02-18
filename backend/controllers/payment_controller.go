package controllers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/imam/backend-blog-kuis/config"
	"github.com/imam/backend-blog-kuis/models"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/coreapi"
	"github.com/midtrans/midtrans-go/snap"
)

var c coreapi.Client
var s snap.Client

func InitMidtrans() {
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	env := midtrans.Sandbox
	if os.Getenv("MIDTRANS_IS_PRODUCTION") == "true" {
		env = midtrans.Production
	}

	c.New(serverKey, env)
	s.New(serverKey, env)
}

// CreateTransaction membuat transaksi baru di Midtrans
func CreateTransaction(ctx *gin.Context) {
	// Pastikan InitMidtrans dipanggil (bisa juga di main.go)
	InitMidtrans()

	var input struct {
		Amount int64  `json:"amount" binding:"required"`
		Plan   string `json:"plan"` // Pro Monthly, Pro Annual, etc.
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ambil user dari context (setelah middleware auth)
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Konversi userID ke uint (asumsi userID di context float64 dari JWT)
	uid := uint(userID.(float64))

	var user models.User
	if err := config.DB.First(&user, uid).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Buat Order ID unik
	orderID := fmt.Sprintf("ORDER-%d-%d", uid, time.Now().Unix())

	// Buat request snap
	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: input.Amount,
		},
		CreditCard: &snap.CreditCardDetails{
			Secure: true,
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: user.Username,
			Email: user.Email,
			Phone: user.Phone,
		},
		EnabledPayments: snap.AllSnapPaymentType,
	}

	// Request ke Midtrans Snap API
	snapResp, err := s.CreateTransaction(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Midtrans Error: " + err.Message})
		return
	}

	// Simpan transaksi ke database
	payment := models.Payment{
		UserID:        uid,
		OrderID:       orderID,
		Amount:        input.Amount,
		Status:        "pending",
		PaymentType:   input.Plan,
		SnapURL:       snapResp.RedirectURL,
		TransactionID: snapResp.Token,
	}

	if err := config.DB.Create(&payment).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save payment"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"token":        snapResp.Token,
		"redirect_url": snapResp.RedirectURL,
		"order_id":     orderID,
	})
}

// HandleNotification menangani webhook dari Midtrans
func HandleNotification(ctx *gin.Context) {
	InitMidtrans()

	var notificationPayload map[string]interface{}
	if err := ctx.ShouldBindJSON(&notificationPayload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	orderID, exists := notificationPayload["order_id"].(string)
	if !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Order ID missing"})
		return
	}

	transactionStatus, _ := notificationPayload["transaction_status"].(string)
	fraudStatus, _ := notificationPayload["fraud_status"].(string)

	var payment models.Payment
	if err := config.DB.Where("order_id = ?", orderID).First(&payment).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// Update status berdasarkan response Midtrans
	if transactionStatus == "capture" {
		if fraudStatus == "challenge" {
			payment.Status = "challenge"
		} else if fraudStatus == "accept" {
			payment.Status = "success"
		}
	} else if transactionStatus == "settlement" {
		payment.Status = "success"
	} else if transactionStatus == "deny" {
		payment.Status = "deny"
	} else if transactionStatus == "cancel" || transactionStatus == "expire" {
		payment.Status = "failure"
	} else if transactionStatus == "pending" {
		payment.Status = "pending"
	}

	// Simpan perubahan status
	config.DB.Save(&payment)

	// Jika sukses, update role user jadi 'pro' atau tambahkan masa aktif langganan (opsional)
	if payment.Status == "success" {
		// Update user role to 'pro'
		if err := config.DB.Model(&models.User{}).Where("id = ?", payment.UserID).Update("role", "pro").Error; err != nil {
			fmt.Printf("Failed to update user role: %v\n", err)
		}
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Notification processed"})
}

// GetPaymentStats mengembalikan statistik ringkasan pembayaran untuk dashboard admin
func GetPaymentStats(ctx *gin.Context) {
	var totalRevenue int64
	var activeSubs int64
	var pendingPayments int64
	var successTransactions int64

	// Hitung Total Revenue (hanya transaksi sukses)
	config.DB.Model(&models.Payment{}).Where("status = ?", "success").Select("COALESCE(SUM(amount), 0)").Scan(&totalRevenue)

	// Hitung Transaksi Sukses
	config.DB.Model(&models.Payment{}).Where("status = ?", "success").Count(&successTransactions)

	// Hitung Pending Payments
	config.DB.Model(&models.Payment{}).Where("status = ?", "pending").Count(&pendingPayments)

	// Hitung Active Subs (Asumsi setiap user dengan transaksi sukses dihitung sebagai active sub sementara)
	// Idealnya ada tabel subscription terpisah atau field di user
	config.DB.Model(&models.Payment{}).Where("status = ?", "success").Distinct("user_id").Count(&activeSubs)

	ctx.JSON(http.StatusOK, gin.H{
		"total_revenue":        totalRevenue,
		"active_subscriptions": activeSubs,
		"pending_payments":     pendingPayments,
		"success_transactions": successTransactions,
	})
}

// GetAllPayments mengembalikan daftar semua pembayaran dengan pagination dan filter
func GetAllPayments(ctx *gin.Context) {
	var payments []models.Payment
	var total int64

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit
	search := ctx.Query("search")
	status := ctx.Query("status")

	query := config.DB.Model(&models.Payment{}).Preload("User")

	if search != "" {
		query = query.Joins("JOIN users ON users.id = payments.user_id").
			Where("users.username ILIKE ? OR users.email ILIKE ? OR payments.order_id ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if status != "" && status != "All Status" {
		query = query.Where("payments.status = ?", status)
	}

	query.Count(&total)

	if err := query.Order("created_at desc").Limit(limit).Offset(offset).Find(&payments).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":  payments,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}
