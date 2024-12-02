import invariant from "tiny-invariant";
import prisma from "~/lib/prisma";
import { LogsSchema } from "~/schema/logsSchema";

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
	take: number = 20
) => {
	try {
		return await prisma.log.findMany({
			where: {
				projectId,
				client: {
					userId,
				},
			},
			take,
		});
	} catch (error) {
		return [];
	}
};

export const getAllActivities = async (userId: string, take: number = 20) => {
	try {
		return await prisma.log.findMany({
			where: {
				client: {
					userId,
				},
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

		const { logId, ...rest } = data;

		let log;

		if (logId) {
			log = await prisma.log.update({
				where: {
					clientId: data.clientId,
					id: data.logId,
				},
				data: {
					...rest,
					duration,
				},
			});
		} else {
			log = await prisma.log.create({
				data: {
					...rest,
					duration,
				},
			});
		}
		console.log(log, "created log");
		invariant(log, "Log not created");

		return log;
	} catch (error) {
		console.log(error);
		return;
	}
};
