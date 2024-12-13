import { compareAsc } from "date-fns";
import { z } from "zod";
import { validateBool } from "~/utils/validation";

export const logsSchema = z
	.object({
		title: z.string().optional(),
		content: z.string().optional(),
		startTime: z.date(),
		endTime: z.date(),
		isBillable: z.string().transform(validateBool),
		isAbsent: z.string().transform(validateBool),
		clientId: z.string().min(1, "Client ID is required"),
		projectId: z.string().min(1, "Project ID is required"),
		modifiedById: z.string().min(1, "Modified by ID is required"),
		logId: z.string().optional(),
		version: z.number().default(1),
	})
	.superRefine((data, ctx) => {
		if (!data.isAbsent || data.isBillable) {
			if (compareAsc(data.endTime, data.startTime) === 0) {
				ctx.addIssue({
					message:
						"Please select a valid time range, start and end time are required.",
					path: ["endTime"],
					code: z.ZodIssueCode.custom,
				});
			}

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
