import express from "express";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createRequestHandler } from "@remix-run/express";

const viteDevServer =
	process.env.NODE_ENV === "production"
		? undefined
		: await import("vite").then((vite) =>
				vite.createServer({
					server: { middlewareMode: true },
				})
		  );

const app = express();

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	max: 1000,
	standardHeaders: true,
	legacyHeaders: false,
});

app.use(limiter);

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

if (viteDevServer) {
	app.use(viteDevServer.middlewares);
} else {
	app.use(
		"/assets",
		express.static("build/client/assets", { immutable: true, maxAge: "1y" })
	);
}

app.use(express.static("build/client", { maxAge: "1h" }));

app.use(
	morgan("tiny", {
		skip: (req) => req.method === "GET" && req.url.startsWith("/__manifest"),
	})
);

app.all(
	"*",
	createRequestHandler({
		build: viteDevServer
			? await viteDevServer.ssrLoadModule("virtual:remix/server-build")
			: // @ts-expect-error
			  // eslint-disable-next-line import/no-unresolved
			  await import("../build/server/server.js"),
		mode: process.env.NODE_ENV,
	})
);
const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(
		`Express server listening on port ${port} (http://localhost:${port})`
	);
});
