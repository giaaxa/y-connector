import { Megaphone, MapPinned, PartyPopper, HandHeart } from "lucide-react";
import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, ChipCheckbox, Field, Input, Textarea } from "@/components/ui/form";
import { Container } from "@/components/ui/primitives";
import { applyAmbassador } from "@/lib/actions/member";

export const metadata: Metadata = { title: "Community Ambassadors", description: "Help organise events, welcome members and build local Y Connector chapters." };

export default function AmbassadorsPage() {
  const roles = [
    { icon: PartyPopper, t: "Organise events", b: "Help plan and run meetups, workshops and labs." },
    { icon: HandHeart, t: "Welcome members", b: "Be the friendly first face for new joiners." },
    { icon: MapPinned, t: "Build a local chapter", b: "Start Y Connector in your city or campus." },
    { icon: Megaphone, t: "Spread the word", b: "Share what we're building with people who'd love it." },
  ];
  return (
    <>
      <PageHero
        eyebrow="Community ambassadors"
        title={<>Grow it with us. <span className="mark">Grassroots</span> means you.</>}
        intro="Y Connector grows through the people in it. Ambassadors help organise events, welcome new members and build local chapters. It's a volunteer role with real responsibility and plenty of credit."
      />
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {roles.map((r) => (
            <div key={r.t} className="flex gap-4 rounded-2xl border border-line p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sun"><r.icon className="h-5 w-5" /></span>
              <div><p className="font-semibold">{r.t}</p><p className="text-sm text-muted">{r.b}</p></div>
            </div>
          ))}
          <p className="text-xs text-muted">Ambassador roles are voluntary. There are no financial referral rewards.</p>
        </div>
        <div className="rounded-3xl border border-line p-6 sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight">Apply to be an ambassador</h2>
          <ActionForm action={applyAmbassador} submitLabel="Send application" pendingLabel="Sending…" className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor="a-name" required><Input id="a-name" name="name" autoComplete="name" required /></Field>
              <Field label="Email" htmlFor="a-email" required><Input id="a-email" name="email" type="email" autoComplete="email" required /></Field>
            </div>
            <Field label="City / campus" htmlFor="a-loc"><Input id="a-loc" name="location" /></Field>
            <div>
              <p className="mb-3 text-sm font-medium">I&apos;d like to help with</p>
              <div className="flex flex-wrap gap-2">
                {["Organising events", "Welcoming members", "Starting a local chapter", "Social media", "Partnerships"].map((f) => (
                  <ChipCheckbox key={f} name="focus" value={f} />
                ))}
              </div>
            </div>
            <Field label="Why you?" htmlFor="a-msg"><Textarea id="a-msg" name="message" rows={5} /></Field>
            <Checkbox name="consent" required label="I agree to Y Connector using my details to process this application." />
          </ActionForm>
        </div>
      </Container>
    </>
  );
}
