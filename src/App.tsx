import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/layout/AppLayout";
import HRDashboard from "./pages/hr/HRDashboard";
import Employees from "./pages/hr/Employees";
import Cards from "./pages/hr/Cards";
import Devices from "./pages/hr/Devices";
import Attendance from "./pages/hr/Attendance";
import Corrections from "./pages/hr/Corrections";
import Reports from "./pages/hr/Reports";
import AuditLog from "./pages/hr/AuditLog";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import TeamAttendance from "./pages/manager/TeamAttendance";
import TeamReports from "./pages/manager/TeamReports";
import CEODashboard from "./pages/ceo/CEODashboard";
import DepartmentsPage from "./pages/ceo/DepartmentsPage";
import TrendsPage from "./pages/ceo/TrendsPage";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import History from "./pages/employee/History";
import MyCard from "./pages/employee/MyCard";
import { fetchMe, getToken, setToken } from "./lib/api";
import type { CurrentUser } from "./types";

const roleHome: Record<CurrentUser["role"], string> = {
  HR: "/hr",
  MANAGER: "/manager",
  CEO: "/ceo",
  EMPLOYEE: "/employee",
};

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On first load, if a token is already in localStorage (from a previous login),
  // ask the backend who it belongs to instead of forcing a fresh login every refresh.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }
    fetchMe()
      .then(({ user: u }) => setUser({ id: u.id, name: u.name, role: u.role as CurrentUser["role"], employeeId: u.employeeId }))
      .catch(() => setToken(null)) // stored token is invalid/expired
      .finally(() => setCheckingSession(false));
  }, []);

  const handleSignOut = () => {
    setToken(null);
    setUser(null);
  };

  if (checkingSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950 text-sm text-steel-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout user={user} onSignOut={handleSignOut} />}>
          {/* HR */}
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/hr/employees" element={<Employees />} />
          <Route path="/hr/cards" element={<Cards />} />
          <Route path="/hr/devices" element={<Devices />} />
          <Route path="/hr/attendance" element={<Attendance />} />
          <Route path="/hr/corrections" element={<Corrections />} />
          <Route path="/hr/reports" element={<Reports />} />
          <Route path="/hr/audit" element={<AuditLog />} />

          {/* Manager */}
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/attendance" element={<TeamAttendance />} />
          <Route path="/manager/reports" element={<TeamReports />} />

          {/* CEO */}
          <Route path="/ceo" element={<CEODashboard />} />
          <Route path="/ceo/departments" element={<DepartmentsPage />} />
          <Route path="/ceo/trends" element={<TrendsPage />} />

          {/* Employee */}
          <Route path="/employee" element={<EmployeeDashboard user={user} />} />
          <Route path="/employee/history" element={<History user={user} />} />
          <Route path="/employee/card" element={<MyCard user={user} />} />

          <Route path="*" element={<Navigate to={roleHome[user.role]} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
