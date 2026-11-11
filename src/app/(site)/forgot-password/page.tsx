import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/login-forms";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password." intro="Enter your email and we'll send you a secure reset link." side={<p className="text-3xl font-bold tracking-tight">It happens to the best builders.</p>}>
      <ForgotForm />
    </AuthShell>
  );
}
