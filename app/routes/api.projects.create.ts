import { ActionFunctionArgs } from "@remix-run/node";
import { ERROR_MESSAGES } from "~/constants/errors";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import { createProjectSchema } from "~/schema/projectSchema";
import invariant from "tiny-invariant";
import {
	nullableResponseWithMessage,
	setErrorMessage,
	setSuccessMessage,
} from "~/utils/message/message.server";
import { getSession } from "~/services/session.server";
import { RESPONSE_MESSAGE } from "~/constants/messages";
import { createUserNotification, getUserById } from "~/services/user.server";
import { createProject } from "~/services/project.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const session = await getSession(request.headers.get("cookie"));

	try {
		await authenticateRoute({
			request,
		} as ActionFunctionArgs);

		const contentType = request.headers.get("content-type");

		let body;
		if (contentType?.includes("application/json")) {
			body = await request.json();
		} else if (contentType?.includes("application/x-www-form-urlencoded")) {
			body = Object.fromEntries(await request.formData());
		} else {
			throw new Error("Unsupported content type");
		}

		const { data, success } = createProjectSchema.safeParse(body);

		if (!success) {
			setErrorMessage(session, ERROR_MESSAGES.wrongPayload);
			return await nullableResponseWithMessage(session);
		}

		const user = await getUserById(data.createdById);
		invariant(user, "User not found");

		const project = await createProject(data, user, session);
		invariant(project, "Project not created");

		const invitedUsers = data?.clients || [];

		if (
			invitedUsers &&
			Array.isArray(invitedUsers) &&
			invitedUsers?.length >= 1
		) {
			for (const user of invitedUsers) {
				try {
					await createUserNotification(
						`You have been invited to ${data.name} project`,
						user.id,
						data.createdById,
						project.id
					);
				} catch (error) {
					setErrorMessage(session, ERROR_MESSAGES.failedToInvite);
				}
			}
			setSuccessMessage(session, RESPONSE_MESSAGE.invitationSent);
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
