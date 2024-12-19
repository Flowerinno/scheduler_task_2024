import { ActionFunctionArgs } from "@remix-run/node";
import { ERROR_MESSAGES } from "~/constants/errors";
import { HTTP_STATUS } from "~/constants/general";
import { authenticateRoute } from "~/middleware/authenticateRoute";
import { createProjectSchema } from "~/schema/projectSchema";
import prisma from "~/lib/prisma";
import invariant from "tiny-invariant";
import { ROLE } from "~/types";

export const action = async ({ request }: ActionFunctionArgs) => {
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
			return {
				message: ERROR_MESSAGES.wrongPayload,
				status: HTTP_STATUS.BAD_REQUEST,
			};
		}

		const user = await prisma.user.findUnique({
			where: {
				id: data.createdById,
			},
			omit: {
				password: true,
			},
		});
		invariant(user, "User not found");

		const project = await prisma.project.create({
			data: {
				name: data.name,
				description: data.description,
				createdById: data.createdById,
				clients: {
					create: {
						email: user.email,
						userId: user.id,
						firstName: user.firstName,
						lastName: user.lastName,
						role: ROLE.ADMIN,
					},
				},
			},
		});
		invariant(project, "Project not created");

		const invitedClients = data?.clients || [];

		if (
			invitedClients &&
			Array.isArray(invitedClients) &&
			invitedClients?.length >= 1
		) {
			for (const client of invitedClients) {
				try {
					await prisma?.notification.create({
						data: {
							message: `You have been invited to ${data.name} project`,
							userId: client.id,
							sentById: data.createdById,
							projectId: project.id,
						},
					});
				} catch (error) {
					console.error("Failed to create notification:", error);
				}
			}
		}

		return {
			status: HTTP_STATUS.OK,
		};
	} catch (error) {
		return null;
	}
};
