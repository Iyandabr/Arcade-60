import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import type { Phase } from "../../store/gameStore";
import type { Symbol } from "@arcade/types";

interface Props {
  title:            string;
  players?:         { name: string; symbol: Symbol }[];
  yourSymbol?:      Symbol;
  phase:            Phase;
  rematchRequested: boolean;
  onRematch:        () => void;
  onExit:           () => void;
  children:         React.ReactNode;
}

export function GameShell({ title, players, yourSymbol, phase, rematchRequested, onRematch, onExit, children }: Props) {
  const navigate = useNavigate();

  const handleExit = () => { onExit(); navigate("/"); };

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <button onClick={handleExit} className="text-gray-500 hover:text-white transition-colors text-sm">
          ← Exit
        </button>
        <span className="font-arcade text-neon text-[10px] neon">{title}</span>
        <div className="flex gap-2 text-xs">
          {players?.map((p, i) => (
            <React.Fragment key={p.symbol}>
              {i > 0 && <span className="text-gray-600">vs</span>}
              <span className={p.symbol === yourSymbol ? "text-neon font-semibold" : "text-gray-400"}>
                {p.symbol === yourSymbol ? "You" : p.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* Game content */}
      <main className="flex-1 flex flex-col items-center justify-center p-5 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {children}
        </motion.div>
      </main>

      {/* Opponent left banner */}
      <AnimatePresence>
        {phase === "opponent_left" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-4 p-4 rounded-xl bg-red/10 border border-red/30 text-center text-sm text-red"
          >
            Opponent disconnected
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rematch bar */}
      <AnimatePresence>
        {(phase === "finished" || phase === "opponent_left") && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="border-t border-border bg-card p-4 flex gap-3 safe-bottom shrink-0"
          >
            {phase === "finished" && (
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={onRematch}
                disabled={rematchRequested}
              >
                {rematchRequested ? "Waiting…" : "Rematch"}
              </Button>
            )}
            <Button variant="secondary" size="lg" className="flex-1" onClick={handleExit}>
              Exit
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
