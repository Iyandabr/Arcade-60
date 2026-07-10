import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@arcade/types";
import * as rm from "./roomManager";

const app    = express();
const server = http.createServer(app);

app.use(cors());
app.get("/health", (_, res) => res.json({ ok: true, ts: Date.now() }));

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on("create_room", ({ game, playerName }) => {
    const code = rm.createRoom(socket.id, game, playerName);
    socket.join(code);
    socket.emit("room_created", { code });
  });

  socket.on("join_room", ({ code, playerName }) => {
    const result = rm.joinRoom(socket.id, code.toUpperCase(), playerName);
    if (!result.ok) { socket.emit("error", { message: result.error }); return; }

    const { room } = result;
    socket.join(room.code);

    room.players.forEach((p) => {
      io.to(p.id).emit("game_start", {
        roomCode:   room.code,
        game:       room.game,
        state:      room.state,
        players:    room.players.map((r) => ({ name: r.name, symbol: r.symbol })),
        yourSymbol: p.symbol,
      });
    });
  });

  socket.on("join_queue", ({ game, playerName }) => {
    const result = rm.joinQueue(socket.id, game, playerName);
    if (!result.matched) { socket.emit("queue_waiting"); return; }

    const { code, p1, p2 } = result;
    const room = rm.getRoom(code)!;

    [p1, p2].forEach((p) => {
      const s = io.sockets.sockets.get(p.id);
      if (!s) return;
      s.join(code);
      const player = room.players.find((r) => r.id === p.id)!;
      s.emit("game_start", {
        roomCode:   code,
        game:       room.game,
        state:      room.state,
        players:    room.players.map((r) => ({ name: r.name, symbol: r.symbol })),
        yourSymbol: player.symbol,
      });
    });
  });

  socket.on("leave_queue", () => rm.leaveQueue(socket.id));

  socket.on("make_move", ({ roomCode, move }) => {
    const result = rm.applyMove(roomCode, socket.id, move);
    if (!result.ok) { socket.emit("error", { message: result.error }); return; }

    const { room } = result;
    io.to(roomCode).emit("game_update", { state: room.state });
    if (room.state.status === "finished") {
      io.to(roomCode).emit("game_over", { state: room.state, winner: room.state.winner });
    }
  });

  socket.on("next_round", ({ roomCode }) => {
    const result = rm.nextRound(roomCode);
    if (result.ok) io.to(roomCode).emit("game_update", { state: result.room.state });
  });

  socket.on("vote_rematch", ({ roomCode }) => {
    const result = rm.voteRematch(roomCode, socket.id);
    if (!result.ok) return;
    if (result.started) {
      io.to(roomCode).emit("game_restart", { state: result.room.state });
    } else {
      socket.to(roomCode).emit("rematch_requested");
    }
  });

  socket.on("disconnect", () => {
    console.log(`[-] ${socket.id}`);
    const room = rm.removePlayer(socket.id);
    if (room) io.to(room.code).emit("opponent_left");
  });
});

const PORT = Number(process.env.PORT ?? 4000);
server.listen(PORT, () => console.log(`[server] :${PORT}`));
