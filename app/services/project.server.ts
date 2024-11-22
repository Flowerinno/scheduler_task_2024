import prisma from "~/lib/prisma";

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
