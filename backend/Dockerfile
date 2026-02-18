# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM golang:1.24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

# Copy go.mod and go.sum first to cache dependency download
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .

# Build binary (static, no CGO needed for postgres driver)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server .

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM alpine:3.20

# Install certificates (needed for HTTPS/Google OAuth calls)
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/server .

# Create uploads directory (file uploads will be stored here)
RUN mkdir -p /app/uploads

# Expose API port
EXPOSE 8080

# Run the server
CMD ["./server"]
