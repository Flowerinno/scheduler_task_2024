import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Label } from "~/components/ui/label";
import { UserActivityList } from "~/components/UserActivityList";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import {
	getAllActivities,
	getProjectActivitiesById,
} from "~/services/project.server";

export const meta: MetaFunction = () => {
	return [
		{ title: "My Activities | Scheduler" },
		{ name: "description", content: "Projects Activities" },
	];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await authenticateRoute({ request } as LoaderFunctionArgs);

	invariant(user, "User session is missing");

	const searchParams = new URL(request.url).searchParams;

	const projectId = searchParams.get("projectId");
	const take = searchParams.get("take");

	let logs = [];

	if (!projectId) {
		logs = await getAllActivities(user.id, take ? +take : 31);
	} else {
		logs = await getProjectActivitiesById(
			projectId,
			user.id,
			take ? +take : 31
		);
	}

	return { logs };
};

export default function MyActivities() {
	const { logs } = useLoaderData<typeof loader>();

	if (logs.length === 0) {
		return (
			<div className="p-10">
				<Label>No logs yet.</Label>
			</div>
		);
	}

	//@ts-expect-error
	return <UserActivityList<typeof logs> logs={logs} />;
}
