import { connectSequelize, sequelize } from "./backend/src/config/sequelize.js";
import { User } from "./backend/src/models/User.js";
import { UserRole } from "./backend/src/types/userTypes.js";

async function fixAdmins() {
  try {
    await connectSequelize();
    console.log("Database connected. Fixing admin verification status...");

    const [updatedCount] = await User.update(
      { isVerified: true, isActive: true },
      {
        where: {
          role: UserRole.ADMIN,
          email: ["josefdagne5@gmail.com", "lemesanaol16@gmail.com"]
        }
      }
    );

    console.log(`Successfully updated ${updatedCount} admin accounts.`);
    process.exit(0);
  } catch (error) {
    console.error("Error fixing admins:", error);
    process.exit(1);
  }
}

fixAdmins();
