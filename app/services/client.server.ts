import prisma from "~/lib/prisma";
import { ROLE } from "~/types";

export const getClientInfoById = async (
	clientId: string,
	projectId: string,
	take: number = 20
) => {
	try {
		const client = await prisma.client.findUnique({
			where: {
				id: clientId,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				role: true,
				createdBy: {
					select: {
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
				clientsOnProjects: {
					where: {
						clientId,
						projectId,
					},
					select: {
						project: {
							select: {
								id: true,
								name: true,
								createdById: true,
								log: {
									where: {
										clientId,
										projectId,
									},
									take,
								},
							},
						},
						// client: {
						// 	select: {},
						// },
					},
				},
			},
		});

		return client;
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
				clientsOnProjects: {
					where: {
						client: {
							userId,
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
		if (!role) return;

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
		return;
	}
};

export const inviteUserToProject = async (
	name: string,
	deliverToUserID: string,
	sentById: string,
	projectId: string
) => {
	try {
		const existingUser = await prisma.project.findFirst({
			where: {
				id: projectId,
				clientsOnProjects: {
					some: {
						client: {
							userId: deliverToUserID,
						},
					},
				},
			},
		});

		if (existingUser) return;

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
		return;
	}
};