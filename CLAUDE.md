# Mission Control Dashboard

## Overview
A local web-based dashboard that serves as the central hub for monitoring and managing Kevin Collins' portfolio of directory websites, investment tracking, scheduled AI agent tasks, and SAP SuccessFactors work activity. Inspired by OpenClaw Mission Control (Alex Finn), customized for Kevin's specific workflow.

Mission Control runs locally on Kevin's Mac Mini (always-on) and is accessible from any device on the network (MacBook Pro, phone).

## Tech Stack
- **Frontend:** React 18+ with Tailwind CSS
- **Backend:** Node.js with Express
- **Database:** SQLite (lightweight, file-based, no separate server needed)
- **Package Manager:** npm
- **Build Tool:** Vite
- **Key Libraries:**
  - `@hello-pangea/dnd` — Drag-and-drop for kanban task boards
  - `recharts` — Charts and data visualization
  - `date-fns` — Date formatting and manipulation
  - `lucide-react` — Icon library
  - `better-sqlite3` — SQLite driver for Node.js

## Architecture
```
mission-control/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/     # Main dashboard overview
│   │   │   ├── TaskBoard/     # Kanban board with drag-and-drop
│   │   │   ├── Projects/      # Directory site project cards
│   │   │   ├── Analytics/     # GA4 & Search Console widgets
│   │   │   ├── Memories/      # Memory browser, detail, and timeline
│   │   │   ├── Investments/   # Stock watchlist & news feed
│   │   │   ├── Calendar/      # Timeline and scheduling view
│   │   │   ├── Docs/          # Document management
│   │   │   ├── CostTracker/   # Claude usage & billing monitor
│   │   │   ├── SAP/           # SAP work activity section
│   │   │   ├── Team/          # Team / Org view & agent cards
│   │   │   └── Mission/       # Mission statement & reverse prompting
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # React context providers
│   │   ├── utils/             # Helper functions
│   │   └── App.jsx            # Main app with routing
│   └── index.html
├── server/                    # Express backend
│   ├── routes/
│   │   ├── tasks.js           # CRUD for kanban tasks
│   │   ├── projects.js        # Directory site data
│   │   ├── analytics.js       # Proxy for analytics data
│   │   ├── memories.js        # Memory CRUD & file sync
│   │   ├── investments.js     # Alpha Vantage integration
│   │   ├── usage.js           # Claude usage tracking
│   │   ├── team.js            # Team member CRUD & activity
│   │   └── mission.js         # Mission statement & recommendations
│   ├── db/
│   │   ├── schema.sql         # SQLite schema
│   │   └── seed.sql           # Initial data
│   ├── middleware/
│   └── server.js              # Express entry point
├── CLAUDE.md                  # This file
├── package.json
└── README.md
```

## Phase 1 — MVP (Build This First)

### 1.1 Dashboard Home
The main landing page showing an at-a-glance overview of everything:
- **Site Status Cards** — One card per directory site (4 total) showing: site name, URL, current status (e.g., "Waiting for Google Recrawl"), AdSense status (e.g., "Rejected x2 — Resubmit ~April 27"), days since last update, a health indicator (green/yellow/red)
- **Quick Stats Row** — Total pages indexed, total blog posts across all sites, active users today, next AdSense submission date
- **Recent Activity Feed** — Timeline of recent actions, task completions, and alerts

### 1.2 Kanban Task Board
Interactive task management with drag-and-drop columns:
- **Columns:** Backlog, To Do, In Progress, Review, Done
- **Task Cards** show: title, project tag (which site), priority (low/medium/high/urgent), due date, assignee (Kevin, Zoe, Claude Code), description preview
- **Drag and drop** cards between columns to update status
- **Filter by:** project, priority, assignee
- **Color-coded** project tags: Holistic Vet (green), Splash Pad (blue), Senior Home Care (purple), Smart Investor (orange), SAP (red), Mission Control (gray)

