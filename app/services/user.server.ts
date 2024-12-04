import prisma from "~/lib/prisma";
import { Notification } from "@prisma/client";

export const getUsersByEmail = async (email: string) => {
	try {
		return await prisma.user.findMany({
			omit: {
				password: true,
			},
			where: {
				email: {
					contains: email,
					mode: "insensitive",
				},
			},
			take: 10,
		});
	} catch (error) {
		return [];
	}
};

export const getUserNotifications = async (
	userId: string
): Promise<Notification[]> => {
	try {
		return await prisma.notification.findMany({
			where: {
				userId,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	} catch (error) {
		return [];
	}
};

export const answerProjectInvitation = async (
	notificationId: string,
	projectId: string,
	answer: boolean
) => {
	try {
		const answerFromUser = await prisma.notification.update({
			where: {
				id: notificationId,
			},
			data: {
				checkedAt: new Date(),
				answer,
				message: `You've ${answer ? "accepted" : "declined"} the invitation`,
			},
			select: {
				sentById: true,
				userId: true,
				user: {
					select: {
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
		});

		await prisma.notification.create({
			data: {
				message: `${answerFromUser.user.firstName} ${
					answerFromUser.user.lastName
				} has ${answer ? "accepted" : "declined"} your invitation`,
				userId: answerFromUser.sentById,
				sentById: answerFromUser.userId,
				answer,
			},
		});

		if (answer === true) {
			await prisma.clientsOnProjects.create({
				data: {
					client: {
						create: {
							email: answerFromUser.user.email,
							firstName: answerFromUser.user.firstName,
							lastName: answerFromUser.user.lastName,
							createdById: answerFromUser.sentById,
							userId: answerFromUser.userId,
						},
					},
					project: {
						connect: {
							id: projectId,
						},
					},
				},
			});
		}
	} catch (error) {
		return;
	}
};

export const removeNotification = async (notificationId: string) => {
	try {
		await prisma.notification.delete({ where: { id: notificationId } });
	} catch (error) {
		return;
	}
};
