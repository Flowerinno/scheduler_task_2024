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
import { Form, useFetcher, useSubmit } from "@remix-run/react";
import { TextInput } from "./TextInput";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
	createActivitySchema,
	CreateActivitySchema,
} from "~/schema/projectSchema";
import React, { useCallback } from "react";

import { formatDate, toDate } from "date-fns";
import { Label } from "./ui/label";
import { ROLE } from "~/types";

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
	selectedDate: Date | undefined;
};

export function AddActivityPopup({
	isModalOpen,
	onModalOpenChange,
	projectId,
	client,
	createdById,
	selectedDate,
}: AddActivityPopup) {
	const fetcher = useFetcher();
	const submit = useSubmit();

	const formattedSelectedDate = formatDate(
		selectedDate ? toDate(selectedDate) : toDate(new Date()),
		"yyyy-MM-dd"
	);

	const [form, fields] = useForm<CreateActivitySchema>({
		defaultValue: {
			title: "",
			content: "",
			isAbsent: false,
			isBillable: true,
			startTime: formattedSelectedDate,
			endTime: formattedSelectedDate,
			createdById,
			projectId,
			clientId: client.id,
		},
		shouldValidate: "onSubmit",
		onValidate: ({ formData }) => {
			return parseWithZod(formData, { schema: createActivitySchema });
		},
	});

	const onModalSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			const formData = new FormData(event.currentTarget);

			const object = {
				name: formData.get("name"),
				description: formData.get("description"),
			};

			submit(JSON.stringify(object), {
				method: "POST",
				action: "/api/",
				encType: "application/json",
				navigate: false,
			});

			onModalOpenChange(false);
		},
		[fetcher, onModalOpenChange]
	);

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
				<Form
					id={form.id}
					className="flex flex-col gap-4"
					navigate={false}
					onSubmit={onModalSubmit}
				>
					<TextInput
						name={fields.title.name}
						placeholder="Activity title"
						error={fields.title.errors}
						required
					/>

					<TextInput
						name={fields.content.name}
						placeholder="Activity desciption"
						error={fields.content.errors}
					/>

					<div className="flex gap-2 items-center">
						<Checkbox
							id={fields.isAbsent.id}
							name={fields.isAbsent.name}
							title="Is Billable"
						/>
						<Label htmlFor={fields.isAbsent.id} className="cursor-pointer">
							Mark as Absent?
						</Label>
					</div>

					<div className="flex gap-2 items-center cursor-pointer">
						<Checkbox id={fields.isBillable.id} name={fields.isBillable.name} />
						<Label htmlFor={fields.isBillable.id} className="cursor-pointer">
							Mark as Billable?
						</Label>
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
				</Form>
			</DialogContent>
		</Dialog>
	);
}
