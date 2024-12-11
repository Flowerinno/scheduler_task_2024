import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import { getUsersByEmail } from "~/services/user.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const { searchParams } = new URL(request.url);
	const email = searchParams.get("email");

	await authenticateRoute({ request } as LoaderFunctionArgs);

	if (!email) {
		return { users: [] };
	}

	const users = await getUsersByEmail(email);

	return { users };
};
