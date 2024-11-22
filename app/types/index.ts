import { AuthUser } from "~/services/auth.server";
import { Notification } from "@prisma/client";

export type User = {
	id: string;
};

export type ContextType = {
	user: AuthUser;
	notifications: Notification[] | [];
};
