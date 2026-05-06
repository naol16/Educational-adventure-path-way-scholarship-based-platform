import { connectSequelize } from "./src/config/sequelize.js";
import { Student } from "./src/models/Student.js";
import { MatchingService } from "./src/services/MatchingService.js";

async function testMatching() {
  await connectSequelize();
  console.log("DB connected");

  const student = await Student.findOne({ where: { id: 1 } });
  if (!student) {
    console.log("Student not found");
    process.exit(1);
  }
  console.log(`Found student: id=${student.id}, userId=${student.userId}, onboarded=${student.isOnboarded}`);

  try {
    const matches = await MatchingService.getTopMatches(student.userId);
    console.log(`\nMatches found: ${matches.length}`);
    if (matches.length === 0) {
      console.log("No matches returned. This could be because:");
      console.log("1. Student embedding not generated");
      console.log("2. No scholarships with embeddings");
      console.log("3. Vector similarity threshold or dimension mismatch");
    } else {
      matches.forEach((m, i) => {
        console.log(`${i+1}. ${m.title} (score: ${(m.match_score || 0).toFixed(1)}%)`);
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

testMatching();
