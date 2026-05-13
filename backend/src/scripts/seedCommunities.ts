process.env.DB_SYNC = 'false';

import { connectSequelize, sequelize } from "../config/sequelize.js";
import { UserRole } from "../types/userTypes.js";
import bcrypt from "bcryptjs";

async function seedCommunities() {
    console.log("Starting seedCommunities...");
    await connectSequelize();
    console.log("connectSequelize finished.");
    
    try {
        console.log("🔍 Checking for Admin user...");
        
        // Use raw SQL to avoid model mismatch issues during seeding
        const [adminRows] = await sequelize.query(`SELECT id FROM users WHERE email = 'admin@educationalpathway.com' LIMIT 1`);
        
        let adminId;
        const hashedPassword = await bcrypt.hash("admin123", 10);

        if ((adminRows as any[]).length === 0) {
            console.log("Admin does not exist, creating with password 'admin123'...");
            const [result] = await sequelize.query(`
                INSERT INTO users (name, email, password, role, is_active, is_verified, created_at, updated_at)
                VALUES ('System Admin', 'admin@educationalpathway.com', '${hashedPassword}', 'admin', true, true, NOW(), NOW())
                RETURNING id
            `);
            adminId = (result as any[])[0].id;
            console.log(`✅ Created Admin with ID: ${adminId}`);
        } else {
            adminId = (adminRows as any[])[0].id;
            console.log(`Admin exists with ID: ${adminId}. Updating password to 'admin123' for login safety.`);
            await sequelize.query(`
                UPDATE users SET password = '${hashedPassword}', role = 'admin', is_active = true, is_verified = true 
                WHERE id = ${adminId}
            `);
            console.log(`✅ Updated Admin credentials.`);
        }

        const communities = [
            { name: "Canada Community", country: "Canada", description: "All about studying and living in Canada." },
            { name: "USA Community", country: "USA", description: "Your guide to American universities and visas." },
            { name: "UK Community", country: "UK", description: "Everything about British higher education." },
            { name: "Australia Community", country: "Australia", description: "Explore opportunities down under." },
            { name: "Germany Community", country: "Germany", description: "Focus on free education and engineering in Germany." }
        ];
        
        for (const comm of communities) {
            // Check if exists
            const [existing] = await sequelize.query(`SELECT id FROM conversations WHERE country = '${comm.country}' AND is_group = true LIMIT 1`);
            
            if ((existing as any[]).length === 0) {
                const [convResult] = await sequelize.query(`
                    INSERT INTO conversations (name, country, description, is_group, is_active, group_type, category, created_by, created_at, updated_at)
                    VALUES ('${comm.name}', '${comm.country}', '${comm.description}', true, true, 'Public', 'Community', ${adminId}, NOW(), NOW())
                    RETURNING id
                `);
                const conversationId = (convResult as any[])[0].id;
                console.log(`✅ Created community: ${comm.name}`);

                // Join the admin
                await sequelize.query(`
                    INSERT INTO conversation_participants (conversation_id, user_id, role, created_at, updated_at)
                    VALUES (${conversationId}, ${adminId}, 'Admin', NOW(), NOW())
                    ON CONFLICT (conversation_id, user_id) DO NOTHING
                `);
            } else {
                console.log(`ℹ️ Community already exists: ${comm.name}`);
            }
        }
        
        console.log("🚀 Seeding complete! Login with: admin@educationalpathway.com / admin123");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seedCommunities().catch(err => {
    console.error(err);
    process.exit(1);
});
