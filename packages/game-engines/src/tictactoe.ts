import type { TicTacToeState, Symbol } from "@arcade/types";

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function createTicTacToeState(): TicTacToeState {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    winLine: null,
    status: "playing",
  };
}

export function applyTicTacToeMove(
  state: TicTacToeState,
  index: number
): { ok: true; state: TicTacToeState } | { ok: false; error: string } {
  if (state.status !== "playing") return { ok: false, error: "Game is over" };
  if (state.board[index] !== null) return { ok: false, error: "Cell is taken" };

  const board = [...state.board] as TicTacToeState["board"];
  board[index] = state.currentPlayer;

  const winLine = getWinLine(board);
  const winner: TicTacToeState["winner"] = winLine
    ? (board[winLine[0]] as Symbol)
    : isFull(board)
    ? "draw"
    : null;

  return {
    ok: true,
    state: {
      board,
      currentPlayer: state.currentPlayer === "X" ? "O" : "X",
      winner,
      winLine,
      status: winner ? "finished" : "playing",
    },
  };
}

function getWinLine(board: TicTacToeState["board"]): number[] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

function isFull(board: TicTacToeState["board"]): boolean {
  return board.every((c) => c !== null);
}
