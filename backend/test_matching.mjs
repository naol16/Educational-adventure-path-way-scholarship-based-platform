import { connectSequelize } from "./config/sequelize.js";
import { Student } from "./models/Student.js";
import { MatchingService } from "./services/MatchingService.js";

async function testMatching() {
  await connectSequelize();
  console.log("DB connected");

  const student = await Student.findOne({ where: { id: 1 } });
  if (!student) {
    console.log("Student not found");
    process.exit(1);
  }
  console.log(`Found student: ${student.id}, onboarded: ${student.isOnboarded}`);

  try {
    const matches = await MatchingService.getTopMatches(student.userId);
    console.log(`\nMatches found: ${matches.length}`);
    matches.forEach((m, i) => {
      console.log(`${i+1}. ${m.title} (score: ${m.match_score?.toFixed(1)}%)`);
    });
  } catch (error: any) {
    console.error("Error:", error.message);
  }
  process.exit(0);
}

testMatching();
