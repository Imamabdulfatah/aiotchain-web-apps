package controllers

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/imam/backend-blog-kuis/models"
	"github.com/imam/backend-blog-kuis/repository"
	"github.com/imam/backend-blog-kuis/utils"
	"google.golang.org/api/idtoken"
)

func GoogleLogin(c *gin.Context) {
	var input struct {
		Token string `json:"token"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	// Verify Google ID Token
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	if clientID == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "GOOGLE_CLIENT_ID is not configured"})
		return
	}

	payload, err := idtoken.Validate(context.Background(), input.Token, clientID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token: " + err.Error()})
		return
	}

	email := payload.Claims["email"].(string)
	googleID := payload.Subject
	name := payload.Claims["name"].(string)

	var user models.User
	userRepo := repository.NewUserRepository()

	// Check if user exists by GoogleID
	foundUser, err := userRepo.FindByGoogleID(googleID)
	if err == nil {
		user = *foundUser
	} else {
		// Try to find by email if GoogleID not found
		foundUser, err = userRepo.FindByEmail(email)
		if err == nil {
			user = *foundUser
			// Update GoogleID if user was found by email but didn't have GoogleID
			user.GoogleID = &googleID
			userRepo.Save(&user)
		} else {
			// Create new user if not exists
			user = models.User{
				Username: name, // Use Google name as username initial
				Email:    email,
				GoogleID: &googleID,
				Role:     "user",
			}
			// In case of username collision, we could append some random chars or use email prefix
			if err := userRepo.Create(&user); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
				return
			}
		}
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(utils.GetJWTSecret())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":   tokenString,
		"message": "Login successful",
	})
}
