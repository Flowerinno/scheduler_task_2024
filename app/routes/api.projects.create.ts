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

		const client = await prisma.client.create({
			data: {
				email: user.email,
				userId: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				role: ROLE.ADMIN,
			},
		});
		invariant(client, "Client not created");

		const project = await prisma.project.create({
			data: {
				name: data.name,
				description: data.description,
				createdById: data.createdById,
				clientsOnProjects: {
					create: {
						clientId: client.id,
					},
				},
			},
		});

		if (!project) {
			return {
				message: ERROR_MESSAGES.generalError,
				status: HTTP_STATUS.NOT_FOUND,
			};
		}

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
			message: "Project created",
			status: HTTP_STATUS.CREATED,
		};
	} catch (error) {
		return {
			message: ERROR_MESSAGES.generalError,
			status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
		};
	}
};
