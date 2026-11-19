import type { Tone } from "@/ui";
import type { AppointmentStatus } from "@/types";

/** Pastel tone used for each appointment status across badges and calendar events. */
export const STATUS_TONE: Record<AppointmentStatus, Tone> = {
  booked: "sky",
  confirmed: "lime",
  checkedIn: "lilac",
  inSession: "ink",
  completed: "mint",
  cancelled: "peach",
  noShow: "sand",
};

export const TIME_SLOTS = [
  "08:00", "08:45", "09:30", "10:15", "11:00", "11:45", "13:00", "13:45", "14:30", "15:15", "16:00", "16:45",
];
