import { z } from "zod";

export const createProjectSchema = z.object({
	name: z.string().min(4, "Project name must be at least 4 characters"),
	description: z.string(),
	clients: z
		.array(
			z.object({
				email: z.string().email("Invalid email address"),
				id: z.string(),
			})
		)
		.or(z.tuple([])),
	createdById: z.string().min(1, "Invalid creator ID"),
});

export const createActivitySchema = z.object({
	title: z.string().optional(),
	content: z.string().optional(),
	startTime: z.date(),
	endTime: z.date(),
	isBillable: z.boolean(),
	isAbsent: z.boolean(),
	projectId: z.string(),
	createdById: z.string(),
	clientId: z.string(),
});

export const clientApiSchema = z.object({
	action: z.enum(["updateRole", "deleteClient", "createClient"]),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type CreateActivitySchema = z.infer<typeof createActivitySchema>;
export type ClientApiSchema = z.infer<typeof clientApiSchema>;
