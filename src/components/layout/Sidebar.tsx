import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, Router, ClipboardList, GitPullRequestArrow,
  FileBarChart, ShieldCheck, LogOut, Radio, Building2, TrendingUp, UserCircle, History,
} from "lucide-react";
import type { CurrentUser } from "../../types";

const navByRole: Record<CurrentUser["role"], { to: string; label: string; icon: typeof LayoutDashboard }[]> = {
  HR: [
    { to: "/hr", label: "Overview", icon: LayoutDashboard },
    { to: "/hr/employees", label: "Employees", icon: Users },
    { to: "/hr/cards", label: "RFID Cards", icon: CreditCard },
    { to: "/hr/devices", label: "Devices", icon: Router },
    { to: "/hr/attendance", label: "Attendance", icon: ClipboardList },
    { to: "/hr/corrections", label: "Corrections", icon: GitPullRequestArrow },
    { to: "/hr/reports", label: "Reports", icon: FileBarChart },
    { to: "/hr/audit", label: "Audit Log", icon: ShieldCheck },
  ],
  MANAGER: [
    { to: "/manager", label: "Team Overview", icon: LayoutDashboard },
    { to: "/manager/attendance", label: "Team Attendance", icon: ClipboardList },
    { to: "/manager/reports", label: "Team Reports", icon: FileBarChart },
  ],
  CEO: [
    { to: "/ceo", label: "Company Overview", icon: LayoutDashboard },
    { to: "/ceo/departments", label: "Departments", icon: Building2 },
    { to: "/ceo/trends", label: "Trends & Analytics", icon: TrendingUp },
  ],
  EMPLOYEE: [
    { to: "/employee", label: "My Attendance", icon: UserCircle },
    { to: "/employee/history", label: "History", icon: History },
    { to: "/employee/card", label: "My Card", icon: CreditCard },
  ],
};

export default function Sidebar({ user, onSignOut }: { user: CurrentUser; onSignOut: () => void }) {
  const items = navByRole[user.role];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-line bg-ink-900">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
          <Radio size={16} />
        </span>
        <div>
          <p className="font-display text-sm font-semibold leading-none text-steel-100">Pulse</p>
          <p className="mt-1 text-[11px] leading-none text-steel-500">Attendance &amp; Access</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/${user.role.toLowerCase()}`}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-500/15 text-brand-400"
                  : "text-steel-400 hover:bg-ink-800 hover:text-steel-100"
              }`
            }
          >
            <item.icon size={16} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 font-display text-xs font-semibold text-steel-100">
            {user.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-steel-100">{user.name}</p>
            <p className="text-[11px] text-steel-500">{user.role}</p>
          </div>
          <button
            onClick={onSignOut}
            className="rounded-md p-1.5 text-steel-500 hover:bg-ink-800 hover:text-status-absent"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
