import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("reply/:postId", "./routes/draw.tsx"),
] satisfies RouteConfig;
