import { createFileRoute } from "@tanstack/react-router";
import { Atrium } from "@/components/atrium";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Atrium />;
}
