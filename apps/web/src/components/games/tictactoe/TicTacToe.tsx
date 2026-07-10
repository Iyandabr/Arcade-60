import React from "react";
import { motion } from "framer-motion";
import type { TicTacToeState, Symbol, TicTacToeMove } from "@arcade/types";

interface Props {
  state:      TicTacToeState;
  yourSymbol: Symbol;
  onMove:     (move: TicTacToeMove) => void;
}

const SYMBOL_COLOR: Record<Symbol, string> = { X: "text-neon", O: "text-purple" };
const SYMBOL_BG:    Record<Symbol, string> = { X: "border-neon/40 bg-neon/5", O: "border-purple/40 bg-purple/5" };

export function TicTacToe({ state, yourSymbol, onMove }: Props) {
  const { board, currentPlayer, winner, winLine, status } = state;
  const isYourTurn = status === "playing" && currentPlayer === yourSymbol;

  const statusText = () => {
    if (status === "finished") {
      if (winner === "draw") return "It's a Draw!";
      return winner === yourSymbol ? "You Win! 🎉" : "You Lose";
    }
    return isYourTurn ? "Your turn" : "Opponent's turn…";
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Status */}
      <motion.p
        key={statusText()}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`font-arcade text-[10px] ${
          status === "finished" && winner === yourSymbol
            ? "text-neon neon"
            : status === "finished" && winner === "draw"
            ? "text-amber"
            : "text-gray-300"
        }`}
      >
        {statusText()}
      </motion.p>

      {/* Turn indicators */}
      <div className="flex gap-8">
        {(["X", "O"] as Symbol[]).map((sym) => (
          <div
            key={sym}
            className={`flex flex-col items-center gap-1.5 transition-opacity duration-300 ${
              currentPlayer === sym && status === "playing" ? "opacity-100" : "opacity-25"
            }`}
          >
            <span className={`font-arcade text-xl ${SYMBOL_COLOR[sym]}`}>{sym}</span>
            <div className={`h-0.5 w-10 rounded-full ${sym === "X" ? "bg-neon" : "bg-purple"}`} />
            <span className="text-[10px] text-gray-500">{sym === yourSymbol ? "You" : "Opp"}</span>
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2.5 w-full aspect-square">
        {board.map((cell, i) => {
          const isWin    = winLine?.includes(i) ?? false;
          const canClick = isYourTurn && !cell && status === "playing";
          return (
            <motion.button
              key={i}
              whileTap={canClick ? { scale: 0.93 } : {}}
              onClick={() => canClick && onMove({ index: i })}
              disabled={!canClick}
              className={[
                "aspect-square rounded-2xl border-2 flex items-center justify-center",
                "transition-colors duration-150 select-none",
                isWin
                  ? "border-amber/60 bg-amber/10"
                  : cell
                  ? SYMBOL_BG[cell as Symbol]
                  : "border-border bg-card",
                canClick ? "hover:border-white/20 cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              {cell && (
                <motion.span
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className={`font-arcade text-2xl ${SYMBOL_COLOR[cell as Symbol]} ${isWin ? "neon" : ""}`}
                >
                  {cell}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
