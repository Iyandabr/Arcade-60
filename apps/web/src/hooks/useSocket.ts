import { useEffect, useCallback } from "react";
import { socket } from "../lib/socket";
import { useGameStore } from "../store/gameStore";
import type { GameId, Move } from "@arcade/types";

export function useSocket() {
  const { setPhase, setSession, updateState, setRematch, setError, reset } = useGameStore();

  useEffect(() => {
    socket.connect();

    socket.on("room_created",      ({ code }) => {
      useGameStore.setState((s) => ({
        session: s.session ? { ...s.session, roomCode: code } : null,
        phase: "waiting",
      }));
    });
    socket.on("queue_waiting",     ()         => setPhase("waiting"));
    socket.on("game_start",        (data)     => setSession({ ...data }));
    socket.on("game_update",       ({ state }) => updateState(state));
    socket.on("game_over",         ({ state }) => { updateState(state); setPhase("finished"); });
    socket.on("game_restart",      ({ state }) => { updateState(state); setPhase("playing"); setRematch(false); });
    socket.on("rematch_requested", ()         => setRematch(true));
    socket.on("opponent_left",     ()         => setPhase("opponent_left"));
    socket.on("error",             ({ message }) => setError(message));

    return () => { socket.removeAllListeners(); socket.disconnect(); };
  }, [setPhase, setSession, updateState, setRematch, setError]);

  const createRoom  = useCallback((game: GameId, playerName: string) => {
    setError(null);
    useGameStore.setState({ session: { game } as never, phase: "idle" });
    socket.emit("create_room", { game, playerName });
  }, [setError]);

  const joinRoom    = useCallback((code: string, playerName: string) => {
    setError(null);
    socket.emit("join_room", { code, playerName });
  }, [setError]);

  const joinQueue   = useCallback((game: GameId, playerName: string) => {
    setError(null);
    useGameStore.setState({ session: { game } as never });
    socket.emit("join_queue", { game, playerName });
  }, [setError]);

  const leaveQueue  = useCallback(() => { socket.emit("leave_queue"); reset(); }, [reset]);

  const makeMove    = useCallback((roomCode: string, move: Move) => {
    socket.emit("make_move", { roomCode, move });
  }, []);

  const nextRound   = useCallback((roomCode: string) => {
    socket.emit("next_round", { roomCode });
  }, []);

  const voteRematch = useCallback((roomCode: string) => {
    socket.emit("vote_rematch", { roomCode });
    setRematch(true);
  }, [setRematch]);

  const reset = useCallback(() => useGameStore.getState().reset(), []);

  return { createRoom, joinRoom, joinQueue, leaveQueue, makeMove, nextRound, voteRematch, reset };
}
