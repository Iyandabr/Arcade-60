import type {
  GameId, GameState, Move, Symbol, Player,
  TicTacToeState, RPSState, TicTacToeMove, RPSMove,
} from "@arcade/types";
import {
  createTicTacToeState, applyTicTacToeMove,
  createRPSState, applyRPSChoice, advanceRPSRound,
} from "@arcade/game-engines";

interface Room {
  code:         string;
  game:         GameId;
  players:      Player[];
  state:        GameState;
  rematchVotes: Set<string>;
}

type Result<T> = { ok: true } & T | { ok: false; error: string };

const rooms  = new Map<string, Room>();
const queues = new Map<GameId, { id: string; name: string }[]>();

function code6(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function newState(game: GameId): GameState {
  return game === "tictactoe" ? createTicTacToeState() : createRPSState();
}

// ── Public API ──────────────────────────────────────────────────────────────

export function createRoom(socketId: string, game: GameId, name: string): string {
  const code = code6();
  rooms.set(code, {
    code, game,
    players: [{ id: socketId, name, symbol: "X" }],
    state: newState(game),
    rematchVotes: new Set(),
  });
  return code;
}

export function joinRoom(
  socketId: string, code: string, name: string
): Result<{ room: Room }> {
  const room = rooms.get(code);
  if (!room)                                      return { ok: false, error: "Room not found" };
  if (room.players.length >= 2)                  return { ok: false, error: "Room is full" };
  if (room.players.some((p) => p.id === socketId)) return { ok: false, error: "Already in room" };

  room.players.push({ id: socketId, name, symbol: "O" });
  room.state = newState(room.game);
  return { ok: true, room };
}

export function joinQueue(
  socketId: string, game: GameId, name: string
): { matched: true; code: string; p1: { id: string }; p2: { id: string } } | { matched: false } {
  const queue = queues.get(game) ?? [];
  if (queue.some((p) => p.id === socketId)) return { matched: false };
  queue.push({ id: socketId, name });
  queues.set(game, queue);

  if (queue.length >= 2) {
    const [a, b] = queue.splice(0, 2);
    queues.set(game, queue);
    const code = code6();
    rooms.set(code, {
      code, game,
      players: [
        { id: a.id, name: a.name, symbol: "X" },
        { id: b.id, name: b.name, symbol: "O" },
      ],
      state: newState(game),
      rematchVotes: new Set(),
    });
    return { matched: true, code, p1: a, p2: b };
  }
  return { matched: false };
}

export function leaveQueue(socketId: string): void {
  for (const [game, q] of queues) {
    queues.set(game, q.filter((p) => p.id !== socketId));
  }
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function getRoomBySocket(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.id === socketId)) return room;
  }
}

export function applyMove(
  code: string, socketId: string, move: Move
): Result<{ room: Room }> {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: "Room not found" };

  const player = room.players.find((p) => p.id === socketId);
  if (!player) return { ok: false, error: "Not in room" };

  if (room.game === "tictactoe") {
    const state = room.state as TicTacToeState;
    if (state.currentPlayer !== player.symbol) return { ok: false, error: "Not your turn" };
    const result = applyTicTacToeMove(state, (move as TicTacToeMove).index);
    if (!result.ok) return result;
    room.state = result.state;
  } else {
    const result = applyRPSChoice(
      room.state as RPSState, player.symbol as Symbol, (move as RPSMove).choice
    );
    if (!result.ok) return result;
    room.state = result.state;
  }

  return { ok: true, room };
}

export function nextRound(code: string): Result<{ room: Room }> {
  const room = rooms.get(code);
  if (!room || room.game !== "rps") return { ok: false, error: "Invalid" };
  const result = advanceRPSRound(room.state as RPSState);
  if (!result.ok) return result;
  room.state = result.state;
  return { ok: true, room };
}

export function voteRematch(
  code: string, socketId: string
): Result<{ room: Room; started: boolean }> {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: "Room not found" };
  room.rematchVotes.add(socketId);
  if (room.rematchVotes.size >= 2) {
    room.state = newState(room.game);
    room.rematchVotes.clear();
    return { ok: true, room, started: true };
  }
  return { ok: true, room, started: false };
}

export function removePlayer(socketId: string): Room | undefined {
  leaveQueue(socketId);
  const room = getRoomBySocket(socketId);
  if (room) rooms.delete(room.code);
  return room;
}
