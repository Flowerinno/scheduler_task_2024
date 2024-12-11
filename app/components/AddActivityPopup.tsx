import { Button } from "./ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { useFetcher } from "@remix-run/react";
import { TextInput } from "./TextInput";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import React, { useCallback, useState } from "react";
import { formatDate, toDate } from "date-fns";
import { Label } from "./ui/label";
import { ROLE } from "~/types";
import { StateTimeType, TimePicker } from "./TimePicker";
import { useToast } from "~/hooks/use-toast";
import { logsSchema } from "~/schema/logsSchema";
import { Log } from "@prisma/client";

type AddActivityPopup = {
	isModalOpen: boolean;
	onModalOpenChange: (open: boolean) => void;
	projectId: string;
	createdById: string;
	client: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: ROLE;
	};
	selectedDate: Date;
	foundLog: Log | undefined;
};

type Time = {
	startTime: Date | undefined;
	endTime: Date | undefined;
};

export function AddActivityPopup({
	isModalOpen,
	onModalOpenChange,
	projectId,
	client,
	createdById,
	selectedDate,
	foundLog,
}: AddActivityPopup) {
	const fetcher = useFetcher<{ message: string }>();

	const { toast } = useToast();

	const [timeState, setTimeState] = useState<Time>({
		startTime: foundLog?.startTime || undefined,
		endTime: foundLog?.endTime || undefined,
	});

	const formattedSelectedDate = formatDate(
		selectedDate ? toDate(selectedDate) : toDate(new Date()),
		"yyyy-MM-dd"
	);

	const [form, fields] = useForm({
		defaultValue: {
			title: "",
			content: "",
			isAbsent: "false",
			isBillable: "false",
			startTime: undefined,
			endTime: undefined,
			modifiedById: createdById,
			projectId,
			clientId: client.id,
			version: foundLog?.version || 1,
		},
		shouldValidate: "onSubmit",
		onValidate: ({ formData }) => {
			return parseWithZod(formData, { schema: logsSchema });
		},
		onSubmit: (event) => {
			onModalSubmit(event);
		},
	});

	const startTime = timeState.startTime || selectedDate;
	const endTime = timeState.endTime || selectedDate;

	const onModalSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (!startTime || !endTime) return;

			const formData = new FormData(event.currentTarget);

			formData.set(
				"isAbsent",
				formData.get("isAbsent") === "on" ? "true" : "false"
			);
			formData.set(
				"isBillable",
				formData.get("isBillable") === "on" ? "true" : "false"
			);
			formData.append("startTime", startTime.toISOString());
			formData.append("endTime", endTime.toISOString());
			formData.append("projectId", projectId);
			formData.append("clientId", client.id);
			formData.append("modifiedById", createdById);

			if (foundLog) {
				formData.append("logId", foundLog.id);
				formData.append("version", foundLog.version.toString());
			}

			const submission = parseWithZod(formData, { schema: logsSchema });

			if (submission.status !== "success") {
				toast({
					title: "Please fill in the required fields.",
				});
				return;
			}

			fetcher.submit(formData, {
				method: "POST",
				action: "/api/projects/logs",
			});

			onModalOpenChange(false);
		},
		[timeState.endTime, timeState.startTime, onModalOpenChange]
	);

	const handleTimeChange = (type: StateTimeType, time: Date) => {
		if (type === "endTime" && time < startTime) {
			toast({
				title: "End time cannot be less than start time",
				variant: "destructive",
			});
			return;
		}

		setTimeState((prev) => ({
			...prev,
			[type]: time,
		}));
	};

	if (!isModalOpen) return null;

	return (
		<Dialog open={isModalOpen} onOpenChange={onModalOpenChange}>
			<DialogContent className="w-full h-7/12">
				<DialogHeader className="*:text-black">
					<DialogTitle>Activity for {formattedSelectedDate}</DialogTitle>
					<DialogDescription>
						Note, this activity will be added to the client's calendar
					</DialogDescription>
				</DialogHeader>
				<fetcher.Form
					id={form.id}
					noValidate
					method="POST"
					action="/api/projects/logs"
					className="flex flex-col gap-4"
					onSubmit={form.onSubmit}
				>
					<TextInput
						name={fields.title.name}
						placeholder="Activity title (optional)"
						error={fields.title.errors}
						defaultValue={foundLog?.title !== "Untitled" ? foundLog?.title : ""}
					/>

					<TextInput
						name={fields.content.name}
						placeholder="Activity desciption (optional)"
						error={fields.content.errors}
						defaultValue={foundLog?.content !== "-" ? foundLog?.content : ""}
					/>

					<div className="flex gap-2 items-center">
						<Checkbox
							id={fields.isAbsent.id}
							name={fields.isAbsent.name}
							defaultChecked={foundLog?.isAbsent ? true : false}
						/>
						<Label htmlFor={fields.isAbsent.id} className="cursor-pointer">
							Mark as Absent?
						</Label>
					</div>

					<div className="flex gap-2 items-center cursor-pointer">
						<Checkbox
							id={fields.isBillable.id}
							name={fields.isBillable.name}
							defaultChecked={foundLog?.isBillable ? true : false}
						/>
						<Label htmlFor={fields.isBillable.id} className="cursor-pointer">
							Mark as Billable?
						</Label>
					</div>

					<div className="flex  gap-2">
						<TimePicker
							title="Start time"
							date={startTime}
							onDateChange={handleTimeChange}
							type="startTime"
						/>
						<TimePicker
							title="End time"
							date={endTime}
							onDateChange={handleTimeChange}
							type="endTime"
						/>
					</div>

					<input name="createdById" value={createdById} type="hidden" />

					<DialogFooter className="justify-end">
						<Button type="submit" variant="default" className="text-white">
							Create
						</Button>

						<DialogClose asChild>
							<Button type="button" variant="secondary">
								Close
							</Button>
						</DialogClose>
					</DialogFooter>
				</fetcher.Form>
			</DialogContent>
		</Dialog>
	);
}
