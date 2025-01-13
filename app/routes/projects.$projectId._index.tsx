import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
	redirect,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import {
	getClientProjectById,
	getTotalActivityDuration,
	removeProject,
} from "~/services/project.server";
import { ROUTES } from "~/constants/routes";
import {
	Link,
	useFetcher,
	useLoaderData,
	useLocation,
	useNavigate,
	useSearchParams,
} from "@remix-run/react";
import {
	authenticateAdmin,
	authenticateRoute,
} from "~/middleware/authenticateRoute";
import { Label } from "~/components/ui/label";
import { formatDate } from "date-fns";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AddClientsPopup } from "~/components/AddClientsPopup";
import { useState } from "react";
import { ROLE } from "~/types";
import { Alert } from "~/components/Alert";
import {
	calculateDuration,
	calculateMonthLogs,
} from "~/utils/date/dateFormatter";

import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { cn } from "~/lib/utils";
import { CreateTagPopup } from "~/components/CreateTagPopup";
import { Badge } from "~/components/ui/badge";
import { getServerQueryParams } from "~/utils/route/getQueryParams.server";
import { DebouncedInput } from "~/components/DebouncedInput";
import { getSession } from "~/services/session.server";
import { redirectWithSession } from "~/utils/message/message.server";
import { ERROR_MESSAGES } from "~/constants/errors";

const ROLE_COLOR_MAPPER = {
	ADMIN: "text-red-500",
	MANAGER: "text-yellow-500",
	USER: "text-green-500",
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const session = await getSession(request.headers.get("cookie"));

	const formData = await request.formData();

	const projectId = formData.get("projectId");
	invariant(projectId, ERROR_MESSAGES.projectIdRequired);

	const userId = formData.get("userId");
	invariant(userId, ERROR_MESSAGES.userIdRequired);

	await authenticateAdmin(userId as string, projectId as string);

	await removeProject(projectId as string, userId as string, session);

	return await redirectWithSession(ROUTES.projects, session);
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	try {
		const user = await authenticateRoute({ request } as LoaderFunctionArgs);
		invariant(user, ERROR_MESSAGES.cannotAuthenticate);

		const projectId = params.projectId;
		invariant(projectId, ERROR_MESSAGES.projectIdRequired);

		const { search } = getServerQueryParams(["search"], new URL(request.url));

		const project = await getClientProjectById(projectId, user.id, search);
		invariant(project, ERROR_MESSAGES.projectNotFound);

		const duration = await getTotalActivityDuration(user.id, projectId);

		const foundClient = project.clients.find((c) => {
			return c.userId === user.id;
		});

		if (!foundClient) {
			throw redirect(ROUTES.projects);
		}

		return {
			project,
			client: foundClient,
			user,
			totalClientDuration: duration,
		};
	} catch (error) {
		return redirect(ROUTES.projects);
	}
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: `${data?.project.name} project | Scheduler` },
		{ name: "description", content: `${data?.project.name} project overview` },
	];
};

