import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RPSState, RPSChoice, RPSMove, Symbol } from "@arcade/types";

const CHOICES: { id: RPSChoice; emoji: string; label: string }[] = [
  { id: "rock",     emoji: "✊", label: "Rock" },
  { id: "paper",    emoji: "✋", label: "Paper" },
  { id: "scissors", emoji: "✌️", label: "Scissors" },
];

interface Props {
  state:       RPSState;
  yourSymbol:  Symbol;
  onChoice:    (move: RPSMove) => void;
  onNextRound: () => void;
}

export function RPS({ state, yourSymbol, onChoice, onNextRound }: Props) {
  const [localChoice, setLocalChoice] = useState<RPSChoice | null>(null);
  const opp = yourSymbol === "X" ? "O" : "X";

  // Reset local choice on new round
  useEffect(() => {
    if (state.status === "choosing") setLocalChoice(null);
  }, [state.round, state.status]);

  // Auto-advance from revealing
  useEffect(() => {
    if (state.status === "revealing") {
      const t = setTimeout(onNextRound, 2500);
      return () => clearTimeout(t);
    }
  }, [state.status, state.round, onNextRound]);

  const handleChoice = (id: RPSChoice) => {
    if (state.status !== "choosing" || state.choices[yourSymbol] !== null) return;
    setLocalChoice(id);
    onChoice({ choice: id });
  };

  const getEmoji = (sym: Symbol): string => {
    const choice = state.choices[sym];
    if (state.status === "revealing" || state.status === "finished") {
      return CHOICES.find((c) => c.id === choice)?.emoji ?? "❓";
    }
    if (sym === yourSymbol) return localChoice ? CHOICES.find((c) => c.id === localChoice)!.emoji : "❓";
    return state.choices[sym] ? "🤜" : "❓";
  };

  const roundResult = () => {
    if (!state.roundWinner) return null;
    if (state.roundWinner === "draw") return { text: "Draw!", color: "text-amber" };
    return state.roundWinner === yourSymbol
      ? { text: "You won the round! 🎉", color: "text-neon" }
      : { text: "Opponent won the round", color: "text-red" };
  };

  const gameResult = () => {
    if (!state.winner) return null;
    if (state.winner === "draw") return { text: "It's a Draw!", color: "text-amber" };
    return state.winner === yourSymbol
      ? { text: "You Win! 🎉", color: "text-neon neon" }
      : { text: "You Lose", color: "text-gray-400" };
  };

  const result  = roundResult();
  const endGame = gameResult();
  const canChoose = state.status === "choosing" && state.choices[yourSymbol] === null;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Score */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="text-center">
          <div className="text-3xl font-bold text-neon">{state.scores[yourSymbol]}</div>
          <div className="text-xs text-gray-500 mt-0.5">You</div>
        </div>
        <div className="font-arcade text-[9px] text-gray-500">
          Round {Math.min(state.round, state.maxRounds)}/{state.maxRounds}
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple">{state.scores[opp]}</div>
          <div className="text-xs text-gray-500 mt-0.5">Opp</div>
        </div>
      </div>

      {/* Arena */}
      <div className="flex items-center justify-between w-full bg-card border border-border rounded-2xl p-6">
        {([yourSymbol, opp] as Symbol[]).map((sym, i) => (
          <div key={sym} className="flex flex-col items-center gap-2">
            <motion.span
              key={`${sym}-${state.round}-${state.choices[sym]}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl"
            >
              {getEmoji(sym)}
            </motion.span>
            <span className={`text-xs ${i === 0 ? "text-neon" : "text-purple"}`}>
              {i === 0 ? "You" : "Opp"}
            </span>
          </div>
        ))}
      </div>

      {/* Round result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.p
            key={`${state.round}-${state.roundWinner}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm font-semibold ${result.color}`}
          >
            {result.text}
          </motion.p>
        )}
        {endGame && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`font-arcade text-xs ${endGame.color}`}
          >
            {endGame.text}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Choice buttons */}
      {state.status !== "finished" && (
        <div className="grid grid-cols-3 gap-3 w-full">
          {CHOICES.map(({ id, emoji, label }) => {
            const picked = localChoice === id;
            return (
              <motion.button
                key={id}
                whileTap={canChoose ? { scale: 0.93 } : {}}
                onClick={() => handleChoice(id)}
                disabled={!canChoose}
                className={[
                  "flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all duration-150",
                  picked
                    ? "border-neon bg-neon/10"
                    : "border-border bg-card",
                  canChoose ? "hover:border-white/20 cursor-pointer" : "opacity-40 cursor-default",
                ].join(" ")}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-[10px] text-gray-400">{label}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {state.status === "choosing" && (
        <p className="text-xs text-gray-500">
          {state.choices[yourSymbol] ? "Waiting for opponent…" : "Choose your move"}
        </p>
      )}
    </div>
  );
}
