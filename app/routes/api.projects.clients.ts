import { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ERROR_MESSAGES } from "~/constants/errors";
import { HTTP_STATUS } from "~/constants/general";
import { authenticateAdmin } from "~/middleware/authenticateRoute";
import {
	inviteUserToProject,
	removeClientFromProject,
	updateRole,
} from "~/services/client.server";
import { ROLE } from "~/types";

type Action = "updateRole" | "deleteClient" | "createClient";

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const contentType = request.headers.get("content-type");

		let body;
		if (contentType?.includes("application/json")) {
			body = await request.json();

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
							body.projectId
						);
					}

					return {
						message: "Clients added successfully",
						status: HTTP_STATUS.OK,
					};
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

			const sentByClient = await authenticateAdmin(userId, projectId);
			invariant(sentByClient, "User is not authorized to perform this action");

			if (action === "updateRole") {
				return await updateRole(clientId, formData.get("role") as ROLE);
			}
			if (action === "deleteClient") {
				return removeClientFromProject(clientId);
			}
		} else {
			throw new Error("Unsupported content type");
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
