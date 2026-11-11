import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/login-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password." side={<p className="text-3xl font-bold tracking-tight">Back to building.</p>}>
      <ResetForm />
    </AuthShell>
  );
}
