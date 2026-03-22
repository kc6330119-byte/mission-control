CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT,
  status TEXT DEFAULT 'active',
  tech_stack TEXT,
  netlify_url TEXT,
  airtable_base TEXT,
  adsense_status TEXT,
  adsense_publisher_id TEXT DEFAULT 'ca-pub-9265762311868507',
  listing_count INTEGER DEFAULT 0,
  blog_post_count INTEGER DEFAULT 0,
  color_tag TEXT DEFAULT 'gray',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK(status IN ('backlog','todo','in_progress','review','done')),
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
  project_id INTEGER,
  assignee TEXT,
  due_date TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS adsense_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  submission_date TEXT,
  outcome TEXT DEFAULT 'pending' CHECK(outcome IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  notes TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  date TEXT,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  bounce_rate REAL DEFAULT 0,
  avg_session_duration REAL DEFAULT 0,
  organic_users INTEGER DEFAULT 0,
  direct_users INTEGER DEFAULT 0,
  referral_users INTEGER DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS search_console_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  date TEXT,
  total_clicks INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  avg_ctr REAL DEFAULT 0,
  avg_position REAL DEFAULT 0,
  indexed_pages INTEGER DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS investment_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticker TEXT NOT NULL,
  date TEXT,
  price REAL,
  daily_change_pct REAL,
  sentiment TEXT,
  headline TEXT
);

CREATE TABLE IF NOT EXISTS usage_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  session_pct REAL DEFAULT 0,
  weekly_pct REAL DEFAULT 0,
  extra_spend REAL DEFAULT 0,
  plan TEXT
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  message TEXT NOT NULL,
  agent TEXT,
  project_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'human' CHECK(type IN ('human','ai_agent')),
  role TEXT,
  description TEXT,
  device TEXT,
  status TEXT DEFAULT 'offline' CHECK(status IN ('online','offline','busy')),
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  project_id INTEGER,
  task_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES team_members(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS mission (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  statement TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
