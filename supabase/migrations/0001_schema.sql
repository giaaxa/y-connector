-- ════════════════════════════════════════════════════════════════════
--  Y CONNECTOR — core schema, helper functions, triggers and RLS
--  Apply with:  supabase db push   (or paste into the SQL editor)
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Enums ──────────────────────────────────────────────────────────
create type app_role as enum ('super_admin','admin','event_manager','moderator','mentor','member');
create type application_status as enum ('pending','verified','rejected','more_info');
create type student_status as enum ('student','alumni');
create type membership_tier as enum ('essex_alumni','standard');
create type membership_status as enum ('none','incomplete','active','past_due','canceled','expired');

-- ─── Settings (single row) ──────────────────────────────────────────
create table settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
insert into settings (data) values ('{
  "recentAlumniYears": 5,
  "maxAgeExclusive": 38,
  "essexUniversityNames": ["University of Essex"],
  "essexEmailDomains": ["essex.ac.uk"],
  "requireProofOfStatus": true,
  "priceEssexPence": 3000,
  "priceStandardPence": 5000,
  "verificationRetentionDays": 90
}');

-- ─── Profiles & roles ───────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  headline text not null default '',
  university text not null default '',
  city text not null default '',
  bio text not null default '' check (char_length(bio) <= 1200),
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  current_projects text not null default '',
  startup_stage text,
  looking_for_collaborators boolean not null default false,
  available_for_mentoring boolean not null default false,
  website_url text not null default '',
  discoverable boolean not null default false,   -- opt-in
  allow_contact boolean not null default false,  -- opt-in
  referral_code text not null unique default upper(substr(encode(gen_random_bytes(6),'hex'),1,8)),
  referred_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null references profiles(id) on delete cascade,
  role app_role not null,
  primary key (user_id, role)
);

-- ─── Applications (PRIVATE: owner + admins only) ────────────────────
create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  date_of_birth date not null,
  university text not null,
  student_status student_status not null,
  graduation_year int,
  university_email text not null default '',
  university_email_verified boolean not null default false,
  proof_path text,
  location text not null default '',
  interests text[] not null default '{}',
  professional_interests text not null default '',
  status application_status not null default 'pending',
  tier membership_tier not null default 'standard',
  reviewer_note text not null default '',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

-- ─── Memberships (written ONLY by the Stripe webhook / service role) ─
create table memberships (
  user_id uuid primary key references profiles(id) on delete cascade,
  tier membership_tier not null,
  status membership_status not null default 'incomplete',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  amount_pence int not null default 0,
  updated_at timestamptz not null default now()
);

create table stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

-- ─── Helper functions ───────────────────────────────────────────────
create or replace function has_role(uid uuid, roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = uid and role = any(roles));
$$;

create or replace function is_staff(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select has_role(uid, array['super_admin','admin','event_manager','moderator']::app_role[]);
$$;

create or replace function is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select has_role(uid, array['super_admin','admin']::app_role[]);
$$;

-- Active = verified application AND webhook-confirmed, unexpired paid membership.
create or replace function is_active_member(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from applications a join memberships m on m.user_id = a.user_id
    where a.user_id = uid and a.status = 'verified'
      and m.status in ('active','past_due') and m.current_period_end > now()
  ) or is_staff(uid);
$$;

-- ─── New user bootstrap ─────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare ref uuid;
begin
  select id into ref from profiles
   where referral_code = upper(coalesce(new.raw_user_meta_data->>'referral_code',''));
  insert into profiles (id, full_name, referred_by)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), ref);
  insert into user_roles (user_id, role) values (new.id, 'member');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Protect referral fields from self-edits
create or replace function protect_profile_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is null then return new; end if; -- trusted server (service role)
  if not is_admin(auth.uid()) then
    new.referral_code := old.referral_code;
    new.referred_by := old.referred_by;
  end if;
  return new;
end $$;
create trigger profiles_protect before update on profiles
  for each row execute function protect_profile_fields();

