import { ERROR_MESSAGES } from "~/constants/errors";
import prisma from "~/lib/prisma";
import { ROLE } from "~/types";

export const getClientInfoForMonth = async (
	clientId: string,
	projectId: string,
	take: number = 31,
	date: Date
) => {
	const gte = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
	const lte = new Date(
		date.getFullYear(),
		date.getMonth() + 1,
		0,
		23,
		59,
		59,
		999
	);

	try {
		const clientInfo = await prisma.client.findUnique({
			where: {
				id: clientId,
				projectId,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				role: true,
				createdBy: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				clientsOnTags: {
					where: {
						clientId,
						tag: {
							projectId,
						},
					},
					select: {
						tag: true,
					},
				},
				project: {
					select: {
						id: true,
						name: true,
						createdById: true,
						tag: true,
						log: {
							where: {
								clientId,
								date: {
									gte: gte.toISOString(),
									lte: lte.toISOString(),
								},
							},
							take,
						},
					},
				},
			},
		});

		const totalDuration = await prisma.log.aggregate({
			_sum: {
				duration: true,
			},
			where: {
				clientId,
				projectId,
				isAbsent: false,
			},
		});

		return { clientInfo, totalDuration };
	} catch (error) {
		return null;
	}
};

export const getClientByUserId = async (userId: string, projectId: string) => {
	try {
		const client = await prisma.project.findUnique({
			where: {
				id: projectId,
			},
			select: {
				clients: {
					where: {
						userId,
					},
					include: {
						project: {
							select: {
								log: {
									where: {},
									take: 31,
								},
							},
						},
						clientsOnTags: {
							select: {
								tag: true,
							},
						},
					},
				},
			},
		});

		return client;
	} catch (error) {
		return null;
	}
};

export const updateRole = async (clientId: string, role: ROLE) => {
	try {
		if (!role) return null;

		const client = await prisma.client.update({
			where: {
				id: clientId,
			},
			data: {
				role,
			},
		});

		return client;
	} catch (error) {
		return { message: ERROR_MESSAGES.generalError };
	}
};

export const inviteUserToProject = async (
	name: string,
	deliverToUserID: string,
	sentById: string,
	projectId: string
) => {
	try {
		const existingClient = await prisma.client.findFirst({
			where: {
				userId: deliverToUserID,
				projectId,
			},
		});

		if (existingClient) return null;

		return await prisma.notification.create({
			data: {
				message: `You have been invited to ${name} project`,
				userId: deliverToUserID,
				sentById,
				projectId,
			},
		});
	} catch (error) {
		console.log(`Failed to invite user to project: ${error}`);
		return { message: ERROR_MESSAGES.generalError };
	}
};

export const removeClientFromProject = async (clientId: string) => {
	try {
		const client = await prisma.client.delete({
			where: {
				id: clientId,
			},
		});

		return client;
	} catch (error) {
		return null;
	}
};

export const attachTag = async (
	clientId: string,
	tagId: string,
	projectId: string
) => {
	try {
		const attachedTag = await prisma.clientsOnTags.create({
			data: {
				clientId,
				tagId,
				projectId,
			},
		});

		return attachedTag;
	} catch (error) {
		return { message: ERROR_MESSAGES.generalError };
	}
};

export const detachTag = async (
	clientId: string,
	tagId: string,
	projectId: string
) => {
	try {
		const removedTags = await prisma.clientsOnTags.deleteMany({
			where: {
				clientId,
				tagId,
				projectId,
			},
		});

		return removedTags;
	} catch (error) {
		return { message: ERROR_MESSAGES.generalError };
	}
};
