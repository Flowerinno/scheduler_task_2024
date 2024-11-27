import { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ERROR_MESSAGES } from "~/constants/errors";
import { HTTP_STATUS } from "~/constants/general";
import { authenticateAdmin } from "~/middleware/authenticateRoute";
import { updateRole } from "~/services/client.server";
import { ROLE } from "~/types";

type Action = "updateRole" | "deleteClient" | "createClient";

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();

		const action = formData.get("action") as Action;
		invariant(action, "Action is required");

		const clientId = formData.get("clientId") as string;
		invariant(clientId, "Client ID is required");

		const userId = formData.get("userId") as string;
		invariant(userId, "User ID is required");

		const projectId = formData.get("projectId") as string;
		invariant(projectId, "Project ID is required");

		const sentByClient = await authenticateAdmin(userId, projectId);
		invariant(sentByClient, "User is not authorized to perform this action");

		if (action === "updateRole") {
			return await updateRole(clientId, formData.get("role") as ROLE);
		}

		if (action === "deleteClient") {
		}

		if (action === "createClient") {
		}

		return {
			message: ERROR_MESSAGES.generalError,
			status: HTTP_STATUS.BAD_REQUEST,
		};
	} catch (error) {
		return {
			message: ERROR_MESSAGES.generalError,
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
		};
	}
};