-- Applicants cannot self-verify: non-admin writes reset review fields.
create or replace function protect_application_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is null then return new; end if; -- trusted server (service role)
  if not is_admin(auth.uid()) then
    if tg_op = 'UPDATE' and old.status not in ('pending','more_info') then
      raise exception 'Application can no longer be edited';
    end if;
    new.status := 'pending';
    new.reviewer_note := coalesce(case when tg_op = 'UPDATE' then old.reviewer_note end, '');
    new.reviewed_at := null;
    new.reviewed_by := null;
    new.university_email_verified := coalesce(case when tg_op = 'UPDATE' then old.university_email_verified end, false);
  else
    new.reviewed_by := auth.uid();
  end if;
  return new;
end $$;
create trigger applications_protect before insert or update on applications
  for each row execute function protect_application_fields();

-- ─── Events & RSVPs ─────────────────────────────────────────────────
create table events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  format text not null check (format in ('in_person','online','hybrid')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null default '',
  summary text not null default '',
  description text not null default '',
  speaker jsonb,
  capacity int check (capacity is null or capacity > 0),
  access text not null default 'members' check (access in ('public','members')),
  price_note text not null default '',
  status text not null default 'draft' check (status in ('draft','published','cancelled','archived')),
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  email text not null,
  status text not null default 'confirmed' check (status in ('confirmed','waitlist','cancelled')),
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

-- Capacity-safe RSVP. Enforces access rules server-side.
create or replace function rsvp_to_event(p_event uuid, p_name text, p_email text)
returns rsvps language plpgsql security definer set search_path = public as $$
declare e events; taken int; result rsvps; st text;
begin
  select * into e from events where id = p_event for update;
  if not found or e.status <> 'published' then raise exception 'Event not open for registration'; end if;
  if e.starts_at < now() then raise exception 'Event has already started'; end if;
  if e.access = 'members' and not is_active_member(auth.uid()) then
    raise exception 'Members-only event';
  end if;
  if coalesce(trim(p_name),'') = '' or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Name and a valid email are required';
  end if;
  select count(*) into taken from rsvps where event_id = p_event and status = 'confirmed';
  st := case when e.capacity is not null and taken >= e.capacity then 'waitlist' else 'confirmed' end;
  insert into rsvps (event_id, user_id, name, email, status)
  values (p_event, auth.uid(), trim(p_name), lower(trim(p_email)), st)
  on conflict (event_id, email) do update set status = excluded.status where rsvps.status = 'cancelled'
  returning * into result;
  if result is null then select * into result from rsvps where event_id = p_event and email = lower(trim(p_email)); end if;
  return result;
end $$;
grant execute on function rsvp_to_event to anon, authenticated;

create or replace function event_confirmed_count(p_event uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from rsvps where event_id = p_event and status = 'confirmed';
$$;
grant execute on function event_confirmed_count to anon, authenticated;

-- ─── Forum ──────────────────────────────────────────────────────────
create table forum_categories (
  slug text primary key,
  name text not null,
  description text not null default '',
  position int not null default 0
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null references forum_categories(slug),
  author_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 200),
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  score int not null default 0,
  reply_count int not null default 0,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  is_removed boolean not null default false,
  is_public_preview boolean not null default false,
  is_sample boolean not null default false,
  search tsvector generated always as (to_tsvector('english', title || ' ' || body)) stored
);
create index posts_search_idx on posts using gin (search);
create index posts_category_idx on posts (category_slug, last_activity_at desc);

create table replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  score int not null default 0,
  is_removed boolean not null default false
);

create table votes (
  user_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','reply')),
  target_id uuid not null,
  value smallint not null check (value in (-1, 1)),
  primary key (user_id, target_type, target_id)
);

create table bookmarks (
  user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post','reply')),
  target_id uuid not null,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now()
);

