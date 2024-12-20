import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import { ERROR_MESSAGES } from "~/constants/errors";
import { authenticateAdmin } from "~/middleware/authenticateRoute";
import { logsSchema } from "~/schema/logsSchema";
import { createLog, updateLog } from "~/services/project.server";
import { getSession } from "~/services/session.server";
import {
	nullableResponseWithMessage,
	setErrorMessage,
} from "~/utils/message/message.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const session = await getSession(request.headers.get("cookie"));
	try {
		const formData = await request.formData();

		const submission = parseWithZod(formData, { schema: logsSchema });

		if (submission.status !== "success") {
			return submission.reply();
		}

		await authenticateAdmin(
			submission.value.modifiedById,
			submission.value.projectId
		);

		if (submission.value.logId) {
			return await updateLog(submission.value, session);
		} else {
			return await createLog(submission.value, session);
		}
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.generalError);
		return await nullableResponseWithMessage(session);
	}
};
