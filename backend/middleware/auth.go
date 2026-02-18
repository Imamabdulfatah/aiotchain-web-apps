package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/imam/backend-blog-kuis/utils"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Ambil header Authorization
		authHeader := c.GetHeader("Authorization")

		// 2. Cek apakah header ada dan formatnya benar (Bearer <token>)
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header diperlukan"})
			c.Abort() // Menghentikan eksekusi handler selanjutnya
			return
		}

		// Opsional: Jika client mengirim "Bearer <token>", kita split
		tokenString := authHeader
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// 3. Parse dan Validasi Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validasi metode signing (HS256)
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return utils.GetJWTSecret(), nil
		})

		// 4. Cek apakah token valid
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau kadaluwarsa"})
			c.Abort()
			return
		}

		// 5. Ambil data dari claims (opsional, untuk dipakai di controller)
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Simpan data username dan role ke context agar bisa diakses di handler/controller
			c.Set("username", claims["username"])
			c.Set("user_id", claims["user_id"])
			c.Set("role", claims["role"])
		}

		c.Next() // Lanjut ke handler berikutnya
	}
}

// AdminOnly middleware - mengizinkan user dengan role 'admin' atau 'super_admin'
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")

		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Role tidak ditemukan"})
			c.Abort()
			return
		}

		// Izinkan admin dan super_admin
		if role != "admin" && role != "super_admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Hanya admin yang dapat mengakses"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// SuperAdminOnly middleware - hanya mengizinkan user dengan role 'super_admin'
func SuperAdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")

		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Role tidak ditemukan"})
			c.Abort()
			return
		}

		if role != "super_admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Hanya Super Admin yang dapat mengakses"})
			c.Abort()
			return
		}

		c.Next()
	}
}
