import { Scholarship } from "../models/Scholarship.js";
import { Student } from "../models/Student.js";
import { sequelize } from "../config/sequelize.js";

async function run() {
    try {
        await sequelize.authenticate();
        const scholarshipCount = await Scholarship.count();
        const embeddedScholarshipCount = await Scholarship.count({ 
            where: sequelize.literal('"embedding" IS NOT NULL') 
        });
        
        console.log(`Total Scholarships: ${scholarshipCount}`);
        console.log(`Embedded Scholarships: ${embeddedScholarshipCount}`);
        
        const students = await Student.findAll({ limit: 5 });
        students.forEach(s => {
            console.log(`Student ID: ${s.id}, User ID: ${s.userId}, Onboarded: ${s.isOnboarded}, Embedding: ${s.embedding ? 'YES' : 'NO'}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

run();
