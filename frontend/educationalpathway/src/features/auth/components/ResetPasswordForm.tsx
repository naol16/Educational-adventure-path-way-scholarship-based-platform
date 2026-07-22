"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/providers/auth-context";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const validatePassword = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!token) {
      setError(
        "Invalid or missing reset token. Please request a new password reset link.",
      );
      return;
    }

    const validationError = validatePassword();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        token,
        newPassword: password,
        confirmPassword,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to reset password. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

        <div className="absolute -bottom-24 -right-24 w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="w-full max-w-md"
      >
        <Card className="border border-border rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-10 pb-4">
            <h1 className="text-3xl font-semibold">
              {isSuccess ? "Password Updated" : "Reset Password"}
            </h1>

            <p className="text-sm text-muted-foreground mt-2">
              {isSuccess
                ? "Your password has been changed successfully."
                : "Create a new secure password."}
            </p>
          </CardHeader>

          <CardBody className="px-8 pb-10">
            {isSuccess ? (
              <div className="space-y-5">
                <div
                  className="
                  p-4 
                  rounded-lg
                  bg-success/10
                  border
                  border-success/20
                  text-success
                  text-sm
                  text-center
                "
                >
                  You can now login using your new password.
                </div>

                <Link href="/login">
                  <Button className="w-full h-12" variant="scholarship">
                    Go To Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password */}

                <div className="space-y-2">
                  <Label>New Password</Label>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-12"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                      "
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}

                <div className="space-y-2">
                  <Label>Confirm Password</Label>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pr-12"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                      "
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Rules */}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Minimum 8 characters</p>
                  <p>• At least one uppercase letter</p>
                  <p>• At least one number</p>
                </div>

                {error && (
                  <div
                    className="
                    p-3
                    text-sm
                    bg-destructive/10
                    text-destructive
                    rounded-lg
                    border
                    border-destructive/20
                  "
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="scholarship"
                  className="w-full h-12"
                  isLoading={isLoading}
                  disabled={!token}
                >
                  Update Password
                </Button>
              </form>
            )}

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="
                  text-sm
                  text-primary
                  hover:underline
                "
              >
                Back to Login
              </Link>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
