import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";

import { ERROR_MESSAGES } from "~/constants/errors";

import { inviteClientsSchema } from "~/schema/clientSchema";

import { inviteUserToProject } from "~/services/client.server";
import { getSession } from "~/services/session.server";
import {
	nullableResponseWithMessage,
	setErrorMessage,
} from "~/utils/message/message.server";

export const ClientActions = {
	UPDATE_ROLE: "updateRole",
	DELETE_CLIENT: "deleteClient",
	ADD_TAG: "addTag",
	REMOVE_TAG: "removeTag",
	CREATE_CLIENT: "createClient",
} as const;

export const action = async ({ request }: ActionFunctionArgs) => {
	const session = await getSession(request.headers.get("cookie"));

	try {
		const body = await request.json();

		const data = inviteClientsSchema.parse(body);

		const { name, createdById, projectId, clients } = data;

		for (const client of clients) {
			await inviteUserToProject(
				name,
				client.id,
				createdById,
				projectId,
				session
			);
		}

		return await nullableResponseWithMessage(session);
	} catch (error) {
		if (error instanceof Error) {
			setErrorMessage(session, error.message);
		} else {
			setErrorMessage(session, ERROR_MESSAGES.generalError);
		}

		return await nullableResponseWithMessage(session);
	}
};
