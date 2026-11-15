-- ════════════════════════════════════════════════════════════════════
--  0003 — New pricing model
--   • Tiers: essex_student (£30/yr), essex_alumni (£40/yr), standard (£50/yr)
--   • Lifetime membership: one-off £350, never expires
--   • Eligibility: under 38; graduation-year limit off by default (0)
-- ════════════════════════════════════════════════════════════════════

alter type membership_tier add value if not exists 'essex_student';

alter table memberships add column if not exists plan text not null default 'annual'
  check (plan in ('annual', 'lifetime'));

-- Active = verified AND (paid lifetime OR unexpired paid annual), or staff.
create or replace function is_active_member(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from applications a join memberships m on m.user_id = a.user_id
    where a.user_id = uid and a.status = 'verified'
      and (
        (m.plan = 'lifetime' and m.status = 'active')
        or (m.plan = 'annual' and m.status in ('active','past_due') and m.current_period_end > now())
      )
  ) or is_staff(uid);
$$;

-- Display prices and eligibility defaults (Stripe Price IDs remain the source of truth for charging).
update settings
set data = (data - 'priceEssexPence') || jsonb_build_object(
  'priceEssexStudentPence', 3000,
  'priceEssexAlumniPence', 4000,
  'priceStandardPence', 5000,
  'priceLifetimePence', 35000,
  'recentAlumniYears', 0,
  'maxAgeExclusive', 38
),
updated_at = now()
where id = 1;
