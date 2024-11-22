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

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
