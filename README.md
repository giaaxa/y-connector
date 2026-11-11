# Y CONNECTOR

**Connecting the next generation of builders.**

The website and members' platform for Y Connector, a UK grassroots youth entrepreneurship community. It includes:

- A public marketing site.
- A membership application and verification flow, with annual Stripe billing.
- A members-only forum, talent directory, events, learning hub and startup showcase.
- A role-based admin area.

Built with **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase · Stripe**. It can be deployed on Vercel.

---

## Quick start (preview mode, no credentials needed)

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Supabase credentials the app runs in **preview mode**:

- Data comes from an in-memory sample store (`src/lib/seed.ts`). It resets when the server restarts and is shared by everyone using that server.
- `/login` offers four demo personas:

  | Persona | What you'll see |
  |---|---|
  | Active member | Full community access |
  | Super admin | Every admin tool |
  | Verified, unpaid | The "activate membership" step |
  | Pending applicant | The verification status journey |

- A banner on every page says it's preview mode.
- **No payment or verification is faked.** With Stripe unconfigured, the payment button is disabled and explains why.
- Emails are written to the server console.

## Production setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com). Choose a UK or EU region for GDPR.
2. Run `supabase/migrations/0001_schema.sql` in the SQL editor, or use `supabase db push`. This creates:
   - all tables and helper functions;
   - triggers;
   - **Row Level Security** policies;
   - the private `verification` storage bucket.
3. Run `supabase/seed.sql`. The forum categories are required; sample events, courses and startups are optional.
4. Under **Auth → URL configuration**:
   - set the Site URL;
   - add `https://YOUR_DOMAIN/auth/callback` as a redirect URL.
5. Under **Auth → Providers → Email**, keep "Confirm email" switched on.
6. Sign up through `/join`, then make yourself super admin:
   ```sql
   insert into user_roles (user_id, role)
   select id, 'super_admin' from auth.users where email = 'you@example.com';
   ```

### 2. Stripe

1. Create a product, "Y Connector Membership", with two **recurring, yearly** prices: £30 (Essex Alumni) and £50 (Eligible Member).
2. Put the two price IDs in `STRIPE_PRICE_ESSEX_ALUMNI` and `STRIPE_PRICE_STANDARD`.
3. Add a webhook endpoint at `https://YOUR_DOMAIN/api/stripe/webhook` that sends these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Enable the **Customer Portal** with cancellation set to "at end of billing period".
6. To test locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### 3. Environment and deployment

Copy `.env.example` to `.env.local` and fill in the values. On Vercel, add the same variables, including `APP_SIGNING_SECRET` and `CRON_SECRET`. `vercel.json` schedules the daily data-retention job.

---

## How the important rules are enforced

| Rule | Where |
|---|---|
| Membership is active only when the applicant is **verified AND** a Stripe-confirmed, unexpired subscription exists | `isMembershipActive()` in `src/lib/policy.ts`, mirrored by `is_active_member()` in SQL |
| The price is set server-side from the admin-confirmed tier | `startCheckout()` in `src/lib/actions/billing.ts` (no amount comes from the browser) |
| The checkout success page never activates access | Only the signed webhook in `src/app/api/stripe/webhook/route.ts` writes the `memberships` table; it is idempotent via `stripe_events` |
| Applicants can't verify themselves, and members can't pin or remove posts | Postgres `protect_*` triggers plus RLS |
| Under-38 limit and recent-alumni window | `checkEligibility()`. Both values are editable in **Admin → Settings**. The "recent alumni" default of 5 years is **provisional** |
| Event capacity and members-only events | `rsvp_to_event()` SQL function (row-locked) and the server action; overflow goes to a waitlist |
| Forum is private | RLS on `posts` and `replies`. Only threads an admin publishes as a "public preview" appear publicly |
| DOB and documents are private | `applications` table and `verification` bucket are owner- and admin-only. Documents use 60-second signed URLs and are deleted automatically N days after a decision |
| Secrets never reach the browser | `server-only` imports. Only `NEXT_PUBLIC_*` values are exposed |

Roles are Super Admin, Admin / Operations, Event Manager, Community Moderator, Mentor / Advisor and Member. The permission matrix is in `src/lib/policy.ts`.

## Project structure

```
src/
  app/
    (site)/         public pages: home, about, events, membership, join, login…
    (platform)/     signed-in area: dashboard, forum, directory, account, admin
    api/            stripe webhook, admin export/proof, retention cron
  components/       brand, ui primitives, feature components
  lib/
    data/           Repo interface + demo + Supabase implementations, service-role ops
    actions/        server actions (auth, member, admin, billing)
    auth.ts         viewer resolution and permission guards
    policy.ts       eligibility, pricing tiers, membership state, permissions
    email.ts        notification templates and delivery
supabase/           schema, RLS and seed SQL
```

## Before launch: replace the placeholders

- **Logo.** `src/components/brand/logo.tsx` is an SVG recreation. Add the official file to `public/brand/` and set `NEXT_PUBLIC_LOGO_SRC`.
- **Contact and social links** in `src/lib/config.ts`.
- **Sample content.** Everything flagged `is_sample` / "Example" (events, discussions, courses, startup concepts) is illustrative. Speakers are deliberately "to be announced".
- **Team and governance** profile slots on `/about`.
- **Legal pages** (`/legal/*`) are drafts. Get UK legal review, including the entity name, ICO registration and refund terms.
- **Eligibility.** Confirm the recent-alumni definition in Admin → Settings.
- **University wording.** Y Connector makes **no claim of affiliation** with the University of Essex, FinteX or AI-FincubeX. Keep it that way unless a partnership is formally agreed.

## Scope notes

- The FinTech and investment area is **educational only**. There is no functionality for investment solicitation, pooled capital, lending or returns.
- There are **no financial referral rewards**.
- Account deletion requests are logged for an admin to process within 30 days: cancel the Stripe subscription, then delete the auth user (this cascades to their data).
