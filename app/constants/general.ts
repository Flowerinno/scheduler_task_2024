export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
} as const;

export const CONTENT_TYPE = {
	JSON: "application/json",
	FORM: "application/x-www-form-urlencoded",
} as const;

export const API = {
	projectsCreate: "/api/projects/create",
	projectsClients: "/api/projects/clients",
	projectsClientsInvite: "/api/projects/clients/invite",
	projectsLogs: "/api/projects/logs",
	projectsTags: "/api/projects/tags",
	users: "/api/users",
} as const