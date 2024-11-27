import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import invariant from "tiny-invariant";
import { CalendarComponent } from "~/components/Calendar";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import { getClientInfoById } from "~/services/client.server";
import { AddActivityPopup } from "~/components/AddActivityPopup";

import { ROLE } from "~/types";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const memberId = params.memberId; // client id
	const projectId = params.projectId;

	invariant(memberId, "Member ID is required");
	invariant(projectId, "Project ID is required");

	const user = await authenticateRoute({ request } as LoaderFunctionArgs);
	invariant(user, "User session is missing");

	const clientInfo = await getClientInfoById(memberId, projectId);
	invariant(clientInfo, "Client not found");

	return { clientInfo, user };
};

export default function TeamMember() {
	const { clientInfo, user } = useLoaderData<typeof loader>();

	const [date, setDate] = useState<Date | DateRange>();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const pathName = useLocation().pathname;
	const backRoute = pathName.replace(/\/team\/.*/, "");

	const project = clientInfo.clientsOnProjects[0].project;

	const onSelect = (date: Date | DateRange) => {
		setDate(date);
		setIsModalOpen(true);
	};

	const voidSelection = (date: Date | DateRange) => {};

	const isAdmin = project.createdById === user.id;

	return (
		<div className="p-10 relative flex flex-col gap-12 w-full">
			{isModalOpen && (
				<AddActivityPopup
					isModalOpen={isModalOpen}
					onModalOpenChange={setIsModalOpen}
					client={{
						id: clientInfo.id,
						firstName: clientInfo.firstName,
						lastName: clientInfo.lastName,
						email: clientInfo.email,
						role: clientInfo.role as ROLE,
					}}
					projectId={project.id}
					createdById={user.id}
					selectedDate={date as Date}
				/>
			)}
			<Link to={backRoute}>
				<ArrowLeft className="absolute top-4 left-4 cursor-pointer text-black" />
			</Link>
			<div className="flex gap-2 items-center">
				<Label className="text-2xl">
					{clientInfo.firstName} {clientInfo.lastName} -{" "}
				</Label>
				<Label className="font-bold text-2xl text-gray-400">
					{clientInfo.clientsOnProjects[0].project.name}
				</Label>
				{isAdmin && (
					<RoleSelector
						role={clientInfo.role as ROLE}
						clientId={clientInfo.id}
						userId={user.id}
						projectId={project.id}
					/>
				)}
			</div>

			<CalendarComponent
				mode="single"
				selected={date}
				onSelect={isAdmin ? onSelect : voidSelection}
			/>
		</div>
	);
}

const RoleSelector = ({
	role,
	clientId,
	userId,
	projectId,
}: {
	role: ROLE;
	clientId: string;
	userId: string;
	projectId: string;
}) => {
	const fetcher = useFetcher();

	const onSelect = (role: ROLE) => {
		const formData = new FormData();

		formData.append("role", role);
		formData.append("action", "updateRole");
		formData.append("clientId", clientId);
		formData.append("userId", userId);
		formData.append("projectId", projectId);

		fetcher.submit(formData, {
			method: "POST",
			action: "/api/projects/clients",
		});
	};

	return (
		<fetcher.Form>
			<Select
				name="role"
				value={role}
				onValueChange={(r) => onSelect(r as ROLE)}
			>
				<SelectTrigger className="w-[120px] h-[25px]">
					<SelectValue placeholder={role} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Change member role</SelectLabel>
						<SelectItem value={ROLE.USER}>{ROLE.USER}</SelectItem>
						<SelectItem value={ROLE.MANAGER}>{ROLE.MANAGER}</SelectItem>
						<SelectItem value={ROLE.ADMIN}>{ROLE.ADMIN}</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</fetcher.Form>
	);
};
