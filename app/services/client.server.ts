import { Session } from "@remix-run/node";
import { ERROR_MESSAGES } from "~/constants/errors";
import { RESPONSE_MESSAGE } from "~/constants/messages";
import prisma from "~/lib/prisma";
import { ROLE } from "~/types";
import {
	nullableResponseWithMessage,
	setErrorMessage,
	setSuccessMessage,
} from "~/utils/message/message.server";
import { createUserNotification } from "./user.server";

export const getClientInfoForMonth = async (
	clientId: string,
	projectId: string,
	take: number = 31,
	date: Date,
	session: Session
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
		setErrorMessage(session, ERROR_MESSAGES.failedToGetClientInfo);
		return null;
	}
};

export const updateRole = async (
	clientId: string,
	role: ROLE,
	session: Session
) => {
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
		setErrorMessage(session, ERROR_MESSAGES.failedToUpdate);
		return await nullableResponseWithMessage(session);
	}
};

export const inviteUserToProject = async (
	name: string,
	deliverToUserID: string,
	sentById: string,
	projectId: string,
	session: Session
) => {
	try {
		const existingClient = await prisma.client.findFirst({
			where: {
				userId: deliverToUserID,
				projectId,
			},
		});

		if (existingClient) {
			setErrorMessage(session, ERROR_MESSAGES.failedToInviteAlreadyExists);
			return await nullableResponseWithMessage(session);
		}

		await createUserNotification(
			`You have been invited to ${name} project`,
			deliverToUserID,
			sentById,
			projectId
		);

		setSuccessMessage(session, RESPONSE_MESSAGE.invitationSent);
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.generalError);
	}
};

export const removeClientFromProject = async (
	clientId: string,
	session: Session
) => {
	try {
		await prisma.client.delete({
			where: {
				id: clientId,
			},
		});

		setSuccessMessage(session, RESPONSE_MESSAGE.clientRemoved);
		return await nullableResponseWithMessage(session);
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.failedToDelete);
		return await nullableResponseWithMessage(session);
	}
};

export const attachTag = async (
	clientId: string,
	tagId: string,
	projectId: string,
	session: Session
) => {
	try {
		await prisma.clientsOnTags.create({
			data: {
				clientId,
				tagId,
				projectId,
			},
		});

		setSuccessMessage(session, RESPONSE_MESSAGE.tagAttached);
		return await nullableResponseWithMessage(session);
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.failedToCreate);
		return await nullableResponseWithMessage(session);
	}
};

export const detachTag = async (
	clientId: string,
	tagId: string,
	projectId: string,
	session: Session
) => {
	try {
		await prisma.clientsOnTags.deleteMany({
			where: {
				clientId,
				tagId,
				projectId,
			},
		});

		setSuccessMessage(session, RESPONSE_MESSAGE.tagDetached);
		return await nullableResponseWithMessage(session);
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.failedToRemove);
		return await nullableResponseWithMessage(session);
	}
};
