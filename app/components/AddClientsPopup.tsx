import { Button } from "./ui/button";
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

import { SearchField } from "./SearchField";
import React, { useCallback, useState } from "react";
import { User } from "@prisma/client";
import { BadgeItem } from "./BadgeItem";
import { AuthUser } from "~/services/auth.server";

type AddClientsPopupProps = {
	isModalOpen: boolean;
	onModalOpenChange: (open: boolean) => void;
	userData: AuthUser;
	projectId: string;
	projectName: string;
};

type AddedUsers = {
	id: string;
	email: string;
};

export function AddClientsPopup({
	isModalOpen,
	onModalOpenChange,
	userData,
	projectId,
	projectName,
}: AddClientsPopupProps) {
	const [addedUsers, setAddedUsers] = useState<AddedUsers[]>([]);

	const fetcher = useFetcher();
	const submit = useSubmit();

	const removeAddedUser = (id: string) => {
		setAddedUsers((prev) => prev.filter((user) => user.id !== id));
	};

	const onItemSelect = (item: Omit<User, "password">) => {
		if (addedUsers.some((user) => user.id === item.id)) {
			return;
		}
		setAddedUsers((prev) => [...prev, { id: item.id, email: item.email }]);
	};

	const onModalSubmit = useCallback(() => {
		if (!addedUsers.length) return;

		const object = {
			createdById: userData?.id,
			projectId,
			clients: addedUsers,
			name: projectName,
			action: "createClient",
		};

		submit(JSON.stringify(object), {
			method: "POST",
			action: "/api/projects/clients",
			encType: "application/json",
			navigate: false,
		});

		setAddedUsers([]);
		onModalOpenChange(false);
	}, [addedUsers, fetcher, onModalOpenChange]);

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
					className="flex flex-col gap-4"
					navigate={false}
					onSubmit={onModalSubmit}
				>
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
										key={user.id}
										onClick={() => removeAddedUser(user.id)}
										title={user.email}
									/>
								);
							})}
					</div>

					<DialogFooter className="justify-end">
						<Button type="submit" variant="default" className="text-white">
							Invite
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
