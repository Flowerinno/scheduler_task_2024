import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ERROR_MESSAGES } from "~/constants/errors";

import { authenticateAdmin } from "~/middleware/authenticateRoute";
import { clientApiSchema } from "~/schema/projectSchema";
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
} from "~/utils/message/message.server";

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

			const submission = parseWithZod(formData, { schema: clientApiSchema });

			if (submission.status !== "success") {
				setErrorMessage(session, ERROR_MESSAGES.wrongPayload);
				return submission.reply();
			}

			const { action, clientId, userId, projectId, tagId } = submission.value;

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
