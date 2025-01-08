import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getUser = async (idx: number, createdById: string, projectId: string) => {
	try {
		const user = await prisma.user.create({
			data: {
				email: `test${idx}@gmail.com`,
				firstName: `Test${idx}`,
				lastName: `User${idx}`,
				password: "123456",
			},
		});

		return prisma.client.create({
			data: {
				email: `test${idx}@gmail.com`,
				firstName: `Test${idx}`,
				lastName: `User${idx}`,
				createdById,
				userId: user.id,
				projectId,
			},
		});
	} catch (error) {}
};

async function main() {
	for (let i = 0; i < 20; i++) {
		await getUser(i, "cm5noqb0u0000jetd7yl749rs", "cm5norju8000192zgy5qflcrg");
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
