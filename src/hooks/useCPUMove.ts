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
  const isProcessingRef = useRef(false);

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
      isProcessingRef.current = false;
    }
  }, [gameState, makeMove]);

  useEffect(() => {
    // HUMAN_VS_CPU: only O is a CPU
    const isHumanVsCPUTurn =
      gameState.playerMode === PlayerMode.HUMAN_VS_CPU &&
      gameState.currentPlayer === Player.O;

    // CPU_VS_CPU: both X and O are CPUs
    const isCPUVsCPUTurn = gameState.playerMode === PlayerMode.CPU_VS_CPU;

    const isCPUTurn = isHumanVsCPUTurn || isCPUVsCPUTurn;
    const isGamePlaying = gameState.gamePhase === GamePhase.PLAYING;
    const noWinner = !gameState.gameWinner;

    if (isCPUTurn && isGamePlaying && noWinner && !isPaused && !isProcessingRef.current) {
      isProcessingRef.current = true;

      const delay = setTimeout(() => {
        executeCPUMove();
      }, moveSpeedMs);

      return () => clearTimeout(delay);
    }
  }, [
    gameState.playerMode,
    gameState.currentPlayer,
    gameState.gamePhase,
    gameState.gameWinner,
    isPaused,
    moveSpeedMs,
    executeCPUMove,
  ]);

  return { isCPUThinking };
};