### 1.2.1 Live Activity Sidebar
A real-time activity feed displayed as a sidebar on the Task Board (inspired by Alex Finn's OpenClaw Mission Control):
- Shows what each agent (Kevin, Zoe, Claude Code) is currently doing or last did
- Timestamped entries: "Zoe checked Google Analytics — 4 active users" or "Claude Code committed 3 files to Smart Investor repo"
- Auto-scrolling log, newest at top
- Filterable by agent

### 1.3 Projects View
Detailed view for each directory site:
- **Project Card (expanded):** full status, tech stack, URL, Netlify deploy status, Airtable record count, blog post count, remediation checklist with progress bar
- **AdSense History:** Timeline of submission attempts with dates, outcomes, and rejection reasons
- **Key Metrics:** Pages indexed (from Search Console), organic impressions, clicks, avg position
- **Next Actions:** Auto-populated from the kanban board filtered to that project

### 1.4 Navigation
- Sidebar navigation with icons: Dashboard, Task Board, Projects, Analytics, Memories, Investments, Calendar, Docs, Cost Tracker, SAP, Team
- Collapsible sidebar for more screen space
- Dark mode toggle
- Mobile-responsive layout

### 1.5 Mission Statement
A persistent, editable "North Star" displayed at the top of the Dashboard and Team views:
- Default: "Build four revenue-generating directory sites to AdSense approval, leveraging AI agents to maximize productivity and quality."
- Editable by Kevin through the UI
- Used as context for task prioritization — a "What should we do next?" button that recommends the highest-impact task based on the mission statement and current project status

### 1.6 Reverse Prompting
A built-in "Ask Mission Control" feature:
- A text input or button that asks: "What task should we focus on next to move closest to our goals?"
- Analyzes current project statuses, upcoming deadlines (AdSense submission dates), blockers, and the mission statement
- Returns a prioritized recommendation with reasoning
- Can also answer: "What's blocking progress right now?" and "What's the highest-risk item?"

## Phase 2 — Analytics Integration

### 2.1 Google Analytics Widget
Per-site analytics cards showing:
- Active users (realtime)
- Users today vs. yesterday vs. last week
- Traffic sources breakdown (organic, direct, referral, social)
- Top pages by views
- New vs. returning users chart (7-day trend)
- Average session duration
- Bounce rate

### 2.2 Google Search Console Widget
Per-site search performance:
- Total clicks, impressions, CTR, avg position (28-day)
- Clicks/impressions trend chart (daily, 28 days)
- Top queries table with clicks, impressions, CTR, position
- Top pages table with same metrics
- Position distribution histogram
- Index coverage status (indexed vs. excluded pages)

### 2.3 AdSense Readiness Score
A calculated score (0-100) per site based on:
- Daily organic users (target: 50+)
- Google as top organic source (yes/no)
- Indexed page count growth trend
- Bounce rate (target: under 40%)
- Session duration (target: above 3 min)
- Blog post count (target: 25+)
- Display recommendation: "Ready", "Getting Close", "Not Yet" with reasoning

### 2.4 Memories Module
A searchable knowledge base that syncs with Zoe's persistent memory files, inspired by Alex Finn's OpenClaw Mission Control (7:03 mark).

**Memory Browser:**
- Card-based display of all saved memories
- Filter by type: user, project, feedback, reference
- Full-text search across memory names, descriptions, and content
- Sort by: date created, date updated, type, name

**Memory Detail View:**
- Full content display with markdown rendering
- Edit memory content, name, description, and type through the UI
- Delete with confirmation
- Timestamps: created_at and updated_at displayed

**Timeline View:**
- Chronological view of when memories were created and updated
- Shows how the working relationship has evolved over time
- Filterable by type

**"What does Zoe know?" Query:**
- Search input that queries across all memory content
- Returns relevant memories ranked by relevance
- Useful for quickly checking if something has been remembered

**Sync with Memory Files:**
- On startup, import all markdown memory files from the Cowork auto-memory directory
- Parse YAML frontmatter (name, description, type) and markdown body content
- Detect new, modified, or deleted memory files and sync accordingly
- Export: changes made through the UI can be written back to markdown files

## Phase 3 — Financial & Operations

### 3.1 Investment Watchlist
- Cards for each tracked stock: SAP, NVDA, PLTR, GOOGL, IREN
- Current price, daily change (%), sparkline chart (7-day)
- Latest news headlines with sentiment indicator (bullish/neutral/bearish)
- Integration with Alpha Vantage API (already connected)

### 3.2 Claude Usage & Cost Tracker
- Current session usage percentage
- Weekly usage bar (all models)
- Extra usage spend this billing cycle
- Monthly cost trend chart
- Alert threshold indicator (warn at 60% weekly)
- Estimated monthly total based on current pace

### 3.3 Scheduled Tasks Monitor
- List of all scheduled tasks with: name, schedule (cron), last run time, next run time, status (active/paused), last run result (success/failed)
- Toggle to enable/disable tasks
- Run history log

## Phase 4 — SAP & Extended Features

### 4.1 SAP Activity Section
- Recent email drafts and documents (from /SAP/ directory)
- Meeting follow-ups tracker
- AI initiative notes and ideas
- Key contacts reference (Dan, Connie, Siva, Beverly)

### 4.2 Calendar View
- Monthly/weekly calendar showing: AdSense submission target dates, scheduled task runs, project milestones, reminders
- Sync with project due dates from kanban board

### 4.3 Docs Section
- File browser for project directories
- Quick access to project tracking docs
- Document search

### 4.4 Newsletter Pipeline (Future)
- Topic ideas board
- Draft articles tracker
- Publication schedule
- Content performance metrics

## Phase 5 — Team & Agent Management

### 5.1 Team / Org View
A visual team screen showing all agents and their roles:
- **Kevin Collins** — Human Lead, Decision Maker. Devices: Mac Mini (home), MacBook Pro (mobile). Role: Strategy, approvals, content review, SAP work
- **Zoe** — Dispatch/Cowork AI Agent on Mac Mini. Role: Project lead for directory sites, daily briefings, analytics monitoring, investment alerts, email drafting, scheduling, research
- **Claude Code** — Coding AI Agent on Mac Mini. Role: Code development, site builds, bug fixes, blog post writing, data pipeline scripts
- Each agent card shows: name, avatar/icon, role description, current status (online/offline/busy), last active, tasks assigned, tasks completed
- Future: ability to add more agents (e.g., a dedicated research agent, image generation agent, newsletter agent)

### 5.2 Agent Activity Dashboard
Per-agent detail view showing:
- Tasks completed (daily/weekly/monthly)
- Current assignments
- Performance metrics (tasks completed on time, average task duration)
- Activity log filtered to that agent

### 5.3 The Office (Fun/Optional)
A fun 2D pixel-art or isometric visualization showing agents "at their desks":
- Kevin at a command desk, Zoe at a monitoring station, Claude Code at a coding terminal
- Agents show activity animations when actively working on tasks
- Purely cosmetic but adds personality to the dashboard
- Low priority — build only after core features are solid

## Design Requirements

### Visual Style
- Clean, modern dashboard aesthetic
- Dark mode as default (with light mode toggle)
- Color palette: Dark backgrounds (#0f172a, #1e293b), accent blue (#3b82f6), accent emerald (#10b981)
- Card-based layout with subtle shadows and rounded corners
- Consistent spacing using Tailwind's spacing scale
- Smooth transitions and hover effects

### Typography
- Inter or system font stack for body text
- Monospace (JetBrains Mono or similar) for code/data values
- Clear hierarchy: page titles (24px), section headers (18px), card titles (16px), body (14px)

### Responsive Design
- Desktop-first but must work on tablet and phone
- Sidebar collapses to icons on tablet, becomes bottom nav on mobile
- Cards stack vertically on narrow screens
- Charts resize gracefully

## Data Model (SQLite Schema)

### projects
- id, name, url, status, tech_stack, netlify_url, airtable_base, adsense_status, adsense_publisher_id, listing_count, blog_post_count, color_tag, created_at, updated_at

### tasks
- id, title, description, status (backlog/todo/in_progress/review/done), priority (low/medium/high/urgent), project_id, assignee, due_date, sort_order, created_at, updated_at

### adsense_history
- id, project_id, submission_date, outcome (pending/approved/rejected), rejection_reason, notes

### analytics_snapshots
- id, project_id, date, active_users, new_users, sessions, bounce_rate, avg_session_duration, organic_users, direct_users, referral_users

### search_console_snapshots
- id, project_id, date, total_clicks, total_impressions, avg_ctr, avg_position, indexed_pages

### investment_snapshots
- id, ticker, date, price, daily_change_pct, sentiment, headline

### usage_snapshots
- id, date, session_pct, weekly_pct, extra_spend, plan

### memories
- id, name, description, type (user/project/feedback/reference), content, file_path, created_at, updated_at

### activity_log
- id, type, message, project_id, created_at

### team_members
- id, name, type (human/ai_agent), role, description, device, status (online/offline/busy), avatar_url, created_at, updated_at

### agent_activity
- id, agent_id, action, details, project_id, task_id, created_at

## API Endpoints

### Tasks
- GET /api/tasks — List all tasks (with filters)
- POST /api/tasks — Create task
- PUT /api/tasks/:id — Update task (including status changes from drag-and-drop)
- DELETE /api/tasks/:id — Delete task
- PUT /api/tasks/reorder — Batch update sort_order after drag

### Projects
- GET /api/projects — List all projects with latest metrics
- GET /api/projects/:id — Single project detail
- PUT /api/projects/:id — Update project

### Analytics
- GET /api/analytics/:projectId — Latest analytics for a project
- POST /api/analytics/:projectId — Store new snapshot

### Investments
- GET /api/investments — All tracked tickers with latest data
- GET /api/investments/:ticker — Detail for one ticker

### Usage
- GET /api/usage/current — Current usage stats
- GET /api/usage/history — Usage trend data

### Team
- GET /api/team — List all team members with current status
- GET /api/team/:id/activity — Activity log for a specific agent
- PUT /api/team/:id — Update team member status/details

### Memories
- GET /api/memories — List all memories (with search and type filter)
- GET /api/memories/:id — Single memory detail
- POST /api/memories — Create new memory
- PUT /api/memories/:id — Update memory
- DELETE /api/memories/:id — Delete memory
- POST /api/memories/sync — Trigger sync from memory files

### Mission
- GET /api/mission — Get current mission statement
- PUT /api/mission — Update mission statement
- GET /api/mission/recommend — Get AI-recommended next task based on mission and current state

## Initial Data (Seed)

### Projects to seed:
1. **Holistic Vet Directory** — holisticvetdirectory.com, status: "Waiting for Google Recrawl", adsense: "Rejected x2 — Target April 27", listings: 3223, blogs: 40, color: green
2. **Splash Pad Locator** — splashpadlocator.com, status: "Waiting for Google Recrawl", adsense: "First submission — Target late April", listings: 3025, blogs: 29, color: blue
3. **Senior Home Care Finder** — seniorhomecarefinder.com, status: "Waiting for Google Recrawl", adsense: "First submission — Target late April/early May", listings: 5690, blogs: 25, color: purple
4. **Smart Investor Financial Tools** — smart-investor-financial-tools.com, status: "Phase 2 — Data Load Pending", adsense: "Resubmission — Target May 5", listings: 5 (sample), blogs: 10, color: orange

### Team members to seed:
1. **Kevin Collins** — type: human, role: "Human Lead & Decision Maker", device: "Mac Mini (home) + MacBook Pro (mobile)", status: online
2. **Zoe** — type: ai_agent, role: "Project Lead — Dispatch/Cowork Agent", device: "Mac Mini", status: online
3. **Claude Code** — type: ai_agent, role: "Development Agent — Code & Content", device: "Mac Mini", status: online

### Sample tasks to seed:
- "Load Outscraper data for all 50 states" — Smart Investor, High priority, To Do, assignee: Kevin
- "Write 15 remaining blog posts" — Smart Investor, Medium priority, Backlog, assignee: Claude Code
- "Export fresh Search Console reports ~April 6" — Holistic Vet, Medium priority, To Do, assignee: Zoe
- "Verify noindexed pages dropping from Google index" — Holistic Vet, High priority, In Progress, assignee: Zoe
- "Pre-submission AdSense checks" — Holistic Vet, High priority, Backlog, assignee: Kevin
- "Monitor organic search growth" — All projects, Medium priority, In Progress, assignee: Zoe

## Development Instructions

### Setup
```bash
cd mission-control
npm install          # Install all dependencies
npm run dev          # Start both frontend (Vite) and backend (Express) in dev mode
```

### Build for production
```bash
npm run build        # Build React frontend
npm start            # Start Express server (serves built frontend + API)
```

### Environment Variables (.env)
```
PORT=3333
ALPHA_VANTAGE_API_KEY=<from existing setup>
DATABASE_PATH=./server/db/mission-control.db
```

### Running
The dashboard runs at http://localhost:3333 and is accessible from any device on the same network at http://<mac-mini-ip>:3333

## Key Constraints
- Must run on macOS (Mac Mini M-series)
- Node.js 18+ required
- No external database server — SQLite only
- No authentication needed (local network only)
- Must be lightweight — fast startup, minimal resource usage
- All data stored locally — no cloud dependencies for core functionality
- Alpha Vantage API has rate limits on free tier — cache data aggressively

## Reference
- Inspired by OpenClaw Mission Control (Alex Finn, youtube.com/watch?v=RhLpV6QDBFE)
- Directory sites use: Python/Jinja2, Airtable CMS, Netlify hosting, Tailwind CSS
- All sites share AdSense publisher ID: ca-pub-9265762311868507
- Project tracking docs at: /Users/kevincollins/GitHub/Directory-Sites/project-tracking/
