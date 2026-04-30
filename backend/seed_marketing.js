import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', { host: 'localhost', dialect: 'postgres', logging: false });

async function seed() {
    try {
        // Create tables if they don't exist
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS marketing_testimonials (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                text TEXT NOT NULL,
                avatar VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS marketing_faqs (
                id SERIAL PRIMARY KEY,
                question VARCHAR(512) NOT NULL,
                answer TEXT NOT NULL,
                "order" INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS marketing_stats (
                id SERIAL PRIMARY KEY,
                label VARCHAR(255) NOT NULL,
                value VARCHAR(255) NOT NULL,
                "isManual" BOOLEAN DEFAULT FALSE,
                "dbKey" VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Clear existing data
        await sequelize.query('DELETE FROM marketing_testimonials');
        await sequelize.query('DELETE FROM marketing_faqs');
        await sequelize.query('DELETE FROM marketing_stats');

        // Seed Stats
        await sequelize.query(`
            INSERT INTO marketing_stats (label, value, "isManual", "dbKey") VALUES
            ('Active Scholarships', '0+', FALSE, 'scholarships'),
            ('Success Rate', '94%', TRUE, NULL),
            ('Verified Counselors', '0+', FALSE, 'counselors'),
            ('Students Placed', '0+', FALSE, 'students')
        `);

        // Seed Testimonials
        await sequelize.query(`
            INSERT INTO marketing_testimonials (name, role, text, avatar) VALUES
            ('Abebe Kebede', 'Scholarship Recipient', 'Admas changed my life. The AI matching found a scholarship I never would have discovered on my own. I''m now studying at Stanford!', 'https://i.pravatar.cc/150?u=abebe'),
            ('Selamawit Tadesse', 'Masters Student', 'The assessment tools are incredible. They helped me identify my weak spots in IELTS and improve my score by 2 points in just a month.', 'https://i.pravatar.cc/150?u=selam'),
            ('Yonas Alemu', 'University Applicant', 'The counseling network is top-notch. My counselor gave me insights into the visa process that saved me months of stress.', 'https://i.pravatar.cc/150?u=yonas')
        `);

        // Seed FAQs
        await sequelize.query(`
            INSERT INTO marketing_faqs (question, answer, "order") VALUES
            ('How does the AI matching work?', 'Our engine uses advanced semantic search to compare your profile details against thousands of scholarship requirements in real-time, focusing on eligibility and probability of success.', 1),
            ('Is the platform free for students?', 'Yes, the core scholarship discovery and matching platform is free for students. We offer premium services like one-on-one counseling for more personalized support.', 2),
            ('Can I use it if I''m from outside Ethiopia?', 'Absolutely! While we started with a focus on Ethiopian students, Admas is now open to students across Africa seeking global education opportunities.', 3)
        `);

        console.log("Marketing data seeded successfully!");
    } catch (error) {
        console.error("Error seeding marketing data:", error);
    }
    process.exit(0);
}

seed();
