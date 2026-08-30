import type {
  AttendanceEvent,
  AttendanceRecord,
  AuditLog,
  Correction,
  CurrentUser,
  Department,
  Employee,
  RfidCard,
  RfidDevice,
  Shift,
} from "../types";

export const departments: Department[] = [
  { id: "dept-cx", name: "Customer Experience", headCount: 48 },
  { id: "dept-tech", name: "Technical Support", headCount: 32 },
  { id: "dept-fin", name: "Finance Ops", headCount: 14 },
  { id: "dept-hr", name: "HR & Admin", headCount: 9 },
  { id: "dept-qa", name: "Quality & Training", headCount: 11 },
];

export const shifts: Shift[] = [
  { id: "shift-day", name: "Day Shift", start: "09:00", end: "18:00", graceMinutes: 10 },
  { id: "shift-night", name: "Night Shift", start: "21:00", end: "06:00", graceMinutes: 15 },
  { id: "shift-early", name: "Early Shift", start: "06:00", end: "15:00", graceMinutes: 10 },
];

const firstNames = [
  "Ananya", "Rohit", "Priya", "Karan", "Meera", "Arjun", "Simran", "Vikram",
  "Neha", "Aditya", "Divya", "Sanjay", "Ishita", "Rahul", "Pooja", "Farhan",
  "Tanvi", "Manish", "Ritu", "Aman", "Sneha", "Devansh", "Kavya", "Yusuf",
];
const lastNames = [
  "Sharma", "Verma", "Iyer", "Khan", "Nair", "Gupta", "Reddy", "Das",
  "Chatterjee", "Bose", "Malhotra", "Joshi",
];

