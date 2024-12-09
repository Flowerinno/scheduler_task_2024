import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	const salt = await bcrypt.genSalt(10);

	const password = await bcrypt.hash("123456", salt);

	const admin = await prisma.user.create({
		data: {
			email: "akellastoopi@gmail.com",
			firstName: "Aleksandr",
			lastName: "Kononov",
			password,
		},
	});
	const manager = await prisma.user.create({
		data: {
			email: "manager@gmail.com",
			firstName: "Alice",
			lastName: "Manager",
			password,
		},
	});
	const user = await prisma.user.create({
		data: {
			email: "user@gmail.com",
			firstName: "Bruce",
			lastName: "User",
			password,
		},
	});
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