-- Score & reply-count maintenance
create or replace function apply_vote()
returns trigger language plpgsql security definer set search_path = public as $$
declare delta int; t_type text; t_id uuid;
begin
  delta := coalesce(case when tg_op <> 'DELETE' then new.value end, 0)
         - coalesce(case when tg_op <> 'INSERT' then old.value end, 0);
  t_type := coalesce(new.target_type, old.target_type);
  t_id := coalesce(new.target_id, old.target_id);
  if t_type = 'post' then update posts set score = score + delta where id = t_id;
  else update replies set score = score + delta where id = t_id; end if;
  return null;
end $$;
create trigger votes_apply after insert or update or delete on votes
  for each row execute function apply_vote();

create or replace function apply_reply()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update posts set reply_count = reply_count + 1, last_activity_at = new.created_at where id = new.post_id;
  elsif tg_op = 'UPDATE' and new.is_removed <> old.is_removed then
    update posts set reply_count = reply_count + case when new.is_removed then -1 else 1 end where id = new.post_id;
  end if;
  return null;
end $$;
create trigger replies_apply after insert or update on replies
  for each row execute function apply_reply();

-- Members may only edit content fields; moderation flags are staff-only.
create or replace function protect_post_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is null then return new; end if; -- trusted server (service role)
  if not has_role(auth.uid(), array['super_admin','admin','moderator']::app_role[]) then
    if tg_op = 'INSERT' then
      new.is_pinned := false; new.is_locked := false; new.is_removed := false;
      new.is_public_preview := false; new.is_sample := false; new.score := 0; new.reply_count := 0;
    else
      new.is_pinned := old.is_pinned; new.is_locked := old.is_locked; new.is_removed := old.is_removed;
      new.is_public_preview := old.is_public_preview; new.score := old.score; new.reply_count := old.reply_count;
    end if;
  end if;
  return new;
end $$;
create trigger posts_protect before insert or update on posts
  for each row execute function protect_post_fields();

-- Public preview: only explicitly-published threads, author first name only.
create or replace function public_preview_posts(p_limit int default 5)
returns table (id uuid, category_slug text, title text, body text, score int, reply_count int,
               created_at timestamptz, author_name text, is_sample boolean)
language sql stable security definer set search_path = public as $$
  select p.id, p.category_slug, p.title, left(p.body, 280), p.score, p.reply_count, p.created_at,
         split_part(pr.full_name, ' ', 1), p.is_sample
  from posts p join profiles pr on pr.id = p.author_id
  where p.is_public_preview and not p.is_removed
  order by p.is_pinned desc, p.score desc limit p_limit;
$$;
grant execute on function public_preview_posts to anon, authenticated;

-- ─── Learning ───────────────────────────────────────────────────────
create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  summary text not null default '',
  level text not null default 'Beginner',
  skills text[] not null default '{}',
  access text not null default 'included' check (access in ('included','premium')),
  related_event_slugs text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published')),
  is_sample boolean not null default false
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  position int not null default 0,
  title text not null,
  kind text not null check (kind in ('text','video','pdf','link')),
  body text not null default '',
  url text not null default '',
  minutes int not null default 10
);

-- Public outline (no lesson bodies/urls) for the course overview.
create view lesson_outline as
  select l.id, l.course_id, l.position, l.title, l.kind, l.minutes
  from lessons l join courses c on c.id = l.course_id where c.status = 'published';
grant select on lesson_outline to anon, authenticated;

create table lesson_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ─── Startups ───────────────────────────────────────────────────────
create table startups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  industry text not null default '',
  stage text not null check (stage in ('exploring','building','pilot','launched','growing')),
  website text not null default '',
  founders text[] not null default '{}',
  team_needs text[] not null default '{}',
  milestones text[] not null default '{}',
  community_connection text not null default '',
  themes text[] not null default '{}',
  approval text not null default 'pending' check (approval in ('pending','approved','rejected')),
  submitted_by uuid references profiles(id) on delete set null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function protect_startup_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is null then return new; end if; -- trusted server (service role)
  if not is_admin(auth.uid()) then
    new.approval := 'pending';
    new.is_sample := false;
    if tg_op = 'INSERT' then new.submitted_by := auth.uid(); else new.submitted_by := old.submitted_by; end if;
  end if;
  return new;
