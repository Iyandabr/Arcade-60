import { create } from "zustand";
import type { GameState, GameStartPayload, Symbol } from "@arcade/types";

export type Phase = "idle" | "waiting" | "playing" | "finished" | "opponent_left";

interface Session extends GameStartPayload {
  yourSymbol: Symbol;
}

interface GameStore {
  phase:             Phase;
  session:           Session | null;
  rematchRequested:  boolean;
  error:             string | null;
  // setters
  setPhase:         (p: Phase) => void;
  setSession:       (s: Session) => void;
  updateState:      (state: GameState) => void;
  setRematch:       (v: boolean) => void;
  setError:         (e: string | null) => void;
  reset:            () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  phase:            "idle",
  session:          null,
  rematchRequested: false,
  error:            null,

  setPhase:    (phase)   => set({ phase }),
  setSession:  (session) => set({ session, phase: "playing", rematchRequested: false }),
  updateState: (state)   => set((s) => s.session ? { session: { ...s.session, state } } : {}),
  setRematch:  (v)       => set({ rematchRequested: v }),
  setError:    (error)   => set({ error }),
  reset:       ()        => set({ phase: "idle", session: null, rematchRequested: false, error: null }),
}));
