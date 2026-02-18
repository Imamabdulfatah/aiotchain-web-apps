package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/rand"
	"strconv"
	"strings"
	"time"
)

type Captcha struct {
	Question string `json:"question"`
	Token    string `json:"token"`
}

func init() {
	rand.Seed(time.Now().UnixNano())
}

// GenerateCaptcha creates a simple math problem and a signed token of the answer
func GenerateCaptcha() Captcha {
	a := rand.Intn(10) + 1
	b := rand.Intn(10) + 1

	question := fmt.Sprintf("%d + %d = ?", a, b)
	answer := strconv.Itoa(a + b)

	expiry := time.Now().Add(5 * time.Minute).Unix()
	payload := fmt.Sprintf("%s:%d", answer, expiry)

	h := hmac.New(sha256.New, GetJWTSecret())
	h.Write([]byte(payload))
	signature := hex.EncodeToString(h.Sum(nil))

	token := fmt.Sprintf("%s:%d", signature, expiry)

	return Captcha{
		Question: question,
		Token:    token,
	}
}

// VerifyCaptcha checks if the provided answer matches the signed token
func VerifyCaptcha(token string, answer string) bool {
	answer = strings.TrimSpace(answer)
	if token == "" || answer == "" {
		return false
	}

	parts := strings.Split(token, ":")
	if len(parts) != 2 {
		fmt.Printf("[CAPTCHA] Invalid token format: '%s'\n", token)
		return false
	}
	signature := parts[0]
	expiryStr := parts[1]

	expiry, err := strconv.ParseInt(expiryStr, 10, 64)
	if err != nil {
		fmt.Printf("[CAPTCHA] Expiry parse error: %v for token '%s'\n", err, token)
		return false
	}

	if time.Now().Unix() > expiry {
		fmt.Printf("[CAPTCHA] Token expired. Expiry: %d, Now: %d\n", expiry, time.Now().Unix())
		return false
	}

	expectedPayload := fmt.Sprintf("%s:%d", answer, expiry)
	h := hmac.New(sha256.New, GetJWTSecret())
	h.Write([]byte(expectedPayload))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	if signature != expectedSignature {
		fmt.Printf("[CAPTCHA] Invalid Answer. Input: '%s', ExpectedSig: %s, GotSig: %s\n", answer, expectedSignature, signature)
		return false
	}

	return true
}
