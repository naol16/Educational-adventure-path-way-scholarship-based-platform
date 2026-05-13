-- Add reply_to_id column to chat_messages table for message reply functionality
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS reply_to_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL;

-- Create index for faster lookups on replied messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_id ON chat_messages(reply_to_id);
