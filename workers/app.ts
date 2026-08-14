import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import apiRouter from "./routes/api";
import authRouter from "./routes/auth";
import imagesRouter from "./routes/images";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const app = new Hono<{ Bindings: Env }>();

app.route("/", imagesRouter);
app.route("/auth", authRouter);
app.route("/api", apiRouter);

app.all("*", (c) => {
	const requestHandler = createRequestHandler(
		() => import("virtual:react-router/server-build"),
		import.meta.env.MODE,
	);

	return requestHandler(c.req.raw, {
		cloudflare: { env: c.env, ctx: c.executionCtx },
	});
});

export default app;
