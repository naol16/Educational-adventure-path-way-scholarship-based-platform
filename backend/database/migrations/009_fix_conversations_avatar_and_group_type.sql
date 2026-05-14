-- Fix conversations table schema to match Sequelize model definitions

-- Add missing avatar_url column
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);

-- Add missing is_active column
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Create ENUM type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_type_enum') THEN
        CREATE TYPE group_type_enum AS ENUM ('Public', 'Private');
    END IF;
END $$;

-- Add group_type column as ENUM
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS group_type group_type_enum DEFAULT 'Public';

-- Add category column if needed
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_is_active ON conversations(is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_group_type ON conversations(group_type);
