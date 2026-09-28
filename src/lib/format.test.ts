import { expect, test } from "vitest";
import { formatAxisRupees, formatElapsed, formatMoney, formatShare } from "@/lib/format";

test("formats Indian rupee minor units without floating point", () => {
  expect(formatMoney({ amountMinor: 485230000, currency: "INR" })).toBe("₹48,52,300.00");
  expect(formatMoney({ amountMinor: 68241000, currency: "INR" })).toBe("₹6,82,410.00");
  expect(formatMoney({ amountMinor: 128450000, currency: "INR" })).toBe("₹12,84,500.00");
  expect(formatMoney({ amountMinor: 314280000, currency: "INR" })).toBe("₹31,42,800.00");
});

test("formats signed amounts from the supplied integer", () => {
  expect(formatMoney({ amountMinor: -845000, currency: "INR" })).toBe("-₹8,450.00");
  expect(formatMoney({ amountMinor: 68241000, currency: "INR" }, { signDisplay: "always" })).toBe(
    "+₹6,82,410.00",
  );
  expect(formatMoney({ amountMinor: 0, currency: "INR" })).toBe("₹0.00");
});

test("formats chart axis rupees as compact labels", () => {
  expect(formatAxisRupees(4_800_000)).toBe("48L");
  expect(formatAxisRupees(682_410)).toBe("6.8L");
  expect(formatAxisRupees(12_500)).toBe("12,500");
  expect(formatAxisRupees(0)).toBe("0");
});

test("formats elapsed time from two supplied timestamps", () => {
  expect(formatElapsed("2026-09-28T08:03:00.000Z", "2026-09-28T08:15:00.000Z")).toBe("Started 12m ago");
  expect(formatElapsed("2026-09-28T07:15:00.000Z", "2026-09-28T08:15:00.000Z")).toBe("Started 1h ago");
});

test("formats basis points for display", () => {
  expect(formatShare(4620)).toBe("46.20");
  expect(formatShare(750)).toBe("7.50");
});
