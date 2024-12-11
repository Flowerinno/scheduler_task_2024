import { AuthUser } from "~/services/auth.server";
import { Notification } from "@prisma/client";

export type User = {
	id: string;
};

export type ContextType = {
	user: AuthUser;
	notifications: Notification[] | [];
};

export enum ROLE {
	ADMIN = "ADMIN",
	MANAGER = "MANAGER",
	USER = "USER",
}

export type FetchProjectStatistics = {
	projectId: string;
	startDate: Date;
	endDate: Date;
	role: ROLE | undefined;
};

export type Order = "desc" | "asc";
