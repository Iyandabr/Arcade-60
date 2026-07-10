// ── Game IDs ───────────────────────────────────────────────────────────────────
export type GameId = "tictactoe" | "rps";

// ── Players ────────────────────────────────────────────────────────────────────
export type Symbol = "X" | "O";

export interface Player {
  id: string;
  name: string;
  symbol: Symbol;
}

// ── Tic-Tac-Toe ───────────────────────────────────────────────────────────────
export interface TicTacToeState {
  board: (Symbol | null)[];
  currentPlayer: Symbol;
  winner: Symbol | "draw" | null;
  winLine: number[] | null;
  status: "playing" | "finished";
}

// ── Rock Paper Scissors ────────────────────────────────────────────────────────
export type RPSChoice = "rock" | "paper" | "scissors";

export interface RPSState {
  round: number;
  maxRounds: number;
  choices: Record<Symbol, RPSChoice | null>;
  roundWinner: Symbol | "draw" | null;
  scores: Record<Symbol, number>;
  winner: Symbol | "draw" | null;
  status: "choosing" | "revealing" | "finished";
}

export type GameState = TicTacToeState | RPSState;

// ── Moves ─────────────────────────────────────────────────────────────────────
export interface TicTacToeMove { index: number }
export interface RPSMove       { choice: RPSChoice }
export type Move = TicTacToeMove | RPSMove;

// ── Socket events ─────────────────────────────────────────────────────────────
export interface GameStartPayload {
  roomCode:   string;
  game:       GameId;
  state:      GameState;
  players:    Pick<Player, "name" | "symbol">[];
  yourSymbol: Symbol;
}

export interface ClientToServerEvents {
  create_room:  (p: { game: GameId; playerName: string }) => void;
  join_room:    (p: { code: string; playerName: string }) => void;
  join_queue:   (p: { game: GameId; playerName: string }) => void;
  leave_queue:  () => void;
  make_move:    (p: { roomCode: string; move: Move }) => void;
  next_round:   (p: { roomCode: string }) => void;
  vote_rematch: (p: { roomCode: string }) => void;
}

export interface ServerToClientEvents {
  room_created:      (p: { code: string }) => void;
  queue_waiting:     () => void;
  game_start:        (p: GameStartPayload) => void;
  game_update:       (p: { state: GameState }) => void;
  game_over:         (p: { state: GameState; winner: Symbol | "draw" | null }) => void;
  game_restart:      (p: { state: GameState }) => void;
  rematch_requested: () => void;
  opponent_left:     () => void;
  error:             (p: { message: string }) => void;
}
