import { z } from "zod";

export const logsSchema = z
	.object({
		title: z.string().optional(),
		content: z.string().optional(),
		startTime: z.date(),
		endTime: z.date(),
		isBillable: z.boolean().optional(),
		isAbsent: z.boolean().optional(),
		clientId: z.string().min(1, "Client ID is required"),
		projectId: z.string().min(1, "Project ID is required"),
		modifiedById: z.string().min(1, "Modified by ID is required"),
		logId: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (!data.isAbsent) {
			if (!data.startTime) {
				ctx.addIssue({
					message: "Start time is required",
					path: ["startTime"],
					code: z.ZodIssueCode.custom,
				});
			}

			if (!data.endTime) {
				ctx.addIssue({
					message: "End time is required",
					path: ["endTime"],
					code: z.ZodIssueCode.custom,
				});
			}
		}
	});

export type LogsSchema = z.infer<typeof logsSchema>;
