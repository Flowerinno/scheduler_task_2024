import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import bcrypt from "bcrypt";
import {
	loginSchema,
	LoginSchema,
	RegisterSchema,
	registerSchema,
} from "~/schema/authSchema";

import { parseWithZod } from "@conform-to/zod";
import { User } from "@prisma/client";
import prisma from "~/lib/prisma";

type Action = "login" | "register";

export type AuthUser = Omit<User, "password"> | undefined | null;

export const authenticator = new Authenticator<AuthUser>(sessionStorage);

authenticator.use(
	new FormStrategy(async ({ form }) => {
		const action = form.get("action") as Action;
		if (action === "register") {
			const submission = parseWithZod(form, { schema: registerSchema });

			if (submission.status === "success") {
				return registerUser(submission.value);
			}
		}

		if (action === "login") {
			const submission = parseWithZod(form, { schema: loginSchema });

			if (submission.status === "success") {
				return loginUser(submission.value);
			}
		}
	}),
	"user-pass"
);

export const registerUser = async (registerData: RegisterSchema) => {
	try {
		const existingUser = await prisma.user.findUnique({
			omit: {
				password: true,
			},
			where: {
				email: registerData.email,
			},
		});

		if (existingUser) {
			return existingUser;
		}

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(registerData.password, salt);

		const newUser = await prisma?.user.create({
			data: {
				email: registerData.email,
				password: hash,
				firstName: registerData.firstName,
				lastName: registerData.lastName,
			},
			omit: {
				password: true,
			},
		});

		return newUser;
	} catch (error) {
		return null;
	}
};

export const loginUser = async (loginData: LoginSchema) => {
	try {
		const user = await prisma?.user.findUnique({
			where: {
				email: loginData.email,
			},
		});

		if (!user) {
			return null;
		}

		const isValid = await bcrypt.compare(loginData.password, user.password);

		if (!isValid) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword;
	} catch (error) {
		return null;
	}
};
