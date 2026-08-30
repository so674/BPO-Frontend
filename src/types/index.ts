// Types mirror Section 11 (Data Architecture) of the BPO RFID master document.
// Keeping these close to the spec means the UI and the future backend agree on shape.

export type Role = "HR" | "MANAGER" | "CEO" | "EMPLOYEE";

export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "ABSENT"
  | "MISSING_PUNCH"
  | "ON_LEAVE"
  | "HOLIDAY"
  | "WEEK_OFF"
  | "CORRECTED";

export type CardStatus = "UNASSIGNED" | "ACTIVE" | "BLOCKED" | "RETIRED";

export type DeviceStatus = "ONLINE" | "OFFLINE" | "WARNING";

export type DeviceType = "ENTRY" | "EXIT";

export interface Department {
  id: string;
  name: string;
  headCount: number;
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
  departmentId: string;
  designation: string;
  shiftId: string;
  employmentStatus: "ACTIVE" | "INACTIVE";
  joiningDate: string;
  managerId?: string;
  avatarSeed: string;
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
  punchIn: string | null;
  punchOut: string | null;
  workingMinutes: number | null;
  lateMinutes: number;
  status: AttendanceStatus;
}

export interface Correction {
  id: string;
  attendanceRecordId: string;
  employeeId: string;
  correctionType: "PUNCH_IN" | "PUNCH_OUT" | "STATUS";
  oldValue: string;
  newValue: string;
  reason: string;
  requestedBy: string;
  approvedBy: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
  employeeId: string;
}
