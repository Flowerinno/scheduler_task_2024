import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ROUTES } from "~/constants/routes";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import { authenticator } from "~/services/auth.server";
import { getUserProjects } from "~/services/project.server";
import { useLoaderData } from "@remix-run/react";
import { Label } from "~/components/ui/label";
import { format, formatDate } from "date-fns";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const isAuth = await authenticateRoute({ request } as LoaderFunctionArgs);

	if (!isAuth) {
		return redirect(ROUTES.login);
	}

	const user = await authenticator.isAuthenticated(request);

	if (!user) {
		return redirect(ROUTES.login);
	}

	const projects = await getUserProjects(user.id);

	return { projects };
};

export default function Projects() {
	const { projects } = useLoaderData<typeof loader>();
	console.log(projects, "projects");

	if (!projects || projects?.length === 0) {
		return (
			<div className="p-10 w-full">
				<Label className="text-black">Not projects yet</Label>
			</div>
		);
	}

	return (
		<div className="*:text-black p-10 w-full">
			{projects?.map((p) => {
				return (
					<div
						key={p.project.id}
						className="border-[1px] border-gray-400 w-full rounded-md p-4 cursor-pointer hover:bg-gray-100 transition-all duration-150 flex items-center justify-between"
					>
						<div className="flex flex-col gap-2">
							<div className="flex gap-1">
								<Label className="font-bold">{p.project.name} |</Label>
								<Label className="font-bold">Role: {p.client.role}</Label>
							</div>
							<div className="flex gap-1 &:text-sm *:text-gray-400">
								<Label className="">
									Description:{p.project.description} |
								</Label>
								<Label>
									Created at: {formatDate(p.project.createdAt, "dd/MM/yyyy")} |
								</Label>
								<Label>
									Joined at: {formatDate(p.client.createdAt, "dd/MM/yyyy")} |
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
					</div>
				);
			})}
		</div>
	);
}
