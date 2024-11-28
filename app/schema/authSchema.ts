import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("Invalid email address format"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	action: z.enum(["login"]),
});

export const registerSchema = z.object({
	email: z.string().email("Invalid email address format"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	action: z.enum(["register"]),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;