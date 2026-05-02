import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { UserService } from "./UserService.js";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { UserRole } from "../types/userTypes.js";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";
import { User } from "../models/User.js";
import configs from "../config/configs.js";
import { redisConnection } from "../config/redis.js";

interface GoogleTokenPayload {
  email: string;
  name?: string;
  sub: string;
}

const client = new OAuth2Client(configs.GOOGLE_CLIENT_ID);

export class AuthService {
  static async register(userData: any) {
    const { name, email, password, role } = userData;
    const existingUser = await UserRepository.findByEmail(email);
    
    if (existingUser) {
      if (existingUser.isVerified) {
        throw new Error("User already exists");
      }
      // If not verified, allow "re-registration" (update info and send new OTP)
      const hashedPassword = await bcrypt.hash(password, 10);
      await UserRepository.update(existingUser.id, {
        name,
        password: hashedPassword,
        role: role || UserRole.STUDENT
      });
      await this.sendRegistrationOTP({ email });
      return { message: "Account exists but is not activated. A new activation code has been sent to your email." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserService.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.STUDENT,
      isVerified: false // Explicitly set to false
    });

    // Send OTP immediately after registration
    await this.sendRegistrationOTP({ email });

    return { message: "User registered. Please activate your account with the code sent to your email." };
  }

  static async sendRegistrationOTP(userData: any) {
    const { email } = userData;
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User account is already activated");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Store otp in database linked to user
    await UserRepository.update(user.id, {
      verificationCode: otp,
      verificationCodeExpires: expiry
    });

    await sendEmail({
      to: email,
      subject: "Account Activation Code",
      text: `Your activation code is: ${otp}. It will expire in 15 minutes.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; color: #111827; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); }
                .header { background: linear-gradient(135deg, #059669 0%, #065f46 100%); padding: 40px 20px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px; font-weight: 800; }
                .content { padding: 40px; text-align: center; }
                .content h2 { color: #111827; font-size: 24px; margin-top: 0; }
                .content p { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
                .otp-container { background-color: #f0fdf4; border-radius: 16px; padding: 32px; margin: 30px 0; border: 2px dashed #059669; }
                .otp-code { font-size: 48px; font-weight: 800; color: #059669; letter-spacing: 8px; margin: 0; font-family: monospace; }
                .footer { padding: 25px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #e5e7eb; }
                .support-text { font-size: 14px; color: #6b7280; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Pathway Scholar</h1>
                </div>
                <div class="content">
                    <h2>Verify Your Email</h2>
                    <p>Hello,</p>
                    <p>Thank you for joining <strong>Pathway Scholar</strong>! To complete your registration and secure your account, please use the activation code below:</p>
                    <div class="otp-container">
                        <div class="otp-code">${otp}</div>
                    </div>
                    <p>This code will expire in <strong>15 minutes</strong>.</p>
                    <p class="support-text">If you did not request this code, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Pathway Scholar. All rights reserved.<br>
                    Empowering your educational journey.
                </div>
            </div>
        </body>
        </html>
      `
    });
  }

  static async verifyRegistrationOTP(verifyData: any) {
    const { email, otp } = verifyData;
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      throw new Error("Activation code not found. Please request a new one.");
    }

    if (new Date() > user.verificationCodeExpires) {
      throw new Error("Activation code expired. Please request a new one.");
    }

    if (user.verificationCode !== otp) {
      throw new Error("Invalid activation code");
    }

    // Mark as verified and active, and clear OTP
    await UserRepository.update(user.id, { 
      isVerified: true, 
      isActive: true,
      verificationCode: null as any, // Clear it
      verificationCodeExpires: null as any
    });

    // Generate auth response now that user is verified
    const updatedUser = await UserRepository.findById(user.id);
    return this.generateAuthResponse(updatedUser!);
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

    if (!user.isVerified) {
      throw new Error("Please activate your account before logging in. An activation code has been sent to your email.");
    }

