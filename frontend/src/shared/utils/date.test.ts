import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  isOverdue,
  formatDuration,
} from "./date";

// Mock current date for consistent tests
const MOCK_DATE = new Date("2024-06-15T12:00:00Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_DATE);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("date utilities", () => {
  describe("formatDate", () => {
    it("formats dates in default format", () => {
      const date = new Date("2024-06-15T09:30:00Z");
      expect(formatDate(date)).toBe("Jun 15, 2024");
    });

    it("formats date strings", () => {
      expect(formatDate("2024-06-15T09:30:00Z")).toBe("Jun 15, 2024");
    });

    it("handles custom formats", () => {
      const date = new Date("2024-06-15T09:30:00Z");
      expect(formatDate(date, "yyyy-MM-dd")).toBe("2024-06-15");
      expect(formatDate(date, "MMM dd")).toBe("Jun 15");
    });

    it("handles invalid dates", () => {
      expect(formatDate("invalid-date")).toBe("Invalid Date");
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
    });
  });

  describe("formatDateTime", () => {
    it("formats date and time", () => {
      const date = new Date("2024-06-15T09:30:00Z");
      expect(formatDateTime(date)).toBe("Jun 15, 2024 at 9:30 AM");
    });

    it("handles different time zones", () => {
      const date = new Date("2024-06-15T21:30:00Z");
      expect(formatDateTime(date)).toBe("Jun 15, 2024 at 9:30 PM");
    });

    it("handles date strings", () => {
      expect(formatDateTime("2024-06-15T14:30:00Z")).toBe(
        "Jun 15, 2024 at 2:30 PM",
      );
    });
  });

  describe("formatRelativeTime", () => {
    it("formats recent times", () => {
      const oneMinuteAgo = new Date(MOCK_DATE.getTime() - 60 * 1000);
      expect(formatRelativeTime(oneMinuteAgo)).toBe("1 minute ago");

      const fiveMinutesAgo = new Date(MOCK_DATE.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe("5 minutes ago");
    });

    it("formats hours ago", () => {
      const oneHourAgo = new Date(MOCK_DATE.getTime() - 60 * 60 * 1000);
      expect(formatRelativeTime(oneHourAgo)).toBe("1 hour ago");

      const twoHoursAgo = new Date(MOCK_DATE.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe("2 hours ago");
    });

    it("formats days ago", () => {
      const oneDayAgo = new Date(MOCK_DATE.getTime() - 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneDayAgo)).toBe("1 day ago");

      const threeDaysAgo = new Date(
        MOCK_DATE.getTime() - 3 * 24 * 60 * 60 * 1000,
      );
      expect(formatRelativeTime(threeDaysAgo)).toBe("3 days ago");
    });

    it("formats future times", () => {
      const inOneHour = new Date(MOCK_DATE.getTime() + 60 * 60 * 1000);
      expect(formatRelativeTime(inOneHour)).toBe("in 1 hour");

      const tomorrow = new Date(MOCK_DATE.getTime() + 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(tomorrow)).toBe("in 1 day");
    });

    it("handles just now", () => {
      const now = new Date(MOCK_DATE.getTime());
      expect(formatRelativeTime(now)).toBe("just now");

      const fiveSecondsAgo = new Date(MOCK_DATE.getTime() - 5 * 1000);
      expect(formatRelativeTime(fiveSecondsAgo)).toBe("just now");
    });
  });

  describe("isOverdue", () => {
    it("identifies overdue dates", () => {
      const yesterday = new Date(MOCK_DATE.getTime() - 24 * 60 * 60 * 1000);
      expect(isOverdue(yesterday)).toBe(true);

      const lastWeek = new Date(MOCK_DATE.getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(isOverdue(lastWeek)).toBe(true);
    });

    it("identifies non-overdue dates", () => {
      const tomorrow = new Date(MOCK_DATE.getTime() + 24 * 60 * 60 * 1000);
      expect(isOverdue(tomorrow)).toBe(false);

      const nextWeek = new Date(MOCK_DATE.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(isOverdue(nextWeek)).toBe(false);
    });

    it("handles today", () => {
      const today = new Date(MOCK_DATE.getTime());
      expect(isOverdue(today)).toBe(false);

      // Later today should not be overdue
      const laterToday = new Date(MOCK_DATE.getTime() + 2 * 60 * 60 * 1000);
      expect(isOverdue(laterToday)).toBe(false);
    });

    it("handles string dates", () => {
      expect(isOverdue("2024-06-14T12:00:00Z")).toBe(true); // yesterday
      expect(isOverdue("2024-06-16T12:00:00Z")).toBe(false); // tomorrow
    });

    it("handles null/undefined", () => {
      expect(isOverdue(null)).toBe(false);
      expect(isOverdue(undefined)).toBe(false);
    });
  });

  describe("formatDuration", () => {
    it("formats minutes", () => {
      expect(formatDuration(30)).toBe("30 minutes");
      expect(formatDuration(1)).toBe("1 minute");
    });

    it("formats hours and minutes", () => {
      expect(formatDuration(90)).toBe("1 hour 30 minutes");
      expect(formatDuration(120)).toBe("2 hours");
      expect(formatDuration(61)).toBe("1 hour 1 minute");
    });

    it("formats days", () => {
      expect(formatDuration(1440)).toBe("1 day"); // 24 hours
      expect(formatDuration(2880)).toBe("2 days"); // 48 hours
      expect(formatDuration(1500)).toBe("1 day 1 hour"); // 25 hours
    });

    it("handles zero and negative values", () => {
      expect(formatDuration(0)).toBe("0 minutes");
      expect(formatDuration(-30)).toBe("0 minutes"); // Negative durations don't make sense
    });

    it("handles large durations", () => {
      expect(formatDuration(10080)).toBe("1 week"); // 7 days
      expect(formatDuration(10140)).toBe("1 week 1 hour"); // 7 days 1 hour
    });
  });
});
