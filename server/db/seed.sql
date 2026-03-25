-- Projects
INSERT INTO projects (name, url, status, tech_stack, adsense_status, listing_count, blog_post_count, color_tag) VALUES
  ('Holistic Vet Directory', 'holisticvetdirectory.com', 'Waiting for Google Recrawl', 'Python/Jinja2, Airtable, Netlify, Tailwind', 'Rejected x2 — Target April 27', 3223, 40, 'green'),
  ('Splash Pad Locator', 'splashpadlocator.com', 'Waiting for Google Recrawl', 'Python/Jinja2, Airtable, Netlify, Tailwind', 'First submission — Target late April', 3025, 29, 'blue'),
  ('Senior Home Care Finder', 'seniorhomecarefinder.com', 'Waiting for Google Recrawl', 'Python/Jinja2, Airtable, Netlify, Tailwind', 'First submission — Target late April/early May', 5690, 25, 'purple'),
  ('Smart Investor Financial Tools', 'smart-investor-financial-tools.com', 'Phase 2 — Data Load Pending', 'Python/Jinja2, Airtable, Netlify, Tailwind', 'Resubmission — Target May 5', 5, 10, 'orange');

-- Team Members
INSERT INTO team_members (name, type, role, description, device, status) VALUES
  ('Kevin Collins', 'human', 'Human Lead & Decision Maker', 'Strategy, approvals, content review, SAP work', 'Mac Mini (home) + MacBook Pro (mobile)', 'online'),
  ('Zoe', 'ai_agent', 'Project Lead — Dispatch/Cowork Agent', 'Daily briefings, analytics monitoring, investment alerts, email drafting, scheduling, research', 'Mac Mini', 'online'),
  ('Claude Code', 'ai_agent', 'Development Agent — Code & Content', 'Code development, site builds, bug fixes, blog post writing, data pipeline scripts', 'Mac Mini', 'online');

-- Sample Tasks
INSERT INTO tasks (title, description, status, priority, project_id, assignee, sort_order) VALUES
  ('Load Outscraper data for all 50 states', 'Download and import financial advisor data from Outscraper for every US state into Airtable.', 'todo', 'high', 4, 'Kevin Collins', 0),
  ('Write 15 remaining blog posts', 'Create 15 additional blog posts for Smart Investor covering key financial topics.', 'backlog', 'medium', 4, 'Claude Code', 0),
  ('Export fresh Search Console reports ~April 6', 'Pull updated Google Search Console data for Holistic Vet around April 6.', 'todo', 'medium', 1, 'Zoe', 0),
  ('Verify noindexed pages dropping from Google index', 'Check that pages marked noindex are being removed from Google search results.', 'in_progress', 'high', 1, 'Zoe', 0),
  ('Pre-submission AdSense checks', 'Run through the AdSense approval checklist before resubmitting Holistic Vet.', 'backlog', 'high', 1, 'Kevin Collins', 0),
  ('Monitor organic search growth', 'Track organic search traffic trends across all directory sites weekly.', 'in_progress', 'medium', NULL, 'Zoe', 0);

-- AdSense History
INSERT INTO adsense_history (project_id, submission_date, outcome, rejection_reason, notes) VALUES
  (1, '2025-03-15', 'rejected', 'Low value content', 'First submission attempt'),
  (1, '2025-04-01', 'rejected', 'Low value content', 'Second attempt after adding more blog posts'),
  (4, '2025-03-20', 'rejected', 'Site not ready', 'Initial submission — too few listings');

-- Mission Statement
INSERT INTO mission (statement) VALUES
  ('Build four revenue-generating directory sites to AdSense approval, leveraging AI agents to maximize productivity and quality.');

-- Usage Snapshots (seed with current data)
INSERT INTO usage_snapshots (date, session_pct, weekly_pct, sonnet_pct, extra_spend, extra_limit, extra_balance, plan, notes) VALUES
  ('2026-03-24', 41, 38, 0, 29.05, 100, 0.82, 'Max 5x', 'Initial snapshot'),
  ('2026-03-23', 35, 32, 0, 25.10, 100, 4.77, 'Max 5x', NULL),
  ('2026-03-22', 28, 25, 0, 20.50, 100, 9.37, 'Max 5x', NULL),
  ('2026-03-21', 22, 19, 0, 16.20, 100, 13.67, 'Max 5x', NULL),
  ('2026-03-20', 15, 14, 0, 11.80, 100, 18.07, 'Max 5x', NULL),
  ('2026-03-19', 10, 8, 0, 7.30, 100, 22.57, 'Max 5x', NULL),
  ('2026-03-18', 5, 3, 0, 3.10, 100, 26.77, 'Max 5x', 'Week start');

-- Initial Activity Log
INSERT INTO activity_log (type, message, agent, project_id) VALUES
  ('system', 'Mission Control initialized', NULL, NULL),
  ('task', 'Started monitoring noindexed pages', 'Zoe', 1),
  ('task', 'Began organic search growth tracking', 'Zoe', NULL),
  ('project', 'Smart Investor entered Phase 2', NULL, 4);
