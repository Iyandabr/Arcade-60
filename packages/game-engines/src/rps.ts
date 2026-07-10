import type { RPSState, RPSChoice, Symbol } from "@arcade/types";

const BEATS: Record<RPSChoice, RPSChoice> = {
  rock: "scissors",
  scissors: "paper",
  paper: "rock",
};

const MAX_ROUNDS = 3;

export function createRPSState(): RPSState {
  return {
    round: 1,
    maxRounds: MAX_ROUNDS,
    choices: { X: null, O: null },
    roundWinner: null,
    scores: { X: 0, O: 0 },
    winner: null,
    status: "choosing",
  };
}

export function applyRPSChoice(
  state: RPSState,
  player: Symbol,
  choice: RPSChoice
): { ok: true; state: RPSState } | { ok: false; error: string } {
  if (state.status !== "choosing") return { ok: false, error: "Not choosing phase" };
  if (state.choices[player] !== null) return { ok: false, error: "Already chose" };

  const choices = { ...state.choices, [player]: choice };

  if (choices.X === null || choices.O === null) {
    return { ok: true, state: { ...state, choices } };
  }

  // Both chose — resolve round
  const roundWinner = resolveRound(choices.X, choices.O);
  const scores: Record<Symbol, number> = {
    X: state.scores.X + (roundWinner === "X" ? 1 : 0),
    O: state.scores.O + (roundWinner === "O" ? 1 : 0),
  };

  const majority = Math.ceil(MAX_ROUNDS / 2);
  const gameWinner: RPSState["winner"] =
    scores.X >= majority ? "X"
    : scores.O >= majority ? "O"
    : state.round >= MAX_ROUNDS
    ? scores.X > scores.O ? "X" : scores.O > scores.X ? "O" : "draw"
    : null;

  return {
    ok: true,
    state: {
      round: state.round + (gameWinner ? 0 : 1),
      maxRounds: MAX_ROUNDS,
      choices,
      roundWinner,
      scores,
      winner: gameWinner,
      status: gameWinner ? "finished" : "revealing",
    },
  };
}

export function advanceRPSRound(
  state: RPSState
): { ok: true; state: RPSState } | { ok: false; error: string } {
  if (state.status !== "revealing") return { ok: false, error: "Not revealing phase" };
  return {
    ok: true,
    state: { ...state, choices: { X: null, O: null }, roundWinner: null, status: "choosing" },
  };
}

function resolveRound(x: RPSChoice, o: RPSChoice): Symbol | "draw" {
  if (x === o) return "draw";
  return BEATS[x] === o ? "X" : "O";
}
