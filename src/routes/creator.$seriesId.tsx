import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/creator/$seriesId")({
  ssr: false,
  component: () => <Outlet />,
});