import { Log } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Label } from "~/components/ui/label";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import {
	getAllActivities,
	getProjectActivitiesById,
} from "~/services/project.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const user = await authenticateRoute({ request } as LoaderFunctionArgs);

	invariant(user, "User session is missing");

	const projectId = params.projectId;

	let logs: Log[] = [];

	if (!projectId) {
		logs = await getAllActivities(user.id);
	} else {
		logs = await getProjectActivitiesById(projectId, user.id);
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

	return <div className="p-10"></div>;
}
