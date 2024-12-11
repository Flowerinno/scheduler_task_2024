import { z } from "zod";

export const inboxSchema = z.object({
	projectId: z.string().optional(),
	notificationId: z.string().min(1, "Notification ID is required"),
	action: z.enum(["answer", "remove"]),
	answer: z.string().optional(),
});
