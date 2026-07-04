export const DEMO_NOW = new Date("2026-03-27T09:00:00");

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatFriendlyDate(dateString) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export function formatFriendlyDateTime(dateString) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function parseAppointmentDateTime(date, time) {
  const [clock, meridiem] = time.split(" ");
  const [hourPart, minutePart] = clock.split(":").map(Number);
  let hours = hourPart;

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  const parsed = new Date(`${date}T00:00:00`);
  parsed.setHours(hours, minutePart, 0, 0);
  return parsed;
}

export function isUpcomingAppointment(appointment) {
  return (
    ["Requested", "Confirmed"].includes(appointment.status) &&
    parseAppointmentDateTime(appointment.appointmentDate, appointment.appointmentSlot) >= DEMO_NOW
  );
}

export function sortAppointmentsNewestFirst(appointments) {
  return [...appointments].sort(
    (left, right) =>
      parseAppointmentDateTime(right.appointmentDate, right.appointmentSlot) -
      parseAppointmentDateTime(left.appointmentDate, left.appointmentSlot),
  );
}
