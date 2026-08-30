// Talks to the Express backend. Every page imports functions from here instead of
// reading from src/data/mock.ts directly.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let authToken: string | null = localStorage.getItem("pulse_token");

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem("pulse_token", token);
  else localStorage.removeItem("pulse_token");
}

export function getToken() {
  return authToken;
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: ApiValidationError = new Error(body.error || `Request failed: ${res.status}`);
    if (body.details) err.details = body.details;
    throw err;
  }

  // 204 No Content etc.
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: unknown) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path: string, body?: unknown) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
};

// Shape of a Zod validation failure returned by the backend (see errorHandler.js).
export interface ApiValidationError extends Error {
  details?: { path: (string | number)[]; message: string }[];
}

// ── Auth ──────────────────────────────────────────────
export function login(email: string, password: string) {
  return api.post("/auth/login", { email, password }) as Promise<{
    token: string;
    user: { id: string; name: string; email: string; role: string; employeeId: string };
  }>;
}

export function fetchMe() {
  return api.get("/auth/me") as Promise<{
    user: { id: string; name: string; role: string; employeeId: string };
  }>;
}

// ── Employees ─────────────────────────────────────────
export const getEmployees = () => api.get("/employees");
export const getEmployee = (id: string) => api.get(`/employees/${id}`);
export interface NewEmployeeInput {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  designation?: string;
  shiftId: string;
  managerId?: string | null;
  joiningDate: string; // YYYY-MM-DD
}
export const createEmployee = (data: NewEmployeeInput) => api.post("/employees", data);
export const updateEmployeeStatus = (id: string, employmentStatus: "ACTIVE" | "INACTIVE") =>
  api.patch(`/employees/${id}/status`, { employmentStatus });

// ── Departments / Shifts ──────────────────────────────
export const getDepartments = () => api.get("/departments");
export const getShifts = () => api.get("/shifts");

// ── Cards ─────────────────────────────────────────────
export const getCards = () => api.get("/cards");
export const registerCard = (cardUid: string) => api.post("/cards", { cardUid });
export const blockCard = (id: string) => api.post(`/cards/${id}/block`);
export const assignCard = (id: string, employeeId: string) => api.post(`/cards/${id}/assign`, { employeeId });
export const replaceCard = (id: string, newCardUid: string) => api.post(`/cards/${id}/replace`, { newCardUid });
export const reportLostCard = () => api.post("/cards/me/report-lost");

// ── Devices ───────────────────────────────────────────
export const getDevices = () => api.get("/devices");

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
export const getCorrections = () => api.get("/corrections");
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
export const getAuditLogs = () => api.get("/audit-logs");

// ── Reports ───────────────────────────────────────────
export const getMonthlyReport = (month?: string) => api.get(`/reports/monthly${month ? `?month=${month}` : ""}`);
export const getDepartmentReport = (date?: string) => api.get(`/reports/departments${date ? `?date=${date}` : ""}`);
