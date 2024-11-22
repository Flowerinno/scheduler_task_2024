import { Button } from "../ui/button";
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
import { TextInput } from "../TextInput";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { createProjectSchema } from "~/schema/projectSchema";
import { SearchField } from "../SearchField";
import React, { useCallback, useState } from "react";
import { User } from "@prisma/client";
import { BadgeItem } from "../BadgeItem";
import { AuthUser } from "~/services/auth.server";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

type CreateProjectModalProps = {
	isModalOpen: boolean;
	onModalOpenChange: (open: boolean) => void;
	userData: AuthUser;
};

type AddedUsers = {
	id: string;
	email: string;
};

export function CreateProjectModal({
	isModalOpen,
	onModalOpenChange,
	userData,
}: CreateProjectModalProps) {
	const [addedUsers, setAddedUsers] = useState<AddedUsers[]>([]);

	const fetcher = useFetcher();
	const submit = useSubmit();

	const [form, fields] = useForm({
		defaultValue: {
			name: "",
			description: "",
			createdById: userData?.id,
		},
		shouldValidate: "onSubmit",
		onValidate: ({ formData }) => {
			return parseWithZod(formData, { schema: createProjectSchema });
		},
	});

	const removeAddedUser = (id: string) => {
		setAddedUsers((prev) => prev.filter((user) => user.id !== id));
	};

	const onItemSelect = (item: Omit<User, "password">) => {
		if (addedUsers.some((user) => user.id === item.id)) {
			return;
		}
		setAddedUsers((prev) => [...prev, { id: item.id, email: item.email }]);
	};

	const onModalSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			const formData = new FormData(event.currentTarget);
			
			const object = {
				name: formData.get("name"),
				description: formData.get("description"),
				createdById: userData?.id,
				clients: addedUsers,
			};

			submit(JSON.stringify(object), {
				method: "POST",
				action: "/api/projects/create",
				encType: "application/json",
				navigate: false,
			});

			setAddedUsers([]);
			onModalOpenChange(false);
		},
		[addedUsers, fetcher, onModalOpenChange]
	);

	if (!isModalOpen) return null;

	return (
		<Dialog open={isModalOpen} onOpenChange={onModalOpenChange}>
			<DialogContent className="w-full h-7/12">
				<DialogHeader className="*:text-black">
					<DialogTitle>Create new project</DialogTitle>
					<DialogDescription>
						Note, you can invite your team members to collaborate on this
						project.
					</DialogDescription>
				</DialogHeader>
				<Form
					id={form.id}
					// method="POST"
					// action="/api/projects/create"
					className="flex flex-col gap-4"
					navigate={false}
					onSubmit={onModalSubmit}
				>
					<TextInput
						name={fields.name.name}
						placeholder="Project name"
						error={fields.name.errors}
						required
					/>

					<TextInput
						name={fields.description.name}
						placeholder="Project description"
						error={fields.description.errors}
					/>

					<SearchField
						searchableKey="email"
						inputName="email"
						inputPlaceholder="Search for a team member"
						action="/api/users"
						dataKey="users"
						onItemSelect={onItemSelect}
					/>
					<input name="createdById" value={userData?.id} type="hidden" />

					<div className="flex flex-row gap-2 max-w-[400px]">
						{addedUsers.length > 0 &&
							addedUsers.map((user) => {
								return (
									<BadgeItem
										key={user?.id}
										onClick={() => removeAddedUser(user.id)}
										title={user.email}
									/>
								);
							})}
					</div>

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
