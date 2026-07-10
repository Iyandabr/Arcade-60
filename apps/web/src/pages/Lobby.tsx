import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { useSocket } from "../hooks/useSocket";
import { useGameStore } from "../store/gameStore";
import type { GameId } from "@arcade/types";

const META: Record<string, { title: string; emoji: string }> = {
  tictactoe: { title: "Tic-Tac-Toe",       emoji: "⭕" },
  rps:        { title: "Rock Paper Scissors", emoji: "✊" },
};

export function Lobby() {
  const { game }                       = useParams<{ game: string }>();
  const navigate                       = useNavigate();
  const { createRoom, joinRoom, joinQueue, leaveQueue } = useSocket();
  const { phase, session, error, reset } = useGameStore();

  const [name, setName]               = useState("");
  const [code, setCode]               = useState("");
  const [mode, setMode]               = useState<"create" | "join" | "random" | null>(null);

  const gameId   = game as GameId;
  const meta     = META[game ?? ""] ?? { title: game, emoji: "🎮" };
  const trimName = name.trim() || "Player";

  useEffect(() => {
    if (phase === "playing") navigate(`/game/${game}`);
  }, [phase, navigate, game]);

  const onCancel = () => { leaveQueue(); setMode(null); reset(); };

  // ── Waiting screen ────────────────────────────────────────────────────
  if (phase === "waiting") {
    return (
      <div className="flex flex-col min-h-dvh bg-bg items-center justify-center gap-8 p-6">
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="font-arcade text-neon text-xs neon"
        >
          {mode === "create" ? "Waiting for opponent…" : "Finding a match…"}
        </motion.div>

        {mode === "create" && session?.roomCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 text-center"
          >
            <p className="text-xs text-gray-500 mb-4">Share this code with a friend</p>
            <div className="font-arcade text-3xl text-white tracking-[0.3em]">{session.roomCode}</div>
          </motion.div>
        )}

        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <header className="flex items-center px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate("/")} className="text-gray-500 hover:text-white text-sm transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <span>{meta.emoji}</span>
          <span className="font-arcade text-neon text-[10px] neon">{meta.title}</span>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col gap-5 p-5 max-w-sm mx-auto w-full pt-8">
        {/* Name input */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player"
            maxLength={16}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-neon/60 transition-colors"
          />
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red text-sm text-center">
            {error}
          </motion.p>
        )}

        <div className="flex flex-col gap-3 mt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => { setMode("random"); joinQueue(gameId, trimName); }}
          >
            Play Online (Random)
          </Button>

          <div className="flex items-center gap-3 text-gray-700">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs">or play with a friend</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => { setMode("create"); createRoom(gameId, trimName); }}
          >
            Create Private Room
          </Button>

          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Room code"
              maxLength={6}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-white placeholder-gray-700 outline-none focus:border-neon/60 transition-colors font-arcade text-sm tracking-widest"
            />
            <Button
              variant="secondary"
              onClick={() => { setMode("join"); joinRoom(code, trimName); }}
              disabled={code.trim().length < 6}
            >
              Join
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
