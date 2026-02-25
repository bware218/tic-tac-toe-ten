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
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if it's a CPU's turn
  const isHumanVsCPUTurn =
    gameState.playerMode === PlayerMode.HUMAN_VS_CPU &&
    gameState.currentPlayer === Player.O;

  const isCPUVsCPUTurn = gameState.playerMode === PlayerMode.CPU_VS_CPU;

  const isCPUTurn = isHumanVsCPUTurn || isCPUVsCPUTurn;
  const isGamePlaying = gameState.gamePhase === GamePhase.PLAYING;
  const noWinner = !gameState.gameWinner;

  const shouldMakeMove = isCPUTurn && isGamePlaying && noWinner && !isPaused && !isProcessing;

  const executeCPUMove = useCallback(async () => {
    setIsCPUThinking(true);

    try {
      // In CPU_VS_CPU mode, X uses cpuDifficultyX; O always uses cpuDifficulty
      const stateForAI =
        gameState.playerMode === PlayerMode.CPU_VS_CPU && gameState.currentPlayer === Player.X
          ? { ...gameState, cpuDifficulty: gameState.cpuDifficultyX }
          : gameState;

      const moveIndex = await makeCPUMove(stateForAI);

      if (validateCPUMove(moveIndex, gameState)) {
        makeMove(moveIndex);
      } else {
        console.error('Invalid CPU move detected:', moveIndex);
        const fallbackMove = await makeCPUMove({
          ...gameState,
          cpuDifficulty: CPUDifficulty.EASY
        });
        makeMove(fallbackMove);
      }
    } catch (error) {
      console.error('CPU move error:', error);
    } finally {
      setIsCPUThinking(false);
      setIsProcessing(false);
    }
  }, [gameState, makeMove]);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (shouldMakeMove) {
      setIsProcessing(true);

      timeoutRef.current = setTimeout(() => {
        executeCPUMove();
      }, moveSpeedMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [shouldMakeMove, moveSpeedMs, executeCPUMove]);

  return { isCPUThinking };
};
