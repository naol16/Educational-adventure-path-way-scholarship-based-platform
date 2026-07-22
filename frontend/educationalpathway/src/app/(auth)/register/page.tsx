import { Suspense } from "react";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}

