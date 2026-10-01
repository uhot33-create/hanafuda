import { createFileRoute } from "@tanstack/react-router";
import { GameApp } from "@/components/hanafuda/GameApp";

export const Route = createFileRoute("/")({ component: GameApp });
