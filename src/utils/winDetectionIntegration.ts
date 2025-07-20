// Win detection integration with game state
import { GameState, Player, GameMode, GamePhase } from '../types';
import { 
  checkSmallGridWinner, 
  checkGameWinner, 
  getSmallGridWinningCells,
  getMasterGridWinningGrids,
  getMasterGridWinningCells
} from './gameUtils';

/**
 * Updates the small grid winners array based on the current cells state
 * @param cells - Array of all 81 cell values
 * @param currentSmallGridWinners - Current array of small grid winners
 * @returns Updated array of small grid winners
 */
export function updateSmallGridWinners(
  cells: (Player | null)[],
  currentSmallGridWinners: (Player | null)[]
): (Player | null)[] {
  const newSmallGridWinners = [...currentSmallGridWinners];
  
  // Check each small grid for a winner
  for (let i = 0; i < 9; i++) {
    // Only check grids that don't already have a winner
    if (!newSmallGridWinners[i]) {
      const winner = checkSmallGridWinner(cells, i);
      if (winner) {
        newSmallGridWinners[i] = winner;
      }
    }
  }
  
  return newSmallGridWinners;
}

/**
 * Checks for wins and updates the game state accordingly
 * @param gameState - Current game state
 * @returns Object with updated winning state properties
 */
export function checkWinningState(gameState: GameState): {
  smallGridWinners: (Player | null)[];
  gameWinner: Player | null;
  winningCells: number[];
} {
  // First, update small grid winners
  const updatedSmallGridWinners = updateSmallGridWinners(gameState.cells, gameState.smallGridWinners);
  
  // Then check for game winner based on mode
  const { winner, winningCells } = checkGameWinner(
    gameState.cells,
    updatedSmallGridWinners,
    gameState.mode
  );
  
  return {
    smallGridWinners: updatedSmallGridWinners,
    gameWinner: winner,
    winningCells
  };
}

/**
 * Updates the game state after a move is made
 * @param gameState - Current game state
 * @param cellIndex - Index of the cell where the move was made
 * @returns Updated game state with win detection applied
 */
export function updateGameStateAfterMove(gameState: GameState, cellIndex: number): Partial<GameState> {
  // First, check which small grid the move was made in
  const gridIndex = Math.floor(cellIndex / 9);
  
  // Check for a win in that specific grid
  const gridWinner = checkSmallGridWinner(gameState.cells, gridIndex);
  
  // If there's a new winner in this grid, update the small grid winners
  const updatedSmallGridWinners = [...gameState.smallGridWinners];
  if (gridWinner && !updatedSmallGridWinners[gridIndex]) {
    updatedSmallGridWinners[gridIndex] = gridWinner;
  }
  
  // Check for game winner based on mode
  const { winner, winningCells } = checkGameWinner(
    gameState.cells,
    updatedSmallGridWinners,
    gameState.mode
  );
  
  return {
    smallGridWinners: updatedSmallGridWinners,
    gameWinner: winner,
    winningCells,
    gamePhase: winner ? GamePhase.FINISHED : gameState.gamePhase
  };
}