import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { GameShell } from "../components/shell/GameShell";
import { TicTacToe } from "../components/games/tictactoe/TicTacToe";
import { RPS }       from "../components/games/rps/RPS";
import { useSocket } from "../hooks/useSocket";
import { useGameStore } from "../store/gameStore";
import type { TicTacToeState, RPSState } from "@arcade/types";

export function Game() {
  const { game }    = useParams<{ game: string }>();
  const { makeMove, nextRound, voteRematch, reset } = useSocket();
  const { session, phase, rematchRequested } = useGameStore();

  if (!session?.state) return <Navigate to={`/lobby/${game}`} replace />;

  const { state, players, yourSymbol, roomCode } = session;

  return (
    <GameShell
      title={game === "tictactoe" ? "Tic-Tac-Toe" : "Rock Paper Scissors"}
      players={players}
      yourSymbol={yourSymbol}
      phase={phase}
      rematchRequested={rematchRequested}
      onRematch={() => voteRematch(roomCode)}
      onExit={reset}
    >
      {game === "tictactoe" && (
        <TicTacToe
          state={state as TicTacToeState}
          yourSymbol={yourSymbol}
          onMove={(move) => makeMove(roomCode, move)}
        />
      )}
      {game === "rps" && (
        <RPS
          state={state as RPSState}
          yourSymbol={yourSymbol}
          onChoice={(move) => makeMove(roomCode, move)}
          onNextRound={() => nextRound(roomCode)}
        />
      )}
    </GameShell>
  );
}
