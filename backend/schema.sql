-- ============================================
-- AIOT Chain Database Schema
-- Separate User & Admin with Role-Based Access
-- ============================================

-- Drop existing table if you want to recreate (CAUTION: This deletes all data)
-- DROP TABLE IF EXISTS users CASCADE;

-- Create Users Table with Role Field
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Ensure only valid roles are allowed
    CONSTRAINT check_role CHECK (role IN ('user', 'admin'))
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- Migration Script (if table already exists)
-- ============================================

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- Add constraint for role validation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE constraint_name = 'check_role'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- Sample Data (Optional)
-- ============================================

-- Insert sample admin user (password: admin123)
-- Note: In production, use bcrypt hashed password
INSERT INTO users (username, email, password, role) 
VALUES (
    'admin',
    'admin@aiotchain.com',
    '$2a$10$YourBcryptHashedPasswordHere',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample regular user (password: user123)
INSERT INTO users (username, email, password, role) 
VALUES (
    'testuser',
    'user@aiotchain.com',
    '$2a$10$YourBcryptHashedPasswordHere',
    'user'
) ON CONFLICT (username) DO NOTHING;

-- ============================================
-- Useful Queries
-- ============================================

-- View all users with their roles
-- SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC;

-- Count users by role
-- SELECT role, COUNT(*) as total FROM users GROUP BY role;

-- ============================================
-- Posts Table Definition
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    image_url TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- ============================================
-- Assets Table Definition
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail TEXT,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
