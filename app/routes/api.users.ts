import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ROUTES } from "~/constants/routes";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import { getUsersByEmail } from "~/services/user.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const { searchParams } = new URL(request.url);
	const email = searchParams.get("email");
	const isAuthorized = authenticateRoute({ request } as LoaderFunctionArgs);

	if (!isAuthorized) {
		return redirect(ROUTES.login);
	}

	if (!email) {
		return { users: [] };
	}

	const users = await getUsersByEmail(email);

	return { users };
};
