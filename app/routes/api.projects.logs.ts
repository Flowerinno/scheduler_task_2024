import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import { ERROR_MESSAGES } from "~/constants/errors";
import { HTTP_STATUS } from "~/constants/general";
import { RESPONSE_MESSAGE } from "~/constants/messages";
import { authenticateAdmin } from "~/middleware/authenticateRoute";
import { logsSchema } from "~/schema/logsSchema";
import { createLog } from "~/services/project.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();

		const submission = parseWithZod(formData, { schema: logsSchema });

		if (submission.status !== "success") {
			return submission.reply({});
		}

		await authenticateAdmin(
			submission.value.modifiedById,
			submission.value.projectId
		);

		const log = await createLog(submission.value);

		if (log) {
			return {
				message: RESPONSE_MESSAGE.ok,
				status: HTTP_STATUS.OK,
				data: { log },
			};
		}

		return {
			message: ERROR_MESSAGES.generalError,
			status: HTTP_STATUS.BAD_REQUEST,
		};
	} catch (error) {
		console.log(error);
		return {
			message: ERROR_MESSAGES.generalError,
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
		};
	}
};
