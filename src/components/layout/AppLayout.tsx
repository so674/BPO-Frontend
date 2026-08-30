import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { CurrentUser } from "../../types";

export default function AppLayout({ user, onSignOut }: { user: CurrentUser; onSignOut: () => void }) {
  return (
    <div className="flex h-screen bg-ink-950">
      <Sidebar user={user} onSignOut={onSignOut} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
