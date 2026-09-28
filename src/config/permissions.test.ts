import { expect, test } from "vitest";
import { PERMISSIONS, can, permissionsForRole } from "@/config/permissions";

test("super admin receives the full permission catalog", () => {
  const granted = permissionsForRole("SUPER_ADMIN");
  expect(can(granted, PERMISSIONS.WITHDRAWAL_APPROVE)).toBe(true);
  expect(can(granted, PERMISSIONS.USER_BAN)).toBe(true);
  expect(can(granted, PERMISSIONS.SPORT_VIEW)).toBe(true);
  expect(can(granted, PERMISSIONS.EVENT_VIEW)).toBe(true);
  expect(can(granted, PERMISSIONS.WALLET_VIEW)).toBe(true);
  expect(can(granted, PERMISSIONS.TRANSACTION_VIEW)).toBe(true);
  expect(can(granted, PERMISSIONS.DEPOSIT_VIEW)).toBe(true);
  expect(can(granted, PERMISSIONS.DEPOSIT_APPROVE)).toBe(true);
  expect(can(granted, PERMISSIONS.REFERRAL_VIEW)).toBe(true);
  expect(can(granted, PERMISSIONS.REFERRAL_COMMISSION_VIEW)).toBe(true);
  expect(can(granted, PERMISSIONS.REFERRAL_CONFIG_VIEW)).toBe(true);
  expect(can(granted, PERMISSIONS.REFERRAL_CONFIG_UPDATE)).toBe(true);
  expect(can([], PERMISSIONS.USER_VIEW)).toBe(false);
  expect(can(["REFERRAL_VIEW"], PERMISSIONS.REFERRAL_CONFIG_UPDATE)).toBe(false);
});
