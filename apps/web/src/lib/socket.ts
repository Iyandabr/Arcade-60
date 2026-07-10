import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@arcade/types";

const SERVER = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER, {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
