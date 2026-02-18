-- ============================================
-- COMMENTS TABLE MIGRATION
-- ============================================
-- This script creates the comments table for blog posts
-- Run this after the posts and users tables are created

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Grant permissions to the application user (quizuser)
-- IMPORTANT: Run these as a superuser or the table owner
GRANT ALL PRIVILEGES ON TABLE comments TO quizuser;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE comments_id_seq TO quizuser;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample comments (adjust post_id and user_id as needed)
-- INSERT INTO comments (post_id, user_id, content) VALUES
-- (1, 1, 'Artikel yang sangat informatif! Terima kasih sudah berbagi.'),
-- (1, 2, 'Saya sangat tertarik dengan topik ini. Apakah ada artikel lanjutan?'),
-- (2, 1, 'Penjelasan yang detail dan mudah dipahami.');

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- To drop the comments table (WARNING: This will delete all comments)
-- DROP TABLE IF EXISTS comments CASCADE;
