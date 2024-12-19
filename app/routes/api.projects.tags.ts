import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ERROR_MESSAGES } from "~/constants/errors";
import {
	authenticateAdmin,
	authenticateRoute,
} from "~/middleware/authenticateRoute";
import { createTagSchema } from "~/schema/projectSchema";
import { createTag } from "~/services/project.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();

		const submission = parseWithZod(formData, {
			schema: createTagSchema,
		});

		if (submission.status !== "success") {
			return submission.reply();
		}

		const { projectId, tag } = submission.value;

		const user = await authenticateRoute({ request } as ActionFunctionArgs);
		invariant(user, "User session is missing");

		const admin = await authenticateAdmin(user.id, projectId);
		invariant(admin, "User is not an admin");

		return await createTag(projectId, tag);
	} catch (error) {
		return { message: ERROR_MESSAGES.generalError };
	}
};
