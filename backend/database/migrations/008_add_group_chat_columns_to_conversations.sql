-- Add group chat columns to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS is_group BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS name VARCHAR(100),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add role column to conversation_participants table for admin/member distinction
ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'member';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_is_group ON conversations(is_group);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_role ON conversation_participants(role);
