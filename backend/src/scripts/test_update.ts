import { OnboardingService } from "../services/OnboardingService.js";
import { sequelize } from "../config/sequelize.js";
import { Student } from "../models/Student.js";

async function run() {
    try {
        await sequelize.authenticate();
        console.log("DB Connected");
        
        const student = await Student.findOne();
        if (!student) {
            console.log("No student found to test with");
            return;
        }

        console.log(`Testing update for student ID: ${student.id}, User ID: ${student.userId}`);
        
        const testData = {
            fullName: "Test User Updated",
            gpa: 3.9,
            academicStatus: "Bachelor's",
            graduationYear: "2025",
            fieldOfStudy: ["Computer Science"]
        };

        const result = await OnboardingService.updateProfile(student.userId, testData);
        console.log("Update successful!");
        console.log("Result:", JSON.stringify(result, null, 2).substring(0, 500));

    } catch (err: any) {
        console.error("CRASH DETECTED:");
        console.error(err);
        if (err.stack) console.error(err.stack);
    } finally {
        await sequelize.close();
    }
}

run();
