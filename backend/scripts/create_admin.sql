-- create_admin.sql
-- Usage: psql -U postgres -d EAPSRFINAL -f create_admin.sql
--
-- This script creates an admin user with:
-- Email: adminscholarship10@gmail.com
-- Password: Admin12345@Scholarship (bcrypt hash included)
-- Role: admin

-- First check if user exists and update/create accordingly
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'adminscholarship10@gmail.com') INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'User already exists. Updating role to admin...';
        UPDATE users 
        SET role = 'admin', 
            is_active = true, 
            name = 'Admin Scholarship',
            password = '$2b$10$Vfkqz0KgAyZOGLkx7YQLierJoDb3zChp7P6NKNFkATc/f1zQlBnaS'
        WHERE email = 'adminscholarship10@gmail.com';
    ELSE
        RAISE NOTICE 'Creating new admin user...';
        INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
        VALUES (
            'Admin Scholarship',
            'adminscholarship10@gmail.com',
            '$2b$10$Vfkqz0KgAyZOGLkx7YQLierJoDb3zChp7P6NKNFkATc/f1zQlBnaS',
            'admin',
            true,
            NOW(),
            NOW()
        );
    END IF;
END $$;
