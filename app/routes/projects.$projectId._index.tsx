import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	redirect,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { getClientProjectById, removeProject } from "~/services/project.server";
import { ROUTES } from "~/constants/routes";
import { Link, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
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
import { ERROR_MESSAGES } from "~/constants/errors";
import { HTTP_STATUS } from "~/constants/general";

const ROLE_COLOR_MAPPER = {
	ADMIN: "text-red-500",
	MANAGER: "text-yellow-500",
	USER: "text-green-500",
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();

		const projectId = formData.get("projectId");
		invariant(projectId, "Project ID is required");
		const userId = formData.get("userId");
		invariant(userId, "User ID is required");

		await authenticateAdmin(userId as string, projectId as string);

		const res = await removeProject(projectId as string, userId as string);
		invariant(res, "Project not found");

		return redirect(ROUTES.projects);
	} catch (error) {
		return {
			message: ERROR_MESSAGES.generalError,
			status: HTTP_STATUS.NOT_FOUND,
		};
	}
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	try {
		const user = await authenticateRoute({ request } as LoaderFunctionArgs);
		invariant(user, "User session is missing");

		const projectId = params.projectId;
		invariant(projectId, "Project ID is required");

		const project = await getClientProjectById(projectId, user.id);
		invariant(project, "Project not found");

		const foundClient = project.clientsOnProjects.find(({ client }) => {
			return client.userId === user.id;
		});

		if (!foundClient) {
			throw redirect(ROUTES.projects);
		}

		return { project, client: foundClient?.client, user };
	} catch (error) {
		return redirect(ROUTES.projects);
	}
};

//TODO calculate logged hours on client side
export default function Project() {
	const { project, client, user } = useLoaderData<typeof loader>();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const fetcher = useFetcher();

	const pathName = useLocation().pathname;

	const loggedMonthHours = 0; //TODO hh/mm format

	const loggedTotalHours = 0; //TODO hh/mm format

	const activityLink = `${ROUTES.myActivities}?projectId=${project.id}`;

	const onProjectRemoval = () => {
		const formData = new FormData();

		formData.append("projectId", project.id);
		formData.append("userId", user.id);

		fetcher.submit(formData, {
			method: "POST",
		});
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
							<Link className="text-white" to={activityLink}>
								View activities
							</Link>
						</Button>
						{client.role === ROLE.ADMIN && (
							<>
								<Button
									className="text-white"
									variant={"default"}
									onClick={() => setIsModalOpen(true)}
								>
									Invite members
								</Button>

								<Button
									className="text-white"
									variant={"destructive"}
									onClick={() => setIsAlertOpen(true)}
								>
									Delete project
								</Button>
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
						<Label className="text-xl font-[400]">Logged Last Month</Label>
						<br />
						<span className="text-black text-4xl self-center">
							{loggedMonthHours} / h
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

			<div className="flex flex-col gap-2">
				<Label className="text-2xl">Team members: </Label>
				<Separator />
				{project.clientsOnProjects.map((c) => {
					const to =
						c.client.userId === user.id || client.role === "USER"
							? "#"
							: `${pathName}/team/${c.client.id}`;
					return (
						<Link key={c.client.userId} to={to}>
							<Label className="text-base cursor-pointer hover:underline hover:text-blue-300 transition-colors duration-150">
								{c.client.firstName} {c.client.lastName} | {c.client.email} |{" "}
								<span className={`${ROLE_COLOR_MAPPER[c.client.role]}`}>
									{c.client.role}
								</span>
							</Label>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
