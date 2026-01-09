import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [index("routes/home.tsx")] satisfies RouteConfig;

const routes = [
  index("./routes/home.tsx"),
  route("about", "./routes/about.tsx"),

  layout("./auth/layout.tsx", [
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),

  ...prefix("post", [
    route(":post", "./post/post.tsx"),
    route(":post/res", "./post/res.tsx"),
  ]),
] satisfies RouteConfig