    return this.generateAuthResponse(user);
  }

  static async googleLogin(idToken: string, role?: string) {
    if (!idToken) {
      throw new Error("Google ID Token is required");
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: configs.GOOGLE_AUTH_AUDIENCES,
    });

    const payload = ticket.getPayload() as GoogleTokenPayload | undefined;
    if (!payload || !payload.email) throw new Error("Invalid Google Token");

    const { email, name, sub: googleId } = payload;
    let user = await UserRepository.findByEmail(email);

    // Determine the role: if a valid role is provided, use it; otherwise default to STUDENT
    const validRoles = [UserRole.STUDENT, UserRole.COUNSELOR];
    const assignedRole = role && validRoles.includes(role as UserRole) ? (role as UserRole) : UserRole.STUDENT;

    if (!user) {
      user = await UserService.createUser({
        name: name || "Google User",
        email,
        googleId,
        role: assignedRole,
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

    const payload = jwt.verify(token, configs.REFRESH_TOKEN_SECRET!) as any;
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

    // Invalidate any existing unused reset tokens for this user
    await AuthRepository.invalidateOldPasswordResetTokens(user.id);

    await AuthRepository.createPasswordResetToken(user.id, token, expiresAt);

    // In a real app, this would be an email template
    const resetUrl = `${configs.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `Click here to reset your password: ${resetUrl}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; color: #111827; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); }
                .header { background: linear-gradient(135deg, #059669 0%, #065f46 100%); padding: 40px 20px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px; font-weight: 800; }
                .content { padding: 40px; text-align: center; }
                .content h2 { color: #111827; font-size: 24px; margin-top: 0; }
                .content p { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
                .btn-container { margin: 35px 0; }
                .btn { display: inline-block; padding: 16px 36px; background-color: #059669; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }
                .footer { padding: 25px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #e5e7eb; }
                .link-fallback { font-size: 12px; color: #9ca3af; word-break: break-all; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Pathway Scholar</h1>
                </div>
                <div class="content">
                    <h2>Reset Your Password</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset the password for your <strong>Pathway Scholar</strong> account. Click the button below to set a new password:</p>
                    <div class="btn-container">
                        <a href="${resetUrl}" class="btn">Reset My Password</a>
                    </div>
                    <p>This link will expire in <strong>1 hour</strong>.</p>
                    <div class="link-fallback">
                        If the button doesn't work, copy and paste this URL into your browser:<br>
                        ${resetUrl}
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Pathway Scholar. All rights reserved.<br>
                    Empowering your educational journey.
                </div>
            </div>
        </body>
        </html>
      `
    });
  }

  static async resetPassword(token: string, newPassword: string) {
    const resetToken = await AuthRepository.findPasswordResetToken(token);

    if (!resetToken) {
      throw new Error("Invalid reset token");
    }

    const now = new Date();

    console.log("Password Reset Debug Log:", {
      token: token.substring(0, 8) + "...",
      userId: resetToken.userId,
      used: resetToken.used,
      currentTime: now.toISOString(),
      tokenExpiresAt: resetToken.expiresAt instanceof Date ? resetToken.expiresAt.toISOString() : resetToken.expiresAt,
      isExpired: now > resetToken.expiresAt,
      timeDifferenceMinutes: (resetToken.expiresAt.getTime() - now.getTime()) / (1000 * 60)
    });

    if (resetToken.used) {
      throw new Error("This reset token has already been used");
    }

    if (now > resetToken.expiresAt) {
      throw new Error("This reset token has expired");
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
    return this.getUserWithProfile(user);
  }

  static async getUserWithProfile(user: User) {
    let profileData: any = {};
    if (user.role === UserRole.STUDENT) {
      const student = await StudentRepository.findByUserId(user.id);
      if (student) profileData = student.toJSON();
    } else if (user.role === UserRole.COUNSELOR) {
      const counselor = await CounselorRepository.findByUserId(user.id);
      if (counselor) profileData = counselor.toJSON();
    }
    
    const { id, password, ...restProfile } = profileData; // prevent overwriting user id and avoid returning password
    return { ...user.toJSON(), ...restProfile, id: user.id, email: user.email, name: user.name, role: user.role };
  }

  private static async generateAuthResponse(user: User) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      configs.JWT_SECRET!,
      { expiresIn: (configs.JWT_ACCESS_EXPIRATION as any) || "2d" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      configs.REFRESH_TOKEN_SECRET!,
      { expiresIn: (configs.JWT_REFRESH_EXPIRATION as any) || "7d" }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await AuthRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    const userWithProfile = await this.getUserWithProfile(user);
    return { user: userWithProfile, accessToken, refreshToken };
  }
}
