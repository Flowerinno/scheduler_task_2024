import { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { HTTP_STATUS } from "~/constants/general";
import { authenticateAdmin } from "~/middleware/authenticateRoute";
import {
	attachTag,
	detachTag,
	inviteUserToProject,
	removeClientFromProject,
	updateRole,
} from "~/services/client.server";
import { ROLE } from "~/types";

type Action =
	| "updateRole"
	| "deleteClient"
	| "createClient"
	| "addTag"
	| "removeTag";

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

					return { status: HTTP_STATUS.OK };
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
				return await updateRole(clientId, formData.get("role") as ROLE);
			}

			if (action === "deleteClient") {
				return removeClientFromProject(clientId);
			}

			if (action === "addTag") {
				invariant(tagId, "Tag ID is required");
				return await attachTag(clientId, tagId, projectId);
			}

			if (action === "removeTag") {
				invariant(tagId, "Tag ID is required");
				return await detachTag(clientId, tagId, projectId);
			}
		} else {
			throw new Error("Unsupported content type");
		}

		return null;
	} catch (error) {
		return null;
	}
};
