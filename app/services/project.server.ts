import invariant from "tiny-invariant";
import prisma from "~/lib/prisma";
import { LogsSchema } from "~/schema/logsSchema";
import { getStartOfTheDay } from "~/utils/date/dateFormatter";

export const getUserProjects = async (userId: string) => {
	try {
		const projects = await prisma.clientsOnProjects.findMany({
			where: {
				client: {
					userId,
				},
			},
			select: {
				project: true,
				client: true,
			},
		});

		for (const project of projects) {
			const teamCount = await prisma.clientsOnProjects.count({
				where: {
					projectId: project.project.id,
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
	userId: string
) => {
	try {
		const project = await prisma.project.findUnique({
			where: {
				id: projectId,
				clientsOnProjects: {
					some: {
						client: {
							userId,
						},
					},
				},
			},
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				clientsOnProjects: {
					select: {
						client: true,
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

export const removeProject = async (projectId: string, userId: string) => {
	try {
		const project = await prisma.project.findFirst({
			where: {
				id: projectId,
				createdBy: {
					id: userId,
				},
			},
		});

		if (!project) {
			return;
		}

		await prisma.project.delete({
			where: {
				id: projectId,
			},
		});

		return { message: "Project deleted" };
	} catch (error) {
		console.log(error);
		return;
	}
};

export const createLog = async (data: LogsSchema) => {
	try {
		const duration = data.endTime.getTime() - data.startTime.getTime();

		const { logId, version, ...rest } = data;

		const onDate = getStartOfTheDay(data.startTime);

		return await prisma.$transaction(async (prisma) => {
			const conflictingRecord = await prisma.log.findFirst({
				where: {
					clientId: data.clientId,
					projectId: data.projectId,
					version,
					date: onDate,
				},
			});

			invariant(conflictingRecord === null, "Conflicting log found");

			return prisma.log.create({
				data: {
					...rest,
					date: onDate,
					duration,
				},
			});
		});
	} catch (error) {
		return { message: "Could not create log, version mismatch" };
	}
};

export const updateLog = async (data: LogsSchema) => {
	try {
		const duration = data.endTime.getTime() - data.startTime.getTime();

		const { logId, version, ...rest } = data;

		return await prisma.$transaction(async (prisma) => {
			return prisma.log.update({
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
		return { message: "Could not update log, version mismatch" };
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

export const createTag = async (projectId: string, tag: string) => {
	try {
		const existingTag = await prisma.tag.findFirst({
			where: {
				projectId,
				name: tag,
			},
		});

		if (existingTag) {
			return { message: "Tag already exists" };
		}

		return await prisma.tag.create({
			data: {
				name: tag,
				projectId,
			},
		});
	} catch (error) {
		return { message: "Could not create tag" };
	}
};
