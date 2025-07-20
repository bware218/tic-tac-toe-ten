import { useEffect, useState, useRef, useCallback } from 'react';
import { GameState, Player, PlayerMode, GamePhase, CPUDifficulty } from '../types';
import { makeCPUMove, validateCPUMove } from '../utils/cpuAI';
import { useDeepCallback } from '../utils/performanceUtils';

/**
 * Custom hook to handle CPU moves in the game
 * @param gameState - Current game state
 * @param makeMove - Function to make a move in the game
 * @returns Object with isCPUThinking state
 */
export const useCPUMove = (
  gameState: GameState,
  makeMove: (cellIndex: number) => void
): { isCPUThinking: boolean } => {
  const [isCPUThinking, setIsCPUThinking] = useState(false);
  const isProcessingRef = useRef(false);
  
  // Memoize the executeCPUMove function to prevent unnecessary recreations
  const executeCPUMove = useDeepCallback(async () => {
    // Set thinking state to show the indicator
    setIsCPUThinking(true);
    
    try {
      // Calculate the CPU's move based on difficulty level
      const moveIndex = await makeCPUMove(gameState);
      
      // Validate the move before executing it
      if (validateCPUMove(moveIndex, gameState)) {
        // Add a small delay to make the CPU move feel more natural
        // This varies based on difficulty level (handled in makeCPUMove)
        makeMove(moveIndex);
      } else {
        console.error('Invalid CPU move detected:', moveIndex);
        // Fallback to a random valid move if the selected move is invalid
        const fallbackMove = await makeCPUMove({
          ...gameState,
          cpuDifficulty: CPUDifficulty.EASY // Use easy difficulty as fallback
        });
        makeMove(fallbackMove);
      }
    } catch (error) {
      console.error('CPU move error:', error);
    } finally {
      // Reset states when done
      setIsCPUThinking(false);
      isProcessingRef.current = false;
    }
  }, [gameState, makeMove]);

  useEffect(() => {
    // Only proceed if it's a CPU game, it's the CPU's turn (O), and the game is in progress
    const isCPUGame = gameState.playerMode === PlayerMode.HUMAN_VS_CPU;
    const isCPUTurn = gameState.currentPlayer === Player.O;
    const isGamePlaying = gameState.gamePhase === GamePhase.PLAYING;
    const noWinner = !gameState.gameWinner;
    
    // Prevent multiple simultaneous CPU move calculations
    if (isCPUGame && isCPUTurn && isGamePlaying && noWinner && !isProcessingRef.current) {
      isProcessingRef.current = true;
      
      // Execute the CPU move with a small initial delay
      // This makes the transition between human and CPU turns more visible
      const turnTransitionDelay = setTimeout(() => {
        executeCPUMove();
      }, 300); // Short delay for better UX
      
      // Clean up the timeout if the component unmounts or dependencies change
      return () => clearTimeout(turnTransitionDelay);
    }
  }, [gameState.playerMode, gameState.currentPlayer, gameState.gamePhase, gameState.gameWinner, executeCPUMove]);
  
  return { isCPUThinking };
};