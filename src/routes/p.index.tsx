import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/p/")({
  beforeLoad: () => {
    throw redirect({ to: "/portal" });
  },
  component: () => null,
});
