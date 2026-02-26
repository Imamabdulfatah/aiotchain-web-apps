# AIoT Chain: Integrated Platform for AI and IoT Applications

AIoT Chain is a comprehensive web application designed to bridge the gap between Artificial Intelligence and Internet of Things. It features a robust frontend for user interaction and a scalable backend for data management and service orchestration.

## 🚀 Project Structure

The project is organized into two main components:

- **[aiotchain](./aiotchain/)**: The frontend application built with Next.js.
- **[backend](./backend/)**: The backend API server built with Go (Golang).

## ✨ Key Features

- **Interactive 3D Visualizations**: Uses Three.js and React Three Fiber for immersive experiences.
- **Advanced Content Editing**: Integrated Tiptap editor with custom extensions for rich media and code blocks.
- **Authentication**: Secure login using JWT and Google OAuth 2.0.
- **Progressive Web App (PWA)**: Optimized for mobile and desktop usage with offline capabilities.
- **Payment Integration**: Support for Midtrans payment gateway.
- **Dynamic Quiz & Blog**: Fully functional platforms for learning and sharing knowledge.

## 🛠️ Tech Stack

### Frontend (aiotchain)
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **3D Engine**: Three.js, React Three Fiber
- **State Management & UI**: React 19, Lucide React
- **Editor**: Tiptap

### Backend (backend)
- **Language**: Go 1.24
- **Framework**: Gin Gonic
- **Database**: PostgreSQL (via pgx), GORM
- **Authentication**: JWT (golang-jwt)
- **API**: RESTful API

## 🚦 Getting Started

### Prerequisites
- Node.js (v20 or later)
- Go (v1.24 or later)
- PostgreSQL

### Frontend Setup
1. Navigate to the `aiotchain` directory:
   ```bash
   cd aiotchain
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (copy `.env.example` to `.env.local`).
4. Run the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Configure environment variables (copy `.env.example` to `.env`).
3. Run the application:
   ```bash
   go run main.go
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
