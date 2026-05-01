import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', { host: 'localhost', dialect: 'postgres', logging: false });

async function clearMarketing() {
    try {
        console.log("Clearing marketing data...");
        await sequelize.query('DELETE FROM marketing_testimonials');
        await sequelize.query('DELETE FROM marketing_faqs');
        await sequelize.query('DELETE FROM marketing_stats');
        console.log("Marketing tables cleared successfully!");
    } catch (error) {
        console.error("Error clearing marketing data:", error);
    }
    process.exit(0);
}

clearMarketing();
