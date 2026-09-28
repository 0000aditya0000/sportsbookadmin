import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email."),
  password: z.string().min(8, "Enter your password."),
});

export const twoFactorSchema = z.object({
  challengeId: z.string().min(8),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
