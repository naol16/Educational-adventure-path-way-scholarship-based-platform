-- Add missing columns to conversation_participants table to match Sequelize model

-- Create ENUM type for role if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_role_enum') THEN
        CREATE TYPE participant_role_enum AS ENUM ('Admin', 'Moderator', 'Member');
    END IF;
END $$;

-- Add role column as ENUM
ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS role participant_role_enum NOT NULL DEFAULT 'Member';

-- Add is_muted column as BOOLEAN
ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS is_muted BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_conversation_participants_role ON conversation_participants(role);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_is_muted ON conversation_participants(is_muted);
