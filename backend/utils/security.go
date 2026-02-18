package utils

import (
	"github.com/microcosm-cc/bluemonday"
)

// SanitizeHTML membersihkan HTML dari tag berbahaya (XSS Protection)
func SanitizeHTML(content string) string {
	p := bluemonday.UGCPolicy()

	// Allow YouTube Iframes
	p.AllowIFrames()
	p.AllowAttrs("src", "width", "height", "frameborder", "allow", "allowfullscreen", "title", "referrerpolicy", "class").OnElements("iframe")
	p.AllowDataAttributes()
	p.AllowURLSchemes("http", "https")

	// Allow specific URL patterns for YouTube
	p.AllowStandardURLs()

	// Allow Image attributes
	p.AllowAttrs("src", "alt", "title", "class", "width", "height").OnElements("img")

	// Allow common class attributes for styling
	p.AllowAttrs("class").OnElements("div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6", "article", "section", "iframe")

	return p.Sanitize(content)
}