end $$;
create trigger startups_protect before insert or update on startups
  for each row execute function protect_startup_fields();

-- ─── Growth, contact, collaboration, privacy ────────────────────────
create table ambassador_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, location text not null default '',
  focus text not null default '', message text not null default '',
  status text not null default 'new' check (status in ('new','contacted','accepted','declined')),
  created_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, topic text not null default '', message text not null,
  created_at timestamptz not null default now()
);

create table collab_requests (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references profiles(id) on delete cascade,
  to_id uuid not null references profiles(id) on delete cascade,
  message text not null check (char_length(message) between 5 and 1000),
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  shared_contact text,
  created_at timestamptz not null default now(),
  check (from_id <> to_id)
);

create table deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  reason text not null default '',
  status text not null default 'open' check (status in ('open','completed')),
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════
alter table settings enable row level security;
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table applications enable row level security;
alter table memberships enable row level security;
alter table stripe_events enable row level security;
alter table events enable row level security;
alter table rsvps enable row level security;
alter table forum_categories enable row level security;
alter table posts enable row level security;
alter table replies enable row level security;
alter table votes enable row level security;
alter table bookmarks enable row level security;
alter table reports enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table startups enable row level security;
alter table ambassador_applications enable row level security;
alter table contact_messages enable row level security;
alter table collab_requests enable row level security;
alter table deletion_requests enable row level security;

-- settings: public policy values readable; super admin writes
create policy settings_read on settings for select using (true);
create policy settings_write on settings for update using (has_role(auth.uid(), array['super_admin']::app_role[]));

-- profiles
create policy profiles_self on profiles for select using (id = auth.uid());
create policy profiles_members on profiles for select using (is_active_member(auth.uid()));
create policy profiles_update_self on profiles for update using (id = auth.uid());
create policy profiles_admin on profiles for update using (is_admin(auth.uid()));

-- roles
create policy roles_read on user_roles for select using (user_id = auth.uid() or is_staff(auth.uid()));
create policy roles_manage on user_roles for all using (has_role(auth.uid(), array['super_admin']::app_role[]))
  with check (has_role(auth.uid(), array['super_admin']::app_role[]));

-- applications: PRIVATE
create policy app_read on applications for select using (user_id = auth.uid() or is_admin(auth.uid()));
create policy app_insert on applications for insert with check (user_id = auth.uid());
create policy app_update_self on applications for update using (user_id = auth.uid() and status in ('pending','more_info'));
create policy app_update_admin on applications for update using (is_admin(auth.uid()));

-- memberships: read own / admin. No client writes (service role bypasses RLS).
create policy mem_read on memberships for select using (user_id = auth.uid() or is_admin(auth.uid()));
-- stripe_events: no policies => service role only.

-- events
create policy events_read on events for select
  using (status in ('published','cancelled','archived') or is_staff(auth.uid()));
create policy events_write on events for all
  using (has_role(auth.uid(), array['super_admin','admin','event_manager']::app_role[]))
  with check (has_role(auth.uid(), array['super_admin','admin','event_manager']::app_role[]));

-- rsvps: inserts go through rsvp_to_event(); users manage their own
create policy rsvps_read on rsvps for select
  using (user_id = auth.uid() or has_role(auth.uid(), array['super_admin','admin','event_manager']::app_role[]));
create policy rsvps_update on rsvps for update
  using (user_id = auth.uid() or has_role(auth.uid(), array['super_admin','admin','event_manager']::app_role[]));

-- forum
create policy cats_read on forum_categories for select using (true);
create policy cats_write on forum_categories for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy posts_read on posts for select using (is_active_member(auth.uid()) and (not is_removed or is_staff(auth.uid())));
create policy posts_insert on posts for insert with check (author_id = auth.uid() and is_active_member(auth.uid()));
create policy posts_update on posts for update using (
  (author_id = auth.uid() and not is_locked) or has_role(auth.uid(), array['super_admin','admin','moderator']::app_role[]));

