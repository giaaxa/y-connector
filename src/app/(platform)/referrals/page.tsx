import type { Metadata } from "next";
import { CopyButton, ShareButton } from "@/components/platform/copy-button";
import { Avatar, Card, Notice } from "@/components/ui/primitives";
import { requireActiveMember } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { repo } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Invite friends" };

export default async function ReferralsPage() {
  const v = await requireActiveMember("/referrals");
  const referred = await repo().listReferrals(v.id);
  const link = `${siteConfig.url}/join?ref=${v.profile.referralCode}`;
  const invite = `I'm part of Y Connector, a community for young founders and builders learning AI, FinTech and startup skills. Join me: ${link}`;
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-muted">Grow the community</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">Bring your people.</h1>
      <p className="mt-2 text-muted">Y Connector grows through members inviting ambitious friends, classmates and collaborators.</p>
      <Card className="mt-8 overflow-hidden">
        <div className="bg-sun p-6 sm:p-8">
          <p className="text-sm font-semibold">Your invitation link</p>
          <p className="mt-2 rounded-xl bg-white/70 px-4 py-3 font-mono text-sm break-all">{link}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton text={link} />
            <ShareButton text={invite} url={link} />
          </div>
        </div>
        <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="p-6">
            <p className="text-5xl font-bold tracking-tight">{referred.length}</p>
            <p className="text-sm text-muted">people joined with your link</p>
          </div>
          <div className="p-6">
            <p className="text-sm font-semibold">Shareable message</p>
            <p className="mt-2 text-sm text-ink-soft">{invite}</p>
          </div>
        </div>
      </Card>
      {referred.length > 0 && (
        <Card className="mt-6 p-6">
          <p className="font-semibold">Joined via your invite</p>
          <ul className="mt-4 space-y-3">
            {referred.map((p) => (
              <li key={p.id} className="flex items-center gap-3 text-sm">
                <Avatar name={p.fullName} size={30} />
                <span className="flex-1 font-medium">{p.fullName.split(" ")[0]}</span>
                <span className="text-muted">{formatDate(p.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Notice tone="neutral" className="mt-6">Referrals are about growing the community. There are no financial rewards for referrals.</Notice>
    </div>
  );
}
