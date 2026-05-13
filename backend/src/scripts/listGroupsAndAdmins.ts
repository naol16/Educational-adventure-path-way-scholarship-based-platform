import { connectSequelize } from "../config/sequelize.js";
import { Conversation, User } from "../models/index.js";

async function listAll() {
    await connectSequelize();
    const groups = await Conversation.findAll({ where: { isGroup: true } });
    const admins = await User.findAll({ where: { role: 'Admin' } });
    
    console.log("Found groups count:", groups.length);
    groups.forEach(g => console.log(`- ${g.name} (${g.country})`));
    
    console.log("Found admins:");
    admins.forEach(a => console.log(`- ${a.name} (ID: ${a.id}, Email: ${a.email})`));
    
    process.exit(0);
}

listAll().catch(err => {
    console.error(err);
    process.exit(1);
});
