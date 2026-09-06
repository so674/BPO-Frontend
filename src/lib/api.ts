// Talks to the Express backend API. Every page imports functions from here.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function setToken(token: string | null) {
  if (token && token !== "undefined") {
    localStorage.setItem("pulse_token", token);
  } else {
    localStorage.removeItem("pulse_token");
  }
}

export function getToken(): string | null {
  const token = localStorage.getItem("pulse_token");
  return token && token !== "undefined" ? token : null;
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    // Auto-clear invalid/expired token on 401 Unauthorized
    if (res.status === 401) {
      setToken(null);
      // Only reload if it was NOT the login or me endpoint
      if (!path.includes("/auth/login") && !path.includes("/auth/me")) {
        window.location.reload();
      }
    }

    const errorMessage = body.message || body.error || `Request failed: ${res.status}`;
    const err: ApiValidationError = new Error(errorMessage);
    if (body.details) err.details = body.details;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: unknown) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path: string, body?: unknown) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
};

export interface ApiValidationError extends Error {
  details?: { path: (string | number)[]; message: string }[];
}

// ── Auth ──────────────────────────────────────────────
export async function login(email: string, password: string) {
  setToken(null);

  const res = (await api.post("/auth/login", { email, password })) as any;
  const token = res?.token || res?.accessToken || res?.data?.token;
  const user = res?.user || res?.data?.user;

  if (!token) {
    throw new Error("Invalid server response: No auth token returned.");
  }

  setToken(token);
  return { token, user };
}

export function fetchMe() {
  return api.get("/auth/me") as Promise<{
    user: { id: string; name: string; role: string; employeeId: string };
  }>;
}

// ── Dashboard ─────────────────────────────────────────
export const getHrDashboard = () => api.get("/dashboard/hr");
export const getEmployeeDashboard = () => api.get("/dashboard/employee");

// ── Employees ─────────────────────────────────────────
export const getEmployees = async () => {
  const res = await api.get("/employees");
  return Array.isArray(res) ? res : res?.employees || res?.rows || [];
};
export const getEmployee = (id: string) => api.get(`/employees/${id}`);
export const createEmployee = (data: any) => api.post("/employees", data);
export const updateEmployeeStatus = (id: string, employmentStatus: "ACTIVE" | "INACTIVE") =>
  api.patch(`/employees/${id}/status`, { employmentStatus });

// ── Departments / Shifts ──────────────────────────────
export const getDepartments = async () => {
  const res = await api.get("/departments");
  return Array.isArray(res) ? res : res?.departments || res?.rows || [];
};
export const getShifts = async () => {
  const res = await api.get("/shifts");
  return Array.isArray(res) ? res : res?.shifts || res?.rows || [];
};

// ── Cards ─────────────────────────────────────────────
export const getCards = async () => {
  const res = await api.get("/cards");
  return Array.isArray(res) ? res : res?.cards || res?.rows || [];
};
export const registerCard = (cardUid: string) => api.post("/cards", { cardUid });
export const blockCard = (id: string) => api.post(`/cards/${id}/block`);
export const assignCard = (id: string, employeeId: string) => api.post(`/cards/${id}/assign`, { employeeId });
export const replaceCard = (id: string, newCardUid: string) => api.post(`/cards/${id}/replace`, { newCardUid });
export const reportLostCard = () => api.post("/cards/me/report-lost");

// ── Devices ───────────────────────────────────────────
export const getDevices = async () => {
  const res = await api.get("/devices");
  return Array.isArray(res) ? res : res?.devices || res?.rows || [];
};

// ── Attendance events (raw punches) ───────────────────
export const getEvents = (params?: { employeeId?: string; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.employeeId) qs.set("employeeId", params.employeeId);
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api.get(`/attendance-events${suffix}`);
};

// ── Attendance records (processed) ────────────────────
export const getAttendance = (params?: { date?: string; from?: string; to?: string }) => {
  const qs = new URLSearchParams();
  if (params?.date) qs.set("date", params.date);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api.get(`/attendance${suffix}`);
};
export const getAttendanceSummary = (date?: string) =>
  api.get(`/attendance/summary${date ? `?date=${date}` : ""}`);

// ── Corrections ───────────────────────────────────────
export const getCorrections = async () => {
  const res = await api.get("/corrections");
  return Array.isArray(res) ? res : res?.corrections || res?.rows || [];
};
export const requestCorrection = (data: {
  attendanceRecordId: string;
  correctionType: string;
  oldValue?: string;
  newValue: string;
  reason: string;
}) => api.post("/corrections", data);
export const decideCorrection = (id: string, decision: "APPROVED" | "REJECTED") =>
  api.post(`/corrections/${id}/decision`, { decision });

// ── Audit logs ─────────────────────────────────────────
export const getAuditLogs = async () => {
  const res = await api.get("/audit-logs");
  return Array.isArray(res) ? res : res?.logs || res?.auditLogs || res?.rows || [];
};

// ── Reports ───────────────────────────────────────────
export const getDailyReport = (date?: string) => api.get(`/reports/daily${date ? `?date=${date}` : ""}`);
export const getMonthlyReport = (month?: string) => api.get(`/reports/monthly${month ? `?month=${month}` : ""}`);
export const getDepartmentReport = (date?: string) => api.get(`/reports/departments${date ? `?date=${date}` : ""}`);
export const getTeamReport = (month?: string) => api.get(`/reports/team${month ? `?month=${month}` : ""}`);
export const getManagerReport = (month?: string) => api.get(`/reports/manager${month ? `?month=${month}` : ""}`);