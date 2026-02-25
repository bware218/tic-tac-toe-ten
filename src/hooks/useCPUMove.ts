import { useEffect, useState, useRef, useCallback } from 'react';
import { GameState, Player, PlayerMode, GamePhase, CPUDifficulty } from '../types';
import { makeCPUMove, validateCPUMove } from '../utils/cpuAI';

/**
 * Custom hook to handle CPU moves in the game.
 * Supports HUMAN_VS_CPU (O is CPU) and CPU_VS_CPU (both players are CPU).
 */
export const useCPUMove = (
  gameState: GameState,
  makeMove: (cellIndex: number) => void,
  isPaused: boolean = false,
  moveSpeedMs: number = 700
): { isCPUThinking: boolean } => {
  const [isCPUThinking, setIsCPUThinking] = useState(false);

  // Use a counter to trigger effect re-runs after each move completes
  const [moveCount, setMoveCount] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);

  // Store latest gameState in a ref so the callback always has fresh data
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const executeCPUMove = useCallback(async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    const currentState = gameStateRef.current;

    // Double-check conditions before executing
    if (currentState.gamePhase !== GamePhase.PLAYING || currentState.gameWinner) {
      isExecutingRef.current = false;
      return;
    }

    setIsCPUThinking(true);

    try {
      // In CPU_VS_CPU mode, X uses cpuDifficultyX; O always uses cpuDifficulty
      const stateForAI =
        currentState.playerMode === PlayerMode.CPU_VS_CPU && currentState.currentPlayer === Player.X
          ? { ...currentState, cpuDifficulty: currentState.cpuDifficultyX }
          : currentState;

      const moveIndex = await makeCPUMove(stateForAI);

      // Re-check state hasn't changed (game might have been reset)
      if (gameStateRef.current.gamePhase !== GamePhase.PLAYING) {
        return;
      }

      if (validateCPUMove(moveIndex, gameStateRef.current)) {
        makeMove(moveIndex);
      } else {
        console.error('Invalid CPU move detected:', moveIndex);
        const fallbackMove = await makeCPUMove({
          ...gameStateRef.current,
          cpuDifficulty: CPUDifficulty.EASY
        });
        makeMove(fallbackMove);
      }
    } catch (error) {
      console.error('CPU move error:', error);
    } finally {
      setIsCPUThinking(false);
      isExecutingRef.current = false;
      // Increment counter to trigger effect re-run for next move
      setMoveCount(c => c + 1);
    }
  }, [makeMove]);

  useEffect(() => {
    // Determine if it's a CPU's turn
    const isHumanVsCPUTurn =
      gameState.playerMode === PlayerMode.HUMAN_VS_CPU &&
      gameState.currentPlayer === Player.O;

    const isCPUVsCPUTurn = gameState.playerMode === PlayerMode.CPU_VS_CPU;

    const isCPUTurn = isHumanVsCPUTurn || isCPUVsCPUTurn;
    const isGamePlaying = gameState.gamePhase === GamePhase.PLAYING;
    const noWinner = !gameState.gameWinner;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Don't schedule if paused, game ended, or already executing
    if (isPaused || !isGamePlaying || !noWinner || isExecutingRef.current) {
      return;
    }

    // Schedule a CPU move if it's CPU's turn
    if (isCPUTurn) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        executeCPUMove();
      }, moveSpeedMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    gameState.playerMode,
    gameState.currentPlayer,
    gameState.gamePhase,
    gameState.gameWinner,
    isPaused,
    moveSpeedMs,
    moveCount, // Re-run after each move completes
    executeCPUMove,
  ]);

  return { isCPUThinking };
};
