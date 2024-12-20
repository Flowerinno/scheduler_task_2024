import { ActionFunctionArgs, data } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ERROR_MESSAGES } from "~/constants/errors";
import { HTTP_STATUS } from "~/constants/general";
import { RESPONSE_MESSAGE } from "~/constants/messages";
import { authenticateAdmin } from "~/middleware/authenticateRoute";
import {
	attachTag,
	detachTag,
	inviteUserToProject,
	removeClientFromProject,
	updateRole,
} from "~/services/client.server";
import { getSession } from "~/services/session.server";
import { ROLE } from "~/types";
import {
	nullableResponseWithMessage,
	setErrorMessage,
	setSuccessMessage,
	setToastMessageCookie,
} from "~/utils/message/message.server";

type Action =
	| "updateRole"
	| "deleteClient"
	| "createClient"
	| "addTag"
	| "removeTag";

export const action = async ({ request }: ActionFunctionArgs) => {
	const session = await getSession(request.headers.get("cookie"));

	try {
		const contentType = request.headers.get("content-type");

		if (contentType?.includes("application/json")) {
			const body = await request.json();

			if (body.action === "createClient") {
				if (
					body.clients &&
					Array.isArray(body.clients) &&
					body.clients?.length >= 1
				) {
					for (const client of body.clients) {
						await inviteUserToProject(
							body.name,
							client.id,
							body.createdById,
							body.projectId,
							session
						);
					}

					return await nullableResponseWithMessage(session);
				}
			}
		} else if (contentType?.includes("application/x-www-form-urlencoded")) {
			const formData = await request.formData();

			const action = formData.get("action") as Action;
			invariant(action, "Action is required");

			const clientId = formData.get("clientId") as string;
			invariant(clientId, "Client ID is required");

			const userId = formData.get("userId") as string;
			invariant(userId, "User ID is required");

			const projectId = formData.get("projectId") as string;
			invariant(projectId, "Project ID is required");

			const tagId = formData.get("tagId") as string;

			await authenticateAdmin(userId, projectId);

			if (action === "updateRole") {
				return await updateRole(
					clientId,
					formData.get("role") as ROLE,
					session
				);
			}

			if (action === "deleteClient") {
				return removeClientFromProject(clientId, session);
			}

			if (action === "addTag") {
				invariant(tagId, "Tag ID is required");
				return await attachTag(clientId, tagId, projectId, session);
			}

			if (action === "removeTag") {
				invariant(tagId, "Tag ID is required");
				return await detachTag(clientId, tagId, projectId, session);
			}
		} else {
			throw new Error("Unsupported content type");
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
