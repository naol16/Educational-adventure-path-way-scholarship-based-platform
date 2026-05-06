'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/auth-context";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

export function SignupForm({
  initialRole,
}: {
  initialRole?: "student" | "counselor";
}) {

  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role") as "student" | "counselor" | null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole || queryRole || "student",
  });

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resendTimer, setResendTimer] = useState(0);
  const { googleLogin, register, verifyRegistrationOTP, sendRegistrationOTP } = useAuth();

  useEffect(() => {
    if (queryRole && (queryRole === "student" || queryRole === "counselor")) {
      setFormData((prev) => ({ ...prev, role: queryRole }));
    }
  }, [queryRole]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await register(formData);
      setStep('otp');
      setResendTimer(60); // Start 60s cooldown
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to register. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await verifyRegistrationOTP({ email: formData.email, otp });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid OTP or registration failed."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await sendRegistrationOTP(formData);
      setResendTimer(60);
      setOtp(''); // Clear current OTP input
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to resend OTP."));
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">

      {/* Background decoration */}

      <div className="absolute inset-0 -z-10">

        <div className="absolute -top-10 -left-10 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

        <div className="absolute -bottom-10 -right-10 w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />

      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >

        <Card className="bg-card border border-border rounded-lg">

          <CardHeader className="text-center pt-10 pb-4">
            <h1 className="text-3xl font-semibold text-foreground">
              {step === 'details' ? 'Create Account' : 'Activate Account'}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {step === 'details' ? 'Sign up to get started' : `We've sent an activation code to ${formData.email}`}
            </p>
          </CardHeader>

          <CardBody className="px-8 pb-8 space-y-6">
            {step === 'details' ? (
              <form onSubmit={handleSubmitDetails} className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-label">Full Name</Label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 bg-muted border-border"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-label">Email</Label>
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 bg-muted border-border"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label className="text-label">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-12 bg-muted border-border pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full h-12" isLoading={isLoading}>
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-label">Activation Code</Label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="h-12 bg-muted border-border text-center text-2xl tracking-[0.5em]"
                  />
                </div>

                {error && (
                  <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full h-12" isLoading={isLoading}>
                  Activate Account
                </Button>

                <div className="flex flex-col space-y-3">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || isLoading}
                    className="text-sm font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't get the code? Resend"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Change Email or Details
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}

            <div className="relative flex items-center">

              <div className="grow border-t border-border"></div>

              <span className="mx-3 text-xs text-muted-foreground">
                OR
              </span>

              <div className="grow border-t border-border"></div>

            </div>

            {/* Google Signup */}

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (

              <div className="w-full flex justify-center [&>div]:w-full">

                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      googleLogin(credentialResponse.credential, formData.role);
                    }
                  }}
                  onError={() => setError("Google Signup Failed")}
                  use_fedcm_for_prompt={false}
                  theme="outline"
                  shape="pill"
                  width="100%"
                  text="signup_with"
                />

              </div>

            ) : (

              <p className="text-xs text-center text-muted-foreground">
                Google signup unavailable
              </p>

            )}

            {/* Login link */}

            <div className="text-center pt-4">

              <p className="text-sm text-muted-foreground">

                Already have an account?{" "}

                <Link
                  href="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </Link>

              </p>

            </div>

          </CardBody>

        </Card>

      </motion.div>

    </div>

  );
}
