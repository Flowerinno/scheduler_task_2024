import { Session } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ERROR_MESSAGES } from "~/constants/errors";
import { RESPONSE_MESSAGE } from "~/constants/messages";
import prisma from "~/lib/prisma";
import { LogsSchema } from "~/schema/logsSchema";
import { FetchProjectStatistics } from "~/types";
import { getStartOfTheDay } from "~/utils/date/dateFormatter";
import {
	nullableResponseWithMessage,
	setErrorMessage,
	setSuccessMessage,
} from "~/utils/message/message.server";

export const getUserProjects = async (userId: string) => {
	try {
		const projects = await prisma.project.findMany({
			where: {
				clients: {
					some: {
						userId,
					},
				},
			},
			include: {
				clients: true,
			},
		});

		for (const project of projects) {
			const teamCount = await prisma.client.count({
				where: {
					projectId: project.id,
				},
			});

			//@ts-expect-error
			project["teamCount"] = teamCount;
		}

		return projects as typeof projects & { teamCount: number };
	} catch (error) {
		return [];
	}
};

export const getClientProjectById = async (
	projectId: string,
	userId: string,
	searchQuery: string | undefined
) => {
	try {
		const project = await prisma.project.findUnique({
			where: {
				id: projectId,
			},
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				clients: {
					...(searchQuery
						? {
								where: {
									OR: [
										{
											userId,
										},
										{
											firstName: {
												contains: searchQuery,
												mode: "insensitive",
											},
										},
										{
											lastName: {
												contains: searchQuery,
												mode: "insensitive",
											},
										},
										{
											email: {
												contains: searchQuery,
												mode: "insensitive",
											},
										},
										{
											clientsOnTags: {
												some: {
													tag: {
														name: {
															contains: searchQuery,
															mode: "insensitive",
														},
													},
												},
											},
										},
									],
								},
						  }
						: {}),
					include: {
						clientsOnTags: {
							select: {
								tag: true,
							},
						},
					},
				},
				createdBy: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				log: {
					where: {
						client: {
							userId,
						},
					},
				},
			},
		});

		return project;
	} catch (error) {
		return null;
	}
};

export const getProjectActivitiesById = async (
	projectId: string,
	userId: string,
	take: number = 31
) => {
	try {
		return await prisma.log.findMany({
			where: {
				projectId,
				client: {
					userId,
				},
			},
			select: {
				duration: true,
				createdAt: true,
				isAbsent: true,
				isBillable: true,
				startTime: true,
				endTime: true,
				project: {
					select: {
						name: true,
					},
				},
				client: {
					select: {
						role: true,
					},
				},
			},
			orderBy: {
				startTime: "desc",
			},
			take,
		});
	} catch (error) {
		return [];
	}
};

export const getAllActivities = async (userId: string, take: number = 31) => {
	try {
		return await prisma.log.findMany({
			where: {
				client: {
					userId,
				},
			},
			select: {
				duration: true,
				createdAt: true,
				isAbsent: true,
				isBillable: true,
				startTime: true,
				endTime: true,
				project: {
					select: {
						name: true,
					},
				},
				client: {
					select: {
						role: true,
					},
				},
			},
			orderBy: {
				startTime: "desc",
			},
			take,
		});
	} catch (error) {
		return [];
	}
};

export const removeProject = async (
	projectId: string,
	userId: string,
	session: Session
) => {
	try {
		const project = await prisma.project.findFirst({
			where: {
				id: projectId,
				createdById: userId,
			},
		});

		if (!project) {
			setErrorMessage(session, ERROR_MESSAGES.notFound);
		}

		await prisma.project.delete({
			where: {
				id: projectId,
			},
		});

		setSuccessMessage(session, RESPONSE_MESSAGE.deleted);
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.failedToDelete);
	}
};

export const createLog = async (data: LogsSchema, session: Session) => {
	//versioning to prevent race conditions, default v=1
	try {
		const duration = data.endTime.getTime() - data.startTime.getTime();

		const { logId, version, ...rest } = data;

		const onDate = getStartOfTheDay(data.startTime);

		await prisma.$transaction(async (prisma) => {
			const conflictingRecord = await prisma.log.findFirst({
				where: {
					clientId: data.clientId,
					projectId: data.projectId,
					version,
					date: onDate,
				},
			}); // look for a log with the same version and date

			if (conflictingRecord) {
				setErrorMessage(session, ERROR_MESSAGES.conflictingLogAlreadyExists);
			}

			invariant(conflictingRecord === null, "Conflicting log found"); // if found, throw an error

			return prisma.log.create({
				data: {
					...rest,
					date: onDate,
					duration,
				},
			});
		});
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.failedToCreate);
	} finally {
		return await nullableResponseWithMessage(session);
	}
};

export const updateLog = async (data: LogsSchema, session: Session) => {
	try {
		const duration = data.endTime.getTime() - data.startTime.getTime();

		const { logId, version, ...rest } = data;

		await prisma.$transaction(async (prisma) => {
			return prisma.log.update({
				// wont update if not found
				where: {
					id: logId,
					version,
				},
				data: {
					...rest,
					duration,
					version: {
						increment: 1,
					},
				},
			});
		});
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.failedToUpdate);
	} finally {
		return await nullableResponseWithMessage(session);
	}
};

export const getTotalActivityDuration = async (
	userId: string,
	projectId: string
) => {
	try {
		const totalDuration = await prisma.log.aggregate({
			_sum: {
				duration: true,
			},
			where: {
				client: {
					userId,
				},
				projectId,
				isAbsent: false,
			},
		});

		return { duration: totalDuration._sum.duration ?? 0 };
	} catch (error) {
		return { duration: 0 };
	}
};

export const createTag = async (
	projectId: string,
	tag: string,
	session: Session
) => {
	try {
		const existingTag = await prisma.tag.findFirst({
			where: {
				projectId,
				name: {
					equals: tag,
					mode: "insensitive",
				},
			},
		});

		if (existingTag) {
			setErrorMessage(session, ERROR_MESSAGES.generalAlreadyExists);
			return await nullableResponseWithMessage(session);
		}

		await prisma.tag.create({
			data: {
				name: tag,
				projectId,
			},
		});

		setSuccessMessage(session, RESPONSE_MESSAGE.tagCreated);
	} catch (error) {
		setErrorMessage(session, ERROR_MESSAGES.failedToCreate);
	} finally {
		return await nullableResponseWithMessage(session);
	}
};

export const getProjectStatistics = async ({
	projectId,
	startDate,
	endDate,
	role,
	search,
}: FetchProjectStatistics) => {
	try {
		const stats = await prisma.client.findMany({
			where: {
				...(role ? { role } : {}),
				projectId,
				...(search
					? {
							OR: [
								{
									firstName: {
										contains: search,
										mode: "insensitive",
									},
								},
								{
									lastName: {
										contains: search,
										mode: "insensitive",
									},
								},
								{
									email: {
										contains: search,
										mode: "insensitive",
									},
								},
							],
					  }
					: {}),
			},
			include: {
				logs: {
					where: {
						date: {
							gte: startDate,
							lte: endDate,
						},
					},
				},
			},
		});

		return stats || [];
	} catch (error) {
		return [];
	}
};