export default function Project() {
	const { project, client, user, totalClientDuration } =
		useLoaderData<typeof loader>();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [isTagModalOpen, setIsTagModalOpen] = useState(false);

	const [toogleGroup, setToogleGroup] = useState<ROLE[]>([]);

	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get("search") || "";

	const fetcher = useFetcher();
	const pathName = useLocation().pathname;
	const navigate = useNavigate();

	const loggedMonthHours = calculateMonthLogs(project.log, new Date());

	const loggedTotalHours = calculateDuration(totalClientDuration) || 0;

	const onProjectRemoval = () => {
		const formData = new FormData();

		formData.append("projectId", project.id);
		formData.append("userId", user.id);

		fetcher.submit(formData, {
			method: "POST",
		});
	};

	const handleToogle = (role: ROLE) => {
		const newToogleGroup = toogleGroup.includes(role)
			? toogleGroup.filter((r) => r !== role)
			: [...toogleGroup, role];

		setToogleGroup(newToogleGroup);
	};

	const handleSearch = (v: string | number) => {
		if (v === "") {
			searchParams.delete("search");
			setSearchParams(searchParams);
			return;
		}

		setSearchParams({ search: String(v) });
	};

	return (
		<div className="w-full p-10 flex flex-col gap-12 relative">
			{isModalOpen && (
				<AddClientsPopup
					isModalOpen={isModalOpen}
					onModalOpenChange={setIsModalOpen}
					userData={user}
					projectId={project.id}
					projectName={project.name}
				/>
			)}
			{isAlertOpen && (
				<Alert
					isAlertOpen={isAlertOpen}
					onAlertOpenChange={setIsAlertOpen}
					onAccept={onProjectRemoval}
					title={`You are about to delete ${project.name} project`}
					description="Are you sure you want to delete this project?"
				/>
			)}
			{isTagModalOpen && (
				<CreateTagPopup
					projectId={project.id}
					isModalOpen={isTagModalOpen}
					onModalOpenChange={setIsTagModalOpen}
				/>
			)}

			<Link to={ROUTES.projects}>
				<ArrowLeft className="absolute top-4 left-4 cursor-pointer text-black" />
			</Link>
			<div>
				<div className="flex gap-1 items-center justify-between pb-5">
					<div>
						<Label className="text-2xl">{project.name} | </Label>
						<Label
							className={`font-bold text-2xl ${ROLE_COLOR_MAPPER[client.role]}`}
						>
							{client.role}
						</Label>
					</div>

					<div className="flex gap-3">
						<Button asChild variant={"default"}>
							<Link
								className="text-white"
								to={`${ROUTES.myActivities}?projectId=${project.id}`}
							>
								View activities
							</Link>
						</Button>

						{(client.role === ROLE.ADMIN || client.role === ROLE.MANAGER) && (
							<Button
								className="text-white bg-purple-300 hover:bg-purple-400"
								variant={"default"}
								onClick={() =>
									navigate(`${ROUTES.projects}/${project.id}/statistics`)
								}
							>
								Statistics
							</Button>
						)}

						{client.role === ROLE.ADMIN && (
							<>
								<Button
									className="text-white"
									variant={"default"}
									onClick={() => setIsTagModalOpen(true)}
								>
									Create tag
								</Button>

								<Button
									className="text-white"
									variant={"default"}
									onClick={() => setIsModalOpen(true)}
								>
									Invite members
								</Button>

								{project.createdBy.id === client.userId && (
									<Button
										className="text-white"
										variant={"destructive"}
										onClick={() => setIsAlertOpen(true)}
									>
										Delete project
									</Button>
								)}
							</>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex gap-1 &:text-sm *:text-gray-400">
						<Label className="">Description: {project.description} |</Label>
						<Label>
							Created at: {formatDate(project.createdAt, "dd/MM/yyyy")} |
						</Label>
						<Label>
							Created by: {project.createdBy.firstName}{" "}
							{project.createdBy.lastName} - {project.createdBy.email} |{" "}
						</Label>
						<Label>
							Joined at: {formatDate(client.createdAt, "dd/MM/yyyy")}
						</Label>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-2xl">My summary</Label>
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
							{loggedTotalHours} / h
						</span>
					</div>
				</div>
				<Separator />
			</div>

			<div className="flex flex-col items-start gap-2">
				<Label className="text-2xl">Team members: </Label>

				<div className="flex gap-2 items-start justify-between w-full">
					<ToggleGroup
						type="multiple"
						className="p-0 m-0 text-sm text-black flex-[0.3] flex justify-start"
					>
						<ToggleGroupItem
							value={ROLE.ADMIN}
							className={cn([ROLE_COLOR_MAPPER.ADMIN, "text-xs"])}
							onClick={() => handleToogle(ROLE.ADMIN)}
						>
							{ROLE.ADMIN}
						</ToggleGroupItem>
						<ToggleGroupItem
							value={ROLE.MANAGER}
							className={cn([ROLE_COLOR_MAPPER.MANAGER, "text-xs"])}
							onClick={() => handleToogle(ROLE.MANAGER)}
						>
							{ROLE.MANAGER}
						</ToggleGroupItem>
						<ToggleGroupItem
							value={ROLE.USER}
							className={cn([ROLE_COLOR_MAPPER.USER, "text-xs"])}
							onClick={() => handleToogle(ROLE.USER)}
						>
							{ROLE.USER}
						</ToggleGroupItem>
					</ToggleGroup>
					<Separator orientation="vertical" />

					<DebouncedInput
						value={search}
						name="search"
						onChange={(e) => handleSearch(e)}
						className="flex-1 focus:no-underline"
						placeholder="Search by name/email/tag"
					/>
				</div>
				<Separator />
				<div className="flex flex-col gap-1">
					{project.clients
						.filter((c) => {
							const isMatch =
								c.firstName.toLowerCase().includes(search.toLowerCase()) ||
								c.lastName.toLowerCase().includes(search.toLowerCase()) ||
								c.email.toLowerCase().includes(search.toLowerCase()) ||
								c.clientsOnTags.some((cot) =>
									cot.tag.name.toLowerCase().includes(search.toLowerCase())
								);

							if (isMatch) {
								return true;
							}
						})
						.map((c) => {
							const to =
								c.userId === user.id || client.role === "USER"
									? "#"
									: `${pathName}/team/${c.id}`;

							if (toogleGroup.length && !toogleGroup.includes(c.role as ROLE)) {
								return null;
							}

							const tags = c.clientsOnTags.map((cot) => cot.tag.name);

							return (
								<Link key={c.userId} to={to}>
									<Label className="text-base cursor-pointer  hover:text-blue-300 transition-colors duration-150 flex items-center gap-1">
										{c.firstName} {c.lastName} | {c.email} |{" "}
										<span className={`${ROLE_COLOR_MAPPER[c.role]}`}>
											{c.role}
										</span>{" "}
										{tags.map((tag) => (
											<Badge
												key={tag}
												className="max-h-[18px] mr-1 no-underline"
												aria-disabled
												variant={"outline"}
											>
												{tag}
											</Badge>
										))}
									</Label>
								</Link>
							);
						})}
				</div>
			</div>
		</div>
	);
}
