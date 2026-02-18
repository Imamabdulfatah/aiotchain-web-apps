package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// exemptCSRFPaths are paths that skip CSRF header validation.
// Auth endpoints are exempt because CSRF attacks only work against authenticated sessions via cookies.
// An unauthenticated login/register/google endpoint cannot be exploited via CSRF.
var exemptCSRFPaths = map[string]bool{
	"/api/auth/login":           true,
	"/api/auth/register":        true,
	"/api/auth/google":          true,
	"/api/auth/forgot-password": true,
	"/api/auth/reset-password":  true,
	"/api/contact":              true,
	"/api/subscribe":            true,
}

func CSRFMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get token from cookie
		cookie, err := c.Cookie("aiot_csrf_token")

		// 2. If no token, generate one
		if err != nil || cookie == "" {
			b := make([]byte, 32)
			rand.Read(b)
			cookie = hex.EncodeToString(b)

			// Set SameSite policy explicitly for cross-port/cross-IP dev access
			c.SetSameSite(http.SameSiteLaxMode)

			// Path: / , HttpOnly: false (so JS can read it), Secure: false (for dev), SameSite: Lax
			c.SetCookie("aiot_csrf_token", cookie, 3600*24, "/", "", false, false)
		}

		// Simpan token di context agar bisa diambil oleh handler di request yang sama (misal /csrf-cookie)
		c.Set("csrf_token", cookie)

		// 3. Skip validation for safe methods
		method := c.Request.Method
		if method == "GET" || method == "HEAD" || method == "OPTIONS" || method == "TRACE" {
			c.Next()
			return
		}

		// 4. Skip validation for exempt paths (e.g., public auth endpoints)
		if exemptCSRFPaths[c.Request.URL.Path] {
			log.Printf("[CSRF] Skipping validation for exempt path: %s", c.Request.URL.Path)
			c.Next()
			return
		}

		// 5. Skip CSRF validation if the request uses a Bearer token in Authorization header.
		//    Bearer-token auth is inherently CSRF-safe because:
		//    - CSRF attacks rely on the browser automatically sending cookies.
		//    - A forged cross-origin request cannot set a custom Authorization header.
		//    - Therefore, any request with a valid Bearer token cannot be a CSRF attack.
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") && len(authHeader) > 7 {
			log.Printf("[CSRF] Skipping validation for Bearer-authenticated request: %s %s", method, c.Request.URL.Path)
			c.Next()
			return
		}

		// 6. Validate token for all other unsafe methods (cookie-based auth flows)
		headerToken := c.GetHeader("X-CSRF-Token")

		log.Printf("[CSRF Debug] Method: %s, Path: %s", method, c.Request.URL.Path)
		log.Printf("[CSRF Debug] Cookie Token: %s", cookie)
		log.Printf("[CSRF Debug] Header Token: %s", headerToken)

		if headerToken == "" || !strings.EqualFold(headerToken, cookie) {
			log.Printf("[CSRF Error] Mismatch! Header: '%s', Cookie: '%s'", headerToken, cookie)
			c.JSON(http.StatusForbidden, gin.H{"error": "CSRF token mismatch"})
			c.Abort()
			return
		}

		c.Next()
	}
}
