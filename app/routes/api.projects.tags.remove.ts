import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ERROR_MESSAGES } from "~/constants/errors";
import {
	authenticateAdmin,
	authenticateRoute,
} from "~/middleware/authenticateRoute";
import { removeTagSchema } from "~/schema/projectSchema";
import { removeTag } from "~/services/project.server";
import { getSession } from "~/services/session.server";
import {
	nullableResponseWithMessage,
	setErrorMessage,
} from "~/utils/message/message.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const session = await getSession(request.headers.get("cookie"));
	try {
		const formData = await request.formData();

		const submission = parseWithZod(formData, {
			schema: removeTagSchema,
		});

		if (submission.status !== "success") {
			return submission.reply();
		}

		const { projectId, tagId } = submission.value;

		const user = await authenticateRoute({ request } as ActionFunctionArgs);
		invariant(user, ERROR_MESSAGES.userSessionMissing);

		const admin = await authenticateAdmin(user.id, projectId);
		invariant(admin, ERROR_MESSAGES.notAdmin);

		return await removeTag(projectId, tagId, session);
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.generalError);
		return await nullableResponseWithMessage(session);
	}
};
