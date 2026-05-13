import { Sequelize } from "sequelize-typescript";
import { Conversation, User, ConversationParticipant } from "../models/index.js";
import configs from "../config/configs.js";

async function seedCommunitiesFast() {
    console.log("🚀 Starting fast seed...");
    
    const sequelize = new Sequelize({
        dialect: "postgres",
        host: configs.DB_HOST,
        port: configs.DB_PORT,
        username: configs.DB_USER,
        password: configs.DB_PASSWORD,
        database: configs.DB_NAME,
        logging: false,
        models: [User, Conversation, ConversationParticipant],
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    });

    try {
        await sequelize.authenticate();
        console.log("✅ Authenticated.");
        
        const admin = await User.findOne({ where: { role: 'Admin' } });
        if (!admin) {
            console.error("❌ No admin found.");
            process.exit(1);
        }
        console.log(`👤 Using admin: ${admin.name} (ID: ${admin.id})`);

        const communities = [
            { name: "Canada Community", country: "Canada", description: "All about studying and living in Canada." },
            { name: "USA Community", country: "USA", description: "Your guide to American universities and visas." },
            { name: "UK Community", country: "UK", description: "Everything about British higher education." },
            { name: "Australia Community", country: "Australia", description: "Explore opportunities down under." },
            { name: "Germany Community", country: "Germany", description: "Focus on free education and engineering in Germany." }
        ];

        for (const comm of communities) {
            const [conversation, created] = await Conversation.findOrCreate({
                where: { country: comm.country, isGroup: true },
                defaults: {
                    name: comm.name,
                    description: comm.description,
                    isGroup: true,
                    isActive: true,
                    groupType: 'Public',
                    category: 'Community',
                    createdBy: admin.id
                }
            });
            
            if (created) {
                console.log(`✅ Created: ${comm.name}`);
                await ConversationParticipant.create({
                    conversationId: conversation.id,
                    userId: admin.id,
                    role: 'Admin'
                });
            } else {
                console.log(`ℹ️ Exists: ${comm.name}`);
            }
        }

        console.log("🏁 Done!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

seedCommunitiesFast();
