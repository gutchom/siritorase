import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("draw", "./routes/draw.tsx", { id: "draw-new" }),
	route("reply/:postId", "./routes/draw.tsx", { id: "draw-reply" }),
	route("graph", "./routes/graph.tsx"),
] satisfies RouteConfig;