export const employees: Employee[] = Array.from({ length: 24 }).map((_, i) => {
  const dept = departments[i % departments.length];
  const first = firstNames[i % firstNames.length];
  const last = lastNames[i % lastNames.length];
  return {
    id: `emp-${i + 1}`,
    employeeCode: `EMP${1000 + i}`,
    firstName: first,
    lastName: last,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@bpocorp.com`,
    departmentId: dept.id,
    designation: i % 6 === 0 ? "Team Lead" : "Associate",
    shiftId: shifts[i % shifts.length].id,
    employmentStatus: i === 22 ? "INACTIVE" : "ACTIVE",
    joiningDate: `202${3 + (i % 3)}-0${(i % 9) + 1}-1${i % 9}`,
    managerId: i % 6 === 0 ? undefined : `emp-${(Math.floor(i / 6)) * 6 + 1}`,
    avatarSeed: `${first}${last}${i}`,
  };
});

export const rfidCards: RfidCard[] = employees.map((emp, i) => ({
  id: `card-${i + 1}`,
  cardUid: `CARD-${45820 + i}`,
  employeeId: emp.id,
  status: i === 5 ? "BLOCKED" : i === 22 ? "RETIRED" : "ACTIVE",
  assignedAt: emp.joiningDate,
  activatedAt: emp.joiningDate,
  blockedAt: i === 5 ? "2026-08-20" : undefined,
}));
// a couple of spare unassigned cards sitting in inventory
rfidCards.push(
  { id: "card-spare-1", cardUid: "CARD-45999", employeeId: null, status: "UNASSIGNED" },
  { id: "card-spare-2", cardUid: "CARD-46000", employeeId: null, status: "UNASSIGNED" },
);

export const rfidDevices: RfidDevice[] = [
  { id: "dev-1", deviceCode: "ENTRY-01", name: "Main Entrance Reader", location: "Main Entrance", type: "ENTRY", status: "ONLINE", lastSeenAt: "2026-08-27T09:58:02" },
  { id: "dev-2", deviceCode: "EXIT-01", name: "Main Exit Reader", location: "Main Entrance", type: "EXIT", status: "ONLINE", lastSeenAt: "2026-08-27T09:57:41" },
  { id: "dev-3", deviceCode: "ENTRY-02", name: "West Wing Reader", location: "West Wing Lobby", type: "ENTRY", status: "WARNING", lastSeenAt: "2026-08-27T09:12:18" },
  { id: "dev-4", deviceCode: "EXIT-02", name: "West Wing Exit", location: "West Wing Lobby", type: "EXIT", status: "OFFLINE", lastSeenAt: "2026-08-27T07:40:55" },
  { id: "dev-5", deviceCode: "ENTRY-03", name: "Basement Parking Reader", location: "Basement Parking", type: "ENTRY", status: "ONLINE", lastSeenAt: "2026-08-27T09:55:30" },
];

const statusPool: AttendanceRecord["status"][] = [
  "PRESENT", "PRESENT", "PRESENT", "PRESENT", "LATE", "LATE", "ABSENT", "MISSING_PUNCH", "ON_LEAVE",
];

function timeOnDate(date: string, hhmm: string) {
  return `${date}T${hhmm}:00`;
}

export const attendanceRecords: AttendanceRecord[] = [];
export const attendanceEvents: AttendanceEvent[] = [];

const today = new Date("2026-08-27T00:00:00");
const dayLabels: string[] = [];
for (let d = 6; d >= 0; d--) {
  const dt = new Date(today);
  dt.setDate(today.getDate() - d);
  dayLabels.push(dt.toISOString().slice(0, 10));
}

let eventCounter = 10001;
let recordCounter = 1;

employees
  .filter((e) => e.employmentStatus === "ACTIVE")
  .forEach((emp, empIdx) => {
    dayLabels.forEach((date, dayIdx) => {
      const isWeekend = new Date(date).getDay() === 0;
      let status = statusPool[(empIdx + dayIdx) % statusPool.length];
      if (isWeekend) status = "WEEK_OFF";

      let punchIn: string | null = null;
      let punchOut: string | null = null;
      let workingMinutes: number | null = null;
      let lateMinutes = 0;

      if (status === "PRESENT" || status === "LATE") {
        const inHour = status === "LATE" ? "09:2" + ((empIdx % 5)) : "08:5" + (empIdx % 9 % 6);
        punchIn = timeOnDate(date, inHour.length === 5 ? inHour : "09:05");
        punchOut = timeOnDate(date, "18:1" + (empIdx % 5));
        workingMinutes = 540 - (status === "LATE" ? 20 : 0);
        lateMinutes = status === "LATE" ? 15 + (empIdx % 10) : 0;

        attendanceEvents.push({
          id: `evt-${eventCounter}`,
          eventUid: `EVT-${eventCounter++}`,
          employeeId: emp.id,
          cardId: rfidCards.find((c) => c.employeeId === emp.id)?.id ?? "",
          deviceId: "dev-1",
          eventType: "PUNCH_IN",
          eventTimestamp: punchIn,
          receivedAt: punchIn,
        });
        attendanceEvents.push({
          id: `evt-${eventCounter}`,
          eventUid: `EVT-${eventCounter++}`,
          employeeId: emp.id,
          cardId: rfidCards.find((c) => c.employeeId === emp.id)?.id ?? "",
          deviceId: "dev-2",
          eventType: "PUNCH_OUT",
          eventTimestamp: punchOut,
          receivedAt: punchOut,
        });
      } else if (status === "MISSING_PUNCH") {
        punchIn = timeOnDate(date, "09:10");
        attendanceEvents.push({
          id: `evt-${eventCounter}`,
          eventUid: `EVT-${eventCounter++}`,
          employeeId: emp.id,
          cardId: rfidCards.find((c) => c.employeeId === emp.id)?.id ?? "",
          deviceId: "dev-1",
          eventType: "PUNCH_IN",
          eventTimestamp: punchIn,
          receivedAt: punchIn,
        });
      }

      attendanceRecords.push({
        id: `rec-${recordCounter++}`,
        employeeId: emp.id,
        attendanceDate: date,
        punchIn,
        punchOut,
        workingMinutes,
        lateMinutes,
        status,
      });
    });
  });

export const corrections: Correction[] = [
  {
    id: "corr-1",
    attendanceRecordId: attendanceRecords.find((r) => r.status === "MISSING_PUNCH")?.id ?? "rec-1",
    employeeId: employees[3].id,
    correctionType: "PUNCH_OUT",
    oldValue: "—",
    newValue: "18:05",
    reason: "Exit reader (EXIT-02) was offline; security log confirms exit at 18:05.",
    requestedBy: "Priya Verma (HR)",
    approvedBy: null,
    status: "PENDING",
    createdAt: "2026-08-27T11:02:00",
  },
  {
    id: "corr-2",
    attendanceRecordId: attendanceRecords[10]?.id ?? "rec-2",
    employeeId: employees[7].id,
    correctionType: "STATUS",
    oldValue: "ABSENT",
    newValue: "ON_LEAVE",
    reason: "Approved sick leave submitted retroactively with medical certificate.",
    requestedBy: "Priya Verma (HR)",
    approvedBy: "Rahul Sharma (HR Manager)",
    status: "APPROVED",
    createdAt: "2026-08-25T15:20:00",
  },
  {
    id: "corr-3",
    attendanceRecordId: attendanceRecords[15]?.id ?? "rec-3",
    employeeId: employees[12].id,
    correctionType: "PUNCH_IN",
    oldValue: "09:45",
    newValue: "08:58",
    reason: "Card misread on first tap; second valid tap logged 2 minutes later at correct time.",
    requestedBy: "Ananya Sharma (HR)",
    approvedBy: "Rahul Sharma (HR Manager)",
    status: "APPROVED",
    createdAt: "2026-08-24T10:15:00",
  },
];

export const auditLogs: AuditLog[] = [
  { id: "aud-1", actorUserId: "Ananya Sharma (HR)", action: "CARD_BLOCKED", entityType: "RfidCard", entityId: "CARD-45825", oldValue: "ACTIVE", newValue: "BLOCKED", timestamp: "2026-08-20T14:32:00" },
  { id: "aud-2", actorUserId: "Rahul Sharma (HR Manager)", action: "CORRECTION_APPROVED", entityType: "AttendanceRecord", entityId: "rec-2", oldValue: "ABSENT", newValue: "ON_LEAVE", timestamp: "2026-08-25T15:22:00" },
  { id: "aud-3", actorUserId: "System", action: "DEVICE_OFFLINE", entityType: "RfidDevice", entityId: "EXIT-02", oldValue: "ONLINE", newValue: "OFFLINE", timestamp: "2026-08-27T07:40:55" },
  { id: "aud-4", actorUserId: "Priya Verma (HR)", action: "EMPLOYEE_STATUS_CHANGED", entityType: "Employee", entityId: "EMP1022", oldValue: "ACTIVE", newValue: "INACTIVE", timestamp: "2026-08-18T09:00:00" },
  { id: "aud-5", actorUserId: "Ananya Sharma (HR)", action: "CARD_REPLACED", entityType: "RfidCard", entityId: "CARD-46000", oldValue: "UNASSIGNED", newValue: "ASSIGNED", timestamp: "2026-08-19T11:10:00" },
  { id: "aud-6", actorUserId: "Rahul Sharma (HR Manager)", action: "SHIFT_UPDATED", entityType: "Shift", entityId: "shift-night", oldValue: "grace=10m", newValue: "grace=15m", timestamp: "2026-08-15T16:45:00" },
];

export const demoUsers: CurrentUser[] = [
  { id: "u-hr", name: "Ananya Sharma", role: "HR", employeeId: "emp-1" },
  { id: "u-mgr", name: "Rohit Verma", role: "MANAGER", employeeId: "emp-1" },
  { id: "u-ceo", name: "Meera Nair", role: "CEO", employeeId: "emp-13" },
  { id: "u-emp", name: "Karan Iyer", role: "EMPLOYEE", employeeId: "emp-4" },
];

export function departmentName(id: string) {
  return departments.find((d) => d.id === id)?.name ?? id;
}
export function shiftName(id: string) {
  return shifts.find((s) => s.id === id)?.name ?? id;
}
export function employeeName(id: string) {
  const e = employees.find((x) => x.id === id);
  return e ? `${e.firstName} ${e.lastName}` : id;
}
export function employeeById(id: string) {
  return employees.find((x) => x.id === id);
}
