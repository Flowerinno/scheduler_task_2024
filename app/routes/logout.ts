import { redirect, ActionFunctionArgs } from "@remix-run/node";
import { ROUTES } from "~/constants/routes";
import { authenticator } from "~/services/auth.server";
import {
	commitSession,
	destroySession,
	getSession,
} from "~/services/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const session = await getSession(request.headers.get("cookie"));

		let headers = new Headers({ "Set-Cookie": await destroySession(session) });

		return redirect(ROUTES.login, { headers });
	} catch (error) {
		return redirect(ROUTES.login);
	}
};
