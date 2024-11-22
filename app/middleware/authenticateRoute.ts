import { ROUTES } from "~/constants/routes";
import { authenticator } from "~/services/auth.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

const notAuthenticatedRoutes = [ROUTES.login, ROUTES.logout, ROUTES.register];

type Request = LoaderFunctionArgs | ActionFunctionArgs;

export const authenticateRoute = async ({ request }: Request) => {
	const pathName = new URL(request.url).pathname as ROUTES;

	if (!notAuthenticatedRoutes.includes(pathName)) {
		const user = await authenticator.isAuthenticated(request);

		if (!user) {
			return false;
		}

		return true;
	}

	return true;
};
