import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Container } from "@/components/ui/primitives";
import { sendContact } from "@/lib/actions/member";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with the Y Connector team." };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk." intro="Speaking, mentoring, partnering, press, or just a question. We read everything." />
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8">
          {[
            ["General", siteConfig.contactEmail],
            ["Speak at an event", "Tell us your topic using the form."],
            ["Mentor members", "Experienced founder or specialist? We'd love your help."],
            ["Partnerships", "We only announce partners once formally agreed."],
          ].map(([t, b]) => (
            <div key={t} className="border-t border-line pt-5">
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-muted">{b}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-line p-6 sm:p-10">
          <ActionForm action={sendContact} submitLabel="Send message" pendingLabel="Sending…">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor="c-name" required><Input id="c-name" name="name" autoComplete="name" required /></Field>
              <Field label="Email" htmlFor="c-email" required><Input id="c-email" name="email" type="email" autoComplete="email" required /></Field>
            </div>
            <Field label="Topic" htmlFor="c-topic">
              <Select id="c-topic" name="topic">
                <option>General question</option>
                <option>Speaking</option>
                <option>Mentoring</option>
                <option>Partnership</option>
                <option>Press</option>
                <option>Privacy / data request</option>
              </Select>
            </Field>
            <Field label="Message" htmlFor="c-msg" required><Textarea id="c-msg" name="message" required minLength={10} rows={6} /></Field>
            <Checkbox name="consent" required label="I agree to Y Connector using my details to respond to this message." />
          </ActionForm>
        </div>
      </Container>
    </>
  );
}
