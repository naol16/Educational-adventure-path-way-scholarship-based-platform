import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService.js";
import configs from "../config/configs.js";
import { ResponseHelper } from "../utils/responseHelper.js";
import { AppError } from "../errors/AppError.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return ResponseHelper.success(res, result, "Registration successful. Please verify OTP.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async sendRegistrationOTP(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.sendRegistrationOTP(req.body);
      return ResponseHelper.success(res, null, "OTP sent successfully");
    } catch (error) {
      next(error);
    }
  }

  static async verifyRegistrationOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.verifyRegistrationOTP(req.body);
      res.cookie("refreshToken", result.refreshToken, AuthController.getCookieOptions());
      return ResponseHelper.success(res, {
        user: result.user,
        accessToken: result.accessToken
      }, "Registration verified and successful", 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.cookie("refreshToken", result.refreshToken, AuthController.getCookieOptions());
      return ResponseHelper.success(res, {
        user: result.user,
        accessToken: result.accessToken
      }, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential, idToken, id_token, role } = req.body;
      const token = credential || idToken || id_token;

      if (!token) {
        return next(new AppError("A valid Google ID token is required to continue.", 400));
      }

      console.log(`[AuthController] Attempting Google Login for role: ${role || 'default'}`);
      const result = await AuthService.googleLogin(token, role);
      
      res.cookie("refreshToken", result.refreshToken, AuthController.getCookieOptions());
      return ResponseHelper.success(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, "Google login successful");
    } catch (error: any) {
      console.error("[AuthController] Google Login Error:", {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return next(new AppError("Your session has expired. Please log in again.", 401));
      }

      const result = await AuthService.refreshToken(refreshToken);
      res.cookie("refreshToken", result.refreshToken, AuthController.getCookieOptions());
      res.json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie("refreshToken");
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError("We couldn't verify your account. Please log in again.", 401));
      }
      await AuthService.logoutAll(req.user.id);
      res.clearCookie("refreshToken");
      res.json({ message: "Logged out from all devices" });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.json({ message: "Password reset email sent" });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError("We couldn't verify your account. Please log in again.", 401));
      }

      const { currentPassword, oldPassword, newPassword, confirmPassword } = req.body;

      // Use currentPassword if provided, otherwise fallback to oldPassword
      const passwordToCompare = currentPassword || oldPassword;

      if (!passwordToCompare || !newPassword) {
        return next(new AppError("Both current password and new password are required.", 400));
      }

      if (newPassword !== confirmPassword) {
        return next(new AppError("The new password and confirmation do not match.", 400));
      }

      await AuthService.changePassword(req.user.id, passwordToCompare, newPassword);
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError("We couldn't verify your account. Please log in again.", 401));
      }
      const user = await AuthService.getMe(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  private static getCookieOptions() {
    return {
      httpOnly: true,
      secure: configs.NODE_ENV === "production",
      sameSite: (configs.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }
}
