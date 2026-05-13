-- Fix chat_messages table schema to match Sequelize ChatMessage model

-- Rename parent_id to reply_to_id to match model field name
ALTER TABLE chat_messages
RENAME COLUMN parent_id TO reply_to_id;

-- Add missing is_edited column
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT false;

-- Add missing attachment_url column
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(255);

-- Add missing attachment_type column
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_id ON chat_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_edited ON chat_messages(is_edited);
