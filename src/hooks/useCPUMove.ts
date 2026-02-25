import { useEffect, useState, useRef, useCallback } from 'react';
import { GameState, Player, PlayerMode, GamePhase, CPUDifficulty } from '../types';
import { makeCPUMove, validateCPUMove } from '../utils/cpuAI';

/**
 * Custom hook to handle CPU moves in the game.
 * Supports HUMAN_VS_CPU (O is CPU) and CPU_VS_CPU (both players are CPU).
 *
 * @param gameState   - Current game state
 * @param makeMove    - Function to execute a move
 * @param isPaused    - When true, CPU moves are suspended (spectator pause)
 * @param moveSpeedMs - Delay between turns in ms (default 700)
 */
export const useCPUMove = (
  gameState: GameState,
  makeMove: (cellIndex: number) => void,
  isPaused: boolean = false,
  moveSpeedMs: number = 700
): { isCPUThinking: boolean } => {
  const [isCPUThinking, setIsCPUThinking] = useState(false);
  const pendingMoveRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store latest gameState in a ref so the callback always has fresh data
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Determine if it's a CPU's turn
  const isHumanVsCPUTurn =
    gameState.playerMode === PlayerMode.HUMAN_VS_CPU &&
    gameState.currentPlayer === Player.O;

  const isCPUVsCPUTurn = gameState.playerMode === PlayerMode.CPU_VS_CPU;

  const isCPUTurn = isHumanVsCPUTurn || isCPUVsCPUTurn;
  const isGamePlaying = gameState.gamePhase === GamePhase.PLAYING;
  const noWinner = !gameState.gameWinner;

  const executeCPUMove = useCallback(async () => {
    const currentState = gameStateRef.current;

    // Double-check conditions before executing
    if (currentState.gamePhase !== GamePhase.PLAYING || currentState.gameWinner) {
      pendingMoveRef.current = false;
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
      pendingMoveRef.current = false;
    }
  }, [makeMove]);

  useEffect(() => {
    // Clear timeout if paused or game ended
    if (isPaused || !isGamePlaying || gameState.gameWinner) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      pendingMoveRef.current = false;
      return;
    }

    // Schedule a CPU move if it's CPU's turn and we don't have a pending move
    if (isCPUTurn && noWinner && !pendingMoveRef.current) {
      pendingMoveRef.current = true;

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        executeCPUMove();
      }, moveSpeedMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        pendingMoveRef.current = false; // Reset so next effect run can schedule
      }
    };
  }, [
    isCPUTurn,
    isGamePlaying,
    noWinner,
    isPaused,
    moveSpeedMs,
    executeCPUMove,
    gameState.currentPlayer, // Re-run when player changes (after a move)
  ]);

  return { isCPUThinking };
};
