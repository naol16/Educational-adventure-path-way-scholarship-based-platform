// import { User } from "../models/User.js";
// import { UserRole } from "../types/userTypes.js";
// import { sequelize } from "../config/sequelize.js";
// import bcrypt from "bcrypt";

// async function fixAdmins() {
//   try {
//     await sequelize.authenticate();
//     const hashedPassword = await bcrypt.hash("admin123", 10);
    
//     const adminEmails = [
//       "lemesanaol16@gmail.com",
//       "admin@educationalpathway.com",
//       "josefdagne5@gmail.com",
//       "admin123@educationalpathway.com"
//     ];

//     for (const email of adminEmails) {
//       const [user, created] = await User.findOrCreate({
//         where: { email },
//         defaults: {
//           name: email.split('@')[0],
//           password: hashedPassword,
//           role: UserRole.ADMIN,
//           isVerified: true,
//           isActive: true
//         }
//       });

//       if (!created) {
//         await user.update({
//           role: UserRole.ADMIN,
//           password: hashedPassword,
//           isVerified: true,
//           isActive: true
//         });
//       }
//       console.log(`✅ Admin updated/created: ${email}`);
//     }
    
//     process.exit(0);
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// }
// fixAdmins();
