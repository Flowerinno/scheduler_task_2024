import { ROUTES } from "~/constants/routes";
import { authenticator, AuthUser } from "~/services/auth.server";
import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
} from "@remix-run/node";
import { ROLE } from "~/types";
import prisma from "~/lib/prisma";

const notAuthenticatedRoutes = [ROUTES.login, ROUTES.logout, ROUTES.register];

type Request = LoaderFunctionArgs | ActionFunctionArgs;

export const authenticateRoute = async ({
	request,
}: Request): Promise<AuthUser> => {
	const pathName = new URL(request.url).pathname as ROUTES;
	const user = await authenticator.isAuthenticated(request);

	if (!notAuthenticatedRoutes.includes(pathName) && !user) {
		throw redirect(ROUTES.login);
	}

	return user;
};

export const authenticateAdmin = async (userId: string, projectId: string) => {
	try {
		const adminClient = await prisma.client.findFirstOrThrow({
			where: {
				projectId,
				userId,
				role: ROLE.ADMIN,
			},
		});

		return adminClient;
	} catch (error) {
		throw redirect(ROUTES.login);
	}
};

export const authenticateAdminOrManager = async (
	userId: string,
	projectId: string
) => {
	try {
		const client = await prisma.client.findFirstOrThrow({
			where: {
				projectId,
				userId,
				role: {
					in: [ROLE.MANAGER, ROLE.ADMIN],
				},
			},
		});

		return client;
	} catch (error) {
		throw redirect(ROUTES.login);
	}
};
