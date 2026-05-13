import { connectSequelize } from "../config/sequelize.js";
import { Conversation } from "../models/index.js";

async function checkGroups() {
    await connectSequelize();
    const groups = await Conversation.findAll({ where: { isGroup: true } });
    console.log("Found groups:", JSON.stringify(groups, null, 2));
    process.exit(0);
}

checkGroups().catch(err => {
    console.error(err);
    process.exit(1);
});
