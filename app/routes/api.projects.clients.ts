import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ERROR_MESSAGES } from "~/constants/errors";

import { authenticateAdmin } from "~/middleware/authenticateRoute";
import { clientApiSchema } from "~/schema/projectSchema";
import {
	attachTag,
	detachTag,
	removeClientFromProject,
	updateRole,
} from "~/services/client.server";
import { getSession } from "~/services/session.server";
import { ROLE } from "~/types";
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
		const formData = await request.formData();

		const submission = parseWithZod(formData, { schema: clientApiSchema });

		if (submission.status !== "success") {
			setErrorMessage(session, ERROR_MESSAGES.wrongPayload);
			return submission.reply();
		}

		const { action, clientId, userId, projectId, tagId } = submission.value;

		await authenticateAdmin(userId, projectId);

		if (action === ClientActions.UPDATE_ROLE) {
			return await updateRole(clientId, formData.get("role") as ROLE, session);
		}

		if (action === ClientActions.DELETE_CLIENT) {
			return removeClientFromProject(clientId, session);
		}

		if (action === ClientActions.ADD_TAG) {
			invariant(tagId, ERROR_MESSAGES.tagIdRequired);
			return await attachTag(clientId, tagId, projectId, session);
		}

		if (action === ClientActions.REMOVE_TAG) {
			invariant(tagId, ERROR_MESSAGES.tagIdRequired);
			return await detachTag(clientId, tagId, projectId, session);
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
