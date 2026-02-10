import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { UserService } from "./UserService.js";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserRole } from "../types/userTypes.js";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";
import { User } from "../models/User.js";
import { authConfig } from "../config/configs.js";

interface GoogleTokenPayload {
  email: string;
  name?: string;
  sub: string;
}

const client = new OAuth2Client(authConfig.googleClientId);

export class AuthService {
  static async register(userData: any) {
    const { name, email, password, role } = userData;
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserService.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.STUDENT,
    });

    return this.generateAuthResponse(newUser);
  }

  static async login(loginData: any) {
    const { email, password } = loginData;
    const user = await UserRepository.findByEmail(email);

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    return this.generateAuthResponse(user);
  }

  static async googleLogin(idToken: string) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: authConfig.googleClientId || "",
    });

    const payload = ticket.getPayload() as GoogleTokenPayload | undefined;
    if (!payload || !payload.email) throw new Error("Invalid Google Token");

    const { email, name, sub: googleId } = payload;
    let user = await UserRepository.findByEmail(email);

    if (!user) {
      user = await UserService.createUser({
        name: name || "Google User",
        email,
        googleId,
        role: UserRole.STUDENT,
      });
    } else if (!user.googleId) {
      // Link Google ID to existing account
      await UserRepository.update(user.id, { googleId });
    }

    // Refresh user instance to ensure we have latest data
    const refreshedUser = await UserRepository.findById(user.id);
    if (!refreshedUser) throw new Error("User not found after creation/update");
    if (!refreshedUser.isActive) throw new Error("Account is deactivated");

    return this.generateAuthResponse(refreshedUser);
  }

  static async logout(refreshToken: string) {
    await AuthRepository.deleteRefreshToken(refreshToken);
  }

  static async logoutAll(userId: number) {
    await AuthRepository.deleteAllRefreshTokensForUser(userId);
  }

  static async refreshToken(token: string) {
    const storedToken = await AuthRepository.findRefreshToken(token);
    if (!storedToken) throw new Error("Invalid refresh token");

    if (new Date() > storedToken.expiresAt) {
      await AuthRepository.deleteRefreshToken(token);
      throw new Error("Refresh token expired");
    }

    const payload = jwt.verify(token, authConfig.refreshTokenSecret!) as any;
    const user = await UserRepository.findById(payload.id);
    if (!user) throw new Error("User not found");

    // Rotate tokens
    await AuthRepository.deleteRefreshToken(token);
    return this.generateAuthResponse(user);
  }

  static async forgotPassword(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await AuthRepository.createPasswordResetToken(user.id, token, expiresAt);

    // In a real app, this would be an email template
    // Note: Assuming FRONTEND_URL is part of environment or serverConfig, but leaving as is if not in configs yet.
    // Actually, serverConfig has frontendUrl. Let's use env for now if not explicitly in config export or update config.
    // serverConfig has frontendUrl.

    // Using process.env.FRONTEND_URL for now as it was in original code, or I should update to use serverConfig.frontendUrl?
    // Let's stick to authConfig mainly here, but for completeness:
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `Click here to reset your password: ${resetUrl}`,
    });
  }

  static async resetPassword(token: string, newPassword: string) {
    console.log(`DEBUG: Attempting to reset password with token: ${token}`);
    const resetToken = await AuthRepository.findPasswordResetToken(token);

    if (!resetToken) {
      console.log("DEBUG: Reset token not found in database");
      throw new Error("Invalid or expired reset token");
    }

    console.log(`DEBUG: Token found. used: ${resetToken.used}, expiresAt: ${resetToken.expiresAt}`);
    console.log(`DEBUG: Current Time: ${new Date()}`);

    if (resetToken.used || new Date() > resetToken.expiresAt) {
      console.log(`DEBUG: Token validation failed. used: ${resetToken.used}, expired: ${new Date() > resetToken.expiresAt}`);
      throw new Error("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(resetToken.userId, hashedPassword);
    await AuthRepository.markPasswordResetTokenAsUsed(token);
  }

  static async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await UserRepository.findById(userId);
    if (!user || !user.password) throw new Error("User not found");

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new Error("Invalid old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(userId, hashedPassword);
  }

  static async getMe(userId: number) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  private static async generateAuthResponse(user: User) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      authConfig.jwtSecret!,
      { expiresIn: authConfig.jwtExpiresIn as any }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      authConfig.refreshTokenSecret!,
      { expiresIn: authConfig.refreshTokenExpiresIn as any }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await AuthRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return { user, accessToken, refreshToken };
  }
}
