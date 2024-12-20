import prisma from "~/lib/prisma";
import { Notification } from "@prisma/client";
import { HTTP_STATUS } from "~/constants/general";
import { Session } from "@remix-run/node";
import {
	nullableResponseWithMessage,
	setErrorMessage,
	setSuccessMessage,
} from "~/utils/message/message.server";
import { ERROR_MESSAGES } from "~/constants/errors";
import { RESPONSE_MESSAGE } from "~/constants/messages";

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
	answer: boolean,
	session: Session
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
			const isClientOnProject = await prisma.client.findFirst({
				where: {
					projectId,
					email: answerFromUser.user.email,
				},
			});

			if (isClientOnProject) {
				setErrorMessage(session, ERROR_MESSAGES.failedToAccept);
				return await nullableResponseWithMessage(session);
			}

			await prisma.client.create({
				data: {
					email: answerFromUser.user.email,
					firstName: answerFromUser.user.firstName,
					lastName: answerFromUser.user.lastName,
					createdById: answerFromUser.sentById,
					userId: answerFromUser.userId,
					projectId,
				},
			});
		}

		return await nullableResponseWithMessage(session);
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.failedToAccept);
		return await nullableResponseWithMessage(session);
	}
};

export const removeNotification = async (
	notificationId: string,
	session: Session
) => {
	try {
		await prisma.notification.delete({ where: { id: notificationId } });
		setSuccessMessage(session, RESPONSE_MESSAGE.notificationRemoved);
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.failedToRemove);
	} finally {
		return await nullableResponseWithMessage(session);
	}
};
