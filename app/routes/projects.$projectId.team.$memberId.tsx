import { LoaderFunctionArgs } from "@remix-run/node";
import {
	Link,
	useFetcher,
	useLoaderData,
	useLocation,
	useNavigate,
	useSearchParams,
} from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { DayContentProps } from "react-day-picker";
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
import {
	authenticateAdmin,
	authenticateRoute,
} from "~/middleware/authenticateRoute";
import { getClientForMonth } from "~/services/client.server";
import { AddActivityPopup } from "~/components/AddActivityPopup";

import { ROLE } from "~/types";
import { Button } from "~/components/ui/button";
import { Alert } from "~/components/Alert";
import { Log } from "@prisma/client";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

import {
	calculateDuration,
	calculateMonthLogs,
} from "~/utils/date/dateFormatter";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const memberId = params.memberId; // client id
	const projectId = params.projectId;

	invariant(memberId, "Member ID is required");
	invariant(projectId, "Project ID is required");

	const user = await authenticateRoute({ request } as LoaderFunctionArgs);
	invariant(user, "User session is missing");

	const admin = await authenticateAdmin(user.id, projectId);
	invariant(admin, "Not authorized");

	const query = new URL(request.url).searchParams;

	const queryDate = query.get("date");

	const date = queryDate ? new Date(queryDate) : new Date();

	const data = await getClientForMonth(memberId, projectId, 31, date);
	invariant(data?.clientInfo, "Client not found");
	invariant(data?.totalDuration, "Client not found");

	return {
		clientInfo: data.clientInfo,
		totalDuration: data.totalDuration?._sum.duration,
		user,
		admin,
	};
};

export default function TeamMember() {
	const { clientInfo, totalDuration, admin, user } =
		useLoaderData<typeof loader>();

	const [date, setDate] = useState<Date>();
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [searchParams] = useSearchParams();

	const shownDate = searchParams.get("date")
		? new Date(searchParams.get("date") as string)
		: new Date();

	const pathName = useLocation().pathname;
	const backRoute = pathName.replace(/\/team\/.*/, "");

	const project = clientInfo.clientsOnProjects[0].project;

	const onSelect = (date: Date) => {
		setDate(date);
		setIsModalOpen(true);
	};

	const voidSelection = (date: Date) => {};

	const isAdmin = admin.clientsOnProjects[0].client.role === ROLE.ADMIN;

	const fetcher = useFetcher();

	const navigate = useNavigate();

	const removeClient = (clientId: string) => {
		const formData = new FormData();
		formData.append("action", "deleteClient");
		formData.append("clientId", clientId);
		formData.append("userId", user.id);
		formData.append("projectId", project.id);

		fetcher.submit(formData, {
			method: "POST",
			action: "/api/projects/clients",
		});

		setIsAlertOpen(false);
		navigate(backRoute);
	};

	const logs = clientInfo.clientsOnProjects[0].project.log;

	const customComponents = {
		DayContent: (props: DayContentProps) => (
			<DayContent {...props} logs={logs} />
		),
	};

	const loggedMonthHours = calculateMonthLogs(logs, shownDate);

	const loggedTotalHours = calculateDuration(totalDuration);

	let foundLog;

	if (date) {
		foundLog = logs.find(
			(log) =>
				new Date(log.startTime).toDateString() === new Date(date).toDateString()
		);
	}

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
					foundLog={foundLog}
				/>
			)}
			<Alert
				onAlertOpenChange={setIsAlertOpen}
				isAlertOpen={isAlertOpen}
				title={`Remove ${clientInfo.firstName} from the project`}
				description="Are you sure you want to remove this member from the project? You can invite them back at any time."
				onAccept={() => removeClient(clientInfo.id)}
			/>
			<Link to={backRoute}>
				<ArrowLeft className="absolute top-4 left-4 cursor-pointer text-black" />
			</Link>
			<div className="flex gap-2 items-center">
				<Label className="text-2xl">
					{clientInfo.firstName} {clientInfo.lastName} -{" "}
				</Label>
				Í
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
				<Button
					className="text-red-500 h-6 text-xs"
					variant={"outline"}
					onClick={() => setIsAlertOpen(true)}
				>
					Remove from project
				</Button>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-2xl">{clientInfo.firstName}'s summary</Label>
				<Separator />
				<div className="flex justify-center gap-12">
					<div className="flex flex-col">
						<Label className="text-xl font-[400]">Logged Current Month</Label>
						<br />
						<span className="text-black text-4xl self-center">
							{loggedMonthHours}:00 / h
						</span>
					</div>
					<Separator orientation="vertical" className="min-h-24" />
					<div className="flex flex-col">
						<Label className="text-xl font-[400">Logged Total</Label>
						<br />
						<span className="text-black text-4xl self-center">
							{loggedTotalHours || 0} / h
						</span>
					</div>
				</div>
				<Separator />
			</div>

			<CalendarComponent
				mode="single"
				selected={date}
				onSelect={isAdmin ? onSelect : voidSelection}
				activities={clientInfo.clientsOnProjects[0].project.log}
				customComponents={customComponents}
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

const DayContent = ({ logs, ...props }: DayContentProps & { logs: Log[] }) => {
	const log = logs.find(
		(entry) =>
			new Date(entry.startTime).toDateString() === props.date.toDateString()
	);

	const overview = log ? "" : "No Activities";

	const duration = calculateDuration(log?.duration);

	return (
		<div className="flex flex-col items-start justify-start p-1">
			<div className="text-sm font-normal">{props.date.getDate()}</div>
			<div className="w-full flex flex-col gap-1 items-start">
				<Label className={cn([log ? "" : "text-gray-400"])}>{overview}</Label>
				{duration && (
					<Label className={cn([log?.duration ? "text-gray-500" : ""])}>
						Duration: <strong className="text-black">{duration}</strong>
					</Label>
				)}
				<Label className={cn([log?.isAbsent ? "text-red-400" : ""])}>
					{log?.isAbsent ? "Absent" : ""}
				</Label>
				<Label className={cn(["text-green-300"])}>
					{!log?.isAbsent && log?.isBillable && "Billable"}
				</Label>
			</div>
		</div>
	);
};
