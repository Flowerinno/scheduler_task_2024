import { z } from "zod";

export const inviteClientsSchema = z.object({
	createdById: z.string().min(1, "Created by ID must be at least 1 character"),
	projectId: z.string().min(1, "Project ID must be at least 1 character"),
	name: z.string().min(1, "Name must be at least 1 character"),
	action: z.enum(["createClient"]),
	clients: z.array(
		z.object({
			id: z.string().min(1, "Client ID must be at least 1 character"),
			email: z.string().email("Invalid email address format"),
		})
	),
});

export type InviteClientsSchema = z.infer<typeof inviteClientsSchema>;
