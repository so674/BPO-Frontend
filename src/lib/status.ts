import type { AttendanceStatus, CardStatus, DeviceStatus } from "../types";

export const statusMeta: Record<AttendanceStatus, { label: string; color: string; dot: string }> = {
  PRESENT: { label: "Present", color: "text-status-present bg-status-present/10 border-status-present/30", dot: "bg-status-present" },
  LATE: { label: "Late", color: "text-status-late bg-status-late/10 border-status-late/30", dot: "bg-status-late" },
  ABSENT: { label: "Absent", color: "text-status-absent bg-status-absent/10 border-status-absent/30", dot: "bg-status-absent" },
  MISSING_PUNCH: { label: "Missing Punch", color: "text-status-missing bg-status-missing/10 border-status-missing/30", dot: "bg-status-missing" },
  ON_LEAVE: { label: "On Leave", color: "text-status-leave bg-status-leave/10 border-status-leave/30", dot: "bg-status-leave" },
  HOLIDAY: { label: "Holiday", color: "text-status-holiday bg-status-holiday/10 border-status-holiday/30", dot: "bg-status-holiday" },
  WEEK_OFF: { label: "Week Off", color: "text-status-holiday bg-status-holiday/10 border-status-holiday/30", dot: "bg-status-holiday" },
  CORRECTED: { label: "Corrected", color: "text-status-corrected bg-status-corrected/10 border-status-corrected/30", dot: "bg-status-corrected" },
};

export const cardStatusMeta: Record<CardStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "text-status-present bg-status-present/10 border-status-present/30" },
  UNASSIGNED: { label: "Unassigned", color: "text-steel-400 bg-steel-500/10 border-line" },
  BLOCKED: { label: "Blocked", color: "text-status-absent bg-status-absent/10 border-status-absent/30" },
  RETIRED: { label: "Retired", color: "text-status-missing bg-status-missing/10 border-status-missing/30" },
};

export const deviceStatusMeta: Record<DeviceStatus, { label: string; color: string; dot: string }> = {
  ONLINE: { label: "Online", color: "text-status-present", dot: "bg-status-present" },
  WARNING: { label: "Degraded", color: "text-status-late", dot: "bg-status-late" },
  OFFLINE: { label: "Offline", color: "text-status-absent", dot: "bg-status-absent" },
};

export function formatMinutes(mins: number | null) {
  if (mins === null) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function formatTime(iso: string | null) {
  if (!iso) return "—";
  return iso.slice(11, 16);
}

export function formatDateLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}
