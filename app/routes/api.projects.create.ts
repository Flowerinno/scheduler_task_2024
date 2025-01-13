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

		const body = await request.json();

		const data = createProjectSchema.parse(body);

		const user = await getUserById(data.createdById);
		invariant(user, ERROR_MESSAGES.userNotFound);

		const project = await createProject(data, user, session);
		invariant(project, ERROR_MESSAGES.failedToCreate);

		const invitedUsers = data?.clients || [];

		for (const user of invitedUsers) {
			await createUserNotification(
				`You have been invited to ${data.name} project`,
				user.id,
				data.createdById,
				project.id,
				session
			);
		}

		setSuccessMessage(session, RESPONSE_MESSAGE.invitationSent);

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
