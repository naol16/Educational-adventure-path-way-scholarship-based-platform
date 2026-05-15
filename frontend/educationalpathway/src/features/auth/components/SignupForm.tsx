'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/auth-context";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { signupSchema, otpSchema } from "@/lib/validations";
import { z } from "zod";

type SignupFormData = z.infer<typeof signupSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export function SignupForm({
  initialRole,
}: {
  initialRole?: "student" | "counselor";
}) {
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role") as "student" | "counselor" | null;

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const { googleLogin, register, verifyRegistrationOTP, sendRegistrationOTP } = useAuth();

  // Registration Form
  const {
    register: registerField,
    handleSubmit: handleSubmitDetails,
    watch,
    setValue,
    formState: { errors: detailsErrors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: initialRole || queryRole || "student",
    },
  });

  // OTP Form
  const {
    register: registerOtpField,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    reset: resetOtp,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const formData = watch();

  useEffect(() => {
    if (queryRole && (queryRole === "student" || queryRole === "counselor")) {
      setValue("role", queryRole);
    }
  }, [queryRole, setValue]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const onDetailsSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await register(data);
      setStep('otp');
      setResendTimer(180);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "We couldn't process your registration. Please check your information and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await verifyRegistrationOTP({ email: formData.email, otp: data.otp });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "The activation code is incorrect or has expired. Please request a new code."));
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
      setResendTimer(180);
      resetOtp();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to send a new code. Please wait a moment and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
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
        <Card className="bg-card border border-border shadow-sm rounded-2xl">
          <CardHeader className="text-center pt-10 pb-4">
            <h1 className="text-3xl font-semibold text-foreground">
              {step === 'details' ? 'Create Account' : 'Activate Account'}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {step === 'details' ? 'Sign up to get started' : `We've sent an activation code to ${formData.email}`}
            </p>
          </CardHeader>

          <CardBody className="px-8 pb-8 space-y-6">
            <AnimatePresence mode="wait">
              {step === 'details' ? (
                <motion.form
                  key="details-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSubmitDetails(onDetailsSubmit)}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label className="text-label">Full Name</Label>
                    <Input
                      {...registerField("name")}
                      placeholder="Enter your name"
                      className={`h-12 bg-muted border-border ${detailsErrors.name ? 'border-destructive' : ''}`}
                    />
                    {detailsErrors.name && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle size={10} /> {detailsErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-label">Email</Label>
                    <Input
                      {...registerField("email")}
                      type="email"
                      placeholder="Enter your email"
                      className={`h-12 bg-muted border-border ${detailsErrors.email ? 'border-destructive' : ''}`}
                    />
                    {detailsErrors.email && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle size={10} /> {detailsErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-label">Password</Label>
                    <div className="relative">
                      <Input
                        {...registerField("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className={`h-12 bg-muted border-border pr-12 ${detailsErrors.password ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {detailsErrors.password && (
                      <p className="text-[10px] text-destructive leading-tight flex items-start gap-1">
                        <AlertCircle size={10} className="mt-0.5 shrink-0" /> {detailsErrors.password.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full h-12" isLoading={isLoading}>
                    Continue
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSubmitOtp(onOtpSubmit)}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label className="text-label">Activation Code</Label>
                    <Input
                      {...registerOtpField("otp")}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className={`h-12 bg-muted border-border text-center text-2xl tracking-[0.5em] ${otpErrors.otp ? 'border-destructive' : ''}`}
                    />
                    {otpErrors.otp && (
                      <p className="text-[10px] text-destructive text-center flex items-center justify-center gap-1">
                        <AlertCircle size={10} /> {otpErrors.otp.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
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
                </motion.form>
              )}
            </AnimatePresence>

            <div className="relative flex items-center">
              <div className="grow border-t border-border"></div>
              <span className="mx-3 text-xs text-muted-foreground">OR</span>
              <div className="grow border-t border-border"></div>
            </div>

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
              <p className="text-xs text-center text-muted-foreground">Google signup unavailable</p>
            )}

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
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

