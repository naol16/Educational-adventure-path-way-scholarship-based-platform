import { UserRepository } from "../repositories/UserRepository.js";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/sequelize.js";

const resetAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to database.");

        const email = "josefdagne5@gmail.com";
        const newPassword = "Admin@123";
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await UserRepository.findByEmail(email);
        if (user) {
            await UserRepository.updatePassword(user.id, hashedPassword);
            console.log(`Password for ${email} reset to ${newPassword}`);
        } else {
            console.log(`User ${email} not found.`);
        }
    } catch (error) {
        console.error("Error resetting password:", error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

resetAdmin();
