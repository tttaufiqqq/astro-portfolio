# tttaufiqq — Developer Portfolio

A full-stack developer portfolio with a built-in content management system. Built from scratch as a showcase of full-stack capability — React frontend, Express API, Azure SQL, deployed on Azure App Service.

**Live:** https://tttaufiqq-portfolio-ahhgd6gfg8dzdddc.southeastasia-01.azurewebsites.net

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| Backend | Express.js + TypeScript + Prisma ORM |
| Database | Azure SQL (Basic tier) |
| Auth | JWT (httpOnly cookie), bcrypt, rate limiting |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Notifications | sonner |
| Icons | Lucide React |
| Hosting | Azure App Service (B1, Southeast Asia) |
| CI/CD | GitHub Actions → Azure Web Apps Deploy |

---

## Features

### Public Site
- **Home** — hero, featured projects, skills grid, experience timeline
- **Projects** — full project listing with tech stack tags
- **Project Detail** — rich content pages built from blocks (heading, text, image, video, code)
- **Contact** — rate-limited form, submissions stored in database

### Admin Panel (`/admin`)
- JWT-based auth with httpOnly cookie
- **Projects** — create, edit, delete, drag-to-reorder, status/featured control
- **Block Editor** — compose project pages block by block (heading / text / image / video / code), drag-to-reorder
- **Skills** — create, edit, delete, drag-to-reorder, Lucide icon picker + emoji support
- **Experience** — create, edit, delete, drag-to-reorder, date range + current role support
- **Messages** — view contact submissions, expandable preview, mailto reply, delete

---

## Local Development

### Prerequisites
- Node.js 18+
- Azure SQL database (or any SQL Server compatible DB)

### Setup

**1. Install dependencies**
```bash
# Root (frontend)
npm install

# Backend
cd server
npm install
```

**2. Configure environment**

Create `server/.env`:
```env
DATABASE_URL="sqlserver://..."
JWT_SECRET="your-secret-here"
ADMIN_PASSWORD_HASH="bcrypt-hash-here"
CLIENT_ORIGIN="http://localhost:3000"
```

Generate a password hash:
```bash
cd server
npx ts-node scripts/generate-hash.ts yourpassword
```

**3. Push database schema**
```bash
cd server
npm run db:push
```

**4. Run both servers**

Terminal 1 — Backend (port 8080):
```bash
cd server
npm run dev
```

Terminal 2 — Frontend (port 3000):
```bash
npm run dev
```

Open `http://localhost:3000`

---

## Project Structure

```
portfolio/
├── src/                    — Vite entry (main.tsx, App.tsx, index.css)
├── pages/
│   ├── public/             — Home, Projects, ProjectDetail, Contact
│   └── admin/              — Login, ProjectsTab, SkillsTab, ExperiencesTab, MessagesTab
├── layouts/                — PublicLayout, AdminLayout
├── components/
│   ├── public/             — ProjectCard, SkillBadge, TimelineItem, block renderers
│   └── admin/              — Form components, modals, BlockEditorModal, IconPicker
├── lib/                    — utils.ts, tokens.ts, icon-map.ts
├── types/                  — models.ts (Project, Skill, Experience, Message, ContentBlock)
└── server/
    ├── index.ts            — Express app setup
    ├── middleware/         — auth.ts (requireAuth)
    ├── routes/             — auth, projects, skills, experiences, messages, blocks, block
    └── scripts/            — generate-hash.ts
```

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login (rate limited 5/15min) |
| POST | `/api/auth/logout` | — | Clear session cookie |
| GET | `/api/auth/check` | — | Check auth status |
| GET | `/api/projects` | — | List projects (filterable by status/featured) |
| GET | `/api/projects/:slug` | — | Get project + prev/next nav |
| POST | `/api/projects` | JWT | Create project |
| PUT | `/api/projects/:id` | JWT | Update project |
| DELETE | `/api/projects/:id` | JWT | Delete project |
| PATCH | `/api/projects/reorder` | JWT | Bulk reorder |
| GET | `/api/projects/:id/blocks` | JWT | List blocks for project |
| POST | `/api/projects/:id/blocks` | JWT | Create block |
| PATCH | `/api/projects/:id/blocks/reorder` | JWT | Reorder blocks |
| PUT | `/api/blocks/:id` | JWT | Update block |
| DELETE | `/api/blocks/:id` | JWT | Delete block |
| GET | `/api/skills` | — | List all skills |
| POST/PUT/DELETE | `/api/skills` | JWT | CRUD |
| PATCH | `/api/skills/reorder` | JWT | Reorder |
| GET | `/api/experiences` | — | List all experiences |
| POST/PUT/DELETE | `/api/experiences` | JWT | CRUD |
| PATCH | `/api/experiences/reorder` | JWT | Reorder |
| POST | `/api/messages` | — | Submit contact form |
| GET | `/api/messages` | JWT | List all messages |
| DELETE | `/api/messages/:id` | JWT | Delete message |

---

## Deployment

Push to `main` triggers the GitHub Actions workflow:
1. Build frontend (`tsc -b && vite build`)
2. Build server (`tsc` + `prisma generate` for Linux binary)
3. Zip and deploy to Azure App Service

Environment variables are set in Azure Application Settings (not committed).

---

## Commands

```bash
# Frontend
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run lint         # TypeScript check

# Backend (from server/)
npm run dev          # Dev server with hot reload (port 8080)
npm run build        # Compile TypeScript
npm run db:push      # Sync Prisma schema to database
npm run db:studio    # Open Prisma Studio (database GUI)
```