create policy replies_read on replies for select using (is_active_member(auth.uid()) and (not is_removed or is_staff(auth.uid())));
create policy replies_insert on replies for insert with check (
  author_id = auth.uid() and is_active_member(auth.uid())
  and exists (select 1 from posts p where p.id = post_id and not p.is_locked and not p.is_removed));
create policy replies_update on replies for update using (
  author_id = auth.uid() or has_role(auth.uid(), array['super_admin','admin','moderator']::app_role[]));

create policy votes_own on votes for all using (user_id = auth.uid())
  with check (user_id = auth.uid() and is_active_member(auth.uid()));
create policy bookmarks_own on bookmarks for all using (user_id = auth.uid())
  with check (user_id = auth.uid() and is_active_member(auth.uid()));

create policy reports_insert on reports for insert with check (reporter_id = auth.uid() and is_active_member(auth.uid()));
create policy reports_staff on reports for select using (has_role(auth.uid(), array['super_admin','admin','moderator']::app_role[]));
create policy reports_update on reports for update using (has_role(auth.uid(), array['super_admin','admin','moderator']::app_role[]));

-- learning
create policy courses_read on courses for select using (status = 'published' or is_admin(auth.uid()));
create policy courses_write on courses for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy lessons_read on lessons for select using (is_active_member(auth.uid()));
create policy lessons_write on lessons for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy progress_own on lesson_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- startups
create policy startups_read on startups for select
  using (approval = 'approved' or submitted_by = auth.uid() or is_admin(auth.uid()));
create policy startups_insert on startups for insert with check (is_active_member(auth.uid()));
create policy startups_update on startups for update using (submitted_by = auth.uid() or is_admin(auth.uid()));

-- growth & contact (inserts via server actions; reads admin-only)
create policy amb_insert on ambassador_applications for insert with check (true);
create policy amb_read on ambassador_applications for select using (is_admin(auth.uid()));
create policy contact_insert on contact_messages for insert with check (true);
create policy contact_read on contact_messages for select using (is_admin(auth.uid()));

create policy collab_read on collab_requests for select using (from_id = auth.uid() or to_id = auth.uid());
create policy collab_insert on collab_requests for insert with check (
  from_id = auth.uid() and is_active_member(auth.uid())
  and exists (select 1 from profiles p where p.id = to_id and p.allow_contact));
create policy collab_respond on collab_requests for update using (to_id = auth.uid());

create policy del_own on deletion_requests for insert with check (user_id = auth.uid());
create policy del_read on deletion_requests for select using (user_id = auth.uid() or is_admin(auth.uid()));
create policy del_admin on deletion_requests for update using (is_admin(auth.uid()));

-- ─── Storage: private verification documents ────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verification', 'verification', false, 5242880, array['application/pdf','image/png','image/jpeg'])
on conflict (id) do nothing;

create policy "verification upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "verification read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'verification' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin(auth.uid())));
create policy "verification delete admin" on storage.objects for delete to authenticated
  using (bucket_id = 'verification' and is_admin(auth.uid()));

-- ─── Retention: purge verification documents after decision ─────────
-- Called by /api/cron/retention (service role), which then deletes the
-- returned object paths from the 'verification' bucket via the Storage API.
create or replace function purge_verification_documents()
returns text[] language plpgsql security definer set search_path = public as $$
declare days int; paths text[];
begin
  select (data->>'verificationRetentionDays')::int into days from settings where id = 1;
  select coalesce(array_agg(proof_path), '{}') into paths from applications
   where proof_path is not null and status in ('verified','rejected')
     and reviewed_at < now() - make_interval(days => days);
  update applications set proof_path = null where proof_path = any(paths);
  return paths;
end $$;
revoke execute on function purge_verification_documents from public, anon, authenticated;
grant execute on function purge_verification_documents to service_role;
