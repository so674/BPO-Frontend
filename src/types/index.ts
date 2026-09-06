// Types mirror the BPO Attendance system architecture and backend API responses.

export type Role = "HR" | "MANAGER" | "CEO" | "EMPLOYEE" | "ADMIN";

export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "ABSENT"
  | "MISSING_PUNCH"
  | "ON_LEAVE"
  | "HOLIDAY"
  | "WEEK_OFF"
  | "CORRECTED"
  | "NOT_CHECKED_IN";

export type CardStatus = "UNASSIGNED" | "ACTIVE" | "BLOCKED" | "RETIRED";

export type DeviceStatus = "ONLINE" | "OFFLINE" | "WARNING";

export type DeviceType = "ENTRY" | "EXIT";

export interface Department {
  id: string;
  name: string;
  headCount?: number;
}

export interface Shift {
  id: string;
  name: string;
  start: string; // HH:mm
  end: string; // HH:mm
  graceMinutes: number;
}

export interface Employee {
  id: string;
  employeeCode: string; // e.g. EMP1025
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  designation?: string;
  shiftId: string;
  employmentStatus: "ACTIVE" | "INACTIVE";
  joiningDate: string;
  managerId?: string | null;
  avatarSeed?: string;
}

export interface RfidCard {
  id: string;
  cardUid: string; // e.g. CARD-45821
  employeeId: string | null;
  status: CardStatus;
  assignedAt?: string;
  activatedAt?: string;
  blockedAt?: string;
}

export interface RfidDevice {
  id: string;
  deviceCode: string; // e.g. ENTRY-01
  name: string;
  location: string;
  type: DeviceType;
  status: DeviceStatus;
  lastSeenAt: string;
}

export interface AttendanceEvent {
  id: string;
  eventUid: string; // e.g. EVT-10001
  employeeId: string;
  cardId: string;
  deviceId: string;
  eventType: "PUNCH_IN" | "PUNCH_OUT";
  eventTimestamp: string;
  receivedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  attendanceDate: string;
  checkIn?: string | null;
  checkOut?: string | null;
  workingMinutes?: number | null;
  lateMinutes?: number;
  status: AttendanceStatus;
}

export interface Correction {
  id: string;
  attendanceRecordId: string;
  employeeId: string;
  correctionType: "PUNCH_IN" | "PUNCH_OUT" | "STATUS";
  oldValue?: string;
  newValue: string;
  reason: string;
  requestedBy: string;
  approvedBy?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
}

export interface AuditLog {
  id: number | string;
  user_id?: string | null;
  userId?: string | null;
  action: string;
  details?: string | null;
  ip_address?: string | null;
  ipAddress?: string | null;
  created_at?: string;
  createdAt?: string;
}

export interface HrDashboardMetrics {
  date: string;
  metrics: {
    totalEmployees: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
    pendingLeaves: number;
    pendingOvertime: number;
  };
}

export interface EmployeeDashboardMetrics {
  employeeId: string;
  todayStatus: AttendanceStatus;
  todayDetails?: AttendanceRecord | null;
  monthlyPresentDays: number;
}

export interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  role: Role;
  employeeId: string;
}