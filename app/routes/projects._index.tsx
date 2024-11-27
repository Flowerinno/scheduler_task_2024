import { LoaderFunctionArgs } from "@remix-run/node";
import { ROUTES } from "~/constants/routes";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import { getUserProjects } from "~/services/project.server";
import { Link, useLoaderData } from "@remix-run/react";
import { Label } from "~/components/ui/label";
import { formatDate } from "date-fns";
import { Separator } from "~/components/ui/separator";
import React from "react";
import invariant from "tiny-invariant";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await authenticateRoute({ request } as LoaderFunctionArgs);

	invariant(user, "User is not authenticated");

	const projects = await getUserProjects(user.id);

	return { projects, user };
};

export default function Projects() {
	const { projects } = useLoaderData<typeof loader>();

	if (!projects || projects?.length === 0) {
		return (
			<div className="p-10 w-full">
				<Label className="text-black">No projects yet</Label>
			</div>
		);
	}

	return (
		<div className="*:text-black p-10 w-full flex flex-col gap-4">
			{projects?.map((p, i) => {
				return (
					<React.Fragment key={p.project.id}>
						<Link
							to={ROUTES.project + p.project.id}
							className="border-[1px] border-gray-400 w-full rounded-md p-4 cursor-pointer hover:bg-gray-100 transition-all duration-150 flex items-center justify-between"
						>
							<div className="flex flex-col gap-2">
								<div className="flex gap-1">
									<Label className="font-bold">{p.project.name} |</Label>
									<Label className="font-bold">Role: {p.client.role}</Label>
								</div>
								<div className="flex gap-1 &:text-sm *:text-gray-400">
									<Label className="">
										Description: {p.project.description} |
									</Label>
									<Label>
										Created at: {formatDate(p.project.createdAt, "dd/MM/yyyy")}{" "}
										|
									</Label>
									<Label>
										Joined at: {formatDate(p.client.createdAt, "dd/MM/yyyy")}
									</Label>
								</div>
							</div>
							<div>
								<Label className="text-blue-500">
									Members:{" "}
									{
										//@ts-expect-error
										p.teamCount
									}
								</Label>
							</div>
						</Link>
						{i !== projects.length - 1 && <Separator />}
					</React.Fragment>
				);
			})}
		</div>
	);
}
