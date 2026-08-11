/**
 * Date utility functions
 */

// Format a date to a readable string
export function formatDate(
  date: Date | string | null | undefined,
  format: string = "MMM dd, yyyy",
): string {
  if (!date) return "";

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "Invalid Date";

    // Simple format implementation
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    if (format === "yyyy-MM-dd") {
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const dayNum = String(day).padStart(2, "0");
      return `${year}-${monthNum}-${dayNum}`;
    }

    if (format === "MMM dd") {
      return `${month} ${day}`;
    }

    // Default format
    return `${month} ${day}, ${year}`;
  } catch {
    return "Invalid Date";
  }
}

// Format date and time
export function formatDateTime(
  date: Date | string | null | undefined,
  includeSeconds: boolean = false,
): string {
  if (!date) return "";

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "Invalid Date";

    const dateStr = formatDate(d);
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    let timeStr = `${displayHours}:${minutes} ${ampm}`;

    if (includeSeconds) {
      const seconds = String(d.getSeconds()).padStart(2, "0");
      timeStr = `${displayHours}:${minutes}:${seconds} ${ampm}`;
    }

    return `${dateStr} at ${timeStr}`;
  } catch {
    return "Invalid Date";
  }
}

// Format relative time (e.g., "2 hours ago", "in 3 days")
export function formatRelativeTime(date: Date | string): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "Invalid Date";

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    const isFuture = diffMs < 0;
    const prefix = isFuture ? "in " : "";
    const suffix = isFuture ? "" : " ago";

    // Less than 1 minute
    if (diffMinutes === 0) {
      return "just now";
    }

    // Minutes
    if (diffHours === 0) {
      const unit = diffMinutes === 1 ? "minute" : "minutes";
      return `${prefix}${diffMinutes} ${unit}${suffix}`;
    }

    // Hours
    if (diffDays === 0) {
      const unit = diffHours === 1 ? "hour" : "hours";
      return `${prefix}${diffHours} ${unit}${suffix}`;
    }

    // Days
    if (diffWeeks === 0) {
      const unit = diffDays === 1 ? "day" : "days";
      return `${prefix}${diffDays} ${unit}${suffix}`;
    }

    // Weeks
    if (diffMonths === 0) {
      const unit = diffWeeks === 1 ? "week" : "weeks";
      return `${prefix}${diffWeeks} ${unit}${suffix}`;
    }

    // Months
    const unit = diffMonths === 1 ? "month" : "months";
    return `${prefix}${diffMonths} ${unit}${suffix}`;
  } catch {
    return "Invalid Date";
  }
}

// Check if a date is overdue (past current date)
export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return false;

    const now = new Date();
    // Set time to start of day for fair comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const compareDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    return compareDate < today;
  } catch {
    return false;
  }
}

// Format duration in minutes to human readable format
export function formatDuration(minutes: number): string {
  if (minutes < 0) return "0 minutes";
  if (minutes === 0) return "0 minutes";

  const weeks = Math.floor(minutes / (60 * 24 * 7));
  const days = Math.floor((minutes % (60 * 24 * 7)) / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const remainingMinutes = minutes % 60;

  const parts: string[] = [];

  if (weeks > 0) {
    parts.push(`${weeks} ${weeks === 1 ? "week" : "weeks"}`);
  }

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }

  if (remainingMinutes > 0) {
    parts.push(
      `${remainingMinutes} ${remainingMinutes === 1 ? "minute" : "minutes"}`,
    );
  }

  // Return only the first two most significant parts
  return parts.slice(0, 2).join(" ");
}

// Get start and end of day
export function getStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

// Add days to a date
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Subtract days from a date
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

// Check if two dates are the same day
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  try {
    const d1 = typeof date1 === "string" ? new Date(date1) : date1;
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  } catch {
    return false;
  }
}
