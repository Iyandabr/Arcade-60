import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const GAMES = [
  {
    id:          "tictactoe",
    title:       "Tic-Tac-Toe",
    emoji:       "⭕",
    desc:        "Classic 3×3. First to three wins.",
    accent:      "neon",
    gradient:    "from-neon/15 to-transparent",
    border:      "border-neon/20 hover:border-neon/60",
    glow:        "hover:shadow-neon",
  },
  {
    id:          "rps",
    title:       "Rock Paper Scissors",
    emoji:       "✊",
    desc:        "Best of 3 rounds. Outsmart your opponent.",
    accent:      "purple",
    gradient:    "from-purple/15 to-transparent",
    border:      "border-purple/20 hover:border-purple/60",
    glow:        "hover:shadow-purple",
  },
] as const;

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      {/* Hero */}
      <div className="flex flex-col items-center pt-16 pb-10 px-5 relative overflow-hidden">
        <div className="absolute inset-0 scanline" />
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 relative"
        >
          <h1 className="font-arcade text-neon text-2xl tracking-widest neon">ARCADE 60</h1>
          <p className="text-gray-500 text-sm">Multiplayer mini-games</p>
        </motion.div>
      </div>

      {/* Games */}
      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
        <div className="flex flex-col gap-4">
          {GAMES.map((game, i) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/lobby/${game.id}`)}
              className={[
                "w-full text-left p-5 rounded-2xl border-2 bg-gradient-to-br",
                "transition-all duration-200",
                game.gradient, game.border, game.glow,
              ].join(" ")}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{game.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-white">{game.title}</h2>
                  <p className="text-gray-400 text-sm mt-0.5">{game.desc}</p>
                </div>
                <span className="text-gray-600 text-xl shrink-0">→</span>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="mt-8 text-center font-arcade text-[9px] text-gray-700 tracking-widest">
          MORE COMING SOON
        </p>
      </main>
    </div>
  );
}
