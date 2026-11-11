-- Y CONNECTOR — seed data.
-- Forum categories are REQUIRED. Everything flagged is_sample = true is
-- example content for previewing and must be replaced/removed before launch.

insert into forum_categories (slug, name, description, position) values
  ('general','General Community','Anything and everything about building, learning and the community.',1),
  ('introductions','Introductions','New here? Say hello and tell us what you''re working on.',2),
  ('ai-automation','AI & Automation','Tools, agents, workflows and the practical side of AI.',3),
  ('building-startups','Building Startups','Validation, MVPs, customers and the messy middle.',4),
  ('fintech','FinTech & Digital Payments','Payments, digital money, open banking and financial infrastructure.',5),
  ('funding','Funding & Investment Education','Learn how funding and markets work. Education only — no investment solicitation.',6),
  ('marketing-growth','Marketing & Growth','Distribution, content, analytics and getting noticed.',7),
  ('co-founders','Looking for a Co-Founder','Find people with complementary skills.',8),
  ('talent','Talent & Opportunities','Roles, internships, freelance gigs and collaborations.',9),
  ('ask-a-mentor','Ask a Mentor','Questions for experienced members and mentors.',10),
  ('events','Events & Meetups','Event chat, recaps and member-organised meetups.',11)
on conflict (slug) do nothing;

-- ── Sample events (speakers deliberately "to be announced") ──
insert into events (slug,title,category,format,starts_at,ends_at,location,summary,description,speaker,capacity,access,price_note,status,is_sample) values
 ('build-your-first-ai-agent','Build Your First AI Agent','AI Workshop','in_person', now()+interval '9 days', now()+interval '9 days 3 hours','Central London (venue TBC)',
  'A hands-on evening: go from a blank page to a working AI agent that automates a real task.',
  'Bring a laptop and a problem you''d like to automate. No prior coding required.',
  '{"name":"Principal speaker — to be announced","title":"Practitioner building AI products","bio":"Speaker details will be published once confirmed."}',40,'members','Included with membership','published',true),
 ('the-future-of-digital-payments','The Future of Digital Payments','FinTech Session','hybrid', now()+interval '23 days', now()+interval '23 days 2 hours','Colchester & online',
  'How money moves today, what''s changing, and where young founders can build.',
  'A talk, moderated Q&A and an open networking hour.',
  '{"name":"Principal speaker — to be announced","title":"FinTech industry specialist","bio":"Speaker details will be published once confirmed."}',80,'public','Free for members · limited public places','published',true),
 ('how-startup-funding-actually-works','How Startup Funding Actually Works','Investment Education','in_person', now()+interval '51 days', now()+interval '51 days 2 hours','London (venue TBC)',
  'Grants, angels, pre-seed, SEIS/EIS and VC — explained without the jargon.',
  'Educational session only. Not financial advice or an offer of investment.',
  '{"name":"Principal speaker — to be announced","title":"Early-stage investment specialist","bio":"Speaker details will be published once confirmed."}',60,'members','Included with membership','published',true)
on conflict (slug) do nothing;

-- ── Sample courses + lessons ──
with c as (
  insert into courses (slug,title,category,summary,level,skills,access,related_event_slugs,status,is_sample) values
   ('ai-fundamentals','AI Fundamentals for Founders','AI Fundamentals','What modern AI and large language models actually are, what they''re good at, and where they fail.','Beginner','{LLMs,Prompting,"AI literacy"}','included','{build-your-first-ai-agent}','published',true)
  on conflict (slug) do nothing returning id
)
insert into lessons (course_id, position, title, kind, body, minutes)
select id, 1, 'How large language models work (without the maths)', 'text',
 'Large language models predict the next piece of text based on patterns learned from vast amounts of data.', 12 from c
union all
select id, 2, 'Prompting as product design', 'text', 'Good prompts read like good briefs.', 10 from c;

-- ── Sample startup concept ──
insert into startups (slug,name,tagline,description,industry,stage,themes,team_needs,milestones,community_connection,approval,is_sample) values
 ('flowtwin','FlowTwin (sample concept)','A digital twin of a local payments ecosystem.','Sample concept: simulate how payments move between businesses in a town.','FinTech · Simulation','exploring',
  '{"Digital twins of payment ecosystems","Digital payments"}','{"Data scientist","Payments expert"}','{"Research question defined"}','Illustrative example of a member-led project.','approved',true)
on conflict (slug) do nothing;

-- ── Bootstrap your first super admin (run after you sign up) ──
-- insert into user_roles (user_id, role)
--   select id, 'super_admin' from auth.users where email = 'you@example.com';
