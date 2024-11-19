namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "production";
		DATABASE_URL: string;
		SESSION_SECRET: string;
		CLIENT_URL: string;
	}
}
