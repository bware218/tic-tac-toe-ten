import { GameState, GamePhase, Player, PlayerMode } from '../types';

/**
 * Manages game flow transitions and state changes
 */

/**
 * Determines if it's the CPU's turn to play
 * @param gameState - Current game state
 * @returns boolean indicating if it's CPU's turn
 */
export const isCPUTurn = (gameState: GameState): boolean => {
  const { playerMode, currentPlayer, gamePhase } = gameState;
  
  // Only CPU turns in human-vs-cpu mode when it's O's turn and game is in playing phase
  return (
    playerMode === PlayerMode.HUMAN_VS_CPU &&
    currentPlayer === Player.O &&
    gamePhase === GamePhase.PLAYING
  );
};

/**
 * Determines if the game is in a state where player input should be blocked
 * @param gameState - Current game state
 * @param isCPUThinking - Whether CPU is currently "thinking"
 * @returns boolean indicating if player input should be blocked
 */
export const shouldBlockPlayerInput = (gameState: GameState, isCPUThinking: boolean): boolean => {
  const { gamePhase } = gameState;
  
  // Block input during CPU turns or when game is not in playing phase
  return (
    isCPUThinking ||
    gamePhase !== GamePhase.PLAYING ||
    isCPUTurn(gameState)
  );
};

/**
 * Determines if a cell is playable based on current game state
 * @param gameState - Current game state
 * @param cellIndex - Global index of the cell (0-80)
 * @returns boolean indicating if the cell is playable
 */
export const isCellPlayable = (gameState: GameState, cellIndex: number): boolean => {
  const { cells, constrainedGrid, firstMove, gamePhase } = gameState;
  
  // Cell must be empty
  if (cells[cellIndex] !== null) {
    return false;
  }
  
  // Game must be in playing phase
  if (gamePhase !== GamePhase.PLAYING) {
    return false;
  }
  
  // First move can be anywhere
  if (firstMove) {
    return true;
  }
  
  // If no constraint, any empty cell is playable
  if (constrainedGrid === null) {
    return true;
  }
  
  // Otherwise, cell must be in the constrained grid
  const gridIndex = Math.floor(cellIndex / 9);
  return gridIndex === constrainedGrid;
};

/**
 * Gets a message describing the current game state for the player
 * @param gameState - Current game state
 * @returns string with a descriptive message
 */
export const getGameStateMessage = (gameState: GameState): string => {
  const { gamePhase, currentPlayer, firstMove, constrainedGrid, gameWinner } = gameState;
  
  if (gamePhase === GamePhase.SETUP) {
    return "Select game options and click 'Start Game' to begin";
  }
  
  if (gamePhase === GamePhase.FINISHED) {
    return gameWinner ? `Player ${gameWinner} wins!` : "Game ended in a draw!";
  }
  
  if (firstMove) {
    return `Player ${currentPlayer}'s turn - You can play anywhere on the board`;
  }
  
  if (constrainedGrid === null) {
    return `Player ${currentPlayer}'s turn - You can play in any available grid`;
  }
  
  return `Player ${currentPlayer}'s turn - You must play in grid ${constrainedGrid + 1}`;
};

/**
 * Checks if the game should end in a draw
 * @param gameState - Current game state
 * @returns boolean indicating if the game is a draw
 */
export const isGameDraw = (gameState: GameState): boolean => {
  // Game is a draw if all cells are filled and there's no winner
  return (
    !gameState.gameWinner && 
    gameState.cells.every(cell => cell !== null)
  );
};

/**
 * Updates game phase based on current state
 * @param gameState - Current game state
 * @returns Updated game phase
 */
export const determineGamePhase = (gameState: GameState): GamePhase => {
  if (gameState.gameWinner || isGameDraw(gameState)) {
    return GamePhase.FINISHED;
  }
  
  return gameState.gamePhase;
};