-- ════════════════════════════════════════════════════════════════════
--  0002 — Membership programme offerings
--   • Opt-in talent dissemination to industry partners
--   • AI EdTech technical advice forum category
-- ════════════════════════════════════════════════════════════════════

-- Off by default: a member must explicitly opt in from profile settings.
alter table profiles add column if not exists share_with_industry boolean not null default false;

insert into forum_categories (slug, name, description, position) values
  ('ai-edtech', 'AI EdTech Technical Advice', 'Online technical advice on building with AI, including AI EdTech products.', 12)
on conflict (slug) do nothing;
