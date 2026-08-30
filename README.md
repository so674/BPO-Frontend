# Pulse — BPO RFID Attendance & Access Portal (Frontend)

React + TypeScript + Vite + Tailwind frontend for the BPO RFID Attendance & Access Management System,
built directly from the system architecture, data model, and business rules in the master document.

## Stack
- React 19 + TypeScript
- Vite (build tool / dev server)
- Tailwind CSS (design tokens in `tailwind.config.js`)
- React Router (role-based routing)
- Recharts (attendance trend charts)
- lucide-react (icons)

## Run locally (VS Code)

```bash
npm install
npm run dev
```

Open http://localhost:5173. Sign in by picking a role on the login screen (HR / Manager / CEO / Employee) —
this is a demo auth screen; real JWT/RBAC auth will be wired to the Express backend's `/auth` endpoint.

## Project structure

```
src/
  types/index.ts        # domain types mirroring the doc's data model (Employees, RfidCards,
                         # RfidDevices, AttendanceEvents, AttendanceRecords, Corrections, AuditLogs)
  data/mock.ts           # mock dataset — swap for real API calls once the backend is live
  lib/status.ts          # status → color/label mapping (attendance state machine, card status, device status)
  components/
    layout/               # Sidebar, Topbar, AppLayout (role-aware nav shell)
    ui/                   # Panel, StatCard, StatusBadge, PageHeader — shared primitives
    login/ReaderVisual.tsx  # animated RFID tap sequence (signature visual)
  pages/
    LoginPage.tsx
    hr/        # Overview, Employees, Cards, Devices, Attendance, Corrections, Reports, AuditLog
    manager/   # Team Overview, Team Attendance, Team Reports
    ceo/       # Company Overview, Departments, Trends
    employee/  # My Attendance, History, My Card
  App.tsx      # role-based route table
```

## Design notes
- Dark, instrument-panel palette (`ink`/`steel`/`brand` tokens) — reads like access-control software,
  not a generic SaaS dashboard.
- Attendance status colors are centralized in `lib/status.ts` and used everywhere (badges, charts, dots)
  so the state machine (PRESENT / LATE / ABSENT / MISSING_PUNCH / ON_LEAVE / HOLIDAY / WEEK_OFF / CORRECTED)
  stays visually consistent with the doc's Section 14.
- The login screen's animated reader/tap sequence embodies the doc's core principle:
  "One tap creates one accurate, traceable attendance record."
- Role-based navigation and page scope directly follow Section 20 (Role-Based Portal Architecture):
  HR = full control, Manager = team scope, CEO = read-only company view, Employee = self view.

## Next step: backend
This frontend currently reads from `src/data/mock.ts`. The next step is a Node.js/Express + PostgreSQL
backend implementing the API resource groups from Section 22 (`/auth`, `/employees`, `/cards`, `/devices`,
`/attendance-events`, `/attendance`, `/corrections`, `/reports`, `/audit-logs`), after which the mock data
module gets replaced with real `fetch`/axios calls.
