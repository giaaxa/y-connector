import { AccountTabs } from "@/components/platform/account-tabs";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-muted">Account</p>
      <h1 className="mt-2 mb-6 text-3xl font-extrabold tracking-[-0.03em]">Settings</h1>
      <AccountTabs />
      <div className="mt-8">{children}</div>
    </div>
  );
